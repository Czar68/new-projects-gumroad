# Sportsbooks Reference — Props EV Blueprint

Use **full book names** in the Sheet **Book** column so it’s clear and consistent. Avoid abbreviations that could be confused (e.g. "PP" for multiple books).

---

## Stat column — use these (no times)

| Stat  | Meaning              | Don’t use |
|-------|----------------------|-----------|
| PTS   | Points               | —         |
| REB   | Rebounds             | —         |
| AST   | Assists              | —         |
| **3PT** | Three-pointers made | **3PM** (Sheets may parse as 3:00 PM) |
| STL   | Steals               | —         |
| BLK   | Blocks               | —         |

**Why 3PT not 3PM:** In Google Sheets, "3PM" in a cell is often treated as 3:00 PM. Use **3PT** so the Stat column stays text and the sheet doesn’t show times.

---

## Sportsbooks in sample data (full names)

**US legal (major)**  
- FanDuel  
- DraftKings  
- BetMGM  
- Caesars  
- PointsBet  
- BetRivers  
- ESPN BET  
- WynnBET  

**Prop / alternate markets**  
- Kalshi  
- Novig  
- Prophet Exchange  

**International / offshore (commonly used)**  
- Pinnacle  
- BetUS  
- Rebet  
- MyBookie  
- bet365  
- Bovada  
- Unibet  

You can add more (e.g. Borgata, Circa, SuperBook) in the Book column as needed.

---

## Wire by state (later)

For a future version you could:

- Add a **State** column or a separate tab listing which books are available/legal by state.
- Or link to a single source (e.g. “Check [sportsbook] for your state” in the playbook).

No change to formulas is required; this would be extra reference only.

---

## Quick reference for the Sheet

**Stats:** PTS | REB | AST | 3PT | STL | BLK  

**Books (examples):** FanDuel, DraftKings, BetMGM, Caesars, PointsBet, BetRivers, ESPN BET, WynnBET, Kalshi, Novig, Prophet Exchange, Pinnacle, BetUS, Rebet, MyBookie, bet365, Bovada, Unibet
