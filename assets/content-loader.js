
(function(){
  const QX_CACHE = '?v=' + Date.now();
  const pageName = (location.pathname.split('/').pop() || 'index.html').replace('.html','') || 'index';
  const normalizedPage = pageName === '' ? 'index' : pageName;

  async function fetchJson(path){
    const res = await fetch(path + QX_CACHE, {cache:'no-store'});
    if(!res.ok) throw new Error(path + ' not found');
    return res.json();
  }

  function insertStyle(id, css){
    if(!css || !String(css).trim()) return;
    let tag=document.getElementById(id);
    if(!tag){ tag=document.createElement('style'); tag.id=id; document.head.appendChild(tag); }
    tag.textContent=css;
  }

  function insertHtml(position, id, html){
    if(!html || !String(html).trim()) return;
    const old=document.getElementById(id); if(old) old.remove();
    const wrap=document.createElement('div'); wrap.id=id; wrap.innerHTML=html;
    if(position==='head') document.head.appendChild(wrap);
    else if(position==='bodyStart') document.body.prepend(wrap);
    else document.body.appendChild(wrap);
  }

  function applyCssVars(theme){
    if(!theme) return;
    const css=[];
    if(theme.accent_color) css.push(`--accent:${theme.accent_color}`);
    if(theme.accent_soft) css.push(`--accent-soft:${theme.accent_soft}`);
    if(theme.background_color) css.push(`--bg:${theme.background_color}`);
    if(theme.text_color) css.push(`--text:${theme.text_color}`);
    if(theme.muted_text_color) css.push(`--muted:${theme.muted_text_color}`);
    if(theme.card_radius) css.push(`--radius:${theme.card_radius}`);
    if(css.length) document.documentElement.setAttribute('style',(document.documentElement.getAttribute('style')||'') + ';' + css.join(';'));
    if(theme.matrix_enabled === false){ const c=document.getElementById('matrixCanvas'); if(c) c.style.display='none'; }
    if(theme.matrix_opacity !== undefined){ const c=document.getElementById('matrixCanvas'); if(c) c.style.opacity=String(theme.matrix_opacity); }
    if(theme.preloader_enabled === false){ const p=document.getElementById('qx-preloader'); if(p) p.remove(); }
    if(theme.cursor_enabled === false){ document.body.classList.add('qx-no-custom-cursor'); }
    if(theme.ui_sounds_enabled === false){ document.body.classList.add('qx-no-ui-sounds'); }
    insertStyle('qx-theme-custom-css', theme.custom_css || '');
  }

  function applyText(selector, value){
    if(value === undefined || value === null) return;
    document.querySelectorAll(selector).forEach(el=>{ el.textContent = value; });
  }

  function renderHeader(global){
    if(global.header_html_enabled && global.header_html){
      const current=document.querySelector('header');
      if(current) current.outerHTML=global.header_html;
      return;
    }
    const topbar=document.querySelector('.topbar-signal-inner');
    if(topbar && Array.isArray(global.topbar_items)){
      topbar.innerHTML = global.topbar_items.map(item=>`<span>${(item && item.text) ? item.text : item}</span>`).join('');
    }
    document.querySelectorAll('.brand-symbol').forEach(img=>{ if(global.logo_symbol) img.src=global.logo_symbol; });
    document.querySelectorAll('.brand-wordmark').forEach(img=>{ if(global.logo_wordmark) img.src=global.logo_wordmark; });
    const nav=document.querySelector('.navlinks');
    if(nav && Array.isArray(global.navigation)){
      nav.innerHTML=global.navigation.map(link=>`<a class="${link.style==='button'?'btn btn-cta-hacker':''}" href="${link.url||'#'}">${link.label||'Link'}</a>`).join('');
    }
  }

  function renderFooter(global){
    if(global.footer_html_enabled && global.footer_html){
      const current=document.querySelector('footer');
      if(current) current.outerHTML=global.footer_html;
      return;
    }
    const footer=document.querySelector('footer .footer-grid');
    if(footer){
      const links=(global.footer_links||[]).map(link=>`<a href="${link.url||'#'}">${link.label||'Link'}</a>`).join('');
      footer.innerHTML=`<div><b>${global.company_name||''}</b><br>${global.footer_slogan||''}<br><span class="micro">SIREN <span data-site-siren>${global.siren||''}</span> · <span data-site-address>${global.address||''}</span></span><br><span class="micro"><span data-site-phone>${global.phone||''}</span> · <span data-site-email>${global.email||''}</span></span></div><div class="footer-links">${links}</div>`;
    }
  }


  function safeSrc(value){
    if(!value) return '';
    return String(value).trim();
  }

  function setImage(selector, src, alt){
    src = safeSrc(src);
    if(!src) return;
    document.querySelectorAll(selector).forEach(el=>{
      if(el.tagName && el.tagName.toLowerCase()==='img'){
        el.src = src;
        if(alt) el.alt = alt;
      } else {
        el.style.backgroundImage = `url("${src}")`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
      }
    });
  }

  function setBackground(selector, src){
    src = safeSrc(src);
    if(!src) return;
    document.querySelectorAll(selector).forEach(el=>{
      el.style.backgroundImage = `url("${src}")`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
    });
  }

  async function applyImages(){
    try{
      const images = await fetchJson('/content/images.json');
      setImage('.brand-symbol', images.logo_symbol, 'Logo symbol');
      setImage('.brand-wordmark', images.logo_wordmark, 'Logo wordmark');
      const favs = [
        ['link[rel="icon"]', images.favicon],
        ['link[sizes="32x32"]', images.favicon_32 || images.favicon],
        ['link[rel="apple-touch-icon"]', images.apple_touch_icon || images.favicon]
      ];
      favs.forEach(([selector, src])=>{ if(!src) return; document.querySelectorAll(selector).forEach(l=>{ l.href=src; }); });
      if(images.hero_background_image) setBackground('.hero,.page-hero', images.hero_background_image);
      if(images.matrix_background_image) setBackground('#matrixCanvas,.matrix-bg,.noise', images.matrix_background_image);
      if(images.page_background_image) setBackground('body', images.page_background_image);
      const pairs = [
        ['cybersecurity-infrastructure', images.cybersecurity_image, 'Cybersecurity & Infrastructure'],
        ['ai-automation-workflows', images.ai_automation_image, 'AI Automation & Workflows'],
        ['cloud-devops-solutions', images.cloud_devops_image, 'Cloud & DevOps Solutions'],
        ['data-analytics-monitoring', images.data_monitoring_image, 'Data Analytics & Monitoring'],
        ['api-integrations-connectivity', images.api_integrations_image, 'API Integrations & Connectivity'],
        ['managed-support-maintenance', images.support_maintenance_image, 'Managed Support & Maintenance']
      ];
      pairs.forEach(([needle, src, alt])=>{
        if(!src) return;
        document.querySelectorAll(`img[src*="${needle}"]`).forEach(img=>{ img.src=src; img.alt=alt; });
      });
      if(Array.isArray(images.custom_image_rules)){
        images.custom_image_rules.forEach(rule=>{
          if(!rule || !rule.selector || !rule.src) return;
          if(rule.mode === 'background') setBackground(rule.selector, rule.src);
          else setImage(rule.selector, rule.src, rule.alt || '');
        });
      }
    }catch(e){ console.warn('Image CMS content not loaded', e); }
  }

  async function applyGlobal(){
    try{
      const global=await fetchJson('/content/global.json');
      document.title = document.title.replace(/QUANTHEXA/g, global.company_name || 'QUANTHEXA');
      const fav=document.querySelector('link[rel="icon"]') || document.createElement('link');
      fav.rel='icon'; if(global.favicon) fav.href=global.favicon; if(!fav.parentNode) document.head.appendChild(fav);
      applyText('[data-company-name]', global.company_name);
      applyText('[data-domain]', global.domain);
      applyText('[data-site-email]', global.email);
      applyText('[data-site-phone]', global.phone);
      applyText('[data-site-address]', global.address);
      applyText('[data-site-siren]', global.siren);
      document.querySelectorAll('a[data-site-email]').forEach(a=>{ a.href='mailto:' + global.email; });
      document.querySelectorAll('a[data-site-phone]').forEach(a=>{ a.href='tel:' + String(global.phone||'').replace(/\s+/g,''); });
      renderHeader(global);
      renderFooter(global);
      insertStyle('qx-global-custom-css', global.custom_css || '');
      insertHtml('head','qx-custom-head-html',global.custom_head_html || '');
      insertHtml('bodyStart','qx-custom-body-start-html',global.custom_body_start_html || '');
      insertHtml('bodyEnd','qx-custom-body-end-html',global.custom_body_end_html || '');
    }catch(e){ console.warn('Global CMS content not loaded', e); }
  }

  async function applyTheme(){
    try{ applyCssVars(await fetchJson('/content/theme.json')); }catch(e){ console.warn('Theme CMS content not loaded', e); }
  }

  function initDynamicBehavior(){
    document.querySelectorAll('[data-service]').forEach(btn=>{
      btn.addEventListener('click',()=>{ try{localStorage.setItem('service',btn.dataset.service || btn.textContent.trim());}catch(e){} location.href='request.html'; });
    });
    const chosen=document.getElementById('chosenService');
    if(chosen){ try{ if(localStorage.getItem('service')) chosen.value=localStorage.getItem('service'); }catch(e){} }
    const form=document.getElementById('requestForm');
    if(form && !form.dataset.qxBound){
      form.dataset.qxBound='true';
      form.addEventListener('submit',e=>{e.preventDefault(); const s=document.querySelector('.success'); if(s) s.classList.add('show'); form.reset(); scrollTo({top:0,behavior:'smooth'});});
    }
    document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
  }

  async function applyPage(){
    try{
      const page=await fetchJson('/content/pages/' + normalizedPage + '.json');
      if(page.page_title) document.title = page.page_title;
      if(page.meta_description){
        let meta=document.querySelector('meta[name="description"]');
        if(!meta){ meta=document.createElement('meta'); meta.name='description'; document.head.appendChild(meta); }
        meta.content=page.meta_description;
      }
      if(page.main_html_enabled && page.main_html){
        const main=document.querySelector('main');
        if(main) main.innerHTML=page.main_html;
      }
      insertStyle('qx-page-custom-css', page.custom_css || '');
      if(page.custom_js && String(page.custom_js).trim()){
        const old=document.getElementById('qx-page-custom-js'); if(old) old.remove();
        const script=document.createElement('script'); script.id='qx-page-custom-js'; script.textContent=page.custom_js; document.body.appendChild(script);
      }
      initDynamicBehavior();
    }catch(e){ console.warn('Page CMS content not loaded for '+normalizedPage, e); initDynamicBehavior(); }
  }

  async function applyServices(){
    try{
      const data=await fetchJson('/content/services.json');
      const services=Array.isArray(data.services)?data.services:[];
      if(!services.length) return;
      const apply=(el,service,index)=>{
        if(!el||!service) return;
        const title=el.querySelector('h2,h3');
        const code=el.querySelector('.badge,.service-code,[data-service-code]');
        const price=el.querySelector('.price');
        const desc=el.querySelector('p');
        const btn=el.querySelector('button[data-service],a[data-service]');
        const icon=el.querySelector('.icon');
        if(icon && /^\d+$/.test(icon.textContent.trim())) icon.textContent=String(index+1).padStart(2,'0');
        if(title && service.title) title.textContent=service.title;
        if(code && service.code) code.textContent=service.code;
        if(price && service.price) price.textContent=service.price;
        if(desc && service.description) desc.textContent=service.description;
        if(btn && service.title) btn.setAttribute('data-service', service.title);
      };
      Array.from(document.querySelectorAll('.cards .card')).filter(card=>card.querySelector('.price')).forEach((card,i)=>apply(card,services[i],i));
      Array.from(document.querySelectorAll('.service-lux')).forEach((block,i)=>apply(block,services[i],i));
    }catch(e){ console.warn('Services CMS content not loaded', e); }
  }

  document.addEventListener('DOMContentLoaded', async()=>{
    await applyTheme();
    await applyGlobal();
    await applyImages();
    await applyPage();
    await applyServices();
    await applyImages();
  });
})();
