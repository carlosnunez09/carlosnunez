(async () => {
  if (!window.Plotly) return;
  const plots = [];
  const requests = new Map();
  function palette() {
    const dark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
    return { text: dark ? '#ddd' : '#333', grid: dark ? '#ffffff20' : '#00000018', background: dark ? '#1d1e20' : '#fff', blue: dark ? '#6aafff' : '#1967b3', orange: dark ? '#ffb16b' : '#b94f0c' };
  }
  for (const figure of document.querySelectorAll('.interactive-graph')) {
    const plot = figure.querySelector('.chart-plot');
    const area = figure.querySelector('.chart-canvas');
    try {
      const url = figure.dataset.source;
      if (!requests.has(url)) requests.set(url, fetch(url).then(r => { if (!r.ok) throw new Error('Chart data unavailable'); return r.json(); }));
      const data = await requests.get(url);
      const field = figure.dataset.metric;
      const loss = field === 'loss_events';
      const rows = [...data.enet, ...data.cpp];
      const first = Math.min(...rows.map(row => row.clients_target));
      const last = Math.max(...rows.map(row => row.clients_target));
      const ceiling = subset => Math.max(1, Math.ceil(Math.max(...subset.map(row => row[field])) * 1.08));
      const ranges = {
        trend: { x: [150, 299], y: [0, ceiling(rows.filter(row => row.clients_target >= 150 && row.clients_target <= 299))] },
        full: { x: [first, last], y: [0, ceiling(rows)] }
      };
      let view = 'trend';
      const p = palette();
      area.hidden = false;
      await Plotly.newPlot(plot, ['enet', 'cpp'].map((backend, i) => ({
        type: 'scatter', mode: 'lines', name: i ? 'C++' : 'ENet',
        x: data[backend].map(row => row.clients_target),
        y: data[backend].map(row => row[field]),
        line: { color: i ? p.orange : p.blue, width: 2.4, dash: i ? 'dash' : 'solid', simplify: false },
        hovertemplate: `${i ? 'C++' : 'ENet'}: %{y:${loss ? ',.0f' : '.3f'}} ${loss ? 'events' : 'msg/client/s'}<extra></extra>`
      })), {
        autosize: true, margin: { l: 80, r: 24, t: 60, b: 65 },
        paper_bgcolor: p.background, plot_bgcolor: p.background,
        font: { color: p.text, family: 'system-ui, sans-serif', size: 14 },
        hovermode: 'x unified', dragmode: 'zoom',
        hoverlabel: { bgcolor: p.background, font: { color: p.text } },
        legend: { orientation: 'h', x: 0, y: 1.12 },
        xaxis: { title: { text: 'Target clients' }, range: ranges.trend.x, gridcolor: p.grid, zeroline: false, tickformat: ',d', unifiedhovertitle: { text: 'Target clients: %{x}' }, automargin: true },
        yaxis: { title: { text: loss ? 'Loss events (count)' : 'Received messages / client / second' }, range: ranges.trend.y, gridcolor: p.grid, zerolinecolor: p.grid, automargin: true },
      }, {
        responsive: true, displaylogo: false, displayModeBar: true, scrollZoom: false,
        modeBarButtonsToRemove: ['select2d', 'lasso2d'],
        toImageButtonOptions: { format: 'svg', filename: `nodestrike-${field}`, width: 1200, height: 700 }
      });
      plots.push(plot);
      const note = figure.querySelector('.chart-view-note');
      const describe = () => {
        note.textContent = view === 'trend'
          ? 'Trend view: 150–299 clients. Earlier points and the 300-client endpoint are outside this view; choose Full range to see all measurements.'
          : `Full range: ${first}–${last} clients. All measurements are included.`;
        for (const action of ['trend', 'full']) figure.querySelector(`[data-action="${action}"]`).setAttribute('aria-pressed', String(action === view));
      };
      const setView = next => {
        view = next;
        Plotly.relayout(plot, { 'xaxis.range': ranges[view].x, 'yaxis.range': ranges[view].y, 'xaxis.autorange': false, 'yaxis.autorange': false });
        describe();
      };
      describe();
      note.hidden = false;
      figure.querySelector('.chart-fallback').hidden = true;
      figure.querySelector('.chart-tools').hidden = false;
      figure.querySelector('.chart-instructions').textContent = 'Hover for values. Click a legend to hide a series. Drag to zoom; select Pan in the graph toolbar to move around.';
      const dialog = document.createElement('dialog');
      dialog.className = 'chart-dialog';
      dialog.setAttribute('aria-label', plot.getAttribute('aria-label'));
      document.body.append(dialog);
      let placeholder;
      let overflow;
      figure.addEventListener('click', event => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const action = button.dataset.action;
        if (action === 'trend' || action === 'full') setView(action);
        if (action === 'reset') setView(view);
        if (action === 'in' || action === 'out') {
          const [a, b] = plot.layout.xaxis.range;
          const width = Math.min(last - first, (b - a) * (action === 'in' ? .8 : 1.25));
          const start = Math.max(first, Math.min(last - width, (a + b - width) / 2));
          Plotly.relayout(plot, { 'xaxis.range': [start, start + width], 'xaxis.autorange': false });
        }
        if (action === 'expand') {
          if (dialog.open) { dialog.close(); return; }
          placeholder = document.createComment('chart position');
          figure.before(placeholder);
          dialog.append(figure);
          overflow = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
          button.textContent = 'Close';
          dialog.showModal();
          Plotly.Plots.resize(plot);
          button.focus();
        }
      });
      dialog.addEventListener('close', () => {
        placeholder.replaceWith(figure);
        document.body.style.overflow = overflow;
        const button = figure.querySelector('[data-action="expand"]');
        button.textContent = 'Enlarge';
        Plotly.Plots.resize(plot);
        button.focus();
      });
    } catch (error) {
      Plotly.purge(plot);
      area.hidden = true;
      figure.querySelector('.chart-fallback').hidden = false;
      figure.querySelector('.chart-instructions').textContent = 'Interactive view unavailable. Static graph shown.';
      console.error(error);
    }
  }
  const observer = new MutationObserver(() => {
    const p = palette();
    plots.forEach(plot => {
      Plotly.relayout(plot, { paper_bgcolor: p.background, plot_bgcolor: p.background, 'font.color': p.text, 'xaxis.gridcolor': p.grid, 'yaxis.gridcolor': p.grid, 'yaxis.zerolinecolor': p.grid, 'hoverlabel.bgcolor': p.background, 'hoverlabel.font.color': p.text });
      Plotly.restyle(plot, { 'line.color': [p.blue, p.orange] });
    });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
