// Advanced Analytics and Tracking
class AnalyticsManager {
  constructor(app) {
    this.app = app;
    this.sessionId = this.generateSessionId();
    this.events = [];
    this.userBehavior = {
      pageViews: 0,
      productViews: 0,
      searchQueries: 0,
      cartActions: 0,
      wishlistActions: 0,
      filterUsage: 0
    };
    this.platformMetrics = {
      amazon: { views: 0, clicks: 0, orders: 0 },
      flipkart: { views: 0, clicks: 0, orders: 0 },
      myntra: { views: 0, clicks: 0, orders: 0 },
      ajio: { views: 0, clicks: 0, orders: 0 },
      nykaa: { views: 0, clicks: 0, orders: 0 }
    };
    this.realTimeData = {
      activeUsers: 0,
      currentViews: 0,
      ordersToday: 0,
      revenue: 0
    };
    this.init();
  }

  init() {
    this.trackPageView();
    this.setupEventListeners();
    this.startRealTimeTracking();
    this.loadStoredAnalytics();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  trackEvent(eventType, data = {}) {
    const event = {
      id: this.generateEventId(),
      type: eventType,
      data: data,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.app.userId,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.events.push(event);
    this.updateUserBehavior(eventType, data);
    this.updatePlatformMetrics(eventType, data);
    this.sendEventToServer(event);
    this.updateRealTimeAnalytics();

    // Store events locally
    this.storeAnalytics();
  }

  generateEventId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  trackPageView() {
    this.trackEvent('page_view', {
      page: window.location.pathname,
      referrer: document.referrer
    });
    this.userBehavior.pageViews++;
  }

  trackProductView(product) {
    this.trackEvent('product_view', {
      productId: product.id,
      productTitle: product.title,
      platform: product.platform,
      category: product.category,
      price: product.price
    });
    this.userBehavior.productViews++;
  }

  trackSearch(query, results) {
    this.trackEvent('search', {
      query: query,
      resultsCount: results,
      timestamp: new Date().toISOString()
    });
    this.userBehavior.searchQueries++;
  }

  trackCartAction(action, product) {
    this.trackEvent('cart_action', {
      action: action,
      productId: product.id,
      productTitle: product.title,
      platform: product.platform,
      price: product.price
    });
    this.userBehavior.cartActions++;
  }

  trackWishlistAction(action, product) {
    this.trackEvent('wishlist_action', {
      action: action,
      productId: product.id,
      productTitle: product.title,
      platform: product.platform,
      price: product.price
    });
    this.userBehavior.wishlistActions++;
  }

  trackFilterUsage(filters) {
    this.trackEvent('filter_usage', {
      filters: filters,
      activeFiltersCount: Object.values(filters).filter(v => v !== 'all').length
    });
    this.userBehavior.filterUsage++;
  }

  trackOrder(orderData) {
    this.trackEvent('order_placed', {
      orderId: orderData.orderId,
      totalAmount: orderData.total,
      itemsCount: orderData.items.length,
      platforms: [...new Set(orderData.items.map(item => item.platform))],
      paymentMethod: orderData.paymentMethod
    });
  }

  updateUserBehavior(eventType, data) {
    switch (eventType) {
      case 'product_view':
        this.userBehavior.productViews++;
        break;
      case 'search':
        this.userBehavior.searchQueries++;
        break;
      case 'cart_action':
        this.userBehavior.cartActions++;
        break;
      case 'wishlist_action':
        this.userBehavior.wishlistActions++;
        break;
      case 'filter_usage':
        this.userBehavior.filterUsage++;
        break;
    }
  }

  updatePlatformMetrics(eventType, data) {
    if (!data.platform) return;

    const platform = data.platform.toLowerCase();
    if (!this.platformMetrics[platform]) return;

    switch (eventType) {
      case 'product_view':
        this.platformMetrics[platform].views++;
        break;
      case 'product_click':
        this.platformMetrics[platform].clicks++;
        break;
      case 'order_placed':
        this.platformMetrics[platform].orders++;
        break;
    }
  }

  async sendEventToServer(event) {
    try {
      // In a real app, this would send to your analytics server
      // await fetch('/api/analytics/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
      console.log('Event tracked:', event);
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  setupEventListeners() {
    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        if (maxScrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          this.trackEvent('scroll_depth', { depth: maxScrollDepth });
        }
      }
    });

    // Track time on page
    this.pageStartTime = Date.now();
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - this.pageStartTime;
      this.trackEvent('time_on_page', { duration: timeOnPage });
    });

    // Track clicks on external links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="http"]');
      if (link && link.hostname !== window.location.hostname) {
        this.trackEvent('external_link_click', {
          url: link.href,
          text: link.textContent.trim()
        });
      }
    });
  }

  startRealTimeTracking() {
    // Simulate real-time data updates
    setInterval(() => {
      this.updateRealTimeData();
    }, 30000); // Update every 30 seconds

    // Update analytics display
    setInterval(() => {
      this.updateAnalyticsDisplay();
    }, 60000); // Update display every minute
  }

  updateRealTimeData() {
    // Simulate real-time metrics
    this.realTimeData.activeUsers = Math.floor(Math.random() * 1000) + 500;
    this.realTimeData.currentViews = Math.floor(Math.random() * 50) + 20;
    this.realTimeData.ordersToday += Math.floor(Math.random() * 5);
    this.realTimeData.revenue += Math.floor(Math.random() * 10000) + 1000;
  }

  updateRealTimeAnalytics() {
    this.realTimeData.currentViews++;
  }

  getAnalyticsSummary() {
    const totalEvents = this.events.length;
    const uniqueProducts = new Set(
      this.events
        .filter(e => e.type === 'product_view')
        .map(e => e.data.productId)
    ).size;

    const topPlatforms = Object.entries(this.platformMetrics)
      .sort(([,a], [,b]) => b.views - a.views)
      .slice(0, 3);

    const conversionRate = this.userBehavior.cartActions > 0 
      ? ((this.events.filter(e => e.type === 'order_placed').length / this.userBehavior.cartActions) * 100).toFixed(2)
      : 0;

    return {
      totalEvents,
      uniqueProducts,
      topPlatforms,
      conversionRate,
      userBehavior: this.userBehavior,
      realTimeData: this.realTimeData
    };
  }

  updateAnalyticsDisplay() {
    const analyticsGrid = document.getElementById('analyticsGrid');
    if (!analyticsGrid) return;

    const summary = this.getAnalyticsSummary();

    analyticsGrid.innerHTML = `
      <div class="analytics-card real-time">
        <div class="analytics-icon">👥</div>
        <div class="analytics-title">Active Users</div>
        <div class="analytics-value">${summary.realTimeData.activeUsers}</div>
        <div class="analytics-desc">Currently browsing</div>
        <div class="analytics-trend">
          <i class="fas fa-arrow-up"></i>
          <span>+12% from last hour</span>
        </div>
      </div>

      <div class="analytics-card">
        <div class="analytics-icon">📊</div>
        <div class="analytics-title">Page Views</div>
        <div class="analytics-value">${summary.realTimeData.currentViews}</div>
        <div class="analytics-desc">In the last hour</div>
        <div class="analytics-trend">
          <i class="fas fa-arrow-up"></i>
          <span>+8% from yesterday</span>
        </div>
      </div>

      <div class="analytics-card">
        <div class="analytics-icon">🛒</div>
        <div class="analytics-title">Orders Today</div>
        <div class="analytics-value">${summary.realTimeData.ordersToday}</div>
        <div class="analytics-desc">Across all platforms</div>
        <div class="analytics-trend">
          <i class="fas fa-arrow-up"></i>
          <span>+15% from yesterday</span>
        </div>
      </div>

      <div class="analytics-card">
        <div class="analytics-icon">💰</div>
        <div class="analytics-title">Revenue</div>
        <div class="analytics-value">₹${this.app.formatPrice(summary.realTimeData.revenue)}</div>
        <div class="analytics-desc">Today's total</div>
        <div class="analytics-trend">
          <i class="fas fa-arrow-up"></i>
          <span>+22% from yesterday</span>
        </div>
      </div>

      <div class="analytics-card">
        <div class="analytics-icon">🎯</div>
        <div class="analytics-title">Conversion Rate</div>
        <div class="analytics-value">${summary.conversionRate}%</div>
        <div class="analytics-desc">Cart to order conversion</div>
        <div class="analytics-trend">
          <i class="fas fa-arrow-up"></i>
          <span>+3% from last week</span>
        </div>
      </div>

      <div class="analytics-card">
        <div class="analytics-icon">🏆</div>
        <div class="analytics-title">Top Platform</div>
        <div class="analytics-value">${summary.topPlatforms[0]?.[0] || 'Amazon'}</div>
        <div class="analytics-desc">Most viewed products</div>
        <div class="analytics-trend">
          <i class="fas fa-crown"></i>
          <span>${summary.topPlatforms[0]?.[1]?.views || 0} views</span>
        </div>
      </div>

      <div class="analytics-card">
        <div class="analytics-icon">🔍</div>
        <div class="analytics-title">Search Queries</div>
        <div class="analytics-value">${summary.userBehavior.searchQueries}</div>
        <div class="analytics-desc">In this session</div>
        <div class="analytics-trend">
          <i class="fas fa-search"></i>
          <span>Avg 2.3 per user</span>
        </div>
      </div>

      <div class="analytics-card">
        <div class="analytics-icon">❤️</div>
        <div class="analytics-title">Wishlist Adds</div>
        <div class="analytics-value">${summary.userBehavior.wishlistActions}</div>
        <div class="analytics-desc">Products saved</div>
        <div class="analytics-trend">
          <i class="fas fa-heart"></i>
          <span>+5% engagement</span>
        </div>
      </div>

      <div class="analytics-card">
        <div class="analytics-icon">⚡</div>
        <div class="analytics-title">Platform Health</div>
        <div class="analytics-value">99.9%</div>
        <div class="analytics-desc">Uptime across all APIs</div>
        <div class="analytics-trend">
          <i class="fas fa-check-circle"></i>
          <span>All systems operational</span>
        </div>
      </div>
    `;
  }

  generateReport(type = 'daily') {
    const events = this.getEventsForPeriod(type);
    const report = {
      period: type,
      generatedAt: new Date().toISOString(),
      totalEvents: events.length,
      uniqueUsers: new Set(events.map(e => e.userId)).size,
      topEvents: this.getTopEvents(events),
      platformBreakdown: this.getPlatformBreakdown(events),
      userJourney: this.getUserJourney(events),
      recommendations: this.getRecommendations(events)
    };

    return report;
  }

  getEventsForPeriod(type) {
    const now = new Date();
    let startDate;

    switch (type) {
      case 'hourly':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return this.events.filter(event => 
      new Date(event.timestamp) >= startDate
    );
  }

  getTopEvents(events) {
    const eventCounts = {};
    events.forEach(event => {
      eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
    });

    return Object.entries(eventCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }

  getPlatformBreakdown(events) {
    const platformData = {};
    events.forEach(event => {
      if (event.data.platform) {
        const platform = event.data.platform;
        if (!platformData[platform]) {
          platformData[platform] = { views: 0, clicks: 0, orders: 0 };
        }
        
        switch (event.type) {
          case 'product_view':
            platformData[platform].views++;
            break;
          case 'product_click':
            platformData[platform].clicks++;
            break;
          case 'order_placed':
            platformData[platform].orders++;
            break;
        }
      }
    });

    return platformData;
  }

  getUserJourney(events) {
    const journeySteps = events
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(event => ({
        step: event.type,
        timestamp: event.timestamp,
        data: event.data
      }));

    return journeySteps;
  }

  getRecommendations(events) {
    const recommendations = [];

    // Analyze user behavior and provide recommendations
    const searchEvents = events.filter(e => e.type === 'search');
    const cartEvents = events.filter(e => e.type === 'cart_action');
    const orderEvents = events.filter(e => e.type === 'order_placed');

    if (searchEvents.length > cartEvents.length * 2) {
      recommendations.push({
        type: 'search_optimization',
        message: 'Users are searching frequently but not adding to cart. Consider improving search results relevance.',
        priority: 'high'
      });
    }

    if (cartEvents.length > orderEvents.length * 3) {
      recommendations.push({
        type: 'checkout_optimization',
        message: 'High cart abandonment rate. Consider simplifying the checkout process.',
        priority: 'high'
      });
    }

    return recommendations;
  }

  storeAnalytics() {
    const analyticsData = {
      events: this.events.slice(-1000), // Keep last 1000 events
      userBehavior: this.userBehavior,
      platformMetrics: this.platformMetrics,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem('hypermart_analytics', JSON.stringify(analyticsData));
  }

  loadStoredAnalytics() {
    const stored = localStorage.getItem('hypermart_analytics');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.events = data.events || [];
        this.userBehavior = { ...this.userBehavior, ...data.userBehavior };
        this.platformMetrics = { ...this.platformMetrics, ...data.platformMetrics };
      } catch (error) {
        console.error('Failed to load stored analytics:', error);
      }
    }
  }

  exportAnalytics(format = 'json') {
    const data = {
      summary: this.getAnalyticsSummary(),
      events: this.events,
      userBehavior: this.userBehavior,
      platformMetrics: this.platformMetrics,
      exportedAt: new Date().toISOString()
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hypermart-analytics-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    return data;
  }
}

// Initialize analytics manager when app is ready
let analyticsManager;
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.app) {
      analyticsManager = new AnalyticsManager(app);
      
      // Override app tracking methods
      app.trackEvent = (event, data) => analyticsManager.trackEvent(event, data);
      app.trackProductView = (product) => analyticsManager.trackProductView(product);
      app.trackSearch = (query, results) => analyticsManager.trackSearch(query, results);
    }
  }, 100);
});