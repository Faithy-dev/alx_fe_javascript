/*****************************************
 * Data model (stored in LocalStorage):
 * Quote {
 *   id: string,          // stable local id
 *   serverId?: number,   // if synced with server (JSONPlaceholder id)
 *   text: string,
 *   category: string,
 *   updatedAt: string,   // ISO timestamp
 *   source: 'local'|'server'
 * }
 *****************************************/

// ----------------------
// Utilities
// ----------------------
const nowIso = () => new Date().toISOString();
const genId = () =>
  (crypto?.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2));

function setStatus(msg) {
  const el = document.getElementById('syncStatus');
  if (el) el.textContent = msg || '';
}

function toastConflicts(count) {
  const bar = document.getElementById('conflictBar');
  const cnt = document.getElementById('conflictCount');
  if (!bar || !cnt) return;
  if (count > 0) {
    cnt.textContent = String(count);
    bar.style.display = 'block';
  } else {
    bar.style.display = 'none';
  }
}

// ----------------------
// Storage
// ----------------------
let quotes = [];

function loadQuotes() {
  const raw = localStorage.getItem('quotes');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      // migrate older shapes to our current model
      quotes = parsed.map(q => ({
        id: q.id || genId(),
        text: q.text,
        category: q.category,
        serverId: q.serverId ?? undefined,
        updatedAt: q.updatedAt || nowIso(),
        source: q.source || (q.serverId ? 'server' : 'local'),
      }));
    } catch {
      quotes = [];
    }
  } else {
    // seed
    quotes = [
      { id: genId(), text: "The best way to predict the future is to create it.", category: "Inspiration", updatedAt: nowIso(), source: 'local' },
      { id: genId(), text: "Do not watch the clock. Do what it does. Keep going.", category: "Motivation", updatedAt: nowIso(), source: 'local' },
      { id: genId(), text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life", updatedAt: nowIso(), source: 'local' }
    ];
  }
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function getConflicts() {
  const raw = localStorage.getItem('quoteConflicts');
  return raw ? JSON.parse(raw) : [];
}
function setConflicts(conflicts) {
  localStorage.setItem('quoteConflicts', JSON.stringify(conflicts));
}

function setLastSynced(ts = nowIso()) {
  localStorage.setItem('lastSyncedAt', ts);
}
function getLastSynced() {
  return localStorage.getItem('lastSyncedAt');
}

// ----------------------
// DOM elements
// ----------------------
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFile');
const categoryFilter = document.getElementById('categoryFilter');
const syncBtn = document.getElementById('syncBtn');
const reviewConflictsBtn = document.getElementById('reviewConflictsBtn');
const conflictPanel = document.getElementById('conflictPanel');
const conflictList = document.getElementById('conflictList');
const closeConflicts = document.getElementById('closeConflicts');

// ----------------------
// Quote rendering & UI
// ----------------------
function showRandomQuote() {
  let filtered = quotes;
  const selected = categoryFilter.value;
  if (selected !== 'all') {
    filtered = quotes.filter(q => q.category.toLowerCase() === selected.toLowerCase());
  }

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available for this category.</p>";
    return;
  }

  const { text, category } = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `
    <p>"${text}" <span class="tag">${category}</span></p>
  `;

  sessionStorage.setItem('lastQuote', JSON.stringify({ text, category }));
}

function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.classList.add('form-container');

  const inputText = document.createElement('input');
  inputText.id = 'newQuoteText';
  inputText.type = 'text';
  inputText.placeholder = 'Enter a new quote';

  const inputCategory = document.createElement('input');
  inputCategory.id = 'newQuoteCategory';
  inputCategory.type = 'text';
  inputCategory.placeholder = 'Enter quote category';

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add Quote';
  addBtn.addEventListener('click', addQuote);

  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addBtn);

  document.body.appendChild(formContainer);
}

function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))].sort((a, b) =>
    a.localeCompare(b)
  );

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem('selectedCategory');
  if (savedFilter && [...categoryFilter.options].some(o => o.value === savedFilter)) {
    categoryFilter.value = savedFilter;
  }
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem('selectedCategory', selected);
  showRandomQuote();
}

// ----------------------
// CRUD
// ----------------------
function addQuote() {
  const textEl = document.getElementById('newQuoteText');
  const catEl = document.getElementById('newQuoteCategory');
  const text = textEl.value.trim();
  const category = catEl.value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({
    id: genId(),
    text,
    category,
    updatedAt: nowIso(),
    source: 'local'
  });

  saveQuotes();
  populateCategories();
  textEl.value = '';
  catEl.value = '';
  showRandomQuote();
}

// ----------------------
// Import / Export JSON
// ----------------------
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

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) return alert('Invalid JSON format (expected array).');
      // Merge: keep local items; add new ones; update if same id encountered.
      const byId = new Map(quotes.map(q => [q.id, q]));
      imported.forEach(q => {
        const merged = {
          id: q.id || genId(),
          text: q.text,
          category: q.category,
          serverId: q.serverId ?? undefined,
          updatedAt: q.updatedAt || nowIso(),
          source: q.source || (q.serverId ? 'server' : 'local'),
        };
        byId.set(merged.id, merged);
      });
      quotes = [...byId.values()];
      saveQuotes();
      populateCategories();
      showRandomQuote();
      alert('Quotes imported successfully!');
    } catch {
      alert('Error reading JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ----------------------
// Server Sync (JSONPlaceholder mock)
// ----------------------
const SERVER_BASE = 'https://jsonplaceholder.typicode.com';

// Map JSONPlaceholder post -> Quote
function mapPostToQuote(post) {
  return {
    id: `srv-${post.id}`,       // local stable id for server items
    serverId: post.id,          // numeric id from server
    text: String(post.body || '').trim() || '(empty)',
    category: String(post.title || 'General').trim() || 'General',
    updatedAt: nowIso(),        // JSONPlaceholder has no timestamps; simulate
    source: 'server'
  };
}

// Fetch server quotes (simulate updates)
async function fetchServerQuotes(limit = 10) {
  const res = await fetch(`${SERVER_BASE}/posts?_limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch server data');
  const posts = await res.json();
  return posts.map(mapPostToQuote);
}

// Push unsynced local quotes to server (simulation)
async function pushLocalChanges(localOnly) {
  // localOnly = quotes without serverId
  const toPush = localOnly.filter(q => !q.serverId);
  if (toPush.length === 0) return [];

  const results = [];
  for (const q of toPush) {
    try {
      const res = await fetch(`${SERVER_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: q.category, body: q.text, userId: 1 })
      });
      // JSONPlaceholder returns a faux id; we accept it to simulate
      const created = await res.json();
      // update local record to mark it as synced
      q.serverId = created.id;
      q.source = 'server';
      q.updatedAt = nowIso();
      results.push({ ok: true, id: created.id, localId: q.id });
    } catch (e) {
      results.push({ ok: false, error: e.message, localId: q.id });
    }
  }
  return results;
}

// Merge server quotes into local, detect conflicts (server-wins default)
function mergeServerQuotes(serverQuotes) {
  const byServerId = new Map(quotes.filter(q => q.serverId).map(q => [q.serverId, q]));
  const conflicts = [];

  for (const srv of serverQuotes) {
    const local = byServerId.get(srv.serverId);
    if (!local) {
      // new from server
      quotes.push(srv);
      continue;
    }

    // Potential conflict: text or category differ
    const contentDiffers = (local.text !== srv.text) || (local.category !== srv.category);

    if (!contentDiffers) {
      // keep whichever (we’ll refresh updatedAt to now for server)
      local.updatedAt = srv.updatedAt;
      local.source = 'server';
      continue;
    }

    // Conflict detected — apply server-wins now; keep local copy for manual override
    const conflict = {
      serverId: srv.serverId,
      localBefore: { ...local },
      serverIncoming: { ...srv },
      resolved: 'server', // default
      timestamp: nowIso(),
    };
    conflicts.push(conflict);

    // Apply server version
    local.text = srv.text;
    local.category = srv.category;
    local.updatedAt = srv.updatedAt;
    local.source = 'server';
  }

  // Store any conflicts
  if (conflicts.length > 0) {
    const existing = getConflicts();
    setConflicts([...existing, ...conflicts]);
  }

  return conflicts.length;
}

// Render conflict list UI
function renderConflicts() {
  const conflicts = getConflicts();
  if (conflicts.length === 0) {
    conflictList.innerHTML = `<p>No conflicts to review 🎉</p>`;
    return;
  }

  conflictList.innerHTML = '';
  conflicts.forEach((c, index) => {
    const div = document.createElement('div');
    div.className = 'conflict-item';
    div.innerHTML = `
      <p><strong>Conflict for serverId ${c.serverId}</strong></p>
      <p><em>Server</em>: "${c.serverIncoming.text}" <span class="tag">${c.serverIncoming.category}</span></p>
      <p><em>Local</em>: "${c.localBefore.text}" <span class="tag">${c.localBefore.category}</span></p>
      <div class="conflict-actions">
        <button data-action="keep-server" data-index="${index}">Keep Server</button>
        <button data-action="keep-local" data-index="${index}">Keep Local</button>
      </div>
    `;
    conflictList.appendChild(div);
  });
}

// Handle conflict action clicks
function onConflictAction(e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const idx = Number(btn.dataset.index);
  const conflicts = getConflicts();
  const c = conflicts[idx];
  if (!c) return;

  // Find the quote in local store by serverId
  const q = quotes.find(q => q.serverId === c.serverId);
  if (!q) return;

  if (action === 'keep-local') {
    // restore localBefore
    q.text = c.localBefore.text;
    q.category = c.localBefore.category;
    q.updatedAt = nowIso();
    q.source = 'local';
  } else {
    // ensure server stays applied
    q.text = c.serverIncoming.text;
    q.category = c.serverIncoming.category;
    q.updatedAt = nowIso();
    q.source = 'server';
  }

  // remove this conflict from list
  conflicts.splice(idx, 1);
  setConflicts(conflicts);
  saveQuotes();
  populateCategories();
  showRandomQuote();
  renderConflicts();
  toastConflicts(conflicts.length);
}

// Main sync flow
async function syncWithServer({ manual = false } = {}) {
  try {
    setStatus(manual ? 'Syncing…' : 'Auto-syncing…');

    // 1) Push local unsynced changes
    const localOnly = quotes.filter(q => !q.serverId);
    await pushLocalChanges(localOnly);

    // 2) Fetch server snapshot (simulate updates)
    const serverQuotes = await fetchServerQuotes(12);

    // 3) Merge & resolve conflicts (server-wins default)
    const conflictCount = mergeServerQuotes(serverQuotes);

    // 4) Persist and update UI
    saveQuotes();
    populateCategories();
    showRandomQuote();
    setLastSynced();

    toastConflicts(conflictCount);
    setStatus(`Last synced: ${new Date().toLocaleTimeString()}`);
  } catch (e) {
    setStatus('Sync failed (offline or API error).');
    // You might keep retry logic/backoff here if desired
  }
}

// Schedule periodic sync (e.g., every 30s)
let syncTimer = null;
function scheduleSync(ms = 30000) {
  if (syncTimer) clearInterval(syncTimer);
  syncTimer = setInterval(() => syncWithServer({ manual: false }), ms);
}

// ----------------------
// Init
// ----------------------
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();

  // Restore last viewed quote within session
  const last = sessionStorage.getItem('lastQuote');
  if (last) {
    const { text, category } = JSON.parse(last);
    quoteDisplay.innerHTML = `<p>"${text}" <span class="tag">${category}</span></p>`;
  } else {
    showRandomQuote();
  }

  // Initial sync on load (non-blocking)
  syncWithServer({ manual: false });
  scheduleSync(30000); // 30s

  // Wire up events
  newQuoteBtn.addEventListener('click', showRandomQuote);
  exportBtn.addEventListener('click', exportQuotesToJson);
  importFileInput.addEventListener('change', importFromJsonFile);
  categoryFilter.addEventListener('change', filterQuotes);
  syncBtn.addEventListener('click', () => syncWithServer({ manual: true }));

  if (reviewConflictsBtn) {
    reviewConflictsBtn.addEventListener('click', () => {
      conflictPanel.style.display = 'block';
      renderConflicts();
    });
  }
  if (closeConflicts) {
    closeConflicts.addEventListener('click', () => {
      conflictPanel.style.display = 'none';
    });
  }
  if (conflictPanel) conflictPanel.addEventListener('click', onConflictAction);

  // Show banner if there are pending conflicts from previous runs
  toastConflicts(getConflicts().length);
});
