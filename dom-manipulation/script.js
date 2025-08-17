let quotes = JSON.parse(localStorage.getItem('quotes')) || [];
const QUOTES_API = 'https://jsonplaceholder.typicode.com/posts'; // Mock API

// Fetch quotes from server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(QUOTES_API);
        const data = await response.json();

        // Assume server returns an array of objects { title: 'quote text', body: 'category' }
        const serverQuotes = data.slice(0, 10).map(item => ({
            text: item.title,
            category: item.body
        }));

        // Merge server quotes into local storage without duplication
        const mergedQuotes = mergeQuotes(quotes, serverQuotes);
        quotes = mergedQuotes;
        localStorage.setItem('quotes', JSON.stringify(quotes));

        console.log('Fetched and merged quotes from server:', mergedQuotes);
    } catch (error) {
        console.error('Error fetching quotes:', error);
    }
}

// Merge local and server quotes without duplicates
function mergeQuotes(localQuotes, serverQuotes) {
    const combined = [...localQuotes];
    serverQuotes.forEach(serverQuote => {
        if (!localQuotes.some(local => local.text === serverQuote.text)) {
            combined.push(serverQuote);
        }
    });
    return combined;
}

// Sync local quotes to server (simulate POST request)
async function syncQuotes() {
    try {
        for (const quote of quotes) {
            await fetch(QUOTES_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: quote.text,
                    body: quote.category,
                    userId: 1
                })
            });
        }
        console.log('Quotes synced to server successfully.');
        alert('Quotes synced with server!'); // ✅ Added alert here
    } catch (error) {
        console.error('Error syncing quotes to server:', error);
    }
}

// Periodic sync every 60 seconds
setInterval(() => {
    fetchQuotesFromServer(); // Get updates from server
    syncQuotes();           // Push local updates to server
}, 60000);

// Example addQuote function (ensure it calls sync when adding new quote)
function addQuote(text, category) {
    if (!text || !category) return;

    const newQuote = { text, category };
    quotes.push(newQuote);
    localStorage.setItem('quotes', JSON.stringify(quotes));

    // Immediately sync after adding
    syncQuotes();
}

// Populate UI initially
document.addEventListener('DOMContentLoaded', () => {
    fetchQuotesFromServer(); // Load initial quotes
});
