let memory = null;
let isShifted = false;
let historyData = [];

function appendValue(val) {
  const display = document.getElementById("display");

  if (display.value === "Error") {
    display.value = "";
  }

  const current = display.value;
  const operators = ['+', '-', '*', '/', '%', '^'];
  const lastChar = current.slice(-1);
  const secondLastChar = current.slice(-2, -1);

  if (operators.includes(val)) {
    if (val === '-' && (current === "" || operators.includes(lastChar))) {
      display.value += val;
      return;
    }

    if (operators.includes(lastChar) && operators.includes(secondLastChar)) return;

    if (operators.includes(lastChar)) {
      display.value = current.slice(0, -1) + val;
      return;
    }
  }

  display.value += val;
}

function clearDisplay() {
  document.getElementById("display").value = "";
}

function backspace() {
  const display = document.getElementById("display");
  display.value = display.value === "Error" ? "" : display.value.slice(0, -1);
}

function calculate() {
  const display = document.getElementById("display");
  let expression = display.value.trim();

  if (!expression || expression === "Error") {
    showError();
    return;
  }

  try {
    expression = expression
      .replace(/π/g, "Math.PI")
      .replace(/e/g, "Math.E")
      .replace(/√/g, "Math.sqrt")
      .replace(/∛/g, "Math.cbrt")
      .replace(/\^/g, "**")
      .replace(/ln\(/g, "Math.log(")
      .replace(/log/g, "Math.log10")
      .replace(/sin⁻¹/g, "Math.asin")
      .replace(/cos⁻¹/g, "Math.acos")
      .replace(/tan⁻¹/g, "Math.atan")
      .replace(/sin/g, "Math.sin")
      .replace(/cos/g, "Math.cos")
      .replace(/tan/g, "Math.tan");

    // Convert trig functions to degrees
    expression = expression.replace(/(Math\.(sin|cos|tan|asin|acos|atan))\(([^()]+?)\)/g, (match, fn, _, angle) => {
      return `${fn}(((${angle}) * Math.PI) / 180)`;
    });

    // Add * for implicit multiplication (e.g., 2sin(90), 5(2+3), )( )
    expression = expression.replace(/(\d|\))(?=[a-zA-Z(])/g, "$1*");

    // Handle percentage and factorial
    expression = expression.replace(/(\d+(\.\d+)?)%(?=[^\d]|$)/g, "($1/100)");
    expression = expression.replace(/(\d+)!/g, (_, n) => factorial(+n));

    let result = eval(expression);

    // Fix floating point rounding issue
    if (typeof result === "number") {
      result = parseFloat(result.toFixed(12));
      result = +result.toString();
    }

    if (typeof result === "function" || result === undefined || isNaN(result)) {
      showError();
    } else {
      const fullEntry = `${display.value} = ${result}`;
      display.value = result;
      addToHistory(fullEntry);
    }
  } catch {
    showError();
  }
}

function showError() {
  const display = document.getElementById("display");
  display.value = "Error";
  display.classList.add("error");
  setTimeout(() => {
    display.classList.remove("error");
    display.value = "";
  }, 3000);
}

function factorial(n) {
  if (n < 0 || n > 170) return NaN;
  return n === 0 ? 1 : n * factorial(n - 1);
}

function memoryAdd() {
  const display = document.getElementById("display");
  if (display.value !== "" && display.value !== "Error") {
    memory = parseFloat(display.value);
  }
}

function memoryRecall() {
  if (memory !== null) {
    const display = document.getElementById("display");
    if (display.value === "Error") display.value = "";
    display.value += memory;
  }
}

function memoryClear() {
  memory = null;
}

function toggleShift() {
  isShifted = !isShifted;

  document.getElementById("sinBtn").textContent = isShifted ? "sin⁻¹" : "sin";
  document.getElementById("cosBtn").textContent = isShifted ? "cos⁻¹" : "cos";
  document.getElementById("tanBtn").textContent = isShifted ? "tan⁻¹" : "tan";
  document.getElementById("logPowerBtn").textContent = isShifted ? "x²" : "log";
  document.getElementById("sqrtBtn").textContent = isShifted ? "∛" : "√";
  document.getElementById("piBtn").textContent = isShifted ? "ln" : "π";
  document.getElementById("eBtn").textContent = isShifted ? "!" : "e";
}

function handleLogOrPower() {
  if (isShifted) {
    appendValue("^2");
  } else {
    appendValue("log(");
  }
}

function handlePiOrLn() {
  if (isShifted) {
    appendValue("ln(");
  } else {
    appendValue("π");
  }
}

function handleEOrFactorial() {
  if (isShifted) {
    appendValue("!");
  } else {
    appendValue("e");
  }
}

function handleTrig(func) {
  const btn = document.getElementById(`${func}Btn`);
  const isInverse = btn.textContent.includes("⁻¹");
  appendValue(isInverse ? `${func}⁻¹(` : `${func}(`);
}

function handleSqrt() {
  appendValue(isShifted ? "∛(" : "√(");
}

function addToHistory(entry) {
  historyData.push(entry);

  const li = document.createElement("li");
  li.textContent = entry;
  li.onclick = () => {
    const answer = entry.includes("=") ? entry.split("=")[1].trim() : entry;
    document.getElementById("display").value = answer;
  };

  document.getElementById("historyList").appendChild(li);
  document.querySelector(".clear-history").style.display = "inline-block";
}

function clearHistory() {
  const historyList = document.getElementById("historyList");
  while (historyList.firstChild) {
    historyList.removeChild(historyList.firstChild);
  }
  document.querySelector(".clear-history").style.display = "none";
  document.activeElement.blur();
}

function syncExpression() {
  // Reserved for future use
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}
