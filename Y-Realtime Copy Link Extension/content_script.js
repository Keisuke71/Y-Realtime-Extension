(function() {
  const COPY_ICON = '📋';

  function sanitizeUrl(href) {
    try {
      const url = new URL(href);
      url.search = '';
      url.hash = '';
      return url.toString();
    } catch (e) {
      return href.split('?')[0];
    }
  }

  function isTimestampText(txt) {
    const plainTime = /^\d{1,2}:\d{2}$/;
    const datedTime = /^(?:昨日|今日|\d+月\d+日(?:\([^)]+\))?)\s+\d{1,2}:\d{2}$/;
    const minuteAgo = /^\d+分前$/;
    const secondAgo = /^\d+秒前$/;
    return (
      plainTime.test(txt) ||
      datedTime.test(txt) ||
      minuteAgo.test(txt) ||
      secondAgo.test(txt)
    );
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.7)',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '0.9em',
      zIndex: '9999',
      opacity: '0',
      transition: 'opacity 0.3s ease'
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => { toast.style.opacity = '0'; }, 1500);
    setTimeout(() => { document.body.removeChild(toast); }, 1800);
  }

  function addButtons() {
    document.querySelectorAll('a').forEach(link => {
      const txt = link.textContent.trim();
      if (isTimestampText(txt) && !link.dataset.hasCopyBtn) {
        link.dataset.hasCopyBtn = 'true';
        const btn = document.createElement('button');
        btn.textContent = COPY_ICON;
        Object.assign(btn.style, {
          marginLeft: '4px',
          padding: '2px 4px',
          fontSize: '0.9em',
          cursor: 'pointer'
        });
        btn.addEventListener('click', ev => {
          ev.stopPropagation();
          ev.preventDefault();
          const cleanLink = sanitizeUrl(link.href);
          navigator.clipboard.writeText(cleanLink)
            .then(() => showToast('URLをコピーしました'))
            .catch(() => showToast('コピーに失敗しました'));
        });
        link.parentNode.insertBefore(btn, link.nextSibling);
      }
    });
  }

  // 初回実行＆動的追加対応
  addButtons();
  new MutationObserver(addButtons).observe(document.body, { childList: true, subtree: true });
})();