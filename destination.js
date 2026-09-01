(() => {
  const data = window.ITALY_GUIDE_V010;
  const params = new URLSearchParams(location.search);
  const id = params.get('id') || 'D001';
  const destination = data.destinations.find(item => item.id === id);
  if (!destination) {
    location.href = 'area.html?id=A01';
    return;
  }

  const typeLabels = {city:'城市',town:'小镇',area:'区域',nature:'自然 / 户外'};
  const mapLabels = {attraction:'景点',food:'美食',experience:'体验',transport:'交通',parking:'停车'};
  const icons = {
    museum_gallery:'◫', church_religious:'✦', castle_palace:'♜', square:'◇', landmark:'⌖', fountain:'≈',
    archaeological_site:'▧', park_garden:'♧', trail_nature:'⌁', market_shopping:'▤', bar_food:'♨', theatre_performance:'♪'
  };

  const directPlaces = data.places.filter(place => place.destination_id === id);
  const childDestinations = data.destinations.filter(item => item.parent_id === id && (id !== 'D001' || item.id === 'D002'));

  document.title = `${destination.name_zh}｜意游记`;
  document.querySelector('#destination-title').textContent = destination.name_zh;
  document.querySelector('#destination-original').textContent = destination.name_it;
  document.querySelector('#destination-type').textContent = `${typeLabels[destination.type] || '目的地'} · DESTINATION`;
  document.querySelector('#breadcrumb-destination').textContent = destination.name_zh;
  document.querySelector('#postcard-name').textContent = destination.name_en.toUpperCase();
  document.querySelector('#footer-destination').textContent = `${destination.name_zh} · ${destination.name_it}`;

  const meta = [];
  if (destination.popularity) meta.push(`<span><b>${destination.popularity}/5</b> 人气</span>`);
  if (destination.recommended_days) meta.push(`<span>推荐 <b>${destination.recommended_days}</b> 天</span>`);
  meta.push(`<span><b>${directPlaces.length}</b> 条直属景点 / 攻略</span>`);
  if (childDestinations.length) meta.push(`<span><b>${childDestinations.length}</b> 个子区域</span>`);
  document.querySelector('#destination-meta').innerHTML = meta.join('');
  document.querySelector('#destination-note').textContent = destination.notes_zh || '';

  if (childDestinations.length) {
    const section = document.querySelector('#child-destinations');
    section.hidden = false;
    document.querySelector('#child-grid').innerHTML = childDestinations.map(child => {
      const count = data.places.filter(place => place.destination_id === child.id).length;
      return `<a class="child-card" href="destination.html?id=${child.id}"><div><strong>${child.name_zh}</strong><small>${child.name_it} · ${count} 个条目</small></div><span>进入 →</span></a>`;
    }).join('');
  }

  const availableTypes = [...new Set(directPlaces.map(place => place.map_type))].filter(Boolean);
  const filterOrder = ['attraction','food','experience','transport','parking'];
  const filters = ['all', ...filterOrder.filter(type => availableTypes.includes(type))];
  const filterNode = document.querySelector('#place-filters');
  filterNode.innerHTML = filters.map(type => `<button type="button" class="${type === 'all' ? 'active' : ''}" data-filter="${type}">${type === 'all' ? '全部' : mapLabels[type]}</button>`).join('');

  const placeGrid = document.querySelector('#place-grid');
  function renderPlaces(filter='all') {
    const rows = filter === 'all' ? directPlaces : directPlaces.filter(place => place.map_type === filter);
    document.querySelector('#places-count').textContent = `${destination.name_zh} 当前从表格读取到 ${rows.length} 条${filter === 'all' ? '' : `“${mapLabels[filter]}”`}内容。`;
    if (!rows.length) {
      placeGrid.innerHTML = `<div class="place-empty">这个分类目前在表格里还没有条目。</div>`;
      return;
    }
    placeGrid.innerHTML = rows.map(place => {
      const tags = (place.tags_zh || []).slice(0,3);
      const icon = icons[place.subtype] || (place.map_type === 'food' ? '♨' : place.map_type === 'experience' ? '✧' : '⌖');
      const original = place.name_it || place.name_en || '';
      return `
        <article class="place-card">
          <div class="place-card-top"><span class="place-card-icon">${icon}</span><span class="place-kind">${mapLabels[place.map_type] || '攻略'}</span></div>
          <div class="place-card-body">
            <h3>${place.name_zh}</h3>
            <p class="place-original">${original}</p>
            ${tags.length ? `<div class="tag-row">${tags.map(tag => `<span>${tag}</span>`).join('')}</div>` : ''}
            ${place.address ? `<p class="place-address">${place.address}</p>` : ''}
            <div class="place-actions">
              ${place.official_url ? `<a href="${place.official_url}" target="_blank" rel="noopener">官方信息 ↗</a>` : '<span></span>'}
              ${place.source_page ? `<small>攻略资料 P${place.source_page}</small>` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  filterNode.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    filterNode.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
    renderPlaces(button.dataset.filter);
  });

  renderPlaces();
})();
