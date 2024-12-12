document.getElementById('auth-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent form submission
    
    const emailInput = document.getElementById('email-input');
    const email = emailInput.value.trim(); // Get email input
    const hash = md5(email.toLowerCase().trim()); // Generate MD5 hash of the email

    // Hide input field and button
    emailInput.style.display = 'none';
    document.querySelector('button').style.display = 'none';

    // Display email and Gravatar
    const gravatarHTML = `
        <div style="display: flex; align-items:center; gap:10px;">
            <p>${email}</p> 
            <img src="https://www.gravatar.com/avatar/${hash}" alt="Gravatar" style="width: 20px; height: 20px; border-radius: 50%;">
        </div>`;
    
    document.getElementById('gravatar').innerHTML = gravatarHTML; // Insert into the div
});

// Functionality to filter trading pairs
const searchInput = document.getElementById('search-input');
const tradingPairsList = document.getElementById('trading-pairs-list');

searchInput.addEventListener('input', function() {
    const filter = searchInput.value.toLowerCase();
    const pairs = tradingPairsList.getElementsByClassName('trading-pair');

    Array.from(pairs).forEach(pair => {
        if (pair.textContent.toLowerCase().includes(filter)) {
            pair.style.display = ''; // Show matching pair
        } else {
            pair.style.display = 'none'; // Hide non-matching pair
        }
    });
});

// Functionality to calculate total value of order
const priceInput = document.getElementById('price');
const amountInput = document.getElementById('amount');
const totalValueDisplay = document.getElementById('total-value');

priceInput.addEventListener('input', updateTotal);
amountInput.addEventListener('input', updateTotal);

function updateTotal() {
    const price = parseFloat(priceInput.value) || 0;
    const amount = parseFloat(amountInput.value) || 0;
    totalValueDisplay.textContent = (price * amount).toFixed(2); // Update total value display
}

// Functionality to create and update the candlestick chart
let chart;
function createChart(data) {
    anychart.onDocumentReady(function () {
        // Create a candlestick chart
        chart = anychart.candlestick(data);
        
        // Set chart title and other configurations
        chart.title("Candlestick Chart Example");
        
        // Set container for the chart
        chart.container("chart-container");
        
        // Draw the chart
        chart.draw();
    });
}

// Sample data for candlestick chart (you can replace this with actual data)
const sampleData = [
    {x: "2024-01-01", open: 100, high: 120, low: 90, close: 110},
    {x: "2024-01-02", open: 110, high: 130, low: 100, close: 120},
    {x: "2024-01-03", open: 120, high: 140, low: 110, close: 130},
];

// Create initial chart with sample data
createChart(sampleData);

// Handle time interval switching for candlestick chart
const timeIntervalButtons = document.querySelectorAll('.time-interval');

timeIntervalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const selectedInterval = button.dataset.interval;
        
        console.log(`Selected interval: ${selectedInterval}`);
        
        // Here you would typically fetch new data based on selectedInterval.
        // For demonstration purposes, we'll just log it.
        
        // You can implement logic to fetch new data based on selectedInterval here.
        
        // For now, we will just redraw the same sample data.
        createChart(sampleData); // This should be replaced with actual data fetching logic.
    });
});

// Include MD5 function if not already available
function md5(string) {
   // Implementation of MD5 hashing (you can use a library or implement it here)
}
