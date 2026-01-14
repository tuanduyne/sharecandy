from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


class CandyShare:
    def __init__(self, candies):
        self.candies = candies
        self.n = len(candies)
        self.steps = 0
        self.history = [candies.copy()]

    def is_stable(self):
        return all(c <= 1 for c in self.candies)

    def step(self):
        new = self.candies.copy()

        for i in range(self.n):
            if self.candies[i] >= 2:
                new[i] -= 2
                new[(i - 1) % self.n] += 1
                new[(i + 1) % self.n] += 1

        self.candies = new
        self.steps += 1
        self.history.append(new.copy())

    def run(self):
        seen = set()

        while not self.is_stable():
            state = tuple(self.candies)

            # phát hiện vòng lặp
            if state in seen:
                return {
                    "error": "Simulation enters infinite loop",
                    "history": self.history
                }

            seen.add(state)
            self.step()

            # chống treo server
            if self.steps > 1000:
                return {
                    "error": "Too many steps (possible infinite)",
                    "history": self.history
                }

        return {
            "steps": self.steps,
            "history": self.history
        }


@app.route("/")
def home():
    return "Candy Share API is running"


@app.route("/simulate", methods=["POST"])
def simulate():
    data = request.get_json()
    candies = data.get("candies")

    if not isinstance(candies, list):
        return jsonify({"error": "Invalid input"}), 400

    if any(not isinstance(x, int) or x < 0 for x in candies):
        return jsonify({"error": "Candies must be non-negative integers"}), 400

    sim = CandyShare(candies)
    return jsonify(sim.run())


import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
    app.run(debug=True)