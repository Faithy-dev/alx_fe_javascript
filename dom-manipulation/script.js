// script.js

// 1) Quotes array (objects with text and category)
const quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
  { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", category: "Inspiration" }
];

// 2) displayRandomQuote function - selects a random quote and updates the DOM (uses textContent)
function displayRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (!quoteDisplay) return;

  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const q = quotes[randomIndex];

  // update DOM safely using textContent (no innerHTML)
  quoteDisplay.textContent = `"${q.text}" — (${q.category})`;
}

// 3) addQuote function - validates input, pushes new object, updates DOM
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  if (!textInput || !categoryInput) return;

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please fill in both the quote and category fields.");
    return;
  }

  // add to array as an object with text & category
  quotes.push({ text, category });

  // immediately show the newly added quote
  displayRandomQuote();

  // clear inputs
  textInput.value = "";
  categoryInput.value = "";

  // optional small feedback
  // (keeps the UI responsive without relying on inline handlers)
  alert("Quote added successfully!");
}

// 4) Hook up event listeners after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const newQuoteBtn = document.getElementById("newQuote");   // "Show New Quote" button
  const addQuoteBtn = document.getElementById("addQuote");  // "Add Quote" button (if present)

  if (newQuoteBtn) newQuoteBtn.addEventListener("click", displayRandomQuote);
  if (addQuoteBtn) addQuoteBtn.addEventListener("click", addQuote);

  // show an initial quote on load
  displayRandomQuote();
});
