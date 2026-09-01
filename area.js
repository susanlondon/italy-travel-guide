(() => {
  const data = window.ITALY_GUIDE_V010;
  const params = new URLSearchParams(location.search);
  const areaId = params.get('id') || 'A01';
  const area = data.area;
  if (!area || area.id !== areaId) return;

  document.title = `${area.name_zh}｜意游记`;
  document.querySelector('#area-title').textContent = area.name_zh;
  document.querySelector('#area-title-it').textContent = area.name_it;
  document.querySelector('#area-description').textContent = area.description_zh;
  document.querySelector('#breadcrumb-area').textContent = area.name_zh;

  const renderDestinations = data.destinations.filter(item => ['D001','D003','D004'].includes(item.id));
  const placeCounts = Object.fromEntries(data.destinations.map(dest => [dest.id, data.places.filter(place => place.destination_id === dest.id).length]));

  document.querySelector('#area-stats').innerHTML = `
    <span class="stat-chip"><b>${renderDestinations.length}</b> 个主要目的地</span>
    <span class="stat-chip"><b>${data.places.length}</b> 条景点 / 攻略数据</span>
    <span class="stat-chip"><b>1</b> 个罗马内部子区域</span>
  `;

  const cardArt = {D001:['R','城市主枢纽'],D003:['C','山城小镇'],D004:['O','翁布里亚小镇']};
  const summary = {
    D001:'罗马是这一区的主要旅行枢纽。表格中推荐 3–4 天，并包含独立的梵蒂冈观光子区域。',
    D003:'白露里治奥在表格中作为罗马关联小镇，推荐约半天。',
    D004:'奥尔维耶托在表格中作为罗马关联小镇，推荐约半天。'
  };

  document.querySelector('#destination-grid').innerHTML = renderDestinations.map(dest => {
    const [letter,label] = cardArt[dest.id] || ['•','目的地'];
    const children = data.destinations.filter(item => item.parent_id === dest.id && (dest.id !== 'D001' || item.id === 'D002'));
    const childrenPlaces = children.reduce((n, child) => n + (placeCounts[child.id] || 0), 0);
    const totalPlaces = (placeCounts[dest.id] || 0) + childrenPlaces;
    return `
      <article class="destination-card">
        <div class="destination-card-art"><span class="monogram">${letter}</span><span class="art-label">${label}</span></div>
        <div class="destination-card-body">
          <h3>${dest.name_zh}</h3>
          <p class="dest-original">${dest.name_it}</p>
          <div class="dest-metrics">
            ${dest.popularity ? `<span>人气 ${dest.popularity}/5</span>` : ''}
            ${dest.recommended_days ? `<span>推荐 ${dest.recommended_days} 天</span>` : ''}
            <span>${totalPlaces} 条景点 / 攻略</span>
          </div>
          <p>${summary[dest.id] || ''}</p>
          ${children.length ? `<p class="dest-child-note">包含子区域：${children.map(c => c.name_zh).join('、')}</p>` : ''}
          <a href="destination.html?id=${dest.id}">进入 ${dest.name_zh} →</a>
        </div>
      </article>
    `;
  }).join('');
})();
