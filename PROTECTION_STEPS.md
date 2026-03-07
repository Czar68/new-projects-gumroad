# Cell protection steps (exact menu clicks)

**Goal:** Formulas (A1:K52) protected; only you can edit them. Users edit **Fair %**, **Line**, and **Odds** only.

---

## 1. Protect the sheet (formulas only editable by you)

1. **Select range:** Click column header **A**, then Shift+Click column **K** (or select **A1:K52**).
2. **Right-click** → **Protect range** (or **Data** → **Protect sheets and ranges**).
3. In the sidebar:
   - **Description:** e.g. `Formulas A1:K52`
   - Click **Set permissions**.
   - Choose **Restrict who can edit this range** → **Only you** (or your account).
4. Click **Done**.

---

## 2. Allow editing only in Fair %, Line, Odds columns

**Option A – Unprotected columns (simplest)**  
- Leave **Fair %**, **Line**, and **Odds** columns **out** of the protected range.  
- Protect only the columns that contain formulas (e.g. Implied, Edge, EV, Kelly, Rec and any fixed labels).  
- So: protect everything **except** the Fair %, Line, Odds columns (adjust range to match your layout, e.g. protect **A:B** and **G:K** if Fair%, Line, Odds are in C, D, E or similar).

**Option B – Two ranges**  
1. **Range 1:** Formula cells only (e.g. G2:K52 + any formula cells in A/B).  
   - **Data** → **Protect sheets and ranges** → Add range → **Only you** can edit.  
2. **Range 2:** Do **not** add Fair % / Line / Odds to any protected range, so anyone with edit access can change those.

**Exact clicks (single full-sheet protection, then exclude Fair/Line/Odds):**

1. **Data** → **Protect sheets and ranges**.
2. **Add a sheet or range**.
3. Enter range: **A1:K52**.
4. **Set permissions** → **Restrict who can edit this range** → **Only you** → **Done**.
5. Then **Add another range**: the **Fair %**, **Line**, **Odds** columns (e.g. if they’re columns C, D, E from row 2 to 52).  
   - Set permission: **Everyone with edit access** can edit this range.  
   - This “exception” range must be added **after** the main protection so that only these cells are editable by others.

*(In Google Sheets, “exception” is done by adding a second range with wider permissions; the smaller range overrides the sheet protection for those cells.)*

---

## 3. Lock other tabs first (before Instructions tab)

1. For **each** tab except **📖 Instructions**:  
   **Right-click tab** → **Protect sheet** (or **Data** → **Protect sheets and ranges** → apply to that sheet).  
   Set to **Only you** can edit.
2. Add tab **📖 Instructions** last; leave it unprotected (or protect with “Only you” if you don’t want anyone to change the instructions).

---

## 4. Quick reference

| What                | Action                                      |
|---------------------|---------------------------------------------|
| Protect A1:K52      | Data → Protect sheets and ranges → A1:K52   |
| Only you edit       | Set permissions → Restrict → Only you       |
| Users edit Fair/Line/Odds | Don’t protect those columns, or add exception range |
| Lock other tabs     | Right-click tab → Protect sheet → Only you |
