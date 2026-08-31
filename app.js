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

  function renderPracticalModule() {
    const practical = document.querySelector('#practical');
    if (!practical) return;

    practical.classList.add('compact-practical');
    practical.innerHTML = `
      <div class="panel-heading compact">
        <div>
          <h2>实用攻略入口</h2>
          <p>出发前、转场时、需要帮助时，都能从这里快速找到对应攻略。</p>
        </div>
      </div>
      <div class="practical-grid practical-grid-four">
        <button type="button" data-toast="后续子页面会整理意大利开车、停车、ZTL、自驾与无人机等通用旅行须知">
          <span>🧭</span><strong>出发前看看</strong><small>开车、停车、ZTL、无人机等</small>
        </button>
        <button type="button" data-toast="后续会做一张意大利交通图，展示大区与城市之间怎么走、使用什么交通以及大致时间">
          <span>🚆</span><strong>下一站怎么走</strong><small>城市之间的交通与时间</small>
        </button>
        <button type="button" id="emergency-shortcut">
          <span>☎</span><strong>旅途求助</strong><small>报警、急救与使领馆信息</small>
        </button>
        <button type="button" data-toast="我的行程本后续支持自己添加航班、车票、船票以及个人行程信息">
          <span>📔</span><strong>我的行程本</strong><small>记录航班、车票与个人行程</small>
        </button>
      </div>`;

    const emergencyDialog = document.querySelector('#emergency-dialog');
    if (emergencyDialog) {
      const title = emergencyDialog.querySelector('h2');
      const intro = emergencyDialog.querySelector('p.muted');
      const rows = emergencyDialog.querySelectorAll('.emergency-list div');
      if (title) title.textContent = '旅途求助';
      if (intro) intro.textContent = '这里会集中放旅行中真正需要快速找到的应急信息，包括报警、急救、中国驻意大利使领馆及其他求助方式。';
      if (rows[1]) {
        const strong = rows[1].querySelector('strong');
        const span = rows[1].querySelector('span');
        if (strong) strong.textContent = '中国驻意大利使领馆 / 其他应急联系方式';
        if (span) span.textContent = '后续从攻略数据接入';
      }
    }
  }

  function addPrototypeStyles() {
    if (document.querySelector('#prototype-v03-style')) return;
    const style = document.createElement('style');
    style.id = 'prototype-v03-style';
    style.textContent = `
      #practical.compact-practical{
        width:min(820px,64%);
        margin:16px auto 0 0;
        padding:14px 16px 15px;
      }
      #practical.compact-practical .panel-heading h2{font-size:20px}
      #practical.compact-practical .panel-heading p{max-width:620px}
      #practical .practical-grid-four{
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:8px;
        margin-top:11px;
      }
      #practical .practical-grid-four button{
        min-height:102px;
        padding:11px 10px;
        background:rgba(255,250,243,.86);
      }
      #practical .practical-grid-four span{font-size:22px}
      #practical .practical-grid-four strong{font-size:14px;margin-top:2px}
      #practical .practical-grid-four small{line-height:1.45}

      #guidebook .guidebook-body{
        display:grid;
        grid-template-columns:minmax(0,1fr) 190px;
        gap:13px;
        align-items:stretch;
        margin-top:14px;
      }
      #guidebook .guidebook-grid{
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:9px;
        margin-top:0;
      }
      #guidebook .notebook-card{
        min-height:110px;
      }
      #guidebook .notebook-card.next-stop span{color:#c48135}
      #guidebook .wish-note{
        position:relative;
        align-self:stretch;
        padding:22px 15px 15px;
        background:linear-gradient(175deg,#f5e7c9,#efe0bd);
        border:1px solid #d2b889;
        box-shadow:0 8px 18px rgba(96,70,40,.10);
        transform:rotate(1.2deg);
        clip-path:polygon(2% 1%,98% 0,100% 95%,94% 100%,5% 98%,0 7%);
      }
      #guidebook .wish-note::after{
        content:"";
        position:absolute;
        inset:7px;
        border:1px dashed rgba(132,95,56,.22);
        pointer-events:none;
      }
      #guidebook .wish-tape{
        position:absolute;
        width:68px;
        height:18px;
        top:-8px;
        left:50%;
        transform:translateX(-50%) rotate(-3deg);
        background:rgba(199,172,118,.55);
        box-shadow:0 2px 3px rgba(80,60,30,.08);
      }
      #guidebook .wish-eyebrow{
        margin:0 0 10px;
        font:700 17px "STKaiti","KaiTi",serif;
        color:#6d4b36;
      }
      #guidebook .wish-note ul{
        margin:0;
        padding:0 0 0 18px;
        color:#6d5b4b;
        font-size:11px;
        line-height:1.75;
      }
      #guidebook .wish-note button{
        position:relative;
        z-index:1;
        border:0;
        background:transparent;
        color:#9a5a3e;
        padding:12px 0 0;
        cursor:pointer;
        font:600 12px "STKaiti","KaiTi",serif;
      }
      #guidebook .wish-note button:hover{color:#b55f3f}
      .footer #footer-encouragement{
        display:block;
        font-size:20px;
        color:#725842;
      }
      @media(max-width:1080px){
        #practical.compact-practical{width:100%}
        #guidebook .guidebook-body{grid-template-columns:minmax(0,1fr) 220px}
      }
      @media(max-width:720px){
        #practical .practical-grid-four{grid-template-columns:repeat(2,minmax(0,1fr))}
        #guidebook .guidebook-body{grid-template-columns:1fr}
        #guidebook .wish-note{min-height:165px;transform:rotate(.5deg)}
      }
      @media(max-width:420px){
        #practical .practical-grid-four{grid-template-columns:1fr}
        #guidebook .guidebook-grid{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(style);
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
  renderAreas();
  renderRecommendations();
  renderPracticalModule();
  addPrototypeStyles();

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

  document.querySelector('#open-planner')?.addEventListener('click', ()=>openDialog('planner-dialog'));
  document.querySelector('#emergency-shortcut')?.addEventListener('click', ()=>openDialog('emergency-dialog'));
  document.querySelector('#add-wish')?.addEventListener('click', ()=>showToast('意大利小愿望：下一阶段会支持自己新增、勾选与保留已完成的小愿望'));

  document.querySelector('#shuffle-reco')?.addEventListener('click', () => { recoOffset = (recoOffset+3)%data.destinations.length; renderRecommendations(recoOffset); });

  const input = document.querySelector('#site-search');
  function search() {
    const q=input.value.trim(); renderAreas(q);
    if(q) showToast(`已按“${q}”筛选首页区域；完整全站搜索下一阶段接入`);
  }
  document.querySelector('#search-button')?.addEventListener('click', search);
  input?.addEventListener('keydown', e=>{ if(e.key==='Enter') search(); });
  document.querySelectorAll('.hot-search button').forEach(b=>b.addEventListener('click',()=>{input.value=b.textContent;search();}));

  const encouragements = [
    '慢慢走，世界会温柔以待。 ♡',
    '今天不用赶路，也可以好好旅行。',
    '给行程留一点空白，也给自己留一点惊喜。',
    '看得深一点，比去得多一点更重要。',
    '每一次旅行，都是生活送给自己的礼物。'
  ];
  const encouragement = document.querySelector('#footer-encouragement');
  if (encouragement) {
    encouragement.textContent = encouragements[Math.floor(Math.random()*encouragements.length)];
  }
})();
