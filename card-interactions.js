(() => {
  const toast = document.querySelector('#toast');

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function bindCard(card, action, options={}) {
    if (!card || card.dataset.cardBound === 'true') return;
    const { captureControls=false } = options;
    card.dataset.cardBound = 'true';
    card.dataset.cardInteractive = 'true';
    card.setAttribute('role','link');
    if (card.tagName !== 'A') card.tabIndex = 0;

    let pressTimer;
    card.addEventListener('pointerdown', () => {
      card.classList.add('is-pressing');
      clearTimeout(pressTimer);
    });
    ['pointerup','pointercancel','pointerleave'].forEach(type => {
      card.addEventListener(type, () => {
        pressTimer = setTimeout(() => card.classList.remove('is-pressing'), 70);
      });
    });

    card.addEventListener('click', event => {
      const nestedControl = event.target.closest('a,button');
      if (nestedControl && nestedControl !== card && !captureControls) return;
      if (captureControls) {
        event.preventDefault();
        event.stopPropagation();
      }
      action();
    });

    card.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.stopPropagation();
      action();
    });
  }

  function enhanceHomepage() {
    document.querySelectorAll('.area-card').forEach(card => {
      const areaId = card.dataset.areaCard || card.querySelector('[data-area-open]')?.dataset.areaOpen;
      if (!areaId) return;
      bindCard(card, () => {
        if (areaId === 'A01') {
          location.href = 'area.html?id=A01';
        } else {
          showToast('这个区域会按同一套模板继续接入；目前先完成罗马及意大利中部。');
        }
      }, {captureControls:true});
    });

    const destinationLinks = { '罗马':'D001' };
    document.querySelectorAll('.recommend-card').forEach(card => {
      const name = card.querySelector('h3')?.textContent?.trim();
      if (!name) return;
      bindCard(card, () => {
        const id = destinationLinks[name];
        if (id) {
          location.href = `destination.html?id=${id}`;
        } else {
          showToast(`${name} 的目的地页面会在对应大区域完成后接入。`);
        }
      });
    });
  }

  function enhanceAreaPage() {
    document.querySelectorAll('.destination-card').forEach(card => {
      const link = card.querySelector('a[href*="destination.html"]');
      if (!link) return;
      bindCard(card, () => { location.href = link.href; });
    });
  }

  function enhanceDestinationPage() {
    document.querySelectorAll('.child-card').forEach(card => {
      card.dataset.cardInteractive = 'true';
    });
  }

  function enhance() {
    enhanceHomepage();
    enhanceAreaPage();
    enhanceDestinationPage();
  }

  enhance();

  // 首页“换一批”会重新生成推荐卡，因此在 DOM 改变后补上交互。
  const observer = new MutationObserver(enhance);
  ['#area-grid','#recommend-grid','#destination-grid','#child-grid'].forEach(selector => {
    const node = document.querySelector(selector);
    if (node) observer.observe(node,{childList:true,subtree:false});
  });
})();
