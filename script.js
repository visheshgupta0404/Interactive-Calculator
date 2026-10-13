'use strict';
const $ = id => document.getElementById(id);
const input = $('expression');
let lastAnswer = 0;
let completed = false;
let currentResult = null;
let toastTimer;
const storage = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
};
const stored = storage.get('everyday-history', []);
let history = Array.isArray(stored) ? stored.filter(item => item && typeof item.expression === 'string' && item.expression.length <= 500 && Number.isFinite(item.result) && Number.isFinite(item.time)).slice(0, 50) : [];
function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 2400); }
function format(value) { return Number(value.toPrecision(12)).toLocaleString(undefined, { maximumSignificantDigits: 12 }); }
function preview(showError = false) {
  $('result').classList.remove('error');
  currentResult = null;
  if (!input.value.trim()) { $('result').textContent = '0'; $('copy-result').disabled = true; return; }
  try { currentResult = Calculator.evaluate(input.value); $('result').textContent = format(currentResult); }
  catch (error) { $('result').textContent = showError ? error.message : '—'; if (showError) $('result').classList.add('error'); }
  $('copy-result').disabled = currentResult === null;
}
function calculate() {
  preview(true);
  if (currentResult === null) return;
  lastAnswer = currentResult;
  history.unshift({ expression: input.value, result: currentResult, time: Date.now() });
  history = history.slice(0, 50);
  if (!storage.set('everyday-history', history)) toast('History is available for this session only.');
  renderHistory(); completed = true;
}
function renderHistory() {
  const list = $('history-list'); list.replaceChildren();
  $('clear-history').disabled = !history.length;
  if (!history.length) {
    const empty = document.createElement('div'); empty.className = 'empty-history';
    const icon = document.createElement('span'); icon.className = 'empty-icon'; icon.textContent = '↺'; icon.setAttribute('aria-hidden', 'true');
    const heading = document.createElement('h3'); heading.textContent = 'A fresh start.';
    const note = document.createElement('p'); note.textContent = 'Press = or Enter to save a calculation here.';
    empty.append(icon, heading, note); list.append(empty); return;
  }
  history.forEach(item => {
    const button = document.createElement('button'); button.className = 'history-item';
    button.setAttribute('aria-label', `Reuse ${item.expression} equals ${item.result}`);
    const time = document.createElement('small'); time.textContent = new Date(item.time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const expression = document.createElement('span'); expression.textContent = item.expression.replace(/\*/g, '×').replace(/\//g, '÷') + ' =';
    const result = document.createElement('strong'); result.textContent = format(item.result);
    button.append(time, expression, result);
    button.addEventListener('click', () => { input.value = item.expression; completed = false; preview(); input.focus(); input.setSelectionRange(input.value.length, input.value.length); });
    list.append(button);
  });
}
function insert(value) {
  if (completed) { input.value = /^[+*/%^\-]/.test(value) ? String(lastAnswer) : ''; completed = false; }
  input.focus();
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  if (input.value.length - (end - start) + value.length > 500) { toast('Expression limit: 500 characters.'); return; }
  input.setRangeText(value, start, end, 'end'); preview();
}
function action(name) {
  if (name === 'clear') { input.value = ''; completed = false; preview(); }
  if (name === 'equals') calculate();
  if (name === 'answer') insert(String(lastAnswer));
  if (name === 'backspace') {
    input.focus(); const start = input.selectionStart; const end = input.selectionEnd;
    input.setRangeText('', start === end ? Math.max(0, start - 1) : start, end, 'end'); completed = false; preview();
  }
  if (name === 'sign' && input.value.trim()) { input.value = `-(${input.value})`; completed = false; preview(); }
}
document.querySelectorAll('[data-value], [data-action]').forEach(button => button.addEventListener('click', () => button.dataset.value !== undefined ? insert(button.dataset.value) : action(button.dataset.action)));
input.addEventListener('input', () => { completed = false; preview(); });
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
  const target = event.target;
  if (target.matches('input, select, textarea') && target !== input) return;
  if (event.key === 'Escape') { event.preventDefault(); action('clear'); }
  else if (event.key === 'Enter' || event.key === '=') {
    if (target === input || target === document.body || target.matches('[data-value], [data-action]')) { event.preventDefault(); calculate(); }
  } else if (target !== input && (!target.matches('button, a') || target.matches('[data-value], [data-action]')) && /^[0-9.+\-*/()% ^]$/.test(event.key)) { event.preventDefault(); insert(event.key); }
});
$('clear-history').addEventListener('click', () => { history = []; storage.set('everyday-history', history); renderHistory(); toast('History cleared.'); });
$('copy-result').addEventListener('click', async () => {
  if (currentResult === null) return;
  try { await navigator.clipboard.writeText(String(currentResult)); toast('Result copied.'); }
  catch { toast('Copy unavailable. Select the result to copy it.'); }
});
const initialTheme = storage.get('everyday-theme', null);
function setTheme(dark) { document.body.classList.toggle('dark', dark); $('theme-toggle').setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`); document.querySelector('meta[name="theme-color"]').content = dark ? '#151620' : '#f7f8fa'; }
setTheme(initialTheme === 'dark' || (initialTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches));
$('theme-toggle').addEventListener('click', () => { const dark = !document.body.classList.contains('dark'); setTheme(dark); storage.set('everyday-theme', dark ? 'dark' : 'light'); });
const tabs = [...document.querySelectorAll('[data-tool]')];
function selectTool(tab) { tabs.forEach(button => { const selected = button === tab; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; $(`panel-${button.dataset.tool}`).hidden = !selected; }); }
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTool(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTool(tabs[next]); tabs[next].focus(); }
  });
});
function money(value) { return new Intl.NumberFormat(undefined, { style: 'currency', currency: $('currency').value }).format(value); }
function values(ids) { return ids.map(id => { if ($(id).value.trim() === '' || !$(id).validity.valid) throw new Error('Enter valid values in every field.'); return Number($(id).value); }); }
function updateBill() {
  try { const result = Calculator.billSplit(...values(['bill-amount', 'bill-tip', 'bill-people'])); if (!Number.isFinite(result.total)) throw new Error('Amount is too large.'); $('bill-result').textContent = money(result.perPerson); $('bill-detail').textContent = `${money(result.total)} total · ${money(result.tip)} tip. Shares rounded to currency precision.`; }
  catch (error) { $('bill-result').textContent = '—'; $('bill-detail').textContent = $('bill-amount').value ? error.message : 'Enter a bill to get started.'; }
}
function updateDiscount() {
  try { const result = Calculator.discount(...values(['price', 'discount', 'tax'])); if (!Number.isFinite(result.total)) throw new Error('Price is too large.'); $('discount-result').textContent = money(result.total); $('discount-detail').textContent = `You save ${money(result.savings)} before tax.`; }
  catch (error) { $('discount-result').textContent = '—'; $('discount-detail').textContent = $('price').value ? error.message : 'Enter a price to get started.'; }
}
function populateUnits() {
  const entries = Object.entries(Calculator.units[$('category').value]);
  ['unit-from', 'unit-to'].forEach(id => { $(id).replaceChildren(...entries.map(([key, [label]]) => new Option(label, key))); });
  $('unit-to').selectedIndex = 1; updateConversion();
}
function updateConversion() {
  try { const [value] = values(['unit-value']); const answer = Calculator.convert(value, $('category').value, $('unit-from').value, $('unit-to').value); if (!Number.isFinite(answer)) throw new Error('Value is too large.'); $('convert-result').textContent = format(answer); $('convert-detail').textContent = `${value} ${$('unit-from').selectedOptions[0].text} = ${format(answer)} ${$('unit-to').selectedOptions[0].text}`; }
  catch (error) { $('convert-result').textContent = '—'; $('convert-detail').textContent = $('unit-value').value ? error.message : 'Choose your units and enter a value.'; }
}
[['bill-form', updateBill], ['discount-form', updateDiscount], ['convert-form', updateConversion]].forEach(([id, update]) => { $(id).addEventListener('input', update); $(id).addEventListener('change', update); $(id).addEventListener('submit', event => { event.preventDefault(); update(); }); });
$('currency').addEventListener('change', updateDiscount);
$('category').addEventListener('change', populateUnits);
populateUnits(); renderHistory(); preview(); updateBill(); updateDiscount();
