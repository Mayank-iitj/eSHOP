// Main application logic
class ECommerceApp {
  constructor() {
    this.userId = this.getUserId();
    this.apiBase = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001/api' 
      : '/api';
    this.currentProducts = [];
    this.analytics = {};
    this.init();
  }

  getUserId() {
    let userId = localStorage.getItem('ecommerce_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ecommerce_user_id', userId);
    }
    return userId;
  }

  async init() {
    await this.loadRecommendations();
    await this.loadAnalytics();
    this.setupEventListeners();
    this.startRealTimeUpdates();
    this.animateOnLoad();
  }

  async loadRecommendations(algorithm = 'hybrid') {
    try {
      const response = await fetch(`${this.apiBase}/recommendations/${this.userId}?algorithm=${algorithm}&limit=15`);
      const result = await response.json();
      
      if (result.success) {
        this.currentProducts = result.data;
        this.renderProducts();
      } else {
        console.error('Failed to load recommendations:', result.error);
        this.showError('Failed to load recommendations. Please try again.');
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      this.showError('Network error. Please check your connection.');
    }
  }

  async loadAnalytics() {
    try {
      const response = await fetch(`${this.apiBase}/analytics`);
      const result = await response.json();
      
      if (result.success) {
        this.analytics = result.data;
        this.renderAnalytics();
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }

  renderProducts() {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    this.currentProducts.forEach((product, index) => {
      const card = this.createProductCard(product, index);
      grid.appendChild(card);
    });

    this.addProductEventListeners();
  }

  createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-product-id', product.id);
    
    const discountBadge = product.discount ? 
      `<div class="discount-badge">${product.discount} OFF</div>` : '';
    
    const ratingStars = this.generateStars(parseFloat(product.rating));
    
    card.innerHTML = `
      ${discountBadge}
      <div class="tooltip">${product.reason}</div>
      <div class="product-info">
        <div class="product-title" tabindex="0">${product.title}</div>
        <div class="product-meta" tabindex="0">
          <span class="category">${product.category}</span> | 
          <span class="marketplace">${product.marketplace}</span>
        </div>
        <div class="product-rating">
          ${ratingStars}
          <span class="rating-text">${product.rating} (${product.reviews})</span>
        </div>
        <div class="product-price" tabindex="0">
          <span class="current-price">₹${this.formatPrice(product.price)}</span>
          ${product.originalPrice ? 
            `<span class="original-price">₹${this.formatPrice(product.originalPrice)}</span>` : ''}
        </div>
        <div class="product-features">
          ${product.features.slice(0, 2).map(feature => 
            `<span class="feature-tag">${feature}</span>`
          ).join('')}
        </div>
        <div class="product-actions">
          <a href="${product.url}" target="_blank" rel="noopener noreferrer" 
             class="action-btn primary" title="View on ${product.marketplace}" 
             data-action="view">
            <i class="fa-solid fa-external-link-alt"></i>
            <span class="btn-tooltip">View Product</span>
          </a>
          <button class="action-btn" title="Add to Wishlist" data-action="wishlist">
            <i class="fa-regular fa-heart"></i>
            <span class="btn-tooltip">Wishlist</span>
          </button>
          <button class="action-btn" title="Share Product" data-action="share">
            <i class="fa-solid fa-share-nodes"></i>
            <span class="btn-tooltip">Share</span>
          </button>
          <button class="action-btn" title="Compare" data-action="compare">
            <i class="fa-solid fa-balance-scale"></i>
            <span class="btn-tooltip">Compare</span>
          </button>
        </div>
        ${product.fastDelivery ? '<div class="fast-delivery">🚚 Fast Delivery</div>' : ''}
        ${!product.inStock ? '<div class="out-of-stock">Out of Stock</div>' : ''}
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
      stars += '<i class="fa-solid fa-star"></i>';
    }
    if (hasHalfStar) {
      stars += '<i class="fa-solid fa-star-half-stroke"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="fa-regular fa-star"></i>';
    }
    
    return stars;
  }

  formatPrice(price) {
    return parseInt(price).toLocaleString('en-IN');
  }

  renderAnalytics() {
    const analyticsGrid = document.querySelector('.analytics-grid');
    if (!analyticsGrid || !this.analytics) return;

    analyticsGrid.innerHTML = `
      <div class="analytics-card" tabindex="0">
        <div class="analytics-icon">📊</div>
        <div class="analytics-title">Total Product Views</div>
        <div class="analytics-value">${this.analytics.totalViews.toLocaleString()}</div>
        <div class="analytics-desc">Products viewed by all users</div>
      </div>
      <div class="analytics-card" tabindex="0">
        <div class="analytics-icon">🎯</div>
        <div class="analytics-title">Click-Through Rate</div>
        <div class="analytics-value">${this.analytics.conversionRate}%</div>
        <div class="analytics-desc">Percentage of views that result in clicks</div>
      </div>
      <div class="analytics-card" tabindex="0">
        <div class="analytics-icon">🛍️</div>
        <div class="analytics-title">Active Products</div>
        <div class="analytics-value">${this.analytics.totalProducts}</div>
        <div class="analytics-desc">Products available for recommendation</div>
      </div>
      <div class="analytics-card" tabindex="0">
        <div class="analytics-icon">👥</div>
        <div class="analytics-title">Active Users</div>
        <div class="analytics-value">${this.analytics.activeUsers}</div>
        <div class="analytics-desc">Users with tracked interactions</div>
      </div>
      <div class="analytics-card" tabindex="0">
        <div class="analytics-icon">🔥</div>
        <div class="analytics-title">Top Category</div>
        <div class="analytics-value">${this.analytics.topCategories?.[0]?.category || 'N/A'}</div>
        <div class="analytics-desc">Most popular product category</div>
      </div>
      <div class="analytics-card" tabindex="0">
        <div class="analytics-icon">⚡</div>
        <div class="analytics-title">Real-time Updates</div>
        <div class="analytics-value">Live</div>
        <div class="analytics-desc">Recommendations update every 30 seconds</div>
      </div>
    `;
  }

  addProductEventListeners() {
    document.querySelectorAll('.product-card').forEach(card => {
      const productId = card.getAttribute('data-product-id');
      const product = this.currentProducts.find(p => p.id === productId);
      
      if (!product) return;

      // Track view
      this.trackInteraction(product, 'view');

      // Action buttons
      card.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = btn.getAttribute('data-action');
          this.handleProductAction(e, product, action, btn);
        });
      });

      // Card click
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.action-btn')) {
          this.trackInteraction(product, 'card_click');
        }
      });
    });
  }

  async handleProductAction(e, product, action, btn) {
    e.preventDefault();
    e.stopPropagation();

    switch (action) {
      case 'view':
        this.trackInteraction(product, 'click');
        // Let the default link behavior happen
        return true;

      case 'wishlist':
        this.toggleWishlist(product, btn);
        break;

      case 'share':
        await this.shareProduct(product, btn);
        break;

      case 'compare':
        this.addToCompare(product, btn);
        break;
    }

    this.trackInteraction(product, action);
  }

  toggleWishlist(product, btn) {
    const icon = btn.querySelector('i');
    const tooltip = btn.querySelector('.btn-tooltip');
    
    if (btn.classList.contains('wishlisted')) {
      btn.classList.remove('wishlisted');
      icon.classList.remove('fa-solid');
      icon.classList.add('fa-regular');
      tooltip.textContent = 'Wishlist';
      this.showNotification('Removed from wishlist', 'info');
    } else {
      btn.classList.add('wishlisted');
      icon.classList.remove('fa-regular');
      icon.classList.add('fa-solid');
      tooltip.textContent = 'Wishlisted!';
      this.showNotification('Added to wishlist', 'success');
    }
  }

  async shareProduct(product, btn) {
    const shareData = {
      title: product.title,
      text: `Check out this ${product.category.toLowerCase()} on ${product.marketplace}!`,
      url: product.url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        this.showNotification('Product shared successfully', 'success');
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
        this.showNotification('Link copied to clipboard', 'success');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      this.showNotification('Failed to share product', 'error');
    }
  }

  addToCompare(product, btn) {
    let compareList = JSON.parse(localStorage.getItem('compare_list') || '[]');
    
    if (compareList.find(p => p.id === product.id)) {
      this.showNotification('Product already in comparison', 'info');
      return;
    }

    if (compareList.length >= 4) {
      this.showNotification('Maximum 4 products can be compared', 'warning');
      return;
    }

    compareList.push(product);
    localStorage.setItem('compare_list', JSON.stringify(compareList));
    this.showNotification(`Added to comparison (${compareList.length}/4)`, 'success');
  }

  async trackInteraction(product, action) {
    try {
      await fetch(`${this.apiBase}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: this.userId,
          product,
          action
        })
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }

  setupEventListeners() {
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.handleProfileSubmit(e));
    }

    // Feedback button
    const feedbackBtn = document.getElementById('feedbackBtn');
    if (feedbackBtn) {
      feedbackBtn.addEventListener('click', () => this.handleFeedbackSubmit());
    }

    // Algorithm selector
    this.createAlgorithmSelector();

    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  createAlgorithmSelector() {
    const recommendSection = document.querySelector('.recommend-section');
    if (!recommendSection) return;

    const selectorHTML = `
      <div class="algorithm-selector">
        <label for="algorithm-select">Recommendation Algorithm:</label>
        <select id="algorithm-select">
          <option value="hybrid">Hybrid (Recommended)</option>
          <option value="collaborative">Collaborative Filtering</option>
          <option value="content">Content-Based</option>
          <option value="popular">Popular Products</option>
          <option value="trending">Trending Now</option>
        </select>
      </div>
    `;

    const sectionTitle = recommendSection.querySelector('.section-title');
    sectionTitle.insertAdjacentHTML('afterend', selectorHTML);

    const selector = document.getElementById('algorithm-select');
    selector.addEventListener('change', (e) => {
      this.loadRecommendations(e.target.value);
    });
  }

  async handleProfileSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const preferences = formData.get('onboarding');

    try {
      await fetch(`${this.apiBase}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: this.userId,
          preferences: preferences.split(',').map(p => p.trim())
        })
      });

      const btn = e.target.querySelector('button[type="submit"]');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
      btn.style.background = "#1e90ff";
      
      setTimeout(() => {
        btn.innerHTML = 'Save Preferences';
        btn.style.background = "#111";
      }, 2000);

      this.showNotification('Preferences saved successfully', 'success');
      
      // Reload recommendations with new preferences
      setTimeout(() => this.loadRecommendations(), 1000);
    } catch (error) {
      console.error('Error saving profile:', error);
      this.showNotification('Failed to save preferences', 'error');
    }
  }

  async handleFeedbackSubmit() {
    const feedbackText = document.getElementById('feedback').value;
    if (!feedbackText.trim()) {
      this.showNotification('Please enter your feedback', 'warning');
      return;
    }

    try {
      await fetch(`${this.apiBase}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: this.userId,
          feedback: feedbackText
        })
      });

      document.getElementById('feedback').value = '';
      this.showNotification('Thank you for your feedback!', 'success');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      this.showNotification('Failed to submit feedback', 'error');
    }
  }

  startRealTimeUpdates() {
    // Update recommendations every 30 seconds
    setInterval(() => {
      this.loadRecommendations();
    }, 30000);

    // Update analytics every 60 seconds
    setInterval(() => {
      this.loadAnalytics();
    }, 60000);
  }

  animateOnLoad() {
    // Animate cards on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    });

    document.querySelectorAll('.product-card, .analytics-card').forEach(card => {
      observer.observe(card);
    });
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  showError(message) {
    const grid = document.querySelector('.product-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="error-message">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <h3>Oops! Something went wrong</h3>
          <p>${message}</p>
          <button onclick="location.reload()" class="retry-btn">Try Again</button>
        </div>
      `;
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ECommerceApp();
});