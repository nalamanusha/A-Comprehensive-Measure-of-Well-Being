from flask import Flask, render_template, request
import pickle
import numpy as np

app = Flask(__name__)

# Load the trained model
model = pickle.load(open("hdi_model.pkl", "rb"))


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/predict", methods=["GET", "POST"])
def predict():

    if request.method == "POST":

        life = float(request.form["life"])

        expected = float(request.form["expected"])

        mean = float(request.form["mean"])

        gni = float(request.form["gni"])

        prediction = model.predict([[life, expected, mean, gni]])[0]

        # HDI Category
        if prediction >= 0.800:
            category = "Very High Human Development"

        elif prediction >= 0.700:
            category = "High Human Development"

        elif prediction >= 0.550:
            category = "Medium Human Development"

        else:
            category = "Low Human Development"

        return render_template(
            "result.html",
            prediction=round(prediction, 3),
            category=category
        )

    return render_template("predict.html")


@app.route("/about")
def about():
    return render_template("about.html")


if __name__ == "__main__":
    app.run(debug=True)