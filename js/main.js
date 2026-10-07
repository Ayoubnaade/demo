/* Taza Services — bilingual UI, dynamic pages and portfolio */
document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  initMobileNav();
  initSmoothScroll();
  initPage();
  initFaqs();
  initContactForm();
});

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let currentLanguage = localStorage.getItem("tazaLanguage") || siteData.defaultLanguage;

function t(key) { return siteData.ui[currentLanguage]?.[key] || siteData.ui.fr[key] || key; }
function tx(obj) { return obj?.[currentLanguage] ?? obj?.fr ?? obj ?? ""; }
function serviceText(service) { return service.translations[currentLanguage] || service.translations.fr; }
function phoneHref(phone) { return `tel:${phone.replace(/[^\d+]/g, "")}`; }
function whatsappHref(number) { return `https://wa.me/${String(number).replace(/\D/g, "")}`; }
function stars(rating) { return `<span class="stars" aria-label="${rating} / 5">★★★★★</span>`; }

function icon(name) {
  const paths = {
    local:`<path d="M12 21s7-5.1 7-11a7 7 0 0 0-14 0c0 5.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.3"/>`,
    contact:`<path d="M21 15.5a16.2 16.2 0 0 1-6.8-2.7l-1.9 1.9a13.8 13.8 0 0 1-5-5l1.9-1.9A16.2 16.2 0 0 1 6.5 1H3.2A1.2 1.2 0 0 0 2 2.2C2 12 10 20 19.8 20a1.2 1.2 0 0 0 1.2-1.2v-3.3Z"/>`,
    clock:`<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>`
  };
  return `<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.local}</svg>`;
}

function initLanguage() {
  const saved = localStorage.getItem("tazaLanguage");
  currentLanguage = saved === "ar" ? "ar" : "fr";
  applyLanguage();
  $$(".lang-btn").forEach(btn => btn.addEventListener("click", () => {
    currentLanguage = btn.dataset.lang;
    localStorage.setItem("tazaLanguage", currentLanguage);
    location.reload();
  }));
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
  $$(".lang-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.lang === currentLanguage));
  $$("[data-i18n]").forEach(el => {
    const value = t(el.dataset.i18n);
    if (value) el.textContent = value;
  });
  $$("[data-i18n-placeholder]").forEach(el => el.placeholder = t(el.dataset.i18nPlaceholder));
  const footerDesc = $(".business-description");
  if (footerDesc) footerDesc.textContent = tx(siteData.business.description);
  $$(".business-name").forEach(el => el.textContent = siteData.business.name);
  $$(".business-phone").forEach(el => { el.textContent = siteData.business.phone; el.href = phoneHref(siteData.business.phone); });
  $$(".business-email").forEach(el => { el.textContent = siteData.business.email; el.href = `mailto:${siteData.business.email}`; });
  $$(".business-hours").forEach(el => el.textContent = tx(siteData.business.hours));
  $$(".business-address").forEach(el => el.textContent = tx(siteData.business.address));
  $$("[data-business-whatsapp]").forEach(el => el.href = whatsappHref(siteData.business.whatsapp));
  const year = $("#current-year"); if (year) year.textContent = new Date().getFullYear();
}

function serviceCard(service) {
  const s = serviceText(service);
  return `<article class="service-card">
    <a class="service-image-wrap" href="service.html?id=${service.id}">
      <img src="${service.image}" alt="${s.name}" loading="lazy">
      <span class="image-tag">${tx(service.price)}</span>
    </a>
    <div class="service-card-body">
      <div class="eyebrow">${service.provider.name}</div><h3>${s.name}</h3><p>${s.short}</p>
      <div class="rating-row">${stars(service.rating)} <span>${service.rating} · ${service.reviews} ${t("reviews")}</span></div>
      <div class="card-actions">
        <a class="btn btn-sm btn-primary" href="service.html?id=${service.id}">${t("viewDetails")}</a>
        <a class="btn btn-sm btn-ghost" href="${phoneHref(service.provider.phone)}">${t("call")}</a>
        <a class="btn btn-sm btn-whatsapp" href="${whatsappHref(service.provider.whatsapp)}" target="_blank" rel="noopener">${t("whatsapp")}</a>
      </div>
    </div></article>`;
}

function initMobileNav() {
  const toggle = $(".nav-toggle"), menu = $(".site-nav");
  if (!toggle || !menu) return;
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open)); toggle.textContent = open ? "×" : "☰";
  });
  $$(".site-nav a").forEach(link => link.addEventListener("click", () => { menu.classList.remove("is-open"); toggle.textContent="☰"; }));
}
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => link.addEventListener("click", e => {
    const target = $(link.getAttribute("href")); if (target) { e.preventDefault(); target.scrollIntoView({behavior:"smooth"}); }
  }));
}
function initPage() {
  const page = document.body.dataset.page;
  $$(".site-nav a[data-nav]").forEach(link => { if (link.dataset.nav === page) link.classList.add("active"); });
  if (page === "home") renderHome();
  if (page === "services") renderServices();
  if (page === "service") renderServiceDetail();
  if (page === "about") renderAbout();
  if (page === "contact") renderContact();
}
function renderHome() {
  const grid = $("#home-services"); if (grid) grid.innerHTML = siteData.services.map(serviceCard).join("");
  const workers = $("#featured-workers");
  if (workers) workers.innerHTML = siteData.services.slice(0,3).map(s => {
    const st = serviceText(s);
    return `<article class="worker-card"><img src="${s.provider.image}" alt="${s.provider.name}" loading="lazy"><div><span class="eyebrow">${st.name}</span><h3>${s.provider.name}</h3><p>${st.providerDescription}</p><div class="worker-meta">${stars(s.rating)} <span>${s.provider.experience}</span></div><a href="service.html?id=${s.id}" class="text-link">${t("viewDetails")} <span>→</span></a></div></article>`;
  }).join("");
  const testimonials = $("#home-testimonials");
  if (testimonials) testimonials.innerHTML = siteData.testimonials.map(x => `<article class="testimonial-card"><div class="rating-row">${stars(x.rating)}</div><blockquote>“${tx(x.text)}”</blockquote><div class="reviewer"><div class="avatar">${x.name.charAt(0)}</div><div><strong>${x.name}</strong><span>${x.location}</span></div></div></article>`).join("");
  const faq = $("#home-faq"); if (faq) faq.innerHTML = siteData.faq.slice(0,4).map(faqItem).join("");
}
function faqItem(item,index) {
  return `<div class="faq-item ${index===0?"open":""}"><button class="faq-question" aria-expanded="${index===0}"><span>${tx(item.question)}</span><span class="faq-plus">+</span></button><div class="faq-answer"><p>${tx(item.answer)}</p></div></div>`;
}
function initFaqs() {
  document.addEventListener("click", e => {
    const btn=e.target.closest(".faq-question"); if(!btn)return;
    const item=btn.closest(".faq-item"), open=item.classList.toggle("open"); btn.setAttribute("aria-expanded",String(open));
  });
}
function renderServices() {
  const grid=$("#services-grid"), search=$("#service-search"), filter=$("#service-filter"); if(!grid)return;
  const selected = filter?.value || "all";
  if (filter) {
    filter.innerHTML = `<option value="all">${t("allServicesOption")}</option>` + siteData.services.map(s => `<option value="${s.id}">${serviceText(s).name}</option>`).join("");
    filter.value = selected;
  }
  const render=()=> {
    const q=(search?.value||"").trim().toLowerCase(), category=filter?.value||"all";
    const list=siteData.services.filter(s => { const st=serviceText(s); return (!q||`${st.name} ${st.short} ${s.provider.name}`.toLowerCase().includes(q))&&(category==="all"||s.id===category); });
    grid.innerHTML=list.length?list.map(serviceCard).join(""):`<div class="empty-state"><h3>${t("noServices")}</h3><p>${t("tryAgain")}</p></div>`;
    const count=$("#service-count"); if(count) count.textContent=`${list.length} ${t("servicesCount")}`;
  };
  search?.addEventListener("input",render); filter?.addEventListener("change",render); render();
}
function renderServiceDetail() {
  const id=new URLSearchParams(location.search).get("id"), service=siteData.services.find(s=>s.id===id)||siteData.services[0], s=serviceText(service), root=$("#service-detail"); if(!root)return;
  document.title=`${s.name} à Taza | ${siteData.business.name}`;
  root.innerHTML=`<section class="detail-hero"><div class="container detail-grid">
    <div class="detail-media"><img src="${service.image}" alt="${s.name} à Taza"></div>
    <div class="detail-intro"><span class="eyebrow">${service.provider.name} · ${tx(service.provider.experience)}</span><h1>${s.name}</h1><p class="lead">${s.description}</p>
    <div class="rating-large">${stars(service.rating)} <strong>${service.rating}</strong><span>${service.reviews} ${t("customerReviews")}</span></div>
    <div class="detail-price"><span>${t("startingPrice")}</span><strong>${tx(service.price)}</strong></div>
    <div class="detail-actions"><a class="btn btn-primary" href="${phoneHref(service.provider.phone)}">☎ ${t("call")}</a><a class="btn btn-whatsapp" href="${whatsappHref(service.provider.whatsapp)}" target="_blank" rel="noopener">◌ ${t("whatsapp")}</a></div>
    <p class="availability"><span class="status-dot"></span>${s.availability}</p></div></div></section>
    <section class="section"><div class="container detail-content-grid"><div>
      <span class="eyebrow">${t("included")}</span><h2>${t("included")}</h2><div class="feature-list">${s.includes.map(x=>`<div><span>✓</span>${x}</div>`).join("")}</div>
      <h2 class="subheading">${t("whyChoose")}</h2><div class="feature-list">${s.benefits.map(x=>`<div><span>✓</span>${x}</div>`).join("")}</div>
      <div class="portfolio-heading"><span class="eyebrow">${t("portfolio")}</span><h2>${t("portfolioIntro")}</h2></div>
      <div class="portfolio-grid">${service.provider.portfolioImages.map((img,i)=>`<figure class="portfolio-item"><img src="${img}" alt="${s.portfolio[i]||s.name}" loading="lazy"><figcaption>${s.portfolio[i]||s.name}</figcaption></figure>`).join("")}</div>
    </div><aside class="provider-panel"><span class="eyebrow">${t("yourProvider")}</span><div class="provider-head"><img src="${service.provider.image}" alt="${service.provider.name}"><div><h3>${service.provider.name}</h3><div>${stars(service.rating)}</div></div></div><p>${s.providerDescription}</p><div class="provider-contact"><a href="${phoneHref(service.provider.phone)}">☎ ${service.provider.phone}</a><a href="${whatsappHref(service.provider.whatsapp)}" target="_blank" rel="noopener">◌ ${t("messageWhatsapp")}</a></div><a href="contact.html?service=${service.id}" class="btn btn-dark full">${t("requestThis")}</a></aside></div></section>
    <section class="section section-muted"><div class="container"><div class="section-heading"><div><span class="eyebrow">${t("related")}</span><h2>${t("allServices")}</h2></div></div><div class="service-grid related">${siteData.services.filter(x=>x.id!==service.id).slice(0,3).map(serviceCard).join("")}</div></div></section>`;
}
function renderAbout() {
  const stats=$("#about-stats"); if(!stats)return;
  const items=[[siteData.business.stats.services,t("servicesStat")],[siteData.business.stats.workers,t("workersStat")],[siteData.business.stats.customers,t("customersStat")],[tx(siteData.business.stats.experience),t("experienceStat")]];
  stats.innerHTML=items.map(([n,l])=>`<div class="stat-card"><strong>${n}</strong><span>${l}</span></div>`).join("");
}
function renderContact() {
  const select=$("#service-choice"); if(select){
    siteData.services.forEach(s=>{const o=document.createElement("option");o.value=s.id;o.textContent=serviceText(s).name;select.appendChild(o);});
    const requested=new URLSearchParams(location.search).get("service"); if(requested)select.value=requested;
  }
}
function initContactForm() {
  const form=$("#contact-form"), success=$("#form-success"); if(!form)return;
  form.addEventListener("submit",e=>{e.preventDefault();if(!form.checkValidity()){form.reportValidity();return;}success.hidden=false;form.reset();success.scrollIntoView({behavior:"smooth",block:"center"});});
}
