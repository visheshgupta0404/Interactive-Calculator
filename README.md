# Interactive Calculator

A responsive, accessible calculator and practical maths toolkit built with HTML, CSS, and dependency-free JavaScript.

[Use the live calculator](https://visheshgupta0404.github.io/Interactive-Calculator/)

## What's included

- Editable expressions with live previews, keyboard input, parentheses, powers, percentages, sign toggle, backspace, and the previous answer.
- A dedicated expression parser: no `eval` or dynamic code execution. Incomplete expressions and division by zero produce useful messages.
- Up to 50 saved calculations in local browser storage. Select a history entry to reuse its expression, or clear history at any time.
- Copy result, light/dark themes, system theme detection, visible focus indicators, and responsive layouts.
- Bill splitting with optional tips and currency formatting (INR, USD, EUR, GBP).
- Discount calculation with tax applied after the discount.
- Length, weight, and temperature conversion, with validation for absolute zero.

No account, analytics, external fonts, APIs, or runtime dependencies. History and theme preferences stay on the device; if storage is unavailable, calculations still work and history is kept for the current session.

## Run locally

Clone this repository, then open `index.html` in a modern browser. For clipboard support, use localhost or HTTPS:

```sh
python -m http.server 8000
```

Open http://localhost:8000.

## Keyboard and expression guide

Type directly into the expression field. `Enter` or `=` calculates and saves; `Escape` clears. Native cursor movement, selection, paste, and backspace work in the field. Keypad buttons insert at the cursor. After a completed calculation, an operator continues from its result, while a digit starts a new expression. `Ans` inserts the last calculated answer for the current session.

| Expression | Result | Meaning |
| --- | --- | --- |
| `2 + 3 * 4` | 14 | Multiplication before addition |
| `(2 + 3) * 4` | 20 | Parentheses first |
| `200 + 10%` | 220 | Add 10% of the left value |
| `200 - 10%` | 180 | Subtract 10% of the left value |
| `200 * 10%` | 20 | Multiply by 0.1 |
| `50%` | 0.5 | Standalone percentage |
| `2^3^2` | 512 | Powers associate from the right |
| `-2^2` | -4 | Powers before unary minus |

Explicit multiplication is required: use `2*(3+4)`, not `2(3+4)`. A directly percentage-marked operand on the right of `+` or `-` is relative to the running left value. A compound product, such as `200+10%*2`, follows ordinary arithmetic (200.2).

Calculations use JavaScript floating-point numbers and results are normalized to 12 significant digits for everyday use. Currency values are formatted to the currency's precision; rounded per-person amounts may not sum exactly to the bill. This is not an arbitrary-precision accounting tool. Currency selection changes formatting only; it does not convert exchange rates.

## Development and checks

Node.js 20 or later is required only for development checks. No package installation is needed.

```sh
npm run check
npm test
```

The tests cover precedence, percentages, decimals, scientific notation, unsafe/invalid input rejection, division by zero, bill splits, discounts, and unit conversions. GitHub Actions runs checks before deploying only the public assets to GitHub Pages on a successful `main` push. GitHub Pages must be configured to use GitHub Actions in the repository settings.

## Files

| File | Responsibility |
| --- | --- |
| `index.html` | Semantic interface and tool forms |
| `style.css` | Responsive layout and theme tokens |
| `calculator.js` | Pure parser and tool calculations |
| `script.js` | UI state, history, persistence, and interactions |
| `tests/calculator.test.js` | Calculation regression tests |
| `.github/workflows/static.yml` | Validation and Pages deployment |

Built by [Vishesh Gupta](https://github.com/visheshgupta0404).
