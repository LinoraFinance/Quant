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

async function qxLoadEditableServices() {
  try {
    const res = await fetch('/content/services.json?ts=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    const services = Array.isArray(data.services) ? data.services : [];
    if (!services.length) return;

    const applyServiceToCard = (el, service, index) => {
      if (!el || !service) return;
      const title = el.querySelector('h2, h3');
      const code = el.querySelector('.badge, .service-code, [data-service-code]');
      const price = el.querySelector('.price');
      const desc = el.querySelector('p');
      const icon = el.querySelector('.icon');
      const btn = el.querySelector('button[data-service], a[data-service]');

      if (icon && /^\d+$/.test(icon.textContent.trim())) icon.textContent = String(index + 1).padStart(2, '0');
      if (title && service.title) title.textContent = service.title;
      if (code && service.code) code.textContent = service.code;
      if (price && service.price) price.textContent = service.price;
      if (desc && service.description) desc.textContent = service.description;
      if (btn && service.title) btn.setAttribute('data-service', service.title);
    };

    // Home page service cards: update only pricing/service cards, not feature cards.
    const homeCards = Array.from(document.querySelectorAll('.cards .card')).filter(card => card.querySelector('.price'));
    homeCards.forEach((card, i) => applyServiceToCard(card, services[i], i));

    // Services page premium service blocks.
    const serviceBlocks = Array.from(document.querySelectorAll('.service-lux'));
    serviceBlocks.forEach((block, i) => applyServiceToCard(block, services[i], i));
  } catch (e) {
    console.warn('Editable services were not loaded', e);
  }
}
qxLoadEditableServices();
