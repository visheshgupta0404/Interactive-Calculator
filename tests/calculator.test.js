const { test } = require('node:test');
const assert = require('node:assert/strict');
const { evaluate, billSplit, discount, convert } = require('../calculator.js');
const cases = [
  ['2+3*4',14], ['(2+3)*4',20], ['0.1+0.2',.3], ['-5+2',-3],
  ['2^3^2',512], ['-2^2',-4], ['2^-2',.25], ['200+10%',220],
  ['200-10%',180], ['200*10%',20], ['200/10%',2000], ['50%',.5],
  ['100+10%+10%',121], ['(100+20)%',1.2], ['2×(6−2)÷4',2],
  ['1e-7*10',.000001], ['.5+.25',.75], ['3--2',5], ['-(2+3)',-5]
];
for (const [expression, answer] of cases) test(expression, () => assert.equal(evaluate(expression), answer));
for (const expression of ['', '1/0', '2+', '(2+3', '2..3', 'alert(1)', '2;3', '2(3)', '1e999', '2**3', '2^99999', ')2(', '1'.repeat(501)]) test(`reject ${expression.slice(0,30)}`, () => assert.throws(() => evaluate(expression)));
test('bill split includes tip and validates people', () => {
  assert.deepEqual(billSplit(1000, 10, 2), { total: 1100, perPerson: 550, tip: 100 });
  assert.equal(billSplit(0,0,1).total,0);
  for (const args of [[10,10,0],[10,10,1.5],[-1,0,2],[10,101,2],[NaN,0,2]]) assert.throws(() => billSplit(...args));
});
test('discount before tax', () => { const deal = discount(1000,20,10); assert.equal(deal.savings,200); assert.ok(Math.abs(deal.total-880)<1e-9); assert.equal(discount(100,100,10).total,0); assert.throws(() => discount(100,101,0)); });
test('unit conversion', () => { assert.equal(convert(1,'length','km','m'),1000); assert.equal(convert(1,'length','ft','cm'),30.48); assert.equal(convert(1,'weight','lb','kg'),.45359237); assert.equal(convert(32,'temperature','f','c'),0); assert.equal(convert(0,'temperature','c','k'),273.15); assert.equal(convert(273.15,'temperature','k','c'),0); assert.throws(() => convert(-1,'temperature','k','c')); assert.throws(() => convert(1,'length','bad','m')); });
