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
    stroke: #f90000ff !important;
}

.dark .mermaid .edgePath .path,
.dark .mermaid .flowchart-link {
    stroke: #f4d10aff !important;
}

.dark .mermaid .edgeLabel {
    color: #36fa05ff !important;
}

.dark .mermaid .label {
    color: #0bf18dff !important;
}

.dark .mermaid .cluster rect {
    stroke: #0072fcff !important;
}

.dark .mermaid .cluster text {
    fill: #f401a7ff !important;
}
</style>

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