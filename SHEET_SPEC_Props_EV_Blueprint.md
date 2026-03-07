# Props EV Blueprint — Google Sheet Build Spec (MASTER)

**Sheet name:** `Props EV Blueprint - MASTER`  
**Share setting:** Anyone with link can **view** → users use **File → Make a copy**.

---

## Row 1 — Bankroll (above table)
| A1 | B1 |
|----|-----|
| `Bankroll ($)` | `600` |

- Leave B1 editable (no formula). Users change this for their bankroll.

---

## TAB 1: "EV Calculator"

### Row 2 — Headers (freeze this row: View → Freeze → 1 row)
| A | B | C | D | E | F | G | H | I | J | K |
|---|----|----|-----|-----|-------------|-------------|-----|-------------|------------------|------|
| Player | Stat | Book | Line | Odds | Your Edge% | Implied Prob | EV% | Kelly Units | Recommendation | Notes |

### Rows 3–52 — Data + formulas (50 rows)

**Columns A–F:** User inputs (no formula).  
**Columns G–K:** Formulas below. **Protect these columns** (right‑click column letter → Protect range → "Only you can edit" OFF for buyers, or give them a copy so they can edit; in the MASTER template you protect G:J so formulas aren’t overwritten).

**Formula reference (row 3 — then fill down to row 52):**

- **G3 — Implied Prob (book’s implied from American odds)**  
  `=IF(E3="","",IF(E3>0,100/(E3+100),ABS(E3)/(ABS(E3)+100)))`

- **H3 — EV% (expected value as decimal, e.g. 0.05 = 5%)**  
  Our prob = Implied + Edge → EV = OurProb × DecimalPayout - (1 - OurProb)  
  `=IF(E3="","",(G3+F3/100)*(IF(E3>0,1+E3/100,1+100/ABS(E3)))-(1-(G3+F3/100)))`

- **I3 — Kelly Units (fraction of bankroll × 100, capped at 5% of bankroll)**  
  Kelly fraction = EV% / (Decimal - 1). Cap at 0.05. Show as "units" (×100).  
  `=IF(E3="","",MIN(H3/((IF(E3>0,1+E3/100,1+100/ABS(E3)))-1),0.05)*100)`

- **J3 — Recommendation**  
  `=IF(E3="","",IF(H3>0.03,"2u BET",IF(H3>0.01,"1u BET","PASS")))`

**Fill down:** Copy G3:J3 down to row 52.

### Conditional formatting (EV% column H)
- Select **H3:H52**.
- Format → Conditional formatting:
  - **Green:** Custom formula `=AND(H3<>"",H3>0.03)` → green fill.
  - **Yellow:** Custom formula `=AND(H3<>"",H3>0.01,H3<=0.03)` → yellow fill.
  - **Red:** Custom formula `=AND(H3<>"",H3<=0.01)` → red fill.

### Freeze
- **View → Freeze → 1 row** (so row 2 headers stay visible).

### Test row (Zion AST example)
| A3 | B3 | C3 | D3 | E3 | F3 |
|----|----|----|----|----|----|
| Zion | AST | FanDuel | 4.5 | 110 | 53 |

- F3 = **Your Fair %** (e.g. 53 = you think 53% over).  
- G3 ≈ 47.62% (implied). **H3 Edge%** = 53% − 47.62% = **5.38%** (calculated).  
- I3 EV% = 53%×2.1 − 47% ≈ **64.3%**. K3 = "2u BET".  
- If you see that, the EV Calculator tab is correct.

---

## TAB 2: "Sample Props"

- **Same structure as Tab 1.** Row 1 = Bankroll ($) in A1, 600 in B1. Row 2 = headers. Rows 3–22 = **20 pre-filled NBA props** (realistic names, stats, books, lines, odds, edge %).
- **Pre-fill at least one row** with Zion AST 4.5 +110, 5% edge → **2u BET** and green EV.
- Use mix: PTS, REB, AST, 3PT, STL, BLK. Use full sportsbook names (e.g. FanDuel, DraftKings, Pinnacle, Kalshi). See SPORTSBOOKS_REFERENCE.md.
- Color-code by **EV%** (same rules: green >3%, yellow 1–3%, red <1%).
- All formula columns (G:J) use the **same formulas** as Tab 1, filled down.

**Sample data for 20 rows is in:** `sample_props_data.csv` (import or paste into Tab 2, then add formulas in G:J).

---

## TAB 3: "Dashboard"

- **Total EV opps found:** `=COUNTIF('EV Calculator'!K:K,"*BET*")` (or count rows where Recommendation contains "BET" on EV Calculator tab).
- **Suggested total units (today):** `=COUNTIF('EV Calculator'!K3:K52,"2u BET")*2+COUNTIF('EV Calculator'!K3:K52,"1u BET")*1`
- **Pie: Stat breakdown**  
  Use columns B (Stat) and a count. In Dashboard, list stats (PTS, REB, AST, 3PT, STL, BLK) and use `=COUNTIF('EV Calculator'!B:B,"PTS")` etc., then Insert → Chart → Pie.
- **Edge% sensitivity table**  
  Small table: "If your edge is 3%, 5%, 7%, 10% on a +110 line, EV% = ?"  
  One row per edge %, one column EV% formula using same logic (Implied 100/210, Our prob = Implied + Edge, EV% = Our*2.1 - (1-Our)). So 3% → 0.506*2.1-0.494 ≈ 5.7%, 5% → 13.1%, etc. Build 4–5 rows so users see how edge changes EV.

### Suggested Dashboard layout (cells)
- **A1:** `Dashboard`
- **A2:** `Total BET opps (EV Calculator):` **B2:** `=COUNTIF('EV Calculator'!K3:K52,"2u BET")+COUNTIF('EV Calculator'!K3:K52,"1u BET")`
- **A3:** `Suggested total units (2u+1u):` **B3:** `=COUNTIF('EV Calculator'!K3:K52,"2u BET")*2+COUNTIF('EV Calculator'!K3:K52,"1u BET")*1`
- **A5:** `Stat breakdown` → **A6:A11** PTS, REB, AST, 3PT, STL, BLK → **B6:** `=COUNTIF('EV Calculator'!B:B,A6)` (fill down).
- **A13:** `Edge sensitivity (example: +110 line)`  
  **A14:** Edge% | **B14:** EV%  
  **A15:** 3% | **B15:** `=(100/210+0.03)*2.1-(1-(100/210+0.03))`  
  **A16:** 5% | **B16:** `=(100/210+0.05)*2.1-(1-(100/210+0.05))`  
  **A17:** 7% | **B17:** `=(100/210+0.07)*2.1-(1-(100/210+0.07))`  
  **A18:** 10% | **B18:** `=(100/210+0.10)*2.1-(1-(100/210+0.10))`  
- Insert **Pie chart** from A6:B11.

---

## Protection (MASTER template)

- **Protect range:** Select **G2:J52** on Tab 1 (and same on Tab 2 if formulas there). Data → Protect sheets and ranges → Add a range → "Formulas" → Set permissions to "Show a warning when editing" so users are prompted before overwriting formulas (or leave editable so they can extend). For "view only" template, don’t lock; users will Make a copy and then they own it.

---

## Public template link

After building: **File → Share → Anyone with the link → Viewer**. Copy link. That’s the "Make a copy" link you give buyers (they open → File → Make a copy).

**POST (Step 1 done):** Public template link + screenshot of EV Calculator tab: Zion row (AST 4.5, +110, 5% edge) with EV% green and Recommendation = "2u BET".
