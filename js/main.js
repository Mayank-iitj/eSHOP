// Enhanced Multi-Vendor Marketplace Application
class HyperMartApp {
  constructor() {
    this.userId = this.getUserId();
    this.apiBase = '/api';
    this.currentProducts = [];
    this.cart = JSON.parse(localStorage.getItem('hypermart_cart') || '[]');
    this.wishlist = JSON.parse(localStorage.getItem('hypermart_wishlist') || '[]');
    this.userLocation = JSON.parse(localStorage.getItem('hypermart_location') || 'null');
    this.filters = {
      platform: 'all',
      category: 'all',
      priceMin: 0,
      priceMax: 100000,
      delivery: 'all',
      rating: 'all',
      sort: 'relevance'
    };
    this.init();
  }

  getUserId() {
    let userId = localStorage.getItem('hypermart_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('hypermart_user_id', userId);
    }
    return userId;
  }

  async init() {
    this.showLoading(true);
    await this.loadProducts();
    await this.loadDeals();
    await this.loadAnalytics();
    this.setupEventListeners();
    this.updateCartCount();
    this.updateWishlistCount();
    this.initializeLocation();
    this.startRealTimeUpdates();
    this.showLoading(false);
  }

  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
  }

  async loadProducts() {
    try {
      // Simulate API call to aggregated product service
      const mockProducts = this.generateMockProducts();
      this.currentProducts = mockProducts;
      this.renderProducts();
    } catch (error) {
      console.error('Error loading products:', error);
      this.showNotification('Failed to load products', 'error');
    }
  }

  generateMockProducts() {
    const platforms = ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Nykaa', 'Snapdeal'];
    const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books'];
    const products = [];

    for (let i = 1; i <= 24; i++) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const basePrice = Math.floor(Math.random() * 50000) + 500;
      const discount = Math.floor(Math.random() * 70) + 5;
      const discountedPrice = Math.floor(basePrice * (1 - discount / 100));

      products.push({
        id: `prod_${i}`,
        title: this.generateProductTitle(category),
        category: category,
        platform: platform,
        price: discountedPrice,
        originalPrice: basePrice,
        discount: discount,
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviews: Math.floor(Math.random() * 50000) + 100,
        url: `https://${platform.toLowerCase()}.com/product/${i}`,
        features: this.generateFeatures(category),
        inStock: Math.random() > 0.1,
        fastDelivery: Math.random() > 0.3,
        freeDelivery: Math.random() > 0.2,
        image: `https://picsum.photos/300/300?random=${i}`,
        seller: this.generateSellerName(),
        deliveryTime: this.generateDeliveryTime(),
        warranty: this.generateWarranty(category),
        returnPolicy: '7-day return',
        priceHistory: this.generatePriceHistory(basePrice),
        similarProducts: [],
        specifications: this.generateSpecifications(category)
      });
    }

    return products;
  }

  generateProductTitle(category) {
    const titles = {
      Electronics: [
        'Premium Wireless Bluetooth Headphones',
        'Smart 4K Ultra HD LED TV',
        'Gaming Mechanical Keyboard',
        'Wireless Charging Power Bank',
        'Professional DSLR Camera'
      ],
      Fashion: [
        'Designer Cotton Casual Shirt',
        'Premium Leather Formal Shoes',
        'Trendy Denim Jacket',
        'Elegant Evening Dress',
        'Comfortable Running Sneakers'
      ],
      Home: [
        'Stainless Steel Pressure Cooker',
        'Non-Stick Cookware Set',
        'Premium Bed Sheet Set',
        'Decorative Table Lamp',
        'Ergonomic Office Chair'
      ],
      Beauty: [
        'Anti-Aging Face Serum',
        'Professional Makeup Kit',
        'Organic Hair Care Set',
        'Luxury Perfume Collection',
        'Skincare Routine Bundle'
      ],
      Sports: [
        'Professional Yoga Mat',
        'Adjustable Dumbbells Set',
        'Premium Sports Shoes',
        'Fitness Tracker Watch',
        'Outdoor Camping Gear'
      ],
      Books: [
        'Bestselling Fiction Novel',
        'Self-Help Motivation Book',
        'Technical Programming Guide',
        'Cooking Recipe Collection',
        'Travel Photography Book'
      ]
    };
    
    const categoryTitles = titles[category] || titles.Electronics;
    return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
  }

  generateFeatures(category) {
    const features = {
      Electronics: ['Wireless', 'Fast Charging', 'HD Display', 'Long Battery'],
      Fashion: ['Premium Quality', 'Comfortable Fit', 'Trendy Design', 'Durable'],
      Home: ['Easy to Clean', 'Space Saving', 'Durable', 'Stylish'],
      Beauty: ['Natural Ingredients', 'Dermatologist Tested', 'Long Lasting', 'Cruelty Free'],
      Sports: ['Lightweight', 'Breathable', 'Durable', 'Professional Grade'],
      Books: ['Bestseller', 'Expert Author', 'Comprehensive', 'Easy to Read']
    };
    
    const categoryFeatures = features[category] || features.Electronics;
    return categoryFeatures.slice(0, 3);
  }

  generateSellerName() {
    const sellers = ['TechWorld', 'FashionHub', 'HomeEssentials', 'BeautyStore', 'SportsPro', 'BookMart'];
    return sellers[Math.floor(Math.random() * sellers.length)];
  }

  generateDeliveryTime() {
    const times = ['Same Day', 'Next Day', '2 Days', '3-5 Days', '1 Week'];
    return times[Math.floor(Math.random() * times.length)];
  }

  generateWarranty(category) {
    const warranties = {
      Electronics: ['1 Year', '2 Years', '3 Years'],
      Fashion: ['No Warranty', '30 Days'],
      Home: ['1 Year', '2 Years'],
      Beauty: ['No Warranty', '6 Months'],
      Sports: ['1 Year', '6 Months'],
      Books: ['No Warranty']
    };
    
    const categoryWarranties = warranties[category] || ['1 Year'];
    return categoryWarranties[Math.floor(Math.random() * categoryWarranties.length)];
  }

  generatePriceHistory(basePrice) {
    const history = [];
    for (let i = 30; i >= 0; i--) {
      const variation = (Math.random() - 0.5) * 0.2;
      const price = Math.floor(basePrice * (1 + variation));
      history.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: price
      });
    }
    return history;
  }

  generateSpecifications(category) {
    const specs = {
      Electronics: {
        'Brand': 'TechBrand',
        'Model': 'TB-2024',
        'Color': 'Black',
        'Connectivity': 'Bluetooth 5.0'
      },
      Fashion: {
        'Material': 'Cotton',
        'Size': 'M',
        'Color': 'Blue',
        'Care': 'Machine Wash'
      },
      Home: {
        'Material': 'Stainless Steel',
        'Capacity': '5L',
        'Dimensions': '30x20x15 cm',
        'Weight': '2.5 kg'
      }
    };
    
    return specs[category] || specs.Electronics;
  }

  renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    
    this.currentProducts.forEach((product, index) => {
      const card = this.createProductCard(product, index);
      grid.appendChild(card);
    });
  }

  createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);
    
    const discountBadge = product.discount > 0 ? 
      `<div class="discount-badge">${product.discount}% OFF</div>` : '';
    
    const platformBadge = `<div class="platform-badge ${product.platform.toLowerCase()}">${product.platform}</div>`;
    
    const deliveryBadge = product.fastDelivery ? 
      '<div class="delivery-badge">🚚 Fast Delivery</div>' : '';
    
    const stockStatus = !product.inStock ? 
      '<div class="stock-status out-of-stock">Out of Stock</div>' : '';
    
    const ratingStars = this.generateStars(parseFloat(product.rating));
    
    card.innerHTML = `
      ${discountBadge}
      ${platformBadge}
      ${deliveryBadge}
      ${stockStatus}
      
      <div class="product-image">
        <img src="${product.image}" alt="${product.title}" loading="lazy">
        <div class="product-overlay">
          <button class="quick-view-btn" onclick="app.openQuickView('${product.id}')" title="Quick View">
            <i class="fas fa-eye"></i>
          </button>
          <button class="compare-btn" onclick="app.addToCompare('${product.id}')" title="Compare">
            <i class="fas fa-balance-scale"></i>
          </button>
        </div>
      </div>
      
      <div class="product-info">
        <div class="product-title">${product.title}</div>
        <div class="product-meta">
          <span class="category">${product.category}</span>
          <span class="seller">by ${product.seller}</span>
        </div>
        
        <div class="product-rating">
          <div class="stars">${ratingStars}</div>
          <span class="rating-text">${product.rating} (${this.formatNumber(product.reviews)})</span>
        </div>
        
        <div class="price-comparison">
          <div class="current-price">₹${this.formatPrice(product.price)}</div>
          ${product.originalPrice ? 
            `<div class="original-price">₹${this.formatPrice(product.originalPrice)}</div>` : ''}
          <button class="price-history-btn" onclick="app.showPriceHistory('${product.id}')" title="Price History">
            <i class="fas fa-chart-line"></i>
          </button>
        </div>
        
        <div class="delivery-info">
          <i class="fas fa-truck"></i>
          <span>Delivery by ${product.deliveryTime}</span>
          ${product.freeDelivery ? '<span class="free-delivery">FREE</span>' : ''}
        </div>
        
        <div class="product-features">
          ${product.features.slice(0, 2).map(feature => 
            `<span class="feature-tag">${feature}</span>`
          ).join('')}
        </div>
        
        <div class="product-actions">
          <button class="action-btn primary" onclick="app.addToCart('${product.id}')" ${!product.inStock ? 'disabled' : ''}>
            <i class="fas fa-shopping-cart"></i>
            <span>${!product.inStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
          <button class="action-btn wishlist" onclick="app.toggleWishlistItem('${product.id}')" title="Add to Wishlist">
            <i class="far fa-heart"></i>
          </button>
          <a href="${product.url}" target="_blank" rel="noopener noreferrer" class="action-btn" title="View on ${product.platform}">
            <i class="fas fa-external-link-alt"></i>
          </a>
        </div>
      </div>
    `;

    // Add animation delay
    card.style.animationDelay = `${index * 0.1}s`;
    
    return card;
  }

  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
  }

  formatPrice(price) {
    return parseInt(price).toLocaleString('en-IN');
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  addToCart(productId) {
    const product = this.currentProducts.find(p => p.id === productId);
    if (!product || !product.inStock) return;

    const existingItem = this.cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        ...product,
        quantity: 1,
        addedAt: new Date().toISOString()
      });
    }

    this.saveCart();
    this.updateCartCount();
    this.showNotification(`${product.title} added to cart`, 'success');
    this.trackEvent('add_to_cart', { product_id: productId, platform: product.platform });
  }

  toggleWishlistItem(productId) {
    const product = this.currentProducts.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = this.wishlist.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
      this.wishlist.splice(existingIndex, 1);
      this.showNotification(`${product.title} removed from wishlist`, 'info');
    } else {
      this.wishlist.push({
        ...product,
        addedAt: new Date().toISOString()
      });
      this.showNotification(`${product.title} added to wishlist`, 'success');
    }

    this.saveWishlist();
    this.updateWishlistCount();
    this.updateWishlistButton(productId);
  }

  updateWishlistButton(productId) {
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (!card) return;

    const wishlistBtn = card.querySelector('.wishlist');
    const icon = wishlistBtn.querySelector('i');
    const isInWishlist = this.wishlist.some(item => item.id === productId);

    if (isInWishlist) {
      icon.classList.remove('far');
      icon.classList.add('fas');
      wishlistBtn.classList.add('active');
    } else {
      icon.classList.remove('fas');
      icon.classList.add('far');
      wishlistBtn.classList.remove('active');
    }
  }

  saveCart() {
    localStorage.setItem('hypermart_cart', JSON.stringify(this.cart));
  }

  saveWishlist() {
    localStorage.setItem('hypermart_wishlist', JSON.stringify(this.wishlist));
  }

  updateCartCount() {
    const count = this.cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.getElementById('cartCount');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'block' : 'none';
    }
  }

  updateWishlistCount() {
    const count = this.wishlist.length;
    const badge = document.getElementById('wishlistCount');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'block' : 'none';
    }
  }

  async loadDeals() {
    // Simulate loading deals
    const dealsGrid = document.getElementById('dealsGrid');
    if (!dealsGrid) return;

    const deals = this.currentProducts
      .filter(p => p.discount > 30)
      .slice(0, 6)
      .map(product => ({
        ...product,
        dealEndTime: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000)
      }));

    dealsGrid.innerHTML = deals.map(deal => this.createDealCard(deal)).join('');
  }

  createDealCard(deal) {
    const timeLeft = this.getTimeLeft(deal.dealEndTime);
    
    return `
      <div class="deal-card">
        <div class="deal-timer">
          <i class="fas fa-clock"></i>
          <span>${timeLeft}</span>
        </div>
        <div class="deal-discount">${deal.discount}% OFF</div>
        <img src="${deal.image}" alt="${deal.title}">
        <div class="deal-info">
          <h4>${deal.title}</h4>
          <div class="deal-price">
            <span class="current">₹${this.formatPrice(deal.price)}</span>
            <span class="original">₹${this.formatPrice(deal.originalPrice)}</span>
          </div>
          <button class="deal-btn" onclick="app.addToCart('${deal.id}')">
            Grab Deal
          </button>
        </div>
      </div>
    `;
  }

  getTimeLeft(endTime) {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  async loadAnalytics() {
    const analyticsGrid = document.getElementById('analyticsGrid');
    if (!analyticsGrid) return;

    const analytics = {
      totalProducts: 50000000,
      activePlatforms: 10,
      dailyDeals: 15000,
      avgSavings: 35,
      userSatisfaction: 4.8,
      deliverySpeed: '1.2 days'
    };

    analyticsGrid.innerHTML = `
      <div class="analytics-card">
        <div class="analytics-icon">📦</div>
        <div class="analytics-title">Total Products</div>
        <div class="analytics-value">${this.formatNumber(analytics.totalProducts)}+</div>
        <div class="analytics-desc">Across all platforms</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-icon">🏪</div>
        <div class="analytics-title">Active Platforms</div>
        <div class="analytics-value">${analytics.activePlatforms}</div>
        <div class="analytics-desc">Integrated marketplaces</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-icon">🔥</div>
        <div class="analytics-title">Daily Deals</div>
        <div class="analytics-value">${this.formatNumber(analytics.dailyDeals)}</div>
        <div class="analytics-desc">New deals every day</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-icon">💰</div>
        <div class="analytics-title">Avg Savings</div>
        <div class="analytics-value">${analytics.avgSavings}%</div>
        <div class="analytics-desc">Compared to individual platforms</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-icon">⭐</div>
        <div class="analytics-title">User Satisfaction</div>
        <div class="analytics-value">${analytics.userSatisfaction}/5</div>
        <div class="analytics-desc">Average user rating</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-icon">🚚</div>
        <div class="analytics-title">Delivery Speed</div>
        <div class="analytics-value">${analytics.deliverySpeed}</div>
        <div class="analytics-desc">Average delivery time</div>
      </div>
    `;
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.performSearch();
        }
      });
    }

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.applyQuickFilter(e.target.dataset.filter);
      });
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Update wishlist buttons on load
    setTimeout(() => {
      this.currentProducts.forEach(product => {
        this.updateWishlistButton(product.id);
      });
    }, 100);
  }

  handleSearch(e) {
    const query = e.target.value.toLowerCase();
    if (query.length < 2) return;

    // Show search suggestions
    this.showSearchSuggestions(query);
  }

  showSearchSuggestions(query) {
    const suggestions = document.getElementById('searchSuggestions');
    if (!suggestions) return;

    const matches = this.currentProducts
      .filter(p => p.title.toLowerCase().includes(query))
      .slice(0, 5);

    if (matches.length === 0) {
      suggestions.style.display = 'none';
      return;
    }

    suggestions.innerHTML = matches.map(product => `
      <div class="suggestion-item" onclick="app.selectSuggestion('${product.id}')">
        <img src="${product.image}" alt="${product.title}">
        <div class="suggestion-info">
          <div class="suggestion-title">${product.title}</div>
          <div class="suggestion-price">₹${this.formatPrice(product.price)}</div>
        </div>
      </div>
    `).join('');

    suggestions.style.display = 'block';
  }

  selectSuggestion(productId) {
    const product = this.currentProducts.find(p => p.id === productId);
    if (product) {
      document.getElementById('searchInput').value = product.title;
      document.getElementById('searchSuggestions').style.display = 'none';
      this.performSearch();
    }
  }

  performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    if (!query) return;

    const filtered = this.currentProducts.filter(product =>
      product.title.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.features.some(feature => feature.toLowerCase().includes(query))
    );

    this.currentProducts = filtered;
    this.renderProducts();
    this.showNotification(`Found ${filtered.length} products for "${query}"`, 'info');
    this.trackEvent('search', { query, results: filtered.length });
  }

  applyQuickFilter(filter) {
    let filtered = [...this.currentProducts];

    switch (filter) {
      case 'trending':
        filtered = filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'deals':
        filtered = filtered.filter(p => p.discount > 20).sort((a, b) => b.discount - a.discount);
        break;
      case 'new':
        filtered = filtered.sort(() => Math.random() - 0.5);
        break;
      case 'premium':
        filtered = filtered.filter(p => p.price > 10000);
        break;
      case 'local':
        // Simulate local products
        filtered = filtered.filter(() => Math.random() > 0.7);
        break;
    }

    this.currentProducts = filtered;
    this.renderProducts();
    this.showNotification(`Applied ${filter} filter`, 'success');
  }

  initializeLocation() {
    if (this.userLocation) {
      document.getElementById('userLocation').textContent = this.userLocation.city;
    }
  }

  startRealTimeUpdates() {
    // Update deals countdown every minute
    setInterval(() => {
      this.updateDealsCountdown();
    }, 60000);

    // Refresh analytics every 5 minutes
    setInterval(() => {
      this.loadAnalytics();
    }, 300000);
  }

  updateDealsCountdown() {
    document.querySelectorAll('.deal-timer span').forEach(timer => {
      // Update countdown logic here
    });
  }

  trackEvent(event, data) {
    // Analytics tracking
    console.log('Event tracked:', event, data);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    const container = document.getElementById('notifications');
    container.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }
}

// Global functions for HTML onclick handlers
function scrollToProducts() {
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function toggleMobileNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  nav.classList.toggle('active');
  toggle.classList.toggle('active');
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  sidebar.classList.toggle('active');
  if (sidebar.classList.contains('active')) {
    app.renderCart();
  }
}

function toggleWishlist() {
  const sidebar = document.getElementById('wishlistSidebar');
  sidebar.classList.toggle('active');
  if (sidebar.classList.contains('active')) {
    app.renderWishlist();
  }
}

function performSearch() {
  app.performSearch();
}

function loadMoreProducts() {
  app.loadProducts();
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new HyperMartApp();
});