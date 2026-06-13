// ── State ─────────────────────────────────────────────────────────
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

// ── Tag Input Logic ───────────────────────────────────────────────
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
    tag.querySelector(".tag-remove").onclick = () => removeTag(list, val, cloudId);
    cloud.appendChild(tag);
  });
}

function setupTagInput(inputId, btnId, list, cloudId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  btn.onclick = () => { addTag(list, input.value, cloudId); input.value = ""; };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { addTag(list, input.value, cloudId); input.value = ""; }
  });
}

setupTagInput("staple-input", "add-staple", "staples", "staples-cloud");
setupTagInput("grocery-input", "add-grocery", "groceries", "groceries-cloud");

document.querySelectorAll(".quick-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const list = btn.dataset.list;
    const cloudId = list === "staples" ? "staples-cloud" : "groceries-cloud";
    addTag(list, btn.dataset.val, cloudId);
  });
});

// ── Get Selected Cuisines ─────────────────────────────────────────
function getSelectedCuisines() {
  return Array.from(document.querySelectorAll("#cuisine-grid input:checked")).map((el) => el.value);
}

// ── Status Bar ────────────────────────────────────────────────────
function showStatus(id, msg, type = "thinking") {
  const el = document.getElementById(id);
  el.classList.remove("hidden", "error");
  el.classList.add(type);
  el.innerHTML = type === "thinking"
    ? `<div class="spinner"></div><span>${msg}</span>`
    : `<span>${msg}</span>`;
}

function hideStatus(id) {
  document.getElementById(id).classList.add("hidden");
}

// ── Parse JSON from Claude response ──────────────────────────────
function extractJSON(text) {
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  // Try direct parse first (handles both arrays and objects cleanly)
  try { return JSON.parse(cleaned); } catch (_) {}
  // Fall back: find outermost object first, then array
  const objMatch = cleaned.match(/(\{[\s\S]*\})/);
  const arrMatch = cleaned.match(/(\[[\s\S]*\])/);
  const raw = (objMatch || arrMatch || [])[1];
  if (!raw) throw new Error("No JSON found in response");
  return JSON.parse(raw);
}

// ── SSE Streaming Helper ──────────────────────────────────────────
async function streamRequest(endpoint, payload, onDone) {
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = JSON.parse(line.slice(6));
      if (payload.done) { onDone(payload.full); return; }
    }
  }
}

// ── Recipe Card Renderer ──────────────────────────────────────────
function diffClass(diff) {
  if (!diff) return "";
  const d = diff.toLowerCase();
  if (d === "easy") return "diff-easy";
  if (d === "hard") return "diff-hard";
  return "diff-medium";
}

function renderRecipeCard(recipe, idx) {
  const isSelected = state.selectedRecipes.some((r) => r.name === recipe.name);
  const card = document.createElement("div");
  card.className = "recipe-card";
  card.style.animationDelay = `${idx * 0.08}s`;
  card.innerHTML = `
    <div class="recipe-card-header">
      <div class="recipe-card-cuisine">${recipe.cuisine || "International"}</div>
      <div class="recipe-card-name">${recipe.name}</div>
      <div class="recipe-card-desc">${recipe.description || ""}</div>
    </div>
    <div class="recipe-card-meta">
      <div class="meta-item"><span class="meta-label">Prep</span><span class="meta-value">${recipe.prep_time ?? "?"} min</span></div>
      <div class="meta-item"><span class="meta-label">Cook</span><span class="meta-value">${recipe.cook_time ?? "?"} min</span></div>
      <div class="meta-item"><span class="meta-label">Servings</span><span class="meta-value">${recipe.servings ?? "?"}</span></div>
    </div>
    <div class="recipe-card-footer">
      <span class="diff-badge ${diffClass(recipe.difficulty)}">${recipe.difficulty || "Medium"}</span>
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
  showStatus("suggest-status", "Claude is thinking about recipes for you…");
  document.getElementById("recipes-grid").innerHTML = "";

  const cuisines = getSelectedCuisines();
  if (cuisines.length === 0) cuisines.push("any cuisine");

  try {
    await streamRequest(
      "/api/suggest-recipes",
      {
        staples: state.staples,
        groceries: state.groceries,
        cuisines,
        meal_type: document.getElementById("meal-type-select").value,
        num_suggestions: parseInt(document.getElementById("num-suggest-select").value),
      },
      (full) => {
        hideStatus("suggest-status");
        let recipes;
        try { recipes = extractJSON(full); }
        catch (e) { showStatus("suggest-status", "Could not parse recipes. Please try again.", "error"); return; }

        state.suggestedRecipes = Array.isArray(recipes) ? recipes : [recipes];
        const grid = document.getElementById("recipes-grid");
        state.suggestedRecipes.forEach((r, i) => grid.appendChild(renderRecipeCard(r, i)));
      }
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
  const alreadyIdx = state.selectedRecipes.findIndex((r) => r.name === recipe.name);
  if (alreadyIdx >= 0) {
    state.selectedRecipes.splice(alreadyIdx, 1);
  } else {
    state.selectedRecipes.push(recipe);
  }
  const btn = document.getElementById(`sel-btn-${idx}`);
  const selected = state.selectedRecipes.some((r) => r.name === recipe.name);
  btn.textContent = selected ? "✓ Selected" : "+ Select";
  btn.className = `btn-select ${selected ? "selected" : ""}`;
}

// ── Recipe Modal ──────────────────────────────────────────────────
function openModal(idx) {
  const r = state.suggestedRecipes[idx];
  if (!r) return;
  const ingList = (r.ingredients || []).map((i) => `<li>${i}</li>`).join("");
  const stepList = (r.instructions || []).map((s) => `<li>${s}</li>`).join("");
  document.getElementById("modal-content").innerHTML = `
    <div class="modal-recipe-name">${r.name}</div>
    <div class="modal-meta">
      <div class="meta-item"><span class="meta-label">Cuisine</span><span class="meta-value">${r.cuisine || "—"}</span></div>
      <div class="meta-item"><span class="meta-label">Prep</span><span class="meta-value">${r.prep_time ?? "?"} min</span></div>
      <div class="meta-item"><span class="meta-label">Cook</span><span class="meta-value">${r.cook_time ?? "?"} min</span></div>
      <div class="meta-item"><span class="meta-label">Servings</span><span class="meta-value">${r.servings ?? "?"}</span></div>
      <div class="meta-item"><span class="meta-label">Difficulty</span><span class="meta-value">${r.difficulty || "—"}</span></div>
    </div>
    <div class="modal-section"><p style="color:var(--text-muted);font-size:14px">${r.description || ""}</p></div>
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
  showStatus("week-status", "Claude is crafting your weekly meal plan…");
  document.getElementById("week-grid").classList.add("hidden");

  const cuisines = getSelectedCuisines();
  const dietaryEl = document.getElementById("dietary-select");
  const dietary = Array.from(dietaryEl.selectedOptions).map((o) => o.value);

  try {
    await streamRequest(
      "/api/plan-week",
      {
        staples: state.staples,
        groceries: state.groceries,
        cuisines,
        num_people: parseInt(document.getElementById("num-people-select").value),
        dietary,
      },
      (full) => {
        hideStatus("week-status");
        let data;
        try { data = extractJSON(full); }
        catch (e) { showStatus("week-status", "Could not parse the week plan. Please try again.", "error"); return; }

        const plan = data.week_plan || data;
        state.weekPlan = plan;
        renderWeekGrid(Array.isArray(plan) ? plan : []);
      }
    );
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
      ${["breakfast", "lunch", "dinner"].map((meal) => {
        const m = day[meal];
        if (!m) return "<td>—</td>";
        return `<td onclick="addFromWeek(${JSON.stringify(JSON.stringify(m))})">
          <div class="week-meal-name">${m.name}</div>
          <div class="week-meal-cuisine">${m.cuisine || ""}</div>
          <div class="week-meal-time">⏱ ${m.prep_time ?? "?"}min prep</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${(m.description || "").slice(0,60)}${m.description && m.description.length > 60 ? "…" : ""}</div>
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

// ── Selected Recipes (Grocery tab) ───────────────────────────────
function renderSelectedRecipes() {
  const container = document.getElementById("selected-recipes-list");
  if (state.selectedRecipes.length === 0) {
    container.innerHTML = `<p class="empty-msg">No recipes selected yet. <a href="#" onclick="switchTab('suggest')">Suggest some recipes first →</a></p>`;
    return;
  }
  container.innerHTML = "";
  state.selectedRecipes.forEach((r, i) => {
    const row = document.createElement("div");
    row.className = "selected-recipe-item";
    row.innerHTML = `
      <div>
        <div class="selected-recipe-name">${r.name}</div>
        <div class="selected-recipe-cuisine">${r.cuisine || ""}</div>
      </div>
      <button class="btn-remove-recipe" onclick="removeSelected(${i})" title="Remove">✕</button>`;
    container.appendChild(row);
  });
}

function removeSelected(idx) {
  state.selectedRecipes.splice(idx, 1);
  renderSelectedRecipes();
}

// ── Grocery List ──────────────────────────────────────────────────
async function generateGroceryList() {
  if (state.selectedRecipes.length === 0) {
    alert("Please select at least one recipe first.");
    return;
  }
  const btn = document.getElementById("btn-gen-grocery");
  btn.disabled = true;
  showStatus("grocery-status", "Generating your shopping list…");
  document.getElementById("grocery-output").classList.add("hidden");

  try {
    await streamRequest(
      "/api/generate-grocery-list",
      {
        recipes: state.selectedRecipes,
        staples: state.staples,
        groceries: state.groceries,
      },
      (full) => {
        hideStatus("grocery-status");
        let data;
        try { data = extractJSON(full); }
        catch (e) { showStatus("grocery-status", "Could not parse the grocery list. Please try again.", "error"); return; }

        renderGroceryList(data);
      }
    );
  } catch (err) {
    showStatus("grocery-status", `Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
  }
}

const categoryIcons = {
  produce: "🥦", vegetables: "🥦", fruits: "🍎", "meat": "🥩", "meat/protein": "🥩",
  protein: "🥩", dairy: "🧀", pantry: "🥫", spices: "🌶️", bakery: "🍞",
  grains: "🌾", beverages: "🧃", frozen: "🧊", condiments: "🍯", other: "🛒",
};

function getCatIcon(name) {
  const k = (name || "").toLowerCase();
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (k.includes(key)) return icon;
  }
  return "🛒";
}

function renderGroceryList(data) {
  const out = document.getElementById("grocery-output");
  out.classList.remove("hidden");
  out.innerHTML = `
    <div class="grocery-summary">
      <span><strong>${data.total_items ?? "?"}</strong> items to buy</span>
      <button class="grocery-print-btn" onclick="window.print()">🖨️ Print List</button>
    </div>`;

  (data.categories || []).forEach((cat) => {
    const div = document.createElement("div");
    div.className = "grocery-category";
    div.innerHTML = `<h3>${getCatIcon(cat.name)} ${cat.name}</h3>`;
    (cat.items || []).forEach((item) => {
      const row = document.createElement("div");
      row.className = "grocery-item";
      row.innerHTML = `
        <input type="checkbox" class="grocery-checkbox" onchange="this.closest('.grocery-item').classList.toggle('checked', this.checked)"/>
        <span class="grocery-item-name">${item.name}</span>
        <span class="grocery-item-amount">${item.amount || ""}</span>
        ${item.notes ? `<span class="grocery-item-notes">${item.notes}</span>` : ""}`;
      div.appendChild(row);
    });
    out.appendChild(div);
  });
}
