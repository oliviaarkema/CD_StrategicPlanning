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
  document.getElementById("h-rev").textContent   = "###";
  document.getElementById("h-rev-d").textContent = "▲ ###% vs TTM Jul 2025";
  document.getElementById("h-cwt").textContent   = "###";
  document.getElementById("h-cwt-d").textContent = "▲ ###% vs TTM Jul 2025";
  document.getElementById("h-cows").textContent  = "###";
  document.getElementById("h-cows-d").textContent= "–### head vs TTM Jul 2025";
  document.getElementById("h-acres").textContent = "###";
  document.getElementById("h-acres-d").textContent = "Unchanged";

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const rev  = [170, 163, 172, 171, 167, 151, 145, 144, 153, 169, 171, 181];
  const cost = [156, 149, 160, 158, 162, 150, 147, 146, 150, 157, 156, 159];

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
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins: { legend:{position:"top"},
        tooltip:{callbacks:{label: c => "$" + c.parsed.y + "K"}} },
      scales: {
        x: { grid:{color:gridColor()} },
        y: { grid:{color:gridColor()}, ticks:{callback: v => "$"+v+"K"} }
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
      ["Crops","Corn Silage (t/a)"],
      ["Crops","Alfalfa (t/a)"],
      ["Financials","Total Revenue"],
      ["Financials","Total Costs"],
      ["Financials","Operating Margin"],
    ].map(([a,m]) =>
      `<tr><td style="color:var(--muted);font-size:.78rem;text-transform:uppercase;letter-spacing:.4px">${a}</td>
       <td>${m}</td><td class="n">###</td><td class="n" style="color:var(--muted)">###</td>
       <td class="n" style="color:var(--muted)">###</td></tr>`
    ).join("")}
    </tbody>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MILK PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════
const MILK_PRODS = [
  { name:"CD Whole Gallons",      cases:28400, rev_per:24.20 },
  { name:"CD Half Pints",         cases:18600, rev_per:14.80 },
  { name:"WF Gallons",            cases:12800, rev_per:27.40 },
  { name:"CD Half-Gallons",       cases: 9200, rev_per:21.60 },
  { name:"Cedar Cr Gallons",      cases: 6700, rev_per:24.00 },
  { name:"WF Half-Gallons",       cases: 4100, rev_per:24.80 },
  { name:"CD Quarts",             cases: 3800, rev_per:19.20 },
  { name:"CD Pints",              cases: 2900, rev_per:16.40 },
  { name:"5-Gal Foodservice",     cases: 1200, rev_per:48.60 },
  { name:"Country Dairy Mix",     cases:  890, rev_per:38.20 },
];
const MILK_MONTHS = [6620,7280,7910,8440,9020,8190,6940,6610,7180,7840,7950,8610];

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

  document.getElementById("milkTable").innerHTML =
    `<thead><tr><th>#</th><th>Product</th><th class="n">Cases</th>
    <th class="n">% Mix</th><th class="n">Est. Revenue</th><th class="n">Rev/Case</th></tr></thead>
    <tbody>${MILK_PRODS.map((p,i)=>{
      return `<tr><td class="rk">${i+1}</td><td>${p.name}</td>
        <td class="n">###</td>
        <td class="n">###</td>
        <td class="n">###</td>
        <td class="n">###</td></tr>`;
    }).join("")}
    <tr style="font-weight:700;border-top:2px solid var(--border)">
      <td colspan="2" style="font-weight:700">Total</td>
      <td class="n">###</td>
      <td class="n">###</td>
      <td class="n">###</td>
      <td class="n">###</td>
    </tr></tbody>`;
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
    {type:"Calves",    head:180, avgP:340, total:61200},
    {type:"Cull Cows", head: 42, avgP:890, total:37380},
    {type:"Steers",    head: 24, avgP:1850,total:44400},
  ];
  const totalRev = anData.reduce((s,r)=>s+r.total,0);
  const totalHead= anData.reduce((s,r)=>s+r.head, 0);
  document.getElementById("animalTable").innerHTML =
    `<thead><tr><th>Category</th><th class="n">Head Sold</th>
    <th class="n">Avg $/Head</th><th class="n">Total Revenue</th><th class="n">% of Animal Rev</th></tr></thead>
    <tbody>${anData.map(r =>
      `<tr><td>${r.type}</td><td class="n">###</td>
      <td class="n">###</td><td class="n">###</td>
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
const PROD_2025 = [7820,7380,8050,8210,8540,7990,7860,7740,7950,8280,8090,8280];
const PROD_2024 = [7620,7100,7840,7980,8290,7750,7640,7510,7730,8060,7880,8020];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CWT_TO_GAL = 11.63; // 1 cwt of milk ≈ 11.63 gallons (100 lb / ~8.6 lb per gallon)

let rawMilkLineChart = null, rawMilkBarChart = null;

function renderRawMilkCharts(unit) {
  const factor = unit === "gal" ? CWT_TO_GAL : 1;
  const label  = unit === "gal" ? "gal" : "cwt";
  const data2025 = PROD_2025.map(v => Math.round(v * factor));
  const data2024 = PROD_2024.map(v => Math.round(v * factor));

  if (rawMilkLineChart) rawMilkLineChart.destroy();
  if (rawMilkBarChart)  rawMilkBarChart.destroy();

  rawMilkLineChart = new Chart(document.getElementById("milkProdLineChart"), {
    type:"line",
    data:{
      labels: MONTHS_SHORT,
      datasets:[
        {label:"TTM Jul 2026", data:data2025, borderColor:C.kelly,
          backgroundColor:"rgba(61,174,43,.1)", fill:true, tension:.35, pointRadius:3},
        {label:"TTM Jul 2025", data:data2024, borderColor:C.muted,
          backgroundColor:"transparent", borderDash:[5,4], tension:.35, pointRadius:3},
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{position:"top"},
        tooltip:{callbacks:{label: c => c.dataset.label + ": " + fmt(c.parsed.y) + " " + label}} },
      scales:{
        x:{grid:{color:gridColor()}},
        y:{grid:{color:gridColor()}, ticks:{callback:v=>fmt(v)}, min:Math.round(6500*factor)}
      }
    }
  });

  rawMilkBarChart = new Chart(document.getElementById("milkProdBarChart"), {
    type:"bar",
    data:{
      labels: MONTHS_SHORT,
      datasets:[{
        data: data2025, backgroundColor: data2025.map(v=>v===Math.max(...data2025)?C.kelly:C.green),
        borderRadius:4, label:label
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false},
        tooltip:{callbacks:{label: c => fmt(c.parsed.y) + " " + label}} },
      scales:{
        x:{grid:{display:false}},
        y:{grid:{color:gridColor()}, ticks:{callback:v=>fmt(v)}, min:Math.round(6500*factor)}
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

function renderPlantMetricTable(unit) {
  const volLabel    = unit === "gal" ? "Gallons Processed" : "cwt Processed";
  const laborLabel  = unit === "gal" ? "Labor Hrs/gal" : "Labor Hrs/cwt";
  const energyLabel = unit === "gal" ? "Energy $/gal" : "Energy $/cwt";
  document.getElementById("plantMetricTable").innerHTML =
    `<thead><tr><th>Month</th><th class="n">${volLabel}</th><th class="n">Utilization</th>
    <th class="n">${laborLabel}</th><th class="n">${energyLabel}</th><th class="n">Loss %</th></tr></thead>
    <tbody>${[
      ["Jul","###","###","###","###","###"],
      ["Aug","###","###","###","###","###"],
      ["Sep","###","###","###","###","###"],
      ["Oct","###","###","###","###","###"],
      ["Nov","###","###","###","###","###"],
      ["Dec","###","###","###","###","###"],
    ].map(([m,...v])=>`<tr><td>${m}</td>${v.map(x=>`<td class="n">${x}</td>`).join("")}</tr>`).join("")}
    </tbody>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CROP EFFICIENCY
// ═══════════════════════════════════════════════════════════════════════════════
function initCrops() {
  new Chart(document.getElementById("cropYieldChart"), {
    type:"bar",
    data:{
      labels:["Corn Silage","Alfalfa Hay","Soybeans"],
      datasets:[
        {label:"Country Dairy Actual", data:[22.4,4.9,52], backgroundColor:C.kelly, borderRadius:4},
        {label:"MI State Average",     data:[19.8,4.2,45], backgroundColor:C.muted, borderRadius:4},
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

  new Chart(document.getElementById("cropCostChart"), {
    type:"bar",
    data:{
      labels:["Corn Silage","Alfalfa Hay","Soybeans"],
      datasets:[
        {label:"Homegrown Cost",  data:[41,178,9.20], backgroundColor:C.green,  borderRadius:4},
        {label:"Market Price",    data:[55,225,11.80], backgroundColor:C.muted, borderRadius:4},
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{position:"top"},
        tooltip:{callbacks:{label: c => c.dataset.label + ": $" + c.parsed.y +
          (c.dataIndex===2 ? "/bu" : "/ton")}}
      },
      scales:{
        x:{grid:{display:false}},
        y:{grid:{color:gridColor()}, ticks:{callback:v=>"$"+v}}
      }
    }
  });

  document.getElementById("cropTable").innerHTML =
    `<thead><tr><th>Crop</th><th class="n">Acres</th><th class="n">Yield</th>
    <th class="n">MI Avg</th><th class="n">Cost/Unit</th><th class="n">Total Tons/Bu</th>
    <th class="n">Homegrown Value</th></tr></thead>
    <tbody>${[
      ["Corn Silage","###","###","###","###","###","###"],
      ["Alfalfa Hay","###","###","###","###","###","###"],
      ["Soybeans","###","###","###","###","###","###"],
      ["Other/Cover","—","—","—","—","—","—"],
    ].map(r=>`<tr>${r.map((c,i)=>i>0?`<td class="n">${c}</td>`:`<td>${c}</td>`).join("")}</tr>`).join("")}
    <tr style="font-weight:700;border-top:2px solid var(--border)">
      <td>Total / Avg</td><td class="n">###</td><td class="n">—</td>
      <td class="n">—</td><td class="n">—</td><td class="n">—</td>
      <td class="n">###</td>
    </tr></tbody>`;
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

  new Chart(document.getElementById("marketDriverChart"), {
    type:"doughnut",
    data:{
      labels:["Local/Regional Identity","Health & Wellness","Price","Convenience","Sustainability"],
      datasets:[{
        data:[32,26,20,14,8],
        backgroundColor:[C.green, C.kelly, C.mid, C.muted, C.amber],
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
