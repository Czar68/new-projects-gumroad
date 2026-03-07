# CSV import → Sheet in 5 minutes

## 1. Import the CSV

1. Open your **Props EV Blueprint - MASTER** sheet:  
   https://docs.google.com/spreadsheets/d/1Dd6JwZBdQq6x80dXZOYuGEBPNtYPVXAhvkDznQYWpvQ/edit
2. **File → Import → Upload** → choose `PROPS_EV_IMPORT_FOR_SHEET.csv`.
3. **Import location:** Replace current sheet (or “Insert new sheet(s)” if you prefer).
4. Click **Import data**.

## 2. Add formulas (columns G, H, I, J)

Paste each formula into the first **data** row (row **3**), then fill down to row **52**.

**G3 — Implied Prob**
```
=IF(E3="","",IF(E3>0,100/(E3+100),ABS(E3)/(ABS(E3)+100)))
```

**H3 — EV%**
```
=IF(E3="","",(G3+F3/100)*(IF(E3>0,1+E3/100,1+100/ABS(E3)))-(1-(G3+F3/100)))
```

**I3 — Kelly Units**
```
=IF(E3="","",MIN(H3/((IF(E3>0,1+E3/100,1+100/ABS(E3)))-1),0.05)*100)
```

**J3 — Recommendation**
```
=IF(E3="","",IF(H3>0.03,"2u BET",IF(H3>0.01,"1u BET","PASS")))
```

- Select **G3:J3** → copy → select **G3:J52** → paste (or drag the fill handle down to row 52).

## 3. Check

- Row 3 (Zion): EV% about 13%, Recommendation **2u BET**, cell H3 green (conditional format if you added it).
- **View → Freeze → 2 rows** so Bankroll and headers stay visible.

## 4. Optional: conditional format

- Select **H3:H52** → **Format → Conditional formatting**:
  - Green: `=AND(H3<>"",H3>0.03)`
  - Yellow: `=AND(H3<>"",H3>0.01,H3<=0.03)`
  - Red: `=AND(H3<>"",H3<=0.01)`

Done. Use this tab as **EV Calculator**. Duplicate for **Sample Props** or paste the same formulas there; add **Dashboard** per SHEET_SPEC_Props_EV_Blueprint.md.
