"""
Human Development Index (HDI) Prediction - Flask Web Application
Epic 8: Loads the trained Linear Regression model (HDI.pkl), serves an HTML
form for the four indicators, and returns the predicted HDI score + tier.
"""
import os
import pickle

import numpy as np
import pandas as pd
from flask import Flask, render_template, request

# ---------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------
app = Flask(__name__)

# Path to the serialized model (sits next to app.py)
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "HDI.pkl")

# Feature names must match the columns the model was trained on
FEATURE_COLUMNS = [
    "Life expectancy",
    "Mean years of schooling",
    "Expected years of schooling",
    "Gross National Income (GNI) per capita",
]


def load_model():
    """Load the pickled Linear Regression model."""
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    return model


def classify_hdi(hdi_value):
    """Map a numeric HDI score to its UN development tier."""
    if hdi_value >= 0.8:
        return "Very High Human Development"
    elif hdi_value >= 0.7:
        return "High Human Development"
    elif hdi_value >= 0.55:
        return "Medium Human Development"
    else:
        return "Low Human Development"


# Load the model once at startup
model = load_model()


# ---------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------
@app.route("/")
def home():
    """Render the input form."""
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    """Read form inputs, run prediction, render the result page."""
    try:
        life_expectancy = float(request.form["life_expectancy"])
        mean_schooling = float(request.form["mean_schooling"])
        expected_schooling = float(request.form["expected_schooling"])
        gni = float(request.form["gni"])
    except (KeyError, ValueError):
        return render_template(
            "index.html",
            error="Please enter valid numeric values for all four indicators.",
        )

    # Build a single-row DataFrame with the exact training column names
    input_df = pd.DataFrame(
        [[life_expectancy, mean_schooling, expected_schooling, gni]],
        columns=FEATURE_COLUMNS,
    )

    prediction = float(model.predict(input_df)[0])
    # Clip to the valid HDI range for display
    prediction = float(np.clip(prediction, 0.0, 1.0))
    tier = classify_hdi(prediction)

    return render_template(
        "result.html",
        prediction=round(prediction, 3),
        tier=tier,
        life_expectancy=life_expectancy,
        mean_schooling=mean_schooling,
        expected_schooling=expected_schooling,
        gni=int(gni),
    )


if __name__ == "__main__":
    # debug=True gives auto-reload during development
    app.run(debug=True, port=5000)
