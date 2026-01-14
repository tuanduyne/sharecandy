let history = [];
let currentStep = 0;
let timer = null;

/* ===== ANIMATION CONTROLS ===== */
function pause() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function play() {
    if (timer || history.length === 0) return;

    timer = setInterval(() => {
        if (currentStep >= history.length) {
            pause();
            return;
        }
        renderCircle(history[currentStep]);
        currentStep++;
    }, 600);
}

function stepOnce() {
    if (currentStep < history.length) {
        renderCircle(history[currentStep]);
        currentStep++;
    }
}

/* ===== DRAW CIRCLE ===== */
function renderCircle(state) {
    const circle = document.getElementById("circle");
    circle.innerHTML = "";

    const n = state.length;
    const r = 120;

    state.forEach((candies, i) => {
        const angle = (2 * Math.PI / n) * i;
        const x = 125 + r * Math.cos(angle);
        const y = 125 + r * Math.sin(angle);

        const div = document.createElement("div");
        div.className = "person";

        if (candies <= 1) div.classList.add("low");
        else if (candies <= 3) div.classList.add("mid");
        else div.classList.add("high");

        div.style.left = x + "px";
        div.style.top = y + "px";
        div.innerText = candies;

        circle.appendChild(div);
    });
}

/* ===== SIMULATION ===== */
function simulate() {
    const input = document.getElementById("candies").value;
    const errorDiv = document.getElementById("error");
    const historyDiv = document.getElementById("history");
    const stepsDiv = document.getElementById("steps");

    errorDiv.innerText = "";
    historyDiv.innerHTML = "";
    stepsDiv.innerText = "";

    pause();

    if (!input) {
        errorDiv.innerText = "Vui lòng nhập dữ liệu!";
        return;
    }

    const candies = input.split(",").map(x => Number(x.trim()));
    if (candies.some(isNaN)) {
        errorDiv.innerText = "Dữ liệu không hợp lệ!";
        return;
    }

    fetch("https://candy-share.onrender.com/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candies })
    })
    .then(res => res.json())
    .then(data => {

        history = data.history || [];
        currentStep = 0;

        if (data.error) {
            errorDiv.innerText = data.error;
        } else {
            stepsDiv.innerText = "Số bước: " + data.steps;
        }

        history.forEach((step, i) => {
            const div = document.createElement("div");
            div.className = "step";
            div.innerText = `Bước ${i}: [ ${step.join(", ")} ]`;
            historyDiv.appendChild(div);
        });

        if (history.length > 0) {
            renderCircle(history[0]);
        }
    })
    .catch(() => {
        errorDiv.innerText = "Không kết nối được backend!";
    });
}
