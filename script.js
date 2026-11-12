(() => {
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  // Language selector with English, Spanish, French and Portuguese translations.
  const languageToggle = document.getElementById('languageToggle');
  const languageMenu = document.getElementById('languageMenu');
  const translations = {
    en:{categories:'Categories',babyKids:'Baby & Kids',beautyHealth:'Beauty & Health',electronics:'Electronics',fashion:'Fashion',travel:'Travel',dining:'Dining',homeGarden:'Home & Garden',pets:'Pets',heroCopy:'Find coupons, offers and capture savings — all in one app.',popularOffers:'🎯 Explore Popular Offers',trending:'🔥 Hottest Trending Deals',getApp:'Get the Krispy App',firstToKnow:'Be the First to Know!',entertainment:'Discover Fun and Entertainment',blog:'From the Krispy Blog',searchPlaceholder:'Search coupons, brands and offers'},
    es:{categories:'Categorías',babyKids:'Bebés y niños',beautyHealth:'Belleza y salud',electronics:'Electrónica',fashion:'Moda',travel:'Viajes',dining:'Restaurantes',homeGarden:'Hogar y jardín',pets:'Mascotas',heroCopy:'Encuentra cupones, ofertas y ahorra — todo en una app.',popularOffers:'🎯 Explora ofertas populares',trending:'🔥 Ofertas más populares',getApp:'Descarga Krispy',firstToKnow:'¡Sé el primero en enterarte!',entertainment:'Descubre diversión y entretenimiento',blog:'Del blog de Krispy',searchPlaceholder:'Busca cupones, marcas y ofertas'},
    fr:{categories:'Catégories',babyKids:'Bébés et enfants',beautyHealth:'Beauté et santé',electronics:'Électronique',fashion:'Mode',travel:'Voyage',dining:'Restaurants',homeGarden:'Maison et jardin',pets:'Animaux',heroCopy:'Trouvez des coupons, des offres et économisez — dans une seule appli.',popularOffers:'🎯 Découvrez les offres populaires',trending:'🔥 Offres tendance',getApp:'Télécharger Krispy',firstToKnow:'Soyez les premiers informés !',entertainment:'Découvrez les loisirs et divertissements',blog:'Le blog Krispy',searchPlaceholder:'Rechercher des coupons, marques et offres'},
    pt:{categories:'Categorias',babyKids:'Bebês e crianças',beautyHealth:'Beleza e saúde',electronics:'Eletrônicos',fashion:'Moda',travel:'Viagens',dining:'Restaurantes',homeGarden:'Casa e jardim',pets:'Animais',heroCopy:'Encontre cupons, ofertas e economize — tudo em um só app.',popularOffers:'🎯 Explore ofertas populares',trending:'🔥 Ofertas em alta',getApp:'Baixe o Krispy',firstToKnow:'Saiba em primeira mão!',entertainment:'Descubra diversão e entretenimento',blog:'Do blog Krispy',searchPlaceholder:'Busque cupons, marcas e ofertas'}
  };
  function setLanguage(lang){
    const pack=translations[lang]||translations.en; document.documentElement.lang=lang;
    document.querySelectorAll('[data-i18n]').forEach(el=>{if(pack[el.dataset.i18n])el.textContent=pack[el.dataset.i18n]});
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{if(pack[el.dataset.i18nPlaceholder])el.placeholder=pack[el.dataset.i18nPlaceholder]});
    languageMenu.hidden=true;languageToggle.setAttribute('aria-expanded','false');
  }
  languageToggle.addEventListener('click',()=>{languageMenu.hidden=!languageMenu.hidden;languageToggle.setAttribute('aria-expanded',String(!languageMenu.hidden))});
  languageMenu.querySelectorAll('[data-lang]').forEach(btn=>btn.addEventListener('click',()=>setLanguage(btn.dataset.lang)));
  document.addEventListener('click',e=>{if(!e.target.closest('.language-control')){languageMenu.hidden=true;languageToggle.setAttribute('aria-expanded','false')}});

  // Reveal and copy a sample coupon code.
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('.code-button');
    if (!button) return;
    const card = button.closest('.coupon-card');
    const code = card?.dataset.code;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      button.querySelector('span:last-child').textContent = 'Copied!';
      showToast(`Coupon code ${code} copied`);
    } catch {
      button.querySelector('span:last-child').textContent = code;
      showToast(`Use coupon code: ${code}`);
    }
  });

  // Toggle the additional category list.
  const categoryToggle = document.getElementById('categoryToggle');
  const extraCategories = document.getElementById('extraCategories');
  categoryToggle.addEventListener('click', () => {
    const expanded = categoryToggle.getAttribute('aria-expanded') === 'true';
    categoryToggle.setAttribute('aria-expanded', String(!expanded));
    extraCategories.hidden = expanded;
    categoryToggle.querySelector('.plus').textContent = expanded ? '+' : '−';
  });

  // Offer carousel controls and pagination dots.
  const track = document.getElementById('offerTrack');
  const dots = [...document.querySelectorAll('.carousel-dots span')];
  function moveCarousel(direction) {
    const card = track.querySelector('.offer-card');
    track.scrollBy({ left: direction * ((card?.getBoundingClientRect().width || 280) + 16), behavior: 'smooth' });
  }
  document.querySelector('.carousel-arrow.prev').addEventListener('click', () => moveCarousel(-1));
  document.querySelector('.carousel-arrow.next').addEventListener('click', () => moveCarousel(1));
  track.addEventListener('scroll', () => {
    const first = track.querySelector('.offer-card');
    const step = (first?.offsetWidth || 280) + 16;
    const index = Math.round(track.scrollLeft / step);
    dots.forEach((dot, i) => dot.classList.toggle('active', i === Math.min(index, dots.length - 1)));
  });

  // Search coupon cards by merchant, category, or deal keywords.
  const searchInput = document.getElementById('couponSearchInput');
  const couponGrid = document.getElementById('couponGrid');
  const emptyState = document.getElementById('emptyState');
  function filterCoupons(term) {
    const query = term.trim().toLowerCase();
    let visible = 0;
    couponGrid.querySelectorAll('.coupon-card').forEach((card) => {
      const haystack = `${card.innerText} ${card.dataset.search || ''} ${card.dataset.category || ''}`.toLowerCase();
      const match = !query || haystack.includes(query);
      card.hidden = !match;
      if (match) visible++;
    });
    emptyState.hidden = visible !== 0;
  }
  document.getElementById('couponSearchForm').addEventListener('submit', (event) => {
    event.preventDefault();
    filterCoupons(searchInput.value);
    document.getElementById('coupons').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  searchInput.addEventListener('input', () => filterCoupons(searchInput.value));

  // Category shortcuts filter deals where matching sample cards exist.
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    const category = button.dataset.category;
    searchInput.value = category;
    filterCoupons(category);
    document.getElementById('coupons').scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(`Showing ${category} deals`);
  });

  // Email signup front-end demo; connect to an email platform before launch.
  document.getElementById('subscribeForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('emailInput');
    const message = document.getElementById('formMessage');
    if (!email.checkValidity()) return email.reportValidity();
    message.textContent = 'Thanks! You’re on the Krispy early-access list.';
    email.value = '';
  });

  // Append sample deal cards as the shopper scrolls down.
  const sentinel = document.getElementById('couponSentinel');
  const moreDeals = [
    { name: 'Kroger', icon: 'K', cls: 'publix', offer: '$8 Off', detail: '$40+ Purchase', code: 'KRISPYKROGER8', category: 'Baby & Kids', search: 'kroger baby kids family essentials' },
    { name: 'Regal', icon: 'R', cls: 'amc', offer: '$5 Off', detail: 'Movie Tickets', code: 'KRISPYREGAL5', category: 'Dining', search: 'regal movies entertainment dining' },
    { name: 'GameStop', icon: 'G', cls: 'chipotle', offer: '10% Off', detail: 'Select Games', code: 'KRISPYGAME10', category: 'Electronics', search: 'gamestop electronics games' },
    { name: 'Old Navy', icon: 'O', cls: 'cvs', offer: '20% Off', detail: 'Select Styles', code: 'KRISPYSTYLE20', category: 'Fashion', search: 'old navy fashion clothing' }
  ];
  let batches = 0;
  function appendDeals() {
    if (batches >= 3) return;
    batches++;
    moreDeals.forEach((deal) => {
      const card = document.createElement('article');
      card.className = 'coupon-card';
      card.dataset.category = deal.category;
      card.dataset.search = deal.search;
      card.dataset.code = deal.code;
      card.innerHTML = `<div class="merchant"><span class="merchant-icon ${deal.cls}">${deal.icon}</span>${deal.name}</div><strong>${deal.offer}</strong><p>${deal.detail}</p><button class="code-button" type="button"><span class="ticket-icon" aria-hidden="true">▣</span><span>Get Code</span></button>`;
      couponGrid.appendChild(card);
    });
    if (batches >= 3) document.getElementById('scrollHint').textContent = 'You’re all caught up on featured sample deals.';
    if (searchInput.value.trim()) filterCoupons(searchInput.value);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) appendDeals();
    }, { rootMargin: '250px' });
    observer.observe(sentinel);
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
