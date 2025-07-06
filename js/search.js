// Advanced Search Functionality
class SearchEngine {
  constructor(app) {
    this.app = app;
    this.searchHistory = JSON.parse(localStorage.getItem('hypermart_search_history') || '[]');
    this.voiceRecognition = null;
    this.initializeVoiceSearch();
  }

  initializeVoiceSearch() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.voiceRecognition = new SpeechRecognition();
      this.voiceRecognition.continuous = false;
      this.voiceRecognition.interimResults = false;
      this.voiceRecognition.lang = 'en-US';

      this.voiceRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('searchInput').value = transcript;
        this.app.performSearch();
        this.app.showNotification(`Voice search: "${transcript}"`, 'success');
      };

      this.voiceRecognition.onerror = (event) => {
        this.app.showNotification('Voice search failed. Please try again.', 'error');
      };
    }
  }

  startVoiceSearch() {
    if (!this.voiceRecognition) {
      this.app.showNotification('Voice search not supported in this browser', 'warning');
      return;
    }

    const voiceBtn = document.querySelector('.voice-search-btn');
    voiceBtn.classList.add('listening');
    voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';

    this.voiceRecognition.start();
    this.app.showNotification('Listening... Speak now', 'info');

    this.voiceRecognition.onend = () => {
      voiceBtn.classList.remove('listening');
      voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    };
  }

  openVisualSearch() {
    // Create visual search modal
    const modal = document.createElement('div');
    modal.className = 'visual-search-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Visual Search</h3>
          <button onclick="this.closest('.visual-search-modal').remove()" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="upload-area" id="uploadArea">
            <i class="fas fa-camera"></i>
            <p>Upload an image or take a photo</p>
            <input type="file" id="imageUpload" accept="image/*" style="display: none;">
            <button onclick="document.getElementById('imageUpload').click()" class="upload-btn">
              Choose Image
            </button>
            <button onclick="this.openCamera()" class="camera-btn">
              Take Photo
            </button>
          </div>
          <div class="search-results" id="visualSearchResults"></div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle file upload
    document.getElementById('imageUpload').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.processVisualSearch(file);
      }
    });
  }

  processVisualSearch(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      
      // Simulate visual search API call
      setTimeout(() => {
        const similarProducts = this.app.currentProducts
          .sort(() => Math.random() - 0.5)
          .slice(0, 6);

        this.displayVisualSearchResults(similarProducts, imageData);
      }, 2000);

      // Show loading
      document.getElementById('visualSearchResults').innerHTML = `
        <div class="loading-visual">
          <div class="spinner"></div>
          <p>Analyzing image and finding similar products...</p>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  }

  displayVisualSearchResults(products, originalImage) {
    const resultsContainer = document.getElementById('visualSearchResults');
    resultsContainer.innerHTML = `
      <div class="visual-search-header">
        <div class="original-image">
          <img src="${originalImage}" alt="Searched image">
          <p>Your search image</p>
        </div>
        <div class="results-info">
          <h4>Similar Products Found</h4>
          <p>${products.length} matching products across platforms</p>
        </div>
      </div>
      <div class="visual-results-grid">
        ${products.map(product => `
          <div class="visual-result-item" onclick="app.selectSuggestion('${product.id}')">
            <img src="${product.image}" alt="${product.title}">
            <div class="result-info">
              <h5>${product.title}</h5>
              <p>₹${this.app.formatPrice(product.price)}</p>
              <span class="platform-tag">${product.platform}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  addToSearchHistory(query) {
    if (!query || this.searchHistory.includes(query)) return;
    
    this.searchHistory.unshift(query);
    this.searchHistory = this.searchHistory.slice(0, 10); // Keep only last 10 searches
    localStorage.setItem('hypermart_search_history', JSON.stringify(this.searchHistory));
  }

  getSearchSuggestions(query) {
    const suggestions = [];
    
    // Add search history matches
    const historyMatches = this.searchHistory.filter(item => 
      item.toLowerCase().includes(query.toLowerCase())
    );
    suggestions.push(...historyMatches);

    // Add trending searches
    const trendingSearches = [
      'iPhone 15', 'Samsung Galaxy', 'Nike shoes', 'Laptop deals',
      'Skincare routine', 'Home decor', 'Fitness equipment', 'Books'
    ];
    const trendingMatches = trendingSearches.filter(item =>
      item.toLowerCase().includes(query.toLowerCase())
    );
    suggestions.push(...trendingMatches);

    // Add product matches
    const productMatches = this.app.currentProducts
      .filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
      .map(p => p.title)
      .slice(0, 5);
    suggestions.push(...productMatches);

    return [...new Set(suggestions)].slice(0, 8);
  }

  performAdvancedSearch(filters) {
    let results = [...this.app.currentProducts];

    // Apply text search
    if (filters.query) {
      results = results.filter(product =>
        product.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        product.category.toLowerCase().includes(filters.query.toLowerCase()) ||
        product.features.some(feature => 
          feature.toLowerCase().includes(filters.query.toLowerCase())
        )
      );
    }

    // Apply platform filter
    if (filters.platform && filters.platform !== 'all') {
      results = results.filter(product => 
        product.platform.toLowerCase() === filters.platform.toLowerCase()
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      results = results.filter(product => 
        product.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Apply price range filter
    if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
      results = results.filter(product => 
        product.price >= filters.priceMin && product.price <= filters.priceMax
      );
    }

    // Apply rating filter
    if (filters.rating && filters.rating !== 'all') {
      const minRating = parseFloat(filters.rating.replace('+', ''));
      results = results.filter(product => parseFloat(product.rating) >= minRating);
    }

    // Apply delivery filter
    if (filters.delivery && filters.delivery !== 'all') {
      switch (filters.delivery) {
        case 'same-day':
          results = results.filter(product => product.deliveryTime === 'Same Day');
          break;
        case 'next-day':
          results = results.filter(product => product.deliveryTime === 'Next Day');
          break;
        case 'free':
          results = results.filter(product => product.freeDelivery);
          break;
      }
    }

    // Apply sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'price-low':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          results.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
          break;
        case 'discount':
          results.sort((a, b) => b.discount - a.discount);
          break;
        case 'newest':
          results.sort(() => Math.random() - 0.5);
          break;
      }
    }

    return results;
  }

  saveSearchPreferences(filters) {
    localStorage.setItem('hypermart_search_preferences', JSON.stringify(filters));
  }

  loadSearchPreferences() {
    return JSON.parse(localStorage.getItem('hypermart_search_preferences') || '{}');
  }
}

// Global functions for search
function startVoiceSearch() {
  if (app && app.searchEngine) {
    app.searchEngine.startVoiceSearch();
  }
}

function openVisualSearch() {
  if (app && app.searchEngine) {
    app.searchEngine.openVisualSearch();
  }
}

function toggleCategoryDropdown() {
  const dropdown = document.getElementById('categoryDropdown');
  dropdown.classList.toggle('active');
}

// Initialize search engine when app is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.app) {
      app.searchEngine = new SearchEngine(app);
    }
  }, 100);
});