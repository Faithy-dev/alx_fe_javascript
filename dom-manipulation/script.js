// Initial array of quotes
let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Motivation" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" }
];

// Select DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');

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
  
  alert("Quote added successfully!");
  showRandomQuote();
}

// Function to create the Add Quote form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.classList.add('form-container');

  const heading = document.createElement('h2');
  heading.textContent = 'Add a New Quote';
  formContainer.appendChild(heading);

  const inputText = document.createElement('input');
  inputText.id = 'newQuoteText';
  inputText.type = 'text';
  inputText.placeholder = 'Enter a new quote';
  formContainer.appendChild(inputText);

  const inputCategory = document.createElement('input');
  inputCategory.id = 'newQuoteCategory';
  inputCategory.type = 'text';
  inputCategory.placeholder = 'Enter quote category';
  formContainer.appendChild(inputCategory);

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add Quote';
  addBtn.addEventListener('click', addQuote);
  formContainer.appendChild(addBtn);

  document.body.appendChild(formContainer);
}

// Event listeners
newQuoteBtn.addEventListener('click', showRandomQuote);

// Create form dynamically after page loads
document.addEventListener('DOMContentLoaded', () => {
  showRandomQuote();
  createAddQuoteForm();
});
