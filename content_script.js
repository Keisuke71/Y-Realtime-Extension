(function() {
  const COPY_ICON = '📋';
  const COUNTER_ID = 'ytweet-counter';
  const PANEL_ID = 'ytweet-top-panel';
  let updateTimer = null;

  function sanitizeUrl(href) {
    try {
      const url = new URL(href);
      url.search = '';
      url.hash = '';
      return url.toString();
    } catch {
      return href.split('?')[0];
    }
  }

  function isTimestampLink(link) {
    const txt = link.textContent.trim();
    if (!link.href.includes('/status/')) return false;
    const plainTime = /^\d{1,2}:\d{2}$/;
    const datedTime = /^(?:昨日|今日|\d+月\d+日(?:\([^)]+\))?)\s+\d{1,2}:\d{2}$/;
    const minuteAgo = /^\d+分前$/;
    const secondAgo = /^\d+秒前$/;
    return [plainTime, datedTime, minuteAgo, secondAgo].some(rx => rx.test(txt));
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '8px 12px', borderRadius: '4px',
      fontSize: '0.9em', zIndex: '9999', opacity: '0', transition: 'opacity 0.3s ease'
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.style.opacity = '1');
    setTimeout(() => toast.style.opacity = '0', 1500);
    setTimeout(() => document.body.removeChild(toast), 1800);
  }

  function updateCounter(count) {
    let counter = document.getElementById(COUNTER_ID);
    if (!counter) {
      counter = document.createElement('div');
      counter.id = COUNTER_ID;
      Object.assign(counter.style, {
        position: 'fixed', top: '10px', right: '10px',
        background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 10px', borderRadius: '4px',
        fontSize: '0.9em', zIndex: '9999'
      });
      document.body.appendChild(counter);
    }
    counter.textContent = `投稿数: ${count}`;
  }

  function updateTopPanel(links) {
    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = document.createElement('div'); panel.id = PANEL_ID;
      Object.assign(panel.style, {
        position: 'fixed', top: '40px', right: '10px', maxHeight: '80vh', overflowY: 'auto',
        background: 'rgba(255,255,255,0.9)', padding: '6px', borderRadius: '4px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)', zIndex: '9999'
      });
      document.body.appendChild(panel);
    }
    panel.innerHTML = '';
    links.forEach(link => {
      const btn = document.createElement('button');
      btn.textContent = link.textContent.trim(); btn.dataset.copied = 'false';
      Object.assign(btn.style, {
        display: 'block', margin: '2px 0', padding: '6px 8px', fontSize: '0.8em',
        cursor: 'pointer', width: '100%', textAlign: 'left',
        border: '1px solid #444', borderRadius: '4px', background: '#fff'
      });
      btn.addEventListener('click', ev => {
        ev.stopPropagation(); ev.preventDefault();
        const clean = sanitizeUrl(link.href);
        navigator.clipboard.writeText(clean)
          .then(() => {
            showToast('URLをコピーしました');
            btn.style.backgroundColor = 'lightgreen'; btn.dataset.copied = 'true';
          })
          .catch(() => showToast('コピーに失敗しました'));
      });
      panel.appendChild(btn);
    });
  }

  function addInlineButtons() {
    document.querySelectorAll('a').forEach(link => {
      if (isTimestampLink(link) && !link.dataset.hasCopyBtn) {
        link.dataset.hasCopyBtn = 'true';
        const btn = document.createElement('button');
        btn.textContent = COPY_ICON; btn.dataset.copied = 'false';
        Object.assign(btn.style, {
          marginLeft: '6px', padding: '4px 6px', fontSize: '0.9em', cursor: 'pointer',
          border: '2px solid #007bff', borderRadius: '4px', background: '#fff'
        });
        btn.addEventListener('click', ev => {
          ev.stopPropagation(); ev.preventDefault();
          const cleanLink = sanitizeUrl(link.href);
          navigator.clipboard.writeText(cleanLink)
            .then(() => {
              showToast('URLをコピーしました');
              btn.style.backgroundColor = 'lightgreen'; btn.dataset.copied = 'true';
            })
            .catch(() => showToast('コピーに失敗しました'));
        });
        link.parentNode.insertBefore(btn, link.nextSibling);
      }
    });
  }

  function processPage() {
    const timestampLinks = Array.from(document.querySelectorAll('a')).filter(isTimestampLink);
    addInlineButtons();
    updateCounter(timestampLinks.length);
    updateTopPanel(timestampLinks);
  }

  processPage();
  const observer = new MutationObserver(() => {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(processPage, 300);
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
