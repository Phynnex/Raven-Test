// Authentication and User Setup
const authForm = document.getElementById('auth-form');
const authScreen = document.getElementById('auth-screen');
const userEmailSpan = document.getElementById('user-email');
const userAvatarImg = document.getElementById('user-avatar');


document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();

  // Get the email from the input field
  const email = document.getElementById('email').value.trim().toLowerCase();

  // Validate email
  if (!email) {
    alert('Please enter a valid email!');
    return;
  }

  // Generate MD5 hash of the email for Gravatar
  const hashedEmail = CryptoJS.MD5(email).toString(); // Using CryptoJS

  // Update the email display
  document.getElementById('displayEmail').textContent = email;

  // Update the Gravatar image
  const avatarImg = document.getElementById('avatar');
  avatarImg.src = `https://www.gravatar.com/avatar/${hashedEmail}`;
  avatarImg.style.display = 'block'; // Show the image
});


// Trading Platform Core Variables
let chart;
let candlestickSeries;
let currentInterval = '1m';
let currentPair = 'BTCUSDT';
let currentPrice = 50000; // Default price
let orders = { buy: [], sell: [] };

// Trading Pairs Filtering
function filterTradingPairs() {
  const searchInput = document.getElementById('search-input').value.toLowerCase();
  const dropdown = document.getElementById('trading-pairs-dropdown');
  const options = dropdown.options;

  // Predefined list of trading pairs with their full names
  const tradingPairs = {
    'BTCUSDT': 'Bitcoin',
    'ETHUSDT': 'Ethereum', 
    'BNBUSDT': 'Binance Coin',
    'DOGEUSDT': 'Dogecoin',

  };

  // Hide/show options based on search input
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const pairSymbol = option.value;
    const pairName = tradingPairs[pairSymbol] || pairSymbol;

    // Check if search matches symbol or full name
    const isVisible = 
      pairSymbol.toLowerCase().includes(searchInput) || 
      pairName.toLowerCase().includes(searchInput);

    option.style.display = isVisible ? 'block' : 'none';
  }
}

// Order Form Calculations
function updateCurrentPrice(newPrice) {
  currentPrice = newPrice;
  document.getElementById('price-input').value = `$${currentPrice.toFixed(2)}`;
}

function calculateTotal() {
  const amountInput = document.getElementById('amount-input');
  const totalValueInput = document.getElementById('total-value');
  
  // Validate and parse amount
  const amount = parseFloat(amountInput.value) || 0;
  
  // Calculate total value
  const totalValue = amount * currentPrice;
  
  // Update total value input
  totalValueInput.value = `$${totalValue.toFixed(2)}`;
}

function placeOrder(type) {
  const amountInput = document.getElementById('amount-input');
  const totalValueInput = document.getElementById('total-value');
  
  const amount = parseFloat(amountInput.value) || 0;
  const totalValue = parseFloat(totalValueInput.value.replace('$', '')) || 0;
  
  if (amount <= 0) {
    alert('Please enter a valid amount');
    return;
  }
  
  // Simulate order placement
  const orderConfirmation = {
    type: type,
    pair: currentPair,
    amount: amount,
    price: currentPrice,
    total: totalValue,
    timestamp: new Date().toISOString()
  };
  
  // Add order to orders object
  orders[type].push({
    type,
    amount,
    price: currentPrice,
    timestamp: orderConfirmation.timestamp
  });
  
  console.log('Order Placed:', orderConfirmation);
  
  alert(`${type.toUpperCase()} Order Placed\n` +
        `Pair: ${orderConfirmation.pair}\n` +
        `Amount: ${orderConfirmation.amount}\n` +
        `Total Value: $${orderConfirmation.total.toFixed(2)}`);
  
  // Reset form and update order book
  amountInput.value = '';
  totalValueInput.value = '';
  updateOrderBook();
}

// Chart and Data Fetching Utilities
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Script load error for ${src}`));
    document.head.appendChild(script);
  });
}

function changeInterval(interval) {
  currentInterval = interval;
  fetchCandlestickData();
}


// Call this function when the page loads
window.onload = function() {
  // Explicitly set default pair to BTC/USDT
  const defaultPair = 'BTCUSDT';
  
  // Set the dropdown to the default pair
  const dropdown = document.getElementById('trading-pairs-dropdown');
  if (dropdown) {
    dropdown.value = defaultPair;
  }
  
  // Fetch ticker data and candlestick data for BTC/USDT
  fetchTickerData(defaultPair);
  fetchCandlestickData();
  
  // Show the Order Book tab
  showTab('order-book');
  updateOrderBook(); // Populate the order book
  updateRecentOrders(); // Populate recent orders (if needed)
};


function updateTradingPair() {
  // Get the selected pair from the dropdown
  const selectedPair = document.getElementById('trading-pairs-dropdown').value;
  
  // Update global current pair
  currentPair = selectedPair;
  
  // Fetch and update all components
  fetchTickerData(selectedPair);
  fetchCandlestickData();
  
  // Optional: Reset order form to reflect new pair's current price

  updateCurrentPrice(defaultPrice);
}





// function fetchTickerData(pair) {
//   const coinId = getCoinIdFromPair(pair);
//   const apiUrl = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false&sparkline=false`;

//   fetch(apiUrl)
//     .then(response => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return response.json();
//     })
//     .then(data => {
//       // Extract market data
//       const marketData = data.market_data;
      
//       if (marketData) {
//         const priceChangePercent24h = marketData.price_change_percentage_24h;
//         const high24h = marketData.high_24h.usd;
//         const low24h = marketData.low_24h.usd;
//         const volume24h = marketData.total_volume.usd;
//         const currentPrice = marketData.current_price.usd;

//         // Update ticker stats
//         updateTickerStats(
//           currentPrice.toFixed(2),
//           priceChangePercent24h.toFixed(2), 
//           high24h.toFixed(2), 
//           low24h.toFixed(2), 
//           volume24h
//         );
        
//         // Update the order form price
//         updateCurrentPrice(currentPrice);
//       } else {
//         console.error('No market data available');
//       }
//     })
//     .catch(error => {
//       console.error('Error fetching ticker data:', error);
      
//       // Fallback to default values or error state
//       updateTickerStats('N/A', 'N/A', 'N/A', 'N/A', 'N/A');
      

//       updateCurrentPrice(defaultPrice);
//     });
// }



function fetchTickerData(pair) {
  // Ensure the pair is in the correct format for CoinGecko API
  const coinId = getCoinIdFromPair(pair);
  const apiUrl = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false&sparkline=false`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Extract market data
      const marketData = data.market_data;
      
      if (marketData) {
        const priceChangePercent24h = marketData.price_change_percentage_24h;
        const high24h = marketData.high_24h.usd;
        const low24h = marketData.low_24h.usd;
        const volume24h = marketData.total_volume.usd;
        const currentPrice = marketData.current_price.usd;

        // Update ticker stats
        updateTickerStats(
          currentPrice.toFixed(2),
          priceChangePercent24h.toFixed(2), 
          high24h.toFixed(2), 
          low24h.toFixed(2), 
          volume24h
        );
        
        // Update the order form price
        updateCurrentPrice(currentPrice);
      } else {
        console.error('No market data available');
        // Fallback to Bitcoin default values
        updateTickerStats('50000.00', '0.00', '51000.00', '49000.00', '1000000');
        updateCurrentPrice(50000);
      }
    })
    .catch(error => {
      console.error('Error fetching ticker data:', error);
      
      // Fallback to default Bitcoin values
      updateTickerStats('50000.00', '0.00', '51000.00', '49000.00', '1000000');
      updateCurrentPrice(50000);
    });
}

function updateTickerStats(currentPrice, change24h, high24h, low24h, volume24h) {
  // Add current price display
  const currentPriceElement = document.getElementById('current-price');
  if (currentPriceElement) {
    currentPriceElement.textContent = `$${currentPrice}`;
  }

  document.getElementById('change-24h').textContent = `${change24h}%`;
  document.getElementById('high-24h').textContent = `$${high24h}`;
  document.getElementById('low-24h').textContent = `$${low24h}`;
  document.getElementById('volume-24h').textContent = `$${Number(volume24h).toLocaleString()}`;
}

// function getCoinIdFromPair(pair) {
//   const pairToCoinId = {
//     'BTCUSDT': 'bitcoin',
//     'ETHUSDT': 'ethereum',
//     'BNBUSDT': 'binancecoin',
//     'DOGEUSDT': 'dogecoin',
  
//   };
//   return pairToCoinId[pair] || 'bitcoin';
// }


function getCoinIdFromPair(pair) {
  const pairToCoinId = {
    'BTCUSDT': 'bitcoin',
    'ETHUSDT': 'ethereum',
    'BNBUSDT': 'binancecoin',
    'DOGEUSDT': 'dogecoin'
  };
  return pairToCoinId[pair] || 'bitcoin';
}

// Interval and Data Handling
const intervalToDays = {
  '1m': 1,
  '5m': 7,
  '15m': 14,
  '1h': 30
};




function fetchCandlestickData() {
  const coinMapping = {
    'BTCUSDT': 'bitcoin',
    'ETHUSDT': 'ethereum',
    'BNBUSDT': 'binancecoin',
    'DOGEUSDT': 'dogecoin'
  };

  const coinId = coinMapping[currentPair] || 'bitcoin';
  const days = intervalToDays[currentInterval] || 1;
  const apiUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
  
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data && data.prices && data.prices.length > 0) {
        // Transform data into candlestick format
        const candlestickData = transformToCandlestickData(data.prices, currentInterval);
        renderChart(candlestickData);
        
        // Update current price for order form
        if (candlestickData.length > 0) {
          updateCurrentPrice(candlestickData[candlestickData.length - 1].close);
        }
      } else {
        console.error('No price data available');
        throw new Error('Empty or invalid data');
      }
    })
    .catch(err => {
      console.error('Detailed API Error:', err);
      const mockData = generateMockCandlestickData(currentInterval);
      renderChart(mockData);
      
      // Update current price with mock data
      if (mockData.length > 0) {
        updateCurrentPrice(mockData[mockData.length - 1].close);
      }
    });
}

function transformToCandlestickData(pricesData, interval) {
  const candlestickData = [];
  let groupSize;

  // Determine group size based on interval
  switch(interval) {
    case '1m': groupSize = 5; break;
    case '5m': groupSize = 25; break;
    case '15m': groupSize = 75; break;
    case '1h': groupSize = 300; break;
    default: groupSize = 5;
  }
  
  for (let i = 0; i < pricesData.length; i += groupSize) {
    const prices = pricesData.slice(i, i + groupSize).map(p => p[1]);
    
    if (prices.length > 0) {
      candlestickData.push({
        time: pricesData[i][0] / 1000, // Convert to seconds
        open: prices[0],
        high: Math.max(...prices),
        low: Math.min(...prices),
        close: prices[prices.length - 1]
      });
    }
  }
  
  return candlestickData;
}

function generateMockCandlestickData(interval) {
  const now = Date.now() / 1000; // Current time in seconds
  let dataPointCount;
  
  switch(interval) {
    case '1m': dataPointCount = 50; break;
    case '5m': dataPointCount = 10; break;
    case '15m': dataPointCount = 5; break;
    case '1h': dataPointCount = 2; break;
    default: dataPointCount = 50;
  }

  return Array.from({length: dataPointCount}, (_, i) => ({
    time: now - (dataPointCount - i) * (getIntervalInSeconds(interval)),
    open: 50000 + Math.random() * 100,
    high: 50000 + Math.random() * 200,
    low: 50000 - Math.random() * 100,
    close: 50000 + Math.random() * 150
  }));
}

function getIntervalInSeconds(interval) {
  switch(interval) {
    case '1m': return 60;
    case '5m': return 300;
    case '15m': return 900;
    case '1h': return 3600;
    default: return 60;
  }
}

function renderChart(data) {
  // Ensure the Lightweight Charts library is loaded
  if (typeof LightweightCharts === 'undefined') {
    loadScript('https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js')
      .then(() => initializeChart(data))
      .catch(err => console.error('Failed to load Lightweight Charts', err));
  } else {
    initializeChart(data);
  }
}

function initializeChart(data) {
  // Remove existing chart if it exists
  const chartContainer = document.getElementById('candlestick-chart');
  chartContainer.innerHTML = '';

  // Create chart
  chart = LightweightCharts.createChart(chartContainer, {
    width: chartContainer.clientWidth,
    height: 500,
    layout: {
      background: {
        color: '#20252B'
      },
      textColor: '#ffffff'
    },
    grid: {
      vertLines: { color: '#20252B' },
      horzLines: { color: '#20252B' },
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
    },
    priceScale: {
      borderColor: 'rgba(197, 203, 206, 0.8)',
    },
  });

  // Create candlestick series
  candlestickSeries = chart.addCandlestickSeries({
    upColor: 'green',
    downColor: 'red',
    borderDownColor: 'red',
    borderUpColor: 'green',
    wickDownColor: 'red',
    wickUpColor: 'green',
  });

  // Set data
  candlestickSeries.setData(data);

  // Adjust chart to fit data
  chart.timeScale().fitContent();
}



function showTab(tabName) {
  // Hide all tab content
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => tab.style.display = 'none');

  // Show the clicked tab's content
  const activeTab = document.getElementById(tabName);
  if (activeTab) {
    activeTab.style.display = 'block';
  }
}

function updateOrderBook() {
  const orderBookContent = document.getElementById('order-book-content');
  
  // Clear the order book content
  orderBookContent.innerHTML = '';

  // Display the buy and sell orders in a tabular format
  ['buy', 'sell'].forEach(type => {
    orders[type].forEach(order => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${order.price.toFixed(0)}</td>
        <td>${order.amount}</td>
        <td>${(order.price * order.amount).toFixed(2)}</td>
      `;
      orderBookContent.appendChild(row);
    });
  });
}

function updateRecentOrders() {
  const recentOrdersContent = document.getElementById('recent-orders-content');
  
  // Clear the recent orders content
  recentOrdersContent.innerHTML = '';
  
  // Display the recent orders (you can customize this part as needed)
  recentOrders.forEach(order => {
    const orderElement = document.createElement('div');
    orderElement.textContent = `${order.type.toUpperCase()} | ${order.amount} | ${order.price.toFixed(2)}`;
    recentOrdersContent.appendChild(orderElement);
  });
}

// Initialize the page with the Order Book tab active
window.onload = function() {
  showTab('order-book');
  updateOrderBook(); // Populate the order book
  updateRecentOrders(); // Populate recent orders (if needed)
};


// Interval Button Setup
function setupIntervalButtons() {
  const intervalContainer = document.querySelector('.dashboard__time-intervals');
  intervalContainer.innerHTML = ''; // Clear existing buttons
  
  const intervals = ['1m', '5m', '15m', '1h'];
  
  intervals.forEach(interval => {
    const button = document.createElement('button');
    button.textContent = interval;
    button.className = 'dashboard__interval-button';
    button.onclick = () => {
      // Remove active state from all buttons
      intervalContainer.querySelectorAll('button').forEach(btn => 
        btn.classList.remove('dashboard__interval-button--active')
      );
      
      // Add active state to current button
      button.classList.add('dashboard__interval-button--active');
      
      // Change interval
      changeInterval(interval);
    };
    
    intervalContainer.appendChild(button);
  });
  
  // Activate default interval
  const defaultButton = intervalContainer.querySelector('button');
  if (defaultButton) {
    defaultButton.classList.add('dashboard__interval-button--active');
  }
}

// Window Resize Handling
window.addEventListener('resize', () => {
  if (chart) {
    const chartContainer = document.getElementById('candlestick-chart');
    chart.resize(chartContainer.clientWidth, 500);
  }
});

// Page Load Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Setup interval buttons
  setupIntervalButtons();
  
  // Initialize data fetch
  fetchCandlestickData();
  
  // Add event listeners
  const amountInput = document.getElementById('amount-input');
  if (amountInput) {
    amountInput.addEventListener('input', calculateTotal);
  }
});

// Expose global functions
window.filterTradingPairs = filterTradingPairs;
window.calculateTotal = calculateTotal;
window.placeOrder = placeOrder;
window.updateTradingPair = updateTradingPair;
window.changeInterval = changeInterval;