// Advanced Filtering System
class FilterManager {
  constructor(app) {
    this.app = app;
    this.originalProducts = [...app.currentProducts];
    this.activeFilters = {
      platform: 'all',
      category: 'all',
      priceMin: 0,
      priceMax: 100000,
      delivery: 'all',
      rating: 'all',
      sort: 'relevance'
    };
    this.savedFilters = JSON.parse(localStorage.getItem('hypermart_saved_filters') || '[]');
    this.initializeFilters();
  }

  initializeFilters() {
    this.setupPriceRange();
    this.loadSavedFilters();
  }

  setupPriceRange() {
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    
    if (priceMin && priceMax) {
      priceMin.addEventListener('input', () => this.updatePriceRange());
      priceMax.addEventListener('input', () => this.updatePriceRange());
    }
  }

  updatePriceRange() {
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const priceMinDisplay = document.getElementById('priceMinDisplay');
    const priceMaxDisplay = document.getElementById('priceMaxDisplay');

    if (priceMin && priceMax && priceMinDisplay && priceMaxDisplay) {
      let minVal = parseInt(priceMin.value);
      let maxVal = parseInt(priceMax.value);

      // Ensure min is not greater than max
      if (minVal > maxVal) {
        minVal = maxVal;
        priceMin.value = minVal;
      }

      this.activeFilters.priceMin = minVal;
      this.activeFilters.priceMax = maxVal;

      priceMinDisplay.textContent = `₹${this.app.formatPrice(minVal)}`;
      priceMaxDisplay.textContent = `₹${this.app.formatPrice(maxVal)}`;

      // Apply filters with debounce
      clearTimeout(this.priceRangeTimeout);
      this.priceRangeTimeout = setTimeout(() => {
        this.applyFilters();
      }, 500);
    }
  }

  applyFilters() {
    // Get current filter values
    this.activeFilters.platform = document.getElementById('platformFilter')?.value || 'all';
    this.activeFilters.category = document.getElementById('categoryFilter')?.value || 'all';
    this.activeFilters.delivery = document.getElementById('deliveryFilter')?.value || 'all';
    this.activeFilters.rating = document.getElementById('ratingFilter')?.value || 'all';
    this.activeFilters.sort = document.getElementById('sortFilter')?.value || 'relevance';

    // Apply filters
    let filteredProducts = this.filterProducts(this.originalProducts, this.activeFilters);
    
    // Update products display
    this.app.currentProducts = filteredProducts;
    this.app.renderProducts();

    // Show filter results
    this.showFilterResults(filteredProducts.length);
    
    // Track filter usage
    this.app.trackEvent('filters_applied', this.activeFilters);
  }

  filterProducts(products, filters) {
    let filtered = [...products];

    // Platform filter
    if (filters.platform !== 'all') {
      filtered = filtered.filter(product => 
        product.platform.toLowerCase() === filters.platform.toLowerCase()
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceMin && product.price <= filters.priceMax
    );

    // Rating filter
    if (filters.rating !== 'all') {
      const minRating = parseFloat(filters.rating.replace('+', ''));
      filtered = filtered.filter(product => parseFloat(product.rating) >= minRating);
    }

    // Delivery filter
    if (filters.delivery !== 'all') {
      switch (filters.delivery) {
        case 'same-day':
          filtered = filtered.filter(product => product.deliveryTime === 'Same Day');
          break;
        case 'next-day':
          filtered = filtered.filter(product => product.deliveryTime === 'Next Day');
          break;
        case '2-day':
          filtered = filtered.filter(product => product.deliveryTime === '2 Days');
          break;
        case 'free':
          filtered = filtered.filter(product => product.freeDelivery);
          break;
      }
    }

    // Apply sorting
    filtered = this.sortProducts(filtered, filters.sort);

    return filtered;
  }

  sortProducts(products, sortBy) {
    const sorted = [...products];

    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      case 'discount':
        return sorted.sort((a, b) => b.discount - a.discount);
      case 'newest':
        return sorted.sort(() => Math.random() - 0.5);
      case 'relevance':
      default:
        return sorted;
    }
  }

  showFilterResults(count) {
    const totalProducts = this.originalProducts.length;
    const message = count === totalProducts 
      ? `Showing all ${count} products`
      : `Showing ${count} of ${totalProducts} products`;
    
    // Create or update filter results display
    let resultsDisplay = document.querySelector('.filter-results');
    if (!resultsDisplay) {
      resultsDisplay = document.createElement('div');
      resultsDisplay.className = 'filter-results';
      const filtersContainer = document.querySelector('.advanced-filters');
      if (filtersContainer) {
        filtersContainer.appendChild(resultsDisplay);
      }
    }

    resultsDisplay.innerHTML = `
      <div class="results-info">
        <span class="results-count">${message}</span>
        ${this.getActiveFiltersDisplay()}
      </div>
    `;
  }

  getActiveFiltersDisplay() {
    const activeFilters = [];
    
    if (this.activeFilters.platform !== 'all') {
      activeFilters.push(`Platform: ${this.activeFilters.platform}`);
    }
    if (this.activeFilters.category !== 'all') {
      activeFilters.push(`Category: ${this.activeFilters.category}`);
    }
    if (this.activeFilters.priceMin > 0 || this.activeFilters.priceMax < 100000) {
      activeFilters.push(`Price: ₹${this.app.formatPrice(this.activeFilters.priceMin)} - ₹${this.app.formatPrice(this.activeFilters.priceMax)}`);
    }
    if (this.activeFilters.rating !== 'all') {
      activeFilters.push(`Rating: ${this.activeFilters.rating} & above`);
    }
    if (this.activeFilters.delivery !== 'all') {
      activeFilters.push(`Delivery: ${this.activeFilters.delivery}`);
    }

    if (activeFilters.length === 0) return '';

    return `
      <div class="active-filters">
        <span class="filters-label">Active filters:</span>
        ${activeFilters.map(filter => `
          <span class="filter-tag">
            ${filter}
            <button onclick="filterManager.removeFilter('${filter}')" class="remove-filter">
              <i class="fas fa-times"></i>
            </button>
          </span>
        `).join('')}
      </div>
    `;
  }

  removeFilter(filterText) {
    // Parse filter text and remove corresponding filter
    if (filterText.includes('Platform:')) {
      document.getElementById('platformFilter').value = 'all';
    } else if (filterText.includes('Category:')) {
      document.getElementById('categoryFilter').value = 'all';
    } else if (filterText.includes('Price:')) {
      document.getElementById('priceMin').value = 0;
      document.getElementById('priceMax').value = 100000;
      this.updatePriceRange();
    } else if (filterText.includes('Rating:')) {
      document.getElementById('ratingFilter').value = 'all';
    } else if (filterText.includes('Delivery:')) {
      document.getElementById('deliveryFilter').value = 'all';
    }

    this.applyFilters();
  }

  clearFilters() {
    // Reset all filter controls
    document.getElementById('platformFilter').value = 'all';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('priceMin').value = 0;
    document.getElementById('priceMax').value = 100000;
    document.getElementById('deliveryFilter').value = 'all';
    document.getElementById('ratingFilter').value = 'all';
    document.getElementById('sortFilter').value = 'relevance';

    // Update price range display
    this.updatePriceRange();

    // Reset active filters
    this.activeFilters = {
      platform: 'all',
      category: 'all',
      priceMin: 0,
      priceMax: 100000,
      delivery: 'all',
      rating: 'all',
      sort: 'relevance'
    };

    // Apply filters (which will show all products)
    this.applyFilters();

    this.app.showNotification('All filters cleared', 'info');
  }

  saveFilters() {
    const filterName = prompt('Enter a name for this filter set:');
    if (!filterName) return;

    const filterSet = {
      name: filterName,
      filters: { ...this.activeFilters },
      createdAt: new Date().toISOString()
    };

    this.savedFilters.push(filterSet);
    localStorage.setItem('hypermart_saved_filters', JSON.stringify(this.savedFilters));
    
    this.app.showNotification(`Filter set "${filterName}" saved`, 'success');
    this.updateSavedFiltersDisplay();
  }

  loadSavedFilters() {
    if (this.savedFilters.length === 0) return;

    // Create saved filters dropdown
    const filtersContainer = document.querySelector('.filter-actions');
    if (!filtersContainer) return;

    const savedFiltersDropdown = document.createElement('div');
    savedFiltersDropdown.className = 'saved-filters-dropdown';
    savedFiltersDropdown.innerHTML = `
      <button class="filter-btn" onclick="filterManager.toggleSavedFilters()">
        <i class="fas fa-bookmark"></i>
        Saved Filters
        <i class="fas fa-chevron-down"></i>
      </button>
      <div class="saved-filters-menu" id="savedFiltersMenu">
        ${this.savedFilters.map((filterSet, index) => `
          <div class="saved-filter-item">
            <span onclick="filterManager.applySavedFilter(${index})">${filterSet.name}</span>
            <button onclick="filterManager.deleteSavedFilter(${index})" class="delete-filter">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `).join('')}
      </div>
    `;

    filtersContainer.appendChild(savedFiltersDropdown);
  }

  toggleSavedFilters() {
    const menu = document.getElementById('savedFiltersMenu');
    if (menu) {
      menu.classList.toggle('active');
    }
  }

  applySavedFilter(index) {
    const filterSet = this.savedFilters[index];
    if (!filterSet) return;

    // Apply saved filters to controls
    document.getElementById('platformFilter').value = filterSet.filters.platform;
    document.getElementById('categoryFilter').value = filterSet.filters.category;
    document.getElementById('priceMin').value = filterSet.filters.priceMin;
    document.getElementById('priceMax').value = filterSet.filters.priceMax;
    document.getElementById('deliveryFilter').value = filterSet.filters.delivery;
    document.getElementById('ratingFilter').value = filterSet.filters.rating;
    document.getElementById('sortFilter').value = filterSet.filters.sort;

    // Update price range display
    this.updatePriceRange();

    // Apply filters
    this.applyFilters();

    this.app.showNotification(`Applied filter set "${filterSet.name}"`, 'success');
    this.toggleSavedFilters();
  }

  deleteSavedFilter(index) {
    const filterSet = this.savedFilters[index];
    if (!filterSet) return;

    if (confirm(`Delete filter set "${filterSet.name}"?`)) {
      this.savedFilters.splice(index, 1);
      localStorage.setItem('hypermart_saved_filters', JSON.stringify(this.savedFilters));
      this.updateSavedFiltersDisplay();
      this.app.showNotification(`Filter set "${filterSet.name}" deleted`, 'info');
    }
  }

  updateSavedFiltersDisplay() {
    const menu = document.getElementById('savedFiltersMenu');
    if (menu) {
      menu.innerHTML = this.savedFilters.map((filterSet, index) => `
        <div class="saved-filter-item">
          <span onclick="filterManager.applySavedFilter(${index})">${filterSet.name}</span>
          <button onclick="filterManager.deleteSavedFilter(${index})" class="delete-filter">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `).join('');
    }
  }

  getFilterAnalytics() {
    return {
      totalFilters: Object.keys(this.activeFilters).length,
      activeFilters: Object.entries(this.activeFilters)
        .filter(([key, value]) => value !== 'all' && !(key.includes('price') && (value === 0 || value === 100000)))
        .length,
      savedFilters: this.savedFilters.length,
      mostUsedPlatform: this.getMostUsedFilter('platform'),
      mostUsedCategory: this.getMostUsedFilter('category')
    };
  }

  getMostUsedFilter(filterType) {
    // This would track filter usage in a real app
    return 'Amazon'; // Placeholder
  }
}

// Global functions for filters
function applyFilters() {
  if (window.filterManager) {
    filterManager.applyFilters();
  }
}

function clearFilters() {
  if (window.filterManager) {
    filterManager.clearFilters();
  }
}

function saveFilters() {
  if (window.filterManager) {
    filterManager.saveFilters();
  }
}

function updatePriceRange() {
  if (window.filterManager) {
    filterManager.updatePriceRange();
  }
}

// Initialize filter manager when app is ready
let filterManager;
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.app) {
      filterManager = new FilterManager(app);
    }
  }, 100);
});