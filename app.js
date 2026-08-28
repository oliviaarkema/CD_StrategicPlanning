const fmt   = n => n.toLocaleString("en-US");
const fmtD  = n => "$" + n.toLocaleString("en-US");
const fmtK  = n => "$" + (n/1000).toFixed(0) + "K";
const fmtM  = n => "$" + (n/1e6).toFixed(2) + "M";

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  green:   "#074d1a",
  kelly:   "#3dae2b",
  mid:     "#1a6b35",
  light:   "#5ab547",
  muted:   "#9ab09a",
  amber:   "#d97706",
  red:     "#dc2626",
  blue:    "#2563eb",
};
const gridColor  = () => getComputedStyle(document.documentElement).getPropertyValue("--chart-grid").trim();
const textColor  = () => getComputedStyle(document.documentElement).getPropertyValue("--chart-text").trim();

// ─── Chart defaults ──────────────────────────────────────────────────────────
function setupChartDefaults() {
  Chart.defaults.font.family = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
  Chart.defaults.font.size = 12;
  Chart.defaults.color = textColor();
  Chart.defaults.borderColor = gridColor();
}

// ─── Section switching ───────────────────────────────────────────────────────
const sectionInit = {};
function showSection(name) {
  document.querySelectorAll(".page-section").forEach(s =>
    s.classList.toggle("active", s.id === "sec-" + name));
  document.querySelectorAll("nav.topnav button").forEach(b =>
    b.classList.toggle("active", b.dataset.section === name));
  if (!sectionInit[name]) {
    sectionInit[name] = true;
    initSection(name);
  }
}
document.querySelectorAll("nav.topnav button").forEach(b =>
  b.addEventListener("click", () => { showSection(b.dataset.section); closeNavMenu(); }));

// ─── Section nav: hamburger popout menu ────────────────────────────────────────
const menuBtn = document.getElementById("menuBtn");
const topnavEl = document.getElementById("topnav");
function closeNavMenu() {
  topnavEl.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
}
function openNavMenu() {
  topnavEl.classList.add("open");
  menuBtn.setAttribute("aria-expanded", "true");
}
menuBtn.addEventListener("click", e => {
  e.stopPropagation();
  topnavEl.classList.contains("open") ? closeNavMenu() : openNavMenu();
});
document.addEventListener("click", e => {
  if (!topnavEl.contains(e.target) && e.target !== menuBtn) closeNavMenu();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeNavMenu(); });

// ─── Init dispatcher ─────────────────────────────────────────────────────────
function initSection(name) {
  ({home:initHome, milk:initMilk, animals:initAnimals,
    rawmilk:initRawMilk, plant:initPlant, crops:initCrops, costs:initCosts,
    market:initMarket, growth:initGrowth}[name] || (()=>{}))();
}

// ─── Print / export current page as PDF ───────────────────────────────────────
// Uses the browser's native print-to-PDF (no external library needed). Chart.js
// canvases are sized to their on-screen container by default, so if print layout
// ever changes a container's width, the canvas would print at the wrong size —
// resizing every live chart right before printing keeps them correctly sized for
// whatever the print page's layout ends up being, avoiding cut-off/blank charts.
let printPrevTitle = document.title;
document.getElementById("printPageBtn")?.addEventListener("click", () => {
  const h2 = document.querySelector(".page-section.active h2");
  const pageName = h2 ? h2.textContent.trim() : "Dashboard";
  printPrevTitle = document.title;
  document.title = `Country Dairy - ${pageName} - ${new Date().toISOString().slice(0,10)}`;
  window.print();
});
window.addEventListener("beforeprint", () => {
  Object.values(Chart.instances || {}).forEach(c => { try { c.resize(); } catch(e) {} });
});
window.addEventListener("afterprint", () => {
  document.title = printPrevTitle;
  Object.values(Chart.instances || {}).forEach(c => { try { c.resize(); } catch(e) {} });
});

// Chart.js's own ResizeObserver-driven auto-resize can occasionally leave a
// stacked bar chart's layout stale after a window resize (e.g. maximizing,
// or a DPI/zoom change) — force every live chart to recompute its layout
// and repaint once things settle, same fix already applied around print above.
let resizeChartsTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeChartsTimer);
  resizeChartsTimer = setTimeout(() => {
    Object.values(Chart.instances || {}).forEach(c => { try { c.resize(); } catch(e) {} });
  }, 150);
});

// ═══════════════════════════════════════════════════════════════════════════════
//  HOME
// ═══════════════════════════════════════════════════════════════════════════════
function initHome() {
  document.getElementById("h-rev").textContent   = "$675,589";
  document.getElementById("h-rev-d").textContent = "▲ 108.4% vs Annual Jul 2025";
  document.getElementById("h-revenue").textContent   = "$25,483,840";
  document.getElementById("h-revenue-d").textContent = "▼ 2.3% vs Annual Jul 2025 ($26,079,541)";
  // Milk Sold = Raw Milk Production page's Annual Production, converted to cwt
  // (4,200,548 / 4,020,672 gal at 8.6 lbs/gal, same TTM windows).
  document.getElementById("h-cwt").textContent   = "361,247";
  document.getElementById("h-cwt-d").textContent = "▲ 4.5% vs TTM Jul 2025 (345,778)";
  document.getElementById("h-cows").textContent  = "1,085";
  document.getElementById("h-cows-d").textContent= "▲ 7.5% vs year ago (1,009)";
  document.getElementById("h-acres").textContent = "2,500";

  const months = [
    "Jul '24","Aug '24","Sep '24","Oct '24","Nov '24","Dec '24",
    "Jan '25","Feb '25","Mar '25","Apr '25","May '25","Jun '25",
    "Jul '25","Aug '25","Sep '25","Oct '25","Nov '25","Dec '25",
    "Jan '26","Feb '26","Mar '26","Apr '26","May '26","Jun '26",
  ];
  // Monthly Revenue vs. Operating Costs.xlsx, Jul 2024-Jun 2026. Through Dec 2025,
  // the books credited Casey for raw milk production and debited Nate for the milk
  // cost as an offsetting wash entry that inflated both Revenue and COGS by the same
  // amount each month; that practice stopped in January 2026 (net income unaffected
  // either way). To keep the series on one consistent basis, Jul'24-Dec'25 below
  // uses the "adj" sheet (which restates that wash entry back in) instead of the
  // "Data" sheet's un-restated figures for those months; Jan'26-Jun'26 uses the
  // "Data" sheet's Revenue $ and Operating Costs $ (COGS + Expenses) columns
  // directly, since those months were never washed to begin with.
  const rev  = [
    2349438, 2299610, 2055377, 2225430, 2138141, 2086631,
    2079507, 1772753, 2087068, 2184308, 2277922, 2523351,
    2585013, 2466680, 2244856, 2418070, 1972220, 2411809,
    1686045, 1646609, 1861769, 2062624, 2028185, 2099555,
  ];
  const cost = [
    2115213, 2313676, 2108503, 2038955, 2093132, 2144030,
    2199971, 1808808, 2012894, 2178820, 2211062, 2431456,
    2585382, 2303469, 2303836, 2609718, 2088374, 2216423,
    1608831, 1584523, 1734346, 1971756, 1830498, 1891915,
  ];
  const netIncome = rev.map((r,i) => r - cost[i]);

  new Chart(document.getElementById("homeRevChart"), {
    type: "line",
    data: {
      labels: months,
      datasets: [
        { label:"Revenue", data: rev,
          borderColor: C.kelly, backgroundColor:"rgba(61,174,43,0.12)",
          fill: true, tension:.35, pointRadius:3, pointHoverRadius:5 },
        { label:"Costs", data: cost,
          borderColor: C.muted, backgroundColor:"transparent",
          borderDash:[5,4], tension:.35, pointRadius:3, pointHoverRadius:5 },
        { label:"Net Income", data: netIncome,
          borderColor: C.blue, backgroundColor:"rgba(37,99,235,0.15)",
          fill:"origin", tension:.35, pointRadius:3, pointHoverRadius:5 },
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins: { legend:{position:"top"},
        tooltip:{callbacks:{label: c => c.dataset.label + ": " + fmtD(c.parsed.y)}} },
      scales: {
        x: { grid:{color:gridColor()} },
        y: { grid:{color:gridColor()}, ticks:{callback: v => fmtM(v)} }
      }
    }
  });

  // Revenue by Source.xlsx — Data sheet, % of Revenue column, TTM Jul 2026.
  new Chart(document.getElementById("homeRevMixChart"), {
    type:"doughnut",
    data:{
      labels:["Milk Products","Animal Sales","Custom Work/Other"],
      datasets:[{
        data:[92.66197708828053, 6.69640721300549, 0.8449368990905188],
        backgroundColor:[C.green, C.kelly, C.muted],
        borderWidth:2,
        borderColor: getComputedStyle(document.documentElement).getPropertyValue("--panel").trim()
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      cutout:"58%",
      plugins:{
        legend:{position:"right"},
        tooltip:{callbacks:{label: c => c.label + ": " + c.parsed.toFixed(1) + "%"}}
      }
    }
  });

  // Financials rows below are recalculated directly from Monthly Revenue vs.
  // Operating Costs.xlsx (Revenue $, COGS, and Expenses columns, summed month by
  // month for each TTM window: TTM Jun'26 = Jul'25-Jun'26, TTM Jun'25 = Jul'24-Jun'25
  // — trailing 12 months before Jul 1, 2026, per Casey) rather than taken as given
  // from Key Metrics at a Glance.xlsx, though that workbook's own Total Revenue/
  // Total Costs/Operating Margin cells (formula-derived from those same two
  // numbers) now reconcile with this within ~$1, a rounding artifact. Revenue and
  // Total Costs for the Jul'25-Dec'25 months are taken from the "adj" sheet rather
  // than "Data", matching the restated basis used in the chart above (see comment
  // there) — Casey confirmed the COGS drop starting Jan 2026 is a reclassification
  // (the Casey/Nate milk wash entry stopping), not a real cost reduction, so this
  // table restates the full TTM window onto one consistent basis rather than mixing
  // washed and un-washed months. COGS is unaffected by that reclassification either
  // way (it's a straight column sum in both sheets). Operating Margin here reduces
  // to Net Income / Revenue regardless of the COGS/Expenses split, so it isn't
  // distorted by the reclassification.
  const finRevenue = 25483840, finRevenuePrior = 26079541;
  const finCogs = 4341828, finCogsPrior = 7826513;
  const finCosts = 24626078, finCostsPrior = 25656521;
  const pctChg = (cur,prior) => { const p = (cur-prior)/prior*100; return (p>=0?"+":"")+p.toFixed(1)+"%"; };
  const pctPts = (cur,prior) => { const p = cur-prior; return (p>=0?"+":"")+p.toFixed(1)+" pts"; };
  const om26 = (finRevenue-finCosts)/finRevenue*100, om25 = (finRevenuePrior-finCostsPrior)/finRevenuePrior*100;

  // Executive Summary's operating-margin figures are the same om26/om25 shown in
  // the Key Metrics table below, not a separately hand-typed pair of numbers, so
  // the two can't drift out of sync.
  document.getElementById("h-om-prior").textContent = om25.toFixed(1) + "%";
  document.getElementById("h-om-cur").textContent   = om26.toFixed(1) + "%";

  document.getElementById("homeMetricTable").innerHTML =
    `<thead><tr><th>Area</th><th>Metric</th><th class="n">TTM Jul 2026</th><th class="n">TTM Jul 2025</th><th class="n">Change</th></tr></thead>
    <tbody>
    ${[
      // Milk Production/Quality: from the Raw Milk Production page's own stat cards.
      ["Milk Production","Annual cwt", "361,247", "345,778", "+4.5%"],
      ["Milk Production","Lbs/Cow/Day", "96", "93", "+3.2%"],
      ["Milk Quality","Butterfat %", "3.9%", "3.9%", "flat"],
      ["Milk Quality","SCC (cells/mL)", "250,000", "200,000", "+25%"],
      // Plant: Utilization Rate is the current-schedule figure from the Plant
      // Efficiency page (66.7%, per Nate, Aug 2026) — it reflects today's schedule,
      // not a full prior fiscal year, so there's no TTM Jul 2025 comparison to show.
      // Labor Hrs/cwt (TTM Jul 2026 = 63,209 hrs / 330,273 cwt = 0.191) is from Paul's
      // Monthly Gallons Produced / Monthly Plant Hours data — see footnote. No TTM
      // Jul 2025 comparison: the only prior-year figure on file is a single blended
      // "2024 average," not actual Jul-Dec 2024 months, so a prior TTM built from it
      // would be a guess dressed up as a real figure.
      ["Plant","Utilization Rate", "66.7%"],
      ["Plant","Labor Hrs/cwt<sup>5</sup>", "0.191"],
      // Confirmed against Casey's TTM Ordinary Income/COGS/Expenses figures.
      ["Financials","Total Revenue (Ordinary Income)", fmtM(finRevenue), fmtM(finRevenuePrior), pctChg(finRevenue,finRevenuePrior)],
      ["Financials","COGS", fmtM(finCogs), fmtM(finCogsPrior), pctChg(finCogs,finCogsPrior)],
      ["Financials","Total Costs (COGS + OPEx)", fmtM(finCosts), fmtM(finCostsPrior), pctChg(finCosts,finCostsPrior)],
      ["Financials","Operating Margin", om26.toFixed(1)+"%", om25.toFixed(1)+"%", pctPts(om26,om25)],
    ].map(([a,m,cur,prior,chg,pending]) =>
      `<tr${pending ? ' class="row-pending" title="Pending review"' : ""}><td style="color:var(--muted);font-size:.78rem;text-transform:uppercase;letter-spacing:.4px">${a}</td>
       <td>${m}</td><td class="n">${cur ?? "###"}</td><td class="n" style="color:var(--muted)">${prior ?? "###"}</td>
       <td class="n" style="color:var(--muted)">${chg ?? "###"}</td></tr>`
    ).join("")}
    </tbody>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MILK PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════
// TTM Jul '25-Jun '26, from Items_Sold_TTM_July2026.xlsx's MilkProducts sheet (fluid
// milk only — not Ice Cream/Soft Serve/etc.). Every SKU on that sheet (its own item
// descriptions, unmodified), sorted descending by quantity. Qty is each SKU's own
// sales unit (gallon/half-gallon/quart/pint) as sold. sizeGal is that same unit's
// size in gallons, read off each SKU's own name (half pint=1/16, pint=1/8,
// quart=1/4, half gallon=1/2, gallon=1, "HGL"=half gallon, dispenser sizes as
// labeled e.g. "5 Gal Disp"=5) — used only for the Price/Gallon toggle below.
const MILK_SKUS = [
  { name:"64 CD CHOC FF HALF PINT",              qty:3273358, rev:1246863.06, sizeGal:0.0625 },
  { name:"26 CD CHOC MILK Pint",                 qty:2219715, rev:1783732.32, sizeGal:0.125 },
  { name:"63 CD 1% LF HALF PINT",                qty: 672569, rev: 240215.94, sizeGal:0.0625 },
  { name:"25 CD CHOC MILK Quart",                qty: 512866, rev: 675719.94, sizeGal:0.25 },
  { name:"13 CD 2% RF Pint",                     qty: 417829, rev: 282155.05, sizeGal:0.125 },
  { name:"56 WF HVD HALF GALLON",                qty: 416988, rev: 844031.98, sizeGal:0.5 },
  { name:"57 WF 2% HALF GALLON",                 qty: 352188, rev: 687793.86, sizeGal:0.5 },
  { name:"05 CD HVD Gallon",                     qty: 339155, rev:1151279.38, sizeGal:1 },
  { name:"52 WF HVD GALLON",                     qty: 336240, rev:1294029.20, sizeGal:1 },
  { name:"24 CD CHOC MILK 1/2 Gallon",            qty: 325287, rev: 735296.91, sizeGal:0.5 },
  { name:"11 CD 2% RF Gallon",                   qty: 298077, rev: 937165.06, sizeGal:1 },
  { name:"27 CD STRAW MILK Pint",                 qty: 253594, rev: 203722.53, sizeGal:0.125 },
  { name:"12 CD 2% RF 1/2 Gallon",                qty: 221364, rev: 385118.24, sizeGal:0.5 },
  { name:"08 CD HVD Pint",                        qty: 219495, rev: 151867.61, sizeGal:0.125 },
  { name:"53 WF 2% GALLON",                      qty: 210090, rev: 777794.27, sizeGal:1 },
  { name:"06 CD HVD 1/2 Gallon",                  qty: 193179, rev: 350440.73, sizeGal:0.5 },
  { name:"89 QD CHOC PINT",                       qty: 176107, rev: 128807.23, sizeGal:0.125 },
  { name:"59 WF FAT FREE HALF GALLON",            qty: 143748, rev: 259870.10, sizeGal:0.5 },
  { name:"58 WF 1% HALF GALLON",                  qty: 130464, rev: 243542.33, sizeGal:0.5 },
  { name:"W33 CD WHP CRM HGL",                    qty: 114210, rev: 641389.56, sizeGal:0.5 },
  { name:"23 CD CHOC MILK Gallon",                qty: 103601, rev: 444031.24, sizeGal:1 },
  { name:"07 CD HVD Quart",                       qty:  97768, rev: 107456.86, sizeGal:0.25 },
  { name:"44 CD 2% QUART",                        qty:  90124, rev:  95532.46, sizeGal:0.25 },
  { name:"70 QD HVD GALLON",                      qty:  83759, rev: 282431.99, sizeGal:1 },
  { name:"88 QD CHOC QUART",                      qty:  75883, rev:  96378.28, sizeGal:0.25 },
  { name:"71 QD 2% RF GALLON",                    qty:  73032, rev: 235359.41, sizeGal:1 },
  { name:"15 CD 1% LF GALLON",                    qty:  50123, rev: 151347.13, sizeGal:1 },
  { name:"87 QD CHOC HALF GALLON",                qty:  46541, rev:  98278.46, sizeGal:0.5 },
  { name:"83 QD 2% PINT",                         qty:  42712, rev:  26588.60, sizeGal:0.125 },
  { name:"82 QD HVD PINT",                        qty:  37462, rev:  24292.15, sizeGal:0.125 },
  { name:"74 QD HVD HALF GALLON",                 qty:  35573, rev:  63222.36, sizeGal:0.5 },
  { name:"75 QD 2% RF HALF GALLON",               qty:  35235, rev:  58929.28, sizeGal:0.5 },
  { name:"18 CD FAT FREE Gallon",                 qty:  33524, rev:  97248.04, sizeGal:1 },
  { name:"86 QD CHOC GALLON",                     qty:  26711, rev: 107910.96, sizeGal:1 },
  { name:"62 CD 1% LF HALF GALLON",               qty:  22962, rev:  37155.42, sizeGal:0.5 },
  { name:"79 QD 2% QUART",                        qty:  19876, rev:  20864.17, sizeGal:0.25 },
  { name:"78 QD HVD QUART",                       qty:  19777, rev:  21784.28, sizeGal:0.25 },
  { name:"33 CD HVY WHIP CRM 1/2 Gallon",          qty:  18887, rev: 102939.95, sizeGal:0.5 },
  { name:"19 CD FAT FREE 1/2 Gallon",              qty:  17301, rev:  27703.18, sizeGal:0.5 },
  { name:"72 QD 1% LF GALLON",                    qty:  11434, rev:  34853.22, sizeGal:1 },
  { name:"76 QD 1% HALF GALLON",                  qty:  11366, rev:  18143.91, sizeGal:0.5 },
  { name:"77 QD FAT FREE HALF GALLON",             qty:  10833, rev:  16602.96, sizeGal:0.5 },
  { name:"73 QD FAT FREE Gallon",                 qty:   9250, rev:  27137.49, sizeGal:1 },
  { name:"10 CC 2% RF Gallon",                    qty:   4852, rev:  13537.08, sizeGal:1 },
  { name:"04 CC HVD Gallon",                      qty:   1935, rev:   5957.78, sizeGal:1 },
  { name:"CD 2.5 GAL DISP WHOLE CHOCOLATE",       qty:   1347, rev:  13554.33, sizeGal:2.5 },
  { name:"09 CD 2% RF 5 Gal Disp",                qty:    983, rev:  15216.50, sizeGal:5 },
  { name:"22FF CD FF CHOCOLATE 5 GAL DISP",       qty:    532, rev:   8830.91, sizeGal:5 },
  { name:"29 CD STRAW MILK 1/2 Gallon",           qty:    216, rev:    470.66, sizeGal:0.5 },
  { name:"22 CD CHOC 5 Gal Disp",                 qty:     58, rev:   1150.61, sizeGal:5 },
];

// The other 6 category sheets in Items_Sold_TTM_July2026.xlsx (Bulk-Commodity and
// AnimalCounts are covered elsewhere on this dashboard, so not included here).
// Same sizeGal convention as MILK_SKUS above (fl oz &divide; 128, explicit "N Gal/
// Gallon" as labeled). sizeGal:null where the source doesn't support a reliable
// gallon-equivalent — those SKUs are excluded from the Price per Gallon ranking
// only (still included under Units/Revenue/Price per Unit):
//  - Butter (BUTTER_SKUS): sold by the pound, a solid with no fluid-gallon analog.
//  - 6 "Frosty Products ... price / unit" lines in COPACK_SKUS: the source states
//    a price but never the pack size, so no gallon conversion can be derived.
// One line was dropped entirely, not just from Price per Gallon: the Other
// Products sheet's cheese SKU carries the source file's own flag "get rid of
// this — residual inventory," so it's excluded from OTHER_DAIRY_SKUS. The Butter
// sheet also carries a note that cream/butter sold to Continental and G&K Sales
// isn't included as product SKUs in this workbook at all.
const ICE_CREAM_SKUS = [
  { name:"CD 48oz Scround SIMPLY GRANDPA'S VANILLA", qty:13755, rev:59008.95, sizeGal:0.375 },
  { name:"CD 48oz Scround PEANUT 'UDDER BLISS", qty:6360, rev:27284.4, sizeGal:0.375 },
  { name:"CD 48oz Scround BUTTER CHURN PECAN", qty:5190, rev:22265.1, sizeGal:0.375 },
  { name:"CD 48oz Scround MOOEY GOOEY FUDGE", qty:4797, rev:20579.13, sizeGal:0.375 },
  { name:"CD 48oz Scround A MOO'S MINT", qty:3171, rev:13603.59, sizeGal:0.375 },
  { name:"CD 48oz Scround HOOPRINTS", qty:2133, rev:9150.57, sizeGal:0.375 },
  { name:"CD 48oz Scround HAYDAY", qty:2106, rev:9034.74, sizeGal:0.375 },
  { name:"CD 48oz Scround SIMPLY DUTCH CHOCOLATE", qty:1785, rev:7657.65, sizeGal:0.375 },
  { name:"CD 3 Gallon PEANUT 'UDDER BLISS", qty:1745, rev:49994.25, sizeGal:3.0 },
  { name:"CD 48oz Scround SIMPLY STRAWBERRY PATCH", qty:1662, rev:7129.98, sizeGal:0.375 },
  { name:"CD 48oz Scround NUTTY JAVA MOO", qty:1650, rev:7078.5, sizeGal:0.375 },
  { name:"CD 48oz Scround RASPBERRY ROUNDUP", qty:1638, rev:7027.02, sizeGal:0.375 },
  { name:"CD 48oz Scround MOOKIES & CREAM", qty:1632, rev:7001.28, sizeGal:0.375 },
  { name:"CD 48oz Scround SIMPLY BLACK CHERRY", qty:1572, rev:6743.88, sizeGal:0.375 },
  { name:"CD 48oz Scround TRIPLE CHOCOWLATE", qty:1542, rev:6615.18, sizeGal:0.375 },
  { name:"CD 48oz Scround SIMPLY COWCONUT CREAM", qty:1245, rev:5341.05, sizeGal:0.375 },
  { name:"CD 48oz Scround MOM'S COOKIE DOUGH", qty:1116, rev:4787.64, sizeGal:0.375 },
  { name:"CD 3 Gallon SIMPLY GRANDPA'S VANILLA", qty:909, rev:23197.77, sizeGal:3.0 },
  { name:"CD 3 Gallon SIMPLY SUPERCOW", qty:881, rev:34270.9, sizeGal:3.0 },
  { name:"CD 3 Gallon BUTTER CHURN PECAN", qty:726, rev:24161.28, sizeGal:3.0 },
  { name:"CD 3 Gallon A MOO'S MINT", qty:618, rev:16995, sizeGal:3.0 },
  { name:"CD 3 Gallon MOM'S COOKIE DOUGH", qty:562, rev:15854.02, sizeGal:3.0 },
  { name:"CD 3 Gallon SIMPLY COWCONUT CREAM", qty:495, rev:15087.6, sizeGal:3.0 },
  { name:"CD 48oz Scround UDDER NUTSENSE", qty:480, rev:2059.2, sizeGal:0.375 },
  { name:"CD 48oz Scround PEPPERMINT STICK", qty:462, rev:1981.98, sizeGal:0.375 },
  { name:"CD 3 Gallon MINT MOOKIES & CREAM", qty:360, rev:9273.6, sizeGal:3.0 },
  { name:"CD 3 Gallon STRAWBERRY CHEESECAKE", qty:334, rev:9736.1, sizeGal:3.0 },
  { name:"CD 3 Gallon HOOFPRINTS", qty:320, rev:8755.2, sizeGal:3.0 },
  { name:"CD 3 Gallon MOOKIES & CREAM", qty:319, rev:8565.15, sizeGal:3.0 },
  { name:"CD 3 Gallon RASPBERRY ROUNDUP", qty:301, rev:8548.4, sizeGal:3.0 },
  { name:"CD 3 Gallon SIMPLY STRAWBERRY PATCH", qty:300, rev:8334, sizeGal:3.0 },
  { name:"CD 3 Gallon BLUE MOO", qty:299, rev:7343.44, sizeGal:3.0 },
  { name:"CD 3 Gallon TRIPLE CHOCOWLATE", qty:290, rev:7577.7, sizeGal:3.0 },
  { name:"CD 3 Gallon MOOEY GOOEY FUDGE", qty:280, rev:8087.46, sizeGal:3.0 },
  { name:"CD 3 Gallon HAYDAY", qty:266, rev:7424.06, sizeGal:3.0 },
  { name:"CD 3 Gallon LEMON BAR CHEESECAKE", qty:196, rev:7157.92, sizeGal:3.0 },
  { name:"CD 3 Gallon AMOORETTO CHERRY", qty:183, rev:5438.76, sizeGal:3.0 },
  { name:"CD 3 Gallon CALF TRACKS", qty:175, rev:5153.75, sizeGal:3.0 },
  { name:"CD 3 Gallon BIRTHDAY CAKE", qty:171, rev:5295.87, sizeGal:3.0 },
  { name:"CD 3 Gallon SIMPLY DUTCH CHOCOLATE", qty:165, rev:4092.04, sizeGal:3.0 },
  { name:"CD 3 Gallon S'MOORES", qty:150, rev:4450.5, sizeGal:3.0 },
  { name:"CD 3 Gallon SIMPLY LEMON BLUEBERRY", qty:140, rev:4425.4, sizeGal:3.0 },
  { name:"CD 3 Gallon SIMPLY ORANGE PINEAPPLE", qty:130, rev:3359.2, sizeGal:3.0 },
  { name:"CD 3 Gallon SIMPLY BLACK CHERRY", qty:119, rev:2917.88, sizeGal:3.0 },
  { name:"CD 3 Gallon PUMPKIN CHEESECAKE", qty:83, rev:2515.73, sizeGal:3.0 },
  { name:"CD 3 Gallon COWCONUT FUDGE", qty:79, rev:2456.11, sizeGal:3.0 },
  { name:"CD 3 Gallon VANILLA CHOC CHIP", qty:75, rev:2265.75, sizeGal:3.0 },
  { name:"CD 3 Gallon UDDER NUTSENSE", qty:42, rev:1258.74, sizeGal:3.0 },
  { name:"CD 3 Gallon SIMPLY CHILE CHOCOWLATE", qty:20, rev:562.8, sizeGal:3.0 },
  { name:"CD 3 Gallon PEPPERMINT STICK", qty:14, rev:396.76, sizeGal:3.0 },
  { name:"CD 3 Gallon MOONSTER COOKIE", qty:10, rev:284.6, sizeGal:3.0 },
];

const SOURCREAM_SKUS = [
  { name:"CD SOUR CREAM 16 OZ", qty:24746, rev:47591.3, sizeGal:0.125 },
  { name:"CD SOUR CREAM 16 OZ -corrugated", qty:9315, rev:19514.93, sizeGal:0.125 },
  { name:"CD FRENCH ONION DIP 16 OZ", qty:23153, rev:46986.25, sizeGal:0.125 },
];

const SOFTSERVE_SKUS = [
  { name:"42 CD 2.5 Gallon PREMIUM VANILLA SOFT SERVE MIX", qty:57936, rev:921544.45, sizeGal:2.5 },
  { name:"47 CD 2.5 Gallon PREMIUM CHOCOLATE SOFT SERVE MIX", qty:11773, rev:212211.41, sizeGal:2.5 },
  { name:"38 CD 16% IC MIX 2.5G", qty:26783, rev:541112.92, sizeGal:2.5 },
];

const BUTTER_SKUS = [
  { name:"CD Butter, non-GMO Cert, 25-lb box", qty:91035.2, rev:290402.29, sizeGal:null },
  { name:"CD 40LB BLOCK UNSALTED BUTTER-83%-per lb", qty:4750.6, rev:16028.26, sizeGal:null },
  { name:"CD 30LB SALTED BUTTER/lb", qty:7539.11, rev:24502.14, sizeGal:null },
];

const OTHER_DAIRY_SKUS = [
  { name:"37 CD EGG NOG Quart", qty:9599, rev:23299.78, sizeGal:0.25 },
  { name:"39 CD EGG NOG Pint", qty:15710, rev:21565.91, sizeGal:0.125 },
];

const COPACK_SKUS = [
  { name:"90 QD EGG NOG Pint", qty:18902, rev:24226.71, sizeGal:0.125 },
  { name:"91 QD EGG NOG Quart", qty:10644, rev:25214.58, sizeGal:0.25 },
  { name:"92 QD EGG NOG Half Gallon", qty:20971, rev:90370.35, sizeGal:0.5 },
  { name:"QD FIESTA DIP 16 OZ", qty:375, rev:790.8, sizeGal:0.125 },
  { name:"QD FRENCH ONION DIP 16 OZ", qty:98211, rev:186627.98, sizeGal:0.125 },
  { name:"QD FRENCH ONION DIP 8 OZ", qty:35177, rev:49040.14, sizeGal:0.0625 },
  { name:"QD SOUR CREAM 16 OZ", qty:12155, rev:21786.98, sizeGal:0.125 },
  { name:"QD SOUR CREAM 8 OZ", qty:23, rev:31.23, sizeGal:0.0625 },
  { name:"48 TWISTER'S 2.5 GAL PREMIUM VAN SS", qty:2358, rev:37977.95, sizeGal:2.5 },
  { name:"49 IORIO'S GELATO MIX 2.5 Gal Bag", qty:2282, rev:44341.68, sizeGal:2.5 },
  { name:"Frosty Products Custard Chocolate Mix, price / unit", qty:2004, rev:21724.89, sizeGal:null },
  { name:"Frosty Products Custard Vanilla Mix, price / unit", qty:6404, rev:69752.94, sizeGal:null },
  { name:"Frosty Products No Sugar Added Vanilla Yogurt Mix, price / unit", qty:300, rev:2574, sizeGal:null },
  { name:"Frosty Products Non-Fat ChocolateYogurt Mix, price / unit", qty:1840, rev:14478.96, sizeGal:null },
  { name:"Frosty Products Non-Fat Vanilla Yogurt Mix, price / unit", qty:12064, rev:88037.04, sizeGal:null },
  { name:"Frosty Products Smoothie Shake Mix, Vanilla, price / unit", qty:2040, rev:13820.71, sizeGal:null },
  { name:"Kuster's Chocolate Soft Serve Mix price / 2.5 Gal bag", qty:6035, rev:106070.23, sizeGal:2.5 },
  { name:"Kuster's Premium Vanilla Custard Mix, price / Gal", qty:276, rev:2654.57, sizeGal:1.0 },
  { name:"Kuster's Premium Vanilla Soft Serve Mix, price / 2.5 Gal Bag", qty:5817, rev:91693.09, sizeGal:2.5 },
  { name:"Vara Juice 1 GAL Premium Vanilla Soft Serve Mix in corrugate, price/unit", qty:10854, rev:73034.44, sizeGal:1.0 },
  { name:"Vara Juice 2.5 GAL CAN Premium Vanilla Soft Serve Mix, price/unit", qty:792, rev:13519.41, sizeGal:2.5 },
];

const ALL_DAIRY_SKUS = [
  ...MILK_SKUS, ...ICE_CREAM_SKUS, ...SOURCREAM_SKUS, ...SOFTSERVE_SKUS,
  ...BUTTER_SKUS, ...OTHER_DAIRY_SKUS, ...COPACK_SKUS,
];

// Monthly Revenue of milk products only (the "Milk Products" category above, i.e.
// fluid milk — not Ice Cream/Soft Serve/etc.), Jul '25-Jun '26 (dashboard fiscal
// year). Summed directly from Sheet1's invoice-line Amount (signed, not abs — some
// categories mix positive and negative lines e.g. returns/credits, so each line must
// be summed with its own sign before negating the total) for every line item matching
// a SKU name in the MilkProducts sheet. Reconciles exactly to that sheet's total
// ($15,275,744.97).
const mLabels = ["Jul '25","Aug '25","Sep '25","Oct '25","Nov '25","Dec '25","Jan '26","Feb '26","Mar '26","Apr '26","May '26","Jun '26"];
const MILK_MONTHS_REV = [1227847,1166802,1135167,1209551,1019044,1321061,1300901,1290564,1434068,1463859,1407425,1299456];

function weightedAvg(weights, values) {
  const sumW = weights.reduce((s,w) => s+w, 0);
  if (sumW === 0) return 0;
  const sumWV = weights.reduce((s,w,i) => s + w*values[i], 0);
  return sumWV / sumW;
}

function renderMarginChart(canvasId, labels, revData, pctData, revMax, showSharePct) {
  const overallMargin = weightedAvg(revData, pctData);
  const revTotal = revData.reduce((s,v) => s+v, 0);
  new Chart(document.getElementById(canvasId), {
    type:"bar",
    data:{
      labels,
      datasets:[
        {label:"Revenue ($M)", data:revData, backgroundColor:C.green, borderRadius:4, yAxisID:"y"},
        {label:"Profit Margin (%)", data:pctData, backgroundColor:C.kelly, borderRadius:4, yAxisID:"y1"},
        {label:"Overall Margin", type:"line", data:labels.map(()=>overallMargin),
          yAxisID:"y1", borderColor:C.red, borderDash:[6,4], borderWidth:2,
          pointRadius:0, tension:0, fill:false},
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{position:"top"},
        tooltip:{callbacks:{label: c => {
          if (c.dataset.yAxisID==="y1") return c.dataset.label + ": " + c.parsed.y.toFixed(1) + "%";
          const share = showSharePct ? ` (${(c.parsed.y/revTotal*100).toFixed(1)}% of revenue)` : "";
          return c.dataset.label + ": $" + c.parsed.y + "M" + share;
        }}} },
      scales:{
        x:{grid:{display:false}},
        y:{
          type:"linear", position:"left", min:0, max:revMax,
          grid:{color:gridColor()}, ticks:{callback:v=>"$"+v+"M"},
          title:{display:true, text:"Revenue ($M)"}
        },
        y1:{
          type:"linear", position:"right", min:0, max:100,
          grid:{drawOnChartArea:false}, ticks:{callback:v=>v+"%"},
          title:{display:true, text:"Profit Margin (%)"}
        }
      }
    }
  });
}

// rankBy: "qty" (Units), "rev" (Overall Revenue), "ppu" (Price per Unit = rev/qty),
// or "ppg" (Price per Gallon = price/unit ÷ that SKU's own size in gallons —
// normalizes every pack size, half-pint through 5-gal dispenser, onto one basis).
// Returns null for "ppg" on a SKU with no sizeGal, so it can be filtered out.
function productChartValue(sku, rankBy) {
  if (rankBy === "rev") return sku.rev;
  if (rankBy === "ppu") return sku.rev / sku.qty;
  if (rankBy === "ppg") return sku.sizeGal ? (sku.rev / sku.qty) / sku.sizeGal : null;
  return sku.qty;
}

// Shared by the milk-only and all-dairy-products charts (same rankings/calcs);
// state is {canvasId, innerId, instance} so each chart keeps its own Chart.js
// instance to destroy/redraw on toggle.
function renderProductChart(state, skus, rankBy) {
  const eligible = rankBy === "ppg" ? skus.filter(s => s.sizeGal != null) : skus;
  const sorted = [...eligible].sort((a,b) => productChartValue(b,rankBy) - productChartValue(a,rankBy));
  const labels = sorted.map(p => p.name);
  const data   = sorted.map(p => productChartValue(p, rankBy));

  // Inner container is taller than its scrolling wrapper so every SKU stays
  // legible; the wrapper (h420, overflow-y:auto) turns that into a scrollable window.
  document.getElementById(state.innerId).style.height = (sorted.length * 26) + "px";

  const datasetLabel = {qty:"Units Sold", rev:"Overall Revenue", ppu:"Price per Unit", ppg:"Price per Gallon"}[rankBy];

  if (state.instance) state.instance.destroy();
  state.instance = new Chart(document.getElementById(state.canvasId), {
    type:"bar",
    data:{
      labels, datasets:[{
        data, backgroundColor: C.green, borderRadius:5,
        label: datasetLabel
      }]
    },
    options:{
      indexAxis:"y", responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false},
        tooltip:{callbacks:{
          label: c => {
            const sku = sorted[c.dataIndex];
            const lines = [`Units: ${fmt(sku.qty)}`, `Overall Revenue: $${fmt(Math.round(sku.rev))}`,
              `Price/Unit: $${(sku.rev/sku.qty).toFixed(2)}${sku.sizeGal ? ` (${sku.sizeGal} gal)` : ""}`];
            if (sku.sizeGal) lines.push(`Price/Gallon: $${((sku.rev/sku.qty)/sku.sizeGal).toFixed(3)}`);
            else lines.push("Price/Gallon: n/a (no reliable pack size)");
            return lines;
          }
        }} },
      scales:{
        x:{grid:{color:gridColor()}, ticks:{callback: v => (rankBy === "ppu" || rankBy === "ppg") ? "$"+v.toFixed(2) : rankBy === "rev" ? "$"+fmt(v) : fmt(v)}},
        y:{grid:{display:false}, ticks:{font:{size:9}}}
      }
    }
  });
}

const milkProdChartState = {canvasId:"milkProdChart", innerId:"milkProdChartInner", instance:null};
const allProdChartState  = {canvasId:"allProdChart",  innerId:"allProdChartInner",  instance:null};
const renderMilkProdChart = rankBy => renderProductChart(milkProdChartState, MILK_SKUS, rankBy);
const renderAllProdChart  = rankBy => renderProductChart(allProdChartState, ALL_DAIRY_SKUS, rankBy);

function initMilk() {
  renderMilkProdChart("qty");
  document.querySelectorAll(".js-milkprod-rank-toggle button").forEach(btn =>
    btn.addEventListener("click", () => {
      const rank = btn.dataset.rank;
      document.querySelectorAll(".js-milkprod-rank-toggle button").forEach(b =>
        b.classList.toggle("active", b.dataset.rank === rank));
      renderMilkProdChart(rank);
    }));

  renderAllProdChart("qty");
  document.querySelectorAll(".js-allprod-rank-toggle button").forEach(btn =>
    btn.addEventListener("click", () => {
      const rank = btn.dataset.rank;
      document.querySelectorAll(".js-allprod-rank-toggle button").forEach(b =>
        b.classList.toggle("active", b.dataset.rank === rank));
      renderAllProdChart(rank);
    }));

  // Est. Profit overlay = Plant Efficiency's directional Net Margin (18%, TTM Jul
  // 2026, per Paul) applied flat to each month's actual milk revenue. It's a single
  // TTM-average rate spread evenly across months, not a real monthly margin — Plant
  // Efficiency's own data shows monthly margin actually ranging 10-27%, so treat
  // this line as directional/illustrative, not a measured monthly P&L.
  const MILK_MARGIN_PCT = 0.18;
  const MILK_MONTHS_PROFIT_EST = MILK_MONTHS_REV.map(r => Math.round(r * MILK_MARGIN_PCT));

  new Chart(document.getElementById("milkTrendChart"), {
    type:"bar",
    data:{
      labels:mLabels,
      datasets:[
        {label:"Revenue", data: MILK_MONTHS_REV, backgroundColor: C.kelly, borderRadius:4},
        {label:"Est. Profit (18% margin)", type:"line", data: MILK_MONTHS_PROFIT_EST,
          borderColor:C.amber, backgroundColor:"rgba(217,119,6,.2)", fill:true, tension:.3,
          pointRadius:3, pointBackgroundColor:C.amber},
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{position:"top"},
        tooltip:{callbacks:{label: c => c.dataset.label + ": $" + fmt(Math.round(c.parsed.y))}} },
      scales:{
        x:{grid:{display:false}},
        y:{grid:{color:gridColor()}, ticks:{callback:v=>"$"+fmt(v)}}
      }
    }
  });

  // Product axis per Products Matrix, 2026.06.24.xlsx: all milk flavors (and Whipping
  // Cream) rolled into "Class 1 milk"; Sour Cream + Chip Dip combined; Other = eggnog,
  // cheese, & co-packed. Revenue is real (Summary sheet, TTM Jul 2026); per-product
  // profit margin isn't in this file (no COGS by SKU) — left at 0/pending.
  const MARGIN_PRODS = ["Class 1 milk","Ice Cream","Soft Serve Mix","Butter","Sour Cream & Chip Dip","Other (eggnog, co-packed)"];
  const MARGIN_REV    = [15.28, 0.54, 1.67, 0.33, 0.11, 1.03];
  const MARGIN_PCT    = [0, 0, 0, 0, 0, 0];
  renderMarginChart("milkMarginChart", MARGIN_PRODS, MARGIN_REV, MARGIN_PCT, 18);

  // Customer names per Sheet1's "Name" column; Cedar Crest's milk and ice-cream
  // invoices ("2803-Cedar Crest Dairy" / "2802-Cedar Crest (ICE CREAM)") are combined
  // as one account. Revenue is real; profit margin isn't in this file — pending.
  // showSharePct (last arg): hover a bar to see that customer's % of total revenue.
  const CUSTOMER_NAMES = ["Cedar Crest","Quality Dairy (QD)","Kuster's Dairy","Country Dairy Farm Store","Other"];
  const CUSTOMER_REV   = [15.44, 1.66, 1.10, 0.17, 0.60];
  const CUSTOMER_PCT   = [0, 0, 0, 0, 0];
  renderMarginChart("customerMarginChart", CUSTOMER_NAMES, CUSTOMER_REV, CUSTOMER_PCT, 18, true);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ANIMALS
// ═══════════════════════════════════════════════════════════════════════════════
// From Items_Sold_TTM_July2026.xlsx (AnimalCounts sheet), Jul '25-Jun '26. Category
// labels match the QuickBooks item names. "Cows 5-24 MOS" is short for "Cows 5 mos
// to under 24 mos of age". The "Cows Under 5 MOS" bucket also absorbs both "...for
// Dairy" breeding-stock categories (37 head / $113,808.50) — see the panel note on
// the Annual Summary table for the full breakdown.
function initAnimals() {
  const quarters = ["Jul-Sep '25","Oct-Dec '25","Jan-Mar '26","Apr-Jun '26"];
  const calves   = [144, 111, 130, 130];
  const culls    = [ 46,  70,  90,  75];
  const steers   = [  5,  27,  43,   9];

  new Chart(document.getElementById("animalBarChart"), {
    type:"bar",
    data:{
      labels: quarters,
      datasets:[
        {label:"Cows Under 5 MOS", data:calves, backgroundColor:C.kelly,  borderRadius:4},
        {label:"Cows Over 2 Years", data:culls,  backgroundColor:C.green,  borderRadius:4},
        {label:"Cows 5-24 MOS",    data:steers, backgroundColor:C.muted,  borderRadius:4},
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{position:"top"},
        tooltip:{callbacks:{label: c => c.dataset.label + ": " + c.parsed.y + " head"}} },
      scales:{
        x:{grid:{display:false}, stacked:false},
        y:{grid:{color:gridColor()}, stacked:false, ticks:{stepSize:10}}
      }
    }
  });

  const calfPrice  = [1109.14, 1161.00, 1774.17, 1573.42];
  const cullPrice  = [1470.96, 1520.04, 1748.54, 1886.73];
  const steerPrice = [2210.92, 1755.97, 1593.34, 1987.46];

  new Chart(document.getElementById("animalPriceChart"), {
    type:"line",
    data:{
      labels: quarters,
      datasets:[
        {label:"Cows Under 5 MOS", data:calfPrice,  borderColor:C.kelly, backgroundColor:"transparent", tension:.3, pointRadius:5},
        {label:"Cows Over 2 Years", data:cullPrice,  borderColor:C.green, backgroundColor:"transparent", tension:.3, pointRadius:5},
        {label:"Cows 5-24 MOS",    data:steerPrice, borderColor:C.muted, backgroundColor:"transparent", tension:.3, pointRadius:5},
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{position:"top"},
        tooltip:{callbacks:{label: c => c.dataset.label + ": $" + fmt(c.parsed.y) + "/head"}} },
      scales:{
        x:{grid:{display:false}},
        y:{grid:{color:gridColor()}, ticks:{callback:v=>"$"+fmt(v)}}
      }
    }
  });

  const anData = [
    {type:"Cows Under 5 MOS",  head:515, avgP:1405.39, total:723774},
    {type:"Cows Over 2 Years", head:281, avgP:1683.06, total:472941},
    {type:"Cows 5-24 MOS",     head: 84, avgP:1724.60, total:144866},
  ];
  const grandHead = anData.reduce((s,r)=>s+r.head,0);
  const grandTotal = anData.reduce((s,r)=>s+r.total,0);
  document.getElementById("animalTable").innerHTML =
    `<thead><tr><th>Category</th><th class="n">Head Sold</th>
    <th class="n">Avg $/Head</th><th class="n">Total Revenue</th><th class="n">% of Animal Rev</th></tr></thead>
    <tbody>${anData.map(r => {
      return `<tr><td>${r.type}</td><td class="n">${fmt(r.head)}</td>
      <td class="n">${fmtD(r.avgP.toFixed(2))}</td><td class="n">${fmtD(r.total)}</td>
      <td class="n">${(r.total/grandTotal*100).toFixed(1)}%</td></tr>`;
    }).join("")}
    <tr style="font-weight:700;border-top:2px solid var(--border)">
      <td>Total</td><td class="n">${fmt(grandHead)}</td><td class="n">${fmtD((grandTotal/grandHead).toFixed(2))}</td>
      <td class="n">${fmtD(grandTotal)}</td><td class="n">100.0%</td>
    </tr></tbody>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  RAW MILK PRODUCTION
// ═══════════════════════════════════════════════════════════════════════════════
// Weekly "Actual (gal)" readings from Casey's Raw Milk Production Weekly KPI log.
// Both lines start the week containing 7/1 (7/1/25 and 7/1/24 respectively, matching
// the dashboard's Jul-Jun fiscal year) and run through the latest available week, so
// they're ~13 months, not a strict trailing-12. Aligned week-for-week by position from
// that anchor, not by calendar offset, since the weekly cadence isn't perfectly regular.
// The x-axis itself shows WEEK_LABELS (the TTM Jul 2026 line's real dates, used as the
// shared category axis for both lines' week-position); WEEK_LABELS_2025 holds the TTM
// Jul 2025 line's own real dates (exactly one year earlier) so its tooltip reads
// correctly instead of borrowing the 2026 line's dates.
const WEEK_LABELS = ["6/30/25","7/7/25","7/14/25","7/21/25","7/28/25","8/4/25","8/11/25","8/18/25","8/25/25","9/1/25","9/8/25","9/15/25","9/22/25","9/29/25","10/6/25","10/13/25","10/20/25","10/27/25","11/3/25","11/10/25","11/17/25","11/24/25","12/1/25","12/8/25","12/15/25","12/22/25","12/29/25","1/5/26","1/12/26","1/19/26","1/26/26","2/2/26","2/9/26","2/16/26","2/23/26","3/2/26","3/9/26","3/16/26","3/23/26","3/30/26","4/6/26","4/13/26","4/20/26","4/27/26","5/8/26","5/15/26","5/22/26","5/29/26","6/5/26","6/12/26","6/19/26","6/26/26","7/3/26","7/10/26","7/17/26","7/24/26","7/31/26"];
const WEEK_LABELS_2025 = ["6/30/24","7/7/24","7/14/24","7/21/24","7/28/24","8/4/24","8/11/24","8/18/24","8/25/24","9/1/24","9/8/24","9/15/24","9/22/24","9/29/24","10/6/24","10/13/24","10/20/24","10/27/24","11/3/24","11/10/24","11/17/24","11/24/24","12/1/24","12/8/24","12/15/24","12/22/24","12/29/24","1/5/25","1/12/25","1/19/25","1/26/25","2/2/25","2/9/25","2/16/25","2/23/25","3/2/25","3/9/25","3/16/25","3/23/25","3/30/25","4/6/25","4/13/25","4/20/25","4/27/25","5/8/25","5/15/25","5/22/25","5/29/25","6/5/25","6/12/25","6/19/25","6/26/25","7/3/25","7/10/25","7/17/25","7/24/25","7/31/25"];
const GAL_2026 = [78478,79533,78635,79230,77293,79752,77685,79308,80105,80542,81391,80592,80074,80264,79510,79473,79212,79528,79214,79430,78508,78203,78365,78879,79533,80739,80369,81004,80543,78209,79449,79631,78861,79150,80218,80207,79524,80383,81248,82448,81799,82151,81711,83137,82521,81468,82637,83085,84267,83787,83536,82809,82331,81701,83563,83192,85302];
const GAL_2025 = [75861,76596,75375,75896,74778,75992,76705,75826,73311,75518,75782,75893,76340,75893,75901,76189,76362,77065,76850,77394,75889,74328,75397,74788,75416,75938,77607,77759,77899,76376,77449,78479,79013,79270,79739,79884,80463,79691,78982,77188,76802,76558,77215,77415,77189,78042,78082,79251,77944,80183,79711,76535,78478,79533,78635,79230,77293];
const GAL_TO_CWT = 8.6 / 100; // 8.6 lbs/gal, 100 lbs/cwt — matches the weekly KPI log's own cwt column exactly

let rawMilkLineChart = null;

function renderRawMilkCharts(unit) {
  const toUnit = v => unit === "cwt" ? +(v * GAL_TO_CWT).toFixed(1) : v;
  const label  = unit === "gal" ? "gal" : "cwt";
  const data2026 = GAL_2026.map(toUnit);
  const data2025 = GAL_2025.map(toUnit);

  // Weekly production only moves in a ~16% band, so a 0-based axis flattens it to
  // near-invisible. Zoom to the data instead, with a little headroom below the min,
  // rounded down to a clean multiple of 50 so the axis doesn't show a stray decimal
  // (e.g. 6150.005) as its bottom tick.
  const allVals = [...data2026, ...data2025];
  const dataMin = Math.min(...allVals);
  const dataMax = Math.max(...allVals);
  const yMin = Math.floor(Math.max(0, dataMin - (dataMax - dataMin) * 0.15) / 50) * 50;

  if (rawMilkLineChart) rawMilkLineChart.destroy();

  rawMilkLineChart = new Chart(document.getElementById("milkProdLineChart"), {
    type:"line",
    data:{
      labels: WEEK_LABELS,
      datasets:[
        {label:"TTM Jul 2026", data:data2026, borderColor:C.kelly,
          backgroundColor:"rgba(61,174,43,.1)", fill:true, tension:.35,
          pointRadius:3, pointHoverRadius:5, pointBackgroundColor:C.kelly},
        {label:"TTM Jul 2025", data:data2025, borderColor:C.muted,
          backgroundColor:"transparent", borderDash:[5,4], tension:.35,
          pointRadius:3, pointHoverRadius:5, pointBackgroundColor:C.muted},
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      interaction:{mode:"nearest", axis:"x", intersect:false},
      plugins:{ legend:{position:"top"},
        tooltip:{callbacks:{label: c => {
          const d = c.datasetIndex === 1 ? WEEK_LABELS_2025[c.dataIndex] : c.label;
          return c.dataset.label + " (" + d + "): " + fmt(c.parsed.y) + " " + label;
        }}} },
      scales:{
        x:{grid:{color:gridColor()}, ticks:{maxTicksLimit:12, autoSkip:true}},
        y:{grid:{color:gridColor()}, ticks:{callback:v=>fmt(Math.round(v))}, min:yMin}
      }
    }
  });
}

function initRawMilk() {
  renderRawMilkCharts("cwt");

  document.querySelectorAll(".js-rawmilk-unit-toggle button").forEach(btn =>
    btn.addEventListener("click", () => {
      const unit = btn.dataset.unit;
      document.querySelectorAll(".js-rawmilk-unit-toggle button").forEach(b =>
        b.classList.toggle("active", b.dataset.unit === unit));
      renderRawMilkCharts(unit);
    }));

  new Chart(document.getElementById("a2StatusChart"), {
    type:"line",
    data:{
      labels:["Apr '25","Jun '26","Jul '26","Aug '26"],
      datasets:[
        {label:"% A2",      data:[49.0, 61.0, 60.5, 60.2], borderColor:C.green, backgroundColor:"transparent", tension:0, pointRadius:5, pointHoverRadius:7},
        {label:"% A1",      data:[35.0, 36.0, 34.9, 35.0], borderColor:C.kelly, backgroundColor:"transparent", tension:0, pointRadius:5, pointHoverRadius:7},
        {label:"% Unknown", data:[16.0,  3.0,  4.4,  4.7], borderColor:C.muted, backgroundColor:"transparent", tension:0, pointRadius:5, pointHoverRadius:7},
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{position:"top"},
        tooltip:{callbacks:{label: c => c.dataset.label + ": " + c.parsed.y + "%"}}
      },
      scales:{
        x:{grid:{display:false}},
        y:{grid:{color:gridColor()}, max:70, ticks:{callback:v=>v+"%"}}
      }
    }
  });

  // Herd Quality Benchmarks: simple Actual-vs-Target bar charts, pulled from this
  // page's own stat cards (per Casey, Aug 2026) rather than an external benchmark.
  // Each metric gets its own chart/axis rather than one shared chart, since Lbs/
  // Cow/Day (~96) and SCC (~250K) are on wildly different scales. Butterfat and
  // Herd Size aren't shown here since there's no real target on file for either.
  function renderHerdBenchmarkChart(canvasId, val, bench, invert, fmt) {
    const above = val >= bench;
    const cls = invert ? (above ? C.amber : C.kelly) : (above ? C.kelly : C.amber);
    new Chart(document.getElementById(canvasId), {
      type:"bar",
      data:{
        labels:["Actual","Target"],
        datasets:[{ data:[val, bench], backgroundColor:[cls, C.muted], borderRadius:4 }]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        indexAxis:"y",
        plugins:{ legend:{display:false},
          tooltip:{callbacks:{label: c => c.label + ": " + fmt(c.parsed.x)}} },
        scales:{
          x:{grid:{color:gridColor()}, ticks:{callback:v=>fmt(v)}},
          y:{grid:{display:false}}
        }
      }
    });
  }
  renderHerdBenchmarkChart("herdLbsCowDayChart", 96, 100, false, v=>v.toFixed(1));
  renderHerdBenchmarkChart("herdSccChart", 250, 150, true, v=>v+"K");
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PLANT EFFICIENCY
// ═══════════════════════════════════════════════════════════════════════════════
// Utilization Rate and Open Capacity are real, per Nate, Aug 2026 — see the
// page appendix for formulas and citations. Shrinkage Rate and Labor Hrs/cwt
// are shown only as stat cards (top of page), not in this chart, since
// they're on different scales (%, hrs/cwt) than the hrs/wk this chart uses.
// Both bars share one 0-144 hrs/wk axis (144 = the possible-with-an-added-
// shift ceiling) so equal hour values render as equal segment widths across
// rows — e.g. the 72 hrs/wk actually run shows up the same width in both
// bars. "Possible" run time under an added shift is modeled at the same
// utilization rate as today (144 &times; 66.7% &asymp; 96 hrs/wk).
let plantKeyMetricsChartInstance = null;
function initPlant() {
  const RUN_HRS = 72, PREP_HRS = 36, AVAIL_HRS = 108, POSSIBLE_HRS = 144;
  const UTIL_PCT = RUN_HRS / AVAIL_HRS * 100;
  const OPEN_HRS = AVAIL_HRS - RUN_HRS;
  const EXTRA_SHIFT_HRS = POSSIBLE_HRS - AVAIL_HRS;
  const EXPANDED_RUN_HRS = Math.round(POSSIBLE_HRS * (UTIL_PCT / 100));

  if (plantKeyMetricsChartInstance) plantKeyMetricsChartInstance.destroy();
  plantKeyMetricsChartInstance = new Chart(document.getElementById("plantKeyMetricsChart"), {
    type:"bar",
    data:{
      labels:["Utilization Rate", "Open Capacity"],
      datasets:[
        {label:"Actual run time",                      data:[RUN_HRS, RUN_HRS],  backgroundColor:C.kelly, stack:"s"},
        {label:"Cleaning, prep, etc.",                  data:[PREP_HRS, 0],       backgroundColor:C.amber, stack:"s"},
        {label:"Open capacity (current schedule)",      data:[0, OPEN_HRS],       backgroundColor:"rgba(61,174,43,.32)", stack:"s"},
        {label:"Possible with an additional shift",     data:[0, EXTRA_SHIFT_HRS],
          backgroundColor:"rgba(61,174,43,.12)", borderColor:C.kelly, borderWidth:1, borderDash:[4,3], stack:"s"},
      ]
    },
    options:{
      indexAxis:"y", responsive:true, maintainAspectRatio:false,
      scales:{
        x:{stacked:true, min:0, max:POSSIBLE_HRS, grid:{color:gridColor()}, ticks:{callback:v=>v+" hrs"}},
        y:{stacked:true, grid:{display:false}}
      },
      plugins:{
        legend:{position:"top", labels:{boxWidth:12, font:{size:10}}},
        tooltip:{
          mode:"index", intersect:false,
          filter: item => item.parsed.x !== 0,
          callbacks:{
            label: c => `${c.dataset.label}: ${c.parsed.x} hrs/wk`,
            footer: items => items[0].label === "Utilization Rate"
              ? `= ${UTIL_PCT.toFixed(1)}% of ${AVAIL_HRS} hrs/wk currently available`
              : `${POSSIBLE_HRS} hrs/wk possible with an added shift → ~${EXPANDED_RUN_HRS} hrs/wk run time at today's utilization rate`
          }
        }
      }
    }
  });

  renderPlantMetricTable("cwt");
  renderPlantMarginTable();
  document.querySelectorAll(".js-plant-unit-toggle button").forEach(btn =>
    btn.addEventListener("click", () => {
      const unit = btn.dataset.unit;
      document.querySelectorAll(".js-plant-unit-toggle button").forEach(b =>
        b.classList.toggle("active", b.dataset.unit === unit));
      renderPlantMetricTable(unit);
    }));
}

// Jul '25-Jun '26 (dashboard fiscal year), from Plant_Production_Headcount_MonthlyGallons.xlsx.
// [month, gallons, cwt, laborHrsPerCwt, laborHrsPerGal]. The file's "Hourly Labor Cost - Plant" column is
// excluded here — 6 of 18 months imply a ~$300/hr rate vs. ~$18-22/hr for the rest, a ~15x
// scale error, so it needs correcting at the source before it's usable anywhere.
const PLANT_MONTHS = [
  ["Jul '25", 361960, 31129, 0.175, 0.0150],
  ["Aug '25", 334329, 28752, 0.173, 0.0149],
  ["Sep '25", 315038, 27093, 0.187, 0.0160],
  ["Oct '25", 295694, 25430, 0.187, 0.0161],
  ["Nov '25", 249362, 21445, 0.202, 0.0173],
  ["Dec '25", 322759, 27757, 0.187, 0.0161],
  ["Jan '26", 297599, 25594, 0.197, 0.0170],
  ["Feb '26", 295571, 25419, 0.191, 0.0165],
  ["Mar '26", 329191, 28310, 0.185, 0.0159],
  ["Apr '26", 325483, 27992, 0.222, 0.0191],
  ["May '26", 340226, 29259, 0.212, 0.0182],
  ["Jun '26", 373172, 32093, 0.184, 0.0158],
];

function renderPlantMetricTable(unit) {
  const volLabel    = unit === "gal" ? "Gallons Processed" : "cwt Processed";
  const laborLabel  = unit === "gal" ? "Labor Hrs/gal" : "Labor Hrs/cwt";
  document.getElementById("plantMetricTable").innerHTML =
    `<thead><tr><th>Month</th><th class="n">${volLabel}</th>
    <th class="n">${laborLabel}</th></tr></thead>
    <tbody>${PLANT_MONTHS.map(([m, gal, cwt, hrsPerCwt, hrsPerGal]) => {
      const vol   = unit === "gal" ? fmt(gal) : fmt(cwt);
      const labor = unit === "gal" ? hrsPerGal : hrsPerCwt;
      return `<tr><td>${m}</td><td class="n">${vol}</td>
      <td class="n">${labor}</td></tr>`;
    }).join("")}
    </tbody>`;
}

// Per Paul, Aug 2026 — directional summary from Plant Costs - Margin Directional
// Summary - 2025.07-2026.csv. [month, FMMO gallons, revenue/gal, COGS milk (est.),
// labor/gal, packaging & ingredients/gal, all other plant costs/gal, net margin/gal,
// margin %]. COGS milk is held flat at $2.25/gal (FMMO Class I) every month — an
// estimate, not a measured plant figure — see appendix.
const PLANT_MARGIN = [
  ["Jul '25", 333613, 5.284, 2.25, 0.457, 1.530, 0.301, 0.746, 14],
  ["Aug '25", 306932, 5.217, 2.25, 0.496, 0.686, 0.394, 1.391, 27],
  ["Sep '25", 284884, 4.881, 2.25, 0.503, 1.177, 0.371, 0.580, 12],
  ["Oct '25", 317889, 4.725, 2.25, 0.465, 0.975, 0.356, 0.679, 14],
  ["Nov '25", 262089, 4.755, 2.25, 0.513, 1.000, 0.359, 0.633, 13],
  ["Dec '25", 332448, 4.698, 2.25, 0.461, 0.533, 0.267, 1.187, 25],
  ["Jan '26", 307297, 4.898, 2.25, 0.518, 1.188, 0.329, 0.613, 13],
  ["Feb '26", 300520, 4.739, 2.25, 0.508, 1.189, 0.332, 0.461, 10],
  ["Mar '26", 345432, 4.875, 2.25, 0.447, 0.992, 0.228, 0.957, 20],
  ["Apr '26", 348067, 5.611, 2.25, 0.460, 1.367, 0.328, 1.207, 22],
  ["May '26", 344494, 5.473, 2.25, 0.566, 1.086, 0.315, 1.256, 23],
  ["Jun '26", 332148, 5.556, 2.25, 0.472, 1.415, 0.338, 1.080, 19],
];
const PLANT_MARGIN_TTM = [3815814, 5.074, 2.25, 0.488, 1.098, 0.324, 0.914, 18];

function renderPlantMarginTable() {
  const cols = [...PLANT_MARGIN.map(r => r[0]), "TTM"];
  const rows = [
    {lbl:"FMMO Reported Gallons", i:1, fmt:v=>fmt(v)},
    {lbl:"Revenue / Gallon",      i:2, fmt:v=>"$"+v.toFixed(3)},
    {lbl:"COGS Milk (est.)<sup>3</sup>", i:3, fmt:v=>"$"+v.toFixed(2)},
    {lbl:"Labor",                 i:4, fmt:v=>"$"+v.toFixed(3)},
    {lbl:"Packaging &amp; Ingredients", i:5, fmt:v=>"$"+v.toFixed(3)},
    {lbl:"All Other Plant Costs", i:6, fmt:v=>"$"+v.toFixed(3)},
    {lbl:"Net Margin / Gallon",   i:7, fmt:v=>"$"+v.toFixed(3), total:true, pending:true},
    {lbl:"Margin %",              i:8, fmt:v=>v+"%", total:true, pending:true},
  ];
  document.getElementById("plantMarginTable").innerHTML =
    `<thead><tr><th>Metric</th>${cols.map((c,i)=>`<th class="n${i===cols.length-1 ? " col-ttm" : ""}">${c}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(r => {
      if (r.pending) {
        return `<tr class="row-total row-pending" title="Pending review"><td>${r.lbl}</td><td class="n" colspan="${cols.length}">Pending Finalization</td></tr>`;
      }
      const cells = PLANT_MARGIN.map(row => `<td class="n">${r.fmt(row[r.i])}</td>`).join("");
      const ttmCell = `<td class="n col-ttm">${r.fmt(PLANT_MARGIN_TTM[r.i-1])}</td>`;
      return `<tr${r.total ? ' class="row-total"' : ""}><td>${r.lbl}</td>${cells}${ttmCell}</tr>`;
    }).join("")}
    </tbody>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CROP EFFICIENCY
// ═══════════════════════════════════════════════════════════════════════════════
// Per Casey, 2025 crop-year averages. Oceana County Average (57.5 bu/a wheat,
// 152.8 bu/a grain corn — both 2022-23 averages) is the same figure cited on the
// wheat and Corn (Grain) stat cards, from the Michigan Annual Statistical
// Bulletin's County Estimates table — a more relevant local benchmark than the
// Michigan state average used previously. Corn silage and alfalfa are shown
// without a benchmark: the county-level breakout in that bulletin doesn't cover
// either crop, and alfalfa's own figure is silage tons/acre (not the dry hay
// tons/acre a hay-basis benchmark would report), so it wasn't comparable even
// when a state figure was shown.
const CROP_YIELD_UNITS = ["t/a","t/a","bu/a","bu/a"];
function initCrops() {
  new Chart(document.getElementById("cropYieldChart"), {
    type:"bar",
    data:{
      labels:["Corn Silage","Alfalfa Silage","Wheat","Corn (Grain)"],
      datasets:[
        {label:"Country Dairy Actual",   data:[15,9.8,60,150],   backgroundColor:C.kelly, borderRadius:4},
        {label:"Oceana County Average",  data:[null,null,57.5,152.8], backgroundColor:C.muted, borderRadius:4},
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{position:"top"},
        tooltip:{callbacks:{label: c => c.dataset.label + ": " +
          c.parsed.y + " " + CROP_YIELD_UNITS[c.dataIndex]}}
      },
      scales:{
        x:{grid:{display:false}},
        y:{grid:{color:gridColor()}, ticks:{callback:v=>v}}
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  COSTS
// ═══════════════════════════════════════════════════════════════════════════════
function initCosts() {
  new Chart(document.getElementById("costDonutChart"), {
    type:"doughnut",
    data:{
      labels:["Fixed Costs","Variable Costs"],
      datasets:[{
        data:[612000, 1224000],
        backgroundColor:[C.green, C.kelly],
        borderWidth:2,
        borderColor: getComputedStyle(document.documentElement).getPropertyValue("--panel").trim()
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      cutout:"55%",
      plugins:{
        legend:{position:"right"},
        tooltip:{callbacks:{label: c => c.label + ": " + fmtK(c.parsed) +
          " (" + (c.parsed/(612000+1224000)*100).toFixed(1) + "%)"}}
      }
    }
  });

  const costMonths = ["Jul","Aug","Sep","Oct","Nov","Dec"];
  new Chart(document.getElementById("costStackChart"), {
    type:"bar",
    data:{
      labels: costMonths,
      datasets:[
        {label:"Feed",       data:[52,51,52,53,52,53], backgroundColor:C.green,  borderRadius:0},
        {label:"Labor",      data:[32,32,32,33,33,33], backgroundColor:C.mid,    borderRadius:0},
        {label:"Overhead",   data:[18,18,18,19,18,18], backgroundColor:C.kelly,  borderRadius:0},
        {label:"Crops/Other",data:[12,12,13,12,12,14], backgroundColor:C.muted,  borderRadius:0},
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{position:"top"},
        tooltip:{callbacks:{label: c => c.dataset.label + ": $" + c.parsed.y + "K"}}
      },
      scales:{
        x:{grid:{display:false}, stacked:true},
        y:{grid:{color:gridColor()}, stacked:true, ticks:{callback:v=>"$"+v+"K"}}
      }
    }
  });

  const fixedItems = [
    ["Depreciation",       284000],
    ["Base Salaries",      188000],
    ["Processing Labor",   148000],
    ["Land Rent",           52000],
    ["Insurance",           48000],
    ["Property Tax",        31000],
    ["Other Fixed",         41000],
  ];
  const varItems = [
    ["Purchased Feed",     628000],
    ["Crop Inputs",        218000],
    ["Fuel & Utilities",   134000],
    ["Vet / Breeding",      88000],
    ["Milk Hauling",        76000],
    ["Repairs & Supplies",  64000],
    ["Misc. Variable",      44000],
    ["Milk Hauling-Other",  -8000], // adjustment line
  ];
  // Clean up the adj line
  const varClean = [
    ["Purchased Feed",     628000],
    ["Crop Inputs",        218000],
    ["Fuel & Utilities",   134000],
    ["Vet / Breeding",      88000],
    ["Milk Hauling",        76000],
    ["Repairs & Supplies",  64000],
    ["Misc. Variable",      44000],
  ];
  const totalFixed = fixedItems.reduce((s,[,v])=>s+v,0);
  const totalVar   = varClean.reduce((s,[,v])=>s+v,0);
  const grandTotal = totalFixed + totalVar;
  const totalCwt   = 94190;

  const rows = [
    ...fixedItems.map(([n,v]) => ["Fixed",n,v]),
    ...varClean.map(([n,v]) => ["Variable",n,v]),
  ];

  document.getElementById("costTable").innerHTML =
    `<thead><tr><th>Type</th><th>Line Item</th><th class="n">Annual</th>
    <th class="n">$/cwt</th><th class="n">% of Total</th></tr></thead>
    <tbody>
    ${rows.map(([type,name,amt]) => {
      return `<tr>
        <td style="font-size:.75rem;text-transform:uppercase;letter-spacing:.4px;color:var(--muted)">${type}</td>
        <td>${name}</td>
        <td class="n">###</td>
        <td class="n">###</td>
        <td class="n">###</td>
      </tr>`;
    }).join("")}
    <tr style="font-weight:700;border-top:2px solid var(--border)">
      <td colspan="2">Total Fixed</td>
      <td class="n">###</td>
      <td class="n">###</td>
      <td class="n">###</td>
    </tr>
    <tr style="font-weight:700">
      <td colspan="2">Total Variable</td>
      <td class="n">###</td>
      <td class="n">###</td>
      <td class="n">###</td>
    </tr>
    <tr style="font-weight:700;background:var(--bg);border-top:2px solid var(--border)">
      <td colspan="2" style="font-size:1rem">Grand Total</td>
      <td class="n" style="font-size:1rem">###</td>
      <td class="n" style="font-size:1rem">###</td>
      <td class="n">###</td>
    </tr></tbody>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MARKET — DEMAND-SIDE SCAN
// ═══════════════════════════════════════════════════════════════════════════════
function initMarket() {
  // Cedar Crest Weekly Sales Database - April2025-March2026.xlsx, 'Summary - All Weeks' tab,
  // customers with Weeks Ordered >= 3, summed Total Cases per category (same name-based categories
  // as 'Customer Cases by Distance'). Unlike that scatter, totals here include all customers --
  // 'Other' includes the 3 United Natural Foods distributor accounts (209,328 of its 270,063 cases).
  // customerCount is the number of distinct customers plotted for that category in 'Customer Cases
  // by Distance' (Weeks Ordered >= 3, mapped ZIP), +3 for Other's UNFI accounts (not plotted there,
  // per that chart's own note). It therefore slightly undercounts categories that also have
  // customers below the 3-week threshold, who still contribute to the case totals above -- treat
  // Avg Cases/Customer as directional, not exact.
  const CASES_BY_CHANNEL = [
    {label:"Other", cases:270063, customerCount:281, color:C.muted},
    {label:"Convenience Store / Gas", cases:226221, customerCount:548, color:C.amber},
    {label:"Supermarket / Grocery", cases:62206, customerCount:108, color:C.blue},
    {label:"Ice Cream / Dessert Shop", cases:52832, customerCount:180, color:C.green},
    {label:"School / Institutional", cases:47833, customerCount:207, color:C.kelly},
    {label:"Coffee Shop", cases:15882, customerCount:146, color:C.mid},
    {label:"Restaurant / Food Service", cases:4008, customerCount:32, color:C.red},
  ];

  let marketChannelChartInstance = null;
  function renderMarketChannelChart(metric) {
    const value = c => metric === "avg" ? c.cases / c.customerCount : c.cases;
    const sorted = [...CASES_BY_CHANNEL].sort((a,b) => value(b) - value(a));

    if (marketChannelChartInstance) marketChannelChartInstance.destroy();
    marketChannelChartInstance = new Chart(document.getElementById("marketDemandChart"), {
      type:"bar",
      data:{
        labels: sorted.map(c => c.label),
        datasets:[{
          data: sorted.map(value),
          backgroundColor: sorted.map(c => c.color),
          borderRadius:5, label: metric === "avg" ? "Avg Cases / Customer" : "Total Cases"
        }]
      },
      options:{
        indexAxis:"y", responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false},
          tooltip:{callbacks:{
            label: c => {
              const ch = sorted[c.dataIndex];
              return [`Total Cases: ${fmt(ch.cases)}`, `Customers: ${fmt(ch.customerCount)}`,
                `Avg Cases / Customer: ${fmt(Math.round(ch.cases/ch.customerCount))}`];
            }
          }} },
        scales:{
          x:{grid:{color:gridColor()}, ticks:{callback:v=>fmt(Math.round(v))}},
          y:{grid:{display:false}, ticks:{font:{size:11}}}
        }
      }
    });
  }
  renderMarketChannelChart("total");
  document.querySelectorAll(".js-channel-metric-toggle button").forEach(btn =>
    btn.addEventListener("click", () => {
      const metric = btn.dataset.metric;
      document.querySelectorAll(".js-channel-metric-toggle button").forEach(b =>
        b.classList.toggle("active", b.dataset.metric === metric));
      renderMarketChannelChart(metric);
    }));

  // Cedar Crest Weekly Sales Database - April2025-March2026.xlsx, 'Summary - All Weeks' tab,
  // filtered to customers with Weeks Ordered >= 3 (1,523 of 1,730 total). % is of the 1,502 of
  // those with a mapped ZIP/distance ('Miles to Country Dairy' column); 21 unmapped customers
  // excluded. Even 50-mile bands; the lone customer beyond 300 mi (a distributor, ~684 mi) falls
  // in the open-ended 300+ mi band.
  const PEN_BY_DISTANCE = [
    {label:"0-49 mi", count:293, pct:19.5},
    {label:"50-99 mi", count:558, pct:37.2},
    {label:"100-149 mi", count:490, pct:32.6},
    {label:"150-199 mi", count:146, pct:9.7},
    {label:"200-249 mi", count:8, pct:0.5},
    {label:"250-299 mi", count:6, pct:0.4},
    {label:"300+ mi", count:1, pct:0.1},
  ];
  const heatLow = [216,227,218], heatHigh = [7,77,26];
  const heatColor = pct => {
    const t = pct/40;
    return "rgb(" + heatLow.map((l,i) => Math.round(l + (heatHigh[i]-l)*t)).join(",") + ")";
  };
  new Chart(document.getElementById("marketPenetrationByDistanceChart"), {
    type:"bar",
    data:{
      labels: PEN_BY_DISTANCE.map(b => b.label),
      datasets:[{
        data: PEN_BY_DISTANCE.map(b => b.pct),
        backgroundColor: PEN_BY_DISTANCE.map(b => heatColor(b.pct)),
        borderRadius:5, label:"% of Customers"
      }]
    },
    options:{
      indexAxis:"y", responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false},
        tooltip:{callbacks:{label: c => {
          const b = PEN_BY_DISTANCE[c.dataIndex];
          return `${b.pct}% of customers (${fmt(b.count)})`;
        }}} },
      scales:{
        x:{grid:{color:gridColor()}, ticks:{callback:v=>v+"%"}, max:40},
        y:{grid:{display:false}, ticks:{font:{size:11}}}
      }
    }
  });

  // Same 7 distance bands as Customer Share by Distance Band above. "actual" is Country
  // Dairy's own customer count (from Customer Cases by Distance's own plotted points,
  // binned by distance -- an exact count, not estimated). "estTotal" is a rough estimate
  // of ALL businesses of that type in that band, regardless of whether they're a Country
  // Dairy customer -- built from county-level population placed in each band (land/road-
  // reachable Michigan and adjacent-state geography only; straight-line distance would
  // otherwise pull in Milwaukee/Chicago across Lake Michigan, which isn't a realistic
  // delivery area) times a national businesses-per-capita benchmark for that category
  // (NACS for convenience stores, FMI/Census for grocery, NCES for K-12 schools, industry
  // estimates for coffee shops and restaurants -- see appendix for figures and sources).
  // 200-249 mi and 250-299 mi are shown for completeness (they match the chart above) but
  // actual = 0 for all 5 types there; 300+ mi is omitted from estTotal entirely -- it's an
  // open-ended distance with no natural population boundary, and actual is 0 there too.
  // Treat estTotal, and therefore the % figures below, as order-of-magnitude: population-
  // by-band and the density benchmarks are both national/regional approximations, not a
  // GIS radius query, so the true estimated-total count could reasonably be half to double
  // what's shown here. See the appendix footnote for the full methodology and caveats.
  const PEN_BANDS = ["0-49 mi","50-99 mi","100-149 mi","150-199 mi","200-249 mi","250-299 mi","300+ mi"];
  const PEN_BY_TYPE = [
    {label:"Convenience Store / Gas", color:C.green,
      actual:[108,215,191,34,0,0,0], estTotal:[159,635,544,817,1270,681,null]},
    {label:"Supermarket / Grocery",   color:C.blue,
      actual:[31,39,29,9,0,0,0],     estTotal:[58,233,200,300,467,250,null]},
    {label:"School / Institutional",  color:C.kelly,
      actual:[46,77,66,18,0,0,0],    estTotal:[134,537,461,691,1075,576,null]},
    {label:"Coffee Shop",             color:C.mid,
      actual:[20,39,68,19,0,0,0],    estTotal:[47,187,160,240,373,200,null]},
    {label:"Restaurant / Food Service", color:C.amber,
      actual:[2,10,13,7,0,0,0],      estTotal:[778,3111,2667,4000,6222,3333,null]},
  ];
  // Overall/Average: the 5 types above summed band-by-band (actual customers over
  // estimated total market), not an average of their 5 percentages -- weights each
  // type by how big its own addressable market is, so Convenience Store/Gas (the
  // biggest bucket) drives the overall figure more than e.g. Coffee Shop.
  PEN_BY_TYPE.push({
    label:"Overall / Average", color:C.red,
    actual: PEN_BANDS.map((_,i) => PEN_BY_TYPE.reduce((s,t) => s + t.actual[i], 0)),
    estTotal: PEN_BANDS.map((_,i) => PEN_BY_TYPE.some(t => t.estTotal[i] === null)
      ? null : PEN_BY_TYPE.reduce((s,t) => s + t.estTotal[i], 0)),
  });
  const penDatasets = [];
  PEN_BY_TYPE.forEach(t => {
    const pct = t.actual.map((a,i) => t.estTotal[i] ? a/t.estTotal[i]*100 : 0);
    penDatasets.push({
      label:t.label, stack:t.label, data:pct.map(p=>+p.toFixed(1)),
      backgroundColor:t.color, borderRadius:{topLeft:4,topRight:4}, borderSkipped:false
    });
    penDatasets.push({
      label:t.label+" (not ordering)", stack:t.label,
      data:pct.map((p,i)=>t.estTotal[i]===null ? 0 : +(100-p).toFixed(1)),
      backgroundColor:t.color+"33", borderRadius:{bottomLeft:4,bottomRight:4}, borderSkipped:false
    });
  });
  new Chart(document.getElementById("marketPenetrationChart"), {
    type:"bar",
    data:{ labels: PEN_BANDS, datasets: penDatasets },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{
          labels:{ filter: item => !item.text.includes("(not ordering)") }
        },
        tooltip:{
          filter: item => !item.dataset.label.includes("(not ordering)"),
          callbacks:{
            label: c => {
              const t = PEN_BY_TYPE[Math.floor(c.datasetIndex/2)];
              const est = t.estTotal[c.dataIndex];
              if (est === null) return `${t.label}: not enough data to estimate at this distance`;
              return [`${t.label}: ${c.parsed.y}% of an estimated ${fmt(est)} in this band`,
                `Actual customers: ${fmt(t.actual[c.dataIndex])}`];
            }
          }
        }
      },
      scales:{
        x:{grid:{display:false}, stacked:true},
        y:{grid:{color:gridColor()}, stacked:true, ticks:{callback:v=>v+"%"}, max:100}
      }
    }
  });

  // Cedar Crest Weekly Sales Database - April2025-March2026.xlsx, 'Summary - All Weeks' tab,
  // customers with Weeks Ordered >= 3 with a mapped ZIP/distance (n=1,502, minus 3 outliers
  // excluded below = 1,499 plotted). y = each customer's Total Cases summed across the period
  // (revenue is not tracked in this data table). Category is inferred from customer name (keyword
  // match, no explicit type field in the source) -- directional, not exact. 'Other' rolls up
  // Farm/Agriculture, Church/Community Org, Campground/Recreation, Distributor/Wholesale, and
  // unclassified names. The 3 largest accounts (all United Natural Foods distributor locations:
  // 119,928 / 54,864 / 34,536 cases) are excluded from this scatter so the scale stays readable
  // for typical customers -- see the panel note and 'Case Volume by Channel' for full totals.
  const CASES_BY_DISTANCE = [
  {label:"Convenience Store / Gas", color:C.amber, data:[{x:131.5,y:173},{x:141.2,y:342},{x:68.0,y:130},{x:78.7,y:538},{x:180.8,y:148},{x:43.1,y:453},{x:152.6,y:140},{x:86.6,y:374},{x:79.4,y:515},{x:46.1,y:507},{x:152.7,y:71},{x:102.2,y:236},{x:57.3,y:67},{x:56.2,y:301},{x:74.1,y:968},{x:120.1,y:273},{x:117.6,y:60},{x:160.8,y:113},{x:140.7,y:982},{x:60.1,y:1044},{x:52.9,y:574},{x:79.4,y:247},{x:149.4,y:18},{x:65.8,y:696},{x:140.7,y:490},{x:58.8,y:282},{x:61.5,y:348},{x:51.9,y:5},{x:57.3,y:454},{x:75.6,y:194},{x:4.9,y:993},{x:140.7,y:120},{x:132.4,y:125},{x:129.0,y:251},{x:59.9,y:690},{x:65.7,y:283},{x:129.0,y:359},{x:168.3,y:364},{x:30.6,y:424},{x:126.6,y:110},{x:6.4,y:1229},{x:25.3,y:1551},{x:152.0,y:130},{x:99.8,y:336},{x:56.2,y:460},{x:95.7,y:47},{x:86.7,y:873},{x:138.4,y:100},{x:84.8,y:1118},{x:104.8,y:100},{x:102.2,y:223},{x:50.8,y:541},{x:129.0,y:230},{x:110.1,y:36},{x:61.7,y:384},{x:136.8,y:196},{x:98.6,y:381},{x:132.8,y:638},{x:53.0,y:224},{x:65.8,y:198},{x:182.4,y:247},{x:184.7,y:36},{x:51.9,y:455},{x:77.0,y:505},{x:80.3,y:491},{x:135.3,y:144},{x:112.6,y:111},{x:57.2,y:1091},{x:28.5,y:1104},{x:101.0,y:218},{x:135.3,y:148},{x:51.9,y:792},{x:83.0,y:269},{x:92.7,y:91},{x:0.0,y:1232},{x:120.1,y:413},{x:111.5,y:414},{x:95.7,y:5921},{x:26.6,y:529},{x:104.0,y:197},{x:30.6,y:38},{x:149.4,y:354},{x:117.8,y:117},{x:148.9,y:296},{x:143.7,y:224},{x:78.7,y:657},{x:16.0,y:269},{x:23.9,y:1057},{x:53.9,y:729},{x:177.0,y:152},{x:75.6,y:136},{x:97.7,y:103},{x:119.4,y:106},{x:55.5,y:53},{x:74.4,y:293},{x:147.9,y:608},{x:89.3,y:432},{x:66.3,y:434},{x:51.1,y:6},{x:98.8,y:146},{x:78.7,y:496},{x:111.5,y:157},{x:59.6,y:396},{x:129.7,y:22},{x:69.0,y:144},{x:80.6,y:540},{x:127.1,y:139},{x:44.2,y:609},{x:101.0,y:110},{x:121.9,y:595},{x:78.8,y:612},{x:59.6,y:99},{x:86.1,y:296},{x:92.9,y:139},{x:149.8,y:327},{x:30.0,y:359},{x:30.0,y:1146},{x:95.3,y:27},{x:60.1,y:274},{x:133.8,y:30},{x:56.2,y:34},{x:50.8,y:192},{x:48.7,y:684},{x:51.9,y:489},{x:34.0,y:1251},{x:45.2,y:523},{x:30.6,y:847},{x:102.7,y:394},{x:38.4,y:277},{x:29.3,y:404},{x:46.1,y:264},{x:130.9,y:566},{x:73.3,y:1087},{x:47.8,y:445},{x:114.3,y:108},{x:86.1,y:30},{x:108.8,y:744},{x:160.6,y:1842},{x:61.4,y:112},{x:47.6,y:540},{x:102.7,y:6},{x:52.9,y:1506},{x:61.6,y:74},{x:23.9,y:184},{x:130.4,y:442},{x:102.7,y:247},{x:47.6,y:489},{x:34.0,y:1754},{x:52.9,y:188},{x:52.0,y:696},{x:111.9,y:136},{x:52.9,y:469},{x:106.9,y:39},{x:131.8,y:213},{x:61.4,y:480},{x:48.8,y:882},{x:92.2,y:21},{x:45.2,y:488},{x:102.3,y:146},{x:138.5,y:646},{x:107.3,y:176},{x:65.7,y:70},{x:116.2,y:1154},{x:62.9,y:633},{x:53.0,y:265},{x:43.5,y:828},{x:146.0,y:124},{x:26.6,y:205},{x:132.8,y:12},{x:99.8,y:335},{x:48.7,y:180},{x:32.2,y:20},{x:118.1,y:134},{x:132.4,y:542},{x:144.1,y:138},{x:64.0,y:1200},{x:50.4,y:5793},{x:61.7,y:5},{x:64.8,y:1448},{x:66.3,y:214},{x:55.1,y:242},{x:148.4,y:1330},{x:5.3,y:1451},{x:119.0,y:115},{x:152.7,y:133},{x:17.5,y:20},{x:187.9,y:196},{x:101.3,y:197},{x:104.9,y:80},{x:129.0,y:39},{x:6.4,y:295},{x:64.0,y:679},{x:76.7,y:44},{x:121.4,y:114},{x:116.6,y:241},{x:117.8,y:50},{x:65.7,y:494},{x:68.2,y:231},{x:76.7,y:46},{x:101.7,y:688},{x:90.4,y:231},{x:34.0,y:625},{x:119.6,y:246},{x:106.6,y:151},{x:52.9,y:384},{x:50.4,y:756},{x:95.6,y:167},{x:183.3,y:130},{x:50.4,y:583},{x:70.6,y:783},{x:19.6,y:226},{x:53.0,y:147},{x:23.9,y:185},{x:23.9,y:1536},{x:183.3,y:38},{x:13.3,y:378},{x:95.8,y:212},{x:119.6,y:166},{x:125.5,y:308},{x:59.6,y:414},{x:65.7,y:422},{x:31.6,y:1866},{x:130.3,y:492},{x:95.3,y:781},{x:137.8,y:752},{x:102.7,y:147},{x:110.6,y:218},{x:106.6,y:51},{x:120.8,y:15},{x:116.9,y:223},{x:55.1,y:489},{x:114.3,y:2628},{x:96.3,y:413},{x:56.8,y:586},{x:52.0,y:464},{x:86.1,y:37},{x:121.4,y:7},{x:86.1,y:88},{x:102.7,y:30},{x:116.3,y:221},{x:43.1,y:855},{x:97.7,y:503},{x:13.3,y:404},{x:27.1,y:14},{x:50.4,y:96},{x:116.2,y:36},{x:129.0,y:269},{x:26.6,y:1456},{x:92.1,y:368},{x:119.4,y:70},{x:63.7,y:305},{x:32.2,y:826},{x:97.3,y:505},{x:52.9,y:269},{x:97.7,y:24},{x:163.1,y:516},{x:129.0,y:202},{x:68.2,y:387},{x:29.4,y:1331},{x:130.8,y:953},{x:183.3,y:118},{x:99.2,y:577},{x:132.8,y:68},{x:147.9,y:106},{x:116.2,y:641},{x:71.0,y:52},{x:63.4,y:96},{x:102.2,y:178},{x:50.4,y:468},{x:136.8,y:242},{x:59.6,y:26},{x:51.1,y:171},{x:149.3,y:394},{x:17.5,y:653},{x:74.1,y:24},{x:79.4,y:459},{x:60.1,y:234},{x:76.7,y:202},{x:11.2,y:57},{x:64.8,y:327},{x:17.6,y:368},{x:107.3,y:62},{x:74.2,y:439},{x:99.7,y:15},{x:121.4,y:51},{x:137.8,y:294},{x:70.5,y:262},{x:138.4,y:175},{x:102.7,y:23},{x:38.4,y:1195},{x:65.8,y:189},{x:57.3,y:548},{x:53.0,y:591},{x:104.8,y:170},{x:130.3,y:72},{x:107.3,y:525},{x:156.9,y:234},{x:109.0,y:316},{x:17.5,y:98},{x:138.4,y:198},{x:116.9,y:158},{x:131.5,y:316},{x:143.6,y:410},{x:56.2,y:318},{x:110.1,y:102},{x:11.5,y:430},{x:121.2,y:207},{x:157.1,y:101},{x:14.8,y:187},{x:118.1,y:359},{x:97.8,y:346},{x:160.8,y:7},{x:157.1,y:26},{x:53.0,y:540},{x:95.7,y:377},{x:78.7,y:188},{x:148.9,y:25},{x:57.3,y:184},{x:55.1,y:344},{x:30.6,y:1111},{x:145.8,y:235},{x:128.5,y:187},{x:29.4,y:440},{x:105.2,y:157},{x:191.6,y:59},{x:74.1,y:20},{x:38.4,y:968},{x:98.6,y:600},{x:92.9,y:172},{x:76.7,y:22},{x:13.3,y:585},{x:49.6,y:863},{x:22.2,y:232},{x:132.5,y:171},{x:45.9,y:1010},{x:68.2,y:645},{x:61.7,y:94},{x:63.4,y:257},{x:90.4,y:213},{x:39.3,y:625},{x:35.8,y:868},{x:85.7,y:292},{x:60.1,y:255},{x:17.6,y:124},{x:111.5,y:78},{x:101.2,y:40},{x:131.5,y:258},{x:61.4,y:674},{x:23.9,y:1017},{x:102.7,y:174},{x:30.6,y:405},{x:110.7,y:22},{x:32.2,y:1496},{x:28.5,y:32},{x:53.3,y:144},{x:47.3,y:341},{x:25.3,y:265},{x:74.1,y:238},{x:98.6,y:89},{x:115.6,y:91},{x:34.0,y:3},{x:121.1,y:66},{x:59.6,y:545},{x:52.9,y:448},{x:139.0,y:9},{x:48.7,y:1125},{x:16.0,y:1340},{x:102.2,y:30},{x:133.8,y:250},{x:62.9,y:167},{x:132.8,y:77},{x:31.6,y:238},{x:95.6,y:123},{x:86.1,y:14},{x:104.1,y:85},{x:149.7,y:1410},{x:52.9,y:309},{x:121.4,y:133},{x:47.3,y:304},{x:110.6,y:143},{x:125.2,y:148},{x:75.6,y:199},{x:106.6,y:339},{x:101.3,y:66},{x:51.1,y:391},{x:17.6,y:436},{x:26.6,y:1764},{x:94.2,y:361},{x:23.9,y:1759},{x:53.0,y:216},{x:152.0,y:229},{x:5.3,y:388},{x:116.2,y:517},{x:98.6,y:185},{x:106.3,y:541},{x:78.7,y:14},{x:101.0,y:37},{x:136.8,y:150},{x:92.9,y:413},{x:120.1,y:293},{x:125.5,y:432},{x:157.1,y:13},{x:107.8,y:11},{x:105.2,y:188},{x:62.7,y:36},{x:79.4,y:10},{x:106.9,y:140},{x:153.0,y:83},{x:132.4,y:430},{x:192.3,y:61},{x:117.1,y:23},{x:126.6,y:115},{x:55.5,y:514},{x:11.2,y:119},{x:173.2,y:506},{x:172.1,y:368},{x:65.8,y:59},{x:59.6,y:181},{x:31.6,y:209},{x:148.4,y:285},{x:35.8,y:102},{x:127.4,y:383},{x:11.5,y:850},{x:17.5,y:422},{x:86.1,y:49},{x:17.6,y:1729},{x:53.0,y:961},{x:61.6,y:1045},{x:92.1,y:230},{x:79.4,y:822},{x:144.8,y:15},{x:68.2,y:644},{x:121.4,y:79},{x:130.4,y:518},{x:46.1,y:694},{x:51.1,y:642},{x:156.5,y:483},{x:71.0,y:455},{x:78.7,y:286},{x:86.5,y:24},{x:140.7,y:784},{x:135.3,y:33},{x:78.2,y:117},{x:30.6,y:48},{x:98.6,y:344},{x:80.6,y:522},{x:11.5,y:1500},{x:11.5,y:863},{x:143.7,y:25},{x:45.2,y:739},{x:57.2,y:573},{x:45.2,y:406},{x:110.6,y:146},{x:131.5,y:397},{x:63.1,y:311},{x:131.5,y:176},{x:120.8,y:149},{x:56.2,y:1239},{x:133.7,y:102},{x:52.9,y:918},{x:139.5,y:124},{x:53.0,y:679},{x:59.6,y:255},{x:104.8,y:40},{x:129.0,y:36},{x:25.3,y:230},{x:48.8,y:719},{x:51.1,y:639},{x:123.0,y:329},{x:92.4,y:962},{x:92.3,y:143},{x:152.0,y:301},{x:94.2,y:33},{x:56.2,y:16},{x:55.1,y:405},{x:92.4,y:140},{x:145.8,y:200},{x:157.1,y:1852},{x:59.6,y:394},{x:52.9,y:135},{x:61.5,y:611},{x:49.2,y:180},{x:89.3,y:133},{x:102.7,y:542},{x:127.5,y:186},{x:92.1,y:356},{x:107.8,y:132},{x:47.6,y:296},{x:0.0,y:299},{x:118.2,y:299},{x:173.8,y:101},{x:56.3,y:249},{x:46.5,y:474},{x:52.9,y:328},{x:145.8,y:163},{x:120.0,y:220},{x:91.4,y:650},{x:116.3,y:167},{x:125.8,y:212},{x:136.8,y:952},{x:119.0,y:65},{x:56.2,y:213},{x:104.2,y:178},{x:17.5,y:1354},{x:17.5,y:815},{x:22.2,y:1702},{x:50.8,y:337},{x:131.8,y:554},{x:53.0,y:147},{x:61.4,y:589},{x:48.8,y:1020},{x:138.5,y:410},{x:102.2,y:232},{x:57.3,y:471},{x:110.4,y:99},{x:70.5,y:866},{x:70.6,y:613},{x:118.1,y:4},{x:177.5,y:86},{x:99.8,y:270},{x:133.8,y:479},{x:145.9,y:281},{x:101.3,y:303},{x:84.8,y:513},{x:17.6,y:1214},{x:119.0,y:68},{x:79.4,y:491},{x:168.4,y:35},{x:25.3,y:1520},{x:74.1,y:272},{x:184.7,y:14},{x:138.4,y:2103},{x:28.5,y:538},{x:104.0,y:51},{x:85.1,y:409},{x:22.2,y:1468},{x:70.6,y:380},{x:55.6,y:215},{x:57.3,y:536},{x:39.3,y:1229},{x:117.8,y:101},{x:140.7,y:118},{x:129.5,y:357},{x:65.8,y:842},{x:132.3,y:146},{x:30.6,y:369},{x:132.0,y:153},{x:104.8,y:147}]},
  {label:"Supermarket / Grocery", color:C.blue, data:[{x:98.6,y:933},{x:44.2,y:789},{x:86.7,y:2158},{x:111.0,y:71},{x:86.1,y:72},{x:58.8,y:1481},{x:59.6,y:260},{x:104.0,y:150},{x:49.6,y:1373},{x:76.1,y:345},{x:99.7,y:989},{x:91.2,y:467},{x:64.0,y:648},{x:35.8,y:28},{x:191.4,y:173},{x:45.2,y:203},{x:64.0,y:1299},{x:105.4,y:140},{x:150.2,y:467},{x:48.7,y:583},{x:29.4,y:172},{x:35.6,y:695},{x:146.0,y:156},{x:47.6,y:410},{x:51.1,y:761},{x:160.2,y:220},{x:96.3,y:76},{x:120.1,y:352},{x:106.6,y:808},{x:51.1,y:482},{x:82.2,y:187},{x:123.7,y:562},{x:102.3,y:132},{x:33.0,y:365},{x:35.8,y:11},{x:31.6,y:235},{x:28.5,y:221},{x:58.8,y:819},{x:25.3,y:2082},{x:11.5,y:10},{x:142.9,y:37},{x:4.9,y:991},{x:119.0,y:170},{x:34.0,y:109},{x:55.6,y:928},{x:107.8,y:24},{x:17.6,y:2824},{x:4.9,y:85},{x:29.4,y:1758},{x:106.9,y:313},{x:86.7,y:793},{x:148.1,y:254},{x:26.6,y:2166},{x:80.8,y:189},{x:142.9,y:1569},{x:132.4,y:67},{x:102.2,y:342},{x:156.5,y:224},{x:91.2,y:912},{x:116.2,y:454},{x:108.6,y:90},{x:86.2,y:433},{x:54.2,y:524},{x:78.7,y:1068},{x:52.9,y:342},{x:106.3,y:21},{x:61.4,y:321},{x:26.6,y:133},{x:80.6,y:424},{x:17.5,y:58},{x:108.4,y:1912},{x:22.2,y:13},{x:138.7,y:209},{x:38.4,y:1914},{x:129.0,y:1873},{x:55.5,y:280},{x:125.5,y:126},{x:98.8,y:537},{x:139.6,y:163},{x:102.3,y:732},{x:29.4,y:12},{x:53.9,y:2429},{x:167.9,y:157},{x:125.5,y:218},{x:154.3,y:7},{x:22.2,y:1919},{x:50.4,y:1580},{x:38.4,y:194},{x:25.3,y:177},{x:57.3,y:556},{x:23.9,y:22},{x:51.9,y:250},{x:166.4,y:330},{x:99.7,y:1407},{x:102.7,y:47},{x:57.3,y:1494},{x:63.1,y:484},{x:99.7,y:154},{x:95.3,y:317},{x:143.7,y:546},{x:55.6,y:1403},{x:29.4,y:498},{x:119.0,y:144},{x:85.7,y:163},{x:94.2,y:67},{x:44.2,y:541},{x:150.2,y:170},{x:164.3,y:153}]},
  {label:"School / Institutional", color:C.kelly, data:[{x:138.5,y:19},{x:179.2,y:503},{x:127.1,y:155},{x:52.9,y:340},{x:50.8,y:290},{x:50.8,y:262},{x:34.0,y:508},{x:80.6,y:234},{x:111.4,y:612},{x:75.6,y:177},{x:135.5,y:70},{x:170.2,y:168},{x:34.0,y:636},{x:159.4,y:366},{x:80.6,y:213},{x:132.8,y:249},{x:179.2,y:143},{x:6.4,y:186},{x:50.8,y:153},{x:111.4,y:67},{x:50.8,y:218},{x:97.7,y:6},{x:57.3,y:343},{x:52.9,y:198},{x:52.9,y:119},{x:104.8,y:97},{x:179.2,y:156},{x:50.4,y:17},{x:46.1,y:212},{x:57.3,y:49},{x:180.8,y:141},{x:74.4,y:1020},{x:130.4,y:314},{x:114.1,y:19},{x:52.9,y:272},{x:52.9,y:300},{x:104.9,y:71},{x:38.0,y:20},{x:124.0,y:115},{x:52.9,y:235},{x:65.7,y:176},{x:31.6,y:389},{x:123.0,y:302},{x:116.9,y:205},{x:104.8,y:341},{x:104.8,y:649},{x:46.1,y:260},{x:135.3,y:4},{x:130.3,y:617},{x:47.8,y:307},{x:52.9,y:487},{x:104.8,y:255},{x:124.0,y:50},{x:19.6,y:858},{x:104.1,y:189},{x:22.2,y:44},{x:51.9,y:300},{x:105.4,y:108},{x:46.1,y:507},{x:95.3,y:136},{x:34.0,y:197},{x:102.8,y:78},{x:52.9,y:156},{x:22.2,y:478},{x:127.1,y:217},{x:163.5,y:55},{x:52.9,y:281},{x:123.7,y:59},{x:135.3,y:28},{x:104.9,y:78},{x:51.9,y:207},{x:51.9,y:99},{x:52.9,y:239},{x:70.2,y:376},{x:179.2,y:327},{x:56.3,y:44},{x:51.9,y:237},{x:117.1,y:85},{x:75.6,y:307},{x:50.8,y:280},{x:104.8,y:818},{x:11.5,y:352},{x:0.0,y:73},{x:121.4,y:251},{x:22.2,y:417},{x:46.1,y:43},{x:77.7,y:533},{x:86.5,y:331},{x:74.9,y:9},{x:74.2,y:251},{x:130.4,y:332},{x:47.8,y:130},{x:80.6,y:201},{x:130.4,y:466},{x:143.6,y:52},{x:23.9,y:400},{x:50.8,y:30},{x:50.8,y:156},{x:105.4,y:100},{x:104.1,y:35},{x:68.2,y:43},{x:110.6,y:105},{x:57.2,y:241},{x:22.2,y:320},{x:44.2,y:97},{x:47.8,y:316},{x:39.3,y:38},{x:102.2,y:144},{x:86.6,y:442},{x:57.3,y:117},{x:130.4,y:293},{x:107.9,y:8},{x:167.9,y:203},{x:5.3,y:208},{x:51.9,y:279},{x:106.6,y:10},{x:106.6,y:24},{x:104.8,y:138},{x:97.7,y:25},{x:128.8,y:332},{x:114.9,y:4},{x:51.1,y:3},{x:92.1,y:150},{x:52.9,y:18},{x:156.5,y:987},{x:5.3,y:166},{x:50.8,y:483},{x:138.1,y:320},{x:114.9,y:787},{x:104.8,y:282},{x:30.6,y:264},{x:173.8,y:38},{x:179.2,y:529},{x:129.0,y:584},{x:111.4,y:216},{x:57.3,y:153},{x:46.1,y:314},{x:123.7,y:21},{x:63.1,y:177},{x:130.4,y:441},{x:181.7,y:96},{x:52.9,y:178},{x:38.2,y:33},{x:102.2,y:386},{x:50.4,y:318},{x:4.9,y:9},{x:118.2,y:105},{x:130.4,y:396},{x:117.8,y:10},{x:74.1,y:286},{x:179.2,y:510},{x:65.7,y:201},{x:52.9,y:218},{x:65.7,y:207},{x:22.2,y:338},{x:17.5,y:36},{x:60.1,y:392},{x:104.1,y:335},{x:30.6,y:188},{x:116.9,y:1262},{x:47.8,y:383},{x:51.9,y:547},{x:50.4,y:202},{x:75.6,y:754},{x:5.3,y:236},{x:114.1,y:31},{x:121.2,y:59},{x:60.1,y:70},{x:114.1,y:22},{x:73.2,y:205},{x:80.3,y:20},{x:29.4,y:265},{x:180.8,y:228},{x:29.4,y:553},{x:63.7,y:173},{x:92.9,y:421},{x:152.0,y:5},{x:0.0,y:19},{x:51.9,y:231},{x:62.7,y:13},{x:5.3,y:310},{x:50.8,y:14},{x:30.6,y:199},{x:13.3,y:143},{x:171.8,y:24},{x:144.1,y:11},{x:52.9,y:327},{x:168.7,y:38},{x:102.8,y:19},{x:85.4,y:8},{x:106.6,y:247},{x:100.6,y:15},{x:130.4,y:289},{x:50.8,y:242},{x:30.6,y:239},{x:80.6,y:183},{x:52.9,y:16},{x:107.3,y:160},{x:106.6,y:103},{x:51.9,y:227},{x:29.4,y:53},{x:44.2,y:14},{x:22.2,y:467},{x:51.9,y:209},{x:49.6,y:69},{x:60.1,y:25},{x:17.6,y:656}]},
  {label:"Ice Cream / Dessert Shop", color:C.green, data:[{x:173.2,y:126},{x:85.1,y:317},{x:91.2,y:66},{x:86.9,y:395},{x:25.3,y:162},{x:57.3,y:75},{x:117.6,y:25},{x:95.3,y:141},{x:181.9,y:31},{x:143.7,y:196},{x:25.3,y:691},{x:207.7,y:69},{x:43.1,y:285},{x:86.9,y:81},{x:64.0,y:16},{x:241.6,y:35},{x:52.9,y:2212},{x:70.0,y:426},{x:59.9,y:141},{x:179.0,y:15},{x:182.6,y:18},{x:137.2,y:33},{x:137.5,y:17},{x:112.4,y:424},{x:143.7,y:4},{x:121.6,y:513},{x:148.1,y:4},{x:120.1,y:523},{x:51.9,y:42},{x:297.8,y:418},{x:59.6,y:491},{x:185.2,y:379},{x:80.3,y:334},{x:70.0,y:48},{x:112.4,y:12},{x:119.5,y:89},{x:70.6,y:397},{x:44.2,y:279},{x:31.6,y:12},{x:56.2,y:158},{x:51.1,y:140},{x:80.7,y:187},{x:53.0,y:159},{x:85.7,y:25},{x:190.7,y:56},{x:102.2,y:64},{x:144.8,y:240},{x:56.3,y:163},{x:86.2,y:99},{x:113.7,y:1212},{x:111.5,y:11},{x:130.6,y:11},{x:166.9,y:86},{x:259.7,y:154},{x:82.8,y:76},{x:214.9,y:2286},{x:58.8,y:10},{x:172.1,y:3},{x:224.3,y:213},{x:131.5,y:1225},{x:180.1,y:117},{x:132.5,y:116},{x:143.6,y:98},{x:108.6,y:4},{x:53.9,y:409},{x:17.6,y:499},{x:85.4,y:31},{x:75.6,y:184},{x:101.3,y:129},{x:44.2,y:294},{x:47.6,y:287},{x:161.0,y:131},{x:135.3,y:900},{x:63.4,y:813},{x:179.3,y:30},{x:189.6,y:261},{x:58.8,y:137},{x:45.7,y:38},{x:35.8,y:22},{x:53.9,y:175},{x:145.8,y:635},{x:132.8,y:442},{x:178.9,y:52},{x:143.6,y:292},{x:11.2,y:447},{x:179.6,y:225},{x:47.0,y:833},{x:110.6,y:148},{x:181.6,y:60},{x:49.6,y:36},{x:23.9,y:10},{x:185.7,y:6},{x:166.3,y:5},{x:137.0,y:28},{x:74.1,y:8},{x:243.5,y:43},{x:57.3,y:31},{x:79.4,y:568},{x:107.8,y:1290},{x:21.8,y:171},{x:107.6,y:617},{x:60.1,y:847},{x:55.1,y:700},{x:180.1,y:68},{x:69.0,y:26},{x:52.9,y:125},{x:0.0,y:26},{x:144.9,y:32},{x:66.3,y:112},{x:86.9,y:37},{x:53.0,y:21},{x:179.0,y:7},{x:148.4,y:7381},{x:86.1,y:471},{x:32.2,y:79},{x:162.0,y:387},{x:17.6,y:31},{x:97.7,y:564},{x:72.5,y:20},{x:66.3,y:460},{x:131.5,y:8},{x:117.6,y:452},{x:243.7,y:930},{x:138.7,y:7},{x:254.1,y:85},{x:193.7,y:246},{x:79.4,y:126},{x:213.8,y:28},{x:59.6,y:33},{x:65.7,y:215},{x:131.5,y:29},{x:175.1,y:129},{x:190.2,y:64},{x:76.6,y:237},{x:104.2,y:791},{x:92.1,y:510},{x:52.9,y:722},{x:165.2,y:65},{x:123.0,y:4},{x:57.3,y:96},{x:68.2,y:370},{x:85.2,y:113},{x:143.6,y:2030},{x:132.5,y:81},{x:114.2,y:5},{x:185.3,y:31},{x:106.4,y:19},{x:92.3,y:251},{x:148.1,y:4},{x:52.9,y:478},{x:52.9,y:336},{x:116.2,y:99},{x:30.6,y:602},{x:38.4,y:20},{x:39.3,y:236},{x:59.6,y:977},{x:94.0,y:105},{x:75.6,y:3},{x:115.6,y:8},{x:60.1,y:9},{x:56.8,y:61},{x:57.3,y:72},{x:17.5,y:102},{x:53.0,y:309},{x:173.8,y:223},{x:11.5,y:186},{x:11.5,y:283},{x:90.4,y:238},{x:55.5,y:330},{x:107.0,y:67},{x:65.8,y:137},{x:51.1,y:361},{x:61.7,y:181},{x:38.4,y:207},{x:157.3,y:317},{x:121.1,y:588},{x:191.4,y:7},{x:102.3,y:309},{x:22.2,y:127},{x:125.1,y:37}]},
  {label:"Coffee Shop", color:C.mid, data:[{x:53.3,y:69},{x:57.3,y:117},{x:136.8,y:214},{x:26.6,y:94},{x:57.3,y:73},{x:78.7,y:138},{x:130.4,y:77},{x:92.3,y:68},{x:59.6,y:49},{x:135.3,y:75},{x:117.1,y:93},{x:84.6,y:79},{x:52.9,y:143},{x:99.5,y:99},{x:194.2,y:97},{x:125.2,y:70},{x:114.3,y:5},{x:61.4,y:175},{x:132.8,y:66},{x:187.0,y:74},{x:156.5,y:92},{x:61.5,y:114},{x:32.2,y:80},{x:29.4,y:65},{x:110.6,y:47},{x:108.6,y:44},{x:199.5,y:69},{x:130.6,y:74},{x:45.2,y:92},{x:66.3,y:146},{x:138.5,y:46},{x:120.0,y:110},{x:104.2,y:98},{x:70.6,y:175},{x:46.1,y:167},{x:129.0,y:104},{x:51.9,y:100},{x:43.1,y:88},{x:97.8,y:59},{x:39.3,y:111},{x:139.2,y:61},{x:115.6,y:39},{x:116.2,y:108},{x:92.4,y:12},{x:104.0,y:74},{x:104.2,y:163},{x:111.9,y:156},{x:110.1,y:134},{x:65.8,y:156},{x:142.4,y:279},{x:62.7,y:217},{x:199.4,y:140},{x:109.0,y:146},{x:113.7,y:123},{x:50.4,y:122},{x:121.6,y:380},{x:114.1,y:129},{x:144.8,y:99},{x:25.3,y:64},{x:110.1,y:114},{x:23.9,y:163},{x:108.6,y:102},{x:74.1,y:110},{x:64.0,y:9},{x:86.9,y:100},{x:53.0,y:431},{x:106.6,y:106},{x:104.2,y:140},{x:59.6,y:137},{x:110.1,y:132},{x:64.0,y:64},{x:120.1,y:118},{x:59.6,y:52},{x:85.7,y:104},{x:92.1,y:59},{x:110.6,y:95},{x:78.2,y:34},{x:104.8,y:127},{x:108.6,y:95},{x:102.7,y:5},{x:165.0,y:199},{x:118.2,y:59},{x:99.5,y:85},{x:110.6,y:31},{x:22.2,y:78},{x:116.2,y:143},{x:111.0,y:98},{x:193.6,y:60},{x:11.5,y:116},{x:84.8,y:114},{x:187.0,y:157},{x:159.1,y:197},{x:132.8,y:94},{x:106.9,y:61},{x:46.1,y:172},{x:59.6,y:83},{x:128.1,y:73},{x:48.7,y:54},{x:129.0,y:52},{x:135.3,y:83},{x:167.2,y:4},{x:110.6,y:45},{x:149.3,y:60},{x:139.6,y:140},{x:125.0,y:70},{x:104.0,y:778},{x:17.5,y:166},{x:129.0,y:59},{x:102.2,y:66},{x:57.3,y:25},{x:135.3,y:65},{x:101.3,y:274},{x:129.0,y:108},{x:110.6,y:67},{x:68.2,y:8},{x:131.8,y:25},{x:98.6,y:102},{x:101.3,y:154},{x:137.5,y:126},{x:185.7,y:113},{x:38.4,y:97},{x:184.8,y:138},{x:149.4,y:198},{x:135.3,y:131},{x:21.8,y:47},{x:150.0,y:39},{x:25.3,y:136},{x:188.0,y:103},{x:64.8,y:201},{x:105.2,y:80},{x:130.4,y:97},{x:162.0,y:68},{x:186.5,y:82},{x:34.0,y:91},{x:112.2,y:95},{x:104.2,y:115},{x:188.0,y:217},{x:124.0,y:23},{x:86.7,y:58},{x:64.0,y:84},{x:53.0,y:145},{x:148.1,y:99},{x:159.6,y:101},{x:160.8,y:75},{x:17.6,y:116},{x:47.8,y:127}]},
  {label:"Restaurant / Food Service", color:C.red, data:[{x:143.6,y:226},{x:178.9,y:73},{x:185.1,y:156},{x:144.1,y:312},{x:104.2,y:193},{x:144.8,y:413},{x:74.4,y:15},{x:156.2,y:10},{x:104.9,y:21},{x:104.2,y:161},{x:172.8,y:20},{x:53.0,y:124},{x:104.2,y:95},{x:56.2,y:227},{x:172.6,y:18},{x:136.6,y:188},{x:130.3,y:381},{x:52.9,y:163},{x:59.6,y:243},{x:44.2,y:53},{x:38.4,y:75},{x:64.0,y:22},{x:92.4,y:54},{x:58.8,y:13},{x:138.1,y:173},{x:139.6,y:273},{x:187.1,y:15},{x:52.9,y:91},{x:102.2,y:82},{x:161.8,y:87},{x:95.3,y:6},{x:133.7,y:25}]},
  {label:"Other", color:C.muted, data:[{x:123.7,y:65},{x:169.5,y:87},{x:58.8,y:1423},{x:114.3,y:38},{x:11.2,y:25},{x:46.1,y:56},{x:78.7,y:345},{x:59.9,y:62},{x:75.6,y:239},{x:68.2,y:173},{x:52.9,y:83},{x:14.8,y:64},{x:30.6,y:20},{x:171.8,y:53},{x:44.2,y:237},{x:32.2,y:10},{x:135.3,y:43},{x:187.9,y:31},{x:17.6,y:176},{x:102.3,y:21},{x:133.7,y:4},{x:11.2,y:33},{x:132.4,y:96},{x:74.2,y:404},{x:62.9,y:171},{x:99.5,y:620},{x:127.3,y:5},{x:40.2,y:197},{x:70.5,y:267},{x:132.4,y:240},{x:150.0,y:402},{x:78.7,y:19},{x:38.2,y:193},{x:59.6,y:8},{x:5.3,y:31},{x:53.3,y:16},{x:185.5,y:148},{x:61.7,y:40},{x:35.8,y:26},{x:102.2,y:486},{x:114.3,y:58},{x:94.8,y:206},{x:121.4,y:12},{x:38.4,y:338},{x:104.8,y:371},{x:157.1,y:191},{x:45.7,y:199},{x:51.9,y:282},{x:44.2,y:24},{x:30.0,y:306},{x:205.2,y:84},{x:59.6,y:188},{x:180.1,y:1112},{x:61.4,y:271},{x:17.5,y:28},{x:113.7,y:11},{x:130.4,y:11},{x:82.8,y:18},{x:171.9,y:51},{x:13.3,y:34},{x:125.5,y:28},{x:64.0,y:339},{x:29.4,y:53},{x:187.9,y:254},{x:179.2,y:40},{x:97.7,y:213},{x:4.9,y:210},{x:52.9,y:261},{x:53.9,y:27},{x:117.8,y:265},{x:56.2,y:215},{x:277.1,y:794},{x:86.7,y:241},{x:95.8,y:17},{x:53.3,y:289},{x:46.1,y:240},{x:17.5,y:6},{x:69.9,y:233},{x:53.9,y:21},{x:52.9,y:421},{x:107.3,y:254},{x:144.5,y:102},{x:17.6,y:28},{x:114.2,y:518},{x:130.4,y:35},{x:62.7,y:25},{x:80.3,y:375},{x:140.6,y:283},{x:55.6,y:398},{x:95.9,y:318},{x:139.5,y:12},{x:70.6,y:10},{x:104.2,y:398},{x:52.9,y:44},{x:51.9,y:4},{x:132.0,y:13},{x:184.4,y:6},{x:132.5,y:27},{x:95.8,y:99},{x:26.6,y:226},{x:50.4,y:112},{x:52.9,y:21},{x:171.9,y:372},{x:160.2,y:79},{x:26.6,y:6},{x:104.8,y:47},{x:135.0,y:12},{x:69.0,y:65},{x:126.6,y:89},{x:119.4,y:302},{x:50.4,y:52},{x:138.4,y:75},{x:53.9,y:484},{x:52.9,y:36},{x:154.3,y:105},{x:57.3,y:772},{x:110.4,y:3},{x:121.6,y:11},{x:13.3,y:4915},{x:22.2,y:137},{x:43.1,y:115},{x:127.4,y:7},{x:82.8,y:84},{x:182.9,y:159},{x:56.3,y:104},{x:31.1,y:246},{x:148.1,y:46},{x:180.1,y:8},{x:47.8,y:374},{x:57.2,y:13},{x:138.1,y:364},{x:99.5,y:415},{x:78.7,y:24},{x:49.6,y:740},{x:196.3,y:34},{x:32.2,y:404},{x:17.5,y:144},{x:53.1,y:176},{x:90.4,y:34},{x:102.7,y:26},{x:110.6,y:46},{x:97.7,y:66},{x:55.5,y:368},{x:91.9,y:188},{x:121.4,y:377},{x:182.9,y:416},{x:67.3,y:13},{x:91.2,y:178},{x:30.6,y:67},{x:121.4,y:15},{x:34.0,y:50},{x:11.2,y:305},{x:182.6,y:223},{x:254.6,y:48},{x:17.5,y:448},{x:175.6,y:16},{x:11.2,y:118},{x:52.9,y:31},{x:132.4,y:12},{x:91.4,y:50},{x:55.1,y:9},{x:29.4,y:223},{x:55.6,y:238},{x:97.8,y:213},{x:98.8,y:220},{x:50.4,y:119},{x:5.3,y:4203},{x:130.4,y:28},{x:111.4,y:73},{x:52.9,y:186},{x:143.0,y:136},{x:129.0,y:153},{x:11.2,y:16},{x:139.5,y:385},{x:160.8,y:446},{x:34.0,y:30},{x:65.7,y:42},{x:79.4,y:4},{x:50.4,y:183},{x:11.2,y:6},{x:108.6,y:735},{x:80.8,y:77},{x:124.0,y:15},{x:104.1,y:81},{x:51.1,y:85},{x:50.4,y:9},{x:117.6,y:336},{x:86.4,y:179},{x:61.9,y:177},{x:105.4,y:161},{x:126.6,y:13},{x:50.4,y:158},{x:107.8,y:24},{x:121.4,y:115},{x:66.3,y:407},{x:82.8,y:160},{x:74.1,y:4},{x:105.4,y:6},{x:105.2,y:42},{x:51.9,y:79},{x:60.1,y:67},{x:104.8,y:73},{x:23.9,y:95},{x:77.4,y:66},{x:84.6,y:47},{x:53.9,y:528},{x:29.3,y:13},{x:138.1,y:313},{x:122.8,y:12},{x:171.9,y:535},{x:47.6,y:337},{x:0.0,y:278},{x:65.7,y:217},{x:78.7,y:110},{x:171.9,y:177},{x:11.2,y:44},{x:43.5,y:27},{x:102.2,y:103},{x:89.6,y:194},{x:73.3,y:396},{x:170.8,y:134},{x:65.7,y:21},{x:130.8,y:226},{x:70.0,y:78},{x:130.4,y:200},{x:45.9,y:621},{x:50.4,y:696},{x:130.3,y:308},{x:46.1,y:379},{x:120.1,y:620},{x:125.5,y:4},{x:0.0,y:18},{x:45.2,y:290},{x:59.6,y:230},{x:52.9,y:158},{x:97.3,y:229},{x:51.9,y:221},{x:55.6,y:495},{x:55.5,y:107},{x:171.9,y:1218},{x:78.7,y:53},{x:157.1,y:75},{x:184.0,y:72},{x:92.1,y:10},{x:114.9,y:511},{x:127.1,y:95},{x:114.3,y:9},{x:83.5,y:87},{x:171.9,y:483},{x:5.3,y:170},{x:50.8,y:195},{x:146.0,y:8},{x:90.4,y:615},{x:171.9,y:2363},{x:47.8,y:300},{x:131.5,y:16},{x:29.4,y:101},{x:102.3,y:8},{x:11.2,y:36},{x:121.6,y:9},{x:97.8,y:386},{x:157.1,y:16},{x:140.7,y:30},{x:91.2,y:344},{x:124.9,y:45},{x:95.3,y:87},{x:11.2,y:151},{x:171.9,y:747},{x:47.3,y:181},{x:51.1,y:61},{x:59.6,y:234},{x:91.4,y:225},{x:140.6,y:26},{x:50.4,y:121},{x:55.6,y:607},{x:11.5,y:386},{x:148.1,y:13},{x:52.9,y:157}]},
];

  // Vertical reference line at the average distance of whichever category legend items are
  // currently visible/selected. Drawn as a canvas overlay (not a real dataset) so it recomputes
  // on every legend toggle without dragging the y-axis auto-scale along with it.
  const avgDistanceOfVisible = chart => {
    let sum = 0, n = 0;
    chart.data.datasets.forEach((ds, i) => {
      if (chart.getDatasetMeta(i).hidden) return;
      ds.data.forEach(p => { sum += p.x; n++; });
    });
    return n ? sum / n : null;
  };
  const avgDistanceLinePlugin = {
    id: "avgDistanceLine",
    afterDraw(chart) {
      const avg = avgDistanceOfVisible(chart);
      if (avg === null) return;
      const {ctx, chartArea:{top, bottom}, scales:{x}} = chart;
      const xPix = x.getPixelForValue(avg);
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([6,4]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = C.red;
      ctx.moveTo(xPix, top);
      ctx.lineTo(xPix, bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = C.red;
      ctx.font = "600 11px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Avg: ${avg.toFixed(1)} mi`, xPix, top + 12);
      ctx.restore();
    }
  };

  // Per-category average cases, drawn as horizontal dashed reference lines (one per
  // category, in that category's own color, parallel to the x-axis) so "typical" case
  // volume for each channel reads at a glance despite the log-scale y-axis and the wide
  // spread within each category. Only drawn for categories currently visible/selected
  // in the legend, same as the vertical avg-distance line above.
  const avgCasesByCategoryPlugin = {
    id: "avgCasesByCategory",
    afterDraw(chart) {
      const {ctx, chartArea:{left, right}, scales:{y}} = chart;
      chart.data.datasets.forEach((ds, i) => {
        if (chart.getDatasetMeta(i).hidden) return;
        const avg = ds.data.reduce((s,p) => s+p.y, 0) / ds.data.length;
        const yPix = y.getPixelForValue(avg);
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([5,3]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = ds.borderColor;
        ctx.globalAlpha = 0.7;
        ctx.moveTo(left, yPix);
        ctx.lineTo(right, yPix);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        ctx.fillStyle = ds.borderColor;
        ctx.font = "600 9px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`avg ${fmt(Math.round(avg))}`, right - 4, yPix - 3);
        ctx.restore();
      });
    }
  };

  new Chart(document.getElementById("marketCasesByDistanceChart"), {
    type:"scatter",
    data:{
      datasets: CASES_BY_DISTANCE.map(t => ({
        label:t.label, data:t.data, backgroundColor:t.color, borderColor:t.color, pointRadius:4, pointHoverRadius:6
      }))
    },
    plugins:[avgDistanceLinePlugin, avgCasesByCategoryPlugin],
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{position:"top"},
        tooltip:{callbacks:{label: c => c.dataset.label + ": " + fmt(c.parsed.y) + " cases at " + c.parsed.x + " mi"}} },
      scales:{
        x:{grid:{color:gridColor()}, title:{display:true, text:"Distance from Country Dairy (mi)"}},
        y:{type:"logarithmic", grid:{color:gridColor()}, title:{display:true, text:"Annual Customer Cases (log scale)"}, ticks:{callback:v=>{
          const l = Math.log10(v);
          return Number.isInteger(l) ? fmt(v) : "";
        }}}
      }
    }
  });

  // Cedar Crest Weekly Sales Database - April2025-March2026.xlsx, 'Summary - All Weeks' tab,
  // customers with Weeks Ordered >= 3 (37,496 order-rows across 1,523 customers). % of Orders =
  // each category's share of total order-rows (one row = one customer's order in one week).
  // Same name-based categories as 'Customer Cases by Distance' / 'Case Volume by Channel'.
  const marketData = [
    ["Convenience Store / Gas",  "High",     48.6, "Route density -- largest customer count (557) and highest order frequency (~33 orders/yr avg)", "Maintain"],
    ["Other",                    "Moderate", 15.5, "Farms, churches, campgrounds, and 3 large wholesale/distributor accounts",                       "Defend"],
    ["Supermarket / Grocery",    "Moderate", 9.7,  "Large-format accounts -- fewest locations (110) but highest cases per account",                  "Expand"],
    ["Ice Cream / Dessert Shop", "Moderate", 9.7,  "Seasonal scoop-shop demand, longest average haul (105 mi)",                                       "Expand"],
    ["School / Institutional",   "Moderate", 7.6,  "Academic-calendar driven, K-12 milk program contracts",                                           "Invest"],
    ["Coffee Shop",              "Moderate", 6.8,  "High-frequency, small-batch reorders (Biggby, Scooters, independents)",                           "Maintain"],
    ["Restaurant / Food Service","Low",      2.1,  "Smallest, most dispersed segment (avg 112 mi) -- lowest order share",                             "Monitor"],
  ];
  document.getElementById("marketTable").innerHTML =
    `<thead><tr><th>Segment</th><th>Demand Level</th><th class="n">% of Orders</th>
    <th>Primary Driver</th><th>Recommended Posture</th></tr></thead>
    <tbody>${marketData.map(([seg,lvl,pct,drv,pos]) =>
      `<tr><td>${seg}</td><td>${lvl}</td>
      <td class="n">${pct.toFixed(1)}%</td>
      <td>${drv}</td><td>${pos}</td></tr>`
    ).join("")}
    </tbody>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  GROWTH OPPORTUNITIES
// ═══════════════════════════════════════════════════════════════════════════════
function initGrowth() {
  const GROWTH_IDEAS = [
    "Expand Ice Cream",
    "Expand Half Pints/Schools",
    "Competitive Product Line in High End Grocers",
    "Expand Raw Milk Production & Sell to Co-Ops/Large Contracts",
    "A2/Grocery Expansion",
    "Expand Animal Breeding/Calves",
    "Expand Other Products (Class 2 & 3 -- Butter, Yogurt, Frozen Yogurt, etc.)",
    "TBD",
    "TBD",
  ];
  // Ideas 8 and 9 are blank placeholders (see the panels below) -- default them out
  // of the matrix until they're filled in and switched on.
  const DEFAULT_EXCLUDED = new Set([8, 9]);
  const LEVEL = {Low:0.5, Medium:1.5, High:2.5};
  const STORAGE_KEY = "cd_growth_ratings";

  // Difficulty/Expected Return/Show-in-matrix are set per idea via the controls on
  // each idea panel below (id="growth-idea-N" data-idea="N"), persisted to
  // localStorage so they survive a reload.
  let ratings;
  try { ratings = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch(e) { ratings = {}; }
  GROWTH_IDEAS.forEach((_, i) => {
    const idx = i + 1;
    if (!ratings[idx]) ratings[idx] = {difficulty:null, expectedReturn:null, included: !DEFAULT_EXCLUDED.has(idx)};
    if (ratings[idx].included === undefined) ratings[idx].included = !DEFAULT_EXCLUDED.has(idx);
  });
  const saveRatings = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));

  // Unrated ideas are plotted as a small placeholder cluster at the center so they
  // stay visible (and distinguishable by number) until both axes are rated. Ideas
  // switched off via "Show in matrix" are excluded from the chart entirely (but
  // still listed, greyed out, in the key).
  let allPoints = computeAllPoints();
  let points = allPoints.filter(p => p.included);
  function computeAllPoints() {
    // Ideas rated into the same cell would otherwise land exactly on top of each
    // other, so group by cell first (only counting ideas currently shown) and
    // spread same-cell ideas in a small ring around that cell's center (radius
    // stays well inside the cell's own half-width so the ring never bleeds into a
    // neighboring cell).
    const cellGroups = {};
    GROWTH_IDEAS.forEach((_, i) => {
      const idx = i + 1;
      const r = ratings[idx];
      if (r.difficulty && r.expectedReturn && r.included) {
        const key = r.difficulty + "-" + r.expectedReturn;
        (cellGroups[key] = cellGroups[key] || []).push(i);
      }
    });

    return GROWTH_IDEAS.map((label, i) => {
      const idx = i + 1;
      const r = ratings[idx];
      const rated = !!(r.difficulty && r.expectedReturn);
      let x, y;
      if (rated) {
        const cx = LEVEL[r.difficulty], cy = LEVEL[r.expectedReturn];
        const group = cellGroups[r.difficulty + "-" + r.expectedReturn];
        if (group && group.length > 1) {
          const angle = group.indexOf(i) * (2 * Math.PI / group.length);
          x = cx + 0.28 * Math.cos(angle);
          y = cy + 0.28 * Math.sin(angle);
        } else {
          x = cx; y = cy;
        }
      } else {
        const angle = i * (2 * Math.PI / GROWTH_IDEAS.length);
        x = 1.5 + 0.35 * Math.cos(angle);
        y = 1.5 + 0.35 * Math.sin(angle);
      }
      return {x, y, n:idx, label, rated, included: r.included};
    });
  }

  // Draws the 3x3 Low/Medium/High grid (with a green→red diagonal tint from
  // best-case to worst-case cell) behind the points, and the idea number inside
  // each point, the same way avgDistanceLinePlugin etc. draw over the market charts.
  const growthMatrixGridPlugin = {
    id: "growthMatrixGrid",
    beforeDatasetsDraw(chart) {
      const {ctx, chartArea:{left, right, top, bottom}} = chart;
      const cellW = (right - left) / 3, cellH = (bottom - top) / 3;
      ctx.save();
      for (let dIdx = 0; dIdx < 3; dIdx++) {
        for (let rIdx = 0; rIdx < 3; rIdx++) {
          const score = rIdx - dIdx;
          ctx.fillStyle = score > 0 ? `rgba(61,174,43,${0.05 * score})`
                         : score < 0 ? `rgba(220,38,38,${0.05 * -score})`
                         : "rgba(0,0,0,0)";
          ctx.fillRect(left + dIdx * cellW, top + (2 - rIdx) * cellH, cellW, cellH);
        }
      }
      ctx.strokeStyle = gridColor();
      ctx.lineWidth = 1;
      [1, 2].forEach(v => {
        const xPix = left + (v / 3) * (right - left);
        ctx.beginPath(); ctx.moveTo(xPix, top); ctx.lineTo(xPix, bottom); ctx.stroke();
        const yPix = top + (v / 3) * (bottom - top);
        ctx.beginPath(); ctx.moveTo(left, yPix); ctx.lineTo(right, yPix); ctx.stroke();
      });
      ctx.strokeRect(left, top, right - left, bottom - top);
      ctx.restore();
    },
    afterDatasetsDraw(chart) {
      const {ctx} = chart;
      const meta = chart.getDatasetMeta(0);
      ctx.save();
      ctx.font = "700 10px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      meta.data.forEach((el, i) => ctx.fillText(String(points[i].n), el.x, el.y));
      ctx.restore();
    }
  };

  const levelLabel = v => ({0.5:"Low", 1.5:"Medium", 2.5:"High"}[v] || "");

  const growthChart = new Chart(document.getElementById("growthMatrixChart"), {
    type: "scatter",
    data: { datasets: [{
      label: "Growth Ideas",
      data: points,
      backgroundColor: C.green,
      borderColor: C.green,
      pointRadius: 11,
      pointHoverRadius: 13,
    }]},
    plugins: [growthMatrixGridPlugin],
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display:false },
        tooltip: { callbacks: {
          title: items => `Idea ${points[items[0].dataIndex].n}`,
          label: item => points[item.dataIndex].label + (points[item.dataIndex].rated ? "" : "  (not yet rated)"),
        }}
      },
      scales: {
        x: {
          min:0, max:3,
          grid: { display:false },
          afterBuildTicks: s => s.ticks = [{value:0.5},{value:1.5},{value:2.5}],
          ticks: { callback:levelLabel, font:{weight:600} },
          title: { display:true, text:"Difficulty" }
        },
        y: {
          min:0, max:3,
          grid: { display:false },
          afterBuildTicks: s => s.ticks = [{value:0.5},{value:1.5},{value:2.5}],
          ticks: { callback:levelLabel, font:{weight:600} },
          title: { display:true, text:"Expected Return" }
        }
      }
    }
  });

  function renderKey() {
    document.getElementById("growthMatrixKey").innerHTML = GROWTH_IDEAS.map((label, i) => {
      const r = ratings[i + 1];
      const ratingText = (r.difficulty && r.expectedReturn) ? `${r.difficulty} difficulty / ${r.expectedReturn} return`
                        : "not yet rated";
      const hiddenNote = r.included ? "" : " &mdash; hidden from matrix";
      return `<li class="${r.included ? "" : "excluded"}"><b>${i + 1}.</b>${label}<span class="rating">${ratingText}${hiddenNote}</span></li>`;
    }).join("");
  }

  function refreshGrowthChart() {
    allPoints = computeAllPoints();
    points = allPoints.filter(p => p.included);
    growthChart.data.datasets[0].data = points;
    growthChart.update();
    renderKey();
  }

  renderKey();

  document.querySelectorAll(".js-growth-toggle").forEach(group => {
    const idea = group.dataset.idea, axis = group.dataset.axis;
    const buttons = group.querySelectorAll("button");
    buttons.forEach(b => b.classList.toggle("active", b.dataset.level === ratings[idea][axis]));
    buttons.forEach(b => b.addEventListener("click", () => {
      ratings[idea][axis] = b.dataset.level;
      buttons.forEach(x => x.classList.toggle("active", x === b));
      saveRatings();
      refreshGrowthChart();
    }));
  });

  document.querySelectorAll(".js-growth-include").forEach(checkbox => {
    const idea = checkbox.dataset.idea;
    checkbox.checked = ratings[idea].included;
    checkbox.addEventListener("change", () => {
      ratings[idea].included = checkbox.checked;
      saveRatings();
      refreshGrowthChart();
    });
  });
}

// ─── Access gate ─────────────────────────────────────────────────────────────
// SHA-256 hash of the dashboard password (same gate as CD_Dashboard).
// To change the password: compute sha256hex(newPassword) and replace this value.
const ACCESS_HASH = "7bd3c5b1fad59c02399d94f39c9651d7c72be3dc608a161a0e6157641921bbf2";

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,"0")).join("");
}
function unlock() {
  document.getElementById("gate")?.remove();
  document.body.style.overflow = "";
  setupChartDefaults();
  showSection("home");
}
(function initAuth() {
  if (sessionStorage.getItem("cd_strategic") === "1") { unlock(); return; }
  document.body.style.overflow = "hidden";
  const form = document.getElementById("gateForm");
  const pw   = document.getElementById("gatePw");
  const err  = document.getElementById("gateErr");
  pw.focus();
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (await sha256Hex(pw.value) === ACCESS_HASH) {
      sessionStorage.setItem("cd_strategic", "1");
      unlock();
    } else {
      err.hidden = false; pw.value = ""; pw.focus();
    }
  });
})();
