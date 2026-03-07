# Audit: Current project state (Props EV Blueprint)

**Date:** 2026-02  
**Repo:** New Project (Props EV Blueprint + new-projects automation)

---

## 1. Current project name and purpose

| Item | Value |
|------|--------|
| **Name** | Props EV Blueprint v1.1 |
| **Purpose** | NBA player props EV calculator (Google Sheet) + Playbook PDF. Enter Fair % → sheet calculates Implied, Edge, EV, Kelly, Rec (2u BET / PASS). One-time $47 digital product for Gumroad. |
| **Target** | r/sportsbook, betting Discords, X. Revenue Day 1 target $376 (8 × $47). |

---

## 2. What is 90% done vs what still blocks Gumroad

**90% done**
- Sheet spec and formulas (G3 Implied, H3 Edge, I3 EV, J3 Kelly, K3 Rec); Fair % → Edge calculated.
- Instructions tab content (INSTRUCTIONS_TAB_CONTENT.md); protection steps (PROTECTION_STEPS.md).
- Certified doc (SHEET_CERTIFIED_v1.1.md); pricing ($27 / $47 / $97); Gumroad copy (GUMROAD_UPSELL_COPY.md, GUMROAD_DESCRIPTION_v2.md).
- Launch plan (PHASE10, PHASE5 acquirers); DAY1_SALES_TRACKING.csv; PROPS_EV_SHEET_LINK.txt (holder).
- Playbook content (PLAYBOOK_CONTENT_v2.md). File map and next steps (NEXT_STEPS_TO_COMPLETE.md, GUMROAD_LIVE_CHECKLIST.md).

**Still blocks Gumroad**
- **Sheet finalization (manual):** Tab 4 "📖 Instructions" pasted into live sheet; A1:K52 protected; one prop test (Zion 53% → 2u BET); "Make a copy" link updated in PROPS_EV_SHEET_LINK.txt.
- **PDF:** Playbook exported from Google Doc as PDF (e.g. Props-EV-Blueprint-Playbook.pdf).
- **Gumroad page:** Product created, $47 Pro tier, copy pasted, PDF + sheet link attached, tags set, Publish, test purchase.
- **Screenshots:** 5–7 product screenshots not yet taken (sheet Zion row, dashboard, Instructions tab, etc.).
- **Demo video:** Optional; no script or asset yet.

---

## 3. Exact polish items

| Category | Item | Status |
|----------|------|--------|
| **README** | README_SHIPPABLE.md (Gumroad-ready one-pager) | To create |
| **Screenshots** | 5–7 shots: Zion row, dashboard, Instructions, Rec column, full sheet, make a copy, optional receipt | Spec in screenshots/README.md |
| **Pricing** | $47 main; $27 / $97 tiers in PRICING_TIERS.md | Done |
| **Gumroad page** | Headline, body, CTA from GUMROAD_UPSELL_COPY + GUMROAD_DESCRIPTION_v2 | Done (user to paste) |
| **Demo video** | demo/demo_video_script.md (30–60 sec script) | To create |

---

## 4. Final test checklist

- [ ] Sheet: Tab "📖 Instructions" exists and matches INSTRUCTIONS_TAB_CONTENT.md.
- [ ] Sheet: Range A1:K52 protected; only Fair % / Line / Odds editable by viewer/copy.
- [ ] Sheet: New prop row: enter Fair % 53, Line, Odds → Implied, Edge ~5.38%, Rec "2u BET" (green).
- [ ] Sheet: Dashboard COUNTIF(K:K,"2u BET") returns correct count.
- [ ] File → Share → Anyone with link can view; "Make a copy" works; PROPS_EV_SHEET_LINK.txt has final link.
- [ ] PDF playbook: exported, opens, "Make Your Copy" page has sheet link.
- [ ] Gumroad: product live, $47, PDF + PROPS_EV_SHEET_LINK.txt (or link in PDF) attached.
- [ ] Test purchase: receive PDF + sheet link; copy sheet → Zion row shows 2u BET.

---

## 5. Gumroad upload checklist

- [ ] Product name: "Props EV Blueprint v1.1" (or "Props EV Blueprint — NBA Player Props Calculator + Playbook").
- [ ] Price: $47 (Pro + Playbook). Optional variants $27 / $97.
- [ ] Headline: "EV Calc That Pays For Itself In 1 Bet".
- [ ] Body: Zion proof + tier blurb (GUMROAD_UPSELL_COPY.md).
- [ ] Attach: Props-EV-Blueprint-Playbook.pdf, PROPS_EV_SHEET_LINK.txt, (optional) SHEET_CERTIFIED_v1.1.md.
- [ ] Tags: NBA props, sports betting, EV calculator, Kelly.
- [ ] Publish → Test purchase → Save product URL.
