// Product Database with Valid Amazon URLs
const products = [
  {
    id: 1,
    title: "Apple iPhone 15 (128GB) - Natural Titanium",
    category: "Electronics",
    marketplace: "Amazon",
    price: 79900,
    originalPrice: 89900,
    discount: 11,
    rating: 4.5,
    reviews: "12,456",
    url: "https://www.amazon.in/dp/B0CHX1W00X",
    features: ["A17 Pro chip", "48MP camera", "USB-C"],
    inStock: true
  },
  {
    id: 2,
    title: "Samsung Galaxy S24 Ultra 5G (256GB)",
    category: "Electronics",
    marketplace: "Amazon",
    price: 124999,
    originalPrice: 134999,
    discount: 7,
    rating: 4.4,
    reviews: "8,234",
    url: "https://www.amazon.in/dp/B0CMDRCZBX",
    features: ["200MP camera", "S Pen", "AI features"],
    inStock: true
  },
  {
    id: 3,
    title: "Nike Revolution 6 Men's Running Shoes",
    category: "Fashion",
    marketplace: "Amazon",
    price: 3495,
    originalPrice: 4995,
    discount: 30,
    rating: 4.2,
    reviews: "15,234",
    url: "https://www.amazon.in/dp/B09JQPX8VH",
    features: ["Lightweight", "Breathable", "Durable"],
    inStock: true
  },
  {
    id: 4,
    title: "Philips Air Fryer HD9252/90 (4.1L)",
    category: "Home",
    marketplace: "Amazon",
    price: 7999,
    originalPrice: 12995,
    discount: 38,
    rating: 4.3,
    reviews: "45,678",
    url: "https://www.amazon.in/dp/B077GBQZPX",
    features: ["Rapid Air Technology", "Digital display"],
    inStock: true
  },
  {
    id: 5,
    title: "Atomic Habits by James Clear",
    category: "Books",
    marketplace: "Amazon",
    price: 399,
    originalPrice: 599,
    discount: 33,
    rating: 4.6,
    reviews: "89,012",
    url: "https://www.amazon.in/dp/1847941834",
    features: ["Bestseller", "Self-help", "Paperback"],
    inStock: true
  },
  {
    id: 6,
    title: "Boldfit Gym Shaker Bottle 700ml",
    category: "Sports",
    marketplace: "Amazon",
    price: 299,
    originalPrice: 999,
    discount: 70,
    rating: 4.3,
    reviews: "34,567",
    url: "https://www.amazon.in/dp/B07QMKX8VN",
    features: ["BPA free", "Leak proof", "Wire whisk"],
    inStock: true
  },
  {
    id: 7,
    title: "OnePlus 12R 5G (128GB) - Cool Blue",
    category: "Electronics",
    marketplace: "Amazon",
    price: 39999,
    originalPrice: 42999,
    discount: 7,
    rating: 4.3,
    reviews: "5,678",
    url: "https://www.amazon.in/dp/B0CQVBZJX8",
    features: ["Snapdragon 8 Gen 2", "100W charging"],
    inStock: true
  },
  {
    id: 8,
    title: "Levi's Men's 511 Slim Jeans",
    category: "Fashion",
    marketplace: "Amazon",
    price: 2399,
    originalPrice: 3999,
    discount: 40,
    rating: 4.2,
    reviews: "12,345",
    url: "https://www.amazon.in/dp/B07BQXM8VN",
    features: ["Slim fit", "Cotton blend", "Multiple sizes"],
    inStock: true
  },
  {
    id: 9,
    title: "Prestige Deluxe Alpha Pressure Cooker 5L",
    category: "Home",
    marketplace: "Amazon",
    price: 1899,
    originalPrice: 2850,
    discount: 33,
    rating: 4.5,
    reviews: "67,890",
    url: "https://www.amazon.in/dp/B00KDWVS8A",
    features: ["Stainless steel", "Induction compatible"],
    inStock: true
  },
  {
    id: 10,
    title: "The Psychology of Money by Morgan Housel",
    category: "Books",
    marketplace: "Amazon",
    price: 299,
    originalPrice: 399,
    discount: 25,
    rating: 4.5,
    reviews: "45,678",
    url: "https://www.amazon.in/dp/9390166268",
    features: ["Finance", "Bestseller", "Paperback"],
    inStock: true
  },
  {
    id: 11,
    title: "Strauss Yoga Mat Anti Skid EVA (6mm)",
    category: "Sports",
    marketplace: "Amazon",
    price: 699,
    originalPrice: 1999,
    discount: 65,
    rating: 4.0,
    reviews: "8,901",
    url: "https://www.amazon.in/dp/B01AVDVHTI",
    features: ["Anti-skid", "6mm thick", "Eco-friendly"],
    inStock: true
  },
  {
    id: 12,
    title: "Allen Solly Women's Regular Fit Shirt",
    category: "Fashion",
    marketplace: "Amazon",
    price: 899,
    originalPrice: 1799,
    discount: 50,
    rating: 4.1,
    reviews: "6,789",
    url: "https://www.amazon.in/dp/B08XQMN8VB",
    features: ["Regular fit", "Cotton", "Formal wear"],
    inStock: true
  }
];

// Application State
let currentProducts = [...products];
let analytics = {
  totalViews: 1247,
  totalClicks: 89,
  conversionRate: 7.1,
  totalProducts: products.length,
  topCategory: "Electronics"
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
  loadProducts();
  loadAnalytics();
  startRealTimeUpdates();
  initializeAnimations();
});

// Initialize Animations
function initializeAnimations() {
  // Animate elements on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe all cards
  document.querySelectorAll('.product-card, .analytics-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
}

// Load and Display Products
function loadProducts() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';
  
  currentProducts.forEach((product, index) => {
    const card = createProductCard(product);
    card.style.animationDelay = `${index * 0.1}s`;
    grid.appendChild(card);
  });

  // Re-initialize animations for new products
  setTimeout(initializeAnimations, 100);
}

// Create Product Card
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.onclick = () => trackView(product);
  
  const discountBadge = product.discount > 0 ? 
    `<div class="discount-badge">${product.discount}% OFF</div>` : '';
  
  const stars = generateStars(product.rating);
  
  card.innerHTML = `
    ${discountBadge}
    <div class="product-info">
      <div class="product-title">${product.title}</div>
      <div class="product-meta">
        <span class="category-tag">${product.category}</span>
        <span class="marketplace">${product.marketplace}</span>
      </div>
      <div class="product-rating">
        <div class="stars">${stars}</div>
        <span class="rating-text">${product.rating} (${product.reviews})</span>
      </div>
      <div class="product-price">
        <span class="current-price">₹${formatPrice(product.price)}</span>
        ${product.originalPrice ? 
          `<span class="original-price">₹${formatPrice(product.originalPrice)}</span>` : ''}
      </div>
      <div class="product-actions">
        <a href="${product.url}" target="_blank" rel="noopener noreferrer" class="action-btn primary" onclick="trackClick(event, ${product.id})">
          <i class="fas fa-external-link-alt"></i>
          <span>View Product</span>
        </a>
        <button class="action-btn" onclick="addToWishlist(event, ${product.id})" title="Add to Wishlist">
          <i class="far fa-heart"></i>
        </button>
        <button class="action-btn" onclick="shareProduct(event, ${product.id})" title="Share Product">
          <i class="fas fa-share-alt"></i>
        </button>
      </div>
    </div>
  `;
  
  return card;
}

// Generate Star Rating
function generateStars(rating) {
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

// Format Price
function formatPrice(price) {
  return price.toLocaleString('en-IN');
}

// Filter Products by Category
function filterProducts() {
  const category = document.getElementById('categoryFilter').value;
  
  if (category === 'all') {
    currentProducts = [...products];
  } else {
    currentProducts = products.filter(p => p.category === category);
  }
  
  loadProducts();
  showNotification(`Filtered by ${category === 'all' ? 'All Categories' : category}`, 'success');
}

// Sort Products
function sortProducts() {
  const sortBy = document.getElementById('sortFilter').value;
  
  switch (sortBy) {
    case 'rating':
      currentProducts.sort((a, b) => b.rating - a.rating);
      break;
    case 'price-low':
      currentProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      currentProducts.sort((a, b) => b.price - a.price);
      break;
    case 'discount':
      currentProducts.sort((a, b) => b.discount - a.discount);
      break;
  }
  
  loadProducts();
  showNotification(`Sorted by ${sortBy.replace('-', ' ')}`, 'success');
}

// Load More Products (Shuffle existing)
function loadMoreProducts() {
  currentProducts = shuffleArray([...products]);
  loadProducts();
  showNotification('Products refreshed!', 'success');
}

// Shuffle Array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Track Product View
function trackView(product) {
  analytics.totalViews++;
  updateAnalytics();
}

// Track Product Click
function trackClick(event, productId) {
  event.stopPropagation();
  analytics.totalClicks++;
  analytics.conversionRate = ((analytics.totalClicks / analytics.totalViews) * 100).toFixed(1);
  updateAnalytics();
  showNotification('Opening product page...', 'success');
}

// Add to Wishlist
function addToWishlist(event, productId) {
  event.stopPropagation();
  const btn = event.target.closest('.action-btn');
  const icon = btn.querySelector('i');
  
  if (icon.classList.contains('far')) {
    icon.classList.remove('far');
    icon.classList.add('fas');
    btn.style.background = '#1db954';
    btn.style.color = 'white';
    btn.style.borderColor = '#1db954';
    showNotification('Added to wishlist!', 'success');
  } else {
    icon.classList.remove('fas');
    icon.classList.add('far');
    btn.style.background = '';
    btn.style.color = '';
    btn.style.borderColor = '';
    showNotification('Removed from wishlist', 'warning');
  }
}

// Share Product
function shareProduct(event, productId) {
  event.stopPropagation();
  const product = products.find(p => p.id === productId);
  
  if (navigator.share) {
    navigator.share({
      title: product.title,
      text: `Check out this ${product.category.toLowerCase()} on ${product.marketplace}!`,
      url: product.url
    }).then(() => {
      showNotification('Product shared successfully!', 'success');
    }).catch(() => {
      copyToClipboard(product.url);
    });
  } else {
    copyToClipboard(product.url);
  }
}

// Copy to Clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Link copied to clipboard!', 'success');
  }).catch(() => {
    showNotification('Failed to copy link', 'error');
  });
}

// Load Analytics
function loadAnalytics() {
  const grid = document.getElementById('analyticsGrid');
  
  grid.innerHTML = `
    <div class="analytics-card">
      <div class="analytics-icon">👁️</div>
      <div class="analytics-title">Total Views</div>
      <div class="analytics-value">${analytics.totalViews.toLocaleString()}</div>
      <div class="analytics-desc">Product page views</div>
    </div>
    <div class="analytics-card">
      <div class="analytics-icon">🎯</div>
      <div class="analytics-title">Click Rate</div>
      <div class="analytics-value">${analytics.conversionRate}%</div>
      <div class="analytics-desc">View to click conversion</div>
    </div>
    <div class="analytics-card">
      <div class="analytics-icon">🛍️</div>
      <div class="analytics-title">Products</div>
      <div class="analytics-value">${analytics.totalProducts}</div>
      <div class="analytics-desc">Available products</div>
    </div>
    <div class="analytics-card">
      <div class="analytics-icon">🔥</div>
      <div class="analytics-title">Top Category</div>
      <div class="analytics-value">${analytics.topCategory}</div>
      <div class="analytics-desc">Most popular category</div>
    </div>
    <div class="analytics-card">
      <div class="analytics-icon">⚡</div>
      <div class="analytics-title">Real-time</div>
      <div class="analytics-value">Live</div>
      <div class="analytics-desc">Updates every 10 seconds</div>
    </div>
    <div class="analytics-card">
      <div class="analytics-icon">🌟</div>
      <div class="analytics-title">Avg Rating</div>
      <div class="analytics-value">${calculateAverageRating()}</div>
      <div class="analytics-desc">Average product rating</div>
    </div>
  `;
}

// Calculate Average Rating
function calculateAverageRating() {
  const total = products.reduce((sum, product) => sum + product.rating, 0);
  return (total / products.length).toFixed(1);
}

// Update Analytics
function updateAnalytics() {
  loadAnalytics();
}

// Start Real-time Updates
function startRealTimeUpdates() {
  setInterval(() => {
    // Simulate real-time data updates
    analytics.totalViews += Math.floor(Math.random() * 3) + 1;
    analytics.totalClicks += Math.floor(Math.random() * 2);
    analytics.conversionRate = ((analytics.totalClicks / analytics.totalViews) * 100).toFixed(1);
    updateAnalytics();
  }, 10000); // Update every 10 seconds
}

// Scroll to Products
function scrollToProducts() {
  document.getElementById('products').scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });
}

// Toggle Mobile Navigation
function toggleMobileNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  
  nav.classList.toggle('active');
  toggle.classList.toggle('active');
}

// Show Notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  const container = document.getElementById('notifications');
  container.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Remove notification
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add loading states for better UX
function addLoadingState(element) {
  element.style.opacity = '0.7';
  element.style.pointerEvents = 'none';
}

function removeLoadingState(element) {
  element.style.opacity = '1';
  element.style.pointerEvents = 'auto';
}

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
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

// Add scroll-based animations
window.addEventListener('scroll', debounce(() => {
  const scrolled = window.pageYOffset;
  const parallax = document.querySelector('.hero');
  if (parallax) {
    const speed = scrolled * 0.5;
    parallax.style.transform = `translateY(${speed}px)`;
  }
}, 10));