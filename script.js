let quotes = [
  { text: "Believe in yourself!", category: "Motivation" },
  { text: "Keep pushing forward!", category: "Motivation" },
  { text: "Life is a journey.", category: "Wisdom" },
  { text: "Why don’t scientists trust atoms? They make up everything!", category: "Humor" },
];

let categories = [...new Set(quotes.map(q => q.category))];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryDropdown = document.createElement("select");
categoryDropdown.id = "categoryDropdown";
document.body.insertBefore(categoryDropdown, quoteDisplay);

function updateCategoryDropdown() {
  categoryDropdown.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryDropdown.appendChild(option);
  });
}

updateCategoryDropdown();

function showRandomQuote() {
  const selectedCategory = categoryDropdown.value;
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }
  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = `"${randomQuote.text}"`;
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// 👉 Step 3: addQuote function
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text: newQuoteText, category: newQuoteCategory });

  if (!categories.includes(newQuoteCategory)) {
    categories.push(newQuoteCategory);
    updateCategoryDropdown();
  }

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added successfully!");
}
