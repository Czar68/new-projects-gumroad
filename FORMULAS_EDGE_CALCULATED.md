# Edge calculated from "Your Fair %"

**Change:** You enter **Your Fair %** (your estimated true probability, e.g. 55 for 55%). The sheet **calculates** Edge% = Your Fair % − Implied Prob, then EV and the rest.

---

## 1. Add one column and rename

- **Insert a column** after **Odds** (so current F becomes G, G→H, etc.). Or rename and shift so you have room.
- **New layout:**

| A     | B    | C    | D   | E   | F             | G            | H      | I    | J    | K               | L     |
|-------|------|------|-----|-----|---------------|--------------|--------|------|------|-----------------|-------|
| Player| Stat | Book | Line| Odds| **Your Fair %**| Implied Prob | **Edge%** | EV%  | Kelly| Recommendation  | Notes |

So: **F = Your Fair %** (input), **G = Implied Prob**, **H = Edge%** (calculated), **I = EV%**, **J = Kelly**, **K = Recommendation**, **L = Notes**.

If you don’t want to insert a column, you can overwrite in place: F = Your Fair %, G = Implied Prob, H = Edge%, I = EV%, J = Kelly, K = Recommendation, K or L = Notes.

---

## 2. Formulas (row 3, then fill down)

**G3 — Implied Prob**
```
=IF(E3="","",IF(E3>0,100/(E3+100),ABS(E3)/(ABS(E3)+100)))
```

**H3 — Edge% (calculated)**
```
=IF(E3="","",IF(F3="","",F3/100-G3))
```
Format column H as **Percent**.

**I3 — EV%**
```
=IF(E3="","",IF(F3="","",(F3/100)*(IF(E3>0,1+E3/100,1+100/ABS(E3)))-(1-(F3/100))))
```
Format column I as **Percent**.

**J3 — Kelly Units**
```
=IF(E3="","",IF(F3="","",MIN(I3/((IF(E3>0,1+E3/100,1+100/ABS(E3)))-1),0.05)*100))
```

**K3 — Recommendation**
```
=IF(E3="","",IF(F3="","",IF(I3>0.03,"2u BET",IF(I3>0.01,"1u BET","PASS"))))
```

Fill **G3:K3** down to row 52.

---

## 3. What to put in F (Your Fair %)

- Your **estimated probability** the prop hits (e.g. over 4.5 AST).
- Examples: **53** = 53%, **55** = 55%, **48** = 48%.
- The sheet then computes:
  - **Edge%** = Your Fair % − Implied Prob (e.g. 53% − 47.62% = 5.38%).
  - **EV%** and **Recommendation** from Your Fair % and the odds.

---

## 4. Zion example

- Line 3: Zion, AST, FanDuel, 4.5, 110, **53** (your fair %).
- G3 ≈ 47.62%, H3 ≈ 5.38%, I3 ≈ 64.3%, K3 = "2u BET".
- Conditional format on **I3:I52** (EV%): green >3%, yellow 1–3%, red ≤1%.

---

## 5. Dashboard (if you use one)

- Recommendation is now in column **K**. Use **K** in any COUNTIF/SUMIF (e.g. `COUNTIF('EV Calculator'!K3:K52,"2u BET")`).
