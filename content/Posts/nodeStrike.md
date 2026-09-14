---
title: "NodeStrike: Custom C++ UDP Server vs. Godot ENet"
date: 2026-09-14
showToc: true
TocOpen: true
draft: false
hidemeta: false
comments: false
author: "Carlos Nunez"
searchHidden: false
disableShare: true
mermaid: true
---

Hi! In this post, I want to walk through my senior research project for CSC 499 (Senior Research Methods) at Shippensburg University, mentored by Dr. Girard: **NodeStrike**, a controlled performance comparison between Godot's built-in ENet networking stack and a custom C++ UDP dedicated server.

If you read my previous post on [Godot and UDP with Python](file:///Users/carlos/carlosnunez/content/Posts/Py&Godot.md), you know I've been experimenting with low-level networking in Godot; i did end up abanding this. This project takes that exploration much further into a controlled, empirical benchmark.

---

## 1. The Core Problem: Engine Overhead vs. Convenience

When developing a multiplayer game in Godot, developers face two main architectural choices:

1. **Godot's Built-in ENet Stack (`ENetMultiplayerPeer`):**
   Godot comes with high-level multiplayer abstractions built on ENet. You get Remote Procedure Calls (RPCs), scene replication, connection management, and automatic packet reliability out of the box. However, running a dedicated server requires exporting a headless version of your Godot project. While graphics and audio are stripped out, the server is still running an instance of the Godot engine process—meaning the scene tree, physics ticks, and engine subsystems are still executing in the background.

2. **Custom UDP Dedicated Server (C++):**
   Godot also provides low-level networking primitives like `PacketPeerUDP`. This allows developers to bypass ENet completely and communicate with an external dedicated server over raw UDP sockets. A custom C++ server carries zero engine overhead: it runs only the networking loop and authoritative game state. But the trade-off is clear—you have to write your own packet serialization, client registry, heartbeats, and connection eviction from scratch.

### The Question

Developers often assume a custom C++ server will drastically outperform Godot's headless ENet server, but there is virtually no published empirical data comparing them under identical workloads.

**Does a custom C++ UDP server actually yield meaningful performance gains over Godot ENet, and at what client scale does the gap become significant?**

That is what NodeStrike is designed to answer.

---

## 2. System Architecture

To ensure the benchmark is strictly controlled, both backends share the **exact same Godot client** running in a peer-to-server topology. The client can toggle between ENet and raw UDP transports without altering any gameplay code.

{{< rawhtml >}}
<div class="mermaid">
flowchart TD
    subgraph ClientLayer["Shared Godot Client (NodeStrike)"]
        CL_Logic["Game Logic & Bot Movement"]
        CL_UDP["PacketPeerUDP (Raw UDP)"]
        CL_ENet["ENetMultiplayerPeer (High-Level API)"]
        CL_Logic --> CL_UDP
        CL_Logic --> CL_ENet
    end

    subgraph BackendCPP["Custom C++ Backend"]
        CPP_Sock["POSIX UDP Socket (recvfrom / sendto)"]
        CPP_Reg["Client Registry (IP & Port Map)"]
        CPP_Loop["Single-Threaded Tick Loop (20 Hz)"]
        CPP_Sock --> CPP_Reg
        CPP_Reg --> CPP_Loop
    end

    subgraph BackendENet["Godot Headless ENet Backend"]
        ENet_Peer["ENetMultiplayerPeer"]
        ENet_API["MultiplayerAPI (RPC & Sync)"]
        ENet_Engine["Headless Godot Runtime (Physics/Scene)"]
        ENet_Peer --> ENet_API
        ENet_API --> ENet_Engine
    end

    CL_UDP <-->|Binary UDP Packets| CPP_Sock
    CL_ENet <-->|ENet Protocol / RPC| ENet_Peer

    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff
    classDef cpp fill:#10b981,stroke:#047857,color:#fff
    classDef enet fill:#8b5cf6,stroke:#6d28d9,color:#fff

    class CL_Logic,CL_UDP,CL_ENet client
    class CPP_Sock,CPP_Reg,CPP_Loop cpp
    class ENet_Peer,ENet_API,ENet_Engine enet
</div>
{{< /rawhtml >}}

### Architectural Components

| Component | Backend / Layer | Role |
| :--- | :--- | :--- |
| `ENetConnection` / `ENetMultiplayerPeer` | ENet Backend | Low-level host wrapper and Godot high-level multiplayer bridge. |
| `MultiplayerAPI` | ENet Backend | Handles RPCs and scene synchronization across connected peers. |
| `PacketPeerUDP` | Shared Client | Directly sends and receives binary UDP datagrams without engine abstraction. |
| `socket` / `bind` / `recvfrom` / `sendto` | C++ Backend | Direct POSIX socket operations for low-latency non-blocking I/O. |
| `Client Registry` | C++ Backend | In-memory map from client `IP:Port` to player state, sequence numbers, and heartbeat timestamps. |

---

## 3. The NodeStrike Workload

To isolate networking overhead from gameplay complexity, the test workload is a lightweight 2D objective-collection game named **NodeStrike**.

- **Grid Map:** Players and objectives occupy discrete grid positions.
- **Bot-Driven Movement:** Clients run automated bot logic that calculates the Manhattan distance to the nearest spawned objective node and steps toward it each tick.
- **Synchronized State:** The only state sent over the wire is player positions, goals, and timestamps. No large physics snapshots or bloated payloads.

Here is the core client tick from the Godot client:

```gdscript
func _game_tick() -> void:
    tick_count += 1
    _move_bot()
    _send_state()

func _move_bot() -> void:
    if local_x == goal_x and local_y == goal_y:
        _new_goal()
        return
    var dx := goal_x - local_x
    var dy := goal_y - local_y
    if abs(dx) >= abs(dy):
        local_x += (1 if dx > 0 else -1)
    else:
        local_y += (1 if dy > 0 else -1)

func _send_state() -> void:
    var pkt := PackedByteArray()
    pkt.resize(14)
    pkt[0] = PKT_STATE
    pkt[1] = local_id
    pkt.encode_u16(2, local_x)
    pkt.encode_u16(4, local_y)
    pkt.encode_u32(6, Time.get_ticks_msec())
    pkt.encode_u16(10, goal_x)
    pkt.encode_u16(12, goal_y)
    udp.put_packet(pkt)
```

By keeping the payload deterministic and lightweight (14 bytes per state packet), any variance in latency or throughput between backends is directly attributable to the networking layer itself.

---

## 4. Custom UDP Server & Binary Protocol

### Packet Protocol

The custom C++ server uses a fixed, little-endian binary layout:

```text
Upstream Packets:
  JOIN       : 0x01                                  (1 Byte)
  STATE      : 0x02 | id | x16 | y16 | ts32 | gx16 | gy16 (14 Bytes)
  HEARTBEAT  : 0x03 | id                             (2 Bytes)
  DISCONNECT : 0x04 | id                             (2 Bytes)

Downstream Packets:
  ACK        : 0x01 | id                             (2 Bytes)
  TICK       : 0x02 | count | [id | x16 | y16 | gx16 | gy16] x N  (2 + 9N Bytes)
  EVICT      : 0x05 | id                             (2 Bytes)
```

### Server Loop & Client Eviction

The C++ server runs a single-threaded event loop with `select()` and non-blocking `recvfrom()`. Single-threaded operation eliminates lock contention on the client registry and keeps timing deterministic:

```cpp
int sock = socket(AF_INET, SOCK_DGRAM, 0);
sockaddr_in srv{};
srv.sin_family = AF_INET;
inet_pton(AF_INET, bind_ip.c_str(), &srv.sin_addr);
srv.sin_port = htons(port);
::bind(sock, (sockaddr*)&srv, sizeof(srv));

while (running) {
    struct timeval tv{0, 5000}; // 5ms select timeout
    fd_set fds; 
    FD_ZERO(&fds); 
    FD_SET(sock, &fds);

    if (select(sock + 1, &fds, nullptr, nullptr, &tv) > 0) {
        int n = (int)recvfrom(sock, buf, sizeof(buf), 0, (sockaddr*)&cli, &cli_len);
        if (n > 0) {
            handle_incoming_packet(cli, buf, n);
        }
    }

    // Check 20 Hz tick timer for state broadcast
    broadcast_tick_if_due();

    // Evict clients that haven't sent heartbeats within 5 seconds
    sweep_stale_clients();
}
```

Eviction uses a 5-second silence threshold matching ENet's default timeout:

```cpp
auto now = std::chrono::steady_clock::now();
for (auto it = players.begin(); it != players.end(); ) {
    double age = std::chrono::duration<double>(now - it->second.last_seen).count();
    if (age > 5.0) {
        log_event("EVICT: " + it->first);
        it = players.erase(it);
    } else {
        ++it;
    }
}
```

---

## 5. The Experiment: How Performance Will Be Measured

### Independent and Dependent Variables






- **Independent Variables:**
  - Backend type: Custom C++ UDP Server vs. Godot ENet Headless Server.
  - Client scale: 1, 5, 10, 20, and 50 concurrent headless clients.
    - since thease numbers are not set values I could always run more healess clients in c++ then ENet when testing limits
- **Dependent Variables:**
  - Round-trip latency (median, 95th, and 99th percentile in milliseconds).
  - Packet handling throughput (packets per second).
  - Packet loss percentage.
  - Bandwidth consumption (MB/s).
  - Client capacity threshold prior to degradation.

### Testing Harness

>[!NOTE]
>I do need to write a new testing harness as im using Google cloud computing(GCP) to make manu client "container"

The benchmark will use Docker Compose to scale headless Godot client containers across consistent test windows:

{{< rawhtml >}}
<div class="mermaid">
flowchart LR
    subgraph Host["Benchmark Host Machine"]
        subgraph Harness["Docker Compose Harness"]
            C1["Client 1 Container"]
            C2["Client 2 Container"]
            CN["Client N Container..."]
        end
        
        Srv["Server Under Test (ENet or C++)"]
        WS["Wireshark / Packet Capture"]
        Vol["Shared Volume (metrics.csv)"]
        
        C1 <--> Srv
        C2 <--> Srv
        CN <--> Srv
        
        C1 -.-> Vol
        C2 -.-> Vol
        CN -.-> Vol
        WS -.-> Vol
    end

    classDef host fill:#f3f4f6,stroke:#9ca3af,color:#000
    classDef container fill:#38bdf8,stroke:#0284c7,color:#000
    classDef srv fill:#f87171,stroke:#dc2626,color:#fff
    classDef log fill:#facc15,stroke:#ca8a04,color:#000

    class C1,C2,CN container
    class Srv srv
    class WS,Vol log
</div>
{{< /rawhtml >}}

- **Test Budget:** 240 total testing minutes (5 client counts × 8 minutes per step × 3 repetitions × 2 backends).
- **Statistical Analysis:** Two-tailed Welch's t-test on median latencies and throughput distributions ($p < 0.05$).

---

## 6. Hypotheses

- **Null Hypothesis ($H_0$):** There will be no statistically significant difference in latency, packet throughput, or packet loss between Godot ENet and the custom C++ UDP server across all client counts (1 to 50).
- **Alternative Hypothesis ($H_1$):** Both backends will perform comparably at low client counts (1 to 5), but the C++ UDP server will demonstrate significantly lower latency and higher throughput as concurrency ramps (20 to 50), as the Godot ENet engine process begins encountering queue latency and scheduling overhead.

---

## 7. Timeline & What's Next
>[!NOTE]
>same thing i ned to refactor this and change pr4 to make sure my benchmark reflected

The implementation and testing schedule spans Summer through Fall 2026:

- **PR 1:** Godot ENet headless server operational with RPCs and state synchronization.
- **PR 2:** Custom C++ UDP server prototype with binary protocol, client registry, and tick broadcast.
- **PR 3:** NodeStrike demo game complete; shared client connecting seamlessly to both backends.
- **PR 4:** Benchmark suite execution via Docker Compose; data collection and Wireshark traces.
- **PR 5:** Statistical analysis, final paper, poster presentation, and open-source benchmark release.

Stay tuned for follow-up posts where I'll share the live benchmark results, graphs, and lessons learned from building the servers!

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

/* Scale up the diagram in modal (layout-based sizing instead of transform) */
/* Using SVG width so scrollbars and layout work correctly */
.diagram-modal .mermaid {
    margin: 0;
    max-width: none !important;
}

.diagram-modal .mermaid svg {
    width: 1600px; /* default enlarged width */
    height: auto;
    max-width: none; /* allow wider than container; container will scroll */
}

/* For very large screens, enlarge even more */
@media (min-width: 1920px) {
    .diagram-modal .mermaid svg {
        width: 2200px;
    }
}

/* For smaller screens, reduce enlarged size */
@media (max-width: 768px) {
    .diagram-modal .mermaid svg {
        width: 1200px;
    }
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
    
    // Close modal when clicking outside (overlay only)
    modal?.addEventListener('click', function(e) {
        if (e.target === modal) {
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

