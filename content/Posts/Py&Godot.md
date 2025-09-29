---
title: "Godot and UDP Python"
date: 2025-09-15
showToc: false
TocOpen: false
draft: false
hidemeta: false
comments: false
author: "Carlos Nunez"
searchHidden: false
disableShare: true
---

Hi, in this post I will be discussing Godot and how we can use our own UDP implementation to make online/multiplayer games.

## Implementations using ENet

Godot comes with its own implementation of connectivity using its built-in ENet. It has a lot of good features, like sync data, RPC, and others that I didn't use. Since it's its own system, this means we have to use a Godot executable to act as the server or peer-to-peer implementation. Sometimes using these implementations can be a bit annoying and underwhelming.

## Peer-to-Peer (ENet) — Godot

{{< rawhtml >}}
<div class="mermaid">
flowchart LR
    subgraph PeerA["Peer A (Godot)"]
        A1["ENetMultiplayerPeer"]
        A2["Game Logic"]
    end
    subgraph PeerB["Peer B (Godot)"]
        B1["ENetMultiplayerPeer"]
        B2["Game Logic"]
    end
    A1 -- ENet: connect to B IP:port --> B1
    B1 -- ENet: connect to A IP:port --> A1
    A2 -- send input/state --> A1
    B2 -- send input/state --> B1
    A1 -- receive remote state --> A2
    B1 -- receive remote state --> B2

    classDef peer fill:#f9f,stroke:#333,stroke-width:1px
    style PeerA stroke:none
    style PeerB stroke:none
</div>
{{< /rawhtml >}}

There are a lot of functions that we can do with this implementation, like very basic games and player games where data is given and received between each other.

This implementation has many weaknesses:

- Sometimes restricted by local networks.
  - Functionality outside of the local network becomes more difficult. For example, we don't want the player to expose their game host across the internet to another peer. It's possible, but not ideal.
- All of the data will come from Peer A (the host), while the rest of the peers simply join that host.
- For simpler games, this implementation can be a good idea, but in more complex cases there's a different approach:
  - A wrapper service acts as the middleman, assigning peers and providing a connection between them (similar to how matchmaking or relay services work). It's the same but it has extra steps to allow online connectivity

{{< rawhtml >}}
<div class="mermaid">
flowchart LR
    subgraph PeerA["Peer A (Godot)"]
        A1["ENetMultiplayerPeer"]
        A2["Game Logic"]
    end
    subgraph PeerB["Peer B (Godot)"]
        B1["ENetMultiplayerPeer"]
        B2["Game Logic"]
    end
    subgraph Relay["Relay Server (acts like VPN)"]
        R1["Forward traffic between peers"]
    end
    subgraph Wrapper["Matchmaking / API Wrapper (e.g., Steam API, lobby system)"]
        W1["Friend Finder / Session Manager"]
    end
    A1 -- Connect via relay --> R1
    B1 -- Connect via relay --> R1
    R1 -- Forward packets --> A1
    R1 -- Forward packets --> B1
    A2 -- send input/state --> A1
    B2 -- send input/state --> B1
    A1 -- receive remote state --> A2
    B1 -- receive remote state --> B2
    W1 -- Provides peer addresses / relay info --> A1
    W1 -- Provides peer addresses / relay info --> B1

    classDef peer fill:#f9f,stroke:#333,stroke-width:1px
    classDef relay fill:#bbf,stroke:#333,stroke-width:1px
    classDef wrapper fill:#cfc,stroke:#333,stroke-width:1px
</div>
{{< /rawhtml >}}

{{< rawhtml >}}
<style>
/* Light mode (default) */
.mermaid .node rect,
.mermaid .node circle,
.mermaid .node ellipse,
.mermaid .node polygon,
.mermaid .node path {
    stroke: #333 !important;
}

.mermaid .edgePath .path,
.mermaid .flowchart-link {
    stroke: #333 !important;
}

.mermaid .edgeLabel {
    color: #333 !important;
}

.mermaid .label {
    color: #333 !important;
}

/* Dark mode */
.dark .mermaid .node rect,
.dark .mermaid .node circle,
.dark .mermaid .node ellipse,
.dark .mermaid .node polygon,
.dark .mermaid .node path {
    stroke: #fff !important;
    fill: transparent !important;
}

.dark .mermaid .edgePath .path,
.dark .mermaid .flowchart-link {
    stroke: #fff !important;
}

/* Edge labels - text on lines needs background */
.dark .mermaid .edgeLabel {
    color: #fff !important;
    background-color: #444 !important;
    padding: 2px 4px !important;
    border-radius: 3px !important;
}

.dark .mermaid .edgeLabel span {
    color: #fff !important;
}

.dark .mermaid .edgeLabel rect {
    fill: #444 !important;
}

/* All text should be white */
.dark .mermaid .label {
    color: #fff !important;
    fill: #fff !important;
}

.dark .mermaid text {
    fill: #fff !important;
}

.dark .mermaid .nodeLabel {
    color: #fff !important;
}

.dark .mermaid .cluster rect {
    stroke: #fff !important;
    fill: transparent !important;
}

.dark .mermaid .cluster text {
    fill: #fff !important;
}

.dark .mermaid .cluster-label {
    background-color: transparent !important;
}

.dark .mermaid g.classGroup rect {
    fill: transparent !important;
}

.dark .mermaid .node .label {
    background-color: transparent !important;
}

/* Make diagrams clickable */
.mermaid {
    cursor: pointer;
    transition: opacity 0.2s;
}

.mermaid:hover {
    opacity: 0.9;
}

/* Modal styles */
.diagram-modal {
    display: none;
    position: fixed;
    z-index: 9999;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    cursor: zoom-out;
}

.diagram-modal.active {
    display: flex;
    align-items: center;
    justify-content: center;
}

.diagram-modal-content {
    max-width: 95vw;
    max-height: 95vh;
    overflow: auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    position: relative;
}

.dark .diagram-modal-content {
    background: #1a1a1a;
}

.diagram-modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    font-size: 35px;
    font-weight: bold;
    color: #999;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
    z-index: 10000;
}

.diagram-modal-close:hover {
    background: rgba(0, 0, 0, 0.1);
}

.dark .diagram-modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
}

/* Responsive enlargement in modal: fit diagram to viewport */
.diagram-modal-content {
    width: 95vw;
    height: 95vh;
}

.diagram-modal .mermaid {
    margin: 0;
    max-width: none;
}

.diagram-modal .mermaid svg {
    display: block;
    width: 100%;
    height: auto;
}

#modalDiagramContainer {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 100%;
    min-height: 100%;
}
</style>

<!-- Modal HTML -->
<div id="diagramModal" class="diagram-modal">
    <div class="diagram-modal-content">
        <button class="diagram-modal-close">&times;</button>
        <div id="modalDiagramContainer"></div>
    </div>
</div>

<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

function initMermaid() {
    const isDark = document.documentElement.classList.contains('dark');
    
    mermaid.initialize({
        startOnLoad: true,
        theme: isDark ? 'dark' : 'default',
        flowchart: {
            curve: 'basis'
        }
    });
    
    // After mermaid initializes, add click handlers
    setTimeout(() => {
        addDiagramClickHandlers();
    }, 500);
}

function addDiagramClickHandlers() {
    const diagrams = document.querySelectorAll('.mermaid');
    const modal = document.getElementById('diagramModal');
    const modalContainer = document.getElementById('modalDiagramContainer');
    const closeBtn = modal.querySelector('.diagram-modal-close');
    
    diagrams.forEach((diagram, index) => {
        diagram.style.cursor = 'pointer';
        diagram.title = 'Click to enlarge';
        
        diagram.addEventListener('click', function(e) {
            e.stopPropagation();
            // Clone the diagram
            const clonedDiagram = diagram.cloneNode(true);
            modalContainer.innerHTML = '';
            modalContainer.appendChild(clonedDiagram);
            modal.classList.add('active');
        });
    });
    
    // Close modal when clicking close button
    closeBtn?.addEventListener('click', function(e) {
        e.stopPropagation();
        modal.classList.remove('active');
    });
    
    // Close modal when clicking outside
    modal?.addEventListener('click', function(e) {
        if (e.target === modal || e.target === modal.querySelector('.diagram-modal-content')) {
            modal.classList.remove('active');
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

// Initialize on load
initMermaid();

// Watch for theme toggle button clicks
document.getElementById('theme-toggle')?.addEventListener('click', () => {
    setTimeout(() => {
        location.reload();
    }, 10);
});
</script>
{{< /rawhtml >}}
