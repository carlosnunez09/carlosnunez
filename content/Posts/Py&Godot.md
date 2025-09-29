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

/* Container for diagrams */
.mermaid-container {
    cursor: pointer;
    overflow-x: auto;
    overflow-y: visible;
    padding: 30px 60px;
    margin: 30px -20px;
    width: calc(100% + 40px);
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

/* Specific cluster width fixes - target the actual rendered elements */
.mermaid .clusters rect,
.mermaid g.cluster rect,
.mermaid g[class*="cluster"] rect,
.mermaid rect.cluster {
    min-width: 280px !important;
    stroke-width: 1px !important;
}

/* Force subgraph containers to be wider */
.mermaid g[id*="subGraph"],
.mermaid g[class*="subgraph"],
.mermaid .subgraph {
    min-width: 300px !important;
    display: block !important;
}

/* Give subgraphs more breathing room */
.mermaid g.cluster {
    margin: 15px !important;
    padding: 20px !important;
}

.mermaid .subgraph {
    padding: 25px !important;
    min-width: 280px !important;
}

/* Ensure node labels don't get cut off */
.mermaid .node {
    margin: 10px !important;
}

.mermaid .nodeLabel {
    padding: 10px 15px !important;
    white-space: nowrap !important;
}

/* Edge path padding */
.mermaid .edgePaths {
    margin: 0 20px !important;
}

/* Fix for flowchart subgraphs specifically */
.mermaid .flowchart-subgraph {
    min-width: 300px !important;
    padding: 20px !important;
}

.mermaid .flowchart-subgraph rect {
    rx: 3 !important;
    ry: 3 !important;
}

/* Ensure text inside clusters is not cut off */
.mermaid .cluster-label {
    padding: 8px 20px !important;
    white-space: nowrap !important;
}

/* Subgraph labels */
.mermaid .cluster-label span,
.mermaid g[id*="label"] text,
.mermaid .nodeLabel {
    padding-left: 15px !important;
    padding-right: 15px !important;
}

/* Subgraph specific fixes */
.mermaid g[id^="subGraph"],
.mermaid g[id*="PeerA"],
.mermaid g[id*="PeerB"],
.mermaid g[id*="Relay"],
.mermaid g[id*="Wrapper"] {
    min-width: 300px !important;
}

.mermaid g[id^="subGraph"] rect,
.mermaid g[id*="PeerA"] rect,
.mermaid g[id*="PeerB"] rect,
.mermaid g[id*="Relay"] rect,
.mermaid g[id*="Wrapper"] rect {
    min-width: 280px !important;
    x: -30 !important;
}

.mermaid g[id*="flowchart-subGraph"] rect,
.mermaid g[id*="flowchart-PeerA"] rect,
.mermaid g[id*="flowchart-PeerB"] rect,
.mermaid g[id*="flowchart-Relay"] rect,
.mermaid g[id*="flowchart-Wrapper"] rect {
    min-width: 320px !important;
}

/* Fix cluster boundaries */
.mermaid .clusters path,
.mermaid g.cluster path {
    stroke-width: 1px !important;
}

/* Ensure clusters don't cut off content */
.mermaid g[id*="subGraph"],
.mermaid g[transform] .cluster {
    transform: translateX(0) !important;
}

/* Prevent overflow cutting */
.mermaid {
    overflow: visible !important;
    width: 100%;
    padding: 0 50px !important;
    box-sizing: content-box !important;
}

.mermaid svg {
    overflow: visible !important;
    padding: 0 !important;
    margin: 0 !important;
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
            curve: 'basis'
        }
    });
    
    // After mermaid renders, attach click handlers
    setTimeout(addDiagramClickHandlers, 400);
}

function removeAllIDs(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.hasAttribute && node.hasAttribute('id')) node.removeAttribute('id');
    node.querySelectorAll && node.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
}

function addDiagramClickHandlers() {
    const diagrams = document.querySelectorAll('.mermaid');
    const modal = document.getElementById('diagramModal');
    const modalContainer = document.getElementById('modalDiagramContainer');
    const closeBtn = modal.querySelector('.diagram-modal-close');
    
    function openModalWithNode(nodeToAppend) {
        modalContainer.innerHTML = '';
        modalContainer.appendChild(nodeToAppend);
        document.body.style.overflow = 'hidden'; // prevent background scroll
        modal.classList.add('active');
        closeBtn?.focus();
    }
    
    diagrams.forEach((diagram) => {
        diagram.style.cursor = 'zoom-in';
        diagram.title = 'Click to enlarge';
        
        diagram.addEventListener('click', (e) => {
            e.stopPropagation();
            
            modalContainer.innerHTML = '';
            
            // Prefer cloning the rendered SVG inside the mermaid container
            const svg = diagram.querySelector('svg');
            if (svg) {
                const svgClone = svg.cloneNode(true);
                // Remove width/height to make it responsive
                svgClone.removeAttribute('width');
                svgClone.removeAttribute('height');
                svgClone.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                // Remove id attributes to avoid collisions
                removeAllIDs(svgClone);
                // ensure style rules don't force transform
                svgClone.style.transform = 'none';
                openModalWithNode(svgClone);
                return;
            }
            
            // Fallback: clone entire mermaid element and ask mermaid to init inside modal
            const clone = diagram.cloneNode(true);
            // remove ids
            removeAllIDs(clone);
            modalContainer.appendChild(clone);
            
            // If mermaid is available, try to re-init rendering for the cloned container
            if (window.mermaid) {
                try {
                    // re-run mermaid init for the cloned element (no-op when already rendered)
                    mermaid.init(undefined, clone);
                } catch (err) {
                    // non-fatal — leave clone as-is
                    console.warn('mermaid re-init failed for modal clone', err);
                }
            }
            
            // Ensure responsive SVGs inside the clone are sized
            const innerSVG = modalContainer.querySelector('svg');
            if (innerSVG) {
                innerSVG.removeAttribute('width');
                innerSVG.removeAttribute('height');
                innerSVG.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                removeAllIDs(innerSVG);
                innerSVG.style.transform = 'none';
            }
            
            // Finally open modal
            document.body.style.overflow = 'hidden';
            modal.classList.add('active');
        });
    });
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // clear cloned content (free memory)
        modalContainer.innerHTML = '';
    }
    
    // Close handlers
    closeBtn?.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        closeModal(); 
    });
    
    modal?.addEventListener('click', (e) => {
        // only close when clicking the backdrop, not inside the diagram
        if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
    
    // Optional: on window resize we don't need to do anything because CSS uses max-width/max-height
}

initMermaid();

// If you have an existing theme toggle that reloads, keep that logic — re-initMermaid after theme change
document.getElementById('theme-toggle')?.addEventListener('click', () => {
    setTimeout(() => location.reload(), 10);
});
</script>
{{< /rawhtml >}}