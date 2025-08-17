// Existing global variables
let quotes = JSON.parse(localStorage.getItem('quotes')) || [];
const quotesContainer = document.getElementById('quotesContainer');
const categoryFilter = document.getElementById('categoryFilter');

// ✅ Fetch quotes from server (mock API) and update local storage
async function fetchQuotesFromServer() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts'); 
        const data = await response.json();

        // Simulate server quotes structure
        const serverQuotes = data.slice(0, 5).map(post => ({
            text: post.title,
            author: `User ${post.userId}`,
            category: 'General'
        }));

        // Merge with local quotes and resolve conflicts (server wins)
        const mergedQuotes = mergeQuotesWithServer(serverQuotes, quotes);
        quotes = mergedQuotes;

        // Save updated quotes to local storage
        localStorage.setItem('quotes', JSON.stringify(quotes));

        renderQuotes();
        populateCategories();

        console.log('Quotes synced with server successfully!');
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
    }
}

// ✅ Merge function (server data takes precedence)
function mergeQuotesWithServer(serverQuotes, localQuotes) {
    const combined = [...localQuotes];

    serverQuotes.forEach(serverQuote => {
        const exists = combined.some(localQuote => localQuote.text === serverQuote.text);
        if (!exists) {
            combined.push(serverQuote);
        }
    });

    return combined;
}

// ✅ Call fetch on page load and periodically sync every 30 seconds
fetchQuotesFromServer();
setInterval(fetchQuotesFromServer, 30000);

// ✅ Render quotes to the DOM
function renderQuotes(filteredCategory = 'all') {
    quotesContainer.innerHTML = '';
    const filteredQuotes = filteredCategory === 'all'
        ? quotes
        : quotes.filter(q => q.category === filteredCategory);

    filteredQuotes.forEach(quote => {
        const div = document.createElement('div');
        div.className = 'quote';
        div.innerHTML = `<p>"${quote.text}"</p><small>- ${quote.author} (${quote.category})</small>`;
        quotesContainer.appendChild(div);
    });
}

// ✅ Populate category filter dynamically
function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

    // Restore last selected category from localStorage
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory && categories.includes(savedCategory)) {
        categoryFilter.value = savedCategory;
        renderQuotes(savedCategory);
    } else {
        renderQuotes();
    }
}

// ✅ Filter quotes on category change
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('selectedCategory', selectedCategory);
    renderQuotes(selectedCategory);
}

// ✅ Add new quote and sync categories
function addQuote(text, author, category) {
    const newQuote = { text, author, category };
    quotes.push(newQuote);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    renderQuotes(categoryFilter.value);
    populateCategories();
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    populateCategories();
    renderQuotes();
});
