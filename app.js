(() => {
  const data = window.ITALY_GUIDE_DATA;
  const areaGrid = document.querySelector('#area-grid');
  const recommendGrid = document.querySelector('#recommend-grid');
  const toast = document.querySelector('#toast');

  const areaAccent = {
    A01:'rust',
    A02:'sage',
    A03:'teal',
    A04:'violet',
    A05:'ochre',
    A06:'navy'
  };

  function art(symbol, label, cls='') {
    return `<svg class="art ${cls}" role="img" aria-label="${label}"><use href="assets/illustrations.svg#${symbol}"></use></svg>`;
  }

  function renderAreas(filter='') {
    const q = filter.trim().toLowerCase();
    const rows = data.areas.filter(area => !q || [area.name, area.subtitle, area.desc].join(' ').toLowerCase().includes(q));

    areaGrid.innerHTML = rows.map(area => `
      <article class="area-card ${areaAccent[area.id]}" data-area-card="${area.id}">
        <div class="area-image-wrap">
          ${art(area.art, `${area.name} 插画占位图`, 'area-art')}
          <span class="area-number">${area.n}</span>
        </div>
        <div class="area-card-body">
          <h3>${area.name}</h3>
          <p>${area.desc}</p>
          <button type="button" data-area-open="${area.id}">浏览该区域 →</button>
        </div>
      </article>
    `).join('') || `<div class="empty-state">暂时没有匹配的大区域，试试搜索城市或景点。</div>`;
  }

  function renderRecommendations(offset=0) {
    const picks = Array.from({length:4}, (_, index) => data.destinations[(offset + index) % data.destinations.length]);

    recommendGrid.innerHTML = picks.map(destination => `
      <article class="recommend-card">
        ${art(destination.art, `${destination.name} 插画占位图`, 'reco-art')}
        <div>
          <h3>${destination.name}</h3>
          <p>${destination.reason}</p>
          <span>推荐 ${destination.days} 天</span>
        </div>
      </article>
    `).join('');
  }

  function renderCalendar() {
    const calendar = document.querySelector('#calendar-days');
    if (!calendar) return;

    const start = new Date(Date.UTC(2026, 8, 18));
    const labels = ['罗马','罗马','罗马','佛罗伦萨','','','','','','','','','',''];
    const weather = ['☀','☀','🌤','☁','☀','🌦','☀','☀','☁','☀','🌤','☀','☀','🌤'];

    calendar.innerHTML = Array.from({length:14}, (_, index) => {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + index);
      const month = String(date.getUTCMonth() + 1).padStart(2,'0');
      const day = String(date.getUTCDate()).padStart(2,'0');

      return `<button type="button" class="day-cell" data-planner-day="${index}">
        <b>${month}.${day}</b>
        <span>${weather[index]}</span>
        <small>${labels[index] || '未安排'}</small>
      </button>`;
    }).join('');
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function openDialog(id) {
    const dialog = document.getElementById(id);
    if (dialog?.showModal) dialog.showModal();
  }

  let recommendationOffset = 0;
  renderAreas();
  renderRecommendations();
  renderCalendar();

  document.addEventListener('click', event => {
    const toastTarget = event.target.closest('[data-toast]');
    if (toastTarget) showToast(toastTarget.dataset.toast);

    const areaButton = event.target.closest('[data-area-open]');
    if (areaButton) {
      const area = data.areas.find(item => item.id === areaButton.dataset.areaOpen);
      if (area) showToast(`${area.name} 子页面将在下一阶段接入`);
    }

    const hotspot = event.target.closest('[data-area]');
    if (hotspot) {
      document.querySelector(`[data-area-card="${hotspot.dataset.area}"]`)?.scrollIntoView({behavior:'smooth', block:'center'});
    }

    if (event.target.closest('[data-planner-day]')) openDialog('planner-dialog');

    const closeButton = event.target.closest('[data-close-dialog]');
    if (closeButton) document.getElementById(closeButton.dataset.closeDialog)?.close();
  });

  document.querySelector('#open-planner')?.addEventListener('click', () => openDialog('planner-dialog'));
  document.querySelector('#emergency-shortcut')?.addEventListener('click', () => openDialog('emergency-dialog'));
  document.querySelector('#add-wish')?.addEventListener('click', () => {
    showToast('意大利小愿望：下一阶段会支持新增、勾选和保留已完成的小愿望');
  });

  document.querySelector('#shuffle-reco')?.addEventListener('click', () => {
    recommendationOffset = (recommendationOffset + 3) % data.destinations.length;
    renderRecommendations(recommendationOffset);
  });

  const input = document.querySelector('#site-search');
  function search() {
    const query = input?.value.trim() || '';
    renderAreas(query);
    if (query) showToast(`已按“${query}”筛选首页区域；完整全站搜索下一阶段接入`);
  }

  document.querySelector('#search-button')?.addEventListener('click', search);
  input?.addEventListener('keydown', event => {
    if (event.key === 'Enter') search();
  });
  document.querySelectorAll('.hot-search button').forEach(button => {
    button.addEventListener('click', () => {
      if (!input) return;
      input.value = button.textContent;
      search();
    });
  });

  const encouragements = [
    '慢慢走，世界会温柔以待。',
    '今天不用赶路，也可以好好旅行。',
    '给行程留一点空白，也给自己留一点惊喜。',
    '看得深一点，比去得多一点更重要。',
    '每一次旅行，都是生活送给自己的礼物。'
  ];
  let encouragementIndex = 0;
  document.querySelector('#new-encouragement')?.addEventListener('click', () => {
    encouragementIndex = (encouragementIndex + 1) % encouragements.length;
    const node = document.querySelector('#encouragement-text');
    if (node) node.textContent = encouragements[encouragementIndex];
  });
})();
