(() => {
  const data = window.ITALY_GUIDE_V010;
  const params = new URLSearchParams(location.search);
  const areaId = params.get('id') || 'A01';
  const area = data.area;
  if (!area || area.id !== areaId) return;

  const allowedDestinationIds = ['D001','D003','D004'];
  const renderDestinations = data.destinations.filter(item => allowedDestinationIds.includes(item.id));
  const placeCounts = Object.fromEntries(data.destinations.map(dest => [dest.id, data.places.filter(place => place.destination_id === dest.id).length]));
  const destinationById = Object.fromEntries(data.destinations.map(dest => [dest.id, dest]));

  document.title = `${area.name_zh}｜意游记`;
  document.querySelector('#area-title').textContent = area.name_zh;
  document.querySelector('#area-title-it').textContent = area.name_it;
  document.querySelector('#area-description').textContent = area.description_zh;
  document.querySelector('#breadcrumb-area').textContent = area.name_zh;

  document.querySelector('#area-stats').innerHTML = `
    <span class="stat-chip"><b>${renderDestinations.length}</b> 个主要目的地</span>
    <span class="stat-chip"><b>${data.places.length}</b> 条景点 / 攻略数据</span>
    <span class="stat-chip"><b>1</b> 个罗马内部子区域</span>
  `;

  const cardArt = {D001:['R','城市主枢纽'],D003:['C','天空之城'],D004:['O','翁布里亚小镇']};
  const summary = {
    D001:'历史、城市漫步与经典古迹最集中，也是这一大区的主要旅行枢纽。',
    D003:'悬崖上的古老小镇，适合从罗马出发安排半日到一日。',
    D004:'山城与艺术建筑兼具，适合半日到一日的轻量探索。'
  };
  const featuredRomeIds = ['P0009','P0005','P0007','P0004','P0003','P0011'];
  const icons = {
    museum_gallery:'◫', church_religious:'✦', castle_palace:'♜', square:'◇', landmark:'⌖', fountain:'≈',
    archaeological_site:'▧', park_garden:'♧', trail_nature:'⌁', market_shopping:'▤', bar_food:'♨', theatre_performance:'♪'
  };

  const destinationGrid = document.querySelector('#destination-grid');
  const focusHeader = document.querySelector('#focus-header');
  const focusContent = document.querySelector('#focus-content');
  const focusSection = document.querySelector('#destination-focus');

  destinationGrid.innerHTML = renderDestinations.map(dest => {
    const [letter,label] = cardArt[dest.id] || ['•','目的地'];
    const childPlaces = dest.id === 'D001' ? (placeCounts.D002 || 0) : 0;
    const totalPlaces = (placeCounts[dest.id] || 0) + childPlaces;
    return `
      <article class="destination-card destination-switch" data-destination-id="${dest.id}" data-card-interactive="true" role="button" tabindex="0" aria-pressed="false">
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
          ${dest.id === 'D001' ? '<p class="dest-child-note">包含罗马行程内的梵蒂冈内容</p>' : ''}
          <span class="destination-card-cta">在本页查看 ↓</span>
        </div>
      </article>
    `;
  }).join('');

  function renderPlaceCard(place) {
    const icon = icons[place.subtype] || (place.map_type === 'food' ? '♨' : place.map_type === 'experience' ? '✧' : '⌖');
    const tags = (place.tags_zh || []).slice(0,2);
    return `
      <article class="focus-place-card">
        <div class="focus-place-visual"><span class="focus-place-icon">${icon}</span></div>
        <div class="focus-place-body">
          <h4>${place.name_zh}</h4>
          <p class="original">${place.name_it || place.name_en || ''}</p>
          ${tags.length ? `<div class="focus-place-tags">${tags.map(tag => `<span>${tag}</span>`).join('')}</div>` : ''}
        </div>
      </article>
    `;
  }

  function renderFocus(destinationId) {
    const dest = destinationById[destinationId];
    if (!dest) return;

    const directPlaces = data.places.filter(place => place.destination_id === destinationId);
    let featured = destinationId === 'D001'
      ? featuredRomeIds.map(id => data.places.find(place => place.id === id)).filter(Boolean)
      : directPlaces.slice(0,6);
    if (!featured.length) featured = directPlaces.slice(0,6);

    const featuredIds = new Set(featured.map(place => place.id));
    const remaining = directPlaces.filter(place => !featuredIds.has(place.id));
    const totalForDisplay = directPlaces.length + (destinationId === 'D001' ? (placeCounts.D002 || 0) : 0);

    focusHeader.innerHTML = `
      <div>
        <p class="subpage-eyebrow">CURRENT DESTINATION</p>
        <div class="focus-heading-row"><h2>${dest.name_zh}</h2><em>${dest.name_it}</em></div>
        <p class="focus-intro">${summary[destinationId] || ''} 下方只展示当前目的地的内容，其他城市会保持隐藏。</p>
      </div>
      <div class="focus-meta">
        ${dest.popularity ? `<span>人气 <b>${dest.popularity}/5</b></span>` : ''}
        ${dest.recommended_days ? `<span>推荐 <b>${dest.recommended_days} 天</b></span>` : ''}
        <span><b>${totalForDisplay}</b> 条相关内容</span>
      </div>
    `;

    let html = `
      <div class="focus-block">
        <div class="focus-block-heading">
          <div><h3>${destinationId === 'D001' ? '第一次去，先看这些' : '这里的主要景点'}</h3><p>${destinationId === 'D001' ? '先保留 6 个最容易开始浏览的罗马景点，避免一进来就是长清单。' : '这个目的地内容量较小，因此直接展示核心条目。'}</p></div>
        </div>
        <div class="focus-place-grid">${featured.map(renderPlaceCard).join('')}</div>
      </div>
    `;

    if (destinationId === 'D001') {
      const vatican = destinationById.D002;
      const vaticanPlaces = data.places.filter(place => place.destination_id === 'D002');
      html += `
        <aside class="focus-subarea">
          <div class="focus-subarea-copy">
            <small>ROME · SUB AREA</small>
            <strong>${vatican?.name_zh || '梵蒂冈'} <em>${vatican?.name_it || ''}</em></strong>
            <p>作为罗马行程里的内部观光区域，只在这里轻量呈现，不再强制跳到单独城市页面。</p>
          </div>
          <div class="focus-subarea-places">
            ${vaticanPlaces.map(place => `<span class="focus-subarea-place"><b>${place.name_zh}</b>${place.name_it || ''}</span>`).join('')}
          </div>
        </aside>
      `;
    }

    if (remaining.length) {
      html += `
        <details class="focus-more">
          <summary>展开更多${dest.name_zh}内容（${remaining.length}）</summary>
          <div class="focus-place-grid">${remaining.map(renderPlaceCard).join('')}</div>
        </details>
      `;
    }

    if (!directPlaces.length) html = `<div class="focus-empty">这个目的地目前还没有可展示的景点条目。</div>`;
    focusContent.innerHTML = html;
  }

  function setPressedState(destinationId) {
    document.querySelectorAll('.destination-switch').forEach(card => {
      const selected = card.dataset.destinationId === destinationId;
      card.classList.toggle('is-selected', selected);
      card.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    document.querySelectorAll('[data-select-destination]').forEach(pin => {
      pin.classList.toggle('is-selected', pin.dataset.selectDestination === destinationId);
    });
  }

  function syncUrl(destinationId) {
    const next = new URL(location.href);
    next.searchParams.set('id', areaId);
    next.searchParams.set('view', destinationId);
    history.replaceState(null,'',next);
  }

  function selectDestination(destinationId, {scroll=false} = {}) {
    if (!allowedDestinationIds.includes(destinationId)) return;
    setPressedState(destinationId);
    renderFocus(destinationId);
    syncUrl(destinationId);
    if (scroll) {
      requestAnimationFrame(() => focusSection.scrollIntoView({behavior:'smooth',block:'start'}));
    }
  }

  function addPressFeedback(node) {
    node.addEventListener('pointerdown', () => node.classList.add('is-pressing'));
    ['pointerup','pointercancel','pointerleave'].forEach(type => node.addEventListener(type, () => node.classList.remove('is-pressing')));
  }

  document.querySelectorAll('.destination-switch').forEach(card => {
    addPressFeedback(card);
    const choose = () => selectDestination(card.dataset.destinationId,{scroll:true});
    card.addEventListener('click', choose);
    card.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      choose();
    });
  });

  document.querySelectorAll('[data-select-destination]').forEach(pin => {
    pin.addEventListener('click', () => selectDestination(pin.dataset.selectDestination,{scroll:true}));
  });

  const initialView = allowedDestinationIds.includes(params.get('view')) ? params.get('view') : 'D001';
  selectDestination(initialView,{scroll:false});
})();
