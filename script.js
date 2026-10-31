// --- DATABASE INITIALIZATION (LocalStorage) ---

const defaultProducts = [
    {
        id: 1, name: "Wireless Noise Cancelling Headphones", price: 299, category: "Electronics", subCategory: null,
        rating: 4.9, reviews: [5, 5, 5, 4, 5], comments: [
            { user: "Sarah J.", date: "10/12/2025", text: "Best audio quality I've ever experienced.", score: 5 }
        ],
        images: ["https://picsum.photos/id/201/600/600", "https://picsum.photos/id/202/600/600"],
        description: "Premium over-ear headphones with industry-leading noise cancellation.", isNew: true
    },
    {
        id: 2, name: "Minimalist Leather Backpack", price: 89, category: "Fashion", subCategory: "Men",
        rating: 4.7, reviews: [5, 4, 5], comments: [],
        images: ["https://picsum.photos/id/251/600/600", "https://picsum.photos/id/252/600/600"],
        description: "Handcrafted full-grain leather backpack.", isNew: false
    },
    {
        id: 3, name: "Smart Ceramic Coffee Maker", price: 149, category: "Home", subCategory: null,
        rating: 4.8, reviews: [5, 5], comments: [],
        images: ["https://picsum.photos/id/312/600/600", "https://picsum.photos/id/313/600/600"],
        description: "WiFi-enabled smart coffee maker.", isNew: true
    },
    {
        id: 4, name: "Organic Cotton Hoodie", price: 65, category: "Fashion", subCategory: "Women",
        rating: 4.6, reviews: [4, 5, 5], comments: [],
        images: ["https://picsum.photos/id/64/600/600", "https://picsum.photos/id/65/600/600"],
        description: "Ultra soft 100% organic cotton hoodie.", isNew: false
    },
    {
        id: 5, name: "4K Ultra HD Webcam", price: 129, category: "Electronics", subCategory: null,
        rating: 4.5, reviews: [4, 5], comments: [],
        images: ["https://picsum.photos/id/180/600/600", "https://picsum.photos/id/181/600/600"],
        description: "Crystal clear 4K video webcam.", isNew: false
    },
    {
        id: 6, name: "Marble Desk Lamp", price: 79, category: "Home", subCategory: null,
        rating: 4.9, reviews: [5, 5, 5], comments: [],
        images: ["https://picsum.photos/id/1015/600/600", "https://picsum.photos/id/1016/600/600"],
        description: "Elegant modern desk lamp.", isNew: false
    },
    {
        id: 7, name: "Kids Dinosaur T-Shirt", price: 25, category: "Fashion", subCategory: "Kids",
        rating: 4.7, reviews: [5, 4, 5], comments: [],
        images: ["https://picsum.photos/id/88/600/600", "https://picsum.photos/id/89/600/600"],
        description: "Fun and comfortable cotton graphic tee for kids.", isNew: false
    },
    {
        id: 8, name: "Vitamin C Serum", price: 45, category: "Beauty", subCategory: null,
        rating: 4.8, reviews: [5, 5], comments: [],
        images: ["https://picsum.photos/id/135/600/600", "https://picsum.photos/id/136/600/600"],
        description: "Brightening face serum with hyaluronic acid.", isNew: true
    }
];
const defaultBanners = [
    { id: 1, image: "https://picsum.photos/id/1015/2000/1200", badge: "NEW", title: "Summer Collection", desc: "Discover premium styles with 20% off today!" },
    { id: 2, image: "https://picsum.photos/id/201/2000/1200", badge: "LIMITED", title: "Midnight Audio Deal", desc: "Up to $50 off premium noise cancelling headphones." },
    { id: 3, image: "https://picsum.photos/id/312/2000/1200", badge: "FLASH SALE", title: "Smart Home Tech", desc: "Upgrade your morning routine with automated kitchenware." }
];

let products = getStoredProducts() || [...defaultProducts];
let banners = JSON.parse(localStorage.getItem('shopsphere_banners')) || [...defaultBanners];
let currentHeroIndex = 0;
let cart = [];
let wishlist = new Set();
let currentProduct = null;
let currentFilter = 'All';
let currentUser = null; 
let isLoginMode = true; 
let isAdminView = false;
let currentImageIndex = 0;
let selectedProductSize = null;
let savedShippingAddress = "";
let ordersHistory = JSON.parse(localStorage.getItem('M.Y Store_orders')) || [];
let activeProfilesList = JSON.parse(localStorage.getItem('M.Y Store_active_profiles')) || [];
let registeredUsersList = JSON.parse(localStorage.getItem('M.Y Store_users')) || [];

// Ensure defaults are backed up immediately if storage is empty
if (!localStorage.getItem('M.Y Store_products')) {
    localStorage.setItem('M.Y Store_products', JSON.stringify(products));
}


// --- STORAGE VALIDATION SYSTEM ---
function getStoredProducts() {
    try {
        const stored = localStorage.getItem('M.Y Store_products');
        // Nothing saved yet at all (first ever visit) -> let caller fall back to defaults.
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return null;
        // An empty array is a VALID, intentional state (admin deleted everything).
        // It must be returned as-is, not treated as "missing" data, or every
        // reload after deleting all products would resurrect the defaults.
        if (parsed.length === 0) return parsed;
        // Ensure each product has the required fields; only fall back to null
        // (defaults) if the saved data is actually corrupted/malformed.
        const valid = parsed.every(p => p.id && p.name && p.price !== undefined);
        return valid ? parsed : null;
    } catch (e) {
        console.error('Error reading products from storage:', e);
        // If localStorage is corrupted, clear it
        localStorage.removeItem('M.Y Store_products');
        return null;
    }
}

function saveDataSafely() {
    try {
        const dataToSave = JSON.stringify(products);
        // Check if localStorage is available and has space
        localStorage.setItem('M.Y Store_products', dataToSave);
        // Verify the save was successful by reading back
        const verification = localStorage.getItem('M.Y Store_products');
        if (!verification) {
            console.warn('Warning: Save verification failed');
            showToast('⚠️ Storage issue detected. Data may not persist.');
        }
    } catch (e) {
        console.error('Error saving products:', e);
        if (e.name === 'QuotaExceededError') {
            showToast('❌ Storage full! Please clear browser cache.');
        } else {
            showToast('❌ Failed to save data. Check browser storage settings.');
        }
    }
}
function handleUserMenuClick() {
    if (currentUser) {
        renderProfileSwitchers();
        const menu = document.getElementById('user-dropdown');
        menu.classList.toggle('hidden');
    } else {
        isLoginMode = true;
        updateAuthUI();
        document.getElementById('auth-modal').classList.remove('hidden');
        document.getElementById('auth-modal').classList.add('flex');
    }
}

function renderProfileSwitchers() {
    const container = document.getElementById('dropdown-profile-switches');
    if (!container) return;
    
    let html = '';
    activeProfilesList.forEach((prof, idx) => {
        const isCurrent = prof.email === currentUser.email ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-100';
        html += `
            <div class="flex items-center justify-between p-1.5 border rounded-xl text-xs ${isCurrent}">
                <button onclick="switchProfileTo(${idx})" class="flex-1 text-left font-medium truncate">${prof.name}</button>
                ${activeProfilesList.length > 1 ? `<button onclick="removeProfileFromSession(${idx})" class="text-gray-400 hover:text-red-500 px-1 text-sm">×</button>` : ''}
            </div>
        `;
    });
    // Option to login with another secondary account concurrently
    html += `
        <button onclick="openSecondaryAuth()" class="w-full text-left text-[11px] text-blue-600 font-semibold hover:underline mt-1 flex items-center gap-1">
            <i class="fa-solid fa-plus"></i> Add Multiple Account
        </button>
    `;
    container.innerHTML = html;
}

function openSecondaryAuth() {
    document.getElementById('user-dropdown').classList.add('hidden');
    isLoginMode = true;
    updateAuthUI();
    document.getElementById('auth-modal').classList.remove('hidden');
    document.getElementById('auth-modal').classList.add('flex');
}

function switchProfileTo(index) {
    const selected = activeProfilesList[index];
    currentUser = { name: selected.name, email: selected.email, details: selected.details };
    document.getElementById('user-display-name').textContent = currentUser.name;
    document.getElementById('user-dropdown').classList.add('hidden');
    showToast(`Switched to profile: ${currentUser.name} 👤`);
}

function removeProfileFromSession(index) {
    const removingCurrent = activeProfilesList[index].email === currentUser.email;
    activeProfilesList.splice(index, 1);
    localStorage.setItem('M.Y Store_active_profiles', JSON.stringify(activeProfilesList));
    
    if (removingCurrent && activeProfilesList.length > 0) {
        switchProfileTo(0);
    } else if (activeProfilesList.length === 0) {
        processLogout();
    } else {
        renderProfileSwitchers();
    }
}

function processLogout() {
    currentUser = null;
    activeProfilesList = [];
    localStorage.removeItem('M.Y Store_active_profiles');
    document.getElementById('user-display-name').textContent = "Login";
    document.getElementById('user-dropdown').classList.add('hidden');
    showToast("Logged out successfully");
    if(isAdminView) toggleAdminView();
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    updateAuthUI();
}

function updateAuthUI() {
    const title = document.getElementById('auth-title');
    const registerFields = document.getElementById('register-fields');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleText = document.getElementById('auth-toggle-text');
    const toggleBtn = document.getElementById('auth-toggle-btn');

    if (isLoginMode) {
        title.textContent = "Sign In";
        registerFields.classList.add('hidden');
        submitBtn.textContent = "SIGN IN";
        toggleText.textContent = "Don't have an account?";
        toggleBtn.textContent = "Register here";
    } else {
        title.textContent = "Create Account";
        registerFields.classList.remove('hidden');
        submitBtn.textContent = "REGISTER";
        toggleText.textContent = "Already have an account?";
        toggleBtn.textContent = "Sign in";
    }
}


// Product Detail Modals Size and Address Selectors
function selectSize(btnElement, size) {
    selectedProductSize = size;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('bg-black', 'text-white', 'border-black'));
    btnElement.classList.add('bg-black', 'text-white', 'border-black');
}

function verifyAndSaveAddress() {
    const addr = document.getElementById('delivery-address-input').value.trim();
    if(!addr) {
        showToast("⚠️ Address entry line empty.");
        return;
    }
    savedShippingAddress = addr;
    const feedback = document.getElementById('saved-address-msg');
    feedback.textContent = `✓ Active Target Address Saved: "${addr}"`;
    feedback.classList.remove('hidden');
    showToast("Shipping configuration updated!");
}

// Intercept checkout actions to preserve historical data context
function checkout() {
    if (cart.length === 0) return;
    if (!currentUser) {
        showToast("Please login to proceed with order routing.");
        handleUserMenuClick();
        return;
    }
    
    const targetAddress = savedShippingAddress || prompt("Please confirm your full Delivery Shipping Address:", "123 Main St, Central Avenue");
    if(!targetAddress) {
        showToast("⚠️ An address is mandatory to complete shipping registration.");
        return;
    }

    // Build automated product order entity object array maps
    const orderData = {
        orderId: "SS" + Math.floor(Math.random() * 900000 + 100000),
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        buyerDetails: {
            name: `${currentUser.details.firstName} ${currentUser.details.lastName || ''}`.trim(),
            email: currentUser.email,
            phone: currentUser.details.phone || 'N/A',
            address: targetAddress
        },
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            size: selectedProductSize || "M",
            color: "Standard Fit"
        })),
        totalAmount: cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
    };

    ordersHistory.unshift(orderData);
    localStorage.setItem('M.Y Store_orders', JSON.stringify(ordersHistory));

    alert(`🎉 Thank you for your order, ${currentUser.name}!\nOrder Number reference: ${orderData.orderId}`);
    cart = [];
    selectedProductSize = null;
    updateCartCount();
    showOrdersPage();
}

// Order Tracking History Generator Views
function showOrdersPage() {
    document.getElementById('user-dropdown').classList.add('hidden');
    document.getElementById('generic-title').textContent = "Your Orders History Tracking";
    
    if (ordersHistory.length === 0) {
        document.getElementById('generic-content').innerHTML = `<p class="text-gray-500 italic py-10 text-center">No structural order tracking history logs found under your user profile profile identifier.</p>`;
        document.getElementById('generic-modal').classList.remove('hidden');
        document.getElementById('generic-modal').classList.add('flex');
        return;
    }

    let ordersHtml = `<div class="space-y-6">`;
    ordersHistory.forEach(order => {
        ordersHtml += `
            <div class="border rounded-2xl p-6 bg-white shadow-sm space-y-4">
                <div class="flex flex-col sm:flex-row justify-between bg-gray-50 p-4 rounded-xl text-sm gap-2">
                    <div><strong>Order Code Identifier ID:</strong> <span class="text-blue-600 font-mono font-bold">${order.orderId}</span></div>
                    <div><strong>Routed Purchase Timestamp:</strong> ${order.date}</div>
                </div>
                
                <div class="space-y-3">
                    <h4 class="text-xs font-bold tracking-widest text-gray-400 uppercase">Items Manifest</h4>
                    ${order.items.map(item => `
                        <div class="flex justify-between items-center border-b pb-2 last:border-b-0 text-sm">
                            <div>
                                <span class="font-semibold text-gray-900">${item.name}</span>
                                <div class="text-xs text-gray-500 mt-0.5">Selected Size Variant: <span class="bg-gray-100 px-1.5 py-0.5 rounded font-mono font-bold text-gray-700">${item.size}</span> | Vol: ${item.quantity} | Allocation: ${item.color}</div>
                            </div>
                            <span class="font-medium font-mono text-gray-900">$${item.price * item.quantity}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="grid md:grid-cols-2 gap-4 text-xs pt-2 border-t">
                    <div>
                        <span class="block font-bold uppercase tracking-wider text-gray-400 mb-1">Delivered Consignee User Credentials</span>
                        <strong>Recipient Full Identity:</strong> ${order.buyerDetails.name}<br>
                        <strong>Secure Destination Address:</strong> ${order.buyerDetails.address}
                    </div>
                    <div>
                        <span class="block font-bold uppercase tracking-wider text-gray-400 mb-1">Operational Alerts Pipeline Notifications Contact</span>
                        <strong>Account Email Pipeline:</strong> ${order.buyerDetails.email}<br>
                        <strong>Active Line Dial:</strong> ${order.buyerDetails.phone}
                    </div>
                </div>

                <div class="flex items-center justify-between pt-4 border-t">
                    <div class="text-lg font-bold">Total Gross Payment: <span class="text-emerald-600 font-mono font-black">$${order.totalAmount}</span></div>
                    <button onclick="printInvoice('${order.orderId}')" class="bg-gray-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"><i class="fa-solid fa-file-invoice"></i> GET INVOICE</button>
                </div>
            </div>
        `;
    });
    ordersHtml += `</div>`;

    document.getElementById('generic-content').innerHTML = ordersHtml;
    document.getElementById('generic-modal').classList.remove('hidden');
    document.getElementById('generic-modal').classList.add('flex');
}

// Printable Invoice Manifest Template Parser Generator Render Engine
function printInvoice(orderId) {
    const order = ordersHistory.find(o => o.orderId === orderId);
    if (!order) return;

    const invoiceWindow = window.open('', '_blank');
    invoiceWindow.document.write(`
        <html>
        <head>
            <title>Invoice - ${order.orderId}</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-white p-10 font-sans text-gray-900" onload="window.print()">
            <div class="max-w-3xl mx-auto border p-8 rounded-3xl shadow-sm space-y-6">
                <div class="flex justify-between items-center border-b pb-6">
                    <div>
                        <h1 class="text-3xl font-bold tracking-tight text-gray-900">M.Y Store Invoice</h1>
                        <p class="text-sm text-gray-500 mt-1">Order Transaction Voucher receipt reference manifest.</p>
                    </div>
                    <div class="text-right">
                        <div class="text-xl font-bold font-mono text-blue-600">${order.orderId}</div>
                        <div class="text-xs text-gray-400 mt-1">Issued: ${order.date}</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl text-sm">
                    <div>
                        <h3 class="font-bold text-gray-400 uppercase text-xs tracking-wider mb-2">Billed &amp; Shipped To:</h3>
                        <strong class="text-base text-gray-900">${order.buyerDetails.name}</strong><br>
                        <span class="text-gray-600">${order.buyerDetails.address}</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-400 uppercase text-xs tracking-wider mb-2">Buyer Contact Coordinates:</h3>
                        <strong>Email:</strong> ${order.buyerDetails.email}<br>
                        <strong>Phone:</strong> ${order.buyerDetails.phone}
                    </div>
                </div>

                <table class="w-full text-left border-collapse text-sm">
                    <thead>
                        <tr class="border-b text-gray-400 uppercase text-xs font-bold tracking-wider">
                            <th class="py-3">Line item details</th>
                            <th class="py-3 text-center">Size</th>
                            <th class="py-3 text-center">Qty</th>
                            <th class="py-3 text-right">Line Extension Amount</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        ${order.items.map(i => `
                            <tr>
                                <td class="py-4 font-medium text-gray-900">${i.name}</td>
                                <td class="py-4 text-center font-mono">${i.size}</td>
                                <td class="py-4 text-center">${i.quantity}</td>
                                <td class="py-4 text-right font-mono font-semibold">$${i.price * i.quantity}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="flex justify-end pt-4 border-t">
                    <div class="text-right space-y-1">
                        <span class="text-sm text-gray-500">Grand Total Settlement Amount</span>
                        <div class="text-3xl font-mono font-black text-emerald-600">$${order.totalAmount}</div>
                        <span class="text-[10px] text-gray-400 block">Payment Instrument Status: Paid via Pay on Delivery (POD Authorization Verified)</span>
                    </div>
                </div>
                
                <div class="text-center text-xs text-gray-400 pt-8 border-t">
                    Thank you for choosing M.Y Store! For tracking logs or return processing queries, contact support@manishstore.com.
                </div>
            </div>
        </body>
        </html>
    `);
    invoiceWindow.document.close();
}

// Initialize App
function initialize() {
    renderCategoryFilters();
    renderCategories();
    renderProducts(products);
    renderHeroSlider();
    updateCartCount();
    
    document.getElementById('search-input').addEventListener('input', filterProducts);
    document.getElementById('search-input-mobile').addEventListener('input', filterProducts);
}
window.onload = initialize;

// --- NAVIGATION ---

function navigateTo(section) {
    if (isAdminView) toggleAdminView(); // Close admin view if open

    if (section === 'shop') {
        currentFilter = 'All';
        document.getElementById('shop-title').textContent = "All Products";
        filterProducts();
        document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'favorites') {
        currentFilter = 'Favorites';
        document.getElementById('shop-title').textContent = "Your Favorites";
        filterProducts();
        document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// --- ADMIN DASHBOARD LOGIC ---

// --- SECURED ADMIN DASHBOARD LOGIC ---

function toggleAdminView() {
    // 1. Password Protection Check
    const password = prompt("Enter Admin Password:");

    if (password === "Manish@123") {
        // Correct password - proceed to open
        isAdminView = !isAdminView;
        
        const mainView = document.getElementById('main-view');
        const adminView = document.getElementById('admin-view');
        const categoryBar = document.getElementById('category-bar');
        const mobileSearch = document.getElementById('mobile-search-bar');

        if (isAdminView) {
            mainView.classList.add('hidden');
            categoryBar.classList.add('hidden');
            mobileSearch.classList.add('hidden');
            adminView.classList.remove('hidden');
            renderAdminTable();
            renderAdminBanners();
            window.scrollTo(0, 0);
        } else {
            adminView.classList.add('hidden');
            mainView.classList.remove('hidden');
            categoryBar.classList.remove('hidden');
            mobileSearch.classList.remove('hidden');
            filterProducts();
            window.scrollTo(0, 0);
        }
    } else if (password !== null) {
        // Wrong password entered (but they didn't click Cancel)
        alert("Incorrect password! Access denied.");
    }
}

function renderAdminTable() {
    const tbody = document.getElementById('admin-product-table');
    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500">No products found. Add one to get started.</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(p => `
        <tr class="hover:bg-gray-50 transition-colors group">
            <td class="p-5 flex items-center gap-4">
                <img src="${p.images[0]}" class="w-14 h-14 rounded-xl object-cover border border-gray-200">
                <div>
                    <div class="font-medium text-gray-900">${p.name}</div>
                    <div class="text-xs text-gray-500">${p.images.length} Image(s)</div>
                </div>
            </td>
            <td class="p-5 text-sm text-gray-600">${p.category} ${p.subCategory ? `› ${p.subCategory}` : ''}</td>
            <td class="p-5 text-sm font-medium">$${p.price}</td>
            <td class="p-5">
                ${p.isNew ? '<span class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-lg font-medium">New</span>' : '<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">Standard</span>'}
            </td>
            <td class="p-5 text-right">
                <button onclick="openAdminModal(${p.id})" class="text-gray-400 hover:text-blue-600 transition-colors p-2" title="Edit">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button onclick="deleteProduct(${p.id})" class="text-gray-400 hover:text-red-600 transition-colors p-2" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function openAdminModal(id = null) {
    const title = document.getElementById('admin-modal-title');
    const form = document.getElementById('admin-form');
    
    if (id) {
        const product = products.find(p => p.id === id);
        title.textContent = "Edit Product";
        document.getElementById('admin-id').value = product.id;
        document.getElementById('admin-name').value = product.name;
        document.getElementById('admin-price').value = product.price;
        document.getElementById('admin-category').value = product.category;
        document.getElementById('admin-subcategory').value = product.subCategory || '';
        document.getElementById('admin-images').value = product.images.join(', ');
        document.getElementById('admin-video').value = product.video || '';
        document.getElementById('admin-description').value = product.description;
        document.getElementById('admin-isnew').checked = product.isNew;document.getElementById('admin-brand').value = product.brand || '';
document.getElementById('admin-stock').value = product.stock || '';
document.getElementById('admin-material').value = product.material || '';
document.getElementById('admin-warranty').value = product.warranty || '';
document.getElementById('admin-size-type').value = product.sizeType || 'none';
document.getElementById('admin-colors').value = product.colors ? product.colors.join(', ') : '';
    } else {
        title.textContent = "Add New Product";
        form.reset();
        document.getElementById('admin-size-type').value = 'none';
document.getElementById('admin-colors').value = '';
        document.getElementById('admin-id').value = '';document.getElementById('admin-brand').value = '';
document.getElementById('admin-stock').value = '';
document.getElementById('admin-material').value = '';
document.getElementById('admin-warranty').value = '';
    }

    document.getElementById('admin-product-modal').classList.remove('hidden');
    document.getElementById('admin-product-modal').classList.add('flex');
}

function closeAdminModal() {
    document.getElementById('admin-product-modal').classList.add('hidden');
    document.getElementById('admin-product-modal').classList.remove('flex');
}

function saveAdminProduct(event) {
    event.preventDefault();
    
    const idField = document.getElementById('admin-id').value;
    const imagesRaw = document.getElementById('admin-images').value;
    const imagesArray = imagesRaw.split(',').map(url => url.trim()).filter(url => url !== '');

    const productData = {
        name: document.getElementById('admin-name').value,
        price: parseFloat(document.getElementById('admin-price').value),
        category: document.getElementById('admin-category').value,
        subCategory: document.getElementById('admin-subcategory').value || null,
        images: imagesArray.length > 0 ? imagesArray : ["https://picsum.photos/600/600"],video: document.getElementById('admin-video').value.trim() || null, // fallback image
        description: document.getElementById('admin-description').value,
        isNew: document.getElementById('admin-isnew').checked,brand: document.getElementById('admin-brand').value.trim() || 'Generic',
        sizeType: document.getElementById('admin-size-type').value,
colors: document.getElementById('admin-colors').value ? document.getElementById('admin-colors').value.split(',').map(c => c.trim()).filter(c => c !== '') : [],
stock: parseInt(document.getElementById('admin-stock').value) || 10,
material: document.getElementById('admin-material').value.trim() || 'Standard Quality',
warranty: document.getElementById('admin-warranty').value.trim() || 'No Warranty',

    };

    if (idField) {
        // Edit existing
        const index = products.findIndex(p => p.id === parseInt(idField));
        if (index !== -1) {
            // Keep existing ratings and comments
            productData.id = products[index].id;
            productData.rating = products[index].rating;
            productData.reviews = products[index].reviews;
            productData.comments = products[index].comments;
            products[index] = productData;
            showToast("Product updated successfully");
        }
    } else {
        // Create new
        productData.id = Date.now(); // Generate unique ID
        productData.rating = 0;
        productData.reviews = [];
        productData.comments = [];
        products.unshift(productData); // Add to beginning of array
        showToast("New product added!");
    }

    saveDataSafely();
    closeAdminModal();
    renderAdminTable();
}

function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        products = products.filter(p => p.id !== id);
        
        // Remove from cart and wishlist if present
        cart = cart.filter(item => item.id !== id);
        wishlist.delete(id);
        
        saveDataSafely();
        updateCartCount();
        renderAdminTable();
        showToast("Product deleted");
    }
}


// --- FILTERING & RENDERING (STOREFRONT) ---

function renderCategoryFilters() {
    const categories = ['All', 'Electronics', 'Fashion', 'Men', 'Women', 'Kids', 'Home', 'Sports', 'Beauty'];
    let html = '';
    categories.forEach(cat => {
        const isActive = cat === currentFilter ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200';
        html += `<button onclick="filterByCategory('${cat}')" class="category-btn px-6 py-2 rounded-3xl text-sm font-medium transition-all ${isActive}">${cat}</button>`;
    });
    document.getElementById('category-filters').innerHTML = html;
}

function renderCategories() {
    const categories = [
        { name: "Electronics", icon: "📱", color: "bg-blue-100" },
        { name: "Fashion", icon: "👕", color: "bg-pink-100" },
        { name: "Home", icon: "🏠", color: "bg-amber-100" },
        { name: "Beauty", icon: "✨", color: "bg-purple-100" },
        { name: "Sports", icon: "⚽", color: "bg-green-100" },
        { name: "Kids", icon: "🧸", color: "bg-orange-100" }
    ];
    let html = '';
    categories.forEach(cat => {
        html += `<div onclick="filterByCategory('${cat.name}')" class="cursor-pointer ${cat.color} rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform"><div class="text-6xl mb-6">${cat.icon}</div><h3 class="font-semibold text-xl">${cat.name}</h3></div>`;
    });
    document.getElementById('category-grid').innerHTML = html;
}

function filterByCategory(category) {
    currentFilter = category;
    document.getElementById('shop-title').textContent = category === 'All' ? "Featured Products" : `${category} Products`;
    renderCategoryFilters();
    filterProducts();
    document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filterProducts() {
    let filtered = [...products];
    
    if (currentFilter === 'Favorites') {
        filtered = filtered.filter(p => wishlist.has(p.id));
    } else if (currentFilter !== 'All') {
        filtered = filtered.filter(p => p.category === currentFilter || p.subCategory === currentFilter);
    }
    
    const searchDesktop = document.getElementById('search-input').value.toLowerCase().trim();
    const searchMobile = document.getElementById('search-input-mobile').value.toLowerCase().trim();
    const searchTerm = searchDesktop || searchMobile;
    
    if (searchTerm) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm));
    }

    const sortMode = document.getElementById('sort-select').value;
    if (sortMode === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sortMode === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (sortMode === 'rating') filtered.sort((a, b) => b.rating - a.rating);

    renderProducts(filtered);
}

function renderProducts(filteredProducts) {
    const container = document.getElementById('product-grid');
    if (filteredProducts.length === 0) {
        container.innerHTML = `<div class="col-span-full py-20 text-center text-gray-500 text-lg">No products found matching your criteria.</div>`;
        document.getElementById('results-count').textContent = `Showing 0 products`;
        return;
    }

    let html = '';
    filteredProducts.forEach(product => {
        const img1 = product.images[0];
        const img2 = product.images.length > 1 ? product.images[1] : img1;

        html += `
    <div onclick="showProductModal(${product.id})" class="product-card bg-white rounded-3xl overflow-hidden cursor-pointer border border-gray-100">
        <div class="relative overflow-hidden group">
            <img src="${img1}" 
                 onmouseover="this.src='${img2}'" 
                 onmouseout="this.src='${img1}'"
                 alt="${product.name}" class="w-full h-72 object-cover transition-all duration-500 group-hover:scale-105">
            
            ${product.isNew ? `<div class="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-3xl shadow-md z-10">NEW</div>` : ''}
            
            <button onclick="event.stopImmediatePropagation(); toggleWishlist(${product.id});" 
                    class="heart absolute top-4 left-4 flex items-center justify-center w-11 h-11 rounded-full bg-white/70 backdrop-blur-sm transition-all hover:bg-white z-10 ${wishlist.has(product.id) ? 'text-red-500' : 'text-gray-400'}">
                <i class="fa-solid fa-heart text-xl ${wishlist.has(product.id) ? 'active' : ''}"></i>
            </button> 
            
            <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur text-sm font-semibold px-4 py-2 rounded-3xl shadow z-10">
                $${product.price}
            </div>
        </div>
        <div class="p-6">
            <div class="text-xs text-gray-500 mb-1">${product.category} ${product.subCategory ? `› ${product.subCategory}` : ''}</div>
            <h3 class="font-semibold leading-tight line-clamp-2 mb-4 h-10">${product.name}</h3>
            <div class="flex items-center justify-between">
                <div class="flex text-yellow-400 text-sm">${getStars(product.rating)}</div>
                <button onclick="event.stopImmediatePropagation(); addToCart(${product.id});" 
                        class="bg-black text-white text-xs font-medium px-5 py-2.5 rounded-3xl hover:bg-gray-800 transition-colors">
                    Add to cart
                </button>
            </div>
        </div>
    </div>`;
    });

    container.innerHTML = html;
    document.getElementById('results-count').textContent = `Showing ${filteredProducts.length} products`;
}

// --- PRODUCT MODAL & REVIEWS ---

function showProductModal(id) {
    currentProduct = products.find(p => p.id === id);
    if (!currentProduct) return;

    // Reset index to the first image every time a modal opens
    currentImageIndex = 0;
    const showArrows = currentProduct.images.length > 1;

    // 1. Image View with Left & Right Arrow Buttons
    const mainImgHtml = `
        <div class="relative w-full h-[380px] flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden group">
            <button onclick="closeModal()" class="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center text-xl transition-colors shadow">×</button>
            
            ${showArrows ? `
                <button onclick="event.stopPropagation(); navigateModalImage(-1)" class="absolute left-3 top-1/2 -translate-y-1/2 z-40 bg-white/80 hover:bg-white text-black w-9 h-9 rounded-full flex items-center justify-center shadow transition-all opacity-0 group-hover:opacity-100">
                    <i class="fa-solid fa-chevron-left text-sm"></i>
                </button>
                <button onclick="event.stopPropagation(); navigateModalImage(1)" class="absolute right-3 top-1/2 -translate-y-1/2 z-40 bg-white/80 hover:bg-white text-black w-9 h-9 rounded-full flex items-center justify-center shadow transition-all opacity-0 group-hover:opacity-100">
                    <i class="fa-solid fa-chevron-right text-sm"></i>
                </button>
            ` : ''}

            <img id="modal-main-display" src="${currentProduct.images[0]}" class="w-full h-full object-cover transition-all duration-300">
        </div>
    `;
    
    let thumbnailsHtml = '';
    if (currentProduct.images.length > 1 || currentProduct.video) {
        thumbnailsHtml = `<div class="flex gap-2 mt-3 overflow-x-auto pb-1 max-w-full justify-start">`;
        
        // This loops your images
        currentProduct.images.forEach((img, idx) => {
            const activeClass = idx === 0 ? 'border-2 border-yellow-400 opacity-100' : 'border border-gray-200 opacity-60';
            thumbnailsHtml += `
                <img src="${img}" 
                     class="modal-thumb w-16 h-16 object-cover rounded-xl cursor-pointer hover:opacity-100 transition-all shrink-0 ${activeClass}" 
                     onclick="switchModalMedia(this, 'image', '${img}', ${idx})">`;
        });

        // NEW: This adds the video button next to your images!
        if (currentProduct.video) {
            thumbnailsHtml += `
                <div class="modal-thumb w-16 h-16 bg-gray-900 flex flex-col items-center justify-center rounded-xl cursor-pointer text-white opacity-70 hover:opacity-100 transition-all border border-gray-200 shrink-0"
                     onclick="switchModalMedia(this, 'video', '${currentProduct.video}', -1)">
                     <i class="fa-solid fa-circle-play text-xl text-yellow-400"></i>
                     <span class="text-[9px] font-bold mt-1 uppercase tracking-tighter">Video</span>
                </div>
            `;
        }
        thumbnailsHtml += `</div>`;
    }
    
    // Inject image panel
    document.getElementById('modal-image').innerHTML = `
        <div class="w-full flex flex-col p-2">
            ${mainImgHtml}
            ${thumbnailsHtml}
        </div>
    `;
    
    // 2. Populate text details on the right side panel
    document.getElementById('modal-name').textContent = currentProduct.name;
    document.getElementById('modal-category').textContent = `${currentProduct.category} ${currentProduct.subCategory ? `› ${currentProduct.subCategory}` : ''}`;
    document.getElementById('modal-price').innerHTML = `$${currentProduct.price} <span class="text-base font-normal text-gray-400">USD</span>`;
    document.getElementById('modal-stars').innerHTML = getStars(currentProduct.rating);
    document.getElementById('modal-rating').textContent = `${currentProduct.rating > 0 ? currentProduct.rating.toFixed(1) : 'No'} • ${currentProduct.reviews.length} reviews`;
    document.getElementById('modal-description').textContent = currentProduct.description;
    // 1. Add a Stock Status badge under the description
    const stockQty = currentProduct.stock || 10;
    const isOutOfStock = stockQty <= 0;
    
    let stockHtml = '';
    if (isOutOfStock) {
        stockHtml = `<span class="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-lg mt-2">❌ Out of Stock</span>`;
    } else if (stockQty <= 5) {
        stockHtml = `<span class="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-lg mt-2">⚠️ Only ${stockQty} left in stock!</span>`;
    } else {
        stockHtml = `<span class="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-lg mt-2">✅ In Stock</span>`;
    }

    // 2. Create a clean details table dynamically
    const specsTableHtml = `
        <div class="mt-4">${stockHtml}</div>
        <div class="mt-6 border-t pt-4">
            <h4 class="text-sm font-bold text-gray-900 tracking-wide uppercase mb-3">Product Specifications</h4>
            <div class="border rounded-2xl overflow-hidden bg-gray-50 text-xs divide-y divide-gray-200">
                <div class="grid grid-cols-3 p-3"><span class="font-semibold text-gray-500">Brand</span><span class="col-span-2 text-gray-800 font-medium">${currentProduct.brand || 'M.Y Store'}</span></div>
                <div class="grid grid-cols-3 p-3"><span class="font-semibold text-gray-500">Material</span><span class="col-span-2 text-gray-800">${currentProduct.material || 'Premium Quality'}</span></div>
                <div class="grid grid-cols-3 p-3"><span class="font-semibold text-gray-500">Warranty</span><span class="col-span-2 text-gray-800">${currentProduct.warranty || 'No Warranty Cover'}</span></div>
            </div>
        </div>
    `;

    // Remove any previously injected specs block if it exists, then add the new one
    const oldSpecs = document.getElementById('modal-specs-block');
    if (oldSpecs) oldSpecs.remove();

    const specsWrapper = document.createElement('div');
    specsWrapper.id = 'modal-specs-block';
    specsWrapper.innerHTML = specsTableHtml;
    
    // Injects it right below the description text on the user interface
    document.getElementById('modal-description').after(specsWrapper);

    // SMART SIZES AND COLORS DISPLAY ENGINE
    const sizeContainer = document.getElementById('modal-sizes-container');
    const sizeRow = document.getElementById('size-selector-row');
    const sizeType = currentProduct.sizeType || 'none';

    if (sizeType === 'clothing') {
        sizeContainer.classList.remove('hidden');
        sizeRow.innerHTML = `
            <button onclick="selectSize(this, 'S')" class="size-btn w-11 h-11 border rounded-xl flex items-center justify-center text-sm font-semibold hover:border-black transition-all">S</button>
            <button onclick="selectSize(this, 'M')" class="size-btn w-11 h-11 border rounded-xl flex items-center justify-center text-sm font-semibold hover:border-black transition-all">M</button>
            <button onclick="selectSize(this, 'L')" class="size-btn w-11 h-11 border rounded-xl flex items-center justify-center text-sm font-semibold hover:border-black transition-all">L</button>
            <button onclick="selectSize(this, 'XL')" class="size-btn w-11 h-11 border rounded-xl flex items-center justify-center text-sm font-semibold hover:border-black transition-all">XL</button>
        `;
    } else if (sizeType === 'shoes') {
        sizeContainer.classList.remove('hidden');
        const shoeSizes = [6, 7, 8, 9, 10, 11, 12];
        sizeRow.innerHTML = shoeSizes.map(sz => `
            <button onclick="selectSize(this, 'UK ${sz}')" class="size-btn w-14 h-11 border rounded-xl flex items-center justify-center text-xs font-semibold hover:border-black transition-all">UK ${sz}</button>
        `).join('');
    } else {
        sizeContainer.classList.add('hidden');
    }

    // COLORS DISPLAY
    const oldColorBlock = document.getElementById('modal-color-container');
    if (oldColorBlock) oldColorBlock.remove();

    if (currentProduct.colors && currentProduct.colors.length > 0) {
        const colorContainer = document.createElement('div');
        colorContainer.id = 'modal-color-container';
        colorContainer.className = 'mt-6';
        colorContainer.innerHTML = `
            <p class="text-xs font-semibold tracking-widest text-gray-500 mb-3 uppercase">Select Color</p>
            <div class="flex flex-wrap gap-2">
                ${currentProduct.colors.map(color => `
                    <button onclick="selectColor(this, '${color}')" class="color-variant-btn px-4 py-2 border rounded-xl text-xs font-medium hover:border-black transition-all bg-white text-gray-800">${color}</button>
                `).join('')}
            </div>
        `;
        sizeContainer.before(colorContainer);
    }
    // (Inside showProductModal): Calculate and render sample dynamic target pricing values
    document.getElementById('modal-mrp').textContent = "$" + Math.round(currentProduct.price * 1.25);
    
    // Clear delivery feedback messages and selection states
    selectedProductSize = null;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('bg-black', 'text-white', 'border-black'));
    document.getElementById('saved-address-msg').classList.add('hidden');
    document.getElementById('delivery-address-input').value = savedShippingAddress || "";

    renderComments();

    document.getElementById('product-modal').classList.remove('hidden');
    document.getElementById('product-modal').classList.add('flex');
}

function switchModalImage(element, imageUrl, index) {
    currentImageIndex = index;
    
    // 1. Swap main image source
    document.getElementById('modal-main-display').src = imageUrl;
    
    // 2. Remove highlight border from all thumbnails
    document.querySelectorAll('.modal-thumb').forEach(thumb => {
        thumb.classList.remove('border-2', 'border-yellow-400', 'opacity-100');
        thumb.classList.add('border', 'border-gray-200', 'opacity-60');
    });
    
    // 3. Highlight the correct active thumbnail
    if (element) {
        element.classList.remove('border-gray-200', 'opacity-60');
        element.classList.add('border-2', 'border-yellow-400', 'opacity-100');
    } else {
        const thumbs = document.querySelectorAll('.modal-thumb');
        if (thumbs[index]) {
            thumbs[index].classList.remove('border-gray-200', 'opacity-60');
            thumbs[index].classList.add('border-2', 'border-yellow-400', 'opacity-100');
        }
    }
}

function navigateModalImage(direction) {
    if (!currentProduct || !currentProduct.images || currentProduct.images.length <= 1) return;
    
    // Calculate next or previous image index
    let newIndex = currentImageIndex + direction;
    
    // Loop back to the start or end if out of bounds
    if (newIndex < 0) newIndex = currentProduct.images.length - 1;
    if (newIndex >= currentProduct.images.length) newIndex = 0;
    
    switchModalImage(null, currentProduct.images[newIndex], newIndex);
}

function closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
    document.getElementById('product-modal').classList.remove('flex');
}

function renderComments() {
    const list = document.getElementById('comments-list');
    if (!currentProduct.comments || currentProduct.comments.length === 0) {
        list.innerHTML = `<p class="text-gray-500 italic">No comments yet. Be the first to review!</p>`;
        return;
    }

    list.innerHTML = currentProduct.comments.map(c => `
        <div class="bg-gray-50 p-4 rounded-2xl">
            <div class="flex justify-between items-center mb-2">
                <span class="font-semibold text-sm">${c.user}</span>
                <span class="text-xs text-gray-400">${c.date}</span>
            </div>
            <div class="text-yellow-400 text-xs mb-2">${getStars(c.score)}</div>
            <p class="text-sm text-gray-700">${c.text}</p>
        </div>
    `).join('');
}

function submitReview() {
    if (!currentUser) {
        showToast("⚠️ Please sign in to leave a review");
        toggleAuthModal();
        return;
    }

    const text = document.getElementById('comment-input').value.trim();
    const score = parseInt(document.getElementById('review-score').value);

    if (text) {
        const now = new Date();
        const dateString = `${now.toLocaleDateString()} at ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        
        currentProduct.comments.unshift({ user: currentUser.name, text: text, score: score, date: dateString });
        currentProduct.reviews.push(score);
        
        const total = currentProduct.reviews.reduce((sum, val) => sum + val, 0);
        currentProduct.rating = total / currentProduct.reviews.length;

        saveData(); // Save rating to local storage

        document.getElementById('comment-input').value = '';
        renderComments();
        document.getElementById('modal-stars').innerHTML = getStars(currentProduct.rating);
        document.getElementById('modal-rating').textContent = `${currentProduct.rating.toFixed(1)} • ${currentProduct.reviews.length} reviews`;
        filterProducts(); 
        
        showToast("✅ Review submitted successfully!");
    } else {
        showToast("⚠️ Please write a comment first");
    }
}

// --- CART & WISHLIST ---

function toggleWishlist(id) {
    if (wishlist.has(id)) {
        wishlist.delete(id);
        showToast("Removed from favorites");
    } else {
        wishlist.add(id);
        showToast("Added to favorites ❤️");
    }
    
    if (currentFilter === 'Favorites') {
        filterProducts();
    } else {
        filterProducts(); 
    }
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const existing = cart.find(item => item.id === id);
    if (existing) existing.quantity = (existing.quantity || 1) + 1;
    else cart.push({ ...product, quantity: 1 });
    updateCartCount();
    showToast(`${product.name} added to cart!`);
}

function addCurrentToCart() {
    if (currentProduct) {
        addToCart(currentProduct.id);
        closeModal();
    }
}

function buyCurrentNow() {
    if (currentProduct) {
        // 1. Put the product into the cart automatically
        const product = products.find(p => p.id === currentProduct.id);
        if (product) {
            const existing = cart.find(item => item.id === product.id);
            if (existing) {
                existing.quantity = (existing.quantity || 1) + 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            updateCartCount();
        }
        
        // 2. Shut the product details view down
        closeModal();
        
        // 3. Immediately trigger the checkout procedure 
        checkout();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
    updateCartCount();
}

function changeQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity = Math.max(1, (item.quantity || 1) + delta);
        renderCart();
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full py-20 text-center">
                <div class="text-6xl mb-6 opacity-30">🛍️</div>
                <h3 class="font-medium">Your cart is empty</h3>
                <p class="text-sm text-gray-500 mt-3">When you add products, they'll appear here</p>
            </div>`;
        document.getElementById('cart-subtotal').textContent = '$0';
        document.getElementById('cart-total').textContent = '$0';
        return;
    }

    let html = '';
    let subtotal = 0;

    cart.forEach(item => {
        const qty = item.quantity || 1;
        const itemTotal = item.price * qty;
        subtotal += itemTotal;

        html += `
            <div class="flex gap-x-5 border-b pb-6 last:border-b-0">
                <img src="${item.images[0]}" class="w-20 h-20 object-cover rounded-2xl" alt="${item.name}">
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between">
                        <div class="font-medium text-sm leading-tight pr-2">${item.name}</div>
                        <div class="font-semibold text-right">$${itemTotal}</div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">${item.category}</div>
                    
                    <div class="flex items-center justify-between mt-4">
                        <div class="flex items-center border border-gray-200 rounded-3xl">
                            <button onclick="changeQuantity(${item.id}, -1)" class="w-8 h-8 flex items-center justify-center text-lg font-light hover:bg-gray-100 rounded-l-3xl">-</button>
                            <div class="px-4 font-medium">${qty}</div>
                            <button onclick="changeQuantity(${item.id}, 1)" class="w-8 h-8 flex items-center justify-center text-lg font-light hover:bg-gray-100 rounded-r-3xl">+</button>
                        </div>
                        <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-600 text-sm font-medium">Remove</button>
                    </div>
                </div>
            </div>`;
    });

    container.innerHTML = html;
    document.getElementById('cart-subtotal').textContent = '$' + subtotal;
    document.getElementById('cart-total').textContent = '$' + subtotal;
}

function updateCartCount() {
    let count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.getElementById('cart-count').textContent = count;
}

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer.classList.contains('hidden')) {
        drawer.classList.remove('hidden');
        setTimeout(() => drawer.style.transform = 'translateX(0)', 10);
        renderCart();
    } else {
        drawer.style.transform = 'translateX(100%)';
        setTimeout(() => drawer.classList.add('hidden'), 400);
    }
}


// --- AUTHENTICATION ---

function toggleAuthModal() {
    if (currentUser) {
        currentUser = null;
        document.getElementById('user-display-name').textContent = "Login";
        showToast("Logged out successfully");
        if(isAdminView) toggleAdminView(); 
    } else {
        isLoginMode = true;
        updateAuthUI();
        document.getElementById('auth-modal').classList.remove('hidden');
        document.getElementById('auth-modal').classList.add('flex');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function processAuth() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    
    if (!email || !password) {
        showToast("⚠️ Missing email or password details.");
        return;
    }

    let accountDetails = null;

    if (!isLoginMode) {
        const firstName = document.getElementById('auth-firstname').value.trim();
        const lastName = document.getElementById('auth-lastname').value.trim();
        const phone = document.getElementById('auth-phone').value.trim();
        const age = document.getElementById('auth-age').value.trim();

        if(!firstName || !lastName || !phone || !age) {
            showToast("⚠️ Please populate all registration metrics.");
            return;
        }

        accountDetails = { email, password, firstName, lastName, phone, age, addresses: [] };
        registeredUsersList.push(accountDetails);
        localStorage.setItem('M.Y Store_users', JSON.stringify(registeredUsersList));
    } else {
        const matchedUser = registeredUsersList.find(u => u.email === email && u.password === password);
        if (matchedUser) {
            accountDetails = matchedUser;
        } else {
            accountDetails = { email, password, firstName: email.split('@')[0], lastName: '', phone: 'N/A', age: 'N/A', addresses: [] };
        }
    }

    currentUser = { name: accountDetails.firstName, email: email, details: accountDetails };
    
    // Add to active multiple profiles tracking session if not already existing
    if(!activeProfilesList.some(p => p.email === email)) {
        activeProfilesList.push({ name: accountDetails.firstName, email, details: accountDetails });
        localStorage.setItem('M.Y Store_active_profiles', JSON.stringify(activeProfilesList));
    }

    document.getElementById('user-display-name').textContent = currentUser.name;
    closeAuthModal();
    showToast(`Welcome, ${currentUser.name}! 🎉`);
}



// --- FOOTER PAGES & HELP CENTER VIEWS ---
function showPage(title) {
    document.getElementById('generic-title').textContent = title;
    
    let contentHtml = `<p class="mb-4">Welcome to the official <strong>${title}</strong> page for M.Y Store.</p>`;
    
    // 1. If user clicks "Help Center"
    if (title === 'Help Center') {
        contentHtml += `
            <div class="space-y-4 text-sm text-gray-700">
                <p class="text-gray-500">Find quick answers to your questions or submit a support ticket below.</p>
                
                <div class="space-y-3 mt-4">
                    <div class="p-3 bg-gray-50 border rounded-xl">
                        <strong class="block text-gray-900">📦 How can I manage my delivery addresses?</strong>
                        <span class="text-xs text-gray-600 block mt-1">Click your profile name -> select "Manage Account & Addresses". There you can add or remove multiple shipping locations.</span>
                    </div>
                    <div class="p-3 bg-gray-50 border rounded-xl">
                        <strong class="block text-gray-900">💳 Where are my AppCash and Gift Card balances?</strong>
                        <span class="text-xs text-gray-600 block mt-1">All your wallet credits, gift cards, and saved payment profiles are listed under "Payment & Currencies".</span>
                    </div>
                    <div class="p-3 bg-gray-50 border rounded-xl">
                        <strong class="block text-gray-900">🔄 How do I switch accounts?</strong>
                        <span class="text-xs text-gray-600 block mt-1">Open the Profile menu, click "Add Multiple Account" to log in to another profile, then simply click on any active user in the profile list to switch instantly.</span>
                    </div>
                </div>

                <div class="bg-gray-100 p-4 rounded-2xl border mt-6">
                    <span class="block font-bold text-xs mb-2 text-gray-900">Still need help? Submit a support message:</span>
                    <textarea id="help-center-msg" class="w-full p-3 text-xs rounded-xl border bg-white outline-none focus:border-yellow-400" rows="3" placeholder="Describe your problem here..."></textarea>
                    <button onclick="closePage(); showToast('Support ticket sent to our customer service team!')" class="mt-2 bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors hover:bg-gray-800">Submit Ticket</button>
                </div>
            </div>
        `;
    } 
    // 2. If user clicks "Privacy Policy" or "Terms & Conditions"
    else if (title.includes('Policy') || title.includes('Terms')) {
        contentHtml += `
            <h3 class="font-bold mt-6 mb-2 text-black">1. Acceptance of Terms</h3>
            <p class="mb-4">By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement.</p>
            <h3 class="font-bold mt-4 mb-2 text-black">2. Modification</h3>
            <p class="mb-4">We reserve the right to change these conditions from time to time as we see fit and your continued use of the site will signify your acceptance of any adjustment.</p>
        `;
    } 
    // 3. If user clicks "Contact Us"
    else if (title === 'Contact Us') {
        contentHtml += `
            <p class="mb-2"><strong>Email:</strong> support@MyStore.com</p>
            <p class="mb-2"><strong>Phone:</strong> +1 (800) 123-4567</p>
            <p class="mb-6"><strong>Address:</strong> 123 Commerce Blvd, Tech City, TC 90210</p>
            <div class="bg-gray-100 p-6 rounded-2xl">
                <p class="text-sm font-semibold mb-2 text-gray-900">Send us a message:</p>
                <textarea class="w-full p-3 rounded-xl border bg-white mb-3 outline-none focus:border-yellow-400 text-xs" rows="3" placeholder="How can we help?"></textarea>
                <button onclick="closePage(); showToast('Message sent!')" class="bg-black text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-gray-800">Send</button>
            </div>
        `;
    } 
    // 4. Fallback for other standard pages (About Us, Careers, etc.)
    else {
        contentHtml += `<p class="mb-4">This section is currently being updated. Please check back later for full details regarding our ${title}.</p>`;
    }
    
    contentHtml += `<p class="mt-8 text-[10px] text-gray-400">Last updated: ${new Date().toLocaleDateString()}</p>`;

    document.getElementById('generic-content').innerHTML = contentHtml;
    document.getElementById('generic-modal').classList.remove('hidden');
    document.getElementById('generic-modal').classList.add('flex');
}

function closePage() {
    document.getElementById('generic-modal').classList.add('hidden');
    document.getElementById('generic-modal').classList.remove('flex');
}

// --- UTILS ---

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = "position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#111;color:white;padding:14px 28px;border-radius:9999px;z-index:9999;white-space:nowrap;box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.3);";
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => { 
        toast.style.transition = 'all 0.3s'; 
        toast.style.opacity = '0'; 
        toast.style.transform = 'translateX(-50%) translateY(20px)'; 
        setTimeout(() => toast.remove(), 300); 
    }, 2500);
}

function getStars(rating) {
    if(!rating) return '☆☆☆☆☆';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(empty);
}

// Close the product details modal if a user clicks on the dark backdrop area
document.getElementById('product-modal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeModal();
    }
});

function renderHeroSlider() {
    const container = document.getElementById('hero-slider-container');
    const dotsContainer = document.getElementById('hero-slider-dots');
    if (!container) return;

    if (banners.length === 0) {
        container.innerHTML = `
            <div class="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-center shrink-0">
                <h1 class="text-4xl font-bold mb-2">Welcome to M.Y Store</h1>
                <p class="text-gray-400">Add banner offers inside the admin panel dashboard control workspace.</p>
            </div>`;
        dotsContainer.innerHTML = '';
        return;
    }

    container.innerHTML = banners.map(slide => `
        <div class="w-full h-full shrink-0 relative flex items-center" style="background: linear-gradient(rgba(3,3,3,0.4), rgba(3,3,3,0.6)), url('${slide.image}') center/cover no-repeat;">
            <div class="max-w-7xl mx-auto px-6 w-full">
                <div class="max-w-2xl">
                    <div class="inline-flex items-center gap-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-3xl text-sm mb-6">
                        <span class="bg-yellow-400 text-black px-3 py-1 rounded-3xl font-semibold">${slide.badge || 'OFFER'}</span>
                        <span>Special Offer</span>
                    </div>
                    <h1 class="text-5xl md:text-7xl font-bold leading-tight mb-6 logo-font tracking-tighter">${slide.title}</h1>
                    <p class="text-xl mb-10 text-white/90">${slide.desc}</p>
                    <button onclick="filterByCategory('${slide.targetCategory || 'All'}')" class="bg-yellow-400 text-black hover:bg-yellow-300 transition-colors font-semibold px-8 py-4 rounded-3xl text-lg">
                        Explore ${slide.targetCategory === 'All' || !slide.targetCategory ? 'Offers' : slide.targetCategory}
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    dotsContainer.innerHTML = banners.map((_, idx) => `
        <button onclick="setHeroSlide(${idx})" class="w-3 h-3 rounded-full transition-all ${idx === currentHeroIndex ? 'bg-yellow-400 scale-125' : 'bg-white/50 hover:bg-white'}"></button>
    `).join('');
    
    updateHeroSliderPosition();
}

function navigateHeroSlider(direction) {
    if (banners.length <= 1) return;
    currentHeroIndex += direction;
    if (currentHeroIndex < 0) currentHeroIndex = banners.length - 1;
    if (currentHeroIndex >= banners.length) currentHeroIndex = 0;
    updateHeroSliderPosition();
}

function setHeroSlide(index) {
    currentHeroIndex = index;
    updateHeroSliderPosition();
}

function updateHeroSliderPosition() {
    const container = document.getElementById('hero-slider-container');
    if (container) {
        container.style.transform = `translateX(-${currentHeroIndex * 100}%)`;
    }
    const dots = document.querySelectorAll('#hero-slider-dots button');
    dots.forEach((dot, idx) => {
        if (idx === currentHeroIndex) {
            dot.classList.remove('bg-white/50');
            dot.classList.add('bg-yellow-400', 'scale-125');
        } else {
            dot.classList.add('bg-white/50');
            dot.classList.remove('bg-yellow-400', 'scale-125');
        }
    });
}

function renderAdminBanners() {
    const targetDiv = document.getElementById('admin-banners-list');
    if(!targetDiv) return;
    
    if(banners.length === 0){
        targetDiv.innerHTML = `<p class="col-span-full text-gray-400 italic text-sm text-center py-4">No slider advertisements configured yet.</p>`;
        return;
    }
    
    targetDiv.innerHTML = banners.map((b, index) => `
        <div class="border rounded-xl p-3 bg-gray-50 flex flex-col gap-2 relative group">
            <img src="${b.image}" class="w-full h-24 object-cover rounded-lg border">
            <div>
                <span class="text-[10px] bg-yellow-400 font-bold px-1.5 py-0.5 rounded text-black">${b.badge}</span>
                <div class="font-bold text-xs truncate mt-1">${b.title}</div>
                <div class="text-[10px] text-gray-500">Links to: ${b.targetCategory || 'All'}</div>
            </div>
            <button onclick="deleteAdminBanner(${index})" class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');
}

function saveAdminBanner() {
    const imgValue = document.getElementById('adv-img').value.trim();
    const badgeValue = document.getElementById('adv-badge').value.trim() || "OFFER";
    const titleValue = document.getElementById('adv-title').value.trim() || "Special Deal";
    const descValue = document.getElementById('adv-desc').value.trim() || "Limited validity period discount checkout layout.";
    const catValue = document.getElementById('adv-category').value;

    if(!imgValue) {
        showToast("⚠️ Image link field is mandatory.");
        return;
    }

    banners.push({
        id: Date.now(),
        image: imgValue,
        badge: badgeValue.toUpperCase(),
        title: titleValue,
        desc: descValue,
        targetCategory: catValue
    });

    localStorage.setItem('shopsphere_banners', JSON.stringify(banners));
    
    document.getElementById('adv-img').value = '';
    document.getElementById('adv-badge').value = '';
    document.getElementById('adv-title').value = '';
    document.getElementById('adv-desc').value = '';
    document.getElementById('adv-category').value = 'All';
    
    showToast("✅ Banner Slider added to storefront rotation.");
    renderAdminBanners();
    renderHeroSlider();
}

function deleteAdminBanner(index) {
    if(confirm("Remove this slider frame display completely?")){
        banners.splice(index, 1);
        localStorage.setItem('shopsphere_banners', JSON.stringify(banners));
        currentHeroIndex = 0;
        renderAdminBanners();
        renderHeroSlider();
        showToast("Slider graphic item deleted.");
    }
}

// --- NEW PROFILE MENU WINDOW MANAGEMENT ROUTINES ---

function showManageAccountPage() {
    document.getElementById('user-dropdown').classList.add('hidden');
    document.getElementById('generic-title').textContent = "Manage Account Details";
    
    if(!currentUser.details.addresses) currentUser.details.addresses = [];
    
    let addrListHtml = currentUser.details.addresses.map((addr, index) => `
        <div class="flex justify-between items-center p-3 bg-gray-50 border rounded-xl text-sm">
            <span>${addr}</span>
            <button onclick="deleteAccountAddress(${index})" class="text-red-500 hover:text-red-700 text-xs font-semibold">Delete</button>
        </div>
    `).join('');

    if(currentUser.details.addresses.length === 0) {
        addrListHtml = `<p class="text-xs text-gray-400 italic">No alternative addresses saved under this profile.</p>`;
    }

    let html = `
        <div class="space-y-6 text-sm">
            <div class="bg-gray-50 p-4 rounded-2xl space-y-3 border">
                <h3 class="font-bold text-gray-800 text-base">Update Profile Info</h3>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs font-bold text-gray-400">FIRST NAME</label>
                        <input id="manage-fname" type="text" value="${currentUser.details.firstName || ''}" class="w-full border rounded-xl p-2.5 mt-1 outline-none focus:border-yellow-400">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-400">LAST NAME</label>
                        <input id="manage-lname" type="text" value="${currentUser.details.lastName || ''}" class="w-full border rounded-xl p-2.5 mt-1 outline-none focus:border-yellow-400">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs font-bold text-gray-400">PHONE EXTENSION</label>
                        <input id="manage-phone" type="tel" value="${currentUser.details.phone || ''}" class="w-full border rounded-xl p-2.5 mt-1 outline-none focus:border-yellow-400">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-400">AGE CONFIG</label>
                        <input id="manage-age" type="number" value="${currentUser.details.age || ''}" class="w-full border rounded-xl p-2.5 mt-1 outline-none focus:border-yellow-400">
                    </div>
                </div>
                <button onclick="saveAccountDetails()" class="bg-black text-white px-4 py-2 text-xs font-semibold rounded-xl mt-2 hover:bg-gray-800">Save Meta Parameters</button>
            </div>

            <div class="border rounded-2xl p-4 space-y-4">
                <h3 class="font-bold text-gray-800 text-base">Book of Saved Delivery Addresses</h3>
                <div class="space-y-2">${addrListHtml}</div>
                <div class="flex gap-2 pt-2 border-t">
                    <input id="new-account-address" type="text" placeholder="Enter full new alternative delivery node..." class="flex-1 border rounded-xl px-3 py-2 text-xs outline-none focus:border-yellow-400">
                    <button onclick="addAccountAddress()" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 rounded-xl">Add Delivery Destination</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('generic-content').innerHTML = html;
    document.getElementById('generic-modal').classList.remove('hidden');
    document.getElementById('generic-modal').classList.add('flex');
}

function saveAccountDetails() {
    const fn = document.getElementById('manage-fname').value.trim();
    const ln = document.getElementById('manage-lname').value.trim();
    const ph = document.getElementById('manage-phone').value.trim();
    const ag = document.getElementById('manage-age').value.trim();
    
    currentUser.details.firstName = fn;
    currentUser.details.lastName = ln;
    currentUser.details.phone = ph;
    currentUser.details.age = ag;
    currentUser.name = fn;
    
    // Sync to registration index databases
    const index = registeredUsersList.findIndex(u => u.email === currentUser.email);
    if(index !== -1) registeredUsersList[index] = currentUser.details;
    localStorage.setItem('M.Y Store_users', JSON.stringify(registeredUsersList));
    
    document.getElementById('user-display-name').textContent = fn;
    showManageAccountPage();
    showToast("Profile identity updated successfully!");
}

function addAccountAddress() {
    const val = document.getElementById('new-account-address').value.trim();
    if(!val) return;
    currentUser.details.addresses.push(val);
    
    const index = registeredUsersList.findIndex(u => u.email === currentUser.email);
    if(index !== -1) registeredUsersList[index] = currentUser.details;
    localStorage.setItem('M.Y Store_users', JSON.stringify(registeredUsersList));
    
    showManageAccountPage();
    showToast("New secondary shipping address node registered!");
}

function deleteAccountAddress(idx) {
    currentUser.details.addresses.splice(idx, 1);
    const index = registeredUsersList.findIndex(u => u.email === currentUser.email);
    if(index !== -1) registeredUsersList[index] = currentUser.details;
    localStorage.setItem('M.Y Store_users', JSON.stringify(registeredUsersList));
    showManageAccountPage();
}

function showPaymentPage() {
    document.getElementById('user-dropdown').classList.add('hidden');
    document.getElementById('generic-title').textContent = "Payment Instrument Accounts & Currency Wallets";
    
    document.getElementById('generic-content').innerHTML = `
        <div class="space-y-4 text-sm">
            <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-yellow-50/50 border border-yellow-200 rounded-2xl">
                    <span class="text-xs text-amber-800 font-bold tracking-wider block uppercase">AppCredit Balance</span>
                    <div class="text-2xl font-black font-mono text-amber-600 mt-1">$45.00</div>
                </div>
                <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <span class="text-xs text-emerald-800 font-bold tracking-wider block uppercase">AppCash Vault</span>
                    <div class="text-2xl font-black font-mono text-emerald-600 mt-1">$120.50</div>
                </div>
            </div>
            <div class="border rounded-2xl p-4 space-y-3">
                <h4 class="font-bold text-gray-800 border-b pb-2"><i class="fa-solid fa-credit-card"></i> Saved Cards & UPI Nodes</h4>
                <div class="text-xs space-y-2 text-gray-600">
                    <div class="p-2.5 bg-gray-50 rounded-xl flex justify-between"><span>💳 Visa **** 4921 (Primary Electronic)</span><span class="text-gray-400 font-bold">EXP 09/29</span></div>
                    <div class="p-2.5 bg-gray-50 rounded-xl flex justify-between"><span>📱 UPI Handle: mystore@payaxis</span><span class="text-emerald-600 font-semibold">✓ Active</span></div>
                </div>
            </div>
            <div class="border rounded-2xl p-4 space-y-3">
                <h4 class="font-bold text-gray-800 border-b pb-2"><i class="fa-solid fa-wallet"></i> Wallets / BNPL & Gift Cards</h4>
                <div class="text-xs space-y-2 text-gray-600">
                    <div class="p-2.5 bg-gray-50 rounded-xl flex justify-between"><span>🎁 Store Active Gift Card Asset</span><span class="font-mono font-bold text-gray-900">$25.00</span></div>
                    <div class="p-2.5 bg-gray-50 rounded-xl flex justify-between"><span>⏱️ Buy Now Pay Later (BNPL Line allocation)</span><span class="text-blue-600 font-semibold">Approved ($500 limit)</span></div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('generic-modal').classList.remove('hidden');
    document.getElementById('generic-modal').classList.add('flex');
}

function showEarnPage() {
    document.getElementById('user-dropdown').classList.add('hidden');
    document.getElementById('generic-title').textContent = "Earn & Redeem Ledger Hub";
    
    document.getElementById('generic-content').innerHTML = `
        <div class="space-y-4 text-sm">
            <div class="p-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl text-center space-y-2">
                <div class="text-xs font-bold tracking-widest text-purple-300 uppercase">MyPrices Reward Multiplier Tokens</div>
                <div class="text-4xl font-mono font-black text-yellow-400">2,450 Points</div>
                <p class="text-xs text-white/70">Equivalent valuation tracking asset: $24.50 store discount currency</p>
            </div>
            <div class="border rounded-2xl p-4">
                <h4 class="font-bold mb-3 text-gray-800">Available Redemptions Manifesto</h4>
                <div class="space-y-2 text-xs">
                    <div class="p-3 border rounded-xl flex justify-between items-center bg-gray-50">
                        <div><strong>Free Delivery Shipping Voucher Token</strong><br><span class="text-gray-400">Requires 500 MyPrices points</span></div>
                        <button onclick="showToast('Voucher Redeemed!')" class="bg-black text-white font-bold px-3 py-1.5 rounded-lg">Claim</button>
                    </div>
                    <div class="p-3 border rounded-xl flex justify-between items-center bg-gray-50">
                        <div><strong>$10 Flat Store Checkout Cash Reward</strong><br><span class="text-gray-400">Requires 1000 MyPrices points</span></div>
                        <button onclick="showToast('Redeemed $10 to wallet credit!')" class="bg-black text-white font-bold px-3 py-1.5 rounded-lg">Claim</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('generic-modal').classList.remove('hidden');
    document.getElementById('generic-modal').classList.add('flex');
}

function switchModalMedia(element, type, sourceUrl, index) {
    const displayContainer = document.getElementById('modal-image').querySelector('.relative');
    
    document.querySelectorAll('.modal-thumb').forEach(thumb => {
        thumb.classList.remove('border-2', 'border-yellow-400', 'opacity-100');
        thumb.classList.add('border', 'border-gray-200', 'opacity-60');
    });
    if (element) element.classList.add('border-2', 'border-yellow-400', 'opacity-100');

    if (type === 'video') {
        displayContainer.innerHTML = `
            <button onclick="closeModal()" class="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center text-xl transition-colors shadow">×</button>
            <video src="${sourceUrl}" controls autoplay class="w-full h-full object-contain bg-black rounded-2xl"></video>
        `;
    } else {
        switchModalImage(null, sourceUrl, index);
    }
}
let selectedProductColor = null;
function selectColor(btnElement, color) {
    selectedProductColor = color;
    document.querySelectorAll('.color-variant-btn').forEach(b => {
        b.classList.remove('bg-black', 'text-white', 'border-black');
        b.classList.add('bg-white', 'text-gray-800');
    });
    btnElement.classList.remove('bg-white', 'text-gray-800');
    btnElement.classList.add('bg-black', 'text-white', 'border-black');
}

// --- DATA RECOVERY & DEBUG TOOLS ---

function debugStorageData() {
    try {
        const storageInfo = {
            totalProducts: products.length,
            storedKey: 'M.Y Store_products',
            storageSize: JSON.stringify(products).length,
            products: products
        };
        
        console.log('=== STORAGE DEBUG INFO ===');
        console.log('Total Products in Memory:', storageInfo.totalProducts);
        console.log('Storage Key Used:', storageInfo.storedKey);
        console.log('Approximate Storage Size:', Math.round(storageInfo.storageSize / 1024) + ' KB');
        console.log('All Products:', storageInfo.products);
        
        const summary = `
📊 STORAGE DEBUG REPORT
═══════════════════════════════
Total Products Loaded: ${storageInfo.totalProducts}
Storage Key: ${storageInfo.storedKey}
Data Size: ~${Math.round(storageInfo.storageSize / 1024)} KB

Product List:
${products.map((p, i) => `${i + 1}. ${p.name} ($${p.price})`).join('\n')}

✅ Storage is working properly. Check browser console for full details.
        `;
        
        showToast('✅ Debug data logged. Check browser console (F12) for full report.');
        alert(summary);
    } catch (e) {
        console.error('Debug error:', e);
        showToast('❌ Error reading storage: ' + e.message);
    }
}

function clearAndResetProducts() {
    const confirmed = confirm(
        '⚠️ WARNING: This will DELETE ALL YOUR PRODUCTS and restore defaults!\n\n' +
        'Are you absolutely sure? This action cannot be undone.\n\n' +
        'Type "YES I UNDERSTAND" in the prompt to proceed.'
    );
    
    if (!confirmed) return;
    
    const userConfirmation = prompt('Type "YES I UNDERSTAND" to confirm deletion:');
    if (userConfirmation !== 'YES I UNDERSTAND') {
        showToast('❌ Cancelled. Products preserved.');
        return;
    }
    
    try {
        // Clear all product storage
        products = [...defaultProducts];
        localStorage.removeItem('M.Y Store_products');
        cart = [];
        wishlist.clear();
        
        // Save defaults
        saveDataSafely();
        
        showToast('✅ Products reset to defaults. Reloading page...');
        setTimeout(() => location.reload(), 1500);
    } catch (e) {
        console.error('Reset error:', e);
        showToast('❌ Error during reset: ' + e.message);
    }
}

function refreshAllData() {
    try {
        console.log('Refreshing all data and reloading page...');
        showToast('🔄 Refreshing data... Page will reload.');
        
        // Force save current state
        saveDataSafely();
        
        // Clear any temporary data
        cart = [];
        selectedProductSize = null;
        selectedProductColor = null;
        
        // Reload the page after a short delay
        setTimeout(() => {
            window.location.href = window.location.href;
        }, 1000);
    } catch (e) {
        console.error('Refresh error:', e);
        showToast('❌ Error during refresh: ' + e.message);
    }
}