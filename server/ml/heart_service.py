"""
Heart Disease Risk Prediction Microservice
------------------------------------------
Wraps heart_model.pkl + scaler.pkl and exposes a single REST endpoint:

  POST /predict
  Body (JSON):
    {
      "male":            1,
      "age":             55,
      "education":       2,
      "currentSmoker":   0,
      "cigsPerDay":      0,
      "BPMeds":          1,
      "prevalentStroke": 0,
      "prevalentHyp":    1,
      "diabetes":        0,
      "totChol":         230,
      "sysBP":           140,
      "diaBP":           90,
      "BMI":             27.5,
      "heartRate":       80,
      "glucose":         85
    }

  Response:
    { "risk": 1, "label": "High Risk" }   or
    { "risk": 0, "label": "Low Risk"  }

Run:  python heart_service.py
"""

import os
import pickle
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model  = pickle.load(open(os.path.join(BASE_DIR, "heart_model.pkl"), "rb"))
scaler = pickle.load(open(os.path.join(BASE_DIR, "scaler.pkl"),      "rb"))

app = Flask(__name__)
CORS(app)                          # allow calls from the Node server

FEATURES = [
    "male", "age", "education", "currentSmoker",
    "cigsPerDay", "BPMeds", "prevalentStroke",
    "prevalentHyp", "diabetes", "totChol",
    "sysBP", "diaBP", "BMI", "heartRate", "glucose",
]


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)

    # Validate all required fields are present
    missing = [f for f in FEATURES if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        values = [[float(data[f]) for f in FEATURES]]
        input_arr    = np.array(values)
        input_scaled = scaler.transform(input_arr)
        prediction   = int(model.predict(input_scaled)[0])

        # Return probability if the model supports it
        proba = None
        if hasattr(model, "predict_proba"):
            proba = round(float(model.predict_proba(input_scaled)[0][1]) * 100, 1)

        return jsonify({
            "risk":        prediction,
            "label":       "High Risk" if prediction == 1 else "Low Risk",
            "probability": proba,        # % chance of high risk (may be null)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("ML_PORT", 8000))
    print(f"Heart risk microservice running on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
