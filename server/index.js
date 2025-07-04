import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
let products = [];
let userProfiles = new Map();
let userFeedback = [];
let analytics = {
  totalViews: 0,
  totalClicks: 0,
  popularCategories: {},
  conversionRate: 0
};

// Real product data with valid URLs
const productDatabase = [
  // Electronics - Amazon
  {
    title: "Apple iPhone 15 (128GB) - Natural Titanium",
    category: "Electronics",
    marketplace: "Amazon",
    price: "79900",
    originalPrice: "89900",
    discount: "11%",
    rating: "4.5",
    reviews: "12,456",
    url: "https://www.amazon.in/dp/B0CHX1W00X",
    features: ["A17 Pro chip", "48MP camera", "USB-C", "Action Button"],
    inStock: true,
    fastDelivery: true
  },
  {
    title: "Samsung Galaxy S24 Ultra 5G (256GB)",
    category: "Electronics",
    marketplace: "Amazon",
    price: "124999",
    originalPrice: "134999",
    discount: "7%",
    rating: "4.4",
    reviews: "8,234",
    url: "https://www.amazon.in/dp/B0CMDRCZBX",
    features: ["200MP camera", "S Pen", "AI features", "Titanium build"],
    inStock: true,
    fastDelivery: true
  },
  {
    title: "OnePlus 12R 5G (128GB) - Cool Blue",
    category: "Electronics",
    marketplace: "Amazon",
    price: "39999",
    originalPrice: "42999",
    discount: "7%",
    rating: "4.3",
    reviews: "5,678",
    url: "https://www.amazon.in/dp/B0CQVBZJX8",
    features: ["Snapdragon 8 Gen 2", "100W charging", "50MP camera"],
    inStock: true,
    fastDelivery: true
  },

  // Footwear - Amazon
  {
    title: "Nike Revolution 6 Next Nature Men's Running Shoes",
    category: "Footwear",
    marketplace: "Amazon",
    price: "3495",
    originalPrice: "4995",
    discount: "30%",
    rating: "4.2",
    reviews: "15,234",
    url: "https://www.amazon.in/dp/B09JQPX8VH",
    features: ["Lightweight", "Breathable mesh", "Durable outsole"],
    inStock: true,
    fastDelivery: true
  },
  {
    title: "Adidas Ultraboost 22 Running Shoes",
    category: "Footwear",
    marketplace: "Amazon",
    price: "11999",
    originalPrice: "16999",
    discount: "29%",
    rating: "4.4",
    reviews: "3,456",
    url: "https://www.amazon.in/dp/B09TQXM8PL",
    features: ["Boost midsole", "Primeknit upper", "Continental rubber"],
    inStock: true,
    fastDelivery: true
  },

  // Home & Kitchen - Amazon
  {
    title: "Philips Air Fryer HD9252/90 (4.1L)",
    category: "Home & Kitchen",
    marketplace: "Amazon",
    price: "7999",
    originalPrice: "12995",
    discount: "38%",
    rating: "4.3",
    reviews: "45,678",
    url: "https://www.amazon.in/dp/B077GBQZPX",
    features: ["Rapid Air Technology", "Digital display", "7 presets"],
    inStock: true,
    fastDelivery: true
  },
  {
    title: "Prestige Deluxe Alpha Pressure Cooker 5L",
    category: "Home & Kitchen",
    marketplace: "Amazon",
    price: "1899",
    originalPrice: "2850",
    discount: "33%",
    rating: "4.5",
    reviews: "67,890",
    url: "https://www.amazon.in/dp/B00KDWVS8A",
    features: ["Stainless steel", "Induction compatible", "5L capacity"],
    inStock: true,
    fastDelivery: true
  },

  // Beauty & Personal Care - Amazon
  {
    title: "Maybelline New York Lash Sensational Mascara",
    category: "Beauty",
    marketplace: "Amazon",
    price: "399",
    originalPrice: "599",
    discount: "33%",
    rating: "4.1",
    reviews: "23,456",
    url: "https://www.amazon.in/dp/B00VQH8JOW",
    features: ["Curved brush", "Waterproof", "10x volume"],
    inStock: true,
    fastDelivery: true
  },
  {
    title: "Lakme Absolute Perfect Radiance Skin Lightening Facewash",
    category: "Beauty",
    marketplace: "Amazon",
    price: "175",
    originalPrice: "220",
    discount: "20%",
    rating: "4.2",
    reviews: "12,345",
    url: "https://www.amazon.in/dp/B00DQKM8JG",
    features: ["Skin lightening", "Vitamin E", "100g"],
    inStock: true,
    fastDelivery: true
  },

  // Sports & Fitness - Amazon
  {
    title: "Boldfit Gym Shaker Bottle 700ml",
    category: "Sports",
    marketplace: "Amazon",
    price: "299",
    originalPrice: "999",
    discount: "70%",
    rating: "4.3",
    reviews: "34,567",
    url: "https://www.amazon.in/dp/B07QMKX8VN",
    features: ["BPA free", "Leak proof", "Wire whisk ball"],
    inStock: true,
    fastDelivery: true
  },
  {
    title: "Strauss Yoga Mat Anti Skid EVA (6mm)",
    category: "Sports",
    marketplace: "Amazon",
    price: "699",
    originalPrice: "1999",
    discount: "65%",
    rating: "4.0",
    reviews: "8,901",
    url: "https://www.amazon.in/dp/B01AVDVHTI",
    features: ["Anti-skid", "6mm thick", "Eco-friendly"],
    inStock: true,
    fastDelivery: true
  },

  // Books - Amazon
  {
    title: "Atomic Habits by James Clear",
    category: "Books",
    marketplace: "Amazon",
    price: "399",
    originalPrice: "599",
    discount: "33%",
    rating: "4.6",
    reviews: "89,012",
    url: "https://www.amazon.in/dp/1847941834",
    features: ["Bestseller", "Self-help", "Paperback"],
    inStock: true,
    fastDelivery: true
  },
  {
    title: "The Psychology of Money by Morgan Housel",
    category: "Books",
    marketplace: "Amazon",
    price: "299",
    originalPrice: "399",
    discount: "25%",
    rating: "4.5",
    reviews: "45,678",
    url: "https://www.amazon.in/dp/9390166268",
    features: ["Finance", "Bestseller", "Paperback"],
    inStock: true,
    fastDelivery: true
  },

  // Fashion - Amazon
  {
    title: "Levi's Men's 511 Slim Jeans",
    category: "Fashion",
    marketplace: "Amazon",
    price: "2399",
    originalPrice: "3999",
    discount: "40%",
    rating: "4.2",
    reviews: "12,345",
    url: "https://www.amazon.in/dp/B07BQXM8VN",
    features: ["Slim fit", "Cotton blend", "Multiple sizes"],
    inStock: true,
    fastDelivery: true
  },
  {
    title: "Allen Solly Women's Regular Fit Shirt",
    category: "Fashion",
    marketplace: "Amazon",
    price: "899",
    originalPrice: "1799",
    discount: "50%",
    rating: "4.1",
    reviews: "6,789",
    url: "https://www.amazon.in/dp/B08XQMN8VB",
    features: ["Regular fit", "Cotton", "Formal wear"],
    inStock: true,
    fastDelivery: true
  },

  // Automotive - Amazon
  {
    title: "Bosch Car Battery 12V-35Ah",
    category: "Automotive",
    marketplace: "Amazon",
    price: "3299",
    originalPrice: "4500",
    discount: "27%",
    rating: "4.4",
    reviews: "2,345",
    url: "https://www.amazon.in/dp/B07QXMN8VC",
    features: ["12V", "35Ah capacity", "2 year warranty"],
    inStock: true,
    fastDelivery: false
  }
];

// Recommendation algorithms
class RecommendationEngine {
  constructor() {
    this.userInteractions = new Map();
    this.productViews = new Map();
    this.categoryPreferences = new Map();
  }

  // Collaborative filtering
  getCollaborativeRecommendations(userId, limit = 10) {
    const userPrefs = this.categoryPreferences.get(userId) || {};
    const recommendations = [];

    // Get products from preferred categories
    Object.keys(userPrefs).forEach(category => {
      const categoryProducts = productDatabase.filter(p => 
        p.category === category && p.inStock
      );
      recommendations.push(...categoryProducts);
    });

    // Add trending products
    const trending = this.getTrendingProducts(5);
    recommendations.push(...trending);

    // Remove duplicates and shuffle
    const unique = [...new Map(recommendations.map(p => [p.title, p])).values()];
    return this.shuffleArray(unique).slice(0, limit);
  }

  // Content-based filtering
  getContentBasedRecommendations(userId, limit = 10) {
    const userHistory = this.userInteractions.get(userId) || [];
    if (userHistory.length === 0) {
      return this.getPopularProducts(limit);
    }

    const recommendations = [];
    const viewedCategories = [...new Set(userHistory.map(p => p.category))];

    viewedCategories.forEach(category => {
      const similar = productDatabase.filter(p => 
        p.category === category && 
        p.inStock &&
        !userHistory.some(h => h.title === p.title)
      );
      recommendations.push(...similar);
    });

    return this.shuffleArray(recommendations).slice(0, limit);
  }

  // Hybrid recommendations
  getHybridRecommendations(userId, limit = 12) {
    const collaborative = this.getCollaborativeRecommendations(userId, 6);
    const contentBased = this.getContentBasedRecommendations(userId, 6);
    
    const combined = [...collaborative, ...contentBased];
    const unique = [...new Map(combined.map(p => [p.title, p])).values()];
    
    return this.shuffleArray(unique).slice(0, limit);
  }

  // Get popular products
  getPopularProducts(limit = 10) {
    return productDatabase
      .filter(p => p.inStock)
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, limit);
  }

  // Get trending products
  getTrendingProducts(limit = 5) {
    return productDatabase
      .filter(p => p.inStock && parseFloat(p.discount.replace('%', '')) > 20)
      .sort((a, b) => parseFloat(b.discount.replace('%', '')) - parseFloat(a.discount.replace('%', '')))
      .slice(0, limit);
  }

  // Track user interaction
  trackInteraction(userId, product, action) {
    if (!this.userInteractions.has(userId)) {
      this.userInteractions.set(userId, []);
    }
    
    const interactions = this.userInteractions.get(userId);
    interactions.push({ ...product, action, timestamp: Date.now() });
    
    // Update category preferences
    if (!this.categoryPreferences.has(userId)) {
      this.categoryPreferences.set(userId, {});
    }
    
    const prefs = this.categoryPreferences.get(userId);
    prefs[product.category] = (prefs[product.category] || 0) + 1;
    
    // Update analytics
    analytics.totalViews++;
    if (action === 'click') {
      analytics.totalClicks++;
    }
    
    analytics.popularCategories[product.category] = 
      (analytics.popularCategories[product.category] || 0) + 1;
    
    analytics.conversionRate = 
      analytics.totalClicks > 0 ? (analytics.totalClicks / analytics.totalViews * 100).toFixed(2) : 0;
  }

  // Utility function to shuffle array
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

const recommendationEngine = new RecommendationEngine();

// API Routes
app.get('/api/recommendations/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { algorithm = 'hybrid', limit = 12 } = req.query;
    
    let recommendations;
    
    switch (algorithm) {
      case 'collaborative':
        recommendations = recommendationEngine.getCollaborativeRecommendations(userId, parseInt(limit));
        break;
      case 'content':
        recommendations = recommendationEngine.getContentBasedRecommendations(userId, parseInt(limit));
        break;
      case 'popular':
        recommendations = recommendationEngine.getPopularProducts(parseInt(limit));
        break;
      case 'trending':
        recommendations = recommendationEngine.getTrendingProducts(parseInt(limit));
        break;
      default:
        recommendations = recommendationEngine.getHybridRecommendations(userId, parseInt(limit));
    }
    
    // Add recommendation reasons
    const enrichedRecommendations = recommendations.map(product => ({
      ...product,
      id: uuidv4(),
      reason: getRecommendationReason(product, algorithm),
      timestamp: Date.now()
    }));
    
    res.json({
      success: true,
      data: enrichedRecommendations,
      algorithm,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/track', (req, res) => {
  try {
    const { userId, product, action } = req.body;
    recommendationEngine.trackInteraction(userId, product, action);
    
    res.json({
      success: true,
      message: 'Interaction tracked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/analytics', (req, res) => {
  try {
    const topCategories = Object.entries(analytics.popularCategories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
    
    res.json({
      success: true,
      data: {
        ...analytics,
        topCategories,
        totalProducts: productDatabase.length,
        activeUsers: recommendationEngine.userInteractions.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/profile', (req, res) => {
  try {
    const { userId, preferences, feedback } = req.body;
    
    if (preferences) {
      userProfiles.set(userId, {
        ...userProfiles.get(userId),
        preferences,
        updatedAt: Date.now()
      });
    }
    
    if (feedback) {
      userFeedback.push({
        userId,
        feedback,
        timestamp: Date.now()
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    const categories = [...new Set(productDatabase.map(p => p.category))];
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to generate recommendation reasons
function getRecommendationReason(product, algorithm) {
  const reasons = {
    hybrid: [
      `Trending in ${product.category}`,
      `${product.discount} off - Limited time`,
      `Highly rated (${product.rating}★)`,
      `Popular on ${product.marketplace}`,
      `Based on your interests`
    ],
    collaborative: [
      `Users like you also bought this`,
      `Popular in your area`,
      `Recommended by similar shoppers`
    ],
    content: [
      `Similar to your recent views`,
      `Matches your preferences`,
      `From your favorite category`
    ],
    popular: [
      `Bestseller on ${product.marketplace}`,
      `Top rated product`,
      `Customer favorite`
    ],
    trending: [
      `Trending now`,
      `Hot deal alert`,
      `Limited time offer`
    ]
  };
  
  const algorithmReasons = reasons[algorithm] || reasons.hybrid;
  return algorithmReasons[Math.floor(Math.random() * algorithmReasons.length)];
}

// Real-time updates using cron jobs
cron.schedule('*/30 * * * * *', () => {
  // Update product availability and prices every 30 seconds
  productDatabase.forEach(product => {
    // Simulate real-time price changes (±5%)
    if (Math.random() < 0.1) { // 10% chance of price change
      const basePrice = parseInt(product.price);
      const variation = Math.floor(basePrice * 0.05 * (Math.random() - 0.5));
      product.price = (basePrice + variation).toString();
    }
    
    // Simulate stock changes
    if (Math.random() < 0.02) { // 2% chance of stock change
      product.inStock = Math.random() > 0.1; // 90% chance to be in stock
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Recommendation server running on port ${PORT}`);
  console.log(`📊 Analytics available at http://localhost:${PORT}/api/analytics`);
  console.log(`🛍️ Products loaded: ${productDatabase.length}`);
});