let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

const SERVER_URL = "https://my-json-server.typicode.com/your-username/quotes-db/quotes";

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn = document.getElementById("newQuote");

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const lastSelected = localStorage.getItem("lastSelectedCategory");
  if (lastSelected && [...categoryFilter.options].some(opt => opt.value === lastSelected)) {
    categoryFilter.value = lastSelected;
    filterQuotes();
  }
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("lastSelectedCategory", selectedCategory);

  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  textInput.value = "";
  categoryInput.value = "";
  alert("Quote added successfully!");
}

function createAddQuoteForm(containerId) {
  const container = document.getElementById(containerId);
  const heading = document.createElement("h2");
  heading.textContent = "Add a New Quote";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  container.appendChild(heading);
  container.appendChild(textInput);
  container.appendChild(categoryInput);
  container.appendChild(addButton);
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON file format.");
      }
    } catch {
      alert("Failed to parse JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();
    const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
    const mergedQuotes = mergeQuotes(serverQuotes, localQuotes);
    localStorage.setItem("quotes", JSON.stringify(mergedQuotes));
    quotes = mergedQuotes;
    populateCategories();

    if (JSON.stringify(serverQuotes) !== JSON.stringify(localQuotes)) {
      showNotification("Server quotes synced. Conflicts resolved using server version.");
    }
  } catch (error) {
    console.error("Error syncing with server:", error);
  }
}

function mergeQuotes(serverQuotes, localQuotes) {
  const seen = new Set();
  const result = [];

  serverQuotes.forEach(q => {
    result.push(q);
    seen.add(q.text + q.category);
  });

  localQuotes.forEach(q => {
    if (!seen.has(q.text + q.category)) {
      result.push(q);
    }
  });

  return result;
}

function showNotification(message) {
  const notify = document.createElement("div");
  notify.textContent = message;
  notify.style = `
    background: #ffc107;
    color: #000;
    padding: 1rem;
    margin: 1rem 0;
    border-left: 5px solid #ff9800;
  `;
  document.body.insertBefore(notify, document.body.firstChild);
  setTimeout(() => notify.remove(), 5000);
}

// === Initialization ===
document.addEventListener("DOMContentLoaded", () => {
  newQuoteBtn.addEventListener("click", filterQuotes);
  categoryFilter.addEventListener("change", filterQuotes);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);

  createAddQuoteForm("quoteFormContainer");
  populateCategories();

  const lastQuote = sessionStorage.getItem("lastViewedQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
  }

  // Sync with server every 30 seconds
  fetchQuotesFromServer();
  setInterval(fetchQuotesFromServer, 30000);
});
