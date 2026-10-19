const PRODUCTS = [
  {id:1,name:"Dew Drop Hydrating Serum",brand:"Glow Theory",category:"Skincare",price:129000,stock:12,badge:"Bestseller",image:"https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85",description:"Serum ringan untuk membantu kulit terasa lembap dan tampak segar. Cocok untuk melengkapi ritual skincare harianmu."},
  {id:2,name:"Cloud Nine Moisturizer",brand:"Dear Dew",category:"Skincare",price:98000,stock:8,badge:"Skin favourite",image:"https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=85",description:"Pelembap harian dengan tekstur nyaman untuk membantu menjaga kelembapan kulit."},
  {id:3,name:"Rosy Cheeks Cream Blush",brand:"Petal Pop",category:"Makeup",price:75000,stock:15,badge:"Trending",image:"https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=85",description:"Cream blush dengan warna manis yang mudah dibaurkan untuk tampilan merona natural."},
  {id:4,name:"Sugar Kiss Lip Tint",brand:"Mellow Muse",category:"Makeup",price:59000,stock:20,badge:"Fan favourite",image:"https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=85",description:"Lip tint untuk sentuhan warna sehari-hari. Praktis dibawa untuk touch-up kapan saja."},
  {id:5,name:"Soft Reset Cleansing Balm",brand:"Glow Theory",category:"Skincare",price:115000,stock:7,badge:"Gentle care",image:"https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=85",description:"Cleansing balm untuk membantu meluruhkan makeup dan kotoran sebagai langkah awal membersihkan wajah."},
  {id:6,name:"Petal Powder Compact",brand:"Petal Pop",category:"Makeup",price:89000,stock:10,badge:"Everyday",image:"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=85",description:"Bedak compact untuk membantu tampilan makeup terlihat lebih rapi saat beraktivitas."},
  {id:7,name:"Blending Brush Duo",brand:"Little Rituals",category:"Tools",price:45000,stock:18,badge:"Beauty tool",image:"https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=85",description:"Dua kuas serbaguna untuk membantu membaurkan produk makeup dengan lebih mudah."},
  {id:8,name:"Daily Glow Sunscreen",brand:"Dear Dew",category:"Skincare",price:109000,stock:9,badge:"Daily essential",image:"https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=85",description:"Sunscreen untuk melengkapi rutinitas pagi. Gunakan sesuai petunjuk kemasan produk."}
];

const STORE_KEYS = {cart:"sheporreal_cart",users:"sheporreal_users",current:"sheporreal_current_user",orders:"sheporreal_orders"};
const readStore = (key, fallback) => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
const saveStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));
let cart = readStore(STORE_KEYS.cart, []);
let users = readStore(STORE_KEYS.users, []);
let currentUser = readStore(STORE_KEYS.current, null);
let orders = readStore(STORE_KEYS.orders, []);
let authMode = "login";
let toastTimer;

const money = value => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(value);
const productById = id => PRODUCTS.find(product => product.id === Number(id));
const safe = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const totalQuantity = () => cart.reduce((sum,item) => sum + item.qty,0);
const cartTotal = () => cart.reduce((sum,item) => sum + (productById(item.id)?.price || 0) * item.qty,0);
const userOrders = () => orders.filter(order => order.email === currentUser?.email).sort((a,b) => b.createdAt - a.createdAt);

function toast(message){
  const el = document.getElementById("toast");
  el.textContent = message; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"),2600);
}
function persistCart(){ saveStore(STORE_KEYS.cart,cart); updateCartCount(); }
function updateCartCount(){ document.getElementById("cartCount").textContent = totalQuantity(); }
function showPage(page){
  const allowed = ["home","shop","cart","checkout","auth","profile","detail"];
  if(!allowed.includes(page)) page = "home";
  if(page === "checkout" && !cart.length){toast("Keranjangmu masih kosong.");page="shop";}
  if(page === "profile" && !currentUser){authMode="login";page="auth";}
  document.querySelectorAll(".page").forEach(el => el.classList.toggle("active",el.id === `page-${page}`));
  document.querySelectorAll(".nav-link").forEach(el => el.classList.toggle("active",el.dataset.page === page));
  document.getElementById("mainNav").classList.remove("open");
  if(page === "shop") renderShop();
  if(page === "cart") renderCart();
  if(page === "checkout") renderCheckout();
  if(page === "profile") renderProfile();
  window.scrollTo({top:0,behavior:"smooth"});
}
function productCard(product){
  return `<article class="product-card">
    <div class="product-image-wrap"><img src="${safe(product.image)}" alt="${safe(product.name)}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/600x700/f8e7ed/9a6075?text=SHEPORREAL'"><span class="product-badge">${safe(product.badge)}</span>
    <button class="quick-add" data-add="${product.id}" ${product.stock===0?"disabled":""}>${product.stock===0?"Out of stock":"+ Add to bag"}</button></div>
    <div class="product-meta"><div class="product-brand">${safe(product.brand)}</div><h3 class="product-name" data-detail="${product.id}">${safe(product.name)}</h3>
    <div class="product-bottom"><span class="product-price">${money(product.price)}</span><span class="product-stock">${product.stock} in stock</span></div>
    <button class="product-view" data-detail="${product.id}">View details ↗</button></div></article>`;
}
function renderFeatured(){
  document.getElementById("featuredProducts").innerHTML = PRODUCTS.slice(0,4).map(productCard).join("");
}
function renderShop(){
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const maxPrice = Number(document.getElementById("maxPrice").value);
  const found = PRODUCTS.filter(p => (p.name.toLowerCase().includes(query)||p.brand.toLowerCase().includes(query)) && (category==="All"||p.category===category) && p.price<=maxPrice);
  document.getElementById("shopProducts").innerHTML = found.map(productCard).join("");
  document.getElementById("resultCount").textContent = `${found.length} product${found.length===1?"":"s"} to love`;
  document.getElementById("noProducts").classList.toggle("hidden",found.length>0);
  document.getElementById("shopProducts").classList.toggle("hidden",found.length===0);
}
function addToCart(id){
  const product = productById(id); if(!product)return;
  const item = cart.find(entry => entry.id===product.id);
  if(product.stock===0){toast("Produk sedang habis.");return;}
  if(item && item.qty>=product.stock){toast("Jumlah melebihi stok yang tersedia.");return;}
  if(item)item.qty++;else cart.push({id:product.id,qty:1});
  persistCart(); toast(`${product.name} ditambahkan ke bag.`);
}
function changeQuantity(id,delta){
  const item=cart.find(entry=>entry.id===Number(id)); const product=productById(id); if(!item||!product)return;
  const next=item.qty+delta;
  if(next<=0){cart=cart.filter(entry=>entry.id!==Number(id));}
  else if(next<=product.stock){item.qty=next;}
  else{toast("Jumlah melebihi stok yang tersedia.");return;}
  persistCart();renderCart();
}
function removeFromCart(id){cart=cart.filter(item=>item.id!==Number(id));persistCart();renderCart();toast("Produk dihapus dari keranjang.");}
function renderCart(){
  const list=document.getElementById("cartItems"), summary=document.getElementById("cartSummary");
  if(!cart.length){
    list.innerHTML=`<div class="empty-cart"><div class="heart">♡</div><h2>Your bag feels lonely.</h2><p>Temukan beauty essentials favoritmu dan isi keranjangmu.</p><button class="btn btn-dark" data-page="shop">Explore the shop ↗</button></div>`;
    summary.innerHTML=`<h2>Bag summary</h2><p class="summary-note">Produk pilihanmu akan muncul di sini.</p>`;return;
  }
  list.innerHTML=cart.map(item=>{const p=productById(item.id);if(!p)return "";return `<article class="cart-row"><img src="${safe(p.image)}" alt="${safe(p.name)}"><div><span class="product-brand">${safe(p.brand)}</span><h3>${safe(p.name)}</h3><p>${money(p.price)} / item</p><div class="quantity"><button data-qty="${p.id}" data-delta="-1" aria-label="Kurangi">−</button><span>${item.qty}</span><button data-qty="${p.id}" data-delta="1" aria-label="Tambah">+</button></div></div><div class="cart-row-right"><strong>${money(p.price*item.qty)}</strong><button class="remove-btn" data-remove="${p.id}">Remove</button></div></article>`;}).join("");
  summary.innerHTML=`<h2>Bag summary</h2><div class="summary-line"><span>Subtotal (${totalQuantity()} items)</span><strong>${money(cartTotal())}</strong></div><div class="summary-line"><span>Shipping</span><span>Not applicable</span></div><div class="summary-line total"><span>Total</span><strong>${money(cartTotal())}</strong></div><button class="btn btn-dark" data-page="checkout">Proceed to checkout <span>↗</span></button><p class="summary-note">Ini adalah simulasi belanja. Tidak ada pembayaran sungguhan.</p><button class="text-link" style="margin-top:18px" data-page="shop">← Continue shopping</button>`;
}
function renderCheckout(){
  document.getElementById("checkoutItems").innerHTML=cart.map(item=>{const p=productById(item.id);return p?`<div class="checkout-line"><span>${safe(p.name)} × ${item.qty}</span><strong>${money(p.price*item.qty)}</strong></div>`:"";}).join("");
  document.getElementById("checkoutSummary").innerHTML=`<h2>Almost yours.</h2><div class="summary-line"><span>Items</span><strong>${totalQuantity()}</strong></div><div class="summary-line"><span>Subtotal</span><strong>${money(cartTotal())}</strong></div><div class="summary-line"><span>Shipping</span><span>Rp0</span></div><div class="summary-line total"><span>Total demo</span><strong>${money(cartTotal())}</strong></div><div class="checkout-warning">♡ Demo checkout only. Tidak ada uang yang ditarik dan tidak ada barang yang dikirim.</div><button class="btn btn-dark" id="confirmCheckout">Confirm demo order <span>♡</span></button><button class="text-link" style="margin-top:18px" data-page="cart">← Back to bag</button>`;
}
function openProductDetail(id){
  const p=productById(id);if(!p)return;
  document.getElementById("productDetail").innerHTML=`<div class="detail-layout"><div><button class="back-link" data-page="shop">← Back to shop</button><img class="detail-image" src="${safe(p.image)}" alt="${safe(p.name)}" onerror="this.onerror=null;this.src='https://placehold.co/600x700/f8e7ed/9a6075?text=SHEPORREAL'"></div><div class="detail-copy"><span class="eyebrow">${safe(p.category)} / ${safe(p.brand)}</span><h1>${safe(p.name)}</h1><div class="detail-price">${money(p.price)}</div><p>${safe(p.description)}</p><div class="detail-stock">${p.stock>0?`${p.stock} pieces available`:"Currently out of stock"}</div><button class="btn btn-dark" data-add="${p.id}" ${p.stock===0?"disabled":""}>Add to bag <span>↗</span></button><p style="margin-top:25px;font-size:10px">Demo product listing. Product photos are illustrative.</p></div></div>`;
  showPage("detail");
}
function showModal(content){document.getElementById("modalContent").innerHTML=content;document.getElementById("modal").classList.remove("hidden");}
function closeModal(){document.getElementById("modal").classList.add("hidden");}
function confirmCheckout(){
  if(!cart.length){toast("Keranjangmu kosong.");showPage("shop");return;}
  if(!currentUser){toast("Login terlebih dahulu untuk menyimpan pesanan.");authMode="login";showPage("auth");return;}
  const now=Date.now();
  const order={id:`SPR-${now.toString().slice(-8)}-${Math.floor(Math.random()*90+10)}`,email:currentUser.email,customerName:currentUser.name,items:cart.map(item=>({...item})),total:cartTotal(),createdAt:now,status:"Checkout Berhasil"};
  orders.push(order);saveStore(STORE_KEYS.orders,orders);cart=[];persistCart();
  showModal(`<div class="success-icon">✓</div><span class="eyebrow">IT'S A LITTLE CELEBRATION</span><h2 id="modalTitle">Your order is in!</h2><p>Terima kasih, ${safe(currentUser.name)}. Checkout simulasi kamu berhasil dibuat.</p><div class="order-number">ORDER ID<br><strong>${safe(order.id)}</strong></div><p><strong>${money(order.total)}</strong><br>Tidak ada pembayaran atau pengiriman sungguhan.</p><button class="btn btn-dark" id="viewOrderHistory">View my orders ↗</button>`);
}
function setAuthMode(mode){
  authMode=mode;
  document.querySelectorAll(".auth-tab").forEach(el=>el.classList.toggle("active",el.dataset.auth===mode));
  document.getElementById("authTitle").textContent=mode==="login"?"Welcome back.":"Let's make it official.";
  document.getElementById("authSubtitle").textContent=mode==="login"?"Sign in to see your beauty bag and orders.":"Create an account for your SHEPORREAL demo experience.";
  document.getElementById("nameField").classList.toggle("hidden",mode==="login");
  document.getElementById("authName").required=mode==="register";
  document.getElementById("authPassword").autocomplete=mode==="login"?"current-password":"new-password";
  document.getElementById("authSubmit").innerHTML=mode==="login"?'Login <span>↗</span>':'Create account <span>♡</span>';
}
function handleAuth(event){
  event.preventDefault();
  const email=document.getElementById("authEmail").value.trim().toLowerCase();
  const password=document.getElementById("authPassword").value;
  const name=document.getElementById("authName").value.trim();
  if(authMode==="register"){
    if(!name){toast("Masukkan nama lengkap.");return;}
    if(users.some(user=>user.email===email)){toast("Email sudah terdaftar. Silakan login.");return;}
    // Demo only: password stored locally as plain text. Never use this for real accounts.
    const user={name,email,password};users.push(user);saveStore(STORE_KEYS.users,users);
    currentUser={name,email};saveStore(STORE_KEYS.current,currentUser);toast("Akun demo berhasil dibuat.");showPage("profile");
  }else{
    const user=users.find(entry=>entry.email===email&&entry.password===password);
    if(!user){toast("Email atau password tidak sesuai.");return;}
    currentUser={name:user.name,email:user.email};saveStore(STORE_KEYS.current,currentUser);toast(`Welcome back, ${user.name}!`);showPage("profile");
  }
  document.getElementById("authForm").reset();setAuthMode("login");
}
function renderProfile(){
  if(!currentUser){showPage("auth");return;}
  document.getElementById("profileGreeting").textContent=`${currentUser.name.split(" ")[0]}.`;
  const history=userOrders();
  document.getElementById("profileContent").innerHTML=`<div class="profile-layout"><aside class="profile-card"><div class="avatar">${safe(currentUser.name.charAt(0).toUpperCase())}</div><h2>${safe(currentUser.name)}</h2><p>${safe(currentUser.email)}</p><button class="btn btn-light" data-edit-profile>Edit profile</button><button class="btn btn-dark" data-logout>Log out</button></aside><div class="profile-main"><h2>Order history <span style="font:11px var(--sans);color:var(--muted)">(${history.length})</span></h2>${history.length?history.map(order=>`<article class="profile-order"><div class="order-top"><div><strong>${safe(order.id)}</strong><small>${new Date(order.createdAt).toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"})}</small></div><span class="status">${safe(order.status)}</span></div><div class="order-products">${order.items.map(item=>{const p=productById(item.id);return p?`${safe(p.name)} × ${item.qty}`:`Product × ${item.qty}`;}).join("<br>")}</div><div class="order-bottom"><strong>${money(order.total)}</strong><button data-order-detail="${safe(order.id)}">View details ↗</button></div></article>`).join(""):`<div class="no-orders">♡<br><br>Belum ada riwayat checkout.<br>Pesanan simulasi yang kamu konfirmasi akan muncul di sini.<br><br><button class="text-link" data-page="shop">Explore products ↗</button></div>`}</div></div>`;
}
function editProfile(){
  if(!currentUser)return;
  showModal(`<span class="eyebrow">YOUR DETAILS</span><h2 id="modalTitle">Edit profile</h2><form id="editProfileForm" style="text-align:left;margin-top:20px"><div class="form-field"><label for="editName">Full name</label><input id="editName" required value="${safe(currentUser.name)}"></div><div class="form-field"><label for="editEmail">Email address</label><input id="editEmail" type="email" required value="${safe(currentUser.email)}"></div><button class="btn btn-dark full-width" type="submit">Save changes ↗</button></form>`);
}
function showOrderDetail(id){
  const order=orders.find(item=>item.id===id&&item.email===currentUser?.email);if(!order)return;
  showModal(`<span class="eyebrow">YOUR LITTLE BEAUTY MOMENT</span><h2 id="modalTitle">Order details</h2><div class="order-number">${safe(order.id)}</div><p>Status: <strong>${safe(order.status)}</strong></p>${order.items.map(item=>{const p=productById(item.id);return p?`<div class="summary-line"><span>${safe(p.name)} × ${item.qty}</span><strong>${money(p.price*item.qty)}</strong></div>`:"";}).join("")}<div class="summary-line total"><span>Total</span><strong>${money(order.total)}</strong></div><p>Pesanan ini adalah simulasi dan tidak diproses untuk pembayaran atau pengiriman nyata.</p><button class="btn btn-dark" id="closeOrderDetail">Close</button>`);
}
function logout(){currentUser=null;localStorage.removeItem(STORE_KEYS.current);toast("Kamu sudah logout.");showPage("home");}
function bindEvents(){
  document.addEventListener("click",event=>{
    const pageLink=event.target.closest("[data-page]");
    if(pageLink){event.preventDefault();const category=pageLink.dataset.category;if(category){document.getElementById("categoryFilter").value=category;}showPage(pageLink.dataset.page);if(pageLink.dataset.page==="shop"&&category)renderShop();return;}
    const add=event.target.closest("[data-add]");if(add){addToCart(add.dataset.add);return;}
    const detail=event.target.closest("[data-detail]");if(detail){openProductDetail(detail.dataset.detail);return;}
    const qty=event.target.closest("[data-qty]");if(qty){changeQuantity(qty.dataset.qty,Number(qty.dataset.delta));return;}
    const remove=event.target.closest("[data-remove]");if(remove){removeFromCart(remove.dataset.remove);return;}
    const auth=event.target.closest("[data-auth]");if(auth){setAuthMode(auth.dataset.auth);return;}
    const logoutButton=event.target.closest("[data-logout]");if(logoutButton){logout();return;}
    const edit=event.target.closest("[data-edit-profile]");if(edit){editProfile();return;}
    const order=event.target.closest("[data-order-detail]");if(order){showOrderDetail(order.dataset.orderDetail);return;}
  });
  document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("mainNav").classList.toggle("open"));
  document.getElementById("searchShortcut").addEventListener("click",()=>{showPage("shop");document.getElementById("searchInput").focus();});
  ["searchInput","categoryFilter","maxPrice"].forEach(id=>document.getElementById(id).addEventListener(id==="searchInput"?"input":"change",renderShop));
  document.getElementById("authForm").addEventListener("submit",handleAuth);
  document.getElementById("modalClose").addEventListener("click",closeModal);
  document.getElementById("modal").addEventListener("click",event=>{if(event.target.id==="modal")closeModal();});
  document.addEventListener("keydown",event=>{if(event.key==="Escape")closeModal();});
  document.addEventListener("click",event=>{
    if(event.target.id==="confirmCheckout")confirmCheckout();
    if(event.target.id==="viewOrderHistory"){closeModal();showPage("profile");}
    if(event.target.id==="closeOrderDetail")closeModal();
  });
  document.addEventListener("submit",event=>{
    if(event.target.id==="editProfileForm"){
      event.preventDefault();const name=document.getElementById("editName").value.trim();const email=document.getElementById("editEmail").value.trim().toLowerCase();
      if(!name||!email)return;
      const oldEmail=currentUser.email;
      if(users.some(user=>user.email===email&&user.email!==oldEmail)){toast("Email sudah digunakan akun lain.");return;}
      const user=users.find(entry=>entry.email===oldEmail);
      if(user){user.name=name;user.email=email;saveStore(STORE_KEYS.users,users);}
      orders=orders.map(order=>order.email===oldEmail?{...order,email,customerName:name}:order);saveStore(STORE_KEYS.orders,orders);
      currentUser={name,email};saveStore(STORE_KEYS.current,currentUser);closeModal();renderProfile();toast("Profil berhasil diperbarui.");
    }
    if(event.target.id==="newsletterForm"){event.preventDefault();event.target.reset();toast("Terima kasih sudah bergabung dengan beauty letter demo!");}
  });
}
function init(){
  renderFeatured();renderShop();updateCartCount();bindEvents();setAuthMode("login");
  // If a user manually edits localStorage, gracefully fall back to a signed-out state.
  if(currentUser&&!users.some(user=>user.email===currentUser.email)){currentUser=null;localStorage.removeItem(STORE_KEYS.current);}
}
init();
