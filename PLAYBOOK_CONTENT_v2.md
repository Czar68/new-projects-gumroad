# Props EV Blueprint — Playbook v2 (Fair % input)

**Add or replace with this content. Export to PDF as usual.**

---

## NEW SECTION — Your Fair % Input (explained)

**What “Your Fair %” is**  
- You enter **one number**: your estimated probability that the prop hits (e.g. over 4.5 assists).  
- Example: **53** means you think there’s a 53% chance he goes over.  
- The sheet does **not** ask you for “edge.” It **calculates** edge from your fair probability and the book’s odds.

**How it works**  
1. **Implied Prob** (from odds): The book’s implied probability, e.g. +110 → 47.62%.  
2. **Your Fair %**: What you enter (e.g. 53 for 53%).  
3. **Edge% (calculated)**: Edge% = Your Fair % − Implied Prob → e.g. 53% − 47.62% = **5.38%**.  
4. **EV%**: The sheet uses Your Fair % and the odds to compute expected value, then **Kelly Units** and **Recommendation** (2u BET / 1u BET / PASS).

**Why this is easier**  
- No mental math for “what’s my edge?” You only need your estimated true probability (from your model, CLV, or feel).  
- Edge is **calculated** for you. One input → full math.

**Where to get Your Fair %**  
- **Model:** Your own projection (e.g. last 10 games, matchup) → convert to a probability (e.g. 53% over).  
- **Closing line value:** If you bet before the line moved, the closing line’s implied prob can inform your fair %.  
- **Consensus + adjustment:** Start from consensus and adjust for injury/rest; that adjusted number is your fair %.

**Example (Zion 4.5 AST, +110)**  
- Enter **53** in Your Fair %.  
- Sheet shows: Implied 47.62%, Edge% 5.38%, EV% 64.3%, **2u BET**.

---

## Page 3 update — First calculation (Fair % version)

**First calculation (walkthrough)**  
1. Open the **EV Calculator** tab.  
2. Set **Bankroll** (B1) to your bankroll (e.g. 600).  
3. In row 3 enter:  
   - **Player:** e.g. Zion  
   - **Stat:** e.g. AST  
   - **Book:** e.g. FanDuel  
   - **Line:** 4.5  
   - **Odds:** 110 (American)  
   - **Your Fair %:** e.g. **53** (you think 53% chance he goes over)  
4. The sheet shows: **Implied Prob**, **Edge%** (calculated), **EV%**, **Kelly Units**, **Recommendation** (e.g. 2u BET).  
5. Use the **Sample Props** tab for more examples.

---

## Page 4 update — What to enter

- **Your Fair %:** Your estimated probability the prop hits (e.g. 53 for 53%). The sheet calculates edge from this and the odds.  
- **Line** and **Odds:** As before (number and American odds).

---

## Page 5 — Replace “Edge % Explained” with “Your Fair % — Explained”

Use the **NEW SECTION** text above as Page 5 (Your Fair % input explained).

---

## FAQ addition

**Why “Your Fair %” instead of “edge”?**  
So you only think in one number: “How likely do I think this is?” The sheet turns that into edge, EV, and units. Fair % input = 10x easier.

**What if I’m used to “edge”?**  
Edge = Your Fair % − Implied Prob. So if the book implies 47.62% and you think fair is 53%, your edge is 5.38% — the sheet calculates that for you once you enter 53.

---

Use this v2 content in your Google Doc before exporting the PDF. Replace @yourhandle with your handle where needed.
