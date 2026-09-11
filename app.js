const WEEK_LABELS = ["6/30/25","7/7/25","7/14/25","7/21/25","7/28/25","8/4/25","8/11/25","8/18/25","8/25/25","9/1/25","9/8/25","9/15/25","9/22/25","9/29/25","10/6/25","10/13/25","10/20/25","10/27/25","11/3/25","11/10/25","11/17/25","11/24/25","12/1/25","12/8/25","12/15/25","12/22/25","12/29/25","1/5/26","1/12/26","1/19/26","1/26/26","2/2/26","2/9/26","2/16/26","2/23/26","3/2/26","3/9/26","3/16/26","3/23/26","3/30/26","4/6/26","4/13/26","4/20/26","4/27/26","5/8/26","5/15/26","5/22/26","5/29/26","6/5/26","6/12/26","6/19/26","6/26/26","7/3/26","7/10/26","7/17/26","7/24/26","7/31/26"];
const WEEK_LABELS_2025 = ["6/30/24","7/7/24","7/14/24","7/21/24","7/28/24","8/4/24","8/11/24","8/18/24","8/25/24","9/1/24","9/8/24","9/15/24","9/22/24","9/29/24","10/6/24","10/13/24","10/20/24","10/27/24","11/3/24","11/10/24","11/17/24","11/24/24","12/1/24","12/8/24","12/15/24","12/22/24","12/29/24","1/5/25","1/12/25","1/19/25","1/26/25","2/2/25","2/9/25","2/16/25","2/23/25","3/2/25","3/9/25","3/16/25","3/23/25","3/30/25","4/6/25","4/13/25","4/20/25","4/27/25","5/8/25","5/15/25","5/22/25","5/29/25","6/5/25","6/12/25","6/19/25","6/26/25","7/3/25","7/10/25","7/17/25","7/24/25","7/31/25"];
const GAL_2026 = [78478,79533,78635,79230,77293,79752,77685,79308,80105,80542,81391,80592,80074,80264,79510,79473,79212,79528,79214,79430,78508,78203,78365,78879,79533,80739,80369,81004,80543,78209,79449,79631,78861,79150,80218,80207,79524,80383,81248,82448,81799,82151,81711,83137,82521,81468,82637,83085,84267,83787,83536,82809,82331,81701,83563,83192,85302];
const GAL_2025 = [75861,76596,75375,75896,74778,75992,76705,75826,73311,75518,75782,75893,76340,75893,75901,76189,76362,77065,76850,77394,75889,74328,75397,74788,75416,75938,77607,77759,77899,76376,77449,78479,79013,79270,79739,79884,80463,79691,78982,77188,76802,76558,77215,77415,77189,78042,78082,79251,77944,80183,79711,76535,78478,79533,78635,79230,77293];
const GAL_TO_CWT = 8.6 / 100;

let rawMilkLineChart = null;

function renderRawMilkCharts(unit) {
  const toUnit = v => unit === "cwt" ? +(v * GAL_TO_CWT).toFixed(1) : v;
  const label  = unit === "gal" ? "gal" : "cwt";
  const data2026 = GAL_2026.map(toUnit);
  const data2025 = GAL_2025.map(toUnit);

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
