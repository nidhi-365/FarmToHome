import pickle
with open("price_model.pkl", "rb") as f:
    price_model, le_veg, le_season, le_disaster, le_condition = pickle.load(f)

print("Vegetables:", list(le_veg.classes_))
print("Seasons:", list(le_season.classes_))
print("Disasters:", list(le_disaster.classes_))
print("Conditions:", list(le_condition.classes_))
