(() => {
  const STORAGE_KEY = 'italy-travel-guide:wishes:v1';

  const defaults = [
    {id:'wish-sicily-sunset', text:'在西西里看一次海边日落', done:false, featured:true},
    {id:'wish-local-restaurant', text:'找一家没有游客的小餐馆', done:false, featured:false},
    {id:'wish-gondola', text:'坐一次贡多拉', done:false, featured:false}
  ];

  const homeButton = document.querySelector('#open-wishlist');
  const featuredText = document.querySelector('#featured-wish-text');
  const wishCount = document.querySelector('#wish-count');
  const dialog = document.querySelector('#wishlist-dialog');
  const form = document.querySelector('#wish-form');
  const input = document.querySelector('#wish-input');
  const items = document.querySelector('#wish-items');

  if (!homeButton || !featuredText || !wishCount || !dialog || !form || !input || !items) return;

  function cloneDefaults() {
    return defaults.map(item => ({...item}));
  }

  function loadWishes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneDefaults();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return cloneDefaults();
      return parsed
        .filter(item => item && typeof item.text === 'string')
        .map(item => ({
          id:String(item.id || `wish-${Date.now()}-${Math.random().toString(16).slice(2)}`),
          text:item.text.trim(),
          done:Boolean(item.done),
          featured:Boolean(item.featured)
        }))
        .filter(item => item.text);
    } catch {
      return cloneDefaults();
    }
  }

  let wishes = loadWishes();

  function ensureFeatured() {
    if (!wishes.length) return;

    const featured = wishes.find(item => item.featured && !item.done);
    if (featured) {
      wishes.forEach(item => { item.featured = item.id === featured.id; });
      return;
    }

    const next = wishes.find(item => !item.done) || wishes[0];
    wishes.forEach(item => { item.featured = item.id === next.id; });
  }

  function saveWishes() {
    ensureFeatured();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
    } catch {
      // GitHub Pages 原型在浏览器禁用本地存储时仍可继续使用当前会话。
    }
  }

  function getFeaturedWish() {
    ensureFeatured();
    return wishes.find(item => item.featured) || null;
  }

  function renderHome() {
    const featured = getFeaturedWish();
    const incomplete = wishes.filter(item => !item.done).length;

    if (!featured) {
      featuredText.textContent = '写下这趟意大利旅行最想完成的一件事';
      wishCount.textContent = '还没有心愿 · 点这里写下第一个 →';
      return;
    }

    featuredText.textContent = featured.text;
    if (wishes.length === 1) {
      wishCount.textContent = '1 个心愿 · 打开心愿本 →';
    } else if (incomplete === 0) {
      wishCount.textContent = `${wishes.length} 个心愿都完成啦 · 查看心愿本 →`;
    } else {
      wishCount.textContent = `${wishes.length} 个心愿 · ${incomplete} 个待完成 · 打开心愿本 →`;
    }
  }

  function makeActionButton(className, label, text, title) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', label);
    button.title = title || label;
    button.textContent = text;
    return button;
  }

  function renderDialog() {
    items.replaceChildren();

    if (!wishes.length) {
      const empty = document.createElement('div');
      empty.className = 'wish-empty';
      empty.textContent = '还没有小愿望。先写下一件这趟旅行最想完成的事吧。';
      items.appendChild(empty);
      return;
    }

    wishes.forEach(wish => {
      const row = document.createElement('div');
      row.className = 'wish-row';
      if (wish.featured) row.classList.add('is-featured');
      if (wish.done) row.classList.add('is-done');
      row.dataset.wishId = wish.id;

      const check = makeActionButton(
        'wish-check',
        wish.done ? '标记为未完成' : '标记为已完成',
        wish.done ? '✓' : '○',
        wish.done ? '重新设为未完成' : '完成这个愿望'
      );
      check.dataset.action = 'toggle-done';

      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.className = 'wish-text-input';
      textInput.maxLength = 80;
      textInput.value = wish.text;
      textInput.setAttribute('aria-label', '编辑小愿望');
      textInput.dataset.action = 'edit-text';

      const star = makeActionButton(
        'wish-star',
        wish.featured ? '当前主页心愿' : '设为主页最想完成的心愿',
        wish.featured ? '★' : '☆',
        wish.featured ? '现在展示在主页' : '放到主页上'
      );
      star.dataset.action = 'feature';

      const remove = makeActionButton('wish-delete', '删除这个愿望', '×', '删除');
      remove.dataset.action = 'delete';

      row.append(check, textInput, star, remove);
      items.appendChild(row);
    });
  }

  function renderAll() {
    ensureFeatured();
    renderHome();
    renderDialog();
  }

  function openWishlist() {
    renderDialog();
    if (dialog.showModal) dialog.showModal();
  }

  homeButton.addEventListener('click', openWishlist);

  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    wishes.push({
      id:`wish-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text,
      done:false,
      featured:wishes.length === 0
    });
    input.value = '';
    saveWishes();
    renderAll();
    input.focus();
  });

  items.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const row = button.closest('.wish-row');
    const wish = wishes.find(item => item.id === row?.dataset.wishId);
    if (!wish) return;

    if (button.dataset.action === 'toggle-done') {
      wish.done = !wish.done;
      if (wish.done && wish.featured) wish.featured = false;
    }

    if (button.dataset.action === 'feature') {
      wishes.forEach(item => { item.featured = item.id === wish.id; });
      wish.done = false;
    }

    if (button.dataset.action === 'delete') {
      wishes = wishes.filter(item => item.id !== wish.id);
    }

    saveWishes();
    renderAll();
  });

  items.addEventListener('change', event => {
    const textInput = event.target.closest('input[data-action="edit-text"]');
    if (!textInput) return;

    const row = textInput.closest('.wish-row');
    const wish = wishes.find(item => item.id === row?.dataset.wishId);
    if (!wish) return;

    const text = textInput.value.trim();
    if (!text) {
      textInput.value = wish.text;
      return;
    }

    wish.text = text;
    saveWishes();
    renderAll();
  });

  saveWishes();
  renderAll();
})();
