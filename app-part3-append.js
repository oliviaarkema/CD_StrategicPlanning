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

function productChartValue(sku, rankBy) {
  if (rankBy === "rev") return sku.rev;
  if (rankBy === "ppu") return sku.rev / sku.qty;
  if (rankBy === "ppg") return sku.sizeGal ? (sku.rev / sku.qty) / sku.sizeGal : null;
  return sku.qty;
}

function renderProductChart(state, skus, rankBy) {
  const eligible = rankBy === "ppg" ? skus.filter(s => s.sizeGal != null) : skus;
  const sorted = [...eligible].sort((a,b) => productChartValue(b,rankBy) - productChartValue(a,rankBy));
  const labels = sorted.map(p => p.name);
  const data   = sorted.map(p => productChartValue(p, rankBy));

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

  const MARGIN_PRODS = ["Class 1 milk","Ice Cream","Soft Serve Mix","Butter","Sour Cream & Chip Dip","Other (eggnog, co-packed)"];
  const MARGIN_REV    = [15.28, 0.54, 1.67, 0.33, 0.11, 1.03];
  const MARGIN_PCT    = [0, 0, 0, 0, 0, 0];
  renderMarginChart("milkMarginChart", MARGIN_PRODS, MARGIN_REV, MARGIN_PCT, 18);

  const CUSTOMER_NAMES = ["Cedar Crest","Quality Dairy (QD)","Kuster's Dairy","Country Dairy Farm Store","Other"];
  const CUSTOMER_REV   = [15.44, 1.66, 1.10, 0.17, 0.60];
  const CUSTOMER_PCT   = [0, 0, 0, 0, 0];
  renderMarginChart("customerMarginChart", CUSTOMER_NAMES, CUSTOMER_REV, CUSTOMER_PCT, 18, true);
}

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
