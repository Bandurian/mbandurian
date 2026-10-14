/* Apply saved theme before the first paint; new visitors start in dark mode. */
(function () {
  const root = document.documentElement;
  try {
    if (localStorage.getItem('selectedTheme') === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
  } catch (_) {
    root.removeAttribute('data-theme');
  }

  // Keep the homepage's separate title/font/star introduction intact.
  root.classList.add('site-preparing');
  const reveal = () => root.classList.add('site-ready');
  document.addEventListener('DOMContentLoaded', () => {
    // Use the accent color for only the final dot of the header wordmark.
    document.querySelectorAll('header.animated-header .logo').forEach(logo => {
      const last = logo.lastChild;
      if (!last || last.nodeType !== 3 || !last.nodeValue.trimEnd().endsWith('.')) return;
      last.nodeValue = last.nodeValue.replace(/\.([\s]*)$/, '$1');
      const dot = document.createElement('span');
      dot.className = 'logo-dot';
      dot.textContent = '.';
      dot.setAttribute('aria-hidden', 'true');
      logo.appendChild(dot);
      // Keep the name and dot accessible as one readable label.
      logo.setAttribute('aria-label', 'BANDURIAN M.');
    });
    if (!document.fonts || !document.fonts.load) {
      reveal();
      return;
    }
    const fonts = [
      '400 16px Inter',
      '500 16px Inter',
      '600 16px Inter',
      '700 16px Inter',
      '600 48px Unbounded',
      '700 48px Unbounded',
      '800 48px Unbounded'
    ];
    let finished = false;
    const release = () => {
      if (finished) return;
      finished = true;
      reveal();
    };
    const fallback = setTimeout(release, 4500);
    Promise.all(fonts.map(font => document.fonts.load(font).catch(() => [])))
      .then(() => { clearTimeout(fallback); release(); }, release);
  }, { once: true });
})();
