# NodeStrike data

Place original `.xlsx` workbooks in this folder. Keep the originals unchanged when generating graphs.

Once a workbook is available, choose its worksheet, columns, units, and the comparison to show. Graphs can then be generated as SVG or PNG files in `static/graphs/nodestrike/` and embedded in the NodeStrike Execution post:

```markdown
![Description of the graph](/graphs/nodestrike/graph-name.svg)
```

Regenerate the two graphs used in the execution post with:

```sh
python scripts/plot_nodestrike.py "data/nodestrike/data (1).xlsx"
```

Requires Python, `openpyxl`, and `matplotlib`. The script also recognizes Matplotlib installed in `.tools/plot-deps`. It reads `clients_target`, `receive_per_client_sec`, and `loss_events` from the `enet` and `godot` sheets, checks the `graphs` summary, and exports SVG and PNG files to `static/graphs/nodestrike/`. Backend labels come from the data (`enet` and `cpp`).

Rerun the script after changing the workbook; Hugo serves the generated images without reading Excel files at build time.

The script also exports `static/graphs/nodestrike/metrics.json` for the interactive Plotly.js graphs. Use `--data-only` to refresh their values without regenerating images (only `openpyxl` is needed). The post loads pinned Plotly.js 4.1.1 from the Plotly CDN; if it cannot load, the static images remain visible.

Hover for values, click a legend label to hide a backend, and drag to zoom. Choose Pan in Plotly's toolbar to move around. The page controls provide trend/full ranges, zoom, reset, and an enlarged view. Download SVG preserves the full original graph, independent of the current interactive view. Plotly's camera button exports the current view.
