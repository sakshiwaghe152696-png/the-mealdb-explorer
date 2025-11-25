const API = "http://localhost:5000/api";

async function loadCategories() {
  const res = await fetch(`${API}/categories`);
  const data = await res.json();
  const container = document.getElementById("categoryList");
  container.innerHTML = "";

  (data.meals || []).forEach(c => {
    const btn = document.createElement("button");
    btn.className = "category-btn";
    btn.innerText = c.strCategory;

    btn.onclick = () => {
      document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadByCategory(c.strCategory);
    };

    container.appendChild(btn);
  });
}

async function searchMeals() {
  const q = document.getElementById("search").value.trim();

  if (!q) {
    document.getElementById("emptyState").style.display = "block";
    document.getElementById("results").innerHTML = "";
    return;
  }

  const res = await fetch(`${API}/search?q=${encodeURIComponent(q)}`);
  const data = await res.json();
  displayResults(data.meals);
}

async function loadByCategory(cat) {
  const res = await fetch(`${API}/category/${encodeURIComponent(cat)}`);
  const data = await res.json();
  displayResults(data.meals, cat);
}

async function randomMeal() {
  const res = await fetch(`${API}/random`);
  const data = await res.json();
  displayResults(data.meals);
}

function displayResults(meals, categoryLabel) {
  const container = document.getElementById("results");
  const empty = document.getElementById("emptyState");
  container.innerHTML = "";

  if (!meals) {
    empty.style.display = "block";
    empty.innerText = "No meals found. Try a different search.";
    return;
  }

  empty.style.display = "none";

  meals.forEach(m => {
    const card = document.createElement("div");
    card.className = "meal-card";
    card.onclick = () => openMealDetails(m.idMeal);

    card.innerHTML = `
      <img src="${m.strMealThumb}" alt="${m.strMeal}" loading="lazy" />
      <div class="meal-card-content">
        <div class="meal-card-title">${m.strMeal}</div>
        <div class="meal-card-category">
          <span>${categoryLabel || m.strCategory || "Meal"}</span>
          <span class="tip">Tap for details</span>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

async function openMealDetails(id) {
  const res = await fetch(`${API}/meal/${id}`);
  const data = await res.json();
  const meal = data.meals[0];

  document.getElementById("modalTitle").innerText = meal.strMeal;

  let ingredients = "";
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && ing.trim() !== "") {
      ingredients += `<li>${ing} - ${meas}</li>`;
    }
  }

  const tags = [];
  if (meal.strCategory) tags.push(meal.strCategory);
  if (meal.strArea) tags.push(meal.strArea);
  if (meal.strTags) tags.push(...meal.strTags.split(","));

  const tagsHtml = tags
    .filter(Boolean)
    .map(t => `<span class="tag">${t.trim()}</span>`)
    .join("");

  let youtubeEmbed = "";
  if (meal.strYoutube) {
    const videoId = meal.strYoutube.split("v=")[1];
    youtubeEmbed = `
      <div class="section-title">Video Tutorial</div>
      <iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>
    `;
  }

  const content = `
    <img class="modal-img" src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy" />
    <div style="margin-bottom:8px;">${tagsHtml}</div>
    <div class="section-title">Ingredients</div>
    <ul>${ingredients}</ul>
    <div class="section-title">Instructions</div>
    <p>${meal.strInstructions}</p>
    ${youtubeEmbed}
  `;

  document.getElementById("modalContent").innerHTML = content;
  showModal();
}

function showModal() {
  document.getElementById("modalBackdrop").style.display = "flex";
}

function hideModal() {
  document.getElementById("modalBackdrop").style.display = "none";
}

function closeModal(e) {
  if (e.target.id === "modalBackdrop") {
    hideModal();
  }
}

loadCategories();
document.getElementById("emptyState").style.display = "block";
