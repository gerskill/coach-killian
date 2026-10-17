/* Coach Killian – couche design 2026 : anneaux de macros, en-tête daté, courbes lisses, retour haptique, squelettes.
   Ne fait que lire le DOM rendu par app.js : aucune logique métier ici. */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  /* anneaux de macros : calqués sur la largeur des barres (mise à jour par app.js) */
  function syncRings() {
    $$('.gauges .bar').forEach(bar => {
      const f = bar.querySelector('.fill'), c = bar.querySelector('.mfg'), t = bar.querySelector('.mpct');
      if (!f || !c) return;
      const pct = parseFloat(f.style.width) || 0, C = 2 * Math.PI * 19;
      c.style.strokeDasharray = C; c.style.strokeDashoffset = C * (1 - Math.min(pct, 100) / 100);
      if (t) t.textContent = Math.round(pct) + ' %';
    });
  }
  /* en-tête : date complète au-dessus du titre */
  function syncEyebrow() {
    const el = $('#eyebrow'); if (!el) return;
    let d = new Date();
    try { if (typeof curDate === 'string' && typeof parseKey === 'function') d = parseKey(curDate); } catch { }
    el.textContent = d.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  /* courbes : polylignes → courbes lisses (Catmull-Rom) + aire en dégradé */
  let gid = 0;
  function smooth(svg) {
    svg.querySelectorAll('polyline:not([data-smoothed])').forEach(pl => {
      const pts = pl.getAttribute('points').trim().split(/\s+/).map(p => p.split(',').map(Number)).filter(p => p.length === 2 && p.every(isFinite));
      if (pts.length < 2) return;
      let d = `M${pts[0][0]},${pts[0][1]}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
      }
      const ns = 'http://www.w3.org/2000/svg', color = pl.getAttribute('stroke') || 'currentColor';
      const vb = svg.viewBox.baseVal, bottom = vb && vb.height ? vb.y + vb.height - 20 : Math.max(...pts.map(p => p[1]));
      const id = 'ckg' + (++gid);
      const defs = document.createElementNS(ns, 'defs');
      defs.innerHTML = `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`;
      const area = document.createElementNS(ns, 'path');
      area.setAttribute('d', `${d} L${pts[pts.length - 1][0]},${bottom} L${pts[0][0]},${bottom} Z`);
      area.setAttribute('fill', `url(#${id})`); area.setAttribute('stroke', 'none');
      const line = document.createElementNS(ns, 'path');
      line.setAttribute('d', d); line.setAttribute('fill', 'none'); line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', '2.5'); line.setAttribute('stroke-linecap', 'round'); line.setAttribute('class', 'ck-line');
      svg.insertBefore(defs, svg.firstChild);
      pl.after(area, line); pl.setAttribute('data-smoothed', '1'); pl.style.display = 'none';
    });
  }
  const run = () => { syncRings(); syncEyebrow(); $$('.chart svg').forEach(smooth); };
  run();
  let raf = 0;
  new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; run(); }); })
    .observe(document.querySelector('main') || document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['style'] });
  const dl = $('#dateLabel'); if (dl) new MutationObserver(syncEyebrow).observe(dl, { childList: true, characterData: true, subtree: true });
  /* squelette pendant une recherche Open Food Facts */
  const st = $('#searchStatus'), res = $('#results');
  if (st && res) new MutationObserver(() => {
    const busy = /recherche|chargement|…/i.test(st.textContent) && !res.children.length;
    res.classList.toggle('is-loading', busy);
  }).observe(st, { childList: true, characterData: true, subtree: true });
  /* retour « haptique » */
  document.addEventListener('pointerdown', e => {
    if (e.target.closest('.btn,.tab,.preset,.chip') && navigator.vibrate) { try { navigator.vibrate(8); } catch { } }
  }, { passive: true });
})();
