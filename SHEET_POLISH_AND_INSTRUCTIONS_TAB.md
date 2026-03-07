# Sheet polish before launch + Instructions tab

---

## 1. EV 63.12% and conditional formatting

**Why 63% is correct**  
With 5% edge on +110, the math gives ~63% EV. That’s expected and correct.

**What “suggested formatting” means**  
The bands are about **when to bet**, not about capping the number:

- **Green (EV > 3%):** Bet — 63% is green and 2u BET ✓  
- **Yellow (1–3%):** Marginal — 1u BET  
- **Red (≤ 1%):** Pass  

So 63.12% is **correct** and should stay **green**. Nothing in the math needs to change.

**If you want the scale to feel less “extreme”**  
You can add one more band so very high EV is visually different:

- **Dark green:** EV > 15% or > 20%  
- **Green:** EV 3–15% (or 3–20%)  
- **Yellow:** 1–3%  
- **Red:** ≤ 1%  

Rule in Sheets: add another conditional format on column **I** (EV%):

- Custom formula: `=AND(I3<>"",I3>0.15)` → darker green (e.g. #0d5c0d).

So: **no change required** for 63%; optional extra band for “very high EV” if you want.

---

## 2. Polish checklist before launch

| # | Item | Action |
|---|------|--------|
| 1 | **Conditional formatting (EV%)** | Select I3:I52 → Format → Conditional formatting: Green `=AND(I3<>"",I3>0.03)`, Yellow `=AND(I3<>"",I3>0.01,I3<=0.03)`, Red `=AND(I3<>"",I3<=0.01)`. Optional: Dark green `=AND(I3<>"",I3>0.15)`. |
| 2 | **Freeze panes** | View → Freeze → 2 rows (so Bankroll + headers stay visible). |
| 3 | **Column format** | G, H, I as Percent (0.00% or 1 decimal). |
| 4 | **Column widths** | Widen Player, Book, Recommendation so text isn’t cut off. |
| 5 | **Dashboard tab** | If you have one: Total BET opps, Suggested units, Stat breakdown (PTS/REB/AST/3PT/STL/BLK), Edge sensitivity table. All Recommendation counts use **column K**. |
| 6 | **Protection (optional)** | Protect G3:K52 “Show warning when editing” so formulas aren’t overwritten by mistake. Users who Make a copy can remove it. |
| 7 | **Instructions tab** | Add a tab (e.g. “How to use”) with the content below. |

---

## 3. Instructions tab — copy into a new sheet tab

**Tab name:** `How to use` (or `Instructions`).

**Paste this into the tab (e.g. cell A1, or split into cells as you like):**

---

**PROPS EV BLUEPRINT — HOW TO USE**

1. **Make your copy**  
   File → Make a copy. Rename it and use your copy; don’t edit the shared template.

2. **Set your bankroll**  
   In the EV Calculator tab, cell **B1**, enter your bankroll in dollars (e.g. 600).

3. **Enter each prop (EV Calculator tab)**  
   - **Player, Stat, Book, Line, Odds:** from your usual sources (e.g. FanDuel, DraftKings).  
   - **Edge%:** your edge in percentage points (e.g. 5 = 5% edge over the book’s implied probability).  
   - The sheet calculates **Implied Prob**, **Your Fair %** (Implied + Edge), **EV%**, **Kelly Units**, and **Recommendation** (2u BET / 1u BET / PASS).

4. **What the colors mean (EV% column)**  
   - **Green:** EV > 3% → 2u BET.  
   - **Yellow:** EV 1–3% → 1u BET.  
   - **Red:** EV ≤ 1% → PASS.

5. **Recommendation**  
   - **2u BET:** Strong +EV; bet up to 2 units.  
   - **1u BET:** Marginal +EV; bet 1 unit.  
   - **PASS:** No bet.

6. **Sample Props tab**  
   Pre-filled examples; same logic. Change Edge% or odds to see how results update.

7. **Dashboard tab**  
   Totals and stat breakdown for the EV Calculator tab.

---

**Need the full playbook?** Check the PDF you received with your purchase.

---

You can put that in one column (e.g. A) with line breaks, or split into columns (e.g. “Step” in A, “What to do” in B). One tab is enough; keep the EV Calculator tab for data only.

---

## Summary

- **EV 63.12%:** Correct; keep it. Formatting is “green = bet”; add optional dark green for EV > 15% if you want.  
- **Polish:** Conditional format on I, freeze 2 rows, % format, column widths, Dashboard on K, optional protection, Instructions tab.  
- **Explanations:** Yes — use a separate **How to use** (or **Instructions**) tab with the text above so the main tab stays clean and launch-ready.
