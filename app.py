import os
import json
from flask import Flask, request, jsonify, render_template, Response, stream_with_context
import anthropic
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/suggest-recipes", methods=["POST"])
def suggest_recipes():
    data = request.get_json()
    staples = data.get("staples", [])
    groceries = data.get("groceries", [])
    cuisines = data.get("cuisines", [])
    meal_type = data.get("meal_type", "any")
    num_suggestions = data.get("num_suggestions", 3)

    staples_str = ", ".join(staples) if staples else "none specified"
    groceries_str = ", ".join(groceries) if groceries else "none specified"
    cuisines_str = ", ".join(cuisines) if cuisines else "any cuisine"

    prompt = f"""You are a creative chef and meal planning expert. Suggest {num_suggestions} recipes for {meal_type} using the available ingredients.

Available staples: {staples_str}
Available groceries: {groceries_str}
Preferred cuisines: {cuisines_str}

For each recipe, provide a JSON object with these fields:
- name: Recipe name
- cuisine: Cuisine type (e.g., Indian, Western, Iranian, Chinese, etc.)
- prep_time: Preparation time in minutes
- cook_time: Cooking time in minutes
- servings: Number of servings
- difficulty: Easy/Medium/Hard
- description: 1-2 sentence description
- ingredients: List of ingredients with amounts (mark items not in the available list with "(buy)")
- instructions: List of step-by-step cooking instructions

Return ONLY a valid JSON array of recipe objects, no other text."""

    def generate():
        full_response = ""
        with client.messages.stream(
            model="claude-opus-4-8",
            max_tokens=4000,
            thinking={"type": "adaptive"},
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            for text in stream.text_stream:
                full_response += text
                yield f"data: {json.dumps({'chunk': text})}\n\n"

        # Send the complete response at the end
        yield f"data: {json.dumps({'done': True, 'full': full_response})}\n\n"

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.route("/api/generate-grocery-list", methods=["POST"])
def generate_grocery_list():
    data = request.get_json()
    recipes = data.get("recipes", [])
    staples = data.get("staples", [])
    groceries = data.get("groceries", [])

    if not recipes:
        return jsonify({"error": "No recipes provided"}), 400

    recipe_names = [r.get("name", r) if isinstance(r, dict) else r for r in recipes]
    recipe_ingredients = []
    for r in recipes:
        if isinstance(r, dict) and "ingredients" in r:
            recipe_ingredients.append(f"\n{r['name']}:\n" + "\n".join(f"  - {i}" for i in r["ingredients"]))

    ingredients_detail = "".join(recipe_ingredients) if recipe_ingredients else ""
    staples_str = ", ".join(staples) if staples else "none"
    groceries_str = ", ".join(groceries) if groceries else "none"

    prompt = f"""You are a helpful meal prep assistant. Create a consolidated grocery shopping checklist for the following recipes.

Recipes to prepare: {", ".join(recipe_names)}
{f"Recipe ingredients:{ingredients_detail}" if ingredients_detail else ""}

Items already available at home:
- Staples: {staples_str}
- Fresh groceries: {groceries_str}

Create a consolidated grocery list of items that need to be purchased (not already available).
Group items by category (Produce, Dairy, Meat/Protein, Pantry, Spices, etc.).

Return ONLY a valid JSON object with this structure:
{{
  "categories": [
    {{
      "name": "Category Name",
      "items": [
        {{"name": "Item name", "amount": "quantity/amount", "notes": "optional notes"}}
      ]
    }}
  ],
  "total_items": number
}}"""

    def generate():
        full_response = ""
        with client.messages.stream(
            model="claude-opus-4-8",
            max_tokens=2000,
            thinking={"type": "adaptive"},
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            for text in stream.text_stream:
                full_response += text
                yield f"data: {json.dumps({'chunk': text})}\n\n"

        yield f"data: {json.dumps({'done': True, 'full': full_response})}\n\n"

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.route("/api/plan-week", methods=["POST"])
def plan_week():
    data = request.get_json()
    staples = data.get("staples", [])
    groceries = data.get("groceries", [])
    cuisines = data.get("cuisines", [])
    num_people = data.get("num_people", 2)
    dietary = data.get("dietary", [])

    staples_str = ", ".join(staples) if staples else "none specified"
    groceries_str = ", ".join(groceries) if groceries else "none specified"
    cuisines_str = ", ".join(cuisines) if cuisines else "varied (mix of cuisines)"
    dietary_str = ", ".join(dietary) if dietary else "none"

    prompt = f"""You are an expert meal planner. Create a complete 7-day meal plan for {num_people} people.

Available staples: {staples_str}
Available groceries: {groceries_str}
Preferred cuisines: {cuisines_str}
Dietary restrictions: {dietary_str}

Create a balanced, varied weekly meal plan with breakfast, lunch, and dinner for each day.
Vary the cuisines throughout the week based on preferences.

Return ONLY a valid JSON object with this structure:
{{
  "week_plan": [
    {{
      "day": "Monday",
      "breakfast": {{"name": "Recipe Name", "cuisine": "type", "prep_time": 15, "description": "brief description"}},
      "lunch": {{"name": "Recipe Name", "cuisine": "type", "prep_time": 20, "description": "brief description"}},
      "dinner": {{"name": "Recipe Name", "cuisine": "type", "prep_time": 30, "description": "brief description"}}
    }}
  ]
}}
Include all 7 days: Monday through Sunday."""

    def generate():
        full_response = ""
        with client.messages.stream(
            model="claude-opus-4-8",
            max_tokens=3000,
            thinking={"type": "adaptive"},
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            for text in stream.text_stream:
                full_response += text
                yield f"data: {json.dumps({'chunk': text})}\n\n"

        yield f"data: {json.dumps({'done': True, 'full': full_response})}\n\n"

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
