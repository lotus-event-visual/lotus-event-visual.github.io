(() => {
  const form = document.getElementById('ir-inquiry');
  const notes = document.getElementById('ir-notes');
  const send = document.getElementById('ir-send');
  const base = send.getAttribute('href');
  const choices = Array.from(form.querySelectorAll('input[name="work"]'));
  const selectedLine = document.getElementById('ir-selected');
  const stickyLine = document.getElementById('ir-sticky-label');

  function update() {
    const selected = choices.filter(choice => choice.checked);
    const names = selected.map(choice => choice.value);
    selectedLine.textContent = names.length ? '選んだメニュー（' + names.length + '件）：' + names.join('、') : 'メニューが決まっていなくてもご相談いただけます。';
    stickyLine.textContent = names.length ? names.length + '件のメニューを選択中' : '内装工事のお問い合わせ';
    const lines = ['内装工事について相談したいです。'];
    if (names.length === choices.length && names.length) {
      lines.push('希望メニュー：掲載中の全メニュー');
    } else if (names.length) {
      lines.push('希望メニュー：' + names.join('、'));
    }
    if (notes.value.trim()) lines.push('備考：' + notes.value.trim());
    send.href = base + '&body=' + encodeURIComponent(lines.join('\r\n\r\n'));
    for (const group of form.querySelectorAll('.ir-group')) {
      const count = group.querySelectorAll('input:checked').length;
      group.querySelector('summary small').textContent = count ? count + '件選択中' : group.dataset.size + '件';
    }
  }
  form.addEventListener('input', update);
  window.addEventListener('pageshow', update);
  send.addEventListener('click', update);
  update();
})();
