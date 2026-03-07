# Next project spec: E-commerce Profit & Pricing Calculator

**Codename:** `ecom-profit-sheet`  
**Product name:** E-commerce Profit & Pricing Calculator (Shopify / Etsy / eBay)  
**Price range:** $27–$47 (main tier).

---

## Purpose

Single Google Sheet: sellers enter **cost, list price, platform fee %, shipping** → get **net profit, margin %, break-even price, ROI %**. Supports Shopify, Etsy, eBay in one template (tabs or columns). No subscription; 1,000+ sales potential.

---

## User value

- **Beginner:** "If I sell at $X with Y% fees, what do I make?"
- **Intermediate:** Bulk paste 20 rows; compare platforms; find minimum price for target margin.

---

## Template structure

| Tab / area | Content |
|------------|--------|
| **Inputs** | Product name, COGS, list price, platform (dropdown or tab), fee %, shipping in, shipping out, optional tax. |
| **Outputs** | Net profit, margin %, break-even price, ROI %. Optional: compare 3 platforms side-by-side. |
| **Bulk** | Table: 10–50 rows; same columns; formulas fill down. |
| **Dashboard** | Total profit (sum), avg margin, best/worst SKU. |
| **Instructions** | One tab: how to duplicate, where to get fee %, how to use. |

---

## Formulas (core)

- **Net profit** = List price − COGS − (List price × Fee%) − Shipping_out − (optional tax).
- **Margin %** = Net profit / List price.
- **Break-even price** = (COGS + Shipping_out) / (1 − Fee%).
- **ROI %** = (Net profit / COGS) × 100.

---

## Deliverables (project repo)

- **Sheet:** Google Sheet template (link or copy). Protection: formulas locked; user edits inputs only.
- **PDF:** Short playbook (fee lookup by platform, margin targets, bulk use).
- **Gumroad:** One product; $27 Core Sheet / $47 Sheet + Playbook.

---

## Data and tests

- **data/example_data.csv:** Sample rows (COGS, price, platform, fee %, shipping). Used to validate formulas.
- **tests/golden_output.csv:** Expected profit, margin, break-even for first N rows. Pipeline compares sheet output (or exported CSV) to golden.
- **tests/golden_output_spec.md:** Column definitions and tolerance (e.g. margin within 0.1%).

---

## Automation (master_auto fit)

- **AUTOMATION_SPEC.md:** Project type `spreadsheet`, steps: validate example_data → run formula check (or export sheet CSV) → diff to golden_output → report. No nightly code changes; optional weekly "new idea" cron.

---

## Success criteria

1. Example data runs through sheet; golden_output matches within spec.
2. README_SHIPPABLE + GUMROAD_LAUNCH_PLAN for this product.
3. Smoke test: docs + data + tests present; npm run dry passes.
