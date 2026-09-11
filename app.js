const fmt   = n => n.toLocaleString("en-US");
const fmtD  = n => "$" + n.toLocaleString("en-US");
const fmtK  = n => "$" + (n/1000).toFixed(0) + "K";
const fmtM  = n => "$" + (n/1e6).toFixed(2) + "M";

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

function setupChartDefaults() {
  Chart.defaults.font.family = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
  Chart.defaults.font.size = 12;
  Chart.defaults.color = textColor();
  Chart.defaults.borderColor = gridColor();
}

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

function initSection(name) {
  ({home:initHome, milk:initMilk, animals:initAnimals,
    rawmilk:initRawMilk, plant:initPlant, crops:initCrops, costs:initCosts,
    market:initMarket, competitive:initCompetitive, growth:initGrowth, swot:initSwot,
    trends:initTrends}[name] || (()=>{}))();
}

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

let resizeChartsTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeChartsTimer);
  resizeChartsTimer = setTimeout(() => {
    Object.values(Chart.instances || {}).forEach(c => { try { c.resize(); } catch(e) {} });
  }, 150);
});

function initHome() {
  const homeNetIncome = 675589, homeNetIncomePrior = 324110.99;
  const homeNetIncomeChg = (homeNetIncome-homeNetIncomePrior)/homeNetIncomePrior*100;
  document.getElementById("h-rev").textContent   = fmtD(homeNetIncome);
  document.getElementById("h-rev-d").textContent = `▲ ${homeNetIncomeChg.toFixed(1)}% vs Annual Jul 2025`;
  document.getElementById("h-ni-cur").textContent = fmtD(homeNetIncome);
  document.getElementById("h-ni-chg").textContent = homeNetIncomeChg.toFixed(1) + "%";
  document.getElementById("h-revenue").textContent   = "$25,483,840";
  document.getElementById("h-revenue-d").textContent = "▼ 2.3% vs Annual Jul 2025 ($26,079,541)";
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

  const finRevenue = 25483840, finRevenuePrior = 26079541;
  const finCogs = 4341828, finCogsPrior = 7826513;
  const finCosts = 24626078, finCostsPrior = 25656521;
  const pctChg = (cur,prior) => { const p = (cur-prior)/prior*100; return (p>=0?"+":"")+p.toFixed(1)+"%"; };
  const pctPts = (cur,prior) => { const p = cur-prior; return (p>=0?"+":"")+p.toFixed(1)+" pts"; };
  const om26 = (finRevenue-finCosts)/finRevenue*100, om25 = (finRevenuePrior-finCostsPrior)/finRevenuePrior*100;

  document.getElementById("h-om-prior").textContent = om25.toFixed(1) + "%";
  document.getElementById("h-om-cur").textContent   = om26.toFixed(1) + "%";

  document.getElementById("homeMetricTable").innerHTML =
    `<thead><tr><th>Area</th><th>Metric</th><th class="n">TTM Jul 2026</th><th class="n">TTM Jul 2025</th><th class="n">Change</th></tr></thead>
    <tbody>
    ${[
      ["Milk Production","Annual cwt", "361,247", "345,778", "+4.5%"],
      ["Milk Production","Lbs/Cow/Day", "96", "93", "+3.2%"],
      ["Milk Quality","Butterfat %", "3.9%", "3.9%", "flat"],
      ["Milk Quality","SCC (cells/mL)", "250,000", "200,000", "+25%"],
      ["Plant","Utilization Rate", "66.7%"],
      ["Plant","Labor Hrs/cwt<sup>5</sup>", "0.191"],
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
