// quotation.js
// Quotation Calculation Engine - COMPLETE VERSION WITH AUTO LAYOUT SELECTION
// Based on Offset Quotation-Fixing Project Excel Formulas

// ==================== COMPLETE DATA TABLES ====================

const printWastageTable = [
  { min: 100, max: 199, value: 2.00 },
  { min: 200, max: 299, value: 1.00 },
  { min: 300, max: 399, value: 0.70 },
  { min: 400, max: 499, value: 0.50 },
  { min: 500, max: 599, value: 0.45 },
  { min: 600, max: 699, value: 0.40 },
  { min: 700, max: 799, value: 0.35 },
  { min: 800, max: 899, value: 0.32 },
  { min: 900, max: 999, value: 0.30 },
  { min: 1000, max: 1200, value: 0.28 },
  { min: 1201, max: 1400, value: 0.26 },
  { min: 1401, max: 1600, value: 0.24 },
  { min: 1601, max: 1800, value: 0.22 },
  { min: 1801, max: 2000, value: 0.20 },
  { min: 2001, max: 2500, value: 0.18 },
  { min: 2501, max: 3000, value: 0.16 },
  { min: 3001, max: 4000, value: 0.14 },
  { min: 4001, max: 5000, value: 0.12 },
  { min: 5001, max: 6000, value: 0.10 },
  { min: 6001, max: 7000, value: 0.085 },
  { min: 7001, max: 8000, value: 0.075 },
  { min: 8001, max: 9000, value: 0.065 },
  { min: 9001, max: 10000, value: 0.06 },
  { min: 10001, max: 12000, value: 0.055 },
  { min: 12001, max: 15000, value: 0.05 },
  { min: 15001, max: 20000, value: 0.045 },
  { min: 20001, max: 25000, value: 0.042 },
  { min: 25001, max: 30000, value: 0.04 },
  { min: 30001, max: 40000, value: 0.035 },
  { min: 40001, max: 50000, value: 0.03 },
  { min: 50001, max: 60000, value: 0.03 },
  { min: 60001, max: 70000, value: 0.03 },
  { min: 70001, max: 80000, value: 0.03 },
  { min: 80001, max: 90000, value: 0.03 },
  { min: 90001, max: 100000, value: 0.03 },
  { min: 100001, max: 150000, value: 0.03 },
  { min: 150001, max: 200000, value: 0.03 },
  { min: 200001, max: 250000, value: 0.03 },
  { min: 250001, max: 300000, value: 0.03 },
  { min: 300001, max: 350000, value: 0.03 },
  { min: 350001, max: 425000, value: 0.03 },
  { min: 425001, max: 500000, value: 0.03 },
  { min: 500001, max: 600000, value: 0.03 },
  { min: 600001, max: 700000, value: 0.03 },
  { min: 700001, max: 800000, value: 0.03 },
  { min: 800001, max: 900000, value: 0.03 },
  { min: 900001, max: 1000000, value: 0.03 }
];

const paperWastageTable = [
  { min: 100, max: 199, value: 0.30 },
  { min: 200, max: 299, value: 0.29 },
  { min: 300, max: 399, value: 0.28 },
  { min: 400, max: 499, value: 0.27 },
  { min: 500, max: 599, value: 0.25 },
  { min: 600, max: 699, value: 0.23 },
  { min: 700, max: 799, value: 0.21 },
  { min: 800, max: 899, value: 0.20 },
  { min: 900, max: 999, value: 0.19 },
  { min: 1000, max: 1200, value: 0.18 },
  { min: 1201, max: 1400, value: 0.16 },
  { min: 1401, max: 1600, value: 0.14 },
  { min: 1601, max: 1800, value: 0.13 },
  { min: 1801, max: 2000, value: 0.12 },
  { min: 2001, max: 2500, value: 0.10 },
  { min: 2501, max: 3000, value: 0.09 },
  { min: 3001, max: 4000, value: 0.08 },
  { min: 4001, max: 5000, value: 0.07 },
  { min: 5001, max: 6000, value: 0.06 },
  { min: 6001, max: 7000, value: 0.05 },
  { min: 7001, max: 8000, value: 0.05 },
  { min: 8001, max: 9000, value: 0.05 },
  { min: 9001, max: 10000, value: 0.05 },
  { min: 10001, max: 12000, value: 0.05 },
  { min: 12001, max: 15000, value: 0.05 },
  { min: 15001, max: 20000, value: 0.047 },
  { min: 20001, max: 25000, value: 0.047 },
  { min: 25001, max: 30000, value: 0.045 },
  { min: 30001, max: 40000, value: 0.04 },
  { min: 40001, max: 50000, value: 0.035 },
  { min: 50001, max: 60000, value: 0.03 },
  { min: 60001, max: 70000, value: 0.03 },
  { min: 70001, max: 80000, value: 0.03 },
  { min: 80001, max: 90000, value: 0.03 },
  { min: 90001, max: 100000, value: 0.03 },
  { min: 100001, max: 150000, value: 0.03 },
  { min: 150001, max: 200000, value: 0.03 },
  { min: 200001, max: 250000, value: 0.03 },
  { min: 250001, max: 300000, value: 0.03 },
  { min: 300001, max: 350000, value: 0.03 },
  { min: 350001, max: 425000, value: 0.03 },
  { min: 425001, max: 500000, value: 0.03 },
  { min: 500001, max: 600000, value: 0.03 },
  { min: 600001, max: 700000, value: 0.03 },
  { min: 700001, max: 800000, value: 0.03 },
  { min: 800001, max: 900000, value: 0.03 },
  { min: 900001, max: 1000000, value: 0.03 }
];

const printingRateTable = [
  { min: 100, max: 199, rate: 0.3 },
  { min: 200, max: 299, rate: 0.2 },
  { min: 300, max: 399, rate: 0.145 },
  { min: 400, max: 499, rate: 0.115 },
  { min: 500, max: 599, rate: 0.104 },
  { min: 600, max: 699, rate: 0.089 },
  { min: 700, max: 799, rate: 0.081 },
  { min: 800, max: 899, rate: 0.073 },
  { min: 900, max: 999, rate: 0.065 },
  { min: 1000, max: 1200, rate: 0.058 },
  { min: 1201, max: 1400, rate: 0.05 },
  { min: 1401, max: 1600, rate: 0.044 },
  { min: 1601, max: 1800, rate: 0.039 },
  { min: 1801, max: 2000, rate: 0.036 },
  { min: 2001, max: 2500, rate: 0.03 },
  { min: 2501, max: 3000, rate: 0.027 },
  { min: 3001, max: 4000, rate: 0.022 },
  { min: 4001, max: 5000, rate: 0.02 },
  { min: 5001, max: 6000, rate: 0.02 },
  { min: 6001, max: 7000, rate: 0.02 },
  { min: 7001, max: 8000, rate: 0.019 },
  { min: 8001, max: 9000, rate: 0.019 },
  { min: 9001, max: 10000, rate: 0.019 },
  { min: 10001, max: 12000, rate: 0.018 },
  { min: 12001, max: 15000, rate: 0.018 },
  { min: 15001, max: 20000, rate: 0.017 },
  { min: 20001, max: 25000, rate: 0.017 },
  { min: 25001, max: 30000, rate: 0.016 },
  { min: 30001, max: 40000, rate: 0.015 },
  { min: 40001, max: 50000, rate: 0.014 },
  { min: 50001, max: 60000, rate: 0.013 },
  { min: 60001, max: 70000, rate: 0.012 },
  { min: 70001, max: 80000, rate: 0.012 },
  { min: 80001, max: 90000, rate: 0.011 },
  { min: 90001, max: 100000, rate: 0.0105 },
  { min: 100001, max: 150000, rate: 0.01 },
  { min: 150001, max: 200000, rate: 0.01 },
  { min: 200001, max: 250000, rate: 0.0095 },
  { min: 250001, max: 300000, rate: 0.0093 },
  { min: 300001, max: 350000, rate: 0.0092 },
  { min: 350001, max: 425000, rate: 0.0091 },
  { min: 425001, max: 500000, rate: 0.0091 },
  { min: 500001, max: 600000, rate: 0.009 },
  { min: 600001, max: 700000, rate: 0.009 },
  { min: 700001, max: 800000, rate: 0.009 },
  { min: 800001, max: 900000, rate: 0.0089 },
  { min: 900001, max: 1000000, rate: 0.0085 }
];

const spotColorTables = {
  "1 spot up to 33%": [
    { min: 100, max: 199, cost: 59.70 },
    { min: 200, max: 299, cost: 59.80 },
    { min: 300, max: 399, cost: 59.85 },
    { min: 400, max: 499, cost: 59.88 },
    { min: 500, max: 599, cost: 59.90 },
    { min: 600, max: 699, cost: 69.90 },
    { min: 700, max: 799, cost: 71.91 },
    { min: 800, max: 899, cost: 71.92 },
    { min: 900, max: 999, cost: 74.93 },
    { min: 1000, max: 1200, cost: 78.00 },
    { min: 1201, max: 1400, cost: 88.20 },
    { min: 1401, max: 1600, cost: 92.80 },
    { min: 1601, max: 1800, cost: 90.00 },
    { min: 1801, max: 2000, cost: 100.00 },
    { min: 2001, max: 2500, cost: 125.00 },
    { min: 2501, max: 3000, cost: 142.50 },
    { min: 3001, max: 4000, cost: 190.00 },
    { min: 4001, max: 5000, cost: 225.00 },
    { min: 5001, max: 6000, cost: 270.00 },
    { min: 6001, max: 7000, cost: 297.50 },
    { min: 7001, max: 8000, cost: 340.00 },
    { min: 8001, max: 9000, cost: 360.00 },
    { min: 9001, max: 10000, cost: 400.00 },
    { min: 10001, max: 12000, cost: 450.00 },
    { min: 12001, max: 15000, cost: 562.50 },
    { min: 15001, max: 20000, cost: 700.00 },
    { min: 20001, max: 25000, cost: 875.00 },
    { min: 25001, max: 30000, cost: 900.00 },
    { min: 30001, max: 40000, cost: 1000.00 },
    { min: 40001, max: 50000, cost: 1200.00 },
    { min: 50001, max: 60000, cost: 1440.00 },
    { min: 60001, max: 70000, cost: 1680.00 },
    { min: 70001, max: 80000, cost: 1920.00 },
    { min: 80001, max: 90000, cost: 2070.00 },
    { min: 90001, max: 100000, cost: 2300.00 },
    { min: 100001, max: 150000, cost: 3450.00 },
    { min: 150001, max: 200000, cost: 4600.00 },
    { min: 200001, max: 250000, cost: 5750.00 },
    { min: 250001, max: 300000, cost: 6900.00 },
    { min: 300001, max: 350000, cost: 8050.00 },
    { min: 350001, max: 425000, cost: 9350.00 },
    { min: 425001, max: 500000, cost: 11000.00 },
    { min: 500001, max: 600000, cost: 13200.00 },
    { min: 600001, max: 700000, cost: 15400.00 },
    { min: 700001, max: 800000, cost: 17600.00 },
    { min: 800001, max: 900000, cost: 18900.00 },
    { min: 900001, max: 1000000, cost: 20000.00 }
  ],
  "2 spot up to 67%": [
    { min: 100, max: 199, cost: 119.40 },
    { min: 200, max: 299, cost: 119.60 },
    { min: 300, max: 399, cost: 119.70 },
    { min: 400, max: 499, cost: 119.76 },
    { min: 500, max: 599, cost: 119.80 },
    { min: 600, max: 699, cost: 139.80 },
    { min: 700, max: 799, cost: 143.82 },
    { min: 800, max: 899, cost: 143.84 },
    { min: 900, max: 999, cost: 149.85 },
    { min: 1000, max: 1200, cost: 156.00 },
    { min: 1201, max: 1400, cost: 176.40 },
    { min: 1401, max: 1600, cost: 185.60 },
    { min: 1601, max: 1800, cost: 180.00 },
    { min: 1801, max: 2000, cost: 200.00 },
    { min: 2001, max: 2500, cost: 250.00 },
    { min: 2501, max: 3000, cost: 285.00 },
    { min: 3001, max: 4000, cost: 380.00 },
    { min: 4001, max: 5000, cost: 450.00 },
    { min: 5001, max: 6000, cost: 540.00 },
    { min: 6001, max: 7000, cost: 595.00 },
    { min: 7001, max: 8000, cost: 680.00 },
    { min: 8001, max: 9000, cost: 720.00 },
    { min: 9001, max: 10000, cost: 800.00 },
    { min: 10001, max: 12000, cost: 900.00 },
    { min: 12001, max: 15000, cost: 1125.00 },
    { min: 15001, max: 20000, cost: 1400.00 },
    { min: 20001, max: 25000, cost: 1750.00 },
    { min: 25001, max: 30000, cost: 1800.00 },
    { min: 30001, max: 40000, cost: 2000.00 },
    { min: 40001, max: 50000, cost: 2400.00 },
    { min: 50001, max: 60000, cost: 2880.00 },
    { min: 60001, max: 70000, cost: 3360.00 },
    { min: 70001, max: 80000, cost: 3840.00 },
    { min: 80001, max: 90000, cost: 4140.00 },
    { min: 90001, max: 100000, cost: 4600.00 },
    { min: 100001, max: 150000, cost: 6900.00 },
    { min: 150001, max: 200000, cost: 9200.00 },
    { min: 200001, max: 250000, cost: 11500.00 },
    { min: 250001, max: 300000, cost: 13800.00 },
    { min: 300001, max: 350000, cost: 16100.00 },
    { min: 350001, max: 425000, cost: 18700.00 },
    { min: 425001, max: 500000, cost: 22000.00 },
    { min: 500001, max: 600000, cost: 26400.00 },
    { min: 600001, max: 700000, cost: 30800.00 },
    { min: 700001, max: 800000, cost: 35200.00 },
    { min: 800001, max: 900000, cost: 37800.00 },
    { min: 900001, max: 1000000, cost: 40000.00 }
  ],
  "3 spot up to 33%": [
    { min: 100, max: 199, cost: 179.10 },
    { min: 200, max: 299, cost: 179.40 },
    { min: 300, max: 399, cost: 179.55 },
    { min: 400, max: 499, cost: 179.64 },
    { min: 500, max: 599, cost: 179.70 },
    { min: 600, max: 699, cost: 209.70 },
    { min: 700, max: 799, cost: 215.73 },
    { min: 800, max: 899, cost: 215.76 },
    { min: 900, max: 999, cost: 224.78 },
    { min: 1000, max: 1200, cost: 234.00 },
    { min: 1201, max: 1400, cost: 264.60 },
    { min: 1401, max: 1600, cost: 278.40 },
    { min: 1601, max: 1800, cost: 270.00 },
    { min: 1801, max: 2000, cost: 300.00 },
    { min: 2001, max: 2500, cost: 375.00 },
    { min: 2501, max: 3000, cost: 427.50 },
    { min: 3001, max: 4000, cost: 570.00 },
    { min: 4001, max: 5000, cost: 675.00 },
    { min: 5001, max: 6000, cost: 810.00 },
    { min: 6001, max: 7000, cost: 892.50 },
    { min: 7001, max: 8000, cost: 1020.00 },
    { min: 8001, max: 9000, cost: 1080.00 },
    { min: 9001, max: 10000, cost: 1200.00 },
    { min: 10001, max: 12000, cost: 1350.00 },
    { min: 12001, max: 15000, cost: 1687.50 },
    { min: 15001, max: 20000, cost: 2100.00 },
    { min: 20001, max: 25000, cost: 2625.00 },
    { min: 25001, max: 30000, cost: 2700.00 },
    { min: 30001, max: 40000, cost: 3000.00 },
    { min: 40001, max: 50000, cost: 3600.00 },
    { min: 50001, max: 60000, cost: 39600.00 },
    { min: 600001, max: 700000, cost: 46200.00 },
    { min: 700001, max: 800000, cost: 52800.00 },
    { min: 800001, max: 900000, cost: 56700.00 },
    { min: 900001, max: 1000000, cost: 60000.00 }
  ]
};

// ==================== MODIFIED PRINTING CONFIGS ====================

const printingConfigs = {
  "Plain 0c x 0c": { processColors: 0, spotColors: 0, plateCost: 0, useSpotTable: false },
  "process 4c x 0c": { processColors: 4, spotColors: 0, plateCost: 140, useSpotTable: false },
  "1 spot up to 33%": { processColors: 0, spotColors: 1, plateCost: 40, useSpotTable: true, tableKey: "1 spot up to 33%" },
  "1 spot up to 67%": { processColors: 0, spotColors: 1, plateCost: 40, useSpotTable: true, tableKey: "1 spot up to 33%" },
  "1 spot up to 100%": { processColors: 0, spotColors: 1, plateCost: 40, useSpotTable: true, tableKey: "1 spot up to 33%" },
  "2 spot up to 33%": { processColors: 0, spotColors: 2, plateCost: 80, useSpotTable: true, tableKey: "2 spot up to 67%" },
  "2 spot up to 67%": { processColors: 0, spotColors: 2, plateCost: 80, useSpotTable: true, tableKey: "2 spot up to 67%" },
  "2 spot up to 100%": { processColors: 0, spotColors: 2, plateCost: 80, useSpotTable: true, tableKey: "2 spot up to 67%" },
  "3 spot up to 33%": { processColors: 0, spotColors: 3, plateCost: 120, useSpotTable: true, tableKey: "3 spot up to 33%" },
  "3 spot up to 67%": { processColors: 0, spotColors: 3, plateCost: 120, useSpotTable: true, tableKey: "3 spot up to 33%" },
  "3 spot up to 100%": { processColors: 0, spotColors: 3, plateCost: 120, useSpotTable: true, tableKey: "3 spot up to 33%" },
  "5c=process 4cx0c+1c spot 33%": { processColors: 4, spotColors: 1, plateCost: 180, useSpotTable: true, tableKey: "1 spot up to 33%" },
  "6c=process 4cx0c+2c spot 33%": { processColors: 4, spotColors: 2, plateCost: 220, useSpotTable: true, tableKey: "2 spot up to 67%" }
};

const coverageMap = {
  "Plain 0c x 0c": 0,
  "process 4c x 0c": 0,
  "1 spot up to 33%": 0.33,
  "1 spot up to 67%": 0.67,
  "1 spot up to 100%": 1.0,
  "2 spot up to 33%": 0.33,
  "2 spot up to 67%": 0.67,
  "2 spot up to 100%": 1.0,
  "3 spot up to 33%": 0.33,
  "3 spot up to 67%": 0.67,
  "3 spot up to 100%": 1.0,
  "5c=process 4cx0c+1c spot 33%": 1.18,
  "6c=process 4cx0c+2c spot 33%": 1.18
};

const paperTypes = [
  { name: "Brown Kraft 100", gsm: 0.10, pricePerKg: 2.35 },
  { name: "Brown Kraft 120", gsm: 0.12, pricePerKg: 2.25 },
  { name: "Brown Kraft 140", gsm: 0.14, pricePerKg: 2.30 },
  { name: "Brown Kraft 170", gsm: 0.17, pricePerKg: 2.30 },
  { name: "White Kraft 100", gsm: 0.10, pricePerKg: 4.70 },
  { name: "White Kraft 120", gsm: 0.12, pricePerKg: 4.50 },
  { name: "White Kraft 150", gsm: 0.15, pricePerKg: 4.70 },
  { name: "White Kraft 180", gsm: 0.18, pricePerKg: 4.70 },
  { name: "Art Paper 157", gsm: 0.157, pricePerKg: 3.60 },
  { name: "Art Card 190", gsm: 0.19, pricePerKg: 3.45 },
  { name: "Art Card 210", gsm: 0.21, pricePerKg: 3.55 },
  { name: "Art Card 230", gsm: 0.23, pricePerKg: 3.55 },
  { name: "Sack Kraft 100", gsm: 0.10, pricePerKg: 4.50 }
];

const inkPrices = { normal: 60, metallic: 150 };

// ==================== SPOT COLOR COST LOOKUP ====================

function getSpotColorCost(qty, tableKey) {
  const table = spotColorTables[tableKey];
  if (!table) return null;
  for (const row of table) {
    if (qty >= row.min && qty <= row.max) return row.cost;
  }
  return table[table.length - 1].cost;
}

// ==================== UTILITY FUNCTIONS ====================

function findUpperBoundary(qty, table) {
  for (const r of table) {
    if (qty >= r.min && qty <= r.max) return r.max;
  }
  return table[table.length - 1].max;
}

function findRate(qty, table) {
  for (const r of table) {
    if (qty >= r.min && qty <= r.max) return r.rate || r.value;
  }
  return table[table.length - 1].rate || table[table.length - 1].value;
}

function findValue(qty, table) {
  for (const r of table) {
    if (qty >= r.min && qty <= r.max) return r.value;
  }
  return table[table.length - 1].value;
}

function findPaper(name) {
  return paperTypes.find((p) => p.name === name) || paperTypes[0];
}

function customRound(value) {
  return Math.round(value);
}

// ==================== LAYOUT CALCULATIONS ====================

function calcSheetSize({ width, height, gusset, layout }) {
  const w = Number(width) / 1000;
  const h = Number(height) / 1000;
  const g = Number(gusset) / 1000;

  let sheetWidth, sheetHeight;

  switch (layout) {
    case "0.5X2Y":
      sheetWidth = 1 * (w + g) + 0.035;
      sheetHeight = 2 * (h + 0.7 * g + 0.055);
      break;
    case "0.5X1Y":
      sheetWidth = w + g + 0.035;
      sheetHeight = h + 0.7 * g + 0.055;
      break;
    case "1X2Y":
      sheetWidth = 2 * (w + g) + 0.035;
      sheetHeight = 2 * (h + 0.7 * g + 0.055);
      break;
    case "1X1Y":
    default:
      sheetWidth = 2 * (w + g) + 0.035;
      sheetHeight = h + 0.7 * g + 0.055;
  }

  return {
    sheetWidth: Number(sheetWidth.toFixed(3)),
    sheetHeight: Number(sheetHeight.toFixed(3))
  };
}

function findSuitableLayouts({ width, height, gusset }) {
  const layouts = ["1X1Y", "0.5X2Y", "0.5X1Y", "1X2Y"];
  const suitableLayouts = [];

  for (const layout of layouts) {
    const { sheetWidth, sheetHeight } = calcSheetSize({ width, height, gusset, layout });
    const validation = validateLayout({ sheetWidth, sheetHeight, layout });

    if (validation.valid) {
      suitableLayouts.push({ layout, sheetWidth, sheetHeight, validation });
    }
  }

  return suitableLayouts;
}

// ==================== LAYOUT VALIDATION ====================

function validateLayout({ sheetWidth, sheetHeight, layout }) {
  const sw = sheetWidth;
  const sh = sheetHeight;

  const ok1x1 = sw >= 0.533 && sw <= 1.025 && sh >= 0.318 && sh <= 0.698;
  const ok05x2y = sw >= 0.318 && sw <= 0.698 && sh >= 0.533 && sh <= 1.025;
  const ok05x1y =
    (sw >= 0.318 && sw <= 0.698 && sh >= 0.533 && sh <= 1.025) ||
    (sw >= 0.533 && sw <= 1.025 && sh >= 0.318 && sh <= 0.698);
  const ok1x2y =
    (sw >= 0.3 && sw <= 0.698 && sh >= 0.42 && sh <= 1.025) ||
    (sw >= 0.42 && sw <= 1.025 && sh >= 0.3 && sh <= 0.698);

  switch (layout) {
    case "1X1Y": return ok1x1 ? { valid: true } : { valid: false, error: "1X1Y layout out of range" };
    case "0.5X2Y": return ok05x2y ? { valid: true } : { valid: false, error: "0.5X2Y layout out of range" };
    case "0.5X1Y": return ok05x1y ? { valid: true } : { valid: false, error: "0.5X1Y layout out of range" };
    case "1X2Y": return ok1x2y ? { valid: true } : { valid: false, error: "1X2Y layout out of range" };
    default: return { valid: true };
  }
}

function validateInput(input) {
  const errors = [];

  if (!input.width || input.width < 50 || input.width > 1000) errors.push("Width must be between 50mm and 1000mm");
  if (!input.height || input.height < 50 || input.height > 1000) errors.push("Height must be between 50mm and 1000mm");
  if (input.gusset == null || input.gusset < 0 || input.gusset > 500) errors.push("Gusset must be between 0mm and 500mm");
  if (!input.quantity || input.quantity < 100 || input.quantity > 1000000) errors.push("Quantity must be between 100 and 1,000,000 pieces");
  if (!input.paperName || !paperTypes.find((p) => p.name === input.paperName)) errors.push("Invalid paper type selected");
  if (!input.printingOption || !printingConfigs[input.printingOption]) errors.push("Invalid printing option selected");

  return errors;
}

function getBagsPerSheet(layout) {
  switch (layout) {
    case "1X1Y": return 1;
    case "0.5X2Y": return 1;
    case "0.5X1Y": return 0.5;
    case "1X2Y": return 2;
    default: return 1;
  }
}

function getEquivalentQuantityForWastage(quantity, layout) {
  const bagsPerSheet = getBagsPerSheet(layout);
  return quantity / bagsPerSheet;
}

// ==================== VARNISH HELPERS ====================

function calculateOPVCost(sheetWidth, sheetHeight, sheetsNeeded) {
  return (sheetWidth * sheetHeight * 1550 * sheetsNeeded * 0.0000015 * 40) + (sheetsNeeded * 0.03);
}

function calculateWBCost(sheetWidth, sheetHeight, sheetsNeeded) {
  return sheetWidth * sheetHeight * 1550 * 0.00008 * sheetsNeeded;
}

// ==================== SINGLE LAYOUT CALCULATION ====================

function calculateForLayout(input, layout) {
  const qty = Number(input.quantity);
  const paper = findPaper(input.paperName);

  const { sheetWidth, sheetHeight } = calcSheetSize({ width: input.width, height: input.height, gusset: input.gusset, layout });

  const bagsPerSheet = getBagsPerSheet(layout);
  const equivalentQtyForWastage = getEquivalentQuantityForWastage(qty, layout);
  const sheetsNeeded = qty / bagsPerSheet;

  // P1: PAPER COST
  const printWastage = findValue(equivalentQtyForWastage, printWastageTable);
  const paperWastage = findValue(equivalentQtyForWastage, paperWastageTable);
  const paperArea = sheetWidth * sheetHeight;
  const totalPaperWeight = paperArea * paper.gsm * sheetsNeeded * (1 + printWastage + paperWastage);
  const P1 = customRound(totalPaperWeight * paper.pricePerKg);

  // P2: PRINTING COST
  const printingOption = input.printingOption;
  const config = printingConfigs[printingOption];
  let P2 = 0;

  if (config.useSpotTable && config.tableKey) {
    const spotCost = getSpotColorCost(equivalentQtyForWastage, config.tableKey);
    if (spotCost !== null) {
      P2 = customRound(spotCost);
      if (printingOption === "5c=process 4cx0c+1c spot 33%" || printingOption === "6c=process 4cx0c+2c spot 33%") {
        const printingRate = findRate(equivalentQtyForWastage, printingRateTable);
        const upperBoundaryQty = findUpperBoundary(equivalentQtyForWastage, printingRateTable);
        const processCost = config.processColors * printingRate * upperBoundaryQty;
        P2 = customRound(P2 + processCost);
      }
    } else {
      const printingRate = findRate(equivalentQtyForWastage, printingRateTable);
      const upperBoundaryQty = findUpperBoundary(equivalentQtyForWastage, printingRateTable);
      const processCost = config.processColors * printingRate * upperBoundaryQty;
      const spotCostCalc = config.spotColors * printingRate * 1.2 * upperBoundaryQty;
      P2 = customRound(processCost + spotCostCalc);
    }
  } else {
    const printingRate = findRate(equivalentQtyForWastage, printingRateTable);
    const upperBoundaryQty = findUpperBoundary(equivalentQtyForWastage, printingRateTable);
    const processCost = config.processColors * printingRate * upperBoundaryQty;
    const spotCostCalc = config.spotColors * printingRate * 1.2 * upperBoundaryQty;
    P2 = customRound(processCost + spotCostCalc);
  }

  // P3: PLATE COST
  const P3 = customRound(config.plateCost || 0);

  // P4: INK COST
  const coverage = coverageMap[printingOption] || 0;
  const inkWeight = sheetWidth * sheetHeight * 1550 * coverage * sheetsNeeded * 0.000002;

  let roundedInkKg;
  if (inkWeight >= 0.01 && inkWeight <= 2) roundedInkKg = 2;
  else roundedInkKg = Math.ceil(inkWeight);

  const inkType = input.inkType || "normal";
  const inkPrice = inkPrices[inkType] || inkPrices.normal;
  const P4 = customRound(roundedInkKg * inkPrice);

  // P5: PROTECTION VARNISH
  let P5 = 0;
  const varnish = input.varnish || "None";
  if (varnish !== "None") {
    const opvCostWithMin = Math.max(100, Math.ceil(calculateOPVCost(sheetWidth, sheetHeight, sheetsNeeded)));
    const wbCostWithMin = Math.max(100, Math.ceil(calculateWBCost(sheetWidth, sheetHeight, sheetsNeeded)));
    const averageCost = (opvCostWithMin + wbCostWithMin) / 2;
    P5 = customRound(averageCost);
  }

  // P6: LAMINATION
  let P6 = 0;
  const lamination = input.lamination || "None";
  if (lamination !== "None" && lamination !== "Plain without Lamination") {
    const glossCostWithMin = Math.max(50, customRound(sheetWidth * sheetHeight * 1550 * 0.0004 * sheetsNeeded));
    const mattCostWithMin = Math.max(50, customRound(sheetWidth * sheetHeight * 1550 * 0.00042 * sheetsNeeded));
    const averageCost = (glossCostWithMin + mattCostWithMin) / 2;
    P6 = customRound(averageCost);
  }

  // P7: SPOT UV
  let P7 = 0;
  if (input.spotUV === true) {
    const baseSpotUVCost = sheetWidth * sheetHeight * 1550 * 0.00045 * sheetsNeeded;
    const spotUVCostWithMin = Math.max(100, customRound(baseSpotUVCost));
    P7 = customRound(spotUVCostWithMin);
  }

// P8: STAMPING - With quantity-based minimum totals
let P8 = 0;
if (input.stamping === true && input.stampingSize) {
  const [stampingHeight, stampingWidth] = input.stampingSize.split('x').map((v) => parseFloat(v));
  
  // Convert mm to inches and ADD 0.5
  const widthIn = (stampingWidth / 25.4) + 0.5;
  const heightIn = (stampingHeight / 25.4) + 0.5;
  const areaIn2 = widthIn * heightIn;
  
  // Convert to cm for block
  const areaCm2 = (stampingWidth / 10) * (stampingHeight / 10);
  
  // Foil rates per square INCH
  const foilRates = {
    gold: 0.0015, silver: 0.0015,
    matt_gold: 0.0025, matt_silver: 0.0025,
    copper: 0.0025, black: 0.0025,
    red: 0.0025, green: 0.0025,
    blue: 0.0025, maroon: 0.0025,
    special: 0.0030, white: 0.0040, rainbow: 0.0040,
    hologram: 0.0035
  };
  const rate = foilRates[input.foilType] || 0.0025;
  
  // Quantity multipliers AND minimum total stamping costs
  const stampingTiers = [
    { min: 100, max: 199, mult: 6, minTotal: 0 }, // Need values for these
    { min: 200, max: 299, mult: 4, minTotal: 0 },
    { min: 300, max: 399, mult: 2.2, minTotal: 0 },
    { min: 400, max: 499, mult: 1.8, minTotal: 0 },
    { min: 500, max: 999, mult: 1.6, minTotal: 0 },
    { min: 1000, max: 1999, mult: 1.5, minTotal: 120.00 }, // Your example
    { min: 2000, max: 2999, mult: 1.3, minTotal: 120.00 }, // Your example
    { min: 3000, max: 3999, mult: 1, minTotal: 120.00 },   // Your example
    { min: 4000, max: 4999, mult: 1, minTotal: 160.00 },   // Your example
    { min: 5000, max: 6999, mult: 0.95, minTotal: 160.00 },
    { min: 7000, max: 9999, mult: 0.9, minTotal: 160.00 },
    { min: 10000, max: 14999, mult: 0.85, minTotal: 200.00 }, // Guessing
    { min: 15000, max: 19999, mult: 0.8, minTotal: 200.00 },
    { min: 20000, max: 29999, mult: 0.78, minTotal: 200.00 },
    { min: 30000, max: 49999, mult: 0.76, minTotal: 200.00 },
    { min: 50000, max: 74999, mult: 0.74, minTotal: 200.00 },
    { min: 75000, max: 99999, mult: 0.72, minTotal: 200.00 },
    { min: 100000, max: 149999, mult: 0.7, minTotal: 200.00 },
    { min: 150000, max: 199999, mult: 0.68, minTotal: 200.00 },
    { min: 200000, max: 399999, mult: 0.66, minTotal: 200.00 },
    { min: 400000, max: 1000000, mult: 0.63, minTotal: 200.00 }
  ];
  
  const tier = stampingTiers.find((r) => qty >= r.min && qty <= r.max) || { mult: 1.0, minTotal: 0 };
  const mult = tier.mult;
  const minTotalStamping = tier.minTotal;
  
  // Block charge: minimum 30, RM 0.25 per cm²
  const blockCharge = Math.max(0.25 * areaCm2, 30);
  
  // Mylar: minimum 30, RM 0.08 per square inch
  const mylarCost = Math.max(0.08 * areaIn2, 30);
  
  // Calculate stamping cost
  const stampingUnit = rate * areaIn2 * mult * 2; // ×2 for pair
  let stampingCost = stampingUnit * qty;
  
  // Apply minimum TOTAL stamping cost (not per unit)
  stampingCost = Math.max(stampingCost, minTotalStamping);
  
  // Total P8
  P8 = Math.round(stampingCost + blockCharge + mylarCost);
}


  // ==================== P9: EMBOSSING COST ====================
let P9 = 0;
if (input.embossed === true && input.embossSize) {
  const [embossHeight, embossWidth] = input.embossSize.split('x').map(val => parseFloat(val));
  
  // Convert mm to cm and ADD 1 cm to each dimension
  const heightCm = (embossHeight / 10) + 1;
  const widthCm = (embossWidth / 10) + 1;
  
  // Calculate area in cm² with the +1 adjustment
  const areaCm2 = heightCm * widthCm;
  
  let blockCost;
  
  if (input.embossType === "3D") {
    // For 3D embossing: area × 5
    blockCost = areaCm2 * 5;
  } else {
    // For standard embossing: area × 0.35
    blockCost = areaCm2 * 0.35;
  }
  
  // Per piece impression cost based on quantity tiers
  const impressionRateTiers = [
    { min: 100, max: 199, rate: 0.600 },
    { min: 200, max: 299, rate: 0.360 },
    { min: 300, max: 399, rate: 0.280 },
    { min: 400, max: 499, rate: 0.250 },
    { min: 500, max: 999, rate: 0.160 },
    { min: 1000, max: 1999, rate: 0.140 },
    { min: 2000, max: 2999, rate: 0.080 },
    { min: 3000, max: 4999, rate: 0.070 },
    { min: 5000, max: 6999, rate: 0.060 },
    { min: 7000, max: 9999, rate: 0.056 },
    { min: 10000, max: 14999, rate: 0.056 },
    { min: 15000, max: 19999, rate: 0.052 },
    { min: 20000, max: 29999, rate: 0.050 },
    { min: 30000, max: 39999, rate: 0.049 },
    { min: 40000, max: 49999, rate: 0.048 },
    { min: 50000, max: 99999, rate: 0.040 },
    { min: 100000, max: 149999, rate: 0.040 },
    { min: 150000, max: 199999, rate: 0.040 },
    { min: 200000, max: 399999, rate: 0.040 },
    { min: 400000, max: 1000000, rate: 0.040 }
  ];
  
  // Find the impression rate based on quantity
  const qty = input.quantity;
  let impressionRate = 0.600; // Default highest rate
  
  for (const tier of impressionRateTiers) {
    if (qty >= tier.min && qty <= tier.max) {
      impressionRate = tier.rate;
      break;
    }
  }
  
  // Calculate impression cost
  const impressionCost = impressionRate * qty;
  
  // Calculate total embossing cost: Block cost + Impression cost
  const totalEmbossingCost = blockCost + impressionCost;
  
  // Apply minimum total embossing cost of RM80
  P9 = Math.max(80, Math.round(totalEmbossingCost));
}

  // ==================== P10: TEXTURE EMBOSSED COST ====================
let P10 = 0;
if (input.textureEmboss === true && input.textureType === "custom") {
  // Calculate Actual Qty Textured based on THIS LAYOUT
  const bagsPerSheet = getBagsPerSheet(layout);
  const actualQtyTextured = qty / bagsPerSheet;
  
  const baseRate = 0.05; // RM0.05 per unit
  
  if (actualQtyTextured >= 100 && actualQtyTextured <= 1999) {
    // Tier 1: Fixed RM100 for 100-1999 Actual Qty
    P10 = 100;
  } else if (actualQtyTextured >= 2000 && actualQtyTextured <= 9999) {
    // Tier 2: 2000-9999 → Actual Qty × 0.05 × 1
    P10 = Math.round(actualQtyTextured * baseRate * 1);
  } else if (actualQtyTextured >= 10000 && actualQtyTextured <= 49999) {
    // Tier 3: 10000-49999 → Actual Qty × 0.05 × 0.9
    P10 = Math.round(actualQtyTextured * baseRate * 0.9);
  } else if (actualQtyTextured >= 50000 && actualQtyTextured <= 2000000) {
    // Tier 4: 50000+ → Actual Qty × 0.05 × 0.85
    P10 = Math.round(actualQtyTextured * baseRate * 0.85);
  }
  // Note: Normal textured (not custom) has P10 = 0
}

    // ==================== P11: DIE CUT COST ====================
  let P11 = 0;
  if (input.dieCut === true) {
    // Calculate Actual Qty Die Cut based on THIS LAYOUT
    const bagsPerSheet = getBagsPerSheet(layout);
    const actualQtyDieCut = qty / bagsPerSheet;
    
    const baseRate = 0.05; // RM0.05 per unit
    
    if (actualQtyDieCut >= 100 && actualQtyDieCut <= 1999) {
      // Tier 1: Fixed RM90 for 100-1999 Actual Qty
      P11 = 90;
    } else if (actualQtyDieCut >= 2000 && actualQtyDieCut <= 9999) {
      // Tier 2: Different formulas based on layout and quantity
      let multiplier;
      
      if (qty === 1000) {
        // For 1000 quantity: All layouts use ×1 multiplier
        multiplier = 1.0;
      } else if (layout === "1X2Y") {
        // For 1X2Y layout: Always use ×1 multiplier
        multiplier = 1.0;
      } else {
        // For other layouts (1X1Y, 0.5X1Y, 0.5X2Y): Use ×0.9 multiplier
        multiplier = 0.9;
      }
      
      P11 = Math.round(actualQtyDieCut * baseRate * multiplier);
    } else if (actualQtyDieCut >= 10000 && actualQtyDieCut <= 49999) {
      // Tier 3: Different formulas based on layout and quantity
      let multiplier;
      
      if (qty === 1000) {
        // For 1000 quantity: All layouts use ×0.9 multiplier
        multiplier = 0.9;
      } else if (layout === "1X2Y") {
        // For 1X2Y layout: Always use ×0.9 multiplier
        multiplier = 0.9;
      } else {
        // For other layouts: Use ×0.8 multiplier
        multiplier = 0.8;
      }
      
      P11 = Math.round(actualQtyDieCut * baseRate * multiplier);
    } else if (actualQtyDieCut >= 50000 && actualQtyDieCut <= 2000000) {
      // Tier 4: Different formulas based on layout and quantity
      let multiplier;
      
      if (qty === 1000) {
        // For 1000 quantity: All layouts use ×0.85 multiplier
        multiplier = 0.85;
      } else if (layout === "1X2Y") {
        // For 1X2Y layout: Always use ×0.85 multiplier
        multiplier = 0.85;
      } else {
        // For other layouts: Use ×0.7 multiplier
        multiplier = 0.7;
      }
      
      P11 = Math.round(actualQtyDieCut * baseRate * multiplier);
    }
    
    // Remove the extra +90 that was in your original code
    // The fixed RM90 is already included in Tier 1
  }

// ==================== P12: DIE CUT MOULDING COST ====================
let P12 = 0;
if (input.newMould === true) {
  // Convert mm to meters
  const w = input.width / 1000;     // 0.15
  const h = input.height / 1000;    // 0.3
  const g = input.gusset / 1000;    // 0.1
  
  // P12-specific dimensions (DIFFERENT from normal sheet size!)
  const p12_1X = 2 * (w + g) + 0.035;           // 0.535
  const p12_1Y = h + 0.7*g + 0.015 + 0.055;    // 0.44
  
  // Parse layout
  const [xPart, yPart] = layout.split('X');
  const xMult = parseFloat(xPart); // 1, 0.5
  const yMult = parseFloat(yPart.replace('Y', '')); // 1, 2
  
  // Base die dimensions (for 1X1Y layout)
  const baseDieHeight = p12_1X * 3;    // 0.535 × 3 = 1.605
  const baseDieWidth = p12_1Y * 6;     // 0.44 × 6 = 2.64
  
  // Scale for layout (both dimensions scale with yMult for 2Y)
  const scalingFactor = yMult; // 1 for 1Y, 2 for 2Y
  const dieHeight = baseDieHeight * scalingFactor;
  const dieWidth = baseDieWidth * scalingFactor;
  
  // Crease cost
  const creaseCost = (dieWidth + dieHeight) * 30;
  
  // Base plywood (using P12 dimensions)
  const basePlywood = (p12_1X * p12_1Y * 100) + 5;  // (0.535×0.44×100)+5=28.54
  
  // Plywood multiplier
  let plywoodMult;
  if (layout === "1X2Y") plywoodMult = 2;
  else if (layout === "0.5X1Y") plywoodMult = 0.5;
  else plywoodMult = 1;
  
  const plywoodCost = basePlywood * plywoodMult;
  
  // Total
  P12 = Math.round(creaseCost + plywoodCost);
  
} else if (input.existingMould === true) {
  P12 = 80;
}

  

  // P13-P18: Additional costs
  let P13 = 0, P14 = 0, P15 = 0, P16 = 0, P17 = 0, P18 = 0;

  P13 = customRound(input.handles ? 0.09 * qty : 0);
  P14 = customRound(input.reinforcementBoard ? 0.04 * qty : 0);
  P15 = customRound(input.convertingLabor ? 0.22 * qty : 0);
  P16 = customRound(input.packaging ? 0.04 * qty : 0);

  if (qty <= 3000) P17 = 250;
  else if (qty <= 4000) P17 = 300;
  else P17 = 350;
  P17 = customRound(P17);

  P18 = customRound(input.mockUp ? 40 : 0);

  const totalCost = P1 + P2 + P3 + P4 + P5 + P6 + P7 + P8 + P9 + P10 + P11 + P12 + P13 + P14 + P15 + P16 + P17 + P18;
  const unitCost = totalCost / qty;

  const marginIndex = Number(input.marginIndex || 0.63);
  const unitSellingPrice = unitCost / marginIndex;
  const totalSellingPrice = unitSellingPrice * qty;

  return {
    layout,
    sheetSize: { width: sheetWidth, height: sheetHeight },
    bagsPerSheet,
    sheetsNeeded,
    costs: {
      P1: customRound(P1),
      P2: customRound(P2),
      P3: customRound(P3),
      P4: customRound(P4),
      P5: customRound(P5),
      P6: customRound(P6),
      P7: customRound(P7),
      P8: customRound(P8),
      P9: customRound(P9),
      P10: customRound(P10),
      P11: customRound(P11),
      P12: customRound(P12),
      P13: customRound(P13),
      P14: customRound(P14),
      P15: customRound(P15),
      P16: customRound(P16),
      P17: customRound(P17),
      P18: customRound(P18)
    },
    summary: {
      totalCost: customRound(totalCost),
      unitCost: Number(unitCost.toFixed(4)),
      unitSellingPrice: Number(unitSellingPrice.toFixed(4)),
      totalSellingPrice: customRound(totalSellingPrice)
    }
  };
}

// ==================== COMPLETE CALCULATION ENGINE WITH AUTO LAYOUT ====================

export function calculateQuotation(input) {
  const validationErrors = validateInput(input);
  if (validationErrors.length > 0) {
    throw new Error(`Input validation failed: ${validationErrors.join(', ')}`);
  }

  const suitableLayouts = findSuitableLayouts({
    width: input.width,
    height: input.height,
    gusset: input.gusset
  });

  if (suitableLayouts.length === 0) {
    throw new Error("No suitable layout found for the given dimensions. Please adjust the bag size.");
  }

  const layoutCalculations = suitableLayouts.map((layoutInfo) =>
    calculateForLayout({ ...input, layout: layoutInfo.layout }, layoutInfo.layout)
  );

  let finalResult;
  if (layoutCalculations.length === 1) {
    finalResult = layoutCalculations[0];
  } else {
    const avgCosts = {};
    const costKeys = Object.keys(layoutCalculations[0].costs);

    for (const key of costKeys) {
      avgCosts[key] = Number(
        (layoutCalculations.reduce((sum, calc) => sum + calc.costs[key], 0) / layoutCalculations.length).toFixed(2)
      );
    }

    const avgTotalCost = Number(
      (layoutCalculations.reduce((sum, calc) => sum + calc.summary.totalCost, 0) / layoutCalculations.length).toFixed(2)
    );
    const avgUnitCost = Number(
      (layoutCalculations.reduce((sum, calc) => sum + calc.summary.unitCost, 0) / layoutCalculations.length).toFixed(4)
    );
    const avgUnitSellingPrice = Number(
      (layoutCalculations.reduce((sum, calc) => sum + calc.summary.unitSellingPrice, 0) / layoutCalculations.length).toFixed(4)
    );
    const avgTotalSellingPrice = Number(
      (layoutCalculations.reduce((sum, calc) => sum + calc.summary.totalSellingPrice, 0) / layoutCalculations.length).toFixed(2)
    );

    finalResult = {
      layout: "AUTO_SELECTED_AVERAGE",
      sheetSize: {
        width: "Multiple",
        height: "Multiple",
        details: layoutCalculations.map((calc) => ({
          layout: calc.layout,
          sheetSize: calc.sheetSize
        }))
      },
      bagsPerSheet: "Multiple",
      sheetsNeeded: "Multiple",
      costs: avgCosts,
      summary: {
        totalCost: avgTotalCost,
        unitCost: avgUnitCost,
        unitSellingPrice: avgUnitSellingPrice,
        totalSellingPrice: avgTotalSellingPrice
      },
      allLayouts: layoutCalculations
    };
  }

  const marginIndex = Number(input.marginIndex || 0.63);

  return {
    input: {
      dimensions: { width: input.width, height: input.height, gusset: input.gusset },
      paper: input.paperName,
      printing: input.printingOption,
      quantity: Number(input.quantity),
      finishing: {
        varnish: input.varnish || "None",
        lamination: input.lamination || "None",
        spotUV: input.spotUV || false,
        stamping: input.stamping || false,
        embossing: input.embossing || false,
        textureEmbossing: input.textureEmbossing || false,
        dieCut: input.dieCut || false,
        dcMoulding: input.dcMoulding || "None"
      }
    },
    layoutSelection: {
      suitableLayouts: suitableLayouts.map((l) => l.layout),
      selectedLayout: finalResult.layout,
      allLayoutDetails: suitableLayouts
    },
    calculations: finalResult,
    summary: {
      ...finalResult.summary,
      marginIndex
    },
    validation: {
      layout: { valid: true, suitableCount: suitableLayouts.length },
      input: { valid: true, errors: [] }
    }
  };
}

// ==================== HELPER EXPORTS ====================

export function getPaperTypes() {
  return paperTypes.map((p) => ({ name: p.name, gsm: p.gsm, pricePerKg: p.pricePerKg }));
}

export function getPrintingOptions() {
  return Object.keys(printingConfigs).map((key) => ({
    name: key,
    processColors: printingConfigs[key].processColors,
    spotColors: printingConfigs[key].spotColors
  }));
}

export function getMarginIndices() {
  return [0.63, 0.675, 0.7, 0.72, 0.74, 0.75, 0.775, 0.8, 0.82, 0.84, 0.86, 0.88, 0.89, 0.9];
}

export function validateQuotationInput(input) {
  return validateInput(input);
}

// CommonJS support
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateQuotation,
    getPaperTypes,
    getPrintingOptions,
    getMarginIndices,
    validateQuotationInput
  };
}
