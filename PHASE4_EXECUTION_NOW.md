# PHASE 4: Manual Execution + Live Launch (90 mins)

**You do these 4 steps.** Use this file as your single runbook. POST each block when done.

---

## Step 1: BUILD SHEET (30 mins)

### Do this
1. **Google Sheets** → Blank → Name: `Props EV Blueprint - MASTER`
2. **Tab 1 "EV Calculator":**
   - **Row 1:** A1 = `Bankroll ($)`, B1 = `600`
   - **Row 2 (headers):** A2=Player, B2=Stat, C2=Book, D2=Line, E2=Odds, F2=Your Edge%, G2=Implied Prob, H2=EV%, I2=Kelly Units, J2=Recommendation, K2=Notes
   - **Row 3:** A3=Zion, B3=AST, C3=PP, D3=4.5, E3=110, F3=5
   - **Formulas (row 3, then fill down to row 52):**
     - G3: `=IF(E3="","",IF(E3>0,100/(E3+100),ABS(E3)/(ABS(E3)+100)))`
     - H3: `=IF(E3="","",(G3+F3/100)*(IF(E3>0,1+E3/100,1+100/ABS(E3)))-(1-(G3+F3/100)))`
     - I3: `=IF(E3="","",MIN(H3/((IF(E3>0,1+E3/100,1+100/ABS(E3)))-1),0.05)*100)`
     - J3: `=IF(E3="","",IF(H3>0.03,"2u BET",IF(H3>0.01,"1u BET","PASS")))`
   - **Conditional format:** Select H3:H52 → Format → Conditional formatting → Green: `=AND(H3<>"",H3>0.03)` | Yellow: `=AND(H3<>"",H3>0.01,H3<=0.03)` | Red: `=AND(H3<>"",H3<=0.01)`
   - **View → Freeze → 2 rows**
3. **Tab 2 "Sample Props":** Same row 1–2. Paste `sample_props_data.csv` into A3:F22. Copy G3:J3 from Tab 1 into G3:J22. Apply same conditional format to H3:H22.
4. **Tab 3 "Dashboard":** Per SHEET_SPEC_Props_EV_Blueprint.md (totals, pie, edge sensitivity table).
5. **Share:** File → Share → Anyone with the link → **Viewer**. Copy link.

### Test
- Zion row: EV% green, ~13% (or >3%), Recommendation = **2u BET**.

---

### POST (after Step 1)

```
STEP 1 DONE — Sheet built.
• Template link (Make a copy): [PASTE YOUR SHEET VIEW-ONLY LINK]
• Screenshot: [ATTACH — EV Calculator tab, Zion row green, "2u BET"]
```

---

## Step 2: PDF EXPORT (15 mins)

### Do this
1. **Google Docs** → Blank → Paste full content from `PLAYBOOK_CONTENT.md`
2. Replace `@yourhandle` with your X/Discord handle
3. Format: Title (Cover), Heading 1 per section, Heading 2 for subsections
4. **File → Download → PDF Document (.pdf)**  
   Save as: `Props-EV-Blueprint-Playbook.pdf`

### Optional
- Upload PDF to Google Drive → Get link (Anyone with link can view) for “PDF link” in final post.

---

### POST (after Step 2)

```
STEP 2 DONE — Playbook exported.
• PDF: [PASTE download link or Drive view link]
```

---

## Step 3: GUMROAD LIVE (30 mins)

### Do this
1. **Gumroad.com** → New product
2. Follow **GUMROAD_LIVE_CHECKLIST.md** exactly:
   - Name, $47, optional $67 tier
   - Headline, subhead, body, CTA from checklist
   - Attach: **PDF** + **PROPS_EV_SHEET_LINK.txt** (paste your Sheet view link into that file first)
   - Tags, summary → **Publish LIVE**
3. Copy the live product URL

---

### POST (after Step 3)

```
STEP 3 DONE — Gumroad LIVE.
• Gumroad URL: [PASTE LIVE PRODUCT URL]
```

---

## Step 4: VALIDATE + FINAL POST (15 mins)

### Do this
1. **Test purchase:** $1 test product or Gumroad test mode → buy → confirm you get PDF + sheet link
2. **Screenshot:** Receipt + delivery (files received)
3. **5 acquirers:** Fill the list below (DM targets for exit)
4. Copy the **FINAL MILESTONE** block below, fill in all [brackets], then POST it.

### 5 DM targets (acquirers — fill before FINAL POST)

| # | Who (type)           | Where to DM / Email        |
|---|----------------------|----------------------------|
| 1 | Betting Discord owner | [server name / handle]    |
| 2 | Betting Discord owner | [server name / handle]    |
| 3 | Betting / NBA Twitter | [@handle]                 |
| 4 | Indie betting tools   | [site or @handle]         |
| 5 | Tipster / course seller | [email or @handle]      |

---

### FINAL MILESTONE — Copy, fill, POST

```
🎉 PROPS EV BLUEPRINT LIVE!

✅ Gumroad: [LIVE URL]
✅ Sheet: [TEMPLATE LINK]
✅ PDF: [DOWNLOAD LINK]
✅ Test Purchase: ✅ Success (screenshot)
✅ Launch Guide: LAUNCH_AND_SALES_GUIDE.md ready

Day 1 Target: $376 (8 × $47)
Acquirers: 5 DM targets listed

NEXT: Execute LAUNCH_AND_SALES_GUIDE.md → Reddit → Discord → X.
```

---

## After you POST the final milestone

- Execute **LAUNCH_AND_SALES_GUIDE.md**: Reddit (value-first post + link in comments) → Discord (with permission) → X (5–7 tweet thread).
- Track sales by source; update “X copies sold” on Gumroad when you have numbers.

**90 mins to LIVE. Start with the Sheet.**
