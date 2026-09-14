---
title: Custom UDP Server vs. Godot ENet
subtitle: A Proposal for a Multiplayer Networking Implementation Comparison
author: Carlos Nunez
mentor: Dr. Girard
course: CSC 499 - Senior Research Methods
institution: Shippensburg University
term: Spring 2026
status: draft
---

# Custom UDP Server vs. Godot ENet

## A Proposal for a Multiplayer Networking Implementation Comparison

Carlos Nunez  
Mentor: Dr. Girard  
CSC 499 - Senior Research Methods  
Shippensburg University  
Spring 2026

## Abstract

This paper proposes a controlled comparison of two backend networking implementations for a Godot multiplayer game: the engine's built-in ENet dedicated server and a custom C++ UDP dedicated server. Both backends will share a single Godot client running in a peer-to-server topology. Performance will be measured along three axes: end-to-end round-trip latency, packet handling throughput in packets per second, and maximum concurrent client capacity before measurable degradation. Each backend will be tested at five client counts (1, 5, 10, 20, and 50), with three repetitions per count, for a total testing budget of 240 minutes split evenly between the two servers. A small objective-collection game called NodeStrike will serve as a consistent workload across both backends. The null hypothesis states that no significant performance difference will be observed at any client count. The alternative hypothesis predicts comparable performance at low counts and a widening gap in favor of the C++ UDP server at higher counts. The contribution of this work is a controlled, reproducible performance comparison between Godot's ENet stack and a hand-rolled C++ UDP backend in a Godot context, an evaluation that does not currently appear in the published literature.

## Project Interpretation

In project terms, this proposal maps directly onto the code already present in the repository. The current `udp-test/server/main.cpp` file is an early custom UDP server prototype, `udp-test/godot-client/main.gd` is the matching Godot client prototype, and `udp-test/Makefile` is the current lightweight harness for building and running local tests. The full paper proposes extending this prototype into a controlled benchmark with two backends instead of one: the existing custom UDP path and a future Godot ENet headless server path.

The key idea is simple: keep the gameplay workload fixed, swap only the networking backend, and measure what changes. If the client logic, map, tick rate, and objective behavior stay the same, then changes in latency, throughput, or client limit can be attributed much more confidently to the server implementation rather than to unrelated gameplay differences.

## 1. Introduction and Problem Description

The Godot game engine ships with a built-in multiplayer API built on ENet, a UDP-based reliability library. Godot also exposes lower-level primitives such as PacketPeerUDP, which allow a developer to bypass ENet entirely and connect to a custom server over raw UDP sockets. Each path carries trade-offs. ENet supplies remote procedure calls, scene synchronization, automatic packet reliability, and connection management, but the dedicated server runs as an instance of the Godot engine itself, carrying overhead that may not be necessary for pure networking work. A custom UDP server written in C++ avoids that overhead and exposes every implementation choice to the developer, but requires manual implementation of features that ENet supplies for free.

The problem this paper addresses is the absence of a clean, controlled comparison between these two backends in the context of a Godot client. Developers selecting a backend for a multiplayer Godot project must currently rely on assumptions, scattered forum posts, and benchmarks from unrelated engines or unrelated languages. No published study isolates the question of how Godot's ENet dedicated server performs against a C++ UDP server when both communicate with the same Godot client under identical workloads.

This paper proposes a project that will produce such a comparison. The proposed work consists of three artifacts: a custom C++ UDP server built from scratch, a Godot ENet headless dedicated server configured per the official documentation, and a shared Godot client capable of speaking to either backend. A small demo game named NodeStrike will provide a consistent network workload, and a benchmarking harness based on Docker Compose will scale clients in controlled increments. Latency, packet handling throughput, and client capacity will be recorded at each client count and compared between backends.

## 2. Literature Review

Multiplayer game networking is rarely visible to the player, but plays a critical role in multiplayer communication. Multiplayer development is one of the more demanding areas of game development, requiring careful consideration of latency, scalability, and reliability. Two main options are available to developers building a multiplayer game with the Godot engine: the engine's built-in ENet-based high-level networking system, or a custom UDP server backend implemented outside the engine. This paper reviews the literature on both strategies, with the primary objective of comparing the performance of a custom C++ UDP server backend against Godot's integrated ENet dedicated headless server implementation. A Godot client in peer-to-server topology is used for both comparisons, with measurements taken on latency, packet handling, bandwidth, and client limits.

### 2.1 Godot's ENet Stack

The Godot engine has a built-in high-level multiplayer API; it is built on top of ENet, a UDP-based networking library. Aukstakalnis describes the resulting ENet-based peer-to-server architecture as one in which "the game players interact with the client, while the server is a stripped-down version that updates the game to the clients" (Aukstakalnis 4). This is essentially a headless server, exported as a version of the Godot project that runs without audio or a graphical interface, leaving a process that runs game logic and relays state updates to clients. While this approach is simple and supports rapid early development, it later introduces architectural constraints, most notably that the server runs as an instance of the engine itself, carrying overhead that may not be needed for pure networking tasks.

Aukstakalnis further notes that ENet provides convenient high-level abstractions such as remote procedure calls (RPCs), automatic packet reliability, and event-controlled callbacks such as on-connect and on-disconnect handlers. Based on the Godot Engine documentation on dedicated server exports, this headless mode is officially supported, but the developer is required to manage the game logic carefully to avoid client-only code from running on the server. To handle this, Godot supports flags and arguments such as `--server`, which are used to tell the code to run in server mode (Godot Foundation, "Exporting for Dedicated Servers"). The Godot Engine documentation also describes a different route for servers using lower-level networking with raw UDP, TCP, or HTTP, for developers who want to implement their own (Godot Foundation, "UDPServer").

A thesis from the DIVA portal examining server-client networking in Godot summarizes the tradeoff well: "Godot offers a high-level multiplayer API to facilitate the creation of multiplayer games in addition to supporting low-level networking via common protocols like UDP, TCP, HTTP, and SSL. Low-level networking is flexible and necessary for custom server implementations, but it usually takes much more time and knowledge to set up" (Aukstakalnis 6). This source establishes the fundamental concept that the proposed project seeks to quantify: the convenience of ENet versus the potential performance gains of a custom low-overhead UDP server written in the mid-level systems language C++.

### 2.2 Transport Protocol: TCP vs. UDP

The selection between the User Datagram Protocol (UDP) and the Transmission Control Protocol (TCP) is fundamental to any discussion of multiplayer networking performance. Al-Dhief et al. provide a comparison and conclude that UDP exhibits significantly lower latency than TCP due to its connectionless, no-order delivery model (Al-Dhief et al. 173). TCP carries built-in mechanics for packet retransmission, ordering, and congestion control, which retain data integrity and may be valuable for other applications, but introduce significant delay in real-time responsiveness applications.

In the context of multiplayer games, the reliability that TCP provides is largely unnecessary. Most updates to game state, such as player positions, input events, and world state, are superseded by the next update. A retransmitted packet from a previous frame has no value if it arrives late. UDP is therefore the better choice for the real-time gameplay loop, with sequence numbering layered on top by the application where order matters. Jones reinforces this rationale by stating that UDP's low overhead makes it an ideal choice for fast, real-time applications where latency matters more than guaranteed delivery (Jones).

### 2.3 Implementation Language for a Custom Server

There are many programming languages available when implementing a custom UDP server outside of the Godot Engine. Retunsky's benchmarking study of low-level I/O performance across C, C++, Rust, Go, Java, and Python finds that the results can be grouped into two clusters: C, C++, and Rust as high-performance languages, and Rust, Go, Java, and Python as memory-safe languages (Retunsky). This classification emphasizes a fundamental trade-off between raw execution speed and the safety assurances offered by higher-level languages.

Arboleda, Arias, and Riveros add to this analysis by showing that C++ is materially more efficient than Python for parallel, I/O-bound workloads. This finding supports C++ as a strong choice for a high-performance game server expected to handle multiple clients simultaneously (Arboleda et al. 8). Zehra et al. reach a similar conclusion in a memory and time comparison between C++ and Python (Zehra et al.). There are also many available resources for learning how to set up a C++ UDP server. For example, GeeksforGeeks publishes a tutorial on UDP server-client implementation in C++ that demonstrates the basic socket workflow and indicates that setting up a server with C++ socket libraries is not as difficult as it might first appear, providing a useful comparison point against ENet implementations (GeeksforGeeks).

### 2.4 Network Topology

How the network is designed plays an important role in how it functions; network topology in a multiplayer game can impact performance characteristics and scalability. Celik and Secinti examine peer-to-peer implementations and client-server topologies in the context of a multiplayer game. Their findings indicate that peer-to-peer implementations carry significant issues with synchronization, cheating, and latency, and that they constrain achievable client limits (Celik and Secinti 48). In a dedicated server topology, or client-server arrangement, all clients communicate independently with the server, which determines the game state. This arrangement is preferred for more competitive multiplayer experiences.

Ahde's thesis on real-time multiplayer server implementation provides a practical examination of dedicated server design, on one hand a server that handles the logic and processing, and on the other a server that handles the bandwidth and traffic management (Ahde 22). The proposed project adopts the dedicated-server topology in its simpler single-instance form, with one server process serving all connected clients.

### 2.5 Packet Loss, Buffer Bloat, and Heartbeat

Latency in a UDP server is not a single number but a distribution that depends on how the server's receive queue is managed under load. When packets arrive faster than the application can drain the socket buffer, queueing delay grows and eventually new packets are dropped at the kernel level rather than enqueued. Industry analyses describe this progression in three regimes: idle, filling, and bloated, with median latency rising sharply as buffer occupancy approaches saturation (Raysync). Buffer bloat in particular has been identified as a primary contributor to latency-throughput trade-offs in real-time systems (Substack). Any meaningful latency benchmark must therefore characterize behavior across a range of offered loads, not at a single point. A related concern is detecting silent client disconnections; UDP's connectionless nature means the server cannot distinguish between a client that has stopped sending and one whose network has dropped. The standard mitigation is a heartbeat: each client sends a small periodic packet, and the server evicts any client from which no heartbeat has been received within a configurable timeout.

### 2.6 Compression

Compression also plays a role: reducing the size of transmitted packets can offload network traffic at the cost of additional CPU work, providing a useful performance lever. The Godot community forum on custom data compression demonstrates that delta encoding and similar techniques can substantially reduce bandwidth use (Godot Foundation, "Custom Data Compression"). For the purposes of this comparison, any compression strategy must be applied identically to both the ENet and custom UDP implementations, and must be accounted for when benchmarking.

### 2.7 Summary

The literature reviewed in this paper establishes a foundation for the proposed project: a comparison of a custom C++ UDP server backend against Godot's built-in ENet dedicated server implementation. The existing body of work confirms that UDP is the appropriate transport protocol for real-time multiplayer games, that C++ offers a measurable performance advantage over higher-level languages for server-side I/O tasks, and that Godot's ENet system, while functional and convenient, carries architectural constraints inherent to its design as a stripped-down game engine instance. These sources provide the theoretical grounding necessary to design, implement, and benchmark both server variants against consistent metrics of latency, packet handling, and client capacity.

## 3. Primary Objective

The primary objective of this project is to compare the performance of a custom C++ UDP dedicated server against Godot's built-in ENet dedicated server for a Godot multiplayer game, measuring end-to-end latency, packet handling throughput, and maximum concurrent client capacity. The two backends will be evaluated using a single shared Godot client running in peer-to-server topology, executing identical NodeStrike workloads, on the same host machine, with all measurements collected by the same instrumentation.

Three quantitative targets define the operating envelope of the benchmark. Median round-trip latency on a local network is targeted at less than twenty milliseconds. Packet handling throughput is targeted at more than ten thousand packets per second sustained per server instance. Concurrent client capacity is targeted at sixteen or more clients without measurable degradation in either latency or throughput. These targets are reference points, not pass/fail thresholds; the experiment is designed to characterize behavior across a range of loads rather than to certify a single operating condition.

The total time budget for the benchmark is 240 minutes, split evenly into 120 minutes of testing per backend. This budget is derived from five client-count steps multiplied by eight minutes per step multiplied by three repetitions per step, yielding 120 minutes per backend, multiplied by the two backends under test.

## 4. Solution Description

### 4.1 System Architecture

The benchmark consists of three software components and one instrumentation layer. The first component is the shared Godot client, which implements both an ENet transport path using the built-in ENetMultiplayerPeer class and a raw UDP transport path using the PacketPeerUDP class. The client emits NodeStrike player input upstream and applies authoritative game state received downstream. The second component is the Godot ENet headless dedicated server, exported with the engine's official dedicated-server preset, running NodeStrike server logic and managing connections through ENet. The third component is the custom C++ UDP dedicated server, which binds a UDP socket on a configurable port, maintains a client registry indexed by IP and port, and broadcasts authoritative state to all registered clients on a fixed tick interval.

> [INSERT - Figure 4.1 - System architecture diagram. Use the side-by-side architecture from proposal slide 23 ("Why is a UDP-dedicated server better?") showing the C++ UDP server (socket -> bind -> recvfrom loop, client registry, sendto broadcast) on one side and the equivalent ENet headless server on the other, with two Godot clients connecting to each.]

The instrumentation layer exists independently of the two backends under test. It is comprised of a network capture utility to monitor traffic on the host interface, a per-client benchmarking logger that records packet counts and high-resolution timestamps to a CSV file, and a tool that composes harnesses that scale the population of headless client containers in controlled increments.

At the current stage of the project, the repository already implements the UDP side of this design. The codebase does not yet contain the ENet benchmark path described in the proposal, so the snippets below should be read as prototype evidence for the custom UDP branch rather than as the final dual-backend benchmark.

### 4.2 Class and Component Inventory

The following table summarizes the principal classes and components used on each side of the architecture:

| Component | Side | Purpose |
| --- | --- | --- |
| ENetConnection | ENet backend | Low-level ENet host wrapper exposing statistics, bandwidth controls, and the service loop. |
| ENetMultiplayerPeer | ENet backend | High-level peer that bridges ENetConnection and the Godot multiplayer API. |
| MultiplayerAPI | ENet backend | Handles remote procedure calls and scene synchronization across peers. |
| PacketPeerUDP | Shared client | Sends and receives raw UDP packets between the Godot client and the C++ server, with no ENet layer. |
| socket / bind / recvfrom / sendto | C++ backend | POSIX socket calls used to create the UDP listener, accept packets, and broadcast state. |
| Client registry | C++ backend | In-memory map from client IP and port to PlayerState, used to track connected clients and their last heartbeat. |

> [INSERT - Figure 4.2 - UML class diagram of the client-side networking layer. Show PacketPeerUDP, ENetMultiplayerPeer, ENetConnection, and MultiplayerAPI as boxes with their public methods, and use arrows to show the composition relationships (ENetMultiplayerPeer holds an ENetConnection; MultiplayerAPI uses ENetMultiplayerPeer).]

### 4.3 Headless Mode and Engine Overhead

Both servers run headless on the host machine. In a normal Godot client, the engine runs five major subsystems: rendering, audio, physics, game logic, and networking. In the headless Dedicated-server export, rendering and audio are disabled, but physics, game logic, and networking continue to execute inside the engine process. The custom C++ UDP server runs only the networking layer and the minimum game logic required to maintain authoritative state. This difference in engine overhead is precisely what the benchmark is designed to characterize.

> [INSERT - Figure 4.3 - Engine vs. Headless comparison diagram. Use the two-column layout from proposal slide 17 showing Rendering off, Audio off, Physics still runs, Game logic still runs, Networking (ENetMultiplayerPeer) still runs.]

### 4.4 What Is Being Built From Scratch

The following components will be implemented from scratch as part of this project:

- A C++ UDP server with a single-threaded receive loop, client registry, fixed-tick state broadcast, heartbeat-based eviction, and a binary packet format for player input and authoritative state.
- A Docker Compose benchmarking harness that scales headless Godot client containers in controlled increments and aggregates per-client metrics from a shared volume.
- A shared Godot client capable of switching between the ENet transport path and the raw UDP transport path with no changes to NodeStrike game logic.
- The NodeStrike demo game itself, including a grid map, an objective spawner, bot logic for client-side movement toward the nearest objective, and minimal client-side rendering for verification.

The following components will be used as-is and will not be reimplemented:

- Godot's ENet headless dedicated server, configured per the engine's official dedicated-server export documentation.
- Standard POSIX socket primitives provided by the host operating system.
- Built-in Godot client functionality, including input handling, the scene tree, and the rendering subsystem.

### 4.5 Packet Format

The custom C++ UDP server uses a small binary packet format designed for low parsing overhead. Each packet begins with a one-byte message-type identifier followed by a fixed or variable-length payload depending on type. Five message types are defined: CONNECT, sent by a client requesting to join; INPUT, sent by a connected client carrying its current movement vector and a sequence number; STATE, broadcast by the server containing the position of every player and the position of the current objective; HEARTBEAT, sent by clients on a one-second interval to maintain connection liveness; and DISCONNECT, sent by a client requesting graceful disconnection. The Godot client's ENet path uses Godot's own packet serialization through the high-level multiplayer API, which differs in wire format but carries equivalent semantic content for the purposes of the benchmark.

The current prototype in this repository uses a reduced but already working binary protocol. It has two upstream packet types (`JOIN` and `STATE`) and two downstream packet types (`ACK` and `TICK`). That smaller protocol is sufficient for proving the communication path before extending it to the fuller packet family described in the proposal.

```cpp
/*
 * Protocol (little-endian binary)
 *   Upstream   JOIN  : 0x01                                   (1 B)
 *   Upstream   STATE : 0x02|id|x16|y16|ts32|gx16|gy16       (14 B)
 *   Downstream ACK   : 0x01|id                                (2 B)
 *   Downstream TICK  : 0x02|count|[id|x16|y16|gx16|gy16]xN  (2+9N B)
 */
```

This design choice matters to the experiment because it keeps parsing cost low and packet structure predictable. A fixed-size client update is easier to count, timestamp, and compare across test runs than a more dynamic message format with many optional fields.

> [INSERT - Figure 4.4 - Packet format diagram. Show the byte layout of each of the five message types (CONNECT, INPUT, STATE, HEARTBEAT, DISCONNECT) as a boxes-and-offsets diagram, with the type byte at offset 0 and the payload following. Annotate each field with its size in bytes and its meaning.]

### 4.6 C++ UDP Server Main Loop

The C++ UDP server runs a single-threaded receive-and-dispatch loop. The server creates a UDP socket, binds it to a configurable port, and enters the main loop. On each iteration, the loop calls `recvfrom` to read the next incoming packet along with the sender's IP and port, dispatches the packet to the appropriate handler based on its type byte, services any pending broadcast tick, and checks for clients past the heartbeat eviction window. Single-threaded operation is intentional: it avoids lock contention on the client registry and produces a deterministic timing profile that simplifies measurement.

The current server prototype already follows this pattern. In practical terms, the loop polls the UDP socket with `select`, decodes one packet at a time, updates the player table, and then emits a server tick at 20 Hz.

```cpp
int sock = socket(AF_INET, SOCK_DGRAM, 0);
sockaddr_in srv{};
srv.sin_family = AF_INET;
inet_pton(AF_INET, bind.c_str(), &srv.sin_addr);
srv.sin_port = htons(port);
::bind(sock, (sockaddr*)&srv, sizeof(srv));

while (true) {
    struct timeval tv{0, 5000};
    fd_set fds; FD_ZERO(&fds); FD_SET(sock, &fds);

    if (select(sock + 1, &fds, nullptr, nullptr, &tv) > 0) {
        int n = (int)recvfrom(sock, buf, sizeof(buf), 0, (sockaddr*)&cli, &cli_len);
        if (n > 0) {
            std::string k = key_of(cli);
            if (n >= 1 && buf[0] == PKT_JOIN) {
                // register client and reply with ACK
            } else if (n >= 14 && buf[0] == PKT_STATE) {
                // update player's position and goal
            }
        }
    }
}
```

This is a useful snippet for the paper because it shows exactly where the custom server differs from a headless Godot ENet server: here, the networking loop is explicit, narrow in scope, and not embedded inside a larger engine runtime. That is the architectural difference the benchmark is intended to measure.

> [INSERT - Pseudo-code 4.1 - C++ UDP server main loop. Show `socket()` and `bind()` at startup, then the `while(running)` loop with: a non-blocking `recvfrom`, a switch on packet type that dispatches to `handle_connect` / `handle_input` / `handle_heartbeat` / `handle_disconnect`, a check against the next scheduled tick that calls `broadcast_state` when due, and a call to `evict_stale_clients`.]

### 4.7 Heartbeat and Client Eviction

Connection liveness is maintained by a heartbeat protocol. Each connected client sends a HEARTBEAT packet to the server on a one-second interval. The server records the timestamp of every received packet from each client, regardless of type, in the client registry. On every iteration of the main loop, the server compares the current time against the last-seen timestamp of every registered client and evicts any client whose last-seen value exceeds the eviction window. The eviction window is fixed at five seconds for the C++ server, matching the default eviction window of ENet, so that connection-management overhead is comparable across backends. Eviction broadcasts a PLAYER_LEFT message to all remaining clients so that client-side rosters stay consistent.

The prototype currently treats any packet from a client as proof of liveness and evicts clients after five seconds of silence. That means the current implementation already models the timeout behavior needed for the final benchmark, even though it does not yet use a dedicated `HEARTBEAT` packet type.

```cpp
for (auto it = players.begin(); it != players.end(); ) {
    double age = std::chrono::duration<double>(now - it->second.last_seen).count();
    if (age > CLIENT_TIMEOUT) {
        std::string ev = ts_now() + "  EVICT  " + it->first;
        log.push_back(ev);
        if ((int)log.size() > MAX_LOG) log.pop_front();
        it = players.erase(it);
    } else {
        ++it;
    }
}
```

From an experimental perspective, this matters because dead clients must be removed consistently. Otherwise, stale connections would inflate the apparent client count and distort both throughput and latency measurements.

> [INSERT - Pseudo-code 4.2 - Heartbeat eviction sweep. Show a loop over the client registry that compares `now()` against `client.last_seen`, removes clients whose gap exceeds 5 seconds, and broadcasts PLAYER_LEFT for each evicted client.]

### 4.8 The NodeStrike Workload

NodeStrike is a small objective-collection game intended to produce a consistent and easily scalable network workload. Players spawn on a grid map. An objective node spawns at a random cell. Each client computes the direction vector from its current position to the nearest objective and moves toward it; on contact, the objective is collected, and a new objective spawns at a new random cell. The game requires only two pieces of synchronized state per tick: the position of every player and the position of the current objective. Player input is restricted to a movement vector. This minimalism is intentional: it isolates network behavior from gameplay complexity so that any difference in measured performance between backends is attributable to the networking stack rather than to game logic.

The current Godot client implements exactly this style of lightweight bot-driven workload. Each tick it advances the bot one tile toward its goal and sends a compact state packet to the server. That makes the workload deterministic enough for benchmarking while still generating continuous network traffic.

```gdscript
func _game_tick() -> void:
	tick_count += 1
	_move_bot()
	_send_state()

func _move_bot() -> void:
	if local_x == goal_x and local_y == goal_y:
		_new_goal(); return
	var dx := goal_x - local_x
	var dy := goal_y - local_y
	if abs(dx) >= abs(dy):
		local_x += (1 if dx > 0 else -1)
	else:
		local_y += (1 if dy > 0 else -1)
```

The matching network send path is also already present in the client:

```gdscript
func _send_state() -> void:
	var pkt := PackedByteArray(); pkt.resize(14)
	pkt[0] = PKT_STATE
	pkt[1] = local_id
	pkt.encode_u16(2, local_x)
	pkt.encode_u16(4, local_y)
	pkt.encode_u32(6, Time.get_ticks_msec())
	pkt.encode_u16(10, goal_x)
	pkt.encode_u16(12, goal_y)
	udp.put_packet(pkt)
```

This snippet is important for the paper because it shows that the game workload is intentionally narrow. The client is not sending large inventories, chat logs, or physics snapshots; it is sending a small, repeatable movement/state update suitable for controlled measurement.

> [INSERT - Figure 4.5 - NodeStrike map mockup. Use the hand-drawn map from proposal slide 43, cleaned up: show the grid, players P1-P6 as labeled circles, the objective as a square, and the dashed shortest-path arrows from each player toward the nearest objective.]

## 5. Hypotheses and Goal Tree

### 5.1 Hypotheses

Null hypothesis (H0): The Godot ENet dedicated server and the custom C++ UDP server will show no statistically significant difference in any of the three measured metrics at any client count between two and fifty.

Alternative hypothesis (H1): The Godot ENet dedicated server will perform comparably to the C++ UDP server at low client counts (two to six), but the performance gap will grow significantly in favor of the C++ UDP server at higher client counts (thirty to fifty).

The alternative hypothesis is motivated by the architectural difference identified in Section 4.4: the ENet server carries the overhead of a stripped-down engine instance, while the C++ server carries only the networking layer. At low client counts, the per-client overhead is small relative to total available CPU and bandwidth, and any difference is expected to be within measurement noise. As client count grows, the per-client overhead accumulates, and the literature on buffer bloat suggests that the higher-overhead backend will saturate its receive queue earlier and exhibit a steeper growth in latency.

### 5.2 Goal Tree

The primary goal G1 is the comparison itself. It decomposes into five subordinate goals, each of which produces a concrete artifact or measurement that contributes to G1.

- G1.1 - Build a custom C++ UDP server with socket setup, client registry, packet format, heartbeat-based eviction, and fixed-tick state broadcast.
- G1.2 - Set up a Godot ENet headless dedicated server with peer configuration, RPC paths, and state synchronization.
- G1.3 - Build the main game framework in Godot for both backends, including the NodeStrike core game loop (G1.3.1) and a shared client capable of connecting to either backend (G1.3.2).
- G1.4 - Measure latency, packet handling throughput, and client capacity at client counts of one, five, ten, twenty, and fifty.
- G1.5 - Analyze the collected data, estimate the size of the performance gap between backends, and decide whether the null hypothesis can be rejected.

The performance metrics that drive G1.4 and G1.5 are: round-trip latency in milliseconds, packet handling throughput in packets per second, packet loss as a fraction of packets sent, bandwidth in megabytes per second, and concurrent client count without observable degradation.

> [INSERT - Figure 5.1 - Goal tree diagram. Use the visual goal tree from proposal slide 38, showing GOAL G1 at the root with G1.1-G1.5 as children, and G1.3.1 and G1.3.2 as children of G1.3.]

## 6. Experiment Design

### 6.1 Procedure

The experiment proceeds in the following sequence. Both backends are deployed on the same host machine. The Docker Compose harness launches a configurable number of headless Godot client containers, each connecting to one of the two backends. For each client count in the ramp, the harness runs an eight-minute measurement window during which Wireshark captures all UDP traffic on the host interface, and each client logs per-packet send and receive timestamps to a CSV file on a shared volume. After each window, the harness terminates all client containers, restarts the backend to clear residual state, and proceeds to the next client count.

The repository currently contains a simpler pre-Docker harness in `udp-test/Makefile`. It already demonstrates the basic experimental shape: start the server, launch several headless clients, let them run for a fixed window, and then collect logs. The final benchmark proposed in this paper generalizes that pattern into a more reproducible containerized workflow.

```make
test: build
	@echo "=== NodeStrike integration test ==="
	@./server/server > /tmp/ns_server.log 2>&1 &  echo $$! > /tmp/ns_server.pid
	@sleep 0.5
	@$(GODOT) --headless --path godot-client/ > /tmp/ns_client1.log 2>&1 & echo $$! >> /tmp/ns_server.pid
	@$(GODOT) --headless --path godot-client/ > /tmp/ns_client2.log 2>&1 & echo $$! >> /tmp/ns_server.pid
	@$(GODOT) --headless --path godot-client/ > /tmp/ns_client3.log 2>&1 & echo $$! >> /tmp/ns_server.pid
	@echo "Running for 12 seconds..."
	@sleep 12
	@kill $$(cat /tmp/ns_server.pid) 2>/dev/null || true
```

This current harness is not the final measurement platform, but it is strong evidence that the project already has a working execution loop. The paper can therefore describe the benchmark as an extension of an existing prototype rather than as a purely hypothetical design.

> [INSERT - Figure 6.1 - Experiment design diagram. Use the side-by-side layout from proposal slide 42 showing both backends with their respective server containers, scaled client containers (`compose --scale client=N`), benchmark logger, and `metrics.csv` output to a shared Docker volume.]

### 6.2 Variables and Controls

The independent variables are the choice of backend (ENet headless server or custom C++ UDP server) and the number of connected clients (1, 5, 10, 20, 50). The dependent variables are round-trip latency in milliseconds, packet handling throughput in packets per second, packet loss as a fraction, bandwidth in megabytes per second, and the highest client count sustained without measurable degradation. Controlled variables include the host machine, the network interface, the operating system kernel parameters affecting socket buffer sizes, the Godot client build, the NodeStrike game logic and tick rate, and the testing time of day.

### 6.3 Time Budget

Each client-count step is allocated eight minutes of measurement time. Five client counts yield forty minutes per repetition. Three repetitions per backend yield 120 minutes per backend. Two backends yield a total testing budget of 240 minutes. This budget excludes setup, teardown, and post-processing time, all of which are absorbed into the schedule described in Section 7.

### 6.4 Data Collection and Analysis

All measurements are written to per-run CSV files on a shared Docker volume. After each run, latency distributions are computed as median, ninety-fifth percentile, and ninety-ninth percentile values per client count per backend. Packet handling throughput is computed as the total number of packets observed by Wireshark divided by the measurement window. Packet loss is computed as the difference between client-side sent counts and server-side received counts, normalized by sent count. Bandwidth is read directly from Wireshark capture statistics. Comparison across backends uses the two-tailed Welch t-test on the per-run medians, with significance threshold set at the conventional 0.05. Three repetitions per condition are the minimum for variance estimation; additional repetitions will be added if early results show high variance.

## 7. Schedule

The project schedule spans Summer 2026 and Fall 2026. The implementation work is concentrated in Summer 2026, with the Godot ENet headless server set up first because it depends only on documented engine features. The shared Godot client and the NodeStrike core game loop follow. The custom C++ UDP server is implemented next, alongside the corresponding client transport path. Benchmarking, analysis, and writing occupy Fall 2026.

The schedule is organized around eight tracked tasks, each tied to one of five progress reports (PRs):

- Task 1.1 - Set up the Godot ENet headless dedicated server with RPC and state synchronization. Tied to PR1.
- Task 1.2 - Set up the main game framework in Godot, including the NodeStrike core game loop (1.2.1) and the client connection path to the Godot server (1.2.2).
- Task 1.3 - Build the custom C++ UDP server with socket and packet format (1.3.1). Tied to PR2.
- Task 1.4 - Benchmark latency, packet handling, bandwidth, and client capacity. Tied to PR3 and PR4.
- Task 1.5 - Graph results and test for statistically significant differences between backends. Tied to PR4.
- Task 1.6 - Prepare and deliver the final presentation. Tied to PR5.
- Task 1.7 - Update the research poster with final results.
- Task 1.8 - Write the final paper.

### 7.1 Deliverables by Progress Report

- PR1 - Godot ENet headless server running with RPC and state synchronization working.
- PR2 - C++ UDP server running with socket, client registry, and state broadcast working.
- PR3 - Demo game complete; shared Godot client works with both C++ and ENet backends.
- PR4 - Experiment data collected; statistical analysis in progress.
- PR5 - Analysis complete; final presentation polished and final paper near done.

The 120-hour budget for the senior research project is allocated approximately as follows: 30 hours for the C++ UDP server, 20 hours for the Godot ENet server and shared client integration, 25 hours for the NodeStrike game and benchmark harness, 25 hours for measurement runs and analysis, and 20 hours for writing the final paper, updating the poster, and preparing the final presentation.

> [INSERT - Figure 7.1 - Gantt chart of the project schedule. Use the schedule chart from proposal slide 46 showing weekly task bars from Aug through Dec, with red vertical lines marking each progress report deadline.]

## 8. Conclusion

This proposal describes a controlled comparison of two backend networking implementations for a Godot multiplayer game: the engine's built-in ENet dedicated server and a custom C++ UDP dedicated server. The literature establishes UDP as the appropriate transport for real-time gameplay, C++ as a strong choice of implementation language for low-overhead server work, and the dedicated-server topology as the preferred arrangement for competitive multiplayer. The literature also identifies a gap that this project will fill: no published study isolates Godot's ENet stack against a hand-rolled C++ UDP backend under a shared client and a controlled workload. The proposed benchmark addresses that gap with measurements of latency, packet handling throughput, and client capacity at five client counts, three repetitions per count, and a total testing budget of 240 minutes split evenly between backends. The expected contribution is a reproducible body of evidence that Godot developers can use to make an informed choice between convenience and performance when designing the backend of a multiplayer project.

## Works Cited

Ahde, Jani. "Real-Time Unity Multiplayer Server Implementation." Bachelor's thesis, 2017.

Al-Dhief, Fahad Taha, et al. "Performance Comparison Between TCP and UDP Protocols in Different Simulation Scenarios." International Journal of Engineering & Technology, vol. 7, no. 4.36, 2018, pp. 172-176.

Arboleda, Francisco Javier Moreno, Mateo Rincon Arias, and Jesus Antonio Hernandez Riveros. "Performance of Parallelism in Python and C++." IAENG International Journal of Computer Science, vol. 50, no. 2, 2023, pp. 1-13.

Aukstakalnis, Lukas. "Server-Client Networking Implementation Using the Godot Game Engine." 2024.

Celik, Arda Deniz, and Gokhan Secinti. "Network Optimizing Software Solution for Multiplayer Gaming." ITU Journal of Wireless Communications and Cybersecurity, vol. 1, no. 1, 2024, pp. 47-56.

GeeksforGeeks. "UDP Server-Client Implementation in C++." GeeksforGeeks, 22 Mar. 2018, www.geeksforgeeks.org/cpp/udp-server-client-implementation-c/.

Godot Foundation. "Custom Data Compression." Godot Forum, 10 Sept. 2024, forum.godotengine.org/t/custom-data-compression/81986. Accessed 27 Feb. 2026.

Godot Foundation. "Exporting for Dedicated Servers." Godot Engine Documentation, 2026, docs.godotengine.org/en/stable/tutorials/export/exporting_for_dedicated_servers.html. Accessed 27 Feb. 2026.

Godot Foundation. "UDPServer." Godot Engine Documentation, 2026, docs.godotengine.org/en/4.4/classes/class_udpserver.html. Accessed 27 Feb. 2026.

Jones, Charles. "Go UDP Programming: A Beginner-Friendly Guide to Building Fast, Real-Time Apps." DEV Community, 29 Oct. 2025, dev.to/jones_charles_ad50858dbc0/go-udp-programming-a-beginner-friendly-guide-to-building-fast-real-time-apps-4ik. Accessed 27 Feb. 2026.

"Kehom's Forge." Kehomsforge.com, 2024, kehomsforge.com/. Accessed 27 Feb. 2026.

Raysync. "Why Packet Loss Happens and How to Diagnose It." Raysync Blog, 2023. [Full citation to be confirmed.]

Retunsky, Eugene. "Benchmarking Low-Level I/O: C, C++, Rust, Golang, Java, Python." Star Gazers, 26 Mar. 2023, medium.com/star-gazers/benchmarking-low-level-i-o-c-c-rust-golang-java-python-9a0d505f85f7.

"Socketserver - A Framework for Network Servers." Python Documentation, docs.python.org/3/library/socketserver.html.

Substack. "Buffer Bloat and the Latency-Throughput Trade-off." 2025. [Full citation to be confirmed.]

Sudhi S. "Rust vs Go vs Python vs C++." Medium, 9 Apr. 2025, medium.com/@sudhis/rust-vs-go-vs-python-vs-c-afd7ae0aa5a7. Accessed 27 Feb. 2026.

Zehra, F., M. Javed, D. Khan, and M. Pasha. "Comparative Analysis of C++ and Python in Terms of Memory and Time." MDPI AG, 2020, doi.org/10.20944/preprints202012.0516.v1.
