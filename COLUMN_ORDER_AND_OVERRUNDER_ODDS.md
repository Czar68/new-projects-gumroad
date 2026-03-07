# Column order + Over/Under odds (Implied Prob)

---

## 1. Column order — correct?

**Current order:**  
Player | Stat | Book | Line | Odds | Edge% | Implied Prob | Your Fair % | EV% | Kelly Units | Recommendation | Notes

**Verdict: Yes, the order is correct.**

- **Inputs (A–F):** Player, Stat, Book, Line, Odds, Edge% — what you type or paste.
- **Calculated (G–K):** Implied Prob → Your Fair % → EV% → Kelly → Recommendation — all from formulas.
- **Notes (L):** Free-form.

Keeping inputs first, then derived columns, then Notes is the right layout. No change needed.

---

## 2. How we get Implied Prob with one “Odds” column

Right now we treat **Odds** as the **odds for the side you’re evaluating** (e.g. “Over 4.5 AST at +110”).

- **Implied Prob** = that side’s implied probability from those odds:
  - American +110 → 100/(110+100) = **47.62%**
  - American -110 → 110/(110+100) = **52.38%**

So we’re not “missing” over/under; we’re assuming you enter the odds for the **one side you care about** (usually the over). That’s consistent and correct for a single-side EV calc.

---

## 3. Why Over + Under odds would be more reliable

Using **both** Over and Under odds is more reliable because:

1. **Consistency check** — Over implied + Under implied should be > 100% (vig). If they don’t, you know you mis-typed or mixed books.
2. **No-vig implied** — You can remove vig and get a “fair” book implied:
   - Over implied = 100/(OverOdds+100) or 110/(110+100) for negative
   - Under implied = same for UnderOdds
   - No-vig Over = Over_implied / (Over_implied + Under_implied)
   - That no-vig number is a better reference for “what the market thinks” than the single-sided implied.
3. **One source of truth** — One line (e.g. 4.5) with two odds; less ambiguity than “did I enter over or under?”

So: **we can compile Implied Prob from one Odds column (current way), but using Over and Under odds would be more reliable and allow no-vig implied.**

---

## 4. Optional upgrade: add Over Odds + Under Odds

**Option A — Two columns (recommended if you want “more reliable”)**

- **Column E:** Over Odds (e.g. +110 for over 4.5)
- **Column F:** Under Odds (e.g. -110 for under 4.5)
- **Column G:** Edge% (your input)
- **Column H:** Implied Prob (over) = from Over Odds, e.g. `=IF(E3>0,100/(E3+100),ABS(E3)/(ABS(E3)+100))`
- **Column I:** (Optional) No-vig Over Implied = Over_implied / (Over_implied + Under_implied). Use this in place of H for “book fair” if you want.
- **Column J:** Your Fair % = Implied (or no-vig) + Edge%
- Then EV%, Kelly, Recommendation as now (all referencing the new column letters).

So you’d **insert** one column (Under Odds) and shift everything right; formulas then use Over Odds for “implied over” and optionally Under for no-vig.

**Option B — Keep one Odds column**

- **Odds** = odds for the side you’re betting (over or under). Implied Prob = implied for that side. No change to current logic; still correct, just no cross-check or no-vig.

---

## 5. Suggested layout if you add Under Odds

| A     | B    | C    | D   | E          | F           | G     | H            | I            | J    | K    | L              | M     |
|-------|------|------|-----|------------|-------------|-------|--------------|--------------|------|------|----------------|-------|
| Player| Stat | Book | Line| Over Odds  | Under Odds  | Edge% | Implied (Over)| Your Fair %  | EV%  | Kelly| Recommendation | Notes |

- **H3 Implied (Over):** from E3 (Over Odds), same formula as current Implied Prob.
- Optional: **No-vig Over** = H3/(H3 + implied_under). Then **Your Fair %** = No-vig Over + Edge% (or keep Your Fair % = H3 + Edge% if you prefer not to strip vig).

---

## Summary

- **Column order:** Correct; no change needed.
- **Current Implied Prob:** We compile it from the single **Odds** column, treating it as the odds for the side you’re betting (e.g. over). That’s valid.
- **More reliable approach:** Add **Under Odds** (and optionally use Over + Under to get no-vig implied). Then we’re not “compiling implied without over and under”—we’re using both, and it’s more reliable and consistent.

If you want, next step is to spell out exact formulas for the “Over Odds + Under Odds” version (Implied Over, optional No-vig, Your Fair %, EV%, Kelly, Recommendation) so you can paste them into the sheet.
