// Existing quotes array and initialization
let quotes = JSON.parse(localStorage.getItem('quotes')) || [];
const quotesContainer = document.getElementById('quotesContainer');
const categoryFilter = document.getElementById('categoryFilter');

// Fetch quotes from server (GET)
async function fetchQuotesFromServer() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts'); // Mock API
        const data = await response.json();

        // Convert server data into quote objects (simulate categories)
        const serverQuotes = data.slice(0, 5).map((item, index) => ({
            text: item.title,
            author: `Author ${index + 1}`,
            category: index % 2 === 0 ? 'Motivation' : 'Life'
        }));

        // Merge with local quotes, server takes precedence
        mergeQuotes(serverQuotes);

    } catch (error) {
        console.error('Error fetching quotes from server:', error);
    }
}

// Merge quotes (server wins on conflict)
function mergeQuotes(serverQuotes) {
    const merged = [...quotes];

    serverQuotes.forEach(serverQuote => {
        const existingIndex = merged.findIndex(q => q.text === serverQuote.text);
        if (existingIndex > -1) {
            merged[existingIndex] = serverQuote; // Server wins
        } else {
            merged.push(serverQuote);
        }
    });

    quotes = merged;
    localStorage.setItem('quotes', JSON.stringify(quotes));
    displayQuotes(quotes);
    populateCategories();
}

// POST new quote to server
async function postQuoteToServer(quote) {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quote)
        });

        const data = await response.json();
        console.log('Quote posted to server:', data);
    } catch (error) {
        console.error('Error posting quote to server:', error);
    }
}

// Add quote locally and sync
function addQuote(text, author, category) {
    const newQuote = { text, author, category };
    quotes.push(newQuote);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    displayQuotes(quotes);
    populateCategories();

    // Send to server
    postQuoteToServer(newQuote);
}

// Display quotes
function displayQuotes(filteredQuotes) {
    quotesContainer.innerHTML = '';
    filteredQuotes.forEach(quote => {
        const div = document.createElement('div');
        div.className = 'quote';
        div.innerHTML = `<p>"${quote.text}"</p><small>- ${quote.author} (${quote.category})</small>`;
        quotesContainer.appendChild(div);
    });
}

// Populate categories dynamically
function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        categoryFilter.appendChild(option);
    });

    // Restore last filter
    const lastFilter = localStorage.getItem('lastFilter') || 'all';
    categoryFilter.value = lastFilter;
}

// Filter quotes by category
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('lastFilter', selectedCategory);

    if (selectedCategory === 'all') {
        displayQuotes(quotes);
    } else {
        displayQuotes(quotes.filter(q => q.category === selectedCategory));
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    fetchQuotesFromServer();
    displayQuotes(quotes);
    populateCategories();
});
