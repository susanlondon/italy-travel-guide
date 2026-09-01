(() => {
  const STORAGE_KEY = 'italy-travel-guide:wishes:v1';
  const HOME_WISH_LIMIT = 3;

  const defaults = [
    {id:'wish-sicily-sunset', text:'在西西里看一次海边日落', done:false, featured:true},
    {id:'wish-local-restaurant', text:'找一家没有游客的小餐馆', done:false, featured:true},
    {id:'wish-gondola', text:'坐一次贡多拉', done:false, featured:true}
  ];

  const homeButton = document.querySelector('#open-wishlist');
  const homeList = document.querySelector('#home-wish-list');
  const wishCount = document.querySelector('#wish-count');
  const dialog = document.querySelector('#wishlist-dialog');
  const form = document.querySelector('#wish-form');
  const input = document.querySelector('#wish-input');
  const items = document.querySelector('#wish-items');

  if (!homeButton || !homeList || !wishCount || !dialog || !form || !input || !items) return;

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

  function ensureHomepageSelection(skipId='') {
    wishes.forEach(item => {
      if (item.done) item.featured = false;
    });

    const selected = wishes.filter(item => item.featured && !item.done);
    selected.slice(HOME_WISH_LIMIT).forEach(item => { item.featured = false; });

    let count = wishes.filter(item => item.featured && !item.done).length;
    if (count >= HOME_WISH_LIMIT) return;

    const candidates = wishes.filter(item => !item.done && !item.featured && item.id !== skipId);
    for (const item of candidates) {
      item.featured = true;
      count += 1;
      if (count >= HOME_WISH_LIMIT) return;
    }

    if (count < HOME_WISH_LIMIT && skipId) {
      const skipped = wishes.find(item => item.id === skipId && !item.done && !item.featured);
      if (skipped) skipped.featured = true;
    }
  }

  function saveWishes(skipId='') {
    ensureHomepageSelection(skipId);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
    } catch {
      // 如果浏览器禁用本地存储，原型仍可在当前会话继续操作。
    }
  }

  function getHomepageWishes() {
    ensureHomepageSelection();
    return wishes.filter(item => item.featured && !item.done).slice(0, HOME_WISH_LIMIT);
  }

  function renderHome() {
    const featured = getHomepageWishes();
    const incomplete = wishes.filter(item => !item.done).length;

    homeList.replaceChildren();

    if (!featured.length) {
      const empty = document.createElement('span');
      empty.className = 'home-wish-item';
      empty.textContent = '写下这趟意大利旅行最想完成的事';
      homeList.appendChild(empty);
      wishCount.textContent = '还没有心愿 · 点这里写下第一个 →';
      return;
    }

    featured.forEach(wish => {
      const line = document.createElement('span');
      line.className = 'home-wish-item';
      line.textContent = wish.text;
      homeList.appendChild(line);
    });

    const shown = featured.length;
    if (incomplete === 0) {
      wishCount.textContent = `${wishes.length} 个心愿都完成啦 · 查看心愿本 →`;
    } else {
      wishCount.textContent = `主页展示 ${shown} 条 · 共 ${wishes.length} 个心愿 · 打开心愿本 →`;
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
        wish.featured ? '已选为主页心愿' : '选为主页最想完成的心愿',
        wish.featured ? '★' : '☆',
        wish.featured ? '正在主页展示，点击可换出' : '放到主页上（最多展示3条）'
      );
      star.dataset.action = 'feature';

      const remove = makeActionButton('wish-delete', '删除这个愿望', '×', '删除');
      remove.dataset.action = 'delete';

      row.append(check, textInput, star, remove);
      items.appendChild(row);
    });
  }

  function renderAll() {
    ensureHomepageSelection();
    renderHome();
    renderDialog();
  }

  function openWishlist() {
    renderDialog();
    if (dialog.showModal) dialog.showModal();
  }

  homeButton.addEventListener('click', openWishlist);
  homeButton.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openWishlist();
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    wishes.push({
      id:`wish-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text,
      done:false,
      featured:false
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
      if (wish.done) wish.featured = false;
      saveWishes(wish.done ? wish.id : '');
    }

    if (button.dataset.action === 'feature') {
      if (wish.featured) {
        wish.featured = false;
        saveWishes(wish.id);
      } else {
        const selected = wishes.filter(item => item.featured && !item.done);
        if (selected.length >= HOME_WISH_LIMIT) {
          selected[selected.length - 1].featured = false;
        }
        wish.featured = true;
        wish.done = false;
        saveWishes();
      }
    }

    if (button.dataset.action === 'delete') {
      wishes = wishes.filter(item => item.id !== wish.id);
      saveWishes();
    }

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