/* ============================================================
   StockistiOnline — prototype implementation
   Reimplemented from the Claude Design canvas (.dc.html) into a
   standalone, dependency-free HTML/CSS/JS build. Responsive
   behaviour is driven entirely by real CSS media queries (see
   styles.css breakpoints), not by a simulated device switcher.
   ============================================================ */

/* ---------- Catalogue data (unchanged from the prototype) ---------- */
const PRODUCTS = [
  {id:1, brand:'Brand A', name:'Leather sneaker, white', category:'men', type:'sneaker', price:49.90, list:119, badge:'New today', badgeBg:'#02263f', badgeFg:'#f6f4f0', sizes:[39,40,41,42,43,44], outSizes:[41]},
  {id:2, brand:'Brand D', name:'Suede ankle boot', category:'men', type:'boot', price:69.90, list:160, badge:'Last pair', badgeBg:'#ce9c59', badgeFg:'#02263f', sizes:[37,38,39,40], outSizes:[37,39,40]},
  {id:3, brand:'Brand B', name:'Loafer, black', category:'men', type:'loafer', price:54.90, list:130, badge:'New today', badgeBg:'#02263f', badgeFg:'#f6f4f0', sizes:[39,40,41,42,43,44,45], outSizes:[]},
  {id:4, brand:'Brand C', name:'Mesh runner, grey', category:'women', type:'sneaker', price:44.90, list:110, badge:null, sizes:[36,37,38,39,40], outSizes:[]},
  {id:5, brand:'Brand E', name:'Nappa ballet flat', category:'women', type:'sandal', price:29.90, list:79, badge:'Last pair', badgeBg:'#ce9c59', badgeFg:'#02263f', sizes:[35,36,37,38,39], outSizes:[35,36,38]},
  {id:6, brand:'Brand F', name:"Kids' sneaker, velcro", category:'kids', type:'sneaker', price:24.90, list:65, badge:'New today', badgeBg:'#02263f', badgeFg:'#f6f4f0', sizes:[28,29,30,31,32,33,34], outSizes:[]},
  {id:7, brand:'Brand G', name:'Calf-leather derby', category:'men', type:'formal', price:79.90, list:210, badge:'Last pair', badgeBg:'#ce9c59', badgeFg:'#02263f', sizes:[41,42,43,44], outSizes:[42,43]},
  {id:8, brand:'Brand H', name:'Leather sandal', category:'women', type:'sandal', price:34.90, list:89, badge:null, sizes:[36,37,38,39,40], outSizes:[]},
  {id:9, brand:'Brand I', name:'Suede block heel', category:'women', type:'heel', price:59.90, list:140, badge:null, sizes:[36,37,38,39,40], outSizes:[]},
  {id:10, brand:'Brand J', name:'Shearling slipper', category:'women', type:'slipper', price:19.90, list:45, badge:'New today', badgeBg:'#02263f', badgeFg:'#f6f4f0', sizes:[36,37,38,39], outSizes:[]},
  {id:11, brand:'Brand D', name:'Chelsea boot, black', category:'women', type:'boot', price:64.90, list:150, badge:null, sizes:[36,37,38,39,40], outSizes:[]},
  {id:12, brand:'Brand C', name:'Canvas low-top', category:'women', type:'sneaker', price:27.90, list:60, badge:null, sizes:[36,37,38,39,40], outSizes:[]},
  {id:13, brand:'Brand H', name:'Leather slide sandal', category:'men', type:'sandal', price:22.90, list:55, badge:null, sizes:[40,41,42,43,44], outSizes:[]},
  {id:14, brand:'Brand J', name:'Suede moccasin slipper', category:'men', type:'slipper', price:24.90, list:58, badge:null, sizes:[40,41,42,43,44], outSizes:[]},
  {id:15, brand:'Brand G', name:'Monk strap shoe', category:'men', type:'formal', price:74.90, list:180, badge:'Last pair', badgeBg:'#ce9c59', badgeFg:'#02263f', sizes:[41,42,43,44], outSizes:[41,44]},
  {id:16, brand:'Brand F', name:"Kids' sandal, velcro", category:'kids', type:'sandal', price:19.90, list:42, badge:null, sizes:[28,29,30,31,32], outSizes:[]},
  {id:17, brand:'Brand F', name:"Kids' rain boot", category:'kids', type:'boot', price:21.90, list:48, badge:'New today', badgeBg:'#02263f', badgeFg:'#f6f4f0', sizes:[28,29,30,31,32,33], outSizes:[]},
  {id:18, brand:'Brand J', name:"Kids' house slipper", category:'kids', type:'slipper', price:14.90, list:32, badge:null, sizes:[28,29,30,31,32,33,34], outSizes:[]},
  {id:19, brand:'Brand A', name:'Penny loafer, tan', category:'women', type:'loafer', price:49.90, list:115, badge:null, sizes:[36,37,38,39,40], outSizes:[]},
  {id:20, brand:'Brand B', name:'Suede loafer, navy', category:'men', type:'loafer', price:57.90, list:135, badge:null, sizes:[40,41,42,43,44], outSizes:[]},
  {id:21, brand:'Brand I', name:'Pointed pump', category:'women', type:'heel', price:39.90, list:95, badge:'Last pair', badgeBg:'#ce9c59', badgeFg:'#02263f', sizes:[36,37,38,39], outSizes:[36]},
  {id:22, brand:'Brand A', name:'High-top sneaker', category:'men', type:'sneaker', price:52.90, list:125, badge:null, sizes:[39,40,41,42,43,44], outSizes:[]},
  {id:23, brand:'Brand C', name:'Platform sneaker', category:'women', type:'sneaker', price:46.90, list:105, badge:null, sizes:[36,37,38,39,40], outSizes:[]},
  {id:24, brand:'Brand F', name:"Kids' sport sneaker", category:'kids', type:'sneaker', price:26.90, list:62, badge:null, sizes:[28,29,30,31,32,33,34], outSizes:[]},
];

/* ---------- State ---------- */
let state = {
  view: 'landing',
  menuOpen: false,
  filtersOpen: false,
  plpCategory: 'all',
  plpSubtype: 'all',
  plpView: 'grid',
  plpCols: 4,
  selectedProductId: null,
  selectedSize: null,
  searchQuery: '',
  cart: [],
  isLoggedIn: false,
  accountTab: 'orders',
  checkoutStep: 1,
  authTab: 'signin',
  cartOpen: false,
  authOpen: false,
  orderNumber: 20488,
};

function setState(patch){
  Object.assign(state, typeof patch === 'function' ? patch(state) : patch);
  render();
}

/* ---------- Helpers ---------- */
function fmt(n){ return '€' + n.toFixed(2); }
function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function makeProductVM(p){
  const discount = Math.round((1 - p.price/p.list)*100);
  return { ...p, priceLabel: fmt(p.price), listLabel: fmt(p.list), discountLabel: '−' + discount + '%' };
}
function badgeChip(p, size){
  if (!p.badge) return '';
  const pad = size === 'sm' ? '5px 7px' : size === 'lg' ? '10px 12px' : '7px 9px';
  const fs = size === 'sm' ? '8px' : size === 'lg' ? '10px' : '9px';
  return `<span style="position:absolute;top:0;left:0;background:${p.badgeBg};color:${p.badgeFg};font:700 ${fs}/1 Archivo;letter-spacing:.12em;text-transform:uppercase;padding:${pad}">${esc(p.badge)}</span>`;
}

/* ---------- Actions (mirrors the original Component class) ---------- */
const actions = {
  selectProduct(id){ setState({ view:'pdp', selectedProductId:Number(id), selectedSize:null }); window.scrollTo(0,0); },
  goHome(){ setState({ view:'landing', cartOpen:false, authOpen:false, menuOpen:false }); window.scrollTo(0,0); },
  goCategory(){ setState({ view:'category', menuOpen:false }); window.scrollTo(0,0); },
  goNewStock(){ setState({ view:'plp', plpCategory:'all', menuOpen:false }); window.scrollTo(0,0); },
  goPlpBack(){ setState({ view:'plp' }); window.scrollTo(0,0); },
  pickWomen(){ setState({ view:'plp', plpCategory:'women', menuOpen:false }); window.scrollTo(0,0); },
  pickMen(){ setState({ view:'plp', plpCategory:'men', menuOpen:false }); window.scrollTo(0,0); },
  pickKids(){ setState({ view:'plp', plpCategory:'kids', menuOpen:false }); window.scrollTo(0,0); },
  pickAll(){ setState({ plpCategory:'all' }); },
  setSubtype(t){ setState({ plpSubtype:t }); },
  setPlpView(v){ setState({ plpView:v }); },
  setPlpCols(n){ setState({ plpView:'grid', plpCols:Number(n) }); },
  goSearch(){ setState({ view:'search', menuOpen:false }); window.scrollTo(0,0); },
  onSearchKey(e){ if (e.key === 'Enter'){ setState({ view:'search' }); } },
  pickSize(productId, size){
    if (state.selectedProductId === Number(productId)) setState({ selectedSize:Number(size) });
  },
  addToCart(){
    const p = PRODUCTS.find(x => x.id === state.selectedProductId);
    if (!p || !state.selectedSize) return;
    setState(s => ({ cart:[...s.cart, { productId:p.id, size:s.selectedSize }], cartOpen:true }));
  },
  toggleCart(){ setState(s => ({ cartOpen: !s.cartOpen, authOpen:false })); },
  closeCart(){ setState({ cartOpen:false }); },
  removeFromCart(index){ setState(s => ({ cart: s.cart.filter((_,i) => i !== Number(index)) })); },
  onAccountClick(){
    if (state.isLoggedIn) setState({ view:'account', cartOpen:false });
    else setState({ authOpen:true, authTab:'signin', cartOpen:false });
  },
  openAuthSignin(){ setState({ authOpen:true, authTab:'signin' }); },
  closeAuth(){ setState({ authOpen:false }); },
  authTabSignin(){ setState({ authTab:'signin' }); },
  authTabSignup(){ setState({ authTab:'signup' }); },
  signIn(){ setState({ isLoggedIn:true, authOpen:false, view:'account', accountTab:'orders' }); },
  signUp(){ setState({ isLoggedIn:true, authOpen:false, view:'account', accountTab:'orders' }); },
  signOut(){ setState({ isLoggedIn:false, view:'landing' }); },
  tabOrders(){ setState({ accountTab:'orders' }); },
  tabAddresses(){ setState({ accountTab:'addresses' }); },
  tabWishlist(){ setState({ accountTab:'wishlist' }); },
  proceedToCheckout(){ if (state.cart.length === 0) return; setState({ view:'checkout', checkoutStep:1, cartOpen:false }); window.scrollTo(0,0); },
  goStep1(){ setState({ checkoutStep:1 }); },
  goStep2(){ setState({ checkoutStep:2 }); },
  goStep3(){ setState({ checkoutStep:3 }); },
  placeOrder(){ setState(s => ({ checkoutStep:4, cart:[], orderNumber:s.orderNumber + 1 })); },
  toggleMenu(){ setState(s => ({ menuOpen: !s.menuOpen, cartOpen:false, authOpen:false })); },
  closeMenu(){ setState({ menuOpen:false }); },
  toggleFilters(){ setState(s => ({ filtersOpen: !s.filtersOpen })); },
  pickTrending(term){ setState({ searchQuery:term, view:'search' }); },
};

/* ---------- Event delegation ---------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.getAttribute('data-action');
  const fn = actions[action];
  if (typeof fn !== 'function') return;
  const args = [];
  if (el.hasAttribute('data-id')) args.push(el.getAttribute('data-id'));
  if (el.hasAttribute('data-size')) args.push(el.getAttribute('data-size'));
  if (el.hasAttribute('data-arg')) args.push(el.getAttribute('data-arg'));
  fn(...args);
});
document.addEventListener('input', (e) => {
  if (e.target && e.target.matches('[data-bind="searchQuery"]')){
    state.searchQuery = e.target.value;
    renderHeaderSearchOnly();
    if (state.view === 'search') renderMainOnly();
  }
});

/* A cheap partial-render for the search box so typing doesn't lose focus
   on a full re-render (the search input lives in the header). */
function renderHeaderSearchOnly(){
  document.querySelectorAll('[data-role="cart-count"]').forEach(el => el.textContent = state.cart.length);
}
function renderMainOnly(){
  const main = document.getElementById('main-content');
  if (main) main.innerHTML = renderView();
}
