/* Progressive enhancement only. Native image URLs and every catalogue entry work without JS. */
(() => {
  'use strict';
  const body = document.body;
  if (!body.matches('.page-products,[class*="page-product-"]')) return;

  // Hand the guide search (q, same rules as guide-search.js) back to links leading to the list or another product.
  if (body.matches('[class*="page-product-"]')) {
    let query = '';
    try {
      query = (new URLSearchParams(location.search).get('q') ?? '').replace(/[\u0000-\u001F\u007F�]/g, '').trim();
    } catch (_) {}
    if (query.length > 120) query = query.slice(0, /[\uD800-\uDBFF]/.test(query[119]) ? 119 : 120).trim();
    if (query) {
      const encoded = new URLSearchParams({ q: query }).toString();
      for (const link of document.querySelectorAll('a[href]')) {
        const match = /^(products\.html|product-[^/?#]+\.html)(#.*)?$/.exec(link.getAttribute('href'));
        if (match) link.setAttribute('href', `${match[1]}?${encoded}${match[2] || ''}`);
      }
    }
  }

  // A local display preference, deliberately not persisted or transmitted.
  const controls = document.querySelector('.product-view-controls');
  if (controls) {
    const buttons = [...controls.querySelectorAll('[data-product-view]')];
    for (const button of buttons) button.addEventListener('click', () => {
      const view = button.dataset.productView;
      if (view !== 'gallery' && view !== 'compact') return;
      body.dataset.productView = view;
      for (const other of buttons) other.setAttribute('aria-pressed', String(other === button));
    });
    controls.hidden = false;
  }

  const anchors = [...document.querySelectorAll('.product-enlarge,.product-companion figure>a[href],.stage-example figure>a[href],.floor-atmosphere figure>a[href]')]
    .filter(a => a.querySelector('img'));
  if (!anchors.length || !window.HTMLDialogElement || typeof HTMLDialogElement.prototype.showModal !== 'function') return;

  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };
  const dialog = node('dialog', 'product-photo-dialog');
  dialog.setAttribute('aria-labelledby', 'product-photo-title');
  dialog.setAttribute('aria-describedby', 'product-photo-caption');
  const head = node('div', 'product-photo-dialog-head');
  const title = node('h2', '', '機材の画像'); title.id = 'product-photo-title';
  const close = node('button', 'product-photo-close lotus-control lotus-control--compact', '閉じる ×');
  close.type = 'button'; close.setAttribute('autofocus', '');
  const viewport = node('div', 'product-photo-viewport');
  viewport.tabIndex = 0; viewport.setAttribute('aria-label', '拡大画像。原寸表示ではスクロールできます。');
  const image = node('img', 'product-photo-full');
  const foot = node('div', 'product-photo-dialog-foot');
  const caption = node('p', '', ''); caption.id = 'product-photo-caption';
  const zoom = node('button', 'product-photo-zoom lotus-control lotus-control--secondary', '原寸で見る');
  zoom.type = 'button'; zoom.setAttribute('aria-pressed', 'false');
  const source = node('div', 'product-photo-source');
  const direct = node('a', 'product-photo-direct', '画像を直接開く ↗');
  const imageStatus = node('p', 'product-photo-status');
  imageStatus.setAttribute('role', 'status'); imageStatus.hidden = true;
  image.addEventListener('error', () => {
    imageStatus.textContent = '画像を読み込めませんでした。「画像を直接開く」から再表示できます。';
    imageStatus.hidden = false;
  });
  image.addEventListener('load', () => { imageStatus.textContent = ''; imageStatus.hidden = true; });
  head.append(title, close); viewport.append(image); foot.append(caption, zoom);
  dialog.append(head, viewport, foot, source, imageStatus); body.append(dialog);

  let opener = null;
  let previousOverflow = '';
  const setZoom = (actual) => {
    dialog.classList.toggle('is-actual', actual);
    zoom.setAttribute('aria-pressed', String(actual));
    zoom.textContent = actual ? '画面に合わせる' : '原寸で見る';
    viewport.scrollLeft = 0; viewport.scrollTop = 0;
  };
  const restore = () => {
    body.style.overflow = previousOverflow;
    setZoom(false);
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  };
  for (const anchor of anchors) {
    anchor.setAttribute('aria-haspopup', 'dialog');
    anchor.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (dialog.open) return;
      const original = anchor.querySelector('img');
      if (!original) return;
      const figure = anchor.closest('figure');
      const originalCaption = figure && figure.querySelector('figcaption');
      imageStatus.textContent = ''; imageStatus.hidden = true;
      direct.href = anchor.href;
      image.src = anchor.href; image.alt = original.alt || '';
      title.textContent = document.querySelector('h1').textContent;
      caption.textContent = originalCaption ? originalCaption.textContent : original.alt;
      source.replaceChildren();
      const credit = figure && figure.querySelector('.photo-credit');
      if (credit) source.append(credit.cloneNode(true));
      source.append(direct);
      setZoom(false);
      previousOverflow = body.style.overflow;
      try { dialog.showModal(); } catch (_) { return; }
      event.preventDefault(); opener = anchor; body.style.overflow = 'hidden';
      close.focus();
    });
  }
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', restore);
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  zoom.addEventListener('click', () => setZoom(!dialog.classList.contains('is-actual')));
})();
