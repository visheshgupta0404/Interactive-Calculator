let input = document.getElementById("input-exp");
const result = document.getElementById("result");
let exp = "";
let ans = "";
function handleClickButton(el) {
  if (el.innerText === "AC") {
    input.value = 0;
    result.value = 0;
    exp = "";
  } else if (el.innerText === "%") {
    exp = input.value;
    exp = exp.replace(/%(\d+(\.\d+)?)/g, "($1/100)");
    const match = exp.match(/(.+)([+\-*/])(\d+(\.\d+)?)$/);
    if (match) {
      const leftExp = match[1];
      const operator = match[2];
      const num = parseFloat(match[3]);

      const base = eval(leftExp);
      const percent = num / 100;

      if (operator === "+" || operator === "-") {
        exp = `${leftExp}${operator}${base * percent}`;
      } else {
        exp = `${leftExp}${operator}${percent}`;
      }
    }

    input.value = exp;
    try {
      result.value = eval(exp);
    } catch (error) {
      result.value = "";
    }
  } else if (el.innerText === "=") {
    exp = input.value;
    ans = eval(exp);
    result.value = ans;
    input.value = ans;
    exp = ans;
  } else {
    exp = `${exp}${el.innerText}`;
    input.value = exp;
    try {
      result.value = eval(exp);
    } catch (error) {
      result.value = "";
    }
  }
}
