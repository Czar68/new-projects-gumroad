# Golden output spec (E-commerce Profit & Pricing)

**Source:** data/example_data.csv run through sheet formulas.  
**Reference:** tests/golden_output.csv. Tolerance: margin_pct ±0.5%; net_profit ±$0.05.

## Formulas used

- **fee_amount** = list_price × (fee_pct / 100)
- **net_profit** = list_price − cogs − fee_amount − shipping_out
- **margin_pct** = (net_profit / list_price) × 100
- **break_even_price** = (cogs + shipping_out) / (1 − fee_pct/100)
- **roi_pct** = (net_profit / cogs) × 100

## Column order

product_name, net_profit, margin_pct, break_even_price, roi_pct

## Excel export

If sheet is exported to Excel: same column names; numeric columns formatted. golden_output.xlsx can be generated from golden_output.csv for Excel-based validation.
