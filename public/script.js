// Global variables
let cart = [];
let currentUser = null;
let products = [];
let orders = [];

// DOM elements
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const cartCount = document.querySelector('.cart-count');
const productsGrid = document.getElementById('products-grid');
const featuredProducts = document.getElementById('featured-products') || null;
const productModal = document.getElementById('product-modal');
const productDetails = document.getElementById('product-details');
const cartItems = document.getElementById('cart-items');
const cartSummary = document.getElementById('cart-summary');
const checkoutForm = document.getElementById('checkout-form');
const checkoutItems = document.getElementById('checkout-items');
const adminLogin = document.getElementById('admin-login');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const ordersTableBody = document.getElementById('orders-table-body');
const successModal = document.getElementById('success-modal');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadProducts();
    loadCart();
    startCountdownTimer();
    initializeTheme();
    initializeLanguage();
});

// Initialize application
function initializeApp() {
    // Check for admin token
    const token = localStorage.getItem('adminToken');
    if (token) {
        currentUser = JSON.parse(localStorage.getItem('adminUser'));
        showAdminDashboard();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Footer navigation links
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Mobile menu
    hamburger.addEventListener('click', toggleMobileMenu);

    // Product modal
    const closeModal = document.querySelector('.close');
    closeModal.addEventListener('click', closeProductModal);
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeProductModal();
        }
    });

    // Checkout form
    checkoutForm.addEventListener('submit', handleCheckout);

    // Admin login
    loginForm.addEventListener('submit', handleAdminLogin);

    // Category filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterProducts(e.target.dataset.category);
        });
    });
}

// Navigation handling
function handleNavigation(e) {
    // Don't prevent default for WhatsApp links
    if (e.target.closest('.whatsapp-link')) {
        return; // Let the WhatsApp link work normally
    }
    
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    
    // Handle support section navigation
    if (targetId.startsWith('support-')) {
        // Scroll to the support section first
        const supportSection = document.getElementById('support');
        if (supportSection) {
            supportSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Then scroll to the specific support subsection
        setTimeout(() => {
            const targetSubsection = document.getElementById(targetId);
            if (targetSubsection) {
                targetSubsection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 300);
        
        // Close mobile menu
        if (navMenu) {
            navMenu.classList.remove('active');
        }
        if (hamburger) {
            hamburger.setAttribute('aria-expanded', 'false');
        }
        return;
    }
    
    // Update active nav link for both main nav and footer links
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Find the corresponding main nav link and make it active
    const correspondingNavLink = document.querySelector(`.nav-link[href="#${targetId}"]`);
    if (correspondingNavLink) {
        correspondingNavLink.classList.add('active');
    }
    
    // Show target section
    sections.forEach(section => section.classList.remove('active'));
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Handle special cases
    if (targetId === 'shop') {
        loadProducts();
    } else if (targetId === 'cart') {
        displayCart();
    } else if (targetId === 'checkout') {
        displayCheckout();
    } else if (targetId === 'admin') {
        if (currentUser) {
            showAdminDashboard();
        } else {
            showAdminLogin();
        }
    }
    
    // Close mobile menu if open
    if (navMenu) {
    navMenu.classList.remove('active');
    }
    if (hamburger) {
        hamburger.setAttribute('aria-expanded', 'false');
    }
    
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mobile menu toggle
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
}

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        displayProducts(products);
        displayFeaturedProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products', 'error');
    }
}

// Display products in grid
function displayProducts(productsToShow) {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = '<p class="text-center">No products found.</p>';
        return;
    }
    
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            <i class="fas fa-desktop"></i>
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">$${product.price}</div>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="showProductDetails(${product.id})">View Details</button>
                <button class="btn btn-secondary" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `;
    return card;
}

// Display featured products
function displayFeaturedProducts() {
    if (!featuredProducts) return;
    
    const featured = products.filter(product => product.featured);
    featuredProducts.innerHTML = featured.map(product => createProductCard(product)).join('');
}

// Filter products by category
function filterProducts(category) {
    let filteredProducts = products;
    
    if (category !== 'all') {
        filteredProducts = products.filter(product => product.category === category);
    }
    
        displayProducts(filteredProducts);
}

// Show product details modal
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    productDetails.innerHTML = `
        <div class="product-detail-content">
            <div class="product-detail-image">
            <i class="fas fa-desktop"></i>
        </div>
            <div class="product-detail-info">
            <h2>${product.name}</h2>
                <p class="product-detail-description">${product.description}</p>
                <div class="product-detail-price">$${product.price}</div>
                <div class="product-detail-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="changeQuantity(-1)">-</button>
                        <input type="number" id="modal-quantity" value="1" min="1" class="quantity-input">
                    <button class="quantity-btn" onclick="changeQuantity(1)">+</button>
                </div>
                    <button class="btn btn-primary btn-large" onclick="addToCartFromModal(${product.id})">Add to Cart</button>
            </div>
            </div>
        </div>
    `;
    
    productModal.style.display = 'block';
}

// Close product modal
function closeProductModal() {
    productModal.style.display = 'none';
}

// Change quantity in modal
function changeQuantity(delta) {
    const quantityInput = document.getElementById('modal-quantity');
    const newQuantity = Math.max(1, parseInt(quantityInput.value) + delta);
    quantityInput.value = newQuantity;
}

// Add to cart from product grid
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCart();
    showNotification(`${product.name} added to cart!`, 'success');
}

// Add to cart from modal
function addToCartFromModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const quantity = parseInt(document.getElementById('modal-quantity').value);
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
            quantity: quantity
            });
    }
    
    updateCartDisplay();
    saveCart();
    closeProductModal();
    showNotification(`${product.name} added to cart!`, 'success');
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    saveCart();
}

// Update cart quantity
function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            updateCartDisplay();
            saveCart();
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

// Update cart display
function updateCartDisplay() {
    if (!cartItems || !cartSummary) return;
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="#shop" class="btn btn-primary">Start Shopping</a>
            </div>
        `;
        cartSummary.style.display = 'none';
        return;
    }
    
    // Display cart items
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <i class="fas fa-desktop"></i>
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price} each</p>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" min="1" class="quantity-input" onchange="updateCartQuantity(${item.id}, parseInt(this.value))">
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Update cart summary
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${subtotal.toFixed(2)}`;
    
    cartSummary.style.display = 'block';
    
    // Update checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const targetLink = document.querySelector('a[href="#checkout"]');
            if (targetLink) {
                targetLink.click();
            }
        });
    }
}

// Display cart
function displayCart() {
    updateCartDisplay();
}

// Display checkout
function displayCheckout() {
    if (!checkoutItems) return;
    
    if (cart.length === 0) {
        checkoutItems.innerHTML = '<p>Your cart is empty</p>';
        return;
    }
    
    checkoutItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <div class="order-item-info">
                <h4>${item.name}</h4>
                <p>Quantity: ${item.quantity}</p>
            </div>
            <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;
}

// Handle checkout form submission
function handleCheckout(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const orderData = {
        id: Date.now().toString(),
        customer: {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        notes: formData.get('notes')
        },
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        date: new Date().toISOString()
    };
    
    // Save order
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
            cart = [];
    updateCartDisplay();
            saveCart();

// Show success modal
    document.getElementById('order-id').textContent = orderData.id;
    successModal.style.display = 'block';
    
    // Reset form
    e.target.reset();
}

// Close success modal
function closeSuccessModal() {
    successModal.style.display = 'none';
    const targetLink = document.querySelector('a[href="#home"]');
    if (targetLink) {
        targetLink.click();
    }
}

// Handle admin login
function handleAdminLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    
    // Simple admin credentials (in production, use proper authentication)
    if (username === 'admin' && password === 'admin123') {
        currentUser = { username, role: 'admin' };
        localStorage.setItem('adminToken', 'admin-token');
        localStorage.setItem('adminUser', JSON.stringify(currentUser));
            showAdminDashboard();
        showNotification('Login successful!', 'success');
        } else {
        showNotification('Invalid credentials', 'error');
    }
}

// Show admin dashboard
function showAdminDashboard() {
    adminLogin.style.display = 'none';
    adminDashboard.style.display = 'block';
    loadOrders();
}

// Show admin login
function showAdminLogin() {
    adminLogin.style.display = 'block';
    adminDashboard.style.display = 'none';
}

// Load orders
function loadOrders() {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
    
    if (!ordersTableBody) return;
    
    ordersTableBody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customer.name}</td>
            <td>${order.customer.phone}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-primary" onclick="updateOrderStatus('${order.id}', 'processing')">Process</button>
                <button class="btn btn-secondary" onclick="updateOrderStatus('${order.id}', 'completed')">Complete</button>
            </td>
        </tr>
    `).join('');
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrders();
        showNotification(`Order ${orderId} updated to ${newStatus}`, 'success');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize with current hash
if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    const targetLink = document.querySelector(`a[href="#${hash}"]`);
    if (targetLink) {
        targetLink.click();
    }
}

// Countdown Timer
function startCountdownTimer() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');

    // Set countdown to 24 hours from now
    const endTime = new Date().getTime() + (24 * 60 * 60 * 1000);

    function updateCountdown() {
        const now = new Date().getTime();
        const timeLeft = endTime - now;

        if (timeLeft > 0) {
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
            if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
            if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
        } else {
            // Reset countdown when it reaches zero
            if (hoursElement) hoursElement.textContent = '23';
            if (minutesElement) minutesElement.textContent = '59';
            if (secondsElement) secondsElement.textContent = '59';
        }
    }

    // Update immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Theme Management
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    if (!themeToggle || !themeIcon) {
        console.error('Theme toggle or icon not found!');
        return;
    }
    
    // Get saved theme or detect system preference
    let savedTheme = localStorage.getItem('theme');
    
    if (!savedTheme) {
        // Detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        savedTheme = prefersDark ? 'dark' : 'light';
    }
    
    setTheme(savedTheme);
    
    // Add click event listener
    themeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        toggleTheme();
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function setTheme(theme) {
    const themeIcon = document.getElementById('theme-icon');
    const themeToggle = document.getElementById('theme-toggle');
    
        if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
        } else {
        document.documentElement.removeAttribute('data-theme');
            themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Language Management
function initializeLanguage() {
    const languageToggle = document.getElementById('language-toggle');
    const languageDropdown = document.getElementById('language-dropdown');
    const currentLangSpan = document.getElementById('current-lang');
    
    if (!languageToggle || !languageDropdown || !currentLangSpan) {
        console.error('Language elements not found!');
        return;
    }
    
    // Get saved language or default to English
    let currentLang = localStorage.getItem('language') || 'en';
    
    // Set initial language
    setLanguage(currentLang);
    
    // Toggle dropdown
    languageToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        languageDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!languageToggle.contains(e.target) && !languageDropdown.contains(e.target)) {
            languageDropdown.classList.remove('show');
        }
    });
    
    // Handle language selection
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedLang = this.getAttribute('data-lang');
            setLanguage(selectedLang);
            languageDropdown.classList.remove('show');
        });
    });
}

function setLanguage(lang) {
    console.log('Setting language to:', lang);
    
    if (!translations[lang]) {
        console.error('Language not found:', lang);
        return;
    }
    
    // Update current language display
    const currentLangSpan = document.getElementById('current-lang');
    if (currentLangSpan) {
        currentLangSpan.textContent = lang.toUpperCase();
    }
    
    // Save language preference
    localStorage.setItem('language', lang);
    
    // Translate page
    translatePage(lang);
}

function translatePage(lang) {
    console.log('Translating page to:', lang);
    
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        const translation = translations[lang][key];
        
        if (translation) {
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = translation;
            } else {
                element.textContent = translation;
            }
        } else {
            console.warn('Translation not found for key:', key, 'in language:', lang);
        }
    });
}

// Translations object
const translations = {
    en: {
        'nav.home': 'Home',
        'nav.shop': 'Shop',
        'nav.about': 'About',
        'nav.contact': 'Contact',
        'nav.admin': 'Admin',
        'hero.title': 'Welcome to PIXEL PAD',
        'hero.subtitle': 'Your trusted partner for premium computers and laptops',
        'hero.shop': 'Shop Now',
        'hero.learn': 'Learn More',
        'hero.free_delivery': 'Free Delivery',
        'hero.warranty': '8-Month Warranty',
        'hero.pay_delivery': 'Pay on Delivery',
        'about.title': 'About PIXEL PAD',
        'about.subtitle': 'Your trusted partner for premium computers and laptops',
        'about.story.title': 'Our Story',
        'about.story.p1': 'PIXEL PAD was founded with a simple mission: to provide high-quality computers and laptops to customers across Morocco with the convenience of cash on delivery payment.',
        'about.story.p2': 'We understand that purchasing technology can be a significant investment, which is why we offer flexible payment options and comprehensive warranties to give you peace of mind.',
        'about.features.delivery': 'Free Delivery',
        'about.features.delivery_desc': 'Fast and reliable delivery across Morocco',
        'about.features.warranty': '8-Month Warranty',
        'about.features.warranty_desc': 'Comprehensive warranty on all products',
        'about.features.payment': 'Pay on Delivery',
        'about.features.payment_desc': 'No upfront payment required',
        'contact.title': 'Contact Us',
        'contact.subtitle': 'Get in touch with us for any inquiries or support',
        'contact.address': 'Address',
        'contact.phone': 'Phone & WhatsApp',
        'contact.whatsapp': 'WhatsApp',
        'contact.email': 'Email',
        'contact.hours': 'Business Hours',
        'contact.hours_weekdays': 'Mon-Fri: 9AM-6PM',
        'contact.hours_saturday': 'Sat: 10AM-4PM',
        'footer.quick_links': 'Quick Links',
        'footer.categories': 'Categories',
        'footer.support': 'Support',
        'footer.desktops': 'Desktops',
        'footer.laptops': 'Laptops',
        'footer.accessories': 'Accessories',
        'footer.warranty': 'Warranty',
        'footer.returns': 'Returns',
        'footer.faq': 'FAQ',
        'footer.technical_support': 'Technical Support',
        'footer.secure_payment': 'Secure Payment',
        'footer.free_delivery': 'Free Delivery',
        'footer.support_24_7': '24/7 Support',
        'support.title': 'Customer Support',
        'support.subtitle': 'We\'re here to help! Please fill out the form below and we\'ll get back to you as soon as possible.',
        'support.name': 'Full Name *',
        'support.email': 'Email Address *',
        'support.phone': 'Phone Number *',
        'support.type': 'Support Type *',
        'support.select_type': 'Select Support Type',
        'support.warranty': 'Warranty Claim',
        'support.returns': 'Returns & Refunds',
        'support.technical': 'Technical Support',
        'support.general': 'General Inquiry',
        'support.order': 'Order Support',
        'support.product': 'Product Information',
        'support.description': 'Problem Description *',
        'support.urgency': 'Urgency Level',
        'support.urgency_low': 'Low - General Question',
        'support.urgency_medium': 'Medium - Need Help Soon',
        'support.urgency_high': 'High - Urgent Issue',
        'support.terms': 'I agree to the terms and conditions',
        'support.submit': 'Submit Support Request',
        'support.reset': 'Reset Form',
        'support.response_time': 'Response Time',
        'support.response_time_desc': 'We typically respond within 2-4 hours during business hours (9AM-6PM)',
        'support.urgent': 'Urgent Issues',
        'support.urgent_desc': 'For urgent matters, call us directly at +212779318061',
        'support.whatsapp': 'WhatsApp Support',
        'support.whatsapp_desc': 'Quick support via WhatsApp: +212779318061',
        
        // FAQ translations
        'faq.title': 'Frequently Asked Questions',
        'faq.subtitle': 'Find answers to common questions about PIXEL PAD products and services',
        'faq.categories.products': 'Products & Services',
        'faq.categories.payment': 'Payment & Delivery',
        'faq.categories.warranty': 'Warranty & Support',
        'faq.categories.technical': 'Technical Support',
        'faq.products.q1': 'What types of computers do you sell?',
        'faq.products.a1': 'We sell desktop computers, laptops, gaming PCs, and computer accessories. All products are available in both new and used conditions with different warranty periods.',
        'faq.products.q2': 'Do you offer both new and used products?',
        'faq.products.a2': 'Yes, we offer both new and used computers and accessories. Used products come with shorter warranty periods but are thoroughly tested and in good working condition.',
        'faq.products.q3': 'Can I customize my computer order?',
        'faq.products.a3': 'Yes, we offer customization options for desktop computers and gaming PCs. Contact us via WhatsApp to discuss your specific requirements and we\'ll provide a customized solution.',
        'faq.payment.q1': 'What payment methods do you accept?',
        'faq.payment.a1': 'We accept cash on delivery (COD) payments. You can pay when the product is delivered to your location. This ensures you\'re satisfied with your purchase before payment.',
        'faq.payment.q2': 'Do you deliver nationwide?',
        'faq.payment.a2': 'Yes, we provide free delivery across Morocco. Our delivery service covers all major cities and regions, ensuring your order reaches you safely and on time.',
        'faq.payment.q3': 'How long does delivery take?',
        'faq.payment.a3': 'Delivery typically takes 2-5 business days depending on your location. We\'ll provide tracking information once your order is shipped.',
        'faq.warranty.q1': 'What warranty do you provide?',
        'faq.warranty.a1': 'Warranty periods vary by product type and condition. New products: 6-12 months, Used products: 1-2 months. Desktop and laptop computers (used) have 2-month warranty, while other used products have 1-month warranty.',
        'faq.warranty.q2': 'What does the warranty cover?',
        'faq.warranty.a2': 'Our warranty covers manufacturing defects and hardware failures under normal use. It includes free repair or replacement service, free pickup and delivery, and 24/7 technical support.',
        'faq.warranty.q3': 'How do I claim warranty service?',
        'faq.warranty.a3': 'Contact us via WhatsApp at +212779318061 with your purchase receipt and issue description. We\'ll arrange free pickup, assess the issue, and provide repair or replacement within 3-5 days.',
        'faq.technical.q1': 'Do you provide technical support?',
        'faq.technical.a1': 'Yes, we offer 24/7 technical support for all our products. Our expert team can help with setup, troubleshooting, and maintenance questions via WhatsApp or phone.',
        'faq.technical.q2': 'Can you help with computer setup?',
        'faq.technical.a2': 'Absolutely! We provide free setup assistance for all computers. Our team can help with initial configuration, software installation, and basic troubleshooting.',
        'faq.technical.q3': 'What if I need software installation?',
        'faq.technical.a3': 'We can help with software installation and configuration. Contact us to discuss your specific software needs and we\'ll provide the appropriate assistance.',
        'faq.contact.title': 'Still Have Questions?',
        'faq.contact.desc': 'Can\'t find the answer you\'re looking for? Our support team is here to help!',
        'faq.contact.whatsapp': 'WhatsApp Support',
        'faq.contact.phone': 'Call Us',
        
        // Returns translations
        'returns.title': 'Returns & Exchanges',
        'returns.subtitle': 'Easy returns and exchanges for your peace of mind',
        'returns.return_policy.title': 'Return Policy',
        'returns.return_policy.desc': 'Return any product within 7 days of purchase for a full refund or exchange.',
        'returns.return_policy.item1': 'Original packaging required',
        'returns.return_policy.item2': 'Product must be in original condition',
        'returns.return_policy.item3': 'Receipt or proof of purchase needed',
        'returns.exchange_policy.title': 'Exchange Policy',
        'returns.exchange_policy.desc': 'Exchange your product for a different model or size within 14 days.',
        'returns.exchange_policy.item1': 'Free exchange for different specifications',
        'returns.exchange_policy.item2': 'Price difference applies if upgrading',
        'returns.exchange_policy.item3': 'Same return conditions apply',
        'returns.process.title': 'Return Process',
        'returns.process.desc': 'Simple 3-step return process for your convenience.',
        'returns.process.step1': 'Contact us via WhatsApp',
        'returns.process.step2': 'We arrange free pickup',
        'returns.process.step3': 'Refund or exchange processed',
        'returns.contact.title': 'Need Help with Returns?',
        'returns.contact.desc': 'Our support team is here to help with any return or exchange questions.',
        'returns.contact.whatsapp': 'WhatsApp Support',
        'returns.contact.phone': 'Call Us',
        
        'warranty.title': '1-Year Warranty Coverage',
        'warranty.subtitle': 'Comprehensive protection for your PIXEL PAD products',
        'warranty.coverage.title': 'What\'s Covered',
        'warranty.coverage.manufacturing': 'Manufacturing defects and hardware failures',
        'warranty.coverage.performance': 'Performance issues under normal use',
        'warranty.coverage.components': 'All internal components and parts',
        'warranty.coverage.repair': 'Free repair or replacement service',
        'warranty.duration.title': 'Warranty Duration by Product',
        'warranty.duration.desc': 'Up to 12 months from the date of purchase',
        'warranty.duration.highlight': 'Product-specific coverage',
        'warranty.products.desktops_new': 'Desktop Computers (New)',
        'warranty.products.desktops_used': 'Desktop Computers (Used)',
        'warranty.products.laptops_new': 'Laptops (New)',
        'warranty.products.laptops_used': 'Laptops (Used)',
        'warranty.products.accessories_new': 'Accessories (New)',
        'warranty.products.accessories_used': 'Accessories (Used)',
        'warranty.products.gaming_new': 'Gaming PCs (New)',
        'warranty.products.gaming_used': 'Gaming PCs (Used)',
        'warranty.service.title': 'Service Options',
        'warranty.service.desc': 'Free repair or replacement',
        'warranty.service.highlight': 'No service charges',
        'warranty.delivery.title': 'Free Delivery',
        'warranty.delivery.desc': 'Free pickup and delivery service',
        'warranty.delivery.highlight': 'Nationwide coverage',
        'warranty.support.title': 'Technical Support',
        'warranty.support.desc': '24/7 technical assistance',
        'warranty.support.highlight': 'Expert guidance',
        'warranty.conditions.title': 'Warranty Conditions',
        'warranty.conditions.valid.title': 'Valid Claims',
        'warranty.conditions.valid.normal': 'Normal use and operation',
        'warranty.conditions.valid.original': 'Original purchase from PIXEL PAD',
        'warranty.conditions.valid.period': 'Within warranty period',
        'warranty.conditions.valid.documentation': 'Valid purchase documentation',
        'warranty.conditions.invalid.title': 'Not Covered',
        'warranty.conditions.invalid.damage': 'Physical damage from accidents',
        'warranty.conditions.invalid.misuse': 'Misuse or abuse of the product',
        'warranty.conditions.invalid.modification': 'Unauthorized modifications',
        'warranty.conditions.invalid.software': 'Software issues not related to hardware',
        'warranty.process.title': 'How to Claim Warranty',
        'warranty.process.step1.title': 'Contact Us',
        'warranty.process.step1.desc': 'Call +212779318061 or WhatsApp us',
        'warranty.process.step2.title': 'Provide Details',
        'warranty.process.step2.desc': 'Share purchase receipt and issue description',
        'warranty.process.step3.title': 'Free Pickup',
        'warranty.process.step3.desc': 'We collect your device for assessment',
        'warranty.process.step4.title': 'Repair/Replace',
        'warranty.process.step4.desc': 'Free repair or replacement within 3-5 days',
        'warranty.process.step5.title': 'Free Delivery',
        'warranty.process.step5.desc': 'We deliver your device back to you',
        'warranty.contact.title': 'Need Warranty Support?',
        'warranty.contact.desc': 'Our team is ready to help you with any warranty claims',
        'warranty.contact.whatsapp': 'WhatsApp Support',
        'warranty.contact.phone': 'Call Now'
    },
    fr: {
        'nav.home': 'Accueil',
        'nav.shop': 'Boutique',
        'nav.about': 'À propos',
        'nav.contact': 'Contact',
        'nav.admin': 'Admin',
        'hero.title': 'Bienvenue chez PIXEL PAD',
        'hero.subtitle': 'Votre partenaire de confiance pour des ordinateurs et ordinateurs portables premium',
        'hero.shop': 'Acheter',
        'hero.learn': 'En savoir plus',
        'hero.free_delivery': 'Livraison gratuite',
        'hero.warranty': 'Garantie 8 mois',
        'hero.pay_delivery': 'Paiement à la livraison',
        'about.title': 'À propos de PIXEL PAD',
        'about.subtitle': 'Votre partenaire de confiance pour des ordinateurs et ordinateurs portables premium',
        'about.story.title': 'Notre histoire',
        'about.story.p1': 'PIXEL PAD a été fondé avec une mission simple : fournir des ordinateurs et ordinateurs portables de haute qualité aux clients du Maroc avec la commodité du paiement à la livraison.',
        'about.story.p2': 'Nous comprenons que l\'achat de technologie peut être un investissement important, c\'est pourquoi nous offrons des options de paiement flexibles et des garanties complètes pour vous donner la tranquillité d\'esprit.',
        'about.features.delivery': 'Livraison gratuite',
        'about.features.delivery_desc': 'Livraison rapide et fiable à travers le Maroc',
        'about.features.warranty': 'Garantie 8 mois',
        'about.features.warranty_desc': 'Garantie complète sur tous les produits',
        'about.features.payment': 'Paiement à la livraison',
        'about.features.payment_desc': 'Aucun paiement initial requis',
        'contact.title': 'Contactez-nous',
        'contact.subtitle': 'Contactez-nous pour toute question ou support',
        'contact.address': 'Adresse',
        'contact.phone': 'Téléphone & WhatsApp',
        'contact.whatsapp': 'WhatsApp',
        'contact.email': 'Email',
        'contact.hours': 'Heures d\'ouverture',
        'contact.hours_weekdays': 'Lun-Ven: 9h-18h',
        'contact.hours_saturday': 'Sam: 10h-16h',
        'footer.quick_links': 'Liens rapides',
        'footer.categories': 'Catégories',
        'footer.support': 'Support',
        'footer.desktops': 'Ordinateurs de bureau',
        'footer.laptops': 'Ordinateurs portables',
        'footer.accessories': 'Accessoires',
        'footer.warranty': 'Garantie',
        'footer.returns': 'Retours',
        'footer.faq': 'FAQ',
        'footer.technical_support': 'Support technique',
        'footer.secure_payment': 'Paiement sécurisé',
        'footer.free_delivery': 'Livraison gratuite',
        'footer.support_24_7': 'Support 24/7',
        'support.title': 'Support Client',
        'support.subtitle': 'Nous sommes là pour vous aider ! Veuillez remplir le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.',
        'support.name': 'Nom Complet *',
        'support.email': 'Adresse Email *',
        'support.phone': 'Numéro de Téléphone *',
        'support.type': 'Type de Support *',
        'support.select_type': 'Sélectionner le Type de Support',
        'support.warranty': 'Réclamation de Garantie',
        'support.returns': 'Retours et Remboursements',
        'support.technical': 'Support Technique',
        'support.general': 'Demande Générale',
        'support.order': 'Support Commande',
        'support.product': 'Informations Produit',
        'support.description': 'Description du Problème *',
        'support.urgency': 'Niveau d\'Urgence',
        'support.urgency_low': 'Faible - Question Générale',
        'support.urgency_medium': 'Moyen - Besoin d\'Aide Bientôt',
        'support.urgency_high': 'Élevé - Problème Urgent',
        'support.terms': 'J\'accepte les termes et conditions',
        'support.submit': 'Soumettre la Demande de Support',
        'support.reset': 'Réinitialiser le Formulaire',
        'support.response_time': 'Temps de Réponse',
        'support.response_time_desc': 'Nous répondons généralement dans les 2-4 heures pendant les heures ouvrables (9h-18h)',
        'support.urgent': 'Problèmes Urgents',
        'support.urgent_desc': 'Pour les questions urgentes, appelez-nous directement au +212779318061',
        'support.whatsapp': 'Support WhatsApp',
        'support.whatsapp_desc': 'Support rapide via WhatsApp : +212779318061',
        'warranty.title': 'Couverture de Garantie 1 An',
        'warranty.subtitle': 'Protection complète pour vos produits PIXEL PAD',
        'warranty.coverage.title': 'Ce qui est Couvert',
        'warranty.coverage.manufacturing': 'Défauts de fabrication et pannes matérielles',
        'warranty.coverage.performance': 'Problèmes de performance en usage normal',
        'warranty.coverage.components': 'Tous les composants internes et pièces',
        'warranty.coverage.repair': 'Service de réparation ou remplacement gratuit',
        'warranty.duration.title': 'Durée de Garantie par Produit',
        'warranty.duration.desc': 'Jusqu\'à 12 mois à partir de la date d\'achat',
        'warranty.duration.highlight': 'Couverture spécifique au produit',
        'warranty.products.desktops_new': 'Ordinateurs de Bureau (Neufs)',
        'warranty.products.desktops_used': 'Ordinateurs de Bureau (Occasion)',
        'warranty.products.laptops_new': 'Ordinateurs Portables (Neufs)',
        'warranty.products.laptops_used': 'Ordinateurs Portables (Occasion)',
        'warranty.products.accessories_new': 'Accessoires (Neufs)',
        'warranty.products.accessories_used': 'Accessoires (Occasion)',
        'warranty.products.gaming_new': 'PC Gaming (Neufs)',
        'warranty.products.gaming_used': 'PC Gaming (Occasion)',
        'warranty.service.title': 'Options de Service',
        'warranty.service.desc': 'Réparation ou remplacement gratuit',
        'warranty.service.highlight': 'Aucuns frais de service',
        'warranty.delivery.title': 'Livraison Gratuite',
        'warranty.delivery.desc': 'Service de collecte et livraison gratuit',
        'warranty.delivery.highlight': 'Couverture nationale',
        'warranty.support.title': 'Support Technique',
        'warranty.support.desc': 'Assistance technique 24/7',
        'warranty.support.highlight': 'Conseils d\'experts',
        'warranty.conditions.title': 'Conditions de Garantie',
        'warranty.conditions.valid.title': 'Réclamations Valides',
        'warranty.conditions.valid.normal': 'Usage et fonctionnement normaux',
        'warranty.conditions.valid.original': 'Achat original chez PIXEL PAD',
        'warranty.conditions.valid.period': 'Dans la période de garantie',
        'warranty.conditions.valid.documentation': 'Documentation d\'achat valide',
        'warranty.conditions.invalid.title': 'Non Couvert',
        'warranty.conditions.invalid.damage': 'Dommages physiques dus à des accidents',
        'warranty.conditions.invalid.misuse': 'Mauvaise utilisation ou abus du produit',
        'warranty.conditions.invalid.modification': 'Modifications non autorisées',
        'warranty.conditions.invalid.software': 'Problèmes logiciels non liés au matériel',
        'warranty.process.title': 'Comment Réclamer la Garantie',
        'warranty.process.step1.title': 'Contactez-nous',
        'warranty.process.step1.desc': 'Appelez +212779318061 ou WhatsApp nous',
        'warranty.process.step2.title': 'Fournir les Détails',
        'warranty.process.step2.desc': 'Partagez le reçu d\'achat et la description du problème',
        'warranty.process.step3.title': 'Collecte Gratuite',
        'warranty.process.step3.desc': 'Nous collectons votre appareil pour évaluation',
        'warranty.process.step4.title': 'Réparation/Remplacement',
        'warranty.process.step4.desc': 'Réparation ou remplacement gratuit sous 3-5 jours',
        'warranty.process.step5.title': 'Livraison Gratuite',
        'warranty.process.step5.desc': 'Nous vous livrons votre appareil',
        'warranty.contact.title': 'Besoin d\'Aide pour la Garantie ?',
        'warranty.contact.desc': 'Notre équipe est prête à vous aider avec toute réclamation de garantie',
        'warranty.contact.whatsapp': 'Support WhatsApp',
        'warranty.contact.phone': 'Appeler Maintenant',
        
        // FAQ translations
        'faq.title': 'Questions Fréquemment Posées',
        'faq.subtitle': 'Trouvez des réponses aux questions courantes sur les produits et services PIXEL PAD',
        'faq.categories.products': 'Produits et Services',
        'faq.categories.payment': 'Paiement et Livraison',
        'faq.categories.warranty': 'Garantie et Support',
        'faq.categories.technical': 'Support Technique',
        'faq.products.q1': 'Quels types d\'ordinateurs vendez-vous ?',
        'faq.products.a1': 'Nous vendons des ordinateurs de bureau, des ordinateurs portables, des PC gaming et des accessoires informatiques. Tous les produits sont disponibles en neuf et d\'occasion avec différentes périodes de garantie.',
        'faq.products.q2': 'Proposez-vous des produits neufs et d\'occasion ?',
        'faq.products.a2': 'Oui, nous proposons des ordinateurs et accessoires neufs et d\'occasion. Les produits d\'occasion ont des périodes de garantie plus courtes mais sont soigneusement testés et en bon état de fonctionnement.',
        'faq.products.q3': 'Puis-je personnaliser ma commande d\'ordinateur ?',
        'faq.products.a3': 'Oui, nous proposons des options de personnalisation pour les ordinateurs de bureau et les PC gaming. Contactez-nous via WhatsApp pour discuter de vos besoins spécifiques et nous vous fournirons une solution personnalisée.',
        'faq.payment.q1': 'Quels modes de paiement acceptez-vous ?',
        'faq.payment.a1': 'Nous acceptons les paiements à la livraison (COD). Vous pouvez payer lorsque le produit est livré à votre domicile. Cela garantit que vous êtes satisfait de votre achat avant le paiement.',
        'faq.payment.q2': 'Livrez-vous dans tout le pays ?',
        'faq.payment.a2': 'Oui, nous fournissons une livraison gratuite dans tout le Maroc. Notre service de livraison couvre toutes les grandes villes et régions, garantissant que votre commande vous arrive en toute sécurité et à temps.',
        'faq.payment.q3': 'Combien de temps prend la livraison ?',
        'faq.payment.a3': 'La livraison prend généralement 2-5 jours ouvrables selon votre localisation. Nous fournirons des informations de suivi une fois votre commande expédiée.',
        'faq.warranty.q1': 'Quelle garantie fournissez-vous ?',
        'faq.warranty.a1': 'Les périodes de garantie varient selon le type de produit et l\'état. Produits neufs : 6-12 mois, Produits d\'occasion : 1-2 mois. Les ordinateurs de bureau et portables (d\'occasion) ont une garantie de 2 mois, tandis que les autres produits d\'occasion ont une garantie de 1 mois.',
        'faq.warranty.q2': 'Que couvre la garantie ?',
        'faq.warranty.a2': 'Notre garantie couvre les défauts de fabrication et les pannes matérielles sous utilisation normale. Elle inclut un service de réparation ou de remplacement gratuit, la collecte et livraison gratuites, et un support technique 24/7.',
        'faq.warranty.q3': 'Comment puis-je réclamer le service de garantie ?',
        'faq.warranty.a3': 'Contactez-nous via WhatsApp au +212779318061 avec votre reçu d\'achat et la description du problème. Nous organiserons une collecte gratuite, évaluerons le problème et fournirons une réparation ou un remplacement dans les 3-5 jours.',
        'faq.technical.q1': 'Fournissez-vous un support technique ?',
        'faq.technical.a1': 'Oui, nous offrons un support technique 24/7 pour tous nos produits. Notre équipe d\'experts peut aider avec la configuration, le dépannage et les questions de maintenance via WhatsApp ou téléphone.',
        'faq.technical.q2': 'Pouvez-vous aider avec la configuration de l\'ordinateur ?',
        'faq.technical.a2': 'Absolument ! Nous fournissons une assistance de configuration gratuite pour tous les ordinateurs. Notre équipe peut aider avec la configuration initiale, l\'installation de logiciels et le dépannage de base.',
        'faq.technical.q3': 'Et si j\'ai besoin d\'installation de logiciels ?',
        'faq.technical.a3': 'Nous pouvons aider avec l\'installation et la configuration de logiciels. Contactez-nous pour discuter de vos besoins logiciels spécifiques et nous fournirons l\'assistance appropriée.',
        'faq.contact.title': 'Vous avez encore des questions ?',
        'faq.contact.desc': 'Vous ne trouvez pas la réponse que vous cherchez ? Notre équipe de support est là pour vous aider !',
        'faq.contact.whatsapp': 'Support WhatsApp',
        'faq.contact.phone': 'Nous Appeler',
        
        // Returns translations
        'returns.title': 'Retours et Échanges',
        'returns.subtitle': 'Retours et échanges faciles pour votre tranquillité d\'esprit',
        'returns.return_policy.title': 'Politique de Retour',
        'returns.return_policy.desc': 'Retournez tout produit dans les 7 jours suivant l\'achat pour un remboursement complet ou un échange.',
        'returns.return_policy.item1': 'Emballage d\'origine requis',
        'returns.return_policy.item2': 'Le produit doit être dans son état d\'origine',
        'returns.return_policy.item3': 'Reçu ou preuve d\'achat nécessaire',
        'returns.exchange_policy.title': 'Politique d\'Échange',
        'returns.exchange_policy.desc': 'Échangez votre produit pour un modèle ou une taille différente dans les 14 jours.',
        'returns.exchange_policy.item1': 'Échange gratuit pour différentes spécifications',
        'returns.exchange_policy.item2': 'Différence de prix appliquée si mise à niveau',
        'returns.exchange_policy.item3': 'Mêmes conditions de retour appliquées',
        'returns.process.title': 'Processus de Retour',
        'returns.process.desc': 'Processus de retour simple en 3 étapes pour votre commodité.',
        'returns.process.step1': 'Contactez-nous via WhatsApp',
        'returns.process.step2': 'Nous organisons la collecte gratuite',
        'returns.process.step3': 'Remboursement ou échange traité',
        'returns.contact.title': 'Besoin d\'Aide avec les Retours ?',
        'returns.contact.desc': 'Notre équipe de support est là pour vous aider avec toute question de retour ou d\'échange.',
        'returns.contact.whatsapp': 'Support WhatsApp',
        'returns.contact.phone': 'Nous Appeler'
    },
    ar: {
        'nav.home': 'الرئيسية',
        'nav.shop': 'المتجر',
        'nav.about': 'حول',
        'nav.contact': 'اتصل',
        'nav.admin': 'الإدارة',
        'hero.title': 'مرحباً بك في PIXEL PAD',
        'hero.subtitle': 'شريكك الموثوق لأجهزة الكمبيوتر والمحمولة عالية الجودة',
        'hero.shop': 'تسوق الآن',
        'hero.learn': 'اعرف المزيد',
        'hero.free_delivery': 'توصيل مجاني',
        'hero.warranty': 'ضمان 8 أشهر',
        'hero.pay_delivery': 'الدفع عند الاستلام',
        'about.title': 'حول PIXEL PAD',
        'about.subtitle': 'شريكك الموثوق لأجهزة الكمبيوتر والمحمولة عالية الجودة',
        'about.story.title': 'قصتنا',
        'about.story.p1': 'تأسست PIXEL PAD بمهمة بسيطة: توفير أجهزة كمبيوتر ومحمولة عالية الجودة للعملاء في جميع أنحاء المغرب مع راحة الدفع عند الاستلام.',
        'about.story.p2': 'نحن نفهم أن شراء التكنولوجيا يمكن أن يكون استثماراً مهماً، ولهذا السبب نقدم خيارات دفع مرنة وضمانات شاملة لتمنحك راحة البال.',
        'about.features.delivery': 'توصيل مجاني',
        'about.features.delivery_desc': 'توصيل سريع وموثوق عبر المغرب',
        'about.features.warranty': 'ضمان 8 أشهر',
        'about.features.warranty_desc': 'ضمان شامل على جميع المنتجات',
        'about.features.payment': 'الدفع عند الاستلام',
        'about.features.payment_desc': 'لا يتطلب دفع مقدم',
        'contact.title': 'اتصل بنا',
        'contact.subtitle': 'تواصل معنا لأي استفسارات أو دعم',
        'contact.address': 'العنوان',
        'contact.phone': 'الهاتف وواتساب',
        'contact.whatsapp': 'واتساب',
        'contact.email': 'البريد الإلكتروني',
        'contact.hours': 'ساعات العمل',
        'contact.hours_weekdays': 'الاثنين-الجمعة: 9ص-6م',
        'contact.hours_saturday': 'السبت: 10ص-4م',
        'footer.quick_links': 'روابط سريعة',
        'footer.categories': 'الفئات',
        'footer.support': 'الدعم',
        'footer.desktops': 'أجهزة سطح المكتب',
        'footer.laptops': 'أجهزة الكمبيوتر المحمولة',
        'footer.accessories': 'الملحقات',
        'footer.warranty': 'الضمان',
        'footer.returns': 'الإرجاع',
        'footer.faq': 'الأسئلة الشائعة',
        'footer.technical_support': 'الدعم التقني',
        'footer.secure_payment': 'دفع آمن',
        'footer.free_delivery': 'توصيل مجاني',
        'footer.support_24_7': 'دعم 24/7',
        'support.title': 'دعم العملاء',
        'support.subtitle': 'نحن هنا لمساعدتك! يرجى ملء النموذج أدناه وسنرد عليك في أقرب وقت ممكن.',
        'support.name': 'الاسم الكامل *',
        'support.email': 'عنوان البريد الإلكتروني *',
        'support.phone': 'رقم الهاتف *',
        'support.type': 'نوع الدعم *',
        'support.select_type': 'اختر نوع الدعم',
        'support.warranty': 'مطالبة الضمان',
        'support.returns': 'الإرجاع والاسترداد',
        'support.technical': 'الدعم التقني',
        'support.general': 'استفسار عام',
        'support.order': 'دعم الطلب',
        'support.product': 'معلومات المنتج',
        'support.description': 'وصف المشكلة *',
        'support.urgency': 'مستوى الأولوية',
        'support.urgency_low': 'منخفض - سؤال عام',
        'support.urgency_medium': 'متوسط - تحتاج مساعدة قريباً',
        'support.urgency_high': 'عالي - مشكلة عاجلة',
        'support.terms': 'أوافق على الشروط والأحكام',
        'support.submit': 'إرسال طلب الدعم',
        'support.reset': 'إعادة تعيين النموذج',
        'support.response_time': 'وقت الاستجابة',
        'support.response_time_desc': 'نرد عادة خلال 2-4 ساعات خلال ساعات العمل (9ص-6م)',
        'support.urgent': 'المشاكل العاجلة',
        'support.urgent_desc': 'للأمور العاجلة، اتصل بنا مباشرة على +212779318061',
        'support.whatsapp': 'دعم واتساب',
        'support.whatsapp_desc': 'دعم سريع عبر واتساب: +212779318061',
        'warranty.title': 'تغطية الضمان سنة واحدة',
        'warranty.subtitle': 'حماية شاملة لمنتجات PIXEL PAD',
        'warranty.coverage.title': 'ما يتم تغطيته',
        'warranty.coverage.manufacturing': 'عيوب التصنيع وأعطال الأجهزة',
        'warranty.coverage.performance': 'مشاكل الأداء تحت الاستخدام العادي',
        'warranty.coverage.components': 'جميع المكونات الداخلية والأجزاء',
        'warranty.coverage.repair': 'خدمة إصلاح أو استبدال مجانية',
        'warranty.duration.title': 'مدة الضمان حسب المنتج',
        'warranty.duration.desc': 'حتى 12 شهراً من تاريخ الشراء',
        'warranty.duration.highlight': 'تغطية خاصة بالمنتج',
        'warranty.products.desktops_new': 'أجهزة الكمبيوتر المكتبية (جديدة)',
        'warranty.products.desktops_used': 'أجهزة الكمبيوتر المكتبية (مستعملة)',
        'warranty.products.laptops_new': 'أجهزة الكمبيوتر المحمولة (جديدة)',
        'warranty.products.laptops_used': 'أجهزة الكمبيوتر المحمولة (مستعملة)',
        'warranty.products.accessories_new': 'الملحقات (جديدة)',
        'warranty.products.accessories_used': 'الملحقات (مستعملة)',
        'warranty.products.gaming_new': 'أجهزة الألعاب (جديدة)',
        'warranty.products.gaming_used': 'أجهزة الألعاب (مستعملة)',
        'warranty.service.title': 'خيارات الخدمة',
        'warranty.service.desc': 'إصلاح أو استبدال مجاني',
        'warranty.service.highlight': 'بدون رسوم خدمة',
        'warranty.delivery.title': 'توصيل مجاني',
        'warranty.delivery.desc': 'خدمة استلام وتوصيل مجانية',
        'warranty.delivery.highlight': 'تغطية وطنية',
        'warranty.support.title': 'الدعم التقني',
        'warranty.support.desc': 'مساعدة تقنية 24/7',
        'warranty.support.highlight': 'إرشاد الخبراء',
        'warranty.conditions.title': 'شروط الضمان',
        'warranty.conditions.valid.title': 'المطالبات الصحيحة',
        'warranty.conditions.valid.normal': 'الاستخدام والتشغيل العادي',
        'warranty.conditions.valid.original': 'شراء أصلي من PIXEL PAD',
        'warranty.conditions.valid.period': 'ضمن فترة الضمان',
        'warranty.conditions.valid.documentation': 'وثائق شراء صحيحة',
        'warranty.conditions.invalid.title': 'غير مغطى',
        'warranty.conditions.invalid.damage': 'أضرار جسدية من الحوادث',
        'warranty.conditions.invalid.misuse': 'سوء الاستخدام أو إساءة استخدام المنتج',
        'warranty.conditions.invalid.modification': 'تعديلات غير مصرح بها',
        'warranty.conditions.invalid.software': 'مشاكل البرمجيات غير المتعلقة بالأجهزة',
        'warranty.process.title': 'كيفية المطالبة بالضمان',
        'warranty.process.step1.title': 'اتصل بنا',
        'warranty.process.step1.desc': 'اتصل +212779318061 أو واتساب',
        'warranty.process.step2.title': 'قدم التفاصيل',
        'warranty.process.step2.desc': 'شارك إيصال الشراء ووصف المشكلة',
        'warranty.process.step3.title': 'استلام مجاني',
        'warranty.process.step3.desc': 'نجمع جهازك للتقييم',
        'warranty.process.step4.title': 'إصلاح/استبدال',
        'warranty.process.step4.desc': 'إصلاح أو استبدال مجاني خلال 3-5 أيام',
        'warranty.process.step5.title': 'توصيل مجاني',
        'warranty.process.step5.desc': 'نوصل جهازك إليك',
        'warranty.contact.title': 'تحتاج دعم الضمان؟',
        'warranty.contact.desc': 'فريقنا جاهز لمساعدتك في أي مطالبات ضمان',
        'warranty.contact.whatsapp': 'دعم واتساب',
        'warranty.contact.phone': 'اتصل الآن',
        
        // FAQ translations
        'faq.title': 'الأسئلة الشائعة',
        'faq.subtitle': 'اعثر على إجابات للأسئلة الشائعة حول منتجات وخدمات PIXEL PAD',
        'faq.categories.products': 'المنتجات والخدمات',
        'faq.categories.payment': 'الدفع والتوصيل',
        'faq.categories.warranty': 'الضمان والدعم',
        'faq.categories.technical': 'الدعم التقني',
        'faq.products.q1': 'ما أنواع أجهزة الكمبيوتر التي تبيعونها؟',
        'faq.products.a1': 'نبيع أجهزة الكمبيوتر المكتبية والمحمولة وأجهزة الألعاب وملحقات الكمبيوتر. جميع المنتجات متوفرة في حالات جديدة ومستعملة مع فترات ضمان مختلفة.',
        'faq.products.q2': 'هل تقدمون منتجات جديدة ومستعملة؟',
        'faq.products.a2': 'نعم، نقدم أجهزة كمبيوتر وملحقات جديدة ومستعملة. المنتجات المستعملة تأتي بفترات ضمان أقصر ولكنها مختبرة بعناية وفي حالة عمل جيدة.',
        'faq.products.q3': 'هل يمكنني تخصيص طلب الكمبيوتر؟',
        'faq.products.a3': 'نعم، نقدم خيارات التخصيص لأجهزة الكمبيوتر المكتبية وأجهزة الألعاب. اتصل بنا عبر واتساب لمناقشة متطلباتك المحددة وسنقدم لك حلاً مخصصاً.',
        'faq.payment.q1': 'ما طرق الدفع التي تقبلونها؟',
        'faq.payment.a1': 'نقبل الدفع عند التسليم (COD). يمكنك الدفع عند تسليم المنتج إلى موقعك. هذا يضمن رضاك عن مشترياتك قبل الدفع.',
        'faq.payment.q2': 'هل تقدمون التوصيل على مستوى البلاد؟',
        'faq.payment.a2': 'نعم، نقدم توصيل مجاني عبر المغرب. خدمة التوصيل لدينا تغطي جميع المدن والمناطق الرئيسية، مما يضمن وصول طلبك بأمان وفي الوقت المحدد.',
        'faq.payment.q3': 'كم من الوقت يستغرق التوصيل؟',
        'faq.payment.a3': 'يستغرق التوصيل عادة 2-5 أيام عمل حسب موقعك. سنقدم معلومات التتبع بمجرد شحن طلبك.',
        'faq.warranty.q1': 'ما الضمان الذي تقدمونه؟',
        'faq.warranty.a1': 'تختلف فترات الضمان حسب نوع المنتج والحالة. المنتجات الجديدة: 6-12 شهر، المنتجات المستعملة: 1-2 شهر. أجهزة الكمبيوتر المكتبية والمحمولة (المستعملة) لها ضمان شهرين، بينما المنتجات المستعملة الأخرى لها ضمان شهر واحد.',
        'faq.warranty.q2': 'ماذا يغطي الضمان؟',
        'faq.warranty.a2': 'ضماننا يغطي عيوب التصنيع وأعطال الأجهزة تحت الاستخدام العادي. يشمل خدمة إصلاح أو استبدال مجانية، استلام وتوصيل مجاني، ودعم تقني على مدار الساعة.',
        'faq.warranty.q3': 'كيف يمكنني المطالبة بخدمة الضمان؟',
        'faq.warranty.a3': 'اتصل بنا عبر واتساب على +212779318061 مع إيصال الشراء ووصف المشكلة. سنرتب استلام مجاني، ونقيم المشكلة، ونقدم إصلاح أو استبدال خلال 3-5 أيام.',
        'faq.technical.q1': 'هل تقدمون دعم تقني؟',
        'faq.technical.a1': 'نعم، نقدم دعم تقني على مدار الساعة لجميع منتجاتنا. فريق الخبراء لدينا يمكنه المساعدة في الإعداد واستكشاف الأخطاء وإصلاحها وأسئلة الصيانة عبر واتساب أو الهاتف.',
        'faq.technical.q2': 'هل يمكنكم المساعدة في إعداد الكمبيوتر؟',
        'faq.technical.a2': 'بالطبع! نقدم مساعدة إعداد مجانية لجميع أجهزة الكمبيوتر. فريقنا يمكنه المساعدة في التكوين الأولي وتثبيت البرامج واستكشاف الأخطاء الأساسية.',
        'faq.technical.q3': 'ماذا لو احتجت تثبيت برامج؟',
        'faq.technical.a3': 'يمكننا المساعدة في تثبيت وتكوين البرامج. اتصل بنا لمناقشة احتياجاتك البرمجية المحددة وسنقدم المساعدة المناسبة.',
        'faq.contact.title': 'لا تزال لديك أسئلة؟',
        'faq.contact.desc': 'لا تجد الإجابة التي تبحث عنها؟ فريق الدعم لدينا هنا لمساعدتك!',
        'faq.contact.whatsapp': 'دعم واتساب',
        'faq.contact.phone': 'اتصل بنا',
        
        // Returns translations
        'returns.title': 'الإرجاع والاستبدال',
        'returns.subtitle': 'إرجاع واستبدال سهل لراحة بالك',
        'returns.return_policy.title': 'سياسة الإرجاع',
        'returns.return_policy.desc': 'أرجع أي منتج خلال 7 أيام من الشراء للحصول على استرداد كامل أو استبدال.',
        'returns.return_policy.item1': 'التغليف الأصلي مطلوب',
        'returns.return_policy.item2': 'يجب أن يكون المنتج في حالته الأصلية',
        'returns.return_policy.item3': 'إيصال أو إثبات الشراء مطلوب',
        'returns.exchange_policy.title': 'سياسة الاستبدال',
        'returns.exchange_policy.desc': 'استبدل منتجك بنموذج أو حجم مختلف خلال 14 يوماً.',
        'returns.exchange_policy.item1': 'استبدال مجاني للمواصفات المختلفة',
        'returns.exchange_policy.item2': 'يتم تطبيق فرق السعر عند الترقية',
        'returns.exchange_policy.item3': 'نفس شروط الإرجاع تنطبق',
        'returns.process.title': 'عملية الإرجاع',
        'returns.process.desc': 'عملية إرجاع بسيطة من 3 خطوات لراحتك.',
        'returns.process.step1': 'اتصل بنا عبر واتساب',
        'returns.process.step2': 'نرتب الاستلام المجاني',
        'returns.process.step3': 'معالجة الاسترداد أو الاستبدال',
        'returns.contact.title': 'تحتاج مساعدة في الإرجاع؟',
        'returns.contact.desc': 'فريق الدعم لدينا هنا لمساعدتك في أي أسئلة حول الإرجاع أو الاستبدال.',
        'returns.contact.whatsapp': 'دعم واتساب',
        'returns.contact.phone': 'اتصل بنا'
    }
};

// Support form functions
function resetSupportForm() {
    document.getElementById('supportForm').reset();
}

function handleSupportFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const supportData = {
        name: formData.get('customerName'),
        email: formData.get('customerEmail'),
        phone: formData.get('customerPhone'),
        type: formData.get('supportType'),
        product: formData.get('productInfo'),
        description: formData.get('problemDescription'),
        urgency: formData.get('urgency'),
        terms: formData.get('agreeTerms')
    };
    
    // Create WhatsApp message
    const message = createSupportMessage(supportData);
    const whatsappUrl = `https://wa.me/212779318061?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Show success message
    showSupportSuccess();
    
    // Reset form
    resetSupportForm();
}

function createSupportMessage(data) {
    const urgencyText = {
        'low': 'Low Priority',
        'medium': 'Medium Priority', 
        'high': 'HIGH PRIORITY'
    };
    
    return `🔧 PIXEL PAD Support Request

👤 Customer: ${data.name}
📧 Email: ${data.email}
📱 Phone: ${data.phone}

🎯 Support Type: ${data.type}
${data.product ? `🛍️ Product: ${data.product}` : ''}
⚡ Urgency: ${urgencyText[data.urgency] || 'Not specified'}

📝 Problem Description:
${data.description}

✅ Terms Accepted: ${data.terms ? 'Yes' : 'No'}

Please provide assistance for this customer.`;
}

function showSupportSuccess() {
    // Create success modal
    const modal = document.createElement('div');
    modal.className = 'support-success-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Support Request Submitted!</h3>
            <p>Your support request has been sent to our team. We'll get back to you within 2-4 hours during business hours.</p>
            <button onclick="closeSupportModal()" class="btn btn-primary">OK</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .support-success-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .support-success-modal .modal-content {
            background: var(--bg-secondary);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 500px;
            margin: 20px;
            animation: slideUp 0.3s ease;
        }
        
        .support-success-modal .modal-icon {
            font-size: 4rem;
            color: #10b981;
            margin-bottom: 20px;
        }
        
        .support-success-modal h3 {
            font-size: 1.5rem;
            margin-bottom: 15px;
            color: var(--text-primary);
        }
        
        .support-success-modal p {
            color: var(--text-secondary);
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

function closeSupportModal() {
    const modal = document.querySelector('.support-success-modal');
    if (modal) {
        modal.remove();
    }
}

// FAQ functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });
}

// Initialize support form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const supportForm = document.getElementById('supportForm');
    if (supportForm) {
        supportForm.addEventListener('submit', handleSupportFormSubmit);
    }
    
    // Initialize FAQ functionality
    initializeFAQ();
});
