import os
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
# --- Configuration ---
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "final_model.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.joblib")

# Define the expected feature columns in the correct order (excluding 'co2')
EXPECTED_FEATURES = [
    "temp_ampent",
    "temp_object",
    "pressure",
    "humidity",
    "gas_res",
    "nh3_raw",
    "co_raw",
    "Tvoc",
    "no2_raw"
]

# --- Initialize Flask App ---
app = Flask(__name__)
CORS(app)
# --- Load Model and Scaler ---
try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print(f"Model loaded from {MODEL_PATH}")
    print(f"Scaler loaded from {SCALER_PATH}")
except FileNotFoundError as e:
    print(f"Error loading model or scaler: {e}")
    print(
        "Ensure 'final_model.joblib' and 'scaler.joblib' are in the 'models' directory."
    )
    model = None
    scaler = None
except Exception as e:
    print(f"An unexpected error occurred during loading: {e}")
    model = None
    scaler = None

# --- Define Prediction Endpoint ---
@app.route("/predict", methods=["POST"])
def predict():
    """
    Receives input features as JSON, preprocesses them,
    makes a prediction using the loaded model, and returns the prediction.
    """
    if model is None or scaler is None:
        return jsonify({"error": "Model or scaler not loaded"}), 500

    # Get JSON data from the request
    try:
        input_data = request.get_json()
        if not input_data:
            return jsonify({"error": "No input data received"}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to parse JSON: {str(e)}"}), 400

    # --- Data Validation and Preparation ---
    # Check if all expected features are present
    missing_features = [
        feature for feature in EXPECTED_FEATURES if feature not in input_data
    ]
    if missing_features:
        return (
            jsonify(
                {
                    "error": "Missing required features",
                    "missing": missing_features,
                }
            ),
            400,
        )

    # Ensure data types are numeric (basic check)
    try:
        # Create a DataFrame with the correct column order
        input_df = pd.DataFrame([input_data])[EXPECTED_FEATURES]
        # Convert to numeric, errors will raise exception
        input_df = input_df.apply(pd.to_numeric)
    except (ValueError, TypeError) as e:
        return (
            jsonify(
                {
                    "error": "Invalid data type for one or more features. All features must be numeric.",
                    "details": str(e),
                }
            ),
            400,
        )

    # --- Preprocessing ---
    try:
        # Scale the input data using the loaded scaler
        input_scaled = scaler.transform(input_df)
    except Exception as e:
        print(f"Error during scaling: {e}")
        return (
            jsonify(
                {
                    "error": "Failed to scale input data. Check feature count and types.",
                    "details": str(e),
                }
            ),
            500,
        )

    # --- Prediction ---
    try:
        prediction = model.predict(input_scaled)
        output_prediction = prediction[0]
    except Exception as e:
        print(f"Error during prediction: {e}")
        return (
            jsonify(
                {"error": "Failed to make prediction", "details": str(e)}
            ),
            500,
        )

    # --- Return Prediction ---
    return jsonify({"prediction": output_prediction})

# --- Run the Flask App ---
if __name__ == "__main__":
    if model and scaler:
        app.run(host="0.0.0.0", port=5000, debug=True)
    else:
        print("Flask server not started due to loading errors.")
