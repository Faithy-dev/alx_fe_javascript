// Array of quotes
const quotes = [
  "The best way to predict the future is to invent it. – Alan Kay",
  "Simplicity is the ultimate sophistication. – Leonardo da Vinci",
  "Your time is limited, so don’t waste it living someone else’s life. – Steve Jobs",
  "Code is like humor. When you have to explain it, it’s bad. – Cory House",
  "First, solve the problem. Then, write the code. – John Johnson"
];

// Get DOM elements
const quoteBtn = document.getElementById("quote-btn");
const quoteDisplay = document.getElementById("quote-display");

// Function to display a random quote
function displayRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  
  // Clear previous content
  while (quoteDisplay.firstChild) {
    quoteDisplay.removeChild(quoteDisplay.firstChild);
  }

  // Create new text node and append
  const newQuote = document.createTextNode(quotes[randomIndex]);
  quoteDisplay.appendChild(newQuote);
}

// Event listener
quoteBtn.addEventListener("click", displayRandomQuote);
