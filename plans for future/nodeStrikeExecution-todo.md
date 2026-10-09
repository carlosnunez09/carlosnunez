# NodeStrike execution follow-up notes

Moved from the published NodeStrike Execution article on 2026-10-09.

- [ ] add how the nodestrike was made and insight on how it works

- [ ] **Run a 270-client hold test for 20 minutes**, capturing snapshots every 10 seconds to verify stability.

    **Description:**
    Start the server, connect 270 clients, then stop adding clients and keep those same clients running for 20 minutes. Record CPU, memory, network use, receive rate, packet loss, and latency every 10 seconds. This checks whether the system remains stable after the initial join spike settles down.

    This complements the granular ramp test:
    - **Granular ramp:** Measures the cost of joining, spawning, and increasing load while new clients arrive.
    - **270-client hold:** Measures whether the server and clients remain stable for 20 minutes after all 270 clients are connected.
    - **Data visualization:** Ensure clear, high-quality data is given so i can make the graphs in google with a xlsx

    *Note: The monitor already records machine resources every second. For the stability report, aggregate that data into one row every 10 seconds, resulting in 120 clean observations across 20 minutes. Raw one-second files remain saved in case we need to investigate a spike.*

    **Required Graphs:**
    1. **Client and responding count over time:** Confirms whether all 270 stay connected.
    2. **Latency over time:** Plots p50, p95, and p99 RTT every 10 seconds to monitor for degrading performance.
    3. **Server health over time:** Tracks CPU, memory, load, and network throughput. - for me 
    4. **Client VM health over time:** Tracks CPU, memory, and network throughput to distinguish server limitations from overloaded test clients. - for me 
    5. **Receive rate and tick rate over time:** Shows whether the system maintains its intended update rate or falls behind.
    6. **Loss/error timeline:** Maps tick gaps, incomplete snapshots, disconnects, evictions, and send errors per 10-second window.

- [ ] making sure to run a full valid run  with repetion and preoper clint spacing at 10 seconds
