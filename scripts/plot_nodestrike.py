"""Render the NodeStrike post charts without modifying the source workbook.

Usage: python scripts/plot_nodestrike.py [path/to/workbook.xlsx]
Requires openpyxl and matplotlib (optional local install: .tools/plot-deps).
"""

import math
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.tools' / 'plot-deps'))
import openpyxl


def load_series(path):
    workbook = openpyxl.load_workbook(path, read_only=True, data_only=True)
    series = {}
    try:
        for sheet, backend in [('enet', 'enet'), ('godot', 'cpp')]:
            rows = iter(workbook[sheet].values)
            headers = next(rows)
            records = []
            for row_number, row in enumerate(rows, 2):
                if not any(value is not None for value in row):
                    continue
                record = dict(zip(headers, row))
                if record['backend'] != backend:
                    raise ValueError(f'{sheet}!{row_number}: unexpected backend')
                for field in ['clients_target', 'receive_per_client_sec', 'loss_events']:
                    value = record[field]
                    if not isinstance(value, (int, float)) or not math.isfinite(value) or value < 0:
                        raise ValueError(f'{sheet}!{row_number}: invalid {field}: {value}')
                records.append(record)
            records.sort(key=lambda row: row['clients_target'])
            targets = [row['clients_target'] for row in records]
            if not records or len(targets) != len(set(targets)):
                raise ValueError(f'{sheet}: empty data or repeated target counts; review aggregation')
            series[backend] = records
        # Check the workbook's graph summary against the original measurement rows.
        summary = list(workbook['graphs'].values)[1:]
        lookup = {key: {row['clients_target']: row for row in rows} for key, rows in series.items()}
        for row in summary:
            if row[0] is None:
                continue
            for backend, loss_col, rate_col in [('enet', 1, 5), ('cpp', 2, 6)]:
                source = lookup[backend][row[0]]
                assert math.isclose(row[loss_col], source['loss_events'], rel_tol=1e-9)
                assert math.isclose(row[rate_col], source['receive_per_client_sec'], rel_tol=1e-9)
    finally:
        workbook.close()
    return series


def render(series, field, title, ylabel, filename):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from matplotlib.ticker import StrMethodFormatter
    plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 12, 'svg.fonttype': 'none'})
    fig, ax = plt.subplots(figsize=(10, 5.8), layout='constrained')
    for backend, label, color, style in [('enet', 'ENet', '#1967b3', '-'), ('cpp', 'C++', '#c05616', '--')]:
        rows = series[backend]
        ax.plot([row['clients_target'] for row in rows], [row[field] for row in rows],
                label=label, color=color, linestyle=style, linewidth=1.8)
    ax.set(title=title, xlabel='Target clients', ylabel=ylabel)
    ax.set_xlim(0, max(row['clients_target'] for rows in series.values() for row in rows) + 3)
    ax.set_ylim(bottom=0)
    ax.yaxis.set_major_formatter(StrMethodFormatter('{x:,.0f}'))
    ax.grid(axis='y', color='#dddddd', linewidth=.7)
    ax.set_axisbelow(True)
    ax.spines[['top', 'right']].set_visible(False)
    ax.legend(loc='upper left', frameon=True, facecolor='white', framealpha=.95)
    ax.title.set_fontsize(17)
    ax.set_title(title, fontsize=17, pad=18)
    output = ROOT / 'static' / 'graphs' / 'nodestrike'
    output.mkdir(parents=True, exist_ok=True)
    for extension in ['svg', 'png']:
        fig.savefig(output / f'{filename}.{extension}', dpi=180, facecolor='white')
    plt.close(fig)


if __name__ == '__main__':
    arguments = [argument for argument in sys.argv[1:] if argument != '--data-only']
    source = Path(arguments[0]) if arguments else ROOT / 'data' / 'nodestrike' / 'data (1).xlsx'
    data = load_series(source)
    output = ROOT / 'static' / 'graphs' / 'nodestrike'
    output.mkdir(parents=True, exist_ok=True)
    payload = {backend: [{key: row[key] for key in ['clients_target', 'receive_per_client_sec', 'loss_events']} for row in rows] for backend, rows in data.items()}
    (output / 'metrics.json').write_text(json.dumps(payload, allow_nan=False), encoding='utf-8')
    if '--data-only' in sys.argv:
        print('Chart data exported and checked against the workbook summary.')
        sys.exit(0)
    render(data, 'receive_per_client_sec', 'Received rate vs. target clients',
           'Received messages per client per second', 'received-rate-vs-target-clients')
    render(data, 'loss_events', 'Packet loss events vs. target clients',
           'Loss events (recorded count)', 'packet-loss-events-vs-target-clients')
    for backend, rows in data.items():
        print(f'{backend}: {len(rows)} points; targets {rows[0]["clients_target"]:g}–{rows[-1]["clients_target"]:g}')
    print('Both charts saved as SVG and PNG; summary values match source rows.')
