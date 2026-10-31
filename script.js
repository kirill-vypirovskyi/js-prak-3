const displayEquation = document.getElementById("equation");
const displayPreResult = document.getElementById("pre-result");
const buttons = document.querySelectorAll(".btn:not(#theme-toggle)");

const MAX_DISPLAY_LENGTH = 12;

const searchAndReplacePercent = (str) => {
  let result = str;
  const percentIndex = str.indexOf("%");

  if (percentIndex === -1) {
    return result;
  }

  let symbolsCountInPercent = str
    .split("")
    .slice(0, percentIndex)
    .reduce((count, char) => {
      let i = ["+", "-", "*", "/"].includes(char) ? 0 : count + 1;
      return i;
    }, 0);

  let numberToReplace = str.slice(
    percentIndex - symbolsCountInPercent,
    percentIndex,
  );

  result = result.replace(numberToReplace + "%", numberToReplace / 100);

  return searchAndReplacePercent(result);
};

function truncateDisplay(content) {
  const text = String(content);

  if (
    Number.isInteger(content) &&
    (text.length > MAX_DISPLAY_LENGTH ||
      Math.abs(content) >= 10 ** MAX_DISPLAY_LENGTH)
  ) {
    for (let precision = MAX_DISPLAY_LENGTH; precision >= 0; precision--) {
      const exponential = content.toExponential(precision);
      const [mantissa, exponent] = exponential.split("e");
      const compact = `${mantissa.replace(/\.?0+$/, "")}e${exponent}`;

      if (compact.length <= MAX_DISPLAY_LENGTH) {
        return compact;
      }
    }
  }

  if (text.length > MAX_DISPLAY_LENGTH) {
    return text.slice(0, MAX_DISPLAY_LENGTH);
  }

  return text;
}

function handleDisplay(content) {
  if (String(content).length > MAX_DISPLAY_LENGTH) {
    displayEquation.textContent = "ERROR";
    return;
  }

  displayEquation.textContent = content;

  const preResult = handleCalculation();
  displayPreResult.textContent =
    preResult !== "ERROR" && preResult !== "0" && preResult !== content
      ? preResult
      : " ";
}

function hadleClear() {
  return "0";
}

function hadleBackspace() {
  return displayEquation.textContent.slice(0, -1) || "0";
}

function handleOperatorInput(operator) {
  const lastChar = displayEquation.textContent.slice(-1);
  if (!["+", "-", "*", "/"].includes(lastChar)) {
    return displayEquation.textContent + operator;
  } else {
    return displayEquation.textContent.slice(0, -1) + operator;
  }
}

function handleDotInput() {
  if (displayEquation.textContent === "0") {
    return (displayEquation.textContent = "0.");
  }

  if (!displayEquation.textContent.includes(".")) {
    return (displayEquation.textContent += ".");
  }
}

function handleCalculation() {
  try {
    let result = 0;
    if (displayEquation.textContent.includes("%")) {
      result = eval(searchAndReplacePercent(displayEquation.textContent));
    } else {
      result = eval(displayEquation.textContent);
    }
    return truncateDisplay(result);
  } catch (error) {
    return "ERROR";
  }
}

function handleButtonPress(button) {
  const value = button.textContent;
  let valueToDisplay = "";

  if (displayEquation.textContent === "ERROR") {
    handleDisplay("0");
  }

  switch (value) {
    case "AC":
      valueToDisplay = hadleClear();
      break;
    case "⌫":
      valueToDisplay = hadleBackspace();
      break;
    case "+":
    case "-":
    case "*":
    case "/":
      valueToDisplay = handleOperatorInput(value);
      break;
    case ".":
    case ",":
      valueToDisplay = handleDotInput();
      break;
    case "=":
      valueToDisplay = handleCalculation();
      break;
    default:
      valueToDisplay =
        displayEquation.textContent === "0"
          ? value
          : displayEquation.textContent + value;
  }

  handleDisplay(valueToDisplay);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    handleButtonPress(button);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.target.id === "theme-toggle") return;

  const key = event.key;

  if (/\d/.test(key)) {
    handleButtonPress({ textContent: key });
  } else if (["+", "-", "*", "/", "%"].includes(key)) {
    handleButtonPress({ textContent: key });
  } else if (key === "Enter") {
    handleButtonPress({ textContent: "=" });
  } else if (key === "Backspace") {
    handleButtonPress({ textContent: "⌫" });
  } else if (key === "Escape") {
    handleButtonPress({ textContent: "AC" });
  } else if ([".", ","].includes(key)) {
    handleButtonPress({ textContent: "." });
  }
});

const themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.classList.toggle("dark-theme");

  themeToggle.textContent = isDark ? "☀️" : "🌑";
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Увімкнути світлу тему" : "Увімкнути темну тему",
  );
  themeToggle.setAttribute("aria-pressed", String(isDark));
});
