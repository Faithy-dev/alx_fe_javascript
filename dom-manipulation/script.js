// ========================
// INITIAL QUOTES & STORAGE
// ========================
let quotes = [];

// Load from LocalStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The best way to predict the future is to create it.", category: "Inspiration" },
    { text: "Do not watch the clock. Do what it does. Keep going.", category: "Motivation" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" }
  ];
}

// Save quotes to LocalStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// ========================
// DOM ELEMENTS
// ========================
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFile');
const categoryFilter = document.getElementById('categoryFilter');

// ========================
// SHOW RANDOM QUOTE (with filter)
// ========================
function showRandomQuote() {
  let filteredQuotes = quotes;
  const selectedCategory = categoryFilter.value;
  
  if (selectedCategory !== 'all') {
    filteredQuotes = quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available for this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const { text, category } = filteredQuotes[randomIndex];
  
  quoteDisplay.innerHTML = `
    <p>"${text}"</p>
    <p class="category">— ${category}</p>
  `;

  // Save last quote to sessionStorage
  sessionStorage.setItem('lastQuote', JSON.stringify({ text, category }));
}

// ========================
// ADD NEW QUOTE
// ========================
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value.trim();
  const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
  
  if (!newQuoteText || !newQuoteCategory) {
    alert("Please enter both quote text and category.");
    return;
  }
  
  quotes.push({ text: newQuoteText, category: newQuoteCategory });
  saveQuotes();
  populateCategories(); // Update dropdown dynamically

  // Clear input fields
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';

  alert("Quote added successfully!");
  showRandomQuote();
}

// ========================
// CREATE ADD QUOTE FORM
// ========================
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

// ========================
// POPULATE CATEGORY DROPDOWN
// ========================
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const savedFilter = localStorage.getItem('selectedCategory');
  if (savedFilter) {
    categoryFilter.value = savedFilter;
  }
}

// ========================
// FILTER QUOTES BASED ON CATEGORY
// ========================
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem('selectedCategory', selectedCategory);
  showRandomQuote();
}

// ========================
// EXPORT TO JSON
// ========================
function exportQuotesToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();

  URL.revokeObjectURL(url);
}

// ========================
// IMPORT FROM JSON
// ========================
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
        showRandomQuote();
      } else {
        alert('Invalid JSON format.');
      }
    } catch (error) {
      alert('Error reading JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ========================
// INITIALIZE APP
// ========================
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();

  // Restore last viewed quote if session exists
  const lastQuote = sessionStorage.getItem('lastQuote');
  if (lastQuote) {
    const { text, category } = JSON.parse(lastQuote);
    quoteDisplay.innerHTML = `
      <p>"${text}"</p>
      <p class="category">— ${category}</p>
    `;
  } else {
    showRandomQuote();
  }
});

// ========================
// EVENT LISTENERS
// ========================
newQuoteBtn.addEventListener('click', showRandomQuote);
exportBtn.addEventListener('click', exportQuotesToJson);
importFileInput.addEventListener('change', importFromJsonFile);
categoryFilter.addEventListener('change', filterQuotes);
