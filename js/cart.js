// Enhanced Cart Management
class CartManager {
  constructor(app) {
    this.app = app;
    this.cart = app.cart;
    this.shippingCost = 0;
    this.taxRate = 0.18; // 18% GST
    this.discountCoupons = [
      { code: 'SAVE10', discount: 10, minAmount: 1000 },
      { code: 'SAVE20', discount: 20, minAmount: 2000 },
      { code: 'FIRST50', discount: 50, minAmount: 500 }
    ];
    this.appliedCoupon = null;
  }

  renderCart() {
    const cartContent = document.getElementById('cartContent');
    if (!cartContent) return;

    if (this.cart.length === 0) {
      cartContent.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart"></i>
          <h3>Your cart is empty</h3>
          <p>Add some products to get started</p>
          <button onclick="toggleCart()" class="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      `;
      this.updateCartTotal();
      return;
    }

    cartContent.innerHTML = `
      <div class="cart-items">
        ${this.cart.map(item => this.createCartItem(item)).join('')}
      </div>
      <div class="cart-summary">
        ${this.createCartSummary()}
      </div>
    `;

    this.updateCartTotal();
  }

  createCartItem(item) {
    return `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="item-image">
          <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="item-details">
          <h4>${item.title}</h4>
          <p class="item-platform">${item.platform}</p>
          <p class="item-seller">Sold by ${item.seller}</p>
          <div class="item-features">
            ${item.features.slice(0, 2).map(feature => 
              `<span class="feature-tag">${feature}</span>`
            ).join('')}
          </div>
        </div>
        <div class="item-price">
          <div class="current-price">₹${this.app.formatPrice(item.price)}</div>
          ${item.originalPrice ? 
            `<div class="original-price">₹${this.app.formatPrice(item.originalPrice)}</div>` : ''}
          ${item.discount ? `<div class="discount">${item.discount}% OFF</div>` : ''}
        </div>
        <div class="item-quantity">
          <button onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})" 
                  class="qty-btn" ${item.quantity <= 1 ? 'disabled' : ''}>
            <i class="fas fa-minus"></i>
          </button>
          <span class="qty-display">${item.quantity}</span>
          <button onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})" 
                  class="qty-btn">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        <div class="item-total">
          ₹${this.app.formatPrice(item.price * item.quantity)}
        </div>
        <div class="item-actions">
          <button onclick="cartManager.moveToWishlist('${item.id}')" 
                  class="action-btn" title="Move to Wishlist">
            <i class="fas fa-heart"></i>
          </button>
          <button onclick="cartManager.removeFromCart('${item.id}')" 
                  class="action-btn remove" title="Remove">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  createCartSummary() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    const tax = this.getTaxAmount();
    const total = this.getTotal();

    return `
      <div class="summary-section">
        <h4>Order Summary</h4>
        <div class="summary-row">
          <span>Subtotal (${this.getTotalItems()} items)</span>
          <span>₹${this.app.formatPrice(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span>${this.shippingCost === 0 ? 'FREE' : '₹' + this.app.formatPrice(this.shippingCost)}</span>
        </div>
        ${discount > 0 ? `
          <div class="summary-row discount">
            <span>Discount (${this.appliedCoupon.code})</span>
            <span>-₹${this.app.formatPrice(discount)}</span>
          </div>
        ` : ''}
        <div class="summary-row">
          <span>Tax (GST)</span>
          <span>₹${this.app.formatPrice(tax)}</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>₹${this.app.formatPrice(total)}</span>
        </div>
      </div>
      
      <div class="coupon-section">
        <div class="coupon-input">
          <input type="text" id="couponCode" placeholder="Enter coupon code">
          <button onclick="cartManager.applyCoupon()" class="apply-btn">Apply</button>
        </div>
        <div class="available-coupons">
          <p>Available Coupons:</p>
          ${this.discountCoupons.map(coupon => `
            <div class="coupon-item" onclick="cartManager.applyCouponCode('${coupon.code}')">
              <span class="coupon-code">${coupon.code}</span>
              <span class="coupon-desc">${coupon.discount}% off on orders above ₹${coupon.minAmount}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="delivery-options">
        <h5>Delivery Options</h5>
        <div class="delivery-option">
          <input type="radio" id="standard" name="delivery" value="standard" checked>
          <label for="standard">Standard Delivery (3-5 days) - FREE</label>
        </div>
        <div class="delivery-option">
          <input type="radio" id="express" name="delivery" value="express">
          <label for="express">Express Delivery (1-2 days) - ₹99</label>
        </div>
        <div class="delivery-option">
          <input type="radio" id="same-day" name="delivery" value="same-day">
          <label for="same-day">Same Day Delivery - ₹199</label>
        </div>
      </div>
    `;
  }

  updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
      this.removeFromCart(itemId);
      return;
    }

    const item = this.cart.find(item => item.id === itemId);
    if (item) {
      item.quantity = newQuantity;
      this.app.saveCart();
      this.app.updateCartCount();
      this.renderCart();
      this.app.showNotification('Quantity updated', 'success');
    }
  }

  removeFromCart(itemId) {
    const itemIndex = this.cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      const item = this.cart[itemIndex];
      this.cart.splice(itemIndex, 1);
      this.app.saveCart();
      this.app.updateCartCount();
      this.renderCart();
      this.app.showNotification(`${item.title} removed from cart`, 'info');
    }
  }

  moveToWishlist(itemId) {
    const item = this.cart.find(item => item.id === itemId);
    if (item) {
      // Add to wishlist
      const existingWishlistItem = this.app.wishlist.find(w => w.id === itemId);
      if (!existingWishlistItem) {
        this.app.wishlist.push({
          ...item,
          addedAt: new Date().toISOString()
        });
        this.app.saveWishlist();
        this.app.updateWishlistCount();
      }
      
      // Remove from cart
      this.removeFromCart(itemId);
      this.app.showNotification(`${item.title} moved to wishlist`, 'success');
    }
  }

  applyCoupon() {
    const couponCode = document.getElementById('couponCode').value.toUpperCase();
    this.applyCouponCode(couponCode);
  }

  applyCouponCode(code) {
    const coupon = this.discountCoupons.find(c => c.code === code);
    const subtotal = this.getSubtotal();

    if (!coupon) {
      this.app.showNotification('Invalid coupon code', 'error');
      return;
    }

    if (subtotal < coupon.minAmount) {
      this.app.showNotification(`Minimum order amount ₹${coupon.minAmount} required`, 'warning');
      return;
    }

    this.appliedCoupon = coupon;
    document.getElementById('couponCode').value = code;
    this.renderCart();
    this.app.showNotification(`Coupon ${code} applied successfully!`, 'success');
  }

  removeCoupon() {
    this.appliedCoupon = null;
    document.getElementById('couponCode').value = '';
    this.renderCart();
    this.app.showNotification('Coupon removed', 'info');
  }

  getSubtotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getDiscountAmount() {
    if (!this.appliedCoupon) return 0;
    const subtotal = this.getSubtotal();
    return Math.floor(subtotal * this.appliedCoupon.discount / 100);
  }

  getTaxAmount() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    return Math.floor((subtotal - discount) * this.taxRate);
  }

  getTotal() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    const tax = this.getTaxAmount();
    return subtotal - discount + tax + this.shippingCost;
  }

  getTotalItems() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  updateCartTotal() {
    const totalElement = document.getElementById('cartTotal');
    if (totalElement) {
      totalElement.textContent = this.app.formatPrice(this.getTotal());
    }
  }

  proceedToCheckout() {
    if (this.cart.length === 0) {
      this.app.showNotification('Your cart is empty', 'warning');
      return;
    }

    // Create checkout data
    const checkoutData = {
      items: this.cart,
      subtotal: this.getSubtotal(),
      discount: this.getDiscountAmount(),
      tax: this.getTaxAmount(),
      shipping: this.shippingCost,
      total: this.getTotal(),
      coupon: this.appliedCoupon
    };

    // Store checkout data
    localStorage.setItem('hypermart_checkout', JSON.stringify(checkoutData));
    
    // Redirect to checkout page (simulate)
    this.app.showNotification('Redirecting to checkout...', 'success');
    
    // In a real app, this would redirect to checkout page
    setTimeout(() => {
      this.showCheckoutModal(checkoutData);
    }, 1000);
  }

  showCheckoutModal(checkoutData) {
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Checkout</h3>
          <button onclick="this.closest('.checkout-modal').remove()" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="checkout-summary">
            <h4>Order Summary</h4>
            <p>Total Items: ${this.getTotalItems()}</p>
            <p>Total Amount: ₹${this.app.formatPrice(checkoutData.total)}</p>
          </div>
          <div class="payment-options">
            <h4>Payment Method</h4>
            <div class="payment-option">
              <input type="radio" id="upi" name="payment" value="upi" checked>
              <label for="upi">UPI Payment</label>
            </div>
            <div class="payment-option">
              <input type="radio" id="card" name="payment" value="card">
              <label for="card">Credit/Debit Card</label>
            </div>
            <div class="payment-option">
              <input type="radio" id="wallet" name="payment" value="wallet">
              <label for="wallet">Digital Wallet</label>
            </div>
            <div class="payment-option">
              <input type="radio" id="cod" name="payment" value="cod">
              <label for="cod">Cash on Delivery</label>
            </div>
          </div>
          <button onclick="cartManager.completeOrder()" class="place-order-btn">
            Place Order
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  completeOrder() {
    // Simulate order placement
    const orderId = 'HM' + Date.now();
    
    // Clear cart
    this.cart.length = 0;
    this.app.saveCart();
    this.app.updateCartCount();
    
    // Close modals
    document.querySelectorAll('.checkout-modal, .cart-sidebar').forEach(modal => {
      modal.remove();
    });
    
    // Show success message
    this.app.showNotification(`Order ${orderId} placed successfully!`, 'success');
    
    // Track order event
    this.app.trackEvent('order_placed', { order_id: orderId });
  }

  renderWishlist() {
    const wishlistContent = document.getElementById('wishlistContent');
    if (!wishlistContent) return;

    if (this.app.wishlist.length === 0) {
      wishlistContent.innerHTML = `
        <div class="empty-wishlist">
          <i class="fas fa-heart"></i>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love for later</p>
          <button onclick="toggleWishlist()" class="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      `;
      return;
    }

    wishlistContent.innerHTML = `
      <div class="wishlist-items">
        ${this.app.wishlist.map(item => this.createWishlistItem(item)).join('')}
      </div>
    `;
  }

  createWishlistItem(item) {
    return `
      <div class="wishlist-item" data-item-id="${item.id}">
        <div class="item-image">
          <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="item-details">
          <h4>${item.title}</h4>
          <p class="item-platform">${item.platform}</p>
          <div class="item-price">₹${this.app.formatPrice(item.price)}</div>
          ${item.originalPrice ? 
            `<div class="original-price">₹${this.app.formatPrice(item.originalPrice)}</div>` : ''}
        </div>
        <div class="item-actions">
          <button onclick="cartManager.moveToCartFromWishlist('${item.id}')" 
                  class="action-btn primary">
            <i class="fas fa-shopping-cart"></i>
            Add to Cart
          </button>
          <button onclick="cartManager.removeFromWishlist('${item.id}')" 
                  class="action-btn remove">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  moveToCartFromWishlist(itemId) {
    const item = this.app.wishlist.find(item => item.id === itemId);
    if (item && item.inStock) {
      this.app.addToCart(itemId);
      this.removeFromWishlist(itemId);
    } else if (!item.inStock) {
      this.app.showNotification('Item is out of stock', 'warning');
    }
  }

  removeFromWishlist(itemId) {
    const itemIndex = this.app.wishlist.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      const item = this.app.wishlist[itemIndex];
      this.app.wishlist.splice(itemIndex, 1);
      this.app.saveWishlist();
      this.app.updateWishlistCount();
      this.renderWishlist();
      this.app.showNotification(`${item.title} removed from wishlist`, 'info');
    }
  }
}

// Global functions for cart
function proceedToCheckout() {
  if (window.cartManager) {
    cartManager.proceedToCheckout();
  }
}

// Initialize cart manager when app is ready
let cartManager;
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.app) {
      cartManager = new CartManager(app);
      
      // Override app methods to use cart manager
      app.renderCart = () => cartManager.renderCart();
      app.renderWishlist = () => cartManager.renderWishlist();
    }
  }, 100);
});