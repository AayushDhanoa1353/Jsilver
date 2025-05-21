// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentFilters = {
    categories: ['All'],
    priceRange: 'All'
};

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initializeFilters();
    
    // Add click event listeners to all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const product = {
                id: Date.now(), // Unique ID for the product
                name: productCard.querySelector('h3').textContent,
                price: parseInt(productCard.querySelector('.price').textContent.replace('₹', '')),
                image: productCard.querySelector('img').src,
                category: getProductCategory(productCard.querySelector('h3').textContent)
            };
            addToCart(product);
        });
    });
});

// Initialize filter event listeners
function initializeFilters() {
    const categoryCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    const priceRadios = document.querySelectorAll('.filter-options input[type="radio"]');
    const applyFiltersButton = document.querySelector('.apply-filters');

    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const category = checkbox.nextSibling.textContent.trim();
            if (category === 'All') {
                if (checkbox.checked) {
                    currentFilters.categories = ['All'];
                    categoryCheckboxes.forEach(cb => {
                        if (cb.nextSibling.textContent.trim() !== 'All') {
                            cb.checked = false;
                        }
                    });
                }
            } else {
                if (checkbox.checked) {
                    currentFilters.categories = currentFilters.categories.filter(c => c !== 'All');
                    currentFilters.categories.push(category);
                    document.querySelector('.filter-options input[type="checkbox"]').checked = false;
                } else {
                    currentFilters.categories = currentFilters.categories.filter(c => c !== category);
                    if (currentFilters.categories.length === 0) {
                        currentFilters.categories = ['All'];
                        document.querySelector('.filter-options input[type="checkbox"]').checked = true;
                    }
                }
            }
        });
    });

    priceRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            currentFilters.priceRange = radio.nextSibling.textContent.trim();
        });
    });

    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', applyFilters);
    }
}

// Get product category based on product name
function getProductCategory(productName) {
    const name = productName.toLowerCase();
    if (name.includes('necklace') || name.includes('chain') || name.includes('choker')) {
        return 'Necklaces';
    } else if (name.includes('bracelet') || name.includes('bangle') || name.includes('anklet')) {
        return 'Bracelets';
    } else if (name.includes('earring')) {
        return 'Earrings';
    } else if (name.includes('ring')) {
        return 'Rings';
    }
    return 'All';
}

// Apply filters to products
function applyFilters() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const productName = card.querySelector('h3').textContent;
        const productPrice = parseInt(card.querySelector('.price').textContent.replace('₹', ''));
        const productCategory = getProductCategory(productName);
        
        let showProduct = true;
        
        // Apply category filter
        if (!currentFilters.categories.includes('All') && !currentFilters.categories.includes(productCategory)) {
            showProduct = false;
        }
        
        // Apply price range filter
        if (currentFilters.priceRange !== 'All') {
            const priceRange = currentFilters.priceRange;
            if (priceRange === 'Under ₹200' && productPrice >= 200) {
                showProduct = false;
            } else if (priceRange === '₹200 - ₹300' && (productPrice < 200 || productPrice > 300)) {
                showProduct = false;
            } else if (priceRange === '₹300 - ₹500' && (productPrice < 300 || productPrice > 500)) {
                showProduct = false;
            } else if (priceRange === 'Over ₹500' && productPrice <= 500) {
                showProduct = false;
            }
        }
        
        card.style.display = showProduct ? 'block' : 'none';
    });
}

// Add to cart function
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showAddedToCartMessage();
}

// Update cart count in header
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Show added to cart message
function showAddedToCartMessage() {
    const message = document.createElement('div');
    message.className = 'cart-message';
    message.textContent = 'Added to cart!';
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 2000);
}

// Display cart items
function displayCartItems() {
    const cartItems = document.querySelector('.cart-items');
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="price">₹${item.price}</p>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    updateCartSummary();
}

// Update quantity
function updateQuantity(id, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(id);
        return;
    }

    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        updateCartCount();
    }
}

// Remove from cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartCount();
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const subtotalElement = document.querySelector('.subtotal');
    const totalElement = document.querySelector('.total-amount');
    
    if (subtotalElement && totalElement) {
        subtotalElement.textContent = `₹${subtotal}`;
        totalElement.textContent = `₹${subtotal}`;
    }
}

// Initialize cart display if on cart page
if (document.querySelector('.cart-section')) {
    displayCartItems();
} 