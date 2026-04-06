from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
app = Flask(__name__)
CORS(app) 
# -------- LOAD --------
with open("recipe_data.pkl", "rb") as f:
    recipes = pickle.load(f)

with open("fertilizer_model.pkl", "rb") as f:
    fert_model = pickle.load(f)

with open("price_model.pkl", "rb") as f:
    price_model, le_veg, le_season, le_disaster, le_condition = pickle.load(f)

# -------- RECIPE --------
@app.route('/recipe', methods=['POST'])
def recipe():
    data = request.json
    items = [i.lower().strip() for i in data['items']]
    
    result = []
    
    for r in recipes:
        score = 0
        missing = []
        
        for ing in r["ingredients"]:
            if ing in items:
                score += 1
            else:
                missing.append(ing)
        
        result.append({
            "name": r["name"],
            "score": score,
            "missing": missing
        })
    
    result.sort(key=lambda x: x["score"], reverse=True)
    
    return jsonify(result[:5])

# -------- FERTILIZER --------
@app.route('/fertilizer', methods=['POST'])
def fertilizer():
    data = request.json
    
    pred = fert_model.predict([[data['nitrogen'], data['phosphorus'], data['potassium']]])
    
    return jsonify({"fertilizer": pred[0]})

# -------- PRICE --------
@app.route('/price', methods=['POST'])
def price():
    data = request.json
    
    veg = data['vegetable'].lower().strip()
    season = data['season'].lower().strip()
    month_input = data['month']
    temp = float(data['temp'])
    disaster = data['disaster'].lower().strip()
    condition = data['condition'].lower().strip()

    # ---- FIX 1: month conversion ----
    month_map = {
        "jan": 1, "feb": 2, "mar": 3, "apr": 4,
        "may": 5, "jun": 6, "jul": 7, "aug": 8,
        "sep": 9, "oct": 10, "nov": 11, "dec": 12
    }

    if isinstance(month_input, str):
        month = month_map.get(month_input.lower())
    else:
        month = int(month_input)

    if month is None:
        return jsonify({"error": "invalid month"})

    # ---- FIX 2: unknown checks ----
    if veg not in le_veg.classes_:
        return jsonify({"error": "unknown vegetable"})
    if season not in le_season.classes_:
        return jsonify({"error": "unknown season"})
    if disaster not in le_disaster.classes_:
        return jsonify({"error": "invalid disaster value"})
    if condition not in le_condition.classes_:
        return jsonify({"error": "invalid condition value"})

    # ---- ENCODE ----
    veg = le_veg.transform([veg])[0]
    season = le_season.transform([season])[0]
    disaster = le_disaster.transform([disaster])[0]
    condition = le_condition.transform([condition])[0]

    # ---- PREDICT ----
    pred = price_model.predict([[veg, season, month, temp, disaster, condition]])
    
    return jsonify({"predicted_price": float(pred[0])})

app.run(debug=True,port=5001)