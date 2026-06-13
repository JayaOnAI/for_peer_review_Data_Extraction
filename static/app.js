// ── TheMealDB (with bundled fallback) ────────────────────────────
const MEALDB = "https://www.themealdb.com/api/json/v1/1";
let _mealdbAvailable = null; // null=untested, true/false after first call

const CUISINE_MAP = {
  Indian: "Indian", Western: "British", Iranian: "Turkish",
  Chinese: "Chinese", Italian: "Italian", Mexican: "Mexican",
  Thai: "Thai", Japanese: "Japanese", Mediterranean: "Greek", American: "American",
};

async function apiGet(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`TheMealDB ${r.status}`);
  return r.json();
}

async function mealdbAvailable() {
  if (OFFLINE_MODE) return false;
  if (_mealdbAvailable !== null) return _mealdbAvailable;
  try {
    await fetch(`${MEALDB}/categories.php`, { signal: AbortSignal.timeout(4000) });
    _mealdbAvailable = true;
  } catch (_) {
    _mealdbAvailable = false;
  }
  return _mealdbAvailable;
}

// ── Bundled data helpers ──────────────────────────────────────────
function bundledByArea(area) {
  // Map TheMealDB area names back to our cuisine labels in bundled data
  const areaMap = {
    Indian:"Indian", British:"Western", Turkish:"Iranian",
    Chinese:"Chinese", Italian:"Italian", Mexican:"Mexican",
    Thai:"Thai", Japanese:"Japanese", Greek:"Mediterranean", American:"American",
  };
  const label = areaMap[area] || area;
  return BUNDLED_RECIPES.filter((r) => r.cuisine === label);
}

function bundledByCategory(cat) {
  if (cat === "Breakfast") return BUNDLED_RECIPES.filter((r) => r.category === "Breakfast" || r.name.toLowerCase().includes("egg") || r.name.toLowerCase().includes("oat"));
  return BUNDLED_RECIPES;
}

function bundledToMealStub(r) { return { idMeal: r.id, strMeal: r.name }; }

function bundledToMealDetail(r) {
  const obj = { idMeal: r.id, strMeal: r.name, strArea: r.cuisine, strCategory: r.category, strInstructions: r.instructions.join("\n"), strMealThumb: r.thumbnail || "", strYoutube: r.youtube || "", strSource: r.source || "" };
  r.ingredients.forEach((ing, i) => {
    const parts = ing.match(/^([\d/.,\s]+(?:tbsp|tsp|cup|cups|g|kg|ml|L|oz|lb|can|cans|sprig[s]?|clove[s]?|large|medium|small|handful|pinch|bunch)?[\s]*)(.+)$/i);
    obj[`strMeasure${i+1}`] = parts ? parts[1].trim() : "";
    obj[`strIngredient${i+1}`] = parts ? parts[2].trim() : ing;
  });
  return obj;
}

async function fetchMealsByArea(area) {
  if (!(await mealdbAvailable())) return bundledByArea(area).map(bundledToMealStub);
  const d = await apiGet(`${MEALDB}/filter.php?a=${encodeURIComponent(area)}`);
  return d.meals || [];
}

async function fetchMealsByCategory(cat) {
  if (!(await mealdbAvailable())) return bundledByCategory(cat).map(bundledToMealStub);
  const d = await apiGet(`${MEALDB}/filter.php?c=${encodeURIComponent(cat)}`);
  return d.meals || [];
}

async function fetchMealDetails(id) {
  if (!(await mealdbAvailable())) {
    const r = BUNDLED_RECIPES.find((x) => x.id === id);
    return r ? bundledToMealDetail(r) : null;
  }
  const d = await apiGet(`${MEALDB}/lookup.php?i=${id}`);
  return d.meals?.[0] || null;
}

// Pull ingredient list out of the raw meal object
function extractIngredients(meal) {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const name = (meal[`strIngredient${i}`] || "").trim();
    const amount = (meal[`strMeasure${i}`] || "").trim();
    if (name) list.push({ name, amount });
  }
  return list;
}

// How many pantry items does this recipe use?
function pantryScore(ingredients, staples, groceries) {
  const have = [...staples, ...groceries].map((s) => s.toLowerCase());
  return ingredients.filter(({ name }) => {
    const n = name.toLowerCase();
    return have.some((h) => n.includes(h) || h.includes(n));
  }).length;
}

// Convert raw meal + ingredients into our recipe card shape
function mealToRecipe(meal, ingredients) {
  const steps = (meal.strInstructions || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    id: meal.idMeal,
    name: meal.strMeal,
    cuisine: meal.strArea || "International",
    category: meal.strCategory || "",
    thumbnail: meal.strMealThumb || "",
    description:
      steps[0]
        ? steps[0].slice(0, 160) + (steps[0].length > 160 ? "…" : "")
        : "",
    ingredients: ingredients.map((i) =>
      [i.amount, i.name].filter(Boolean).join(" ")
    ),
    instructions: steps,
    youtube: meal.strYoutube || "",
    source: meal.strSource || "",
    difficulty: "Medium",
    prep_time: null,
    cook_time: null,
    servings: null,
  };
}

// ── App State ─────────────────────────────────────────────────────
const state = {
  staples: [],
  groceries: [],
  suggestedRecipes: [],
  selectedRecipes: [],
  weekPlan: null,
};

// ── Tab Switching ─────────────────────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-content").forEach((sec) => {
    sec.classList.toggle("active", sec.id === `tab-${tabId}`);
  });
  if (tabId === "grocery") renderSelectedRecipes();
}
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// ── Tag Inputs ────────────────────────────────────────────────────
function addTag(list, value, cloudId) {
  const val = value.trim();
  if (!val || state[list].includes(val)) return;
  state[list].push(val);
  renderCloud(list, cloudId);
}
function removeTag(list, value, cloudId) {
  state[list] = state[list].filter((v) => v !== value);
  renderCloud(list, cloudId);
}
function renderCloud(list, cloudId) {
  const cloud = document.getElementById(cloudId);
  cloud.innerHTML = "";
  state[list].forEach((val) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.innerHTML = `${val}<button class="tag-remove" title="Remove">✕</button>`;
    tag.querySelector(".tag-remove").onclick = () =>
      removeTag(list, val, cloudId);
    cloud.appendChild(tag);
  });
}
function setupTagInput(inputId, btnId, list, cloudId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  btn.onclick = () => {
    addTag(list, input.value, cloudId);
    input.value = "";
  };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addTag(list, input.value, cloudId);
      input.value = "";
    }
  });
}
setupTagInput("staple-input", "add-staple", "staples", "staples-cloud");
setupTagInput("grocery-input", "add-grocery", "groceries", "groceries-cloud");
document.querySelectorAll(".quick-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const list = btn.dataset.list;
    addTag(list, btn.dataset.val, list + "-cloud");
  });
});

function getSelectedCuisines() {
  return Array.from(
    document.querySelectorAll("#cuisine-grid input:checked")
  ).map((el) => el.value);
}

// ── Status Bar ────────────────────────────────────────────────────
function showStatus(id, msg, type = "thinking") {
  const el = document.getElementById(id);
  el.classList.remove("hidden", "error");
  el.classList.add(type);
  el.innerHTML =
    type === "thinking"
      ? `<div class="spinner"></div><span>${msg}</span>`
      : `<span>${msg}</span>`;
}
function hideStatus(id) {
  document.getElementById(id).classList.add("hidden");
}

// ── Recipe Card ───────────────────────────────────────────────────
function diffClass(d) {
  if (!d) return "";
  const v = d.toLowerCase();
  return v === "easy" ? "diff-easy" : v === "hard" ? "diff-hard" : "diff-medium";
}

function renderRecipeCard(recipe, idx) {
  const isSelected = state.selectedRecipes.some((r) => r.name === recipe.name);
  const card = document.createElement("div");
  card.className = "recipe-card";
  card.style.animationDelay = `${idx * 0.06}s`;
  const thumb = recipe.thumbnail
    ? `<img src="${recipe.thumbnail}/preview" class="recipe-thumb" alt="${recipe.name}" />`
    : "";
  card.innerHTML = `
    ${thumb}
    <div class="recipe-card-header">
      <div class="recipe-card-cuisine">${recipe.cuisine}</div>
      <div class="recipe-card-name">${recipe.name}</div>
      <div class="recipe-card-desc">${recipe.description}</div>
    </div>
    <div class="recipe-card-meta">
      <div class="meta-item"><span class="meta-label">Category</span><span class="meta-value">${recipe.category || "—"}</span></div>
      <div class="meta-item"><span class="meta-label">Ingredients</span><span class="meta-value">${recipe.ingredients.length}</span></div>
    </div>
    <div class="recipe-card-footer">
      <span class="diff-badge diff-medium">TheMealDB</span>
      <div style="display:flex;gap:8px">
        <button class="btn-view" onclick="openModal(${idx})">📖 View</button>
        <button class="btn-select ${isSelected ? "selected" : ""}" id="sel-btn-${idx}" onclick="toggleSelect(${idx})">
          ${isSelected ? "✓ Selected" : "+ Select"}
        </button>
      </div>
    </div>`;
  return card;
}

// ── Suggest Recipes ───────────────────────────────────────────────
async function suggestRecipes() {
  const btn = document.getElementById("btn-suggest");
  btn.disabled = true;
  document.getElementById("recipes-grid").innerHTML = "";

  const cuisines = getSelectedCuisines();
  const areas = cuisines
    .map((c) => CUISINE_MAP[c] || c)
    .filter(Boolean);
  if (!areas.length) areas.push("Indian");

  const mealType = document.getElementById("meal-type-select").value;
  const numWanted = parseInt(document.getElementById("num-suggest-select").value);

  showStatus("suggest-status", `Searching ${cuisines.join(", ")} recipes…`);

  try {
    // Collect stubs from each area (or Breakfast category for breakfast)
    let stubs = [];
    if (mealType === "breakfast") {
      const bMeals = await fetchMealsByCategory("Breakfast");
      stubs.push(...bMeals);
    } else {
      for (const area of areas) {
        const meals = await fetchMealsByArea(area);
        stubs.push(...meals);
      }
    }

    // Shuffle and deduplicate
    stubs = stubs
      .sort(() => Math.random() - 0.5)
      .filter(
        (m, i, arr) => arr.findIndex((x) => x.idMeal === m.idMeal) === i
      );

    showStatus(
      "suggest-status",
      `Found ${stubs.length} recipes — picking best matches…`
    );

    // Fetch details for a pool, then score by pantry overlap
    const poolSize = Math.min(numWanted * 5, 20, stubs.length);
    const pool = stubs.slice(0, poolSize);
    const details = (
      await Promise.all(pool.map((s) => fetchMealDetails(s.idMeal)))
    ).filter(Boolean);

    const scored = details
      .map((meal) => {
        const ings = extractIngredients(meal);
        return { meal, ings, score: pantryScore(ings, state.staples, state.groceries) };
      })
      .sort((a, b) => b.score - a.score);

    state.suggestedRecipes = scored
      .slice(0, numWanted)
      .map(({ meal, ings }) => mealToRecipe(meal, ings));

    hideStatus("suggest-status");
    const grid = document.getElementById("recipes-grid");
    state.suggestedRecipes.forEach((r, i) =>
      grid.appendChild(renderRecipeCard(r, i))
    );
  } catch (err) {
    showStatus("suggest-status", `Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
  }
}

// ── Recipe Selection ──────────────────────────────────────────────
function toggleSelect(idx) {
  const recipe = state.suggestedRecipes[idx];
  const ai = state.selectedRecipes.findIndex((r) => r.name === recipe.name);
  if (ai >= 0) state.selectedRecipes.splice(ai, 1);
  else state.selectedRecipes.push(recipe);
  const sel = state.selectedRecipes.some((r) => r.name === recipe.name);
  const btn = document.getElementById(`sel-btn-${idx}`);
  btn.textContent = sel ? "✓ Selected" : "+ Select";
  btn.className = `btn-select ${sel ? "selected" : ""}`;
}

// ── Recipe Modal ──────────────────────────────────────────────────
function openModal(idx) {
  const r = state.suggestedRecipes[idx];
  if (!r) return;
  const ingList = r.ingredients.map((i) => `<li>${i}</li>`).join("");
  const stepList = r.instructions.map((s) => `<li>${s}</li>`).join("");
  const ytLink = r.youtube
    ? `<a href="${r.youtube}" target="_blank" rel="noopener" style="color:var(--accent2)">▶ Watch on YouTube</a>`
    : "";
  document.getElementById("modal-content").innerHTML = `
    ${r.thumbnail ? `<img src="${r.thumbnail}" style="width:100%;border-radius:12px;margin-bottom:20px" alt="${r.name}" />` : ""}
    <div class="modal-recipe-name">${r.name}</div>
    <div class="modal-meta">
      <div class="meta-item"><span class="meta-label">Cuisine</span><span class="meta-value">${r.cuisine}</span></div>
      <div class="meta-item"><span class="meta-label">Category</span><span class="meta-value">${r.category || "—"}</span></div>
    </div>
    ${ytLink ? `<div style="margin-bottom:16px">${ytLink}</div>` : ""}
    ${ingList ? `<div class="modal-section"><h4>Ingredients</h4><ul>${ingList}</ul></div>` : ""}
    ${stepList ? `<div class="modal-section"><h4>Instructions</h4><ol>${stepList}</ol></div>` : ""}`;
  document.getElementById("recipe-modal").classList.remove("hidden");
}
function closeModal() {
  document.getElementById("recipe-modal").classList.add("hidden");
}
document.getElementById("recipe-modal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("recipe-modal")) closeModal();
});

// ── Week Planner ──────────────────────────────────────────────────
async function planWeek() {
  const btn = document.getElementById("btn-plan-week");
  btn.disabled = true;
  showStatus("week-status", "Fetching recipes from TheMealDB…");
  document.getElementById("week-grid").classList.add("hidden");

  const cuisines = getSelectedCuisines();
  const areas = cuisines.map((c) => CUISINE_MAP[c] || c).filter(Boolean);
  if (!areas.length) areas.push("Indian", "American");

  try {
    // Fetch a pool of meals for each area
    const poolMap = {};
    for (const area of areas) {
      const meals = await fetchMealsByArea(area);
      poolMap[area] = meals.sort(() => Math.random() - 0.5).slice(0, 12);
    }

    // Breakfast pool
    const bfMeals = (await fetchMealsByCategory("Breakfast"))
      .sort(() => Math.random() - 0.5)
      .slice(0, 14);

    const days = [
      "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
    ];

    showStatus("week-status", "Fetching meal details…");

    const allStubs = Object.values(poolMap).flat();
    const bfStubs = bfMeals;

    // We need 7 breakfasts + 7 lunches + 7 dinners
    // Fetch details for enough meals
    const lunchDinnerPool = allStubs
      .filter((m, i, a) => a.findIndex((x) => x.idMeal === m.idMeal) === i)
      .slice(0, 20);
    const bfPool = bfStubs.slice(0, 10);

    const [ldDetails, bfDetails] = await Promise.all([
      Promise.all(lunchDinnerPool.map((s) => fetchMealDetails(s.idMeal))),
      Promise.all(bfPool.map((s) => fetchMealDetails(s.idMeal))),
    ]);

    const ldRecipes = ldDetails.filter(Boolean).map((m) =>
      mealToRecipe(m, extractIngredients(m))
    );
    const bfRecipes = bfDetails.filter(Boolean).map((m) =>
      mealToRecipe(m, extractIngredients(m))
    );

    // Fill 7-day plan
    const plan = days.map((day, i) => ({
      day,
      breakfast: bfRecipes[i % bfRecipes.length] || ldRecipes[0],
      lunch: ldRecipes[i % ldRecipes.length],
      dinner: ldRecipes[(i + Math.floor(ldRecipes.length / 2)) % ldRecipes.length],
    }));

    state.weekPlan = plan;
    hideStatus("week-status");
    renderWeekGrid(plan);
  } catch (err) {
    showStatus("week-status", `Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
  }
}

function renderWeekGrid(days) {
  const grid = document.getElementById("week-grid");
  grid.classList.remove("hidden");
  grid.innerHTML = `
    <table class="week-table">
      <thead>
        <tr>
          <th>Day</th>
          <th>🌅 Breakfast</th>
          <th>☀️ Lunch</th>
          <th>🌙 Dinner</th>
        </tr>
      </thead>
      <tbody id="week-tbody"></tbody>
    </table>`;
  const tbody = document.getElementById("week-tbody");
  days.forEach((day) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><div class="day-header">${day.day}</div></td>
      ${["breakfast", "lunch", "dinner"].map((slot) => {
        const m = day[slot];
        if (!m) return "<td>—</td>";
        return `<td onclick='addFromWeek(${JSON.stringify(JSON.stringify(m))})' title="Click to add to grocery list">
          ${m.thumbnail ? `<img src="${m.thumbnail}/tiny" style="width:60px;height:45px;object-fit:cover;border-radius:6px;float:right;margin-left:8px" />` : ""}
          <div class="week-meal-name">${m.name}</div>
          <div class="week-meal-cuisine">${m.cuisine}</div>
          <div class="week-meal-time">${m.ingredients.length} ingredients</div>
        </td>`;
      }).join("")}`;
    tbody.appendChild(tr);
  });
}

function addFromWeek(jsonStr) {
  try {
    const meal = JSON.parse(jsonStr);
    if (!state.selectedRecipes.find((r) => r.name === meal.name)) {
      state.selectedRecipes.push(meal);
    }
    switchTab("grocery");
  } catch (_) {}
}

// ── Selected Recipes ──────────────────────────────────────────────
function renderSelectedRecipes() {
  const container = document.getElementById("selected-recipes-list");
  if (!state.selectedRecipes.length) {
    container.innerHTML = `<p class="empty-msg">No recipes selected yet. <a href="#" onclick="switchTab('suggest')">Suggest some recipes first →</a></p>`;
    return;
  }
  container.innerHTML = "";
  state.selectedRecipes.forEach((r, i) => {
    const row = document.createElement("div");
    row.className = "selected-recipe-item";
    row.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px">
        ${r.thumbnail ? `<img src="${r.thumbnail}/tiny" style="width:48px;height:36px;object-fit:cover;border-radius:6px" />` : ""}
        <div>
          <div class="selected-recipe-name">${r.name}</div>
          <div class="selected-recipe-cuisine">${r.cuisine}</div>
        </div>
      </div>
      <button class="btn-remove-recipe" onclick="removeSelected(${i})" title="Remove">✕</button>`;
    container.appendChild(row);
  });
}
function removeSelected(idx) {
  state.selectedRecipes.splice(idx, 1);
  renderSelectedRecipes();
}

// ── Grocery List (computed locally, zero API calls) ───────────────
const CATEGORY_KEYWORDS = {
  "🥦 Produce": ["tomato","onion","garlic","ginger","potato","carrot","spinach","pepper","lemon","lime","cucumber","celery","mushroom","zucchini","broccoli","cabbage","lettuce","herb","coriander","parsley","basil","mint","spring onion","scallion","chilli","chili","shallot","leek"],
  "🥩 Meat & Seafood": ["chicken","beef","lamb","pork","fish","salmon","tuna","prawn","shrimp","turkey","mince","sausage","bacon","steak","mutton"],
  "🧀 Dairy & Eggs": ["milk","cream","butter","cheese","yogurt","yoghurt","egg","paneer","ghee","curd"],
  "🌾 Grains & Pasta": ["rice","pasta","noodle","flour","bread","oat","quinoa","couscous","barley","lentil","dal","chickpea","bean"],
  "🥫 Pantry & Sauces": ["oil","sauce","soy","vinegar","stock","broth","coconut milk","tomato paste","paste","ketchup","mustard","honey","sugar","syrup","canned","tin"],
  "🌶️ Spices & Herbs": ["salt","pepper","cumin","turmeric","garam masala","paprika","cinnamon","cardamom","clove","bay leaf","oregano","thyme","rosemary","curry","masala","chilli powder","chili powder","nutmeg","saffron","anise"],
  "🧃 Other": [],
};

function categoriseItem(name) {
  const n = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => n.includes(k))) return cat;
  }
  return "🧃 Other";
}

function isInPantry(ingredientName, staples, groceries) {
  const n = ingredientName.toLowerCase();
  const have = [...staples, ...groceries].map((s) => s.toLowerCase());
  return have.some((h) => n.includes(h) || h.includes(n));
}

function generateGroceryList() {
  if (!state.selectedRecipes.length) {
    alert("Please select at least one recipe first.");
    return;
  }

  // Collect all ingredients across selected recipes
  const seen = new Set();
  const toBuy = [];

  for (const recipe of state.selectedRecipes) {
    for (const ingStr of recipe.ingredients || []) {
      // ingStr format: "2 cups Chicken" or "Olive Oil"
      // Extract just the name (skip leading numbers/units)
      const namePart = ingStr.replace(/^[\d\s\/.,]+/, "").replace(/\b(cup|cups|tbsp|tsp|tablespoon|teaspoon|gram|kg|g|ml|oz|lb|piece|pinch|handful|bunch|clove|cloves|large|medium|small|to taste)\b/gi, "").trim();
      const key = namePart.toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);

      if (!isInPantry(namePart, state.staples, state.groceries)) {
        toBuy.push({ name: namePart, amount: ingStr.replace(namePart, "").trim(), raw: ingStr });
      }
    }
  }

  // Group by category
  const groups = {};
  for (const item of toBuy) {
    const cat = categoriseItem(item.name);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  }

  renderGroceryList(groups, toBuy.length);
}

function renderGroceryList(groups, totalItems) {
  const out = document.getElementById("grocery-output");
  out.classList.remove("hidden");
  out.innerHTML = `
    <div class="grocery-summary">
      <span><strong>${totalItems}</strong> items to buy</span>
      <button class="grocery-print-btn" onclick="window.print()">🖨️ Print List</button>
    </div>`;

  for (const [cat, items] of Object.entries(groups)) {
    if (!items.length) continue;
    const div = document.createElement("div");
    div.className = "grocery-category";
    div.innerHTML = `<h3>${cat}</h3>`;
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "grocery-item";
      row.innerHTML = `
        <input type="checkbox" class="grocery-checkbox" onchange="this.closest('.grocery-item').classList.toggle('checked',this.checked)" />
        <span class="grocery-item-name">${item.name}</span>
        <span class="grocery-item-amount">${item.amount}</span>`;
      div.appendChild(row);
    });
    out.appendChild(div);
  }

  document.getElementById("grocery-status").classList.add("hidden");
}

// Wire up generate button
document.getElementById("btn-gen-grocery").addEventListener("click", () => {
  document.getElementById("grocery-output").classList.add("hidden");
  generateGroceryList();
});
