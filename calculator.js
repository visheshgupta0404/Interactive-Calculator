(function (root) {
  'use strict';
  function evaluate(expression) {
    const source = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\s/g, '');
    if (!source || source.length > 500) throw new Error('Enter an expression (up to 500 characters).');
    const tokens = source.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|[()+\-*/%^]/gi) || [];
    if (tokens.join('') !== source) throw new Error('Use numbers and mathematical operators only.');
    let pos = 0;
    const peek = () => tokens[pos];
    function primary() {
      let value;
      if (peek() === '(') {
        pos++; value = sum();
        if (tokens[pos++] !== ')') throw new Error('Close the parenthesis.');
      } else {
        const token = tokens[pos++];
        if (!token || !/^(?:\d|\.)/.test(token)) throw new Error('Complete the expression.');
        value = Number(token);
      }
      let percent = false;
      while (peek() === '%') { pos++; value /= 100; percent = true; }
      return { value, percent };
    }
    function power() {
      const left = primary();
      if (peek() === '^') { pos++; return { value: left.value ** unary().value, percent: false }; }
      return left;
    }
    function unary() {
      if (peek() === '+' || peek() === '-') { const sign = tokens[pos++]; const n = unary(); return { value: sign === '-' ? -n.value : n.value, percent: n.percent }; }
      return power();
    }
    function product() {
      let left = unary();
      while (peek() === '*' || peek() === '/') {
        const op = tokens[pos++]; const right = unary();
        if (op === '/' && right.value === 0) throw new Error('Cannot divide by zero.');
        left = { value: op === '*' ? left.value * right.value : left.value / right.value, percent: false };
      }
      return left;
    }
    function sum() {
      let left = product();
      while (peek() === '+' || peek() === '-') {
        const op = tokens[pos++]; const right = product();
        const amount = right.percent ? left.value * right.value : right.value;
        left = { value: op === '+' ? left.value + amount : left.value - amount, percent: false };
      }
      return left.value;
    }
    const answer = sum();
    if (pos !== tokens.length) throw new Error('Check the operators and parentheses.');
    if (!Number.isFinite(answer)) throw new Error('Result is outside the supported range.');
    return Object.is(answer, -0) ? 0 : Number(answer.toPrecision(12));
  }
  function billSplit(amount, tip, people) {
    if (![amount, tip, people].every(Number.isFinite) || amount < 0 || tip < 0 || tip > 100 || people < 1 || !Number.isInteger(people)) throw new Error('Use a positive bill, 0–100% tip, and at least one person.');
    const total = amount * (1 + tip / 100);
    return { total, perPerson: total / people, tip: total - amount };
  }
  function discount(price, percent, tax) {
    if (![price, percent, tax].every(Number.isFinite) || price < 0 || percent < 0 || percent > 100 || tax < 0 || tax > 100) throw new Error('Use a positive price and percentages from 0 to 100.');
    const savings = price * percent / 100;
    return { savings, total: (price - savings) * (1 + tax / 100) };
  }
  const units = {
    length: { m: ['Metres', 1], km: ['Kilometres', 1000], cm: ['Centimetres', .01], ft: ['Feet', .3048], in: ['Inches', .0254], mi: ['Miles', 1609.344] },
    weight: { kg: ['Kilograms', 1], g: ['Grams', .001], lb: ['Pounds', .45359237], oz: ['Ounces', .028349523125] },
    temperature: { c: ['Celsius', 1], f: ['Fahrenheit', 1], k: ['Kelvin', 1] }
  };
  function convert(value, category, from, to) {
    if (!Number.isFinite(value) || !units[category]?.[from] || !units[category]?.[to]) throw new Error('Enter a valid value and units.');
    if (category !== 'temperature') return value * units[category][from][1] / units[category][to][1];
    const c = from === 'f' ? (value - 32) * 5 / 9 : from === 'k' ? value - 273.15 : value;
    if (c < -273.15 - 1e-10) throw new Error('Temperature cannot be below absolute zero.');
    return to === 'f' ? c * 9 / 5 + 32 : to === 'k' ? c + 273.15 : c;
  }
  const api = { evaluate, billSplit, discount, units, convert };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Calculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
