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
    
    classDef peer fill:#e1bee7,stroke:#4a148c,stroke-width:2px,color:#000
    classDef peerDark fill:#4a148c,stroke:#e1bee7,stroke-width:2px,color:#fff
    class PeerA,PeerB peer
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
    
    classDef peer fill:#e1bee7,stroke:#4a148c,stroke-width:2px,color:#000
    classDef relay fill:#90caf9,stroke:#0d47a1,stroke-width:2px,color:#000
    classDef wrapper fill:#a5d6a7,stroke:#1b5e20,stroke-width:2px,color:#000
    classDef peerDark fill:#4a148c,stroke:#e1bee7,stroke-width:2px,color:#fff
    classDef relayDark fill:#0d47a1,stroke:#90caf9,stroke-width:2px,color:#fff
    classDef wrapperDark fill:#1b5e20,stroke:#a5d6a7,stroke-width:2px,color:#fff
    class PeerA,PeerB peer
    class Relay relay
    class Wrapper wrapper
</div>
{{< /rawhtml >}}

{{< rawhtml >}}
<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

// Function to initialize or reinitialize Mermaid with the correct theme
function initMermaid() {
    // Get current theme from PaperMod
    const isDark = document.documentElement.classList.contains('dark') || 
                   localStorage.getItem('pref-theme') === 'dark' ||
                   (localStorage.getItem('pref-theme') === 'auto' && 
                    window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Configure Mermaid based on theme
    mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        themeVariables: isDark ? {
            primaryColor: '#1e1e2e',
            primaryTextColor: '#cdd6f4',
            primaryBorderColor: '#89b4fa',
            lineColor: '#89b4fa',
            secondaryColor: '#313244',
            tertiaryColor: '#45475a',
            background: '#1e1e2e',
            mainBkg: '#313244',
            secondBkg: '#45475a',
            tertiaryBkg: '#585b70',
            textColor: '#cdd6f4',
            nodeTextColor: '#cdd6f4',
            edgeLabelBackground: '#313244',
            clusterBkg: '#313244',
            clusterBorder: '#89b4fa',
            defaultLinkColor: '#89b4fa',
            titleColor: '#cdd6f4',
            stateBkg: '#313244',
            stateBorder: '#89b4fa',
            noteTextColor: '#cdd6f4',
            noteBkgColor: '#313244',
            notesBorderColor: '#89b4fa',
            actorBorder: '#89b4fa',
            actorBkg: '#313244',
            actorTextColor: '#cdd6f4',
            actorLineColor: '#89b4fa',
            labelBoxBkgColor: '#313244',
            labelBoxBorderColor: '#89b4fa',
            labelTextColor: '#cdd6f4',
            loopTextColor: '#cdd6f4',
            activationBorderColor: '#89b4fa',
            activationBkgColor: '#313244',
            sequenceNumberColor: '#1e1e2e'
        } : {
            primaryColor: '#fff',
            primaryTextColor: '#333',
            primaryBorderColor: '#333',
            lineColor: '#333',
            secondaryColor: '#f4f4f4',
            background: '#fff',
            mainBkg: '#fff',
            textColor: '#333'
        },
        flowchart: {
            curve: 'basis',
            useMaxWidth: true,
            htmlLabels: true
        }
    });
    
    // Clear existing diagrams and re-render
    document.querySelectorAll('.mermaid').forEach(el => {
        // Remove the data-processed attribute to force re-rendering
        el.removeAttribute('data-processed');
        // Clear the element
        const backup = el.textContent;
        el.innerHTML = backup;
    });
    
    // Re-run mermaid on all elements
    mermaid.run();
}

// Initialize on page load
initMermaid();

// Watch for theme changes using MutationObserver
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')) {
            initMermaid();
        }
    });
});

// Start observing theme changes
observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme']
});

// Also listen for storage events (theme preference changes)
window.addEventListener('storage', (e) => {
    if (e.key === 'pref-theme') {
        initMermaid();
    }
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (localStorage.getItem('pref-theme') === 'auto') {
        initMermaid();
    }
});
</script>
{{< /rawhtml >}}