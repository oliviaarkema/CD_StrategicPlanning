These files aren't wired to any stat card, chart, or table on the dashboard
(app.js/index.html don't reference or reconcile against them). Moved here
instead of deleted so nothing gets lost. Checked by content, not just by
filename — a few of these share a name with a live panel title but the
panel's real data comes from elsewhere.

- **Empty templates** (headers/row labels only, no values were ever filled
  in): Annual Downtime by Cause, Cases by Product, Cost Line Item Detail,
  Cost Structure, Cost per Ton by Crop, Fixed vs. Variable Costs - Stat
  Cards, KPI vs Industry Benchmark, Milk Products - Stat Cards, Monthly
  Case Volume, Monthly Cost Stack, Monthly Production - TTM Jul 2025 vs
  TTM Jul 2026, Plant Efficiency - Stat Cards, Revenue & Profit Margin by
  Product, Revenue & Profit Margin by Customer, Herd Quality Benchmarks,
  Penetration by Range & Customer Type, A2 Status of Milking Herd.

- **Superseded** (had real data, but the dashboard now uses a different,
  more current source for that same chart): Customer Cases by Distance.xlsx
  (an old 5-band case-volume aggregate; the live scatter chart plots
  per-customer points in a 7-band scheme instead). Yield vs Michigan
  Benchmark.xlsx (benchmarks crop yields against the Michigan state
  average; the live chart benchmarks against Oceana County instead, a
  deliberate refinement — see the Crop Efficiency appendix).

If real data shows up for any of these, move the file back to `data/` and
wire it into a chart/table with a source citation, matching how everything
else in `data/` is cited in app.js or index.html's footnotes.
