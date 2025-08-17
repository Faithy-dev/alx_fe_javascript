// Initial array of quotes
let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Motivation" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" }
];

// Select DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');

// Function to display a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Please add some!</p>";
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const { text, category } = quotes[randomIndex];
  
  quoteDisplay.innerHTML = `
    <p>"${text}"</p>
    <p class="category">— ${category}</p>
  `;
}

// Function to add a new quote dynamically
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value.trim();
  const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
  
  if (!newQuoteText || !newQuoteCategory) {
    alert("Please enter both quote text and category.");
    return;
  }
  
  // Add the new quote to the array
  quotes.push({ text: newQuoteText, category: newQuoteCategory });
  
  // Clear the input fields
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  
  // Provide feedback
  alert("Quote added successfully!");
  
  // Show the new quote immediately
  showRandomQuote();
}

// Event listeners
newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);

// Display an initial random quote when the page loads
document.addEventListener('DOMContentLoaded', showRandomQuote);
