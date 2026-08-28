(() => {
  const data = window.ITALY_GUIDE_DATA;
  const areaGrid = document.querySelector('#area-grid');
  const recommendGrid = document.querySelector('#recommend-grid');
  const toast = document.querySelector('#toast');

  const areaAccent = {'A01':'rust','A02':'sage','A03':'teal','A04':'violet','A05':'ochre','A06':'navy'};

  function art(symbol, label, cls='') {
    return `<svg class="art ${cls}" role="img" aria-label="${label}"><use href="assets/illustrations.svg#${symbol}"></use></svg>`;
  }

  function renderAreas(filter='') {
    const q = filter.trim().toLowerCase();
    const rows = data.areas.filter(a => !q || [a.name,a.subtitle,a.desc].join(' ').toLowerCase().includes(q));
    areaGrid.innerHTML = rows.map(a => `
      <article class="area-card ${areaAccent[a.id]}" data-area-card="${a.id}">
        <div class="area-image-wrap">${art(a.art, `${a.name} 插画占位图`, 'area-art')}<span class="area-number">${a.n}</span></div>
        <div class="area-card-body"><h3>${a.name}</h3><p>${a.desc}</p><button type="button" data-area-open="${a.id}">浏览该区域 →</button></div>
      </article>`).join('') || `<div class="empty-state">暂时没有匹配的大区域，试试搜索城市或景点。</div>`;
  }

  function renderRecommendations(offset=0) {
    const picks = Array.from({length:4}, (_,i)=>data.destinations[(offset+i)%data.destinations.length]);
    recommendGrid.innerHTML = picks.map(d => `
      <article class="recommend-card">
        ${art(d.art, `${d.name} 插画占位图`, 'reco-art')}
        <div><h3>${d.name}</h3><p>${d.reason}</p><span>推荐 ${d.days} 天</span></div>
      </article>`).join('');
  }

  const calendar = document.querySelector('#calendar-days');
  const start = new Date(Date.UTC(2026, 8, 18));
  const labels = ['罗马','罗马','罗马','佛罗伦萨','','','','','','','','','',''];
  const weather = ['☀','☀','🌤','☁','☀','🌦','☀','☀','☁','☀','🌤','☀','☀','🌤'];
  calendar.innerHTML = Array.from({length:14}, (_,i) => {
    const d = new Date(start); d.setUTCDate(start.getUTCDate()+i);
    const mm = String(d.getUTCMonth()+1).padStart(2,'0'); const dd = String(d.getUTCDate()).padStart(2,'0');
    return `<button type="button" class="day-cell" data-planner-day="${i}"><b>${mm}.${dd}</b><span>${weather[i]}</span><small>${labels[i] || '未安排'}</small></button>`;
  }).join('');

  let recoOffset = 0;
  renderAreas(); renderRecommendations();

  function showToast(message) {
    toast.textContent = message; toast.classList.add('show');
    clearTimeout(showToast.t); showToast.t = setTimeout(()=>toast.classList.remove('show'), 2400);
  }

  function openDialog(id) {
    const dialog = document.getElementById(id); if (!dialog) return;
    dialog.showModal();
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-toast]'); if (t) showToast(t.dataset.toast);
    const areaBtn = e.target.closest('[data-area-open]');
    if (areaBtn) {
      const a = data.areas.find(x=>x.id===areaBtn.dataset.areaOpen);
      showToast(`${a.name} 子页面将在下一阶段接入`);
    }
    const hotspot = e.target.closest('[data-area]');
    if (hotspot) document.querySelector(`[data-area-card="${hotspot.dataset.area}"]`)?.scrollIntoView({behavior:'smooth', block:'center'});
    if (e.target.closest('[data-planner-day]')) openDialog('planner-dialog');
    const close = e.target.closest('[data-close-dialog]'); if (close) document.getElementById(close.dataset.closeDialog)?.close();
  });

  document.querySelector('#open-planner').addEventListener('click', ()=>openDialog('planner-dialog'));
  document.querySelector('#emergency-card').addEventListener('click', ()=>openDialog('emergency-dialog'));
  document.querySelector('#emergency-shortcut').addEventListener('click', ()=>openDialog('emergency-dialog'));

  document.querySelector('#shuffle-reco').addEventListener('click', () => { recoOffset = (recoOffset+3)%data.destinations.length; renderRecommendations(recoOffset); });

  const input = document.querySelector('#site-search');
  function search() {
    const q=input.value.trim(); renderAreas(q);
    if(q) showToast(`已按“${q}”筛选首页区域；完整全站搜索下一阶段接入`);
  }
  document.querySelector('#search-button').addEventListener('click', search);
  input.addEventListener('keydown', e=>{ if(e.key==='Enter') search(); });
  document.querySelectorAll('.hot-search button').forEach(b=>b.addEventListener('click',()=>{input.value=b.textContent;search();}));

  const encouragements = ['慢慢走，世界会温柔以待。','今天不用赶路，也可以好好旅行。','给行程留一点空白，也给自己留一点惊喜。','看得深一点，比去得多一点更重要。'];
  let encouragementIndex=0;
  document.querySelector('#new-encouragement').addEventListener('click',()=>{
    encouragementIndex=(encouragementIndex+1)%encouragements.length;
    document.querySelector('#encouragement-text').textContent=encouragements[encouragementIndex];
  });
})();
