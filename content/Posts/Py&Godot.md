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
<div class="mermaid-container" style="overflow-x: auto; padding: 20px 40px; margin: 20px 0;">
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
<div class="mermaid-container" style="overflow-x: auto; padding: 20px 40px; margin: 20px 0;">
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

/* Container for diagrams */
.mermaid-container {
    cursor: pointer;
    overflow-x: auto;
    overflow-y: visible;
    padding: 20px 40px;
    margin: 20px 0;
}

/* Make diagrams clickable */
.mermaid {
    cursor: pointer;
    transition: opacity 0.2s;
    min-width: 100%;
    overflow: visible !important;
}

.mermaid svg {
    overflow: visible !important;
    min-width: 100%;
}

/* Adjust SVG viewBox for better visibility */
.mermaid svg[viewBox] {
    margin: 0 20px !important;
}

.mermaid:hover,
.mermaid-container:hover .mermaid {
    opacity: 0.9;
}

/* Ensure clusters have enough width */
.mermaid .cluster {
    min-width: 200px !important;
    padding: 20px !important;
}

.mermaid .cluster rect {
    width: calc(100% + 40px) !important;
}

/* Give subgraphs more breathing room */
.mermaid g.cluster {
    margin: 15px !important;
}

.mermaid .subgraph {
    padding: 20px !important;
}

/* Ensure node labels don't get cut off */
.mermaid .node {
    margin: 10px !important;
}

.mermaid .nodeLabel {
    padding: 10px !important;
    white-space: nowrap !important;
}

/* Edge path padding */
.mermaid .edgePaths {
    margin: 0 20px !important;
}

/* Fix for flowchart subgraphs specifically */
.mermaid .flowchart-subgraph {
    min-width: 250px !important;
    padding: 15px !important;
}

.mermaid .flowchart-subgraph rect {
    rx: 3 !important;
    ry: 3 !important;
}

/* Ensure text inside clusters is not cut off */
.mermaid .cluster-label {
    padding: 5px 15px !important;
}

/* Subgraph specific fixes */
.mermaid g[id^="subGraph"] {
    min-width: 260px !important;
}

.mermaid g[id^="subGraph"] rect {
    min-width: 240px !important;
    x: -20 !important;
}

.mermaid g[id*="flowchart-subGraph"] rect,
.mermaid g[id*="flowchart-PeerA"] rect,
.mermaid g[id*="flowchart-PeerB"] rect,
.mermaid g[id*="flowchart-Relay"] rect,
.mermaid g[id*="flowchart-Wrapper"] rect {
    min-width: 280px !important;
}

/* Prevent overflow cutting */
.mermaid {
    overflow: visible !important;
    width: 100%;
}

.mermaid svg {
    overflow: visible !important;
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

/* Scale up the diagram in modal */
.diagram-modal .mermaid {
    transform: scale(2.5);
    transform-origin: center;
    margin: 100px auto;
    display: block;
}

/* For very large screens, scale even more */
@media (min-width: 1920px) {
    .diagram-modal .mermaid {
        transform: scale(3);
        margin: 120px auto;
    }
}

/* For smaller screens, adjust scale */
@media (max-width: 768px) {
    .diagram-modal .mermaid {
        transform: scale(1.8);
        margin: 60px auto;
    }
}

#modalDiagramContainer {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 100%;
    min-height: 100%;
    overflow: visible;
    padding: 20px;
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
            curve: 'basis',
            padding: 30,
            nodeSpacing: 150,
            rankSpacing: 150,
            useMaxWidth: false,
            htmlLabels: true,
            wrappingWidth: 200
        }
    });
    
    // After mermaid initializes, add click handlers and fix viewBox
    setTimeout(() => {
        // Fix viewBox to prevent cutoff
        document.querySelectorAll('.mermaid svg').forEach(svg => {
            const viewBox = svg.getAttribute('viewBox');
            if (viewBox) {
                const parts = viewBox.split(' ');
                // Expand viewBox by 50px on each side
                parts[0] = (parseFloat(parts[0]) - 50).toString();
                parts[1] = (parseFloat(parts[1]) - 25).toString();
                parts[2] = (parseFloat(parts[2]) + 100).toString();
                parts[3] = (parseFloat(parts[3]) + 50).toString();
                svg.setAttribute('viewBox', parts.join(' '));
            }
        });
        
        addDiagramClickHandlers();
    }, 500);
}

function addDiagramClickHandlers() {
    const diagrams = document.querySelectorAll('.mermaid');
    const containers = document.querySelectorAll('.mermaid-container');
    const modal = document.getElementById('diagramModal');
    const modalContainer = document.getElementById('modalDiagramContainer');
    const closeBtn = modal.querySelector('.diagram-modal-close');
    
    // Apply click handlers to containers if they exist, otherwise to diagrams directly
    const clickTargets = containers.length > 0 ? containers : diagrams;
    
    clickTargets.forEach((target, index) => {
        target.style.cursor = 'pointer';
        target.title = 'Click to enlarge';
        
        target.addEventListener('click', function(e) {
            e.stopPropagation();
            // Get the actual diagram element
            const diagram = target.classList.contains('mermaid') ? target : target.querySelector('.mermaid');
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
