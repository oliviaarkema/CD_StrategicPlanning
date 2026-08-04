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
  b.addEventListener("click", () => showSection(b.dataset.section)));

// ─── Init dispatcher ─────────────────────────────────────────────────────────
function initSection(name) {
  ({home:initHome, milk:initMilk, animals:initAnimals,
    rawmilk:initRawMilk, plant:initPlant, crops:initCrops, costs:initCosts,
    market:initMarket}[name] || (()=>{}))();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HOME
// ═══════════════════════════════════════════════════════════════════════════════
function initHome() {
  document.getElementById("h-rev").textContent   = "$610,096";
  document.getElementById("h-rev-d").textContent = "▲ 88.2% vs TTM Jul 2025";
  document.getElementById("h-cwt").textContent   = "###";
  document.getElementById("h-cwt-d").textContent = "▲ ###% vs TTM Jul 2025";
  document.getElementById("h-cows").textContent  = "1,085";
  document.getElementById("h-cows-d").textContent= "▲ 7.5% vs year ago (1,009)";
  document.getElementById("h-acres").textContent = "2,500";

  const months = [
    "Jul '24","Aug '24","Sep '24","Oct '24","Nov '24","Dec '24",
    "Jan '25","Feb '25","Mar '25","Apr '25","May '25","Jun '25",
    "Jul '25","Aug '25","Sep '25","Oct '25","Nov '25","Dec '25",
    "Jan '26","Feb '26","Mar '26","Apr '26","May '26","Jun '26",
  ];
  const rev  = [
    1645545, 2299610, 2055377, 2225430, 2138141, 2086631,
    2079507, 1772753, 2087068, 2184308, 2277922, 2523351,
    2585013, 2446680, 2244856, 2418070, 1972220, 2411809,
    1686045, 1646609, 1861769, 2062624, 2028185, 2099555,
  ];
  const cost = [
    1087512, 2341380, 2149066, 2077783, 2130164, 2175007,
    2150906, 1836586, 1942402, 2111801, 2241576, 2455781,
    2572680, 2319274, 2320298, 2643262, 2138672, 2235684,
    1557016, 1614992, 1674430, 1997175, 1861458, 1918430,
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

  new Chart(document.getElementById("homeRevMixChart"), {
    type:"doughnut",
    data:{
      labels:["Milk Products","Animal Sales","Custom Work & Other"],
      datasets:[{
        data:[89,5,6],
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
        tooltip:{callbacks:{label: c => c.label + ": " + c.parsed + "%"}}
      }
    }
  });

  document.getElementById("homeMetricTable").innerHTML =
    `<thead><tr><th>Area</th><th>Metric</th><th class="n">TTM Jul 2026</th><th class="n">TTM Jul 2025</th><th class="n">Change</th></tr></thead>
    <tbody>
    ${[
      ["Milk Production","Annual cwt"],
      ["Milk Production","Lbs/Cow/Day"],
      ["Milk Quality","Butterfat %"],
      ["Milk Quality","SCC (cells/mL)"],
      ["Plant","Utilization Rate"],
      ["Plant","Labor Hrs/cwt"],
      ["Financials","Total Revenue", fmtM(rev.slice(-12).reduce((s,v)=>s+v,0)), fmtM(25375643), "+0.3%"],
      // Total Costs and Operating Margin: figures withheld — the cost data we have
      // includes non-operating items (e.g. bank note interest), so these would be
      // misleading until we get a cost breakdown that separates those out.
      ["Financials","Total Costs"],
      ["Financials","Operating Margin"],
    ].map(([a,m,cur,prior,chg]) =>
      `<tr><td style="color:var(--muted);font-size:.78rem;text-transform:uppercase;letter-spacing:.4px">${a}</td>
       <td>${m}</td><td class="n">${cur ?? "###"}</td><td class="n" style="color:var(--muted)">${prior ?? "###"}</td>
       <td class="n" style="color:var(--muted)">${chg ?? "###"}</td></tr>`
    ).join("")}
    </tbody>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MILK PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════
// Product axis per Products Matrix, 2026.06.24.xlsx. Cases pending real per-product
// sales data — left at 0, not modeled from the old brand/package SKU placeholders.
const MILK_PRODS = [
  { name:"Vitamin D",           cases:0 },
  { name:"2% Red Fat",          cases:0 },
  { name:"1% Lowfat",           cases:0 },
  { name:"Fat Free",            cases:0 },
  { name:"Chocolate",           cases:0 },
  { name:"Strawberry",          cases:0 },
  { name:"Fat Free Chocolate",  cases:0 },
  { name:"Whipping Cream",      cases:0 },
  { name:"Ice Cream",           cases:0 },
  { name:"Soft Serve Mix",      cases:0 },
  { name:"Butter-Salted",       cases:0 },
  { name:"Butter-Unsalted",     cases:0 },
  { name:"Sour Cream & Chip Dip", cases:0 },
  { name:"Other (eggnog, co-packed)", cases:0 },
];
const MILK_MONTHS = [6620,7280,7910,8440,9020,8190,6940,6610,7180,7840,7950,8610];

function weightedAvg(weights, values) {
  const sumW = weights.reduce((s,w) => s+w, 0);
  if (sumW === 0) return 0;
  const sumWV = weights.reduce((s,w,i) => s + w*values[i], 0);
  return sumWV / sumW;
}

function renderMarginChart(canvasId, labels, revData, pctData, revMax) {
  const overallMargin = weightedAvg(revData, pctData);
  new Chart(document.getElementById(canvasId), {
    type:"bar",
    data:{
      labels,
      datasets:[
        {label:"Revenue ($M)", data:revData, backgroundColor:C.green, borderRadius:4, yAxisID:"y"},
        {label:"Profit Margin (%)", data:pctData, backgroundColor:C.kelly, borderRadius:4, yAxisID:"y1"},
        {label:"Overall Margin (wtd avg)", type:"line", data:labels.map(()=>overallMargin),
          yAxisID:"y1", borderColor:C.red, borderDash:[6,4], borderWidth:2,
          pointRadius:0, tension:0, fill:false},
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{position:"top"},
        tooltip:{callbacks:{label: c => c.dataset.label + ": " +
          (c.dataset.yAxisID==="y1" ? c.parsed.y.toFixed(1)+"%" : "$"+c.parsed.y+"M")}} },
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

function initMilk() {
  const totalCases = MILK_PRODS.reduce((s,p) => s+p.cases, 0);
  const labels = MILK_PRODS.map(p => p.name);
  const cases  = MILK_PRODS.map(p => p.cases);

  new Chart(document.getElementById("milkProdChart"), {
    type:"bar",
    data:{
      labels, datasets:[{
        data: cases, backgroundColor: C.green, borderRadius:5,
        label:"Cases"
      }]
    },
    options:{
      indexAxis:"y", responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false},
        tooltip:{callbacks:{label: c => fmt(c.parsed.x) + " cases"}} },
      scales:{
        x:{grid:{color:gridColor()}, ticks:{callback:v=>fmt(v)}},
        y:{grid:{display:false}, ticks:{font:{size:11}}}
      }
    }
  });

  const mLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  new Chart(document.getElementById("milkTrendChart"), {
    type:"bar",
    data:{
      labels:mLabels,
      datasets:[{
        data: MILK_MONTHS, backgroundColor: C.kelly, borderRadius:4,
        label:"Cases"
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false},
        tooltip:{callbacks:{label: c => fmt(c.parsed.y) + " cases"}} },
      scales:{
        x:{grid:{display:false}},
        y:{grid:{color:gridColor()}, ticks:{callback:v=>fmt(v)}}
      }
    }
  });

  // Product axis per Products Matrix, 2026.06.24.xlsx: all milk flavors (and Whipping
  // Cream) rolled into "Class 1 milk"; Sour Cream + Chip Dip combined; Other = eggnog
  // & co-packed. Revenue/margin pending real per-product data — left at 0.
  const MARGIN_PRODS = ["Class 1 milk","Ice Cream","Soft Serve Mix","Butter","Sour Cream & Chip Dip","Other (eggnog, co-packed)"];
  const MARGIN_REV    = [0, 0, 0, 0, 0, 0];
  const MARGIN_PCT    = [0, 0, 0, 0, 0, 0];
  renderMarginChart("milkMarginChart", MARGIN_PRODS, MARGIN_REV, MARGIN_PCT, 25);

  const CUSTOMER_NAMES = ["Cedar Crest","Quality Dairy","Kuster's","Farm Store","Other"];
  const CUSTOMER_REV   = [14.5, 11.2, 8.6, 4.1, 2.9];
  const CUSTOMER_PCT   = [24, 31, 27, 38, 19];
  renderMarginChart("customerMarginChart", CUSTOMER_NAMES, CUSTOMER_REV, CUSTOMER_PCT, 20);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ANIMALS
// ═══════════════════════════════════════════════════════════════════════════════
function initAnimals() {
  const quarters = ["Q1","Q2","Q3","Q4"];
  const calves   = [38, 52, 44, 46];
  const culls    = [ 8, 12,  9, 13];
  const steers   = [ 4,  6,  8,  6];

  new Chart(document.getElementById("animalBarChart"), {
    type:"bar",
    data:{
      labels: quarters,
      datasets:[
        {label:"Calves",    data:calves, backgroundColor:C.kelly,  borderRadius:4},
        {label:"Cull Cows", data:culls,  backgroundColor:C.green,  borderRadius:4},
        {label:"Steers",    data:steers, backgroundColor:C.muted,  borderRadius:4},
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

  const calfPrice  = [315, 358, 342, 344];
  const cullPrice  = [820, 880, 940, 920];
  const steerPrice = [1740,1940,1820,1800];

  new Chart(document.getElementById("animalPriceChart"), {
    type:"line",
    data:{
      labels: quarters,
      datasets:[
        {label:"Calves",    data:calfPrice,  borderColor:C.kelly, backgroundColor:"transparent", tension:.3, pointRadius:5},
        {label:"Cull Cows", data:cullPrice,  borderColor:C.green, backgroundColor:"transparent", tension:.3, pointRadius:5},
        {label:"Steers",    data:steerPrice, borderColor:C.muted, backgroundColor:"transparent", tension:.3, pointRadius:5},
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
    {type:"Calves",    head:null, avgP:1500, total:null},
    {type:"Cull Cows", head:null, avgP:null, total:null},
    {type:"Steers",    head:null, avgP:3500, total:null},
  ];
  document.getElementById("animalTable").innerHTML =
    `<thead><tr><th>Category</th><th class="n">Head Sold</th>
    <th class="n">Avg $/Head</th><th class="n">Total Revenue</th><th class="n">% of Animal Rev</th></tr></thead>
    <tbody>${anData.map(r =>
      `<tr><td>${r.type}</td><td class="n">${r.head ?? "###"}</td>
      <td class="n">${r.avgP!=null ? fmtD(r.avgP) : "###"}</td><td class="n">${r.total ?? "###"}</td>
      <td class="n">###</td></tr>`
    ).join("")}
    <tr style="font-weight:700;border-top:2px solid var(--border)">
      <td>Total</td><td class="n">###</td><td class="n">###</td>
      <td class="n">###</td><td class="n">###</td>
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
const WEEK_LABELS = ["6/30/25","7/7/25","7/14/25","7/21/25","7/28/25","8/4/25","8/11/25","8/18/25","8/25/25","9/1/25","9/8/25","9/15/25","9/22/25","9/29/25","10/6/25","10/13/25","10/20/25","10/27/25","11/3/25","11/10/25","11/17/25","11/24/25","12/1/25","12/8/25","12/15/25","12/22/25","12/29/25","1/5/26","1/12/26","1/19/26","1/26/26","2/2/26","2/9/26","2/16/26","2/23/26","3/2/26","3/9/26","3/16/26","3/23/26","3/30/26","4/6/26","4/13/26","4/20/26","4/27/26","5/8/26","5/15/26","5/22/26","5/29/26","6/5/26","6/12/26","6/19/26","6/26/26","7/3/26","7/10/26","7/17/26","7/24/26","7/31/26"];
const GAL_2026 = [78478,79533,78635,79230,77293,79752,77685,79308,80105,80542,81391,80592,80074,80264,79510,79473,79212,79528,79214,79430,78508,78203,78365,78879,79533,80739,80369,81004,80543,78209,79449,79631,78861,79150,80218,80207,79524,80383,81248,82448,81799,82151,81711,83137,82521,81468,82637,83085,84267,83787,83536,82809,82331,81701,83563,83192,85302];
const GAL_2025 = [75861,76596,75375,75896,74778,75992,76705,75826,73311,75518,75782,75893,76340,75893,75901,76189,76362,77065,76850,77394,75889,74328,75397,74788,75416,75938,77607,77759,77899,76376,77449,78479,79013,79270,79739,79884,80463,79691,78982,77188,76802,76558,77215,77415,77189,78042,78082,79251,77944,80183,79711,76535,78478,79533,78635,79230,77293];
const GAL_TO_CWT = 8.6 / 100; // 8.6 lbs/gal, 100 lbs/cwt — matches the weekly KPI log's own cwt column exactly

let rawMilkLineChart = null;

function renderRawMilkCharts(unit) {
  const toUnit = v => unit === "cwt" ? +(v * GAL_TO_CWT).toFixed(1) : v;
  const label  = unit === "gal" ? "gal" : "cwt";
  const data2026 = GAL_2026.map(toUnit);
  const data2025 = GAL_2025.map(toUnit);

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
        tooltip:{callbacks:{label: c => c.dataset.label + " (" + c.label + "): " + fmt(c.parsed.y) + " " + label}} },
      scales:{
        x:{grid:{color:gridColor()}, ticks:{maxTicksLimit:12, autoSkip:true}},
        y:{grid:{color:gridColor()}, ticks:{callback:v=>fmt(v)}, min:0}
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

  document.getElementById("milkQualBars").innerHTML = [
    {lbl:"Lbs/Cow/Day",    sub:"MI top quartile: 78",     val:75.2, bench:78,   max:85,  fmt:v=>v.toFixed(1)},
    {lbl:"Butterfat %",    sub:"Component base: 3.50%",   val:3.86, bench:3.50, max:4.5, fmt:v=>v.toFixed(2)+"%"},
    {lbl:"SCC (K cells/mL)",sub:"Premium threshold: 200K",val:187,  bench:200,  max:400, fmt:v=>v+"K", invert:true},
    {lbl:"Herd Size",      sub:"Target: 320 cows",        val:312,  bench:320,  max:360, fmt:v=>v+" cows"},
  ].map(r=>{
    const pct = Math.min(100, r.val / r.max * 100).toFixed(1);
    const bpct= Math.min(100, r.bench / r.max * 100).toFixed(1);
    const cls = r.invert ? (r.val < r.bench ? "good" : "warn") : (r.val >= r.bench ? "good" : "warn");
    return `<div class="hbar-row">
      <div class="hbar-label">${r.lbl}<i>${r.sub}</i></div>
      <div class="hbar-track">
        <div class="hbar-fill ${cls}" style="width:${pct}%"></div>
      </div>
      <div class="hbar-val">${r.fmt(r.val)}</div>
    </div>`;
  }).join("");
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PLANT EFFICIENCY
// ═══════════════════════════════════════════════════════════════════════════════
function initPlant() {
  document.getElementById("plantKpiBars").innerHTML = [
    {lbl:"Utilization Rate",   sub:"Target: 85%",         val:78,   bench:85,   max:100, fmt:v=>v+"%",     cls:"warn"},
    {lbl:"Product Loss/Shrink",sub:"Industry avg: 2.1%",  val:1.8,  bench:2.1,  max:5,   fmt:v=>v+"%",     cls:"good", invert:true},
    {lbl:"Labor Hrs / cwt",    sub:"Industry avg: 0.48",  val:0.42, bench:0.48, max:0.8, fmt:v=>v+" hrs",  cls:"good", invert:true},
    {lbl:"Energy $ / cwt",     sub:"Industry avg: $1.38", val:1.24, bench:1.38, max:2.2, fmt:v=>"$"+v,     cls:"good", invert:true},
  ].map(r=>{
    const pct  = (r.val  / r.max * 100).toFixed(1);
    const bpct = (r.bench/ r.max * 100).toFixed(1);
    return `<div class="hbar-row">
      <div class="hbar-label">${r.lbl}<i>${r.sub}</i></div>
      <div class="hbar-track">
        <div class="hbar-fill ${r.cls}" style="width:${pct}%"></div>
      </div>
      <div class="hbar-val">${r.fmt(r.val)}</div>
    </div>`;
  }).join("");

  new Chart(document.getElementById("plantDowntimeChart"), {
    type:"bar",
    data:{
      labels:["CIP Cleaning","Preventive Maint.","Product Changeovers","Unplanned"],
      datasets:[{
        data:[48,32,24,19],
        backgroundColor:[C.green, C.kelly, C.mid, C.amber],
        borderRadius:5, label:"Hours"
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false},
        tooltip:{callbacks:{label: c => c.parsed.y + " hrs"}} },
      scales:{
        x:{grid:{display:false}},
        y:{grid:{color:gridColor()}, ticks:{callback:v=>v+" h"}}
      }
    }
  });

  renderPlantMetricTable("cwt");
  document.querySelectorAll(".js-plant-unit-toggle button").forEach(btn =>
    btn.addEventListener("click", () => {
      const unit = btn.dataset.unit;
      document.querySelectorAll(".js-plant-unit-toggle button").forEach(b =>
        b.classList.toggle("active", b.dataset.unit === unit));
      renderPlantMetricTable(unit);
    }));
}

// Jul '25-Jun '26 (dashboard fiscal year), from Plant_Production_Headcount_MonthlyGallons.xlsx.
// [month, gallons, cwt, laborHrsPerCwt, laborHrsPerGal]. Utilization/Energy/Loss aren't in
// that file, so those columns stay "###". The file's "Hourly Labor Cost - Plant" column is
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
  const energyLabel = unit === "gal" ? "Energy $/gal" : "Energy $/cwt";
  document.getElementById("plantMetricTable").innerHTML =
    `<thead><tr><th>Month</th><th class="n">${volLabel}</th><th class="n">Utilization</th>
    <th class="n">${laborLabel}</th><th class="n">${energyLabel}</th><th class="n">Loss %</th></tr></thead>
    <tbody>${PLANT_MONTHS.map(([m, gal, cwt, hrsPerCwt, hrsPerGal]) => {
      const vol   = unit === "gal" ? fmt(gal) : fmt(cwt);
      const labor = unit === "gal" ? hrsPerGal : hrsPerCwt;
      return `<tr><td>${m}</td><td class="n">${vol}</td><td class="n">###</td>
      <td class="n">${labor}</td><td class="n">###</td><td class="n">###</td></tr>`;
    }).join("")}
    </tbody>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CROP EFFICIENCY
// ═══════════════════════════════════════════════════════════════════════════════
function initCrops() {
  new Chart(document.getElementById("cropYieldChart"), {
    type:"bar",
    data:{
      labels:["Corn Silage","Alfalfa Hay","Wheat/Rye"],
      datasets:[
        {label:"Country Dairy Actual", data:[22.4,4.9,null], backgroundColor:C.kelly, borderRadius:4},
        {label:"MI State Average",     data:[19.8,4.2,null], backgroundColor:C.muted, borderRadius:4},
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{position:"top"},
        tooltip:{callbacks:{label: c => c.dataset.label + ": " +
          c.parsed.y + (c.dataIndex===2 ? " bu/a" : " t/a")}}
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
  new Chart(document.getElementById("marketDemandChart"), {
    type:"bar",
    data:{
      labels:["School / Institutional","Direct-to-Consumer","Local/Premium Retail","Category Average","Distributor / Wholesale"],
      datasets:[{
        data:[9.4, 14, 6.8, 2.1, -0.6],
        backgroundColor:[C.green, C.kelly, C.mid, C.muted, C.amber],
        borderRadius:5, label:"YoY %"
      }]
    },
    options:{
      indexAxis:"y", responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false},
        tooltip:{callbacks:{label: c => (c.parsed.x>=0?"+":"") + c.parsed.x + "% YoY"}} },
      scales:{
        x:{grid:{color:gridColor()}, ticks:{callback:v=>(v>0?"+":"")+v+"%"}},
        y:{grid:{display:false}, ticks:{font:{size:11}}}
      }
    }
  });

  const RADIUS_BANDS = [
    {label:"0–24 mi",    pen:82},
    {label:"25–49 mi",   pen:61},
    {label:"50–99 mi",   pen:43},
    {label:"100–199 mi", pen:24},
    {label:"200–499 mi", pen:9},
  ];
  const heatLow = [216,227,218], heatHigh = [7,77,26];
  const heatColor = pct => {
    const t = pct/100;
    return "rgb(" + heatLow.map((l,i) => Math.round(l + (heatHigh[i]-l)*t)).join(",") + ")";
  };
  const ringCx = 150, ringCy = 150, ringMaxR = 140, ringCount = RADIUS_BANDS.length;
  let ringsSvg = "";
  for (let i = ringCount - 1; i >= 0; i--) {
    const r = ringMaxR * (i+1) / ringCount;
    ringsSvg += `<circle cx="${ringCx}" cy="${ringCy}" r="${r}" fill="${heatColor(RADIUS_BANDS[i].pen)}"/>`;
  }
  ringsSvg += `<circle cx="${ringCx}" cy="${ringCy}" r="4" fill="#fff" stroke="${C.green}" stroke-width="2"/>`;

  document.getElementById("marketRadiusHeatmap").innerHTML = `
    <svg class="radius-heatmap-svg" viewBox="0 0 300 300" role="img" aria-label="Market penetration by radius from distribution center">${ringsSvg}</svg>
    <div class="radius-legend">
      ${RADIUS_BANDS.map(b => `
        <div class="radius-legend-row">
          <span class="radius-swatch" style="background:${heatColor(b.pen)}"></span>
          <span class="radius-legend-label">${b.label}</span>
          <span class="radius-legend-val">${b.pen}%</span>
        </div>`).join("")}
    </div>`;

  const PEN_RANGES = RADIUS_BANDS.map(b => b.label);
  const PEN_BY_TYPE = [
    {label:"Convenience Store", data:[88,74,55,31,12], color:C.green},
    {label:"School",            data:[76,68,52,29,14], color:C.kelly},
    {label:"Coffee Shop",       data:[64,49,33,17, 6], color:C.mid},
    {label:"Supermarket",       data:[92,81,63,38,19], color:C.blue},
    {label:"Restaurant",        data:[57,45,30,15, 5], color:C.amber},
  ];
  new Chart(document.getElementById("marketPenetrationChart"), {
    type:"bar",
    data:{
      labels: PEN_RANGES,
      datasets: PEN_BY_TYPE.map(t => ({
        label:t.label, data:t.data, backgroundColor:t.color, borderRadius:4
      }))
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{position:"top"},
        tooltip:{callbacks:{label: c => c.dataset.label + ": " + c.parsed.y + "%"}} },
      scales:{
        x:{grid:{display:false}},
        y:{grid:{color:gridColor()}, ticks:{callback:v=>v+"%"}, max:100}
      }
    }
  });

  const REV_BY_DISTANCE = [
    {label:"Supermarket",       color:C.blue,  data:[{x:5,y:118000},{x:15,y:105000},{x:30,y:96000},{x:45,y:88000},{x:70,y:74000},{x:95,y:61000},{x:130,y:52000},{x:180,y:38000},{x:250,y:29000},{x:340,y:19000},{x:420,y:12000}]},
    {label:"School",            color:C.kelly, data:[{x:8,y:82000},{x:20,y:75000},{x:35,y:68000},{x:55,y:59000},{x:80,y:49000},{x:110,y:41000},{x:150,y:33000},{x:210,y:24000},{x:290,y:16000},{x:380,y:9000}]},
    {label:"Convenience Store", color:C.green, data:[{x:3,y:54000},{x:12,y:49000},{x:25,y:44000},{x:40,y:38000},{x:60,y:31000},{x:85,y:25000},{x:120,y:19000},{x:170,y:13000},{x:230,y:8000},{x:310,y:5000}]},
    {label:"Coffee Shop",       color:C.mid,   data:[{x:6,y:37000},{x:18,y:33000},{x:33,y:28000},{x:50,y:23000},{x:75,y:18000},{x:105,y:14000},{x:145,y:10000},{x:200,y:6500},{x:270,y:4000}]},
    {label:"Restaurant",        color:C.amber, data:[{x:10,y:41000},{x:22,y:36000},{x:38,y:31000},{x:58,y:26000},{x:82,y:20000},{x:115,y:15000},{x:155,y:11000},{x:215,y:7000},{x:295,y:4500}]},
  ];
  const allRevPoints = REV_BY_DISTANCE.flatMap(t => t.data);
  const revN = allRevPoints.length;
  const revSumX = allRevPoints.reduce((s,p) => s+p.x, 0);
  const revSumY = allRevPoints.reduce((s,p) => s+p.y, 0);
  const revSumXY = allRevPoints.reduce((s,p) => s+p.x*p.y, 0);
  const revSumXX = allRevPoints.reduce((s,p) => s+p.x*p.x, 0);
  const revSlope = (revN*revSumXY - revSumX*revSumY) / (revN*revSumXX - revSumX*revSumX);
  const revIntercept = (revSumY - revSlope*revSumX) / revN;
  const revMinX = Math.min(...allRevPoints.map(p => p.x));
  const revMaxX = Math.max(...allRevPoints.map(p => p.x));
  const revTrendline = [
    {x:revMinX, y:revSlope*revMinX + revIntercept},
    {x:revMaxX, y:revSlope*revMaxX + revIntercept}
  ];

  new Chart(document.getElementById("marketRevenueByDistanceChart"), {
    type:"scatter",
    data:{
      datasets: [
        ...REV_BY_DISTANCE.map(t => ({
          label:t.label, data:t.data, backgroundColor:t.color, borderColor:t.color, pointRadius:5, pointHoverRadius:7
        })),
        {
          label:"Trendline", type:"line", data:revTrendline,
          borderColor:C.red, backgroundColor:"transparent", borderWidth:2, borderDash:[6,4],
          pointRadius:0, pointHoverRadius:0, hitRadius:0, tension:0, order:0
        }
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{position:"top"},
        tooltip:{callbacks:{label: c => c.dataset.label==="Trendline" ? "Trendline: "+fmtK(c.parsed.y) : c.dataset.label + ": " + fmtK(c.parsed.y) + " at " + c.parsed.x + " mi"}} },
      scales:{
        x:{grid:{color:gridColor()}, title:{display:true, text:"Distance from Country Dairy (mi)"}},
        y:{grid:{color:gridColor()}, title:{display:true, text:"Annual Customer Revenue"}, ticks:{callback:v=>fmtK(v)}}
      }
    }
  });

  const marketData = [
    ["School / Institutional",  "High",     "+9.4%", "Regional supplier preference, contract stability", "Expand"],
    ["Direct-to-Consumer",      "Moderate", "+14%",  "Local-buying preference, farm store visibility",    "Invest"],
    ["Local/Premium Retail",    "High",     "+6.8%", "Health & wellness, provenance",                     "Expand"],
    ["Category Average",        "Moderate", "+2.1%", "General household consumption",                     "Maintain"],
    ["Distributor / Wholesale", "Low",      "−0.6%", "Price competition from national brands",             "Defend"],
  ];
  document.getElementById("marketTable").innerHTML =
    `<thead><tr><th>Segment</th><th>Demand Level</th><th class="n">YoY Growth</th>
    <th>Primary Driver</th><th>Recommended Posture</th></tr></thead>
    <tbody>${marketData.map(([seg,lvl,gr,drv,pos]) =>
      `<tr><td>${seg}</td><td>${lvl}</td>
      <td class="n" style="color:var(--muted)">###</td>
      <td>${drv}</td><td>${pos}</td></tr>`
    ).join("")}
    </tbody>`;
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
