// QuotationForm.jsx
import React, { useState } from "react";
import { calculateQuotation, getPaperTypes, getPrintingOptions, getMarginIndices } from "../quotation";
import Bag3DVisualization from "./Bag3DVisualization"; // adjust path if needed


// Company branding
const COMPANY_BRANDING = {
  name: "MLM PACKAGING Sdn Bhd",
  logo: "/logo.png",
  tagline: "Quotation System"
};

// Foil types for stamping (values must match quotation.js foilRates keys)
const FOIL_TYPES = [
  { label: "Gold Foil", value: "gold" },
  { label: "Silver Foil", value: "silver" },
  { label: "Matte Gold Foil", value: "matt_gold" },
  { label: "Matte Silver Foil", value: "matt_silver" },
  { label: "Copper Foil", value: "copper" },
  { label: "Black Foil", value: "black" },
  { label: "Red Foil", value: "red" },
  { label: "Blue Foil", value: "blue" },
  { label: "Green Foil", value: "green" },
  { label: "Maroon Foil", value: "maroon" },
  { label: "White Foil", value: "white" },
  { label: "Rainbow Foil", value: "rainbow" },
  { label: "Holographic Foil", value: "hologram" },
  { label: "Special Foil", value: "special" }
];

// Embossing types (UI labels)
const EMBOSSING_TYPES = [
  "Standard Embossing",
  "Deep Embossing",
  "Multi-level Embossing",
  "Debossing",
  "3D"
];

// Texture types (engine expects lowercase)
const TEXTURE_TYPES = ["standard", "custom"];

// Helper functions for visualization
function getBagsPerSheet(layout) {
  switch (layout) {
    case "1X1Y": return 1;
    case "0.5X2Y": return 1;
    case "0.5X1Y": return 0.5;
    case "1X2Y": return 2;
    default: return 1;
  }
}

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

function validateLayout({ sheetWidth, sheetHeight, layout }) {
  const sw = sheetWidth;
  const sh = sheetHeight;

  const ok1x1 = sw >= 0.533 && sw <= 1.025 && sh >= 0.318 && sh <= 0.698;
  const ok05x2y = sw >= 0.318 && sw <= 0.698 && sh >= 0.533 && sh <= 1.025;
  const ok05x1y = (sw >= 0.318 && sw <= 0.698 && sh >= 0.533 && sh <= 1.025) ||
                  (sw >= 0.533 && sw <= 1.025 && sh >= 0.318 && sh <= 0.698);
  const ok1x2y = (sw >= 0.3 && sw <= 0.698 && sh >= 0.42 && sh <= 1.025) ||
                 (sw >= 0.42 && sw <= 1.025 && sh >= 0.3 && sh <= 0.698);

  switch (layout) {
    case "1X1Y": return ok1x1 ? { valid: true } : { valid: false, error: "1X1Y layout out of range" };
    case "0.5X2Y": return ok05x2y ? { valid: true } : { valid: false, error: "0.5X2Y layout out of range" };
    case "0.5X1Y": return ok05x1y ? { valid: true } : { valid: false, error: "0.5X1Y layout out of range" };
    case "1X2Y": return ok1x2y ? { valid: true } : { valid: false, error: "1X2Y layout out of range" };
    default: return { valid: true };
  }
}

// Normalize UI fields to engine schema and keys
function normalizeFormToEngine(form) {
  // Emboss type normalization
  let embossTypeNormalized = "Standard";
  const t = form.embossingType?.toLowerCase();
  if (t === "3d" || t?.includes("deep") || t?.includes("multi")) {
    embossTypeNormalized = "3D";
  } else if (t?.includes("deboss")) {
    // Treat debossing at standard rate unless you have separate rates
    embossTypeNormalized = "Standard";
  }

  // Texture type normalization to lowercase
  const textureTypeNormalized = form.textureType?.toLowerCase() === "custom" ? "custom" : "standard";

  // DC moulding normalization to booleans used by engine
  const newMould = form.dcMoulding === "New";
  const existingMould = form.dcMoulding === "Old";

  // Stamping/emboss sizes as "H x W" strings where applicable
  const stampingSize = form.stamping ? `${form.stampingHeight}x${form.stampingWidth}` : null;
  const embossSize = form.embossing ? `${form.embossingHeight}x${form.embossingWidth}` : null;

  return {
    width: Number(form.width),
    height: Number(form.height),
    gusset: Number(form.gusset),
    quantity: Number(form.quantity),

    paperName: form.paperName,
    printingOption: form.printingOption,
    inkType: form.inkType,
    marginIndex: Number(form.marginIndex),

    varnish: form.varnish,
    lamination: form.lamination,

    spotUV: !!form.spotUV,
    stamping: !!form.stamping,
    embossing: !!form.embossing,
    textureEmbossing: !!form.textureEmbossing,
    dieCut: !!form.dieCut,

    foilType: form.foilType, // must match engine keys
    stampingSize,

    embossed: !!form.embossing,
    embossSize,
    embossType: embossTypeNormalized,

    textureEmboss: !!form.textureEmbossing,
    textureType: textureTypeNormalized,

    newMould,
    existingMould,

    handles: !!form.handles,
    reinforcementBoard: !!form.reinforcementBoard,
    convertingLabor: !!form.convertingLabor,
    packaging: !!form.packaging,
    mockUp: !!form.mockUp
  };
}

// SIMPLE 2D Bag Visualization Component
const Bag2DVisualization = ({ form }) => {
  // Simple dimensions in mm
  const width = form.width;
  const height = form.height;
  const gusset = form.gusset;
  
  // Paper type styling
  const paperType = form.paperName.toLowerCase();
  const isBrownKraft = paperType.includes('kraft') && paperType.includes('brown');
  const isWhiteKraft = paperType.includes('kraft') && paperType.includes('white');
  
  // Choose paper color
  let paperColor = 'bg-gray-100';
  if (isBrownKraft) {
    paperColor = 'bg-amber-800';
  } else if (isWhiteKraft) {
    paperColor = 'bg-gray-50';
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-700">Paper Bag Preview</h4>
        <div className="text-sm text-gray-500">
          Scale: 1:10
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
        
        {/* Simple 2D Bag Representation */}
        <div className="flex flex-col items-center justify-center space-y-6">
          
          {/* Top View - Shows width and gusset */}
          <div className="w-full max-w-md">
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2 text-center">Top View (Open Top)</h5>
              <div className="relative h-32">
                {/* Main bag area */}
                <div className={`absolute inset-0 ${paperColor} border-2 border-gray-400 rounded-lg flex items-center justify-center`}>
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center rounded-full bg-white/80">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">Printing Area</span>
                  </div>
                </div>
                
                {/* Dimensions */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-lg border border-red-200 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs font-semibold text-gray-700">Width: {width}mm</span>
                  </div>
                </div>
                
                <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                  <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-lg border border-yellow-200 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-xs font-semibold text-gray-700">Gusset: {gusset}mm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Side View - Shows height */}
          <div className="w-full max-w-md">
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2 text-center">Side View</h5>
              <div className="relative h-48">
                {/* Bag side representation */}
                <div className={`absolute left-1/2 transform -translate-x-1/2 w-48 ${paperColor} border-2 border-gray-400 rounded-t-lg`} style={{ height: `${Math.min(height * 0.3, 120)}px` }}>
                  {/* Bag details */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {/* Top opening */}
                    <div className="absolute -top-3 left-0 right-0">
                      <div className="mx-auto bg-gradient-to-b from-gray-300 to-gray-400 w-32 h-3 rounded-t-lg border-t border-x border-gray-500"></div>
                    </div>
                    
                    {/* Handles if selected */}
                    {form.handles && (
                      <div className="absolute -top-6 left-1/4 right-1/4 flex justify-between">
                        <div className="w-8 h-3 bg-gray-600 rounded-full"></div>
                        <div className="w-8 h-3 bg-gray-600 rounded-full"></div>
                      </div>
                    )}
                    
                    {/* Bottom reinforcement */}
                    <div className="absolute -bottom-3 left-0 right-0 bg-gradient-to-r from-gray-500 to-gray-600 h-3 rounded-b-lg border-b border-gray-700"></div>
                  </div>
                </div>
                
                {/* Height indicator */}
                <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
                  <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-lg border border-green-200 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-semibold text-gray-700">Height: {height}mm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Simple Technical Drawing */}
          <div className="w-full max-w-md border-t border-gray-200 pt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3 text-center">Technical Specifications</h5>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-lg border border-gray-300 text-center">
                <div className="text-xs text-gray-500 mb-1">Width</div>
                <div className="text-lg font-bold text-red-600">{width}mm</div>
                <div className="mt-1 h-1 w-12 mx-auto bg-gradient-to-r from-red-400 to-red-300 rounded-full"></div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-gray-300 text-center">
                <div className="text-xs text-gray-500 mb-1">Height</div>
                <div className="text-lg font-bold text-green-600">{height}mm</div>
                <div className="mt-1 h-1 w-12 mx-auto bg-gradient-to-r from-green-400 to-green-300 rounded-full"></div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-gray-300 text-center">
                <div className="text-xs text-gray-500 mb-1">Gusset</div>
                <div className="text-lg font-bold text-yellow-600">{gusset}mm</div>
                <div className="mt-1 h-1 w-12 mx-auto bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full"></div>
              </div>
            </div>
            
            {/* Paper type */}
            <div className="mt-4 bg-white p-3 rounded-lg border border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Paper Type</div>
                  <div className="text-sm font-medium text-gray-800">{form.paperName}</div>
                </div>
                <div className={`w-10 h-10 rounded-lg ${paperColor} border border-gray-400`}></div>
              </div>
            </div>
          </div>
          
          {/* Features Summary */}
          {(
            form.handles || 
            form.spotUV || 
            form.stamping || 
            form.embossing || 
            form.textureEmbossing || 
            form.dieCut
          ) && (
            <div className="w-full max-w-md border-t border-gray-200 pt-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3 text-center">Additional Features</h5>
              <div className="flex flex-wrap gap-2 justify-center">
                {form.handles && (
                  <div className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-xs font-medium">Handles</span>
                  </div>
                )}
                
                {form.spotUV && (
                  <div className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-xs font-medium">Spot UV</span>
                  </div>
                )}
                
                {form.stamping && (
                  <div className="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium">Foil Stamping</span>
                  </div>
                )}
                
                {form.embossing && (
                  <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-xs font-medium">Embossing</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Bag Usage Example */}
          <div className="w-full max-w-md border-t border-gray-200 pt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3 text-center">Typical Usage</h5>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white rounded-lg border border-gray-300">
                <svg className="w-6 h-6 mx-auto text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <div className="text-xs text-gray-600">Shopping</div>
              </div>
              
              <div className="p-2 bg-white rounded-lg border border-gray-300">
                <svg className="w-6 h-6 mx-auto text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-gray-600">Gift Wrapping</div>
              </div>
              
              <div className="p-2 bg-white rounded-lg border border-gray-300">
                <svg className="w-6 h-6 mx-auto text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div className="text-xs text-gray-600">Branding</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Capacity Estimation - Helpful for customers */}
        <div className="mt-6 bg-white p-4 rounded-lg border border-gray-300">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Estimated Capacity</h5>
          <div className="text-xs text-gray-600 space-y-2">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
              <span>Volume: ~{(width * height * gusset / 1000000).toFixed(1)} liters</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span>Can hold standard A4 documents or small gifts</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
              <span>Strength: Suitable for up to 5kg weight</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function QuotationForm(props) {
  const paperTypes = getPaperTypes();
  const printingOptions = getPrintingOptions();
  const marginIndices = getMarginIndices();

  // Demo images for paper types
  const paperImages = {
    "Art Card 190": "https://www.techmelife.com/wp-content/uploads/2021/07/Art-Paper.jpg",
    "Brown Kraft 100": "https://www.decor-essentials.com/wp-content/uploads/2020/12/23091-1.jpg",
    "Brown Kraft 120": "https://www.decor-essentials.com/wp-content/uploads/2020/12/23091-1.jpg",
    "Brown Kraft 140": "https://www.decor-essentials.com/wp-content/uploads/2020/12/23091-1.jpg",
    "Brown Kraft 170": "https://www.decor-essentials.com/wp-content/uploads/2020/12/23091-1.jpg",
    "White Kraft 100": "https://tse1.mm.bing.net/th/id/OIP.B7x2qkUDmKrKOYb2-QLTNQHaLI?rs=1&pid=ImgDetMain&o=7&rm=3",
    "White Kraft 120": "https://tse1.mm.bing.net/th/id/OIP.B7x2qkUDmKrKOYb2-QLTNQHaLI?rs=1&pid=ImgDetMain&o=7&rm=3",
    "White Kraft 150": "https://tse1.mm.bing.net/th/id/OIP.B7x2qkUDmKrKOYb2-QLTNQHaLI?rs=1&pid=ImgDetMain&o=7&rm=3",
    "White Kraft 180": "https://tse1.mm.bing.net/th/id/OIP.B7x2qkUDmKrKOYb2-QLTNQHaLI?rs=1&pid=ImgDetMain&o=7&rm=3",
    "Art Paper 157": "https://www.techmelife.com/wp-content/uploads/2021/07/Art-Paper.jpg",
    "Art Card 210": "https://www.techmelife.com/wp-content/uploads/2021/07/Art-Paper.jpg",
    "Art Card 230": "https://www.techmelife.com/wp-content/uploads/2021/07/Art-Paper.jpg",
    "Sack Kraft 100": "https://tse4.mm.bing.net/th/id/OIP.de08dUnV1roLjp15o4QdKwHaHz?w=552&h=582&rs=1&pid=ImgDetMain&o=7&rm=3"
  };

  const costLabels = {
    P1: "Paper Cost",
    P2: "Printing Cost",
    P3: "Plate Cost",
    P4: "Ink Cost",
    P5: "Varnish Cost",
    P6: "Lamination Cost",
    P7: "Spot UV Cost",
    P8: "Stamping Cost",
    P9: "Embossing Cost",
    P10: "Texture Embossing",
    P11: "Die Cut Cost",
    P12: "DC Moulding Cost",
    P13: "Handles Cost",
    P14: "Reinforcement Board",
    P15: "Converting Labor",
    P16: "Packaging Cost",
    P17: "Logistics Cost",
    P18: "Mock Up Cost"
  };

  // Main form state
  const [form, setForm] = useState({
    width: 150,
    height: 300,
    gusset: 100,
    quantity: 1000,

    paperName: "Art Card 190",
    printingOption: "process 4c x 0c",
    inkType: "normal",
    marginIndex: 0.63,

    varnish: "None",
    lamination: "None",

    spotUV: false,
    stamping: false,
    embossing: false,
    textureEmbossing: false,
    dieCut: false,

    foilType: "gold",
    stampingHeight: 50,
    stampingWidth: 50,

    embossingHeight: 50,
    embossingWidth: 50,
    embossingType: "Standard Embossing",

    textureType: "standard",

    dcMoulding: "None",

    handles: false,
    reinforcementBoard: false,
    convertingLabor: false,
    packaging: false,
    mockUp: false
  });

  // Result and UI states
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [zoomImage, setZoomImage] = useState(null);

  const API_BASE = "http://localhost:3001/api";

  const saveQuotation = async (quotationData, status = "draft") => {
    const token = localStorage.getItem("token");
    const completeData = {
      form,
      result: quotationData,
      summary: quotationData.summary,
      input: quotationData.input,
      layoutSelection: quotationData.layoutSelection
    };

    const response = await fetch(`${API_BASE}/quotations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ quotation_data: completeData, status })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to save quotation");
    return data;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = [];
    if (!form.width || form.width < 50 || form.width > 1000) errors.push("Width must be between 50mm and 1000mm");
    if (!form.height || form.height < 50 || form.height > 1000) errors.push("Height must be between 50mm and 1000mm");
    if (form.gusset < 0 || form.gusset > 500) errors.push("Gusset must be between 0mm and 500mm");
    if (!form.quantity || form.quantity < 100 || form.quantity > 1000000) errors.push("Quantity must be between 100 and 1,000,000 pieces");
    return errors;
  };

  const isInputValid = (name, value) => {
    switch (name) {
      case "width": return value >= 50 && value <= 1000;
      case "height": return value >= 50 && value <= 1000;
      case "gusset": return value >= 0 && value <= 500;
      case "quantity": return value >= 100 && value <= 1000000;
      default: return true;
    }
  };

  const handleCalculate = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length) {
      setError(validationErrors.join(", "));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const processedForm = normalizeFormToEngine(form);
      const output = calculateQuotation(processedForm);
      setResult(output);
    } catch (err) {
      setError(err.message || "An error occurred during calculation");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      width: 150,
      height: 300,
      gusset: 100,
      quantity: 1000,
      paperName: "Art Card 190",
      printingOption: "process 4c x 0c",
      inkType: "normal",
      marginIndex: 0.63,
      varnish: "None",
      lamination: "None",
      spotUV: false,
      stamping: false,
      embossing: false,
      textureEmbossing: false,
      dieCut: false,
      foilType: "gold",
      stampingHeight: 50,
      stampingWidth: 50,
      embossingHeight: 50,
      embossingWidth: 50,
      embossingType: "Standard Embossing",
      textureType: "standard",
      dcMoulding: "None",
      handles: false,
      reinforcementBoard: false,
      convertingLabor: false,
      packaging: false,
      mockUp: false
    });
    setResult(null);
    setError(null);
  };

  const openZoom = (paperName) => setZoomImage({ src: paperImages[paperName], name: paperName });
  const closeZoom = () => setZoomImage(null);

  // Function to get suitable layouts for visualization
  const getSuitableLayouts = () => {
    const layouts = ["1X1Y", "0.5X2Y", "0.5X1Y", "1X2Y"];
    const suitableLayouts = [];

    for (const layout of layouts) {
      const { sheetWidth, sheetHeight } = calcSheetSize({ 
        width: form.width, 
        height: form.height, 
        gusset: form.gusset, 
        layout: layout 
      });
      const validation = validateLayout({ sheetWidth, sheetHeight, layout });

      if (validation.valid) {
        suitableLayouts.push({ 
          layout, 
          sheetWidth, 
          sheetHeight,
          bagsPerSheet: getBagsPerSheet(layout)
        });
      }
    }

    return suitableLayouts;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        const suitableLayouts = getSuitableLayouts();
        
        return (
          <div className="space-y-6">
            {/* Dimensions Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Dimensions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Height (mm) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="height"
                      value={form.height}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        form.height && !isInputValid('width', form.height) ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      min="50"
                      max="1000"
                    />
                    {form.height && !isInputValid('height', form.height) && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">50mm - 1000mm</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Width (mm) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="width"
                      value={form.width}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        form.width && !isInputValid('width', form.width) ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      min="50"
                      max="1000"
                    />
                    {form.width && !isInputValid('height', form.width) && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">50mm - 1000mm</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Gusset (mm) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="gusset"
                      value={form.gusset}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        form.gusset && !isInputValid('gusset', form.gusset) ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      min="0"
                      max="500"
                    />
                    {form.gusset && !isInputValid('gusset', form.gusset) && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">⚠️</div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">0mm - 500mm</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Quantity *</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        form.quantity && !isInputValid('quantity', form.quantity) ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      min="100"
                      max="1000000"
                    />
                    {form.quantity && !isInputValid('quantity', form.quantity) && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">⚠️</div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">100 - 1,000,000 pcs</p>
                </div>
              </div>
            </div>

            {/* BAG VISUALIZATION SECTION */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Paper Bag Visualization
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Bag Visualization */}
<div className="space-y-4">
  <Bag3DVisualization form={form} />
</div>

                
                {/* Layout Preview Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-700">Production Layouts</h4>
                    <span className="text-xs text-gray-500">
                      {suitableLayouts.length} efficient layout{suitableLayouts.length !== 1 ? 's' : ''} available
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {suitableLayouts.map((layoutData, index) => {
                        const { layout, sheetWidth, sheetHeight, bagsPerSheet } = layoutData;
                        const sheetsNeeded = Math.ceil(form.quantity / bagsPerSheet);
                        const materialEfficiency = ((bagsPerSheet / (sheetWidth * sheetHeight)) * 100).toFixed(0);
                        
                        return (
                          <div 
                            key={index}
                            className="bg-white p-4 rounded-lg border border-gray-300 hover:border-blue-400 transition-colors"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-bold text-gray-800">{layout}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                bagsPerSheet > 1 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {bagsPerSheet} bag{bagsPerSheet > 1 ? 's' : ''}/sheet
                              </span>
                            </div>
                            
                            <div className="space-y-2 text-xs text-gray-600">
                              <div className="flex justify-between">
                                <span>Sheet Size:</span>
                                <span className="font-medium">{(sheetWidth * 1000).toFixed(0)}mm × {(sheetHeight * 1000).toFixed(0)}mm</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Sheets Needed:</span>
                                <span className="font-medium">{sheetsNeeded.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Material Efficiency:</span>
                                <span className="font-medium text-green-600">{materialEfficiency}%</span>
                              </div>
                            </div>
                            
                            {/* Simple visual indicator */}
                            <div className="mt-4">
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                                  style={{ width: `${Math.min(materialEfficiency, 100)}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Less Waste</span>
                                <span>More Waste</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {suitableLayouts.length === 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-sm text-yellow-800 font-medium">No suitable layouts found</p>
                            <p className="text-xs text-yellow-700 mt-1">
                              Your dimensions don't fit standard sheet sizes. Please adjust width, height, or gusset to match common paper sheet dimensions.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-start">
                        <svg className="w-4 h-4 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-xs text-blue-800">
                            <span className="font-medium">Note:</span> The system automatically selects the most cost-effective layout based on material usage and production efficiency.
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            Higher efficiency means less paper waste and lower costs.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Material & Printing Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Material & Printing
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Paper Type *</label>
                    <div className="relative">
                      <select
                        name="paperName"
                        value={form.paperName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400 appearance-none"
                      >
                        {paperTypes.map((paper) => (
                          <option key={paper.name} value={paper.name}>
                            {paper.name} (RM{paper.pricePerKg}/kg)
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className="relative group cursor-pointer" onClick={() => openZoom(form.paperName)}>
                        <img
                          src={paperImages[form.paperName]}
                          alt={form.paperName}
                          className="w-20 h-20 rounded-lg object-cover border border-gray-300 transition-all duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                          <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Zoom
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{form.paperName}</p>
                        <p className="text-sm text-gray-600">
                          {paperTypes.find((p) => p.name === form.paperName)?.pricePerKg
                            ? `RM${paperTypes.find((p) => p.name === form.paperName).pricePerKg}/kg`
                            : "Select a paper type"}
                        </p>
                        <button onClick={() => openZoom(form.paperName)} className="text-sm text-blue-600 hover:text-blue-800 mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          View larger image
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Printing Option *</label>
                    <select
                      name="printingOption"
                      value={form.printingOption}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                    >
                      {printingOptions.map((option) => (
                        <option key={option.name} value={option.name}>
                          {option.name} ({option.processColors}P{option.spotColors}S)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Ink Type</label>
                      <select
                        name="inkType"
                        value={form.inkType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                      >
                        <option value="normal">Normal Ink (RM60/kg)</option>
                        <option value="metallic">Metallic Ink (RM150/kg)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Margin Index</label>
                      <select
                        name="marginIndex"
                        value={form.marginIndex}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                      >
                        {marginIndices.map((index) => (
                          <option key={index} value={index}>
                            {index} ({(1 - index) * 100}% margin)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "finishing":
        return (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Coating & Lamination
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Varnish</label>
                  <select
                    name="varnish"
                    value={form.varnish}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                  >
                    <option value="None">No Varnish</option>
                    <option value="OPV">OPV Varnish</option>
                    <option value="Waterbase">Waterbase Varnish</option>
                  </select>
                  <p className="text-xs text-gray-500">Adds protective coating</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Lamination</label>
                  <select
                    name="lamination"
                    value={form.lamination}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                  >
                    <option value="None">No Lamination</option>
                    <option value="Gloss">Gloss Lamination</option>
                    <option value="Matt">Matt Lamination</option>
                  </select>
                  <p className="text-xs text-gray-500">Adds durability and finish</p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Special Effects
              </h3>

              <div className="space-y-6">
                <div className={`p-6 border-2 rounded-xl transition-all duration-200 ${form.stamping ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-6 h-6 border-2 rounded mr-3 flex items-center justify-center cursor-pointer transition-all duration-200 ${form.stamping ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}
                      onClick={() => setForm((prev) => ({ ...prev, stamping: !prev.stamping }))}
                    >
                      {form.stamping && <span className="text-white text-sm">✓</span>}
                    </div>
                    <span
                      className="font-semibold flex items-center cursor-pointer"
                      onClick={() => setForm((prev) => ({ ...prev, stamping: !prev.stamping }))}
                    >
                      <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Stamping (Hot Foil)
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 pl-9 mb-4">Foil stamping for metallic effects</p>

                  {form.stamping && (
                    <div className="ml-9 space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Foil Type</label>
                        <select
                          name="foilType"
                          value={form.foilType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        >
                          {FOIL_TYPES.map((foil) => (
                            <option key={foil.value} value={foil.value}>{foil.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Stamping Size (mm)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm text-gray-600">Height (mm)</label>
                            <input
                              type="number"
                              name="stampingHeight"
                              value={form.stampingHeight}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              min="10"
                              max="500"
                              step="1"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm text-gray-600">Width (mm)</label>
                            <input
                              type="number"
                              name="stampingWidth"
                              value={form.stampingWidth}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              min="10"
                              max="500"
                              step="1"
                            />
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-700 font-medium">
                            Stamping Area: <span className="font-bold">{form.stampingHeight}mm × {form.stampingWidth}mm</span>
                          </p>
                          <p className="text-xs text-blue-600 mt-1">Adjust height and width as needed</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`p-6 border-2 rounded-xl transition-all duration-200 ${form.embossing ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-6 h-6 border-2 rounded mr-3 flex items-center justify-center cursor-pointer transition-all duration-200 ${form.embossing ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}
                      onClick={() => setForm((prev) => ({ ...prev, embossing: !prev.embossing }))}
                    >
                      {form.embossing && <span className="text-white text-sm">✓</span>}
                    </div>
                    <span
                      className="font-semibold flex items-center cursor-pointer"
                      onClick={() => setForm((prev) => ({ ...prev, embossing: !prev.embossing }))}
                    >
                      <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Embossing & Debossing
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 pl-9 mb-4">Raised or depressed pattern effect</p>

                  {form.embossing && (
                    <div className="ml-9 space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Embossing Type</label>
                        <select
                          name="embossingType"
                          value={form.embossingType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        >
                          {EMBOSSING_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Embossing Size (mm)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm text-gray-600">Height (mm)</label>
                            <input
                              type="number"
                              name="embossingHeight"
                              value={form.embossingHeight}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              min="10"
                              max="500"
                              step="1"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm text-gray-600">Width (mm)</label>
                            <input
                              type="number"
                              name="embossingWidth"
                              value={form.embossingWidth}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              min="10"
                              max="500"
                              step="1"
                            />
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-700 font-medium">
                            Embossing Area: <span className="font-bold">{form.embossingHeight}mm × {form.embossingWidth}mm</span>
                          </p>
                          <p className="text-xs text-blue-600 mt-1">Adjust height and width as needed</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`p-6 border-2 rounded-xl transition-all duration-200 ${form.textureEmbossing ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-6 h-6 border-2 rounded mr-3 flex items-center justify-center cursor-pointer transition-all duration-200 ${form.textureEmbossing ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}
                      onClick={() => setForm((prev) => ({ ...prev, textureEmbossing: !prev.textureEmbossing }))}
                    >
                      {form.textureEmbossing && <span className="text-white text-sm">✓</span>}
                    </div>
                    <span
                      className="font-semibold flex items-center cursor-pointer"
                      onClick={() => setForm((prev) => ({ ...prev, textureEmbossing: !prev.textureEmbossing }))}
                    >
                      <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      Texture Embossing
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 pl-9 mb-4">Textured pattern embossing</p>

                  {form.textureEmbossing && (
                    <div className="ml-9 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Texture Type</label>
                        <select
                          name="textureType"
                          value={form.textureType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        >
                          {TEXTURE_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type === "standard" ? "Standard Texture" : "Custom Texture"}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <label className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${form.spotUV ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center mb-2">
                      <input type="checkbox" name="spotUV" checked={form.spotUV} onChange={handleChange} className="hidden" />
                      <div className={`w-6 h-6 border-2 rounded mr-3 flex items-center justify-center transition-all duration-200 ${form.spotUV ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                        {form.spotUV && <span className="text-white text-sm">✓</span>}
                      </div>
                      <span className="font-semibold flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Spot UV
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 pl-9">Adds glossy finish to specific areas</p>
                  </label>

                  <label className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${form.dieCut ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center mb-2">
                      <input type="checkbox" name="dieCut" checked={form.dieCut} onChange={handleChange} className="hidden" />
                      <div className={`w-6 h-6 border-2 rounded mr-3 flex items-center justify-center transition-all duration-200 ${form.dieCut ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                        {form.dieCut && <span className="text-white text-sm">✓</span>}
                      </div>
                      <span className="font-semibold flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                        </svg>
                        Die Cut
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 pl-9">Custom shape cutting</p>
                  </label>

                  <div className="space-y-2">
                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${form.handles ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="checkbox" name="handles" checked={form.handles} onChange={handleChange} className="hidden" />
                      <div className={`w-6 h-6 border-2 rounded mr-3 flex items-center justify-center transition-all duration-200 ${form.handles ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                        {form.handles && <span className="text-white text-sm">✓</span>}
                      </div>
                      <span className="font-semibold">Handles</span>
                    </label>

                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${form.reinforcementBoard ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="checkbox" name="reinforcementBoard" checked={form.reinforcementBoard} onChange={handleChange} className="hidden" />
                      <div className={`w-6 h-6 border-2 rounded mr-3 flex items-center justify-center transition-all duration-200 ${form.reinforcementBoard ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                        {form.reinforcementBoard && <span className="text-white text-sm">✓</span>}
                      </div>
                      <span className="font-semibold">Reinforcement Board</span>
                    </label>

                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${form.convertingLabor ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="checkbox" name="convertingLabor" checked={form.convertingLabor} onChange={handleChange} className="hidden" />
                      <div className={`w-6 h-6 border-2 rounded mr-3 flex items-center justify-center transition-all duration-200 ${form.convertingLabor ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                        {form.convertingLabor && <span className="text-white text-sm">✓</span>}
                      </div>
                      <span className="font-semibold">Converting Labor</span>
                    </label>

                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${form.packaging ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="checkbox" name="packaging" checked={form.packaging} onChange={handleChange} className="hidden" />
                      <div className={`w-6 h-6 border-2 rounded mr-3 flex items-center justify-center transition-all duration-200 ${form.packaging ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                        {form.packaging && <span className="text-white text-sm">✓</span>}
                      </div>
                      <span className="font-semibold">Packaging</span>
                    </label>

                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${form.mockUp ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="checkbox" name="mockUp" checked={form.mockUp} onChange={handleChange} className="hidden" />
                      <div className={`w-6 h-6 border-2 rounded mr-3 flex items-center justify-center transition-all duration-200 ${form.mockUp ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                        {form.mockUp && <span className="text-white text-sm">✓</span>}
                      </div>
                      <span className="font-semibold">Mock Up</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Moulding
              </h3>

              <div className="max-w-md">
                <label className="block text-sm font-semibold text-gray-700 mb-2">DC Moulding</label>
                <select
                  name="dcMoulding"
                  value={form.dcMoulding}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                >
                  <option value="None">No Moulding</option>
                  <option value="New">New Mould (Additional Cost)</option>
                  <option value="Old">Existing Mould (No Additional Cost)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">Select "New" if a new cutting mould is required for custom shapes</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quotation Calculator</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Calculate printing costs for custom packaging solutions</p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-2 border-white/60">

            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <img src={COMPANY_BRANDING.logo} alt={`${COMPANY_BRANDING.name} logo`} className="h-12 w-12 object-contain" />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{COMPANY_BRANDING.name}</h1>
                    <p className="text-gray-600 text-sm">{COMPANY_BRANDING.tagline}</p>
                  </div>
                </div>

                <div className="text-right">
                  <h2 className="text-2xl font-bold text-blue-600">QUOTATION</h2>
                  <p className="text-gray-600 text-sm">Prepared for: {props.user?.company_name}</p>
                  <p className="text-gray-500 text-xs">{props.user?.contact_person}</p>
                </div>
              </div>
            </div>

            {/* Main Form Content */}
            <div className="p-4 md:p-6 lg:p-8">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab("basic")}
                  className={`flex-1 px-4 py-3 font-medium text-sm rounded-t-lg transition-all duration-200 flex items-center justify-center ${
                    activeTab === "basic" ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:text-blue-500 hover:bg-blue-50"
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Basic Specifications
                </button>
                <button
                  onClick={() => setActiveTab("finishing")}
                  className={`flex-1 px-4 py-3 font-medium text-sm rounded-t-lg transition-all duration-200 flex items-center justify-center ${
                    activeTab === "finishing" ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:text-blue-500 hover:bg-blue-50"
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Finishing Options
                </button>
              </div>

              {/* Tab Content */}
              <div className="transition-all duration-300 ease-in-out">
                {renderTabContent()}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCalculate}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-5m-3 5h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Calculate Quotation
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="sm:w-auto px-6 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset All
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-gradient-to-r from-red-50 via-orange-50 to-red-50 border-2 border-red-200 rounded-xl shadow-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Calculation Error</h3>
                      <div className="mt-1 text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Section */}
            {result && (
              <div className="border-t border-gray-200">
                <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-blue-50">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Quotation Results</h2>
                    <p className="text-gray-600">Your detailed cost breakdown</p>
                  </div>

                  {/* Layout Selection */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl mb-6 border-2 border-blue-200/60">
                    <div className="flex items-center mb-4">
                      <div className="w-2 h-6 bg-blue-500 rounded-full mr-3"></div>
                      <h3 className="text-lg font-bold text-gray-800">Auto Layout Selection</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Suitable Layouts</p>
                        <p className="font-semibold text-gray-800">
                          {result?.layoutSelection?.suitableLayouts?.join(", ") || "None"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Selected Layout</p>
                        <p className="font-semibold text-blue-600">
                          {result?.layoutSelection?.selectedLayout || "Not selected"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Layout Count</p>
                        <p className="font-semibold text-gray-800">
                          {result?.layoutSelection?.suitableLayouts?.length || 0} suitable
                        </p>
                      </div>
                    </div>
                    {result?.layoutSelection?.selectedLayout === "AUTO_SELECTED_AVERAGE" && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">
                          <span className="font-semibold">Auto-Fit Note:</span> Multiple layouts were suitable. Costs have been automatically averaged across all valid layouts for optimal pricing.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border-2 border-green-200/60">
                      <div className="flex items-center mb-4">
                        <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
                        <h3 className="text-lg font-bold text-gray-800">Cost Summary</h3>
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: "Total Cost", value: result?.summary?.totalCost || 0, format: "currency" },
                          { label: "Unit Cost", value: result?.summary?.unitCost || 0, format: "small-currency" },
                          { label: "Unit Selling Price", value: result?.summary?.unitSellingPrice || 0, format: "small-currency" },
                          { label: "Total Selling Price", value: result?.summary?.totalSellingPrice || 0, format: "currency" },
                          { label: "Margin", value: (1 - (result?.summary?.marginIndex || 0)) * 100, format: "percent" }
                        ].map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <span className="text-gray-600 text-sm">{item.label}</span>
                            <span className={`font-bold text-sm ${
                              item.label.includes('Selling') ? 'text-green-600' :
                              item.label.includes('Margin') ? 'text-blue-600' : 'text-gray-800'
                            }`}>
                              {item.format === 'currency' && `RM ${item.value.toLocaleString()}`}
                              {item.format === 'small-currency' && `RM ${item.value.toFixed(4)}`}
                              {item.format === 'percent' && `${item.value.toFixed(1)}%`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border-2 border-purple-200/60">
                      <div className="flex items-center mb-4">
                        <div className="w-2 h-6 bg-purple-500 rounded-full mr-3"></div>
                        <h3 className="text-lg font-bold text-gray-800">Specifications</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 text-sm">Dimensions</span>
                          <span className="font-semibold text-gray-800 text-sm">
                            {result?.input?.dimensions?.width || 0}mm × {result?.input?.dimensions?.height || 0}mm
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 text-sm">Gusset</span>
                          <span className="font-semibold text-gray-800 text-sm">
                            {result?.input?.dimensions?.gusset || 0}mm
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 text-sm">Paper</span>
                          <span className="font-semibold text-gray-800 text-sm">{result?.input?.paper || "Not specified"}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 text-sm">Printing</span>
                          <span className="font-semibold text-gray-800 text-sm">{result?.input?.printing || "Not specified"}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 text-sm">Quantity</span>
                          <span className="font-semibold text-gray-800 text-sm">{result?.input?.quantity?.toLocaleString() || 0} pcs</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border-2 border-orange-200/60">
                      <div className="flex items-center mb-4">
                        <div className="w-2 h-6 bg-orange-500 rounded-full mr-3"></div>
                        <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
                      </div>
                      <div className="space-y-3">
                        <button
                          onClick={async () => {
                            try {
                              const saveResult = await saveQuotation(result, 'draft');
                              alert('Quotation saved as draft! Reference: ' + saveResult.quotation.quotation_number);
                            } catch (error) {
                              alert('Error saving quotation: ' + error.message);
                            }
                          }}
                          className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-md font-medium transition-colors text-sm flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          Save as Draft
                        </button>

                        <button
                          onClick={async () => {
                            try {
                              const saveResult = await saveQuotation(result, 'submitted');
                              alert('Quotation submitted to sales team! Reference: ' + saveResult.quotation.quotation_number);
                            } catch (error) {
                              alert('Error submitting quotation: ' + error.message);
                            }
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors text-sm flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Submit to Sales
                        </button>

                        {props.onBack && (
                          <button
                            onClick={props.onBack}
                            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 px-4 rounded-md font-medium text-sm transition-colors flex items-center justify-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl mb-6 border-2 border-gray-200/60">
                    <div className="flex items-center mb-4">
                      <div className="w-2 h-6 bg-orange-500 rounded-full mr-3"></div>
                      <h3 className="text-lg font-bold text-gray-800">Cost Breakdown</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {result?.calculations?.costs ? (
                        Object.entries(result.calculations.costs).map(([key, value]) => (
                          <div key={key} className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
                            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide leading-tight">
                              {costLabels[key] || key}
                            </div>
                            <div className="text-sm font-bold text-blue-600">
                              RM {typeof value === 'number' ? value.toLocaleString() : value}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center p-4 text-gray-500">
                          No cost breakdown available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Layout Comparisons */}
                  {result?.calculations?.allLayouts && result.calculations.allLayouts.length > 1 && (
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
                      <div className="flex items-center mb-4">
                        <div className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></div>
                        <h3 className="text-lg font-bold text-gray-800">Layout Comparisons</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {result.calculations.allLayouts.map((layoutCalc, index) => (
                          <div key={index} className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-lg border border-indigo-100 hover:border-indigo-300 transition-all duration-200">
                            <h4 className="font-bold text-indigo-700 mb-2 text-center">{layoutCalc.layout}</h4>
                            <div className="space-y-2 text-sm text-gray-600 mb-3">
                              <div className="flex justify-between">
                                <span>Sheet Size:</span>
                                <span className="font-semibold">{layoutCalc.sheetSize?.width}m × {layoutCalc.sheetSize?.height}m</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Bags/Sheet:</span>
                                <span className="font-semibold">{layoutCalc.bagsPerSheet}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Sheets Needed:</span>
                                <span className="font-semibold">{Math.ceil(layoutCalc.sheetsNeeded || 0).toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="pt-3 border-t border-indigo-100 text-center">
                              <p className="text-lg font-bold text-indigo-600">RM {layoutCalc.summary?.unitCost?.toFixed(4) || "0.0000"}</p>
                              <p className="text-xs text-gray-500">Unit Cost</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paper Image Zoom Modal */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-white/60 shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{zoomImage.name}</h3>
                <button
                  onClick={closeZoom}
                  className="text-gray-400 hover:text-gray-600 text-2xl bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="flex justify-center">
                <img src={zoomImage.src} alt={zoomImage.name} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
              </div>
              <div className="flex justify-center mt-4">
                <button
                  onClick={closeZoom}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}