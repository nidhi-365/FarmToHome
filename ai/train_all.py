import pandas as pd
import pickle
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder

# -------- RECIPE --------
df = pd.read_csv("indian_food.csv")
df = df[df['diet'] == 'vegetarian']

recipes = []

for i in range(len(df)):
    name = df.iloc[i]['name']
    ing = str(df.iloc[i]['ingredients']).lower().split(',')
    
    clean_ing = []
    for item in ing:
        clean_ing.append(item.strip())
    
    recipes.append({
        "name": name,
        "ingredients": clean_ing
    })

with open("recipe_data.pkl", "wb") as f:
    pickle.dump(recipes, f)


# -------- FERTILIZER --------
fert_data = pd.DataFrame({
    "nitrogen": [10, 20, 30, 40, 50],
    "phosphorus": [5, 10, 15, 20, 25],
    "potassium": [5, 10, 15, 20, 25],
    "fertilizer": ["Urea", "DAP", "Urea", "Compost", "DAP"]
})

X = fert_data[["nitrogen", "phosphorus", "potassium"]]
y = fert_data["fertilizer"]

fert_model = DecisionTreeClassifier()
fert_model.fit(X, y)

with open("fertilizer_model.pkl", "wb") as f:
    pickle.dump(fert_model, f)


# -------- PRICE --------
df = pd.read_csv("Vegetable_market.csv")
df = df.dropna()

# ---- FIX 1: clean text ----
df['Vegetable'] = df['Vegetable'].str.lower().str.strip()
df['Season'] = df['Season'].str.lower().str.strip()
df['Deasaster Happen in last 3month'] = df['Deasaster Happen in last 3month'].str.lower().str.strip()
df['Vegetable condition'] = df['Vegetable condition'].str.lower().str.strip()

# ---- FIX 2: convert month ----
month_map = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4,
    "may": 5, "jun": 6, "jul": 7, "aug": 8,
    "sep": 9, "oct": 10, "nov": 11, "dec": 12
}

df['Month'] = df['Month'].astype(str).str.lower().map(month_map)

# remove rows where mapping failed
df = df.dropna()

# ---- ENCODING ----
le_veg = LabelEncoder()
le_season = LabelEncoder()
le_disaster = LabelEncoder()
le_condition = LabelEncoder()

df['veg'] = le_veg.fit_transform(df['Vegetable'])
df['season'] = le_season.fit_transform(df['Season'])
df['disaster'] = le_disaster.fit_transform(df['Deasaster Happen in last 3month'])
df['condition'] = le_condition.fit_transform(df['Vegetable condition'])

# ---- FEATURES ----
X = df[['veg', 'season', 'Month', 'Temp', 'disaster', 'condition']]
y = df['Price per kg']

price_model = RandomForestRegressor()
price_model.fit(X, y)

with open("price_model.pkl", "wb") as f:
    pickle.dump((price_model, le_veg, le_season, le_disaster, le_condition), f)

print("ALL MODELS READY")