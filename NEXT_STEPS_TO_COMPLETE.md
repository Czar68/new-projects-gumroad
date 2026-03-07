# Next Steps to Complete Props EV Blueprint

**Current state:** Sheet exists with old layout (Your Edge%, no calculated Edge%). Gumroad product not created yet. Playbook not exported as PDF. No launch posts.

**Goal:** Sheet upgraded → PDF ready → Gumroad LIVE → Test purchase → Launch (Reddit, Discord, X).

---

## STEP 1: Upgrade the sheet (20–25 min)

**In your [Props EV Blueprint - MASTER](https://docs.google.com/spreadsheets/d/1Dd6JwZBdQq6x80dXZOYuGEBPNtYPVXAhvkDznQYWpvQ/edit?usp=sharing) sheet:**

1. **Rename column F**  
   Change header from "Your Edge%" to **"Your Fair %"**. (You’ll enter your estimated probability, e.g. 53 for 53%.)

2. **Insert one column** after F (so current G becomes H, H→I, I→J, J→K, K→L).  
   New column **G** = **Implied Prob**, **H** = **Edge%** (calculated), **I** = EV%, **J** = Kelly, **K** = Recommendation, **L** = Notes.

3. **Set row 2 headers**  
   A2: Player | B2: Stat | C2: Book | D2: Line | E2: Odds | F2: Your Fair % | G2: Implied Prob | H2: Edge% | I2: EV% | J2: Kelly Units | K2: Recommendation | L2: Notes

4. **Paste formulas in row 3** (then fill down to row 52):
   - **G3:** `=IF(E3="","",IF(E3>0,100/(E3+100),ABS(E3)/(ABS(E3)+100)))`
   - **H3:** `=IF(E3="","",IF(F3="","",F3/100-G3))`
   - **I3:** `=IF(E3="","",IF(F3="","",(F3/100)*(IF(E3>0,1+E3/100,1+100/ABS(E3)))-(1-(F3/100))))`
   - **J3:** `=IF(E3="","",IF(F3="","",MIN(I3/((IF(E3>0,1+E3/100,1+100/ABS(E3)))-1),0.05)*100))`
   - **K3:** `=IF(E3="","",IF(F3="","",IF(I3>0.03,"2u BET",IF(I3>0.01,"1u BET","PASS"))))`

5. **Convert F to Fair % for existing rows**  
   For each row with data: Fair % = Implied Prob + old Edge.  
   Example: Zion row had Edge 5, Implied 47.62% → put **53** in F3 (47.62+5≈53). Do the same for rows 4–22 (Implied + Edge ≈ Fair %).

6. **Format**  
   Format **G3:G52**, **H3:H52**, **I3:I52** as **Percent**.

7. **Conditional formatting**  
   Select **I3:I52** → Format → Conditional formatting:  
   Green `=AND(I3<>"",I3>0.03)` | Yellow `=AND(I3<>"",I3>0.01,I3<=0.03)` | Red `=AND(I3<>"",I3<=0.01)`.

8. **Dashboard tab**  
   If you have a Dashboard, change any **J** references (Recommendation) to **K** (e.g. `COUNTIF(...,K3:K52,"2u BET")`).

9. **Share**  
   File → Share → Anyone with the link → **Viewer**. Copy the link (you’ll use it in Gumroad).

**Check:** Zion row with **53** in F3 should show Edge% ≈ 5.38%, EV% ≈ 64.3%, **2u BET**. Take a screenshot of row 3.

---

## STEP 2: Export the PDF playbook (15 min)

1. Open **PLAYBOOK_CONTENT_v2.md** in your project (or the “Fair % explained” section from it).
2. Create a new **Google Doc** and paste in the full playbook (original PLAYBOOK_CONTENT.md + the new “Your Fair % input explained” section from PLAYBOOK_CONTENT_v2.md).
3. Replace **@yourhandle** with your X or Discord handle.
4. **File → Download → PDF Document (.pdf)**. Save as something like `Props-EV-Blueprint-Playbook.pdf`.

---

## STEP 3: Gumroad LIVE (20 min)

1. Go to **Gumroad.com** → sign in → **Products** → **New product**.
2. **Product name:** Props EV Blueprint — NBA Player Props Calculator + Playbook  
3. **Price:** $47. Add optional variant: $67 (e.g. “+ Loom walkthrough + 3 sample weeks”).
4. **Description:** Paste from **GUMROAD_DESCRIPTION_v2.md** (headline, subhead, body).
5. **Delivery:**  
   - Attach **Props-EV-Blueprint-Playbook.pdf**.  
   - Attach **PROPS_EV_SHEET_LINK.txt** (from your project folder; it already has your sheet link).  
   Or put the sheet link in the PDF and attach only the PDF — your choice.
6. **Summary / tags:** e.g. “NBA props EV calculator. Your Fair % → edge calculated. Sheet + playbook, $47.” Tags: nba props, sports betting, ev calculator, betting sheet.
7. **Publish** the product and copy the **live product URL**.

---

## STEP 4: Test purchase (10 min)

1. Buy your own product ($1 test or full $47).
2. Confirm you receive the PDF and the sheet link (or instructions in the PDF).
3. Open the sheet link → File → Make a copy → confirm it opens and row 3 (Zion, 53) shows Edge% and 2u BET.
4. Screenshot the receipt and the “delivered” files for your records.

---

## STEP 5: Launch (30–45 min)

1. **Reddit (r/sportsbook)**  
   Use **LAUNCH_AND_SALES_GUIDE.md** Section 2: value-first post (method + screenshot), **no link in the post body**. In your **first comment**, add: “Template + playbook link for anyone who wants it: [your Gumroad URL].”

2. **Discord**  
   DM a mod (use the exact DM from LAUNCH_AND_SALES_GUIDE Section 3.2). After approval, post once in #tools or #resources with the short message + Gumroad link.

3. **X (Twitter)**  
   Post the 5–7 tweet thread from the Launch Guide (Section 4). Include the sheet screenshot and the Gumroad link in the last tweet. Pin that tweet for 24–48 hours.

4. **Track**  
   Use **DAY1_SALES_TRACKING.csv** (or your own sheet): # | Date | Source | Amount | Notes. Update after each sale.

---

## Quick reference — file map

| You need… | Use this file |
|-----------|----------------|
| Sheet formulas | **FORMULAS_EDGE_CALCULATED.md** or **PHASE8_SHEET_CERTIFICATION.md** |
| Sheet link for buyers | **PROPS_EV_SHEET_LINK.txt** (already has your link) |
| Playbook text (Fair %) | **PLAYBOOK_CONTENT_v2.md** + **PLAYBOOK_CONTENT.md** |
| Gumroad copy | **GUMROAD_DESCRIPTION_v2.md** |
| Launch posts | **LAUNCH_AND_SALES_GUIDE.md** (Reddit, Discord, X) |
| Acquirers / DMs | **PHASE5_ACQUIRERS_AND_LAUNCH.md** |
| Day 1 tracking | **DAY1_SALES_TRACKING.csv** |

---

## Order of execution

1. **Sheet** (Step 1) → screenshot Zion row.  
2. **PDF** (Step 2).  
3. **Gumroad** (Step 3) → test purchase (Step 4).  
4. **Launch** (Step 5): Reddit → Discord → X.

After Step 4 you can post the **FINAL MILESTONE** from PHASE6 or PHASE7 (“Gumroad LIVE, Sheet link, PDF, test purchase success, Day 1 target $376”).
