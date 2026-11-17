(() => {
  'use strict';

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
          observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px' })
    : null;
  for (const section of document.querySelectorAll('.pt-reveal')) {
    if (observer) observer.observe(section);
    else section.classList.add('on');
  }

  const form = document.getElementById('pt-brief');
  if (!form) return;
  const send = document.getElementById('pt-send');
  const mailto = send.getAttribute('href');
  const rough = form.elements.period;
  const exact = form.elements.date;

  function updateInquiry() {
    const useDate = form.elements.timing.value === 'date';
    rough.hidden = rough.disabled = useDate;
    exact.hidden = exact.disabled = !useDate;
    const data = new FormData(form);
    const selectedDate = exact.value;
    const timing = useDate
      ? selectedDate.replace(/^(\d+)-0?(\d+)-0?(\d+)$/, '$1年$2月$3日')
      : rough.value.trim();
    const project = form.elements.project.value.trim();
    const fields = [
      ['案件名', project],
      ['希望時期', timing],
      ['ご依頼内容', data.getAll('mode').join('、')],
      ['担当してほしい工程', data.getAll('phase').join('、')],
      ['映像機材', data.getAll('gear').join('、')],
      ['会場', data.getAll('venue').join('、')],
      ['備考', form.elements.note.value.trim()]
    ];
    const subject = project ? '映像スタッフ・機材のご相談／' + project : '映像スタッフ・機材のご相談';
    const lines = fields.filter(([, value]) => value).map(([label, value]) => label + '：' + value);
    const body = ['LOTUS VISUAL ご担当者様', '', '映像スタッフ・機材について相談したく、ご連絡しました。', '', ...lines].join('\r\n');
    send.href = mailto + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('input', updateInquiry);
  form.addEventListener('change', updateInquiry);
  send.addEventListener('click', updateInquiry);
  window.addEventListener('pageshow', updateInquiry);
  updateInquiry();
})();
