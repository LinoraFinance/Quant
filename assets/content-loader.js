async function qxLoadEditableContent() {
  try {
    const res = await fetch('/content/site.json', { cache: 'no-store' });
    if (!res.ok) return;
    const site = await res.json();

    const setText = (selector, value) => {
      if (!value) return;
      document.querySelectorAll(selector).forEach(el => { el.textContent = value; });
    };

    setText('[data-company-name]', site.company_name);
    setText('[data-domain]', site.domain);
    setText('[data-site-phone]', site.phone);
    setText('[data-site-email]', site.email);
    setText('[data-site-address]', site.address);
    setText('[data-site-siren]', site.siren);
    setText('[data-hero-kicker]', site.hero_kicker);
    setText('[data-hero-line-1]', site.hero_line_1);
    setText('[data-hero-line-2]', site.hero_line_2);
    setText('[data-hero-line-3]', site.hero_line_3);
    setText('[data-hero-subtitle]', site.hero_subtitle);

    document.querySelectorAll('a[data-site-email]').forEach(a => { a.href = 'mailto:' + site.email; });
    document.querySelectorAll('a[data-site-phone]').forEach(a => { a.href = 'tel:' + site.phone.replace(/\s+/g, ''); });
  } catch (e) {
    console.warn('Editable content was not loaded', e);
  }
}
qxLoadEditableContent();
