// server.js - Complete Dual Database Version
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import DBQuery helper for database operations
const DBQuery = require('./utils/db-query');

// ==================== SANITIZATION FUNCTIONS ====================
function sanitizeText(text) {
  if (typeof text !== 'string') return text || '';
  return text
    .replace(/\u0000/g, '')
    .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F]/g, '')
    .trim() || 'N/A';
}

function getSafeString(obj, path, defaultValue = '') {
  try {
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) return sanitizeText(defaultValue);
    }
    return sanitizeText(String(value || defaultValue));
  } catch (error) {
    return sanitizeText(defaultValue);
  }
}

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',  // Alternative port
    'https://itintern101-commits.github.io'  // Production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());  // Handle preflight requests

app.use(express.json({ limit: '10mb' }));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://itintern101-commits.github.io');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type', 'Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// ==================== JWT CONFIG ====================
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ==================== FIXED ADMIN DATA ====================
const FIXED_ADMINS = [
  {
    email: 'admin@company.com',
    password: 'admin123',
    name: 'System Administrator',
    role: 'super_admin'
  },
  {
    email: 'manager@company.com',
    password: 'manager123',
    name: 'Manager Admin',
    role: 'admin'
  }
];

// ==================== AUTHENTICATION MIDDLEWARE ====================
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.isAdmin) {
      const admin = await DBQuery.getOne(
        'SELECT id, email, name, role FROM admins WHERE id = ? AND is_active = TRUE',
        [decoded.adminId]
      );
      
      if (!admin) return res.status(401).json({ error: 'Admin not found' });
      
      req.admin = admin;
      req.user = { isAdmin: true, ...admin };
    } else {
      const user = await DBQuery.getOne(
        'SELECT id, email, company_name, contact_person, phone, address FROM users WHERE id = ? AND is_active = TRUE',
        [decoded.userId]
      );
      
      if (!user) return res.status(401).json({ error: 'User not found' });
      
      req.user = user;
    }
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.admin) return res.status(403).json({ error: 'Admin access required' });
  next();
};

// ==================== PDF GENERATION ====================
function generateProfessionalPDF(quotation, isAdmin = false) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        lang: 'en',
        info: {
          Title: `Quotation ${quotation.quotation_number}`,
          Author: 'MLM Packaging Sdn Bhd',
          Creator: 'Quotation System',
          Keywords: 'quotation, packaging, bag, pricing'
        }
      });
      
      const chunks = [];
      doc.on('data', chunks.push.bind(chunks));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // ========== CONSTANTS ==========
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const leftMargin = 40;
      const rightMargin = 40;
      const contentWidth = pageWidth - leftMargin - rightMargin;
      
      const colors = {
        primary: '#2c3e50',
        secondary: '#3498db',
        accent: '#e74c3c',
        success: '#27ae60',
        warning: '#f39c12',
        light: '#ecf0f1',
        dark: '#2c3e50',
        border: '#bdc3c7'
      };
      
      // ========== PARSE DATABASE DATA ==========
      let quotationData = {};
      try {
        if (quotation.quotation_data) {
          if (typeof quotation.quotation_data === 'string') {
            quotationData = JSON.parse(quotation.quotation_data);
          } else {
            quotationData = quotation.quotation_data;
          }
        }
      } catch (e) {
        console.warn('Failed to parse quotation data:', e.message);
        quotationData = {};
      }
      
      // Helper function to get values from database JSON
      const getFromQuotationData = (path, defaultValue = '') => {
        try {
          const keys = path.split('.');
          let value = quotationData;
          for (const key of keys) {
            value = value?.[key];
            if (value === undefined || value === null) return defaultValue;
          }
          return sanitizeText(String(value || defaultValue));
        } catch (error) {
          return sanitizeText(defaultValue);
        }
      };
      
      // ========== EXTRACT VALUES FROM DATABASE ==========
      // Client information
      const clientCompany = sanitizeText(isAdmin ? 
        quotation.user_company : quotation.company_name
      ) || 'N/A';
      
      const clientContactPerson = sanitizeText(isAdmin ? 
        quotation.user_contact_person : quotation.contact_person
      ) || 'N/A';
      
      const clientPhone = sanitizeText(isAdmin ? 
        quotation.user_phone : quotation.phone
      ) || 'N/A';
      
      const clientEmail = sanitizeText(isAdmin ? 
        quotation.user_email : quotation.email
      ) || 'N/A';
      
      const clientAddress = sanitizeText(isAdmin ? 
        quotation.user_address : quotation.address
      ) || 'N/A';
      
      // Product specifications
      const width = getFromQuotationData('input.dimensions.width', getFromQuotationData('width', ''));
      const height = getFromQuotationData('input.dimensions.height', getFromQuotationData('height', ''));
      const gusset = getFromQuotationData('input.dimensions.gusset', getFromQuotationData('gusset', ''));
      const paperType = getFromQuotationData('input.paper', getFromQuotationData('paperName', ''));
      const printing = getFromQuotationData('input.printing', getFromQuotationData('printingOption', ''));
      const quantity = getFromQuotationData('input.quantity', getFromQuotationData('quantity', ''));
      const handleType = getFromQuotationData('input.handleType', '');
      const bottomType = getFromQuotationData('input.bottomType', '');
      const coating = getFromQuotationData('input.coating', '');
      const color = getFromQuotationData('input.color', '');
      const thickness = getFromQuotationData('input.thickness', '');
      
      // Pricing
      const totalCost = parseFloat(getFromQuotationData('summary.totalCost', '0')) || 0;
      const unitCost = parseFloat(getFromQuotationData('summary.unitCost', '0')) || 0;
      const unitSelling = parseFloat(getFromQuotationData('summary.unitSellingPrice', '0')) || 0;
      const totalAmount = parseFloat(quotation.total_amount || '0') || 0;
      
      // ========== HEADER SECTION ==========
      try {
        const logoPath = path.join(__dirname,'logo.png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, leftMargin, 20, {
            width: 80,
            height: 60,
            fit: [80, 60]
          });
        } else {
          console.warn('Logo image not found, using fallback');
          doc.roundedRect(leftMargin, 20, 80, 60, 5)
            .fill('#3498db');
          
          doc.fillColor('#ffffff')
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('MLM', leftMargin + 15, 40);
          
          doc.fontSize(10)
            .text('LOGO', leftMargin + 20, 60);
        }
      } catch (error) {
        console.warn('Failed to load logo image:', error.message);
        doc.roundedRect(leftMargin, 20, 80, 60, 5)
          .fill('#3498db');
        
        doc.fillColor('#ffffff')
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('MLM', leftMargin + 15, 40);
        
        doc.fontSize(10)
          .text('LOGO', leftMargin + 20, 60);
      }
      
      const companyX = leftMargin + 100;
      const companyWidth = 280;
      
      doc.fillColor(colors.primary)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('MLM PACKAGING SDN BHD', companyX, 25, {
          width: companyWidth
        });
      
      doc.fillColor('#7f8c8d')
        .fontSize(9)
        .font('Helvetica')
        .text('No. 123, Jalan Industri 3, Taman Perindustrian Puchong', companyX, 45, {
          width: companyWidth
        });
      
      doc.text('47100 Puchong, Selangor Darul Ehsan', companyX, 58, {
        width: companyWidth
      });
      
      doc.fillColor('#2c3e50')
        .fontSize(8)
        .font('Helvetica');
      
      doc.text('Tel: +603-8066 1234', companyX, 72);
      doc.text('Email: sales@mlmpackaging.com', companyX, 84);
      
      const quoteBoxWidth = 160;
      const quoteBoxX = pageWidth - quoteBoxWidth - 30;
      
      doc.roundedRect(quoteBoxX, 25, quoteBoxWidth, 60, 5)
        .fill('#ffffff')
        .stroke(colors.border);
      
      doc.fillColor(colors.accent)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('QUOTATION', quoteBoxX + 10, 40);
      
      const safeQuotationNumber = sanitizeText(quotation.quotation_number || 'N/A');
      doc.fillColor(colors.primary)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(safeQuotationNumber, quoteBoxX + 10, 55, {
          width: quoteBoxWidth - 20
        });
      
      const safeDate = new Date(quotation.created_at).toLocaleDateString('en-MY');
      doc.fillColor('#7f8c8d')
        .fontSize(8)
        .font('Helvetica')
        .text(safeDate, quoteBoxX + 10, 70, {
          width: quoteBoxWidth - 20
        });
      
      doc.y = 110;
      doc.moveTo(leftMargin, doc.y)
        .lineTo(pageWidth - rightMargin, doc.y)
        .strokeColor(colors.border)
        .lineWidth(1)
        .stroke();
      
      doc.y += 15;
      
      // ========== BILL TO SECTION ==========
      doc.fillColor(colors.primary)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('BILL TO:', leftMargin, doc.y);
      
      doc.y += 20;
      
      const clientBoxY = doc.y;
      const clientBoxHeight = 100;
      doc.roundedRect(leftMargin, clientBoxY, contentWidth, clientBoxHeight, 5)
        .fill('#ffffff')
        .stroke(colors.border);
      
      const clientContentX = leftMargin + 15;
      let clientTextY = clientBoxY + 15;
      
      doc.fillColor(colors.dark)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(clientCompany, clientContentX, clientTextY, {
          width: contentWidth - 150
        });
      
      clientTextY += 18;
      
      doc.fillColor('#34495e')
        .fontSize(9)
        .font('Helvetica');
      
      doc.text(`Contact Person: ${clientContactPerson}`, clientContentX, clientTextY, {
        width: 150
      });

      clientTextY += 15;
      
      doc.text(`Phone: ${clientPhone}`, clientContentX, clientTextY, {
        width: 150
      });
      
      clientTextY += 15;
      
      doc.text(`Email: ${clientEmail}`, clientContentX, clientTextY, {
        width: contentWidth - 30
      });
      
      clientTextY += 15;
      
      doc.text(`Address: ${clientAddress}`, clientContentX, clientTextY, {
        width: contentWidth - 30
      });
      
      const safeStatus = sanitizeText(quotation.status || 'draft');
      const statusColors = {
        'draft': '#f39c12',
        'submitted': '#3498db',
        'reviewed': '#9b59b6',
        'approved': colors.success,
        'rejected': colors.accent
      };
      
      const statusColor = statusColors[safeStatus] || colors.dark;
      const statusWidth = 80;
      const statusX = pageWidth - rightMargin - statusWidth - 15;
      const statusY = clientBoxY + 15;
      
      doc.roundedRect(statusX, statusY, statusWidth, 22, 11)
        .fill(statusColor);
      
      doc.fillColor('#ffffff')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(safeStatus.toUpperCase(), statusX + 10, statusY + 6);
      
      doc.y = clientBoxY + clientBoxHeight + 15;
      
      // ========== PRODUCT SPECIFICATIONS ==========
      const checkPageSpace = (neededHeight) => {
        return (doc.y + neededHeight) < (pageHeight - 50);
      };
      
      if (!checkPageSpace(200)) {
        doc.addPage();
        doc.y = 40;
      }
      
      doc.fillColor(colors.primary)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('PRODUCT SPECIFICATIONS', leftMargin, doc.y);
      
      doc.y += 20;
      
      const tableTop = doc.y;
      const colWidths = [120, 120, 120, 120];
      
      doc.rect(leftMargin, tableTop, contentWidth, 25)
        .fill(colors.primary);
      
      const headers = ['Description', 'Specifications', 'Material', 'Printing'];
      let xPos = leftMargin + 10;
      
      headers.forEach((header, i) => {
        doc.fillColor('#ffffff')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(header, xPos, tableTop + 9);
        xPos += colWidths[i];
      });
      
      const productWidth = width || 'N/A';
      const productHeight = height || 'N/A';
      const productGusset = gusset || 'N/A';
      const productPaperType = paperType || 'N/A';
      const productPrinting = printing || 'N/A';
      
      doc.rect(leftMargin, tableTop + 25, contentWidth, 25)
        .fill('#ffffff')
        .stroke(colors.border)
        .stroke();
      
      xPos = leftMargin + 10;
      
      doc.fillColor(colors.primary)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Custom Paper Bag', xPos, tableTop + 34, {
          width: colWidths[0] - 10
        });
      xPos += colWidths[0];
      
      doc.fillColor(colors.dark)
        .fontSize(9)
        .font('Helvetica')
        .text(`${productWidth}mm × ${productHeight}mm × ${productGusset}mm`, xPos, tableTop + 34, {
          width: colWidths[1] - 10
        });
      xPos += colWidths[1];
      
      doc.text(productPaperType, xPos, tableTop + 34, {
        width: colWidths[2] - 10
      });
      xPos += colWidths[2];
      
      doc.text(productPrinting, xPos, tableTop + 34, {
        width: colWidths[3] - 10
      });
      
      doc.y = tableTop + 60;
      
      const specifications = [
        { label: 'Quantity', value: `${quantity || 'N/A'} pieces` },
        { label: 'Handle Type', value: handleType || 'N/A' },
        { label: 'Bottom Type', value: bottomType || 'N/A' },
        { label: 'Coating', value: coating || 'N/A' },
        { label: 'Color', value: color || 'N/A' },
        { label: 'Thickness', value: thickness || 'N/A' }
      ];
      
      const specStartY = doc.y;
      const specColWidth = (contentWidth / 2) - 10;
      
      specifications.forEach((spec, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = leftMargin + (col * (specColWidth + 20));
        const y = specStartY + (row * 20);
        
        doc.fillColor('#7f8c8d')
          .fontSize(9)
          .font('Helvetica')
          .text(`${spec.label}:`, x, y);
        
        doc.fillColor(colors.dark)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(spec.value, x + 70, y);
      });
      
      doc.y = specStartY + (Math.ceil(specifications.length / 2) * 20) + 25;
      
      // ========== PRICING BREAKDOWN ==========
      if (!checkPageSpace(250)) {
        doc.addPage();
        doc.y = 40;
      }
      
      doc.fillColor(colors.primary)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('PRICING BREAKDOWN', leftMargin, doc.y);
      
      doc.y += 20;
      
      const priceTableTop = doc.y;
      const priceColWidths = [contentWidth - 130, 130];
      
      const pricingItems = [
        { description: 'Material Cost', amount: totalCost * 0.4 },
        { description: 'Printing Cost', amount: totalCost * 0.3 },
        { description: 'Production Cost', amount: totalCost * 0.2 },
        { description: 'Handling & Packaging', amount: totalCost * 0.1 },
        { description: 'Subtotal', amount: totalCost }
      ];
      
      doc.rect(leftMargin, priceTableTop, priceColWidths[0] + priceColWidths[1], 25)
        .fill(colors.light)
        .stroke(colors.border)
        .stroke();
      
      doc.fillColor(colors.primary)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('DESCRIPTION', leftMargin + 10, priceTableTop + 9);
      
      doc.text('AMOUNT (RM)', leftMargin + priceColWidths[0] + 10, priceTableTop + 9, {
        width: priceColWidths[1] - 20,
        align: 'right'
      });
      
      let currentY = priceTableTop + 25;
      
      pricingItems.forEach((item, index) => {
        const bgColor = index % 2 === 0 ? '#ffffff' : colors.light;
        
        doc.rect(leftMargin, currentY, priceColWidths[0] + priceColWidths[1], 25)
          .fill(bgColor)
          .stroke(colors.border)
          .stroke();
        
        doc.fillColor(colors.dark)
          .fontSize(9)
          .font('Helvetica')
          .text(item.description, leftMargin + 10, currentY + 9);
        
        doc.fillColor('#2c3e50')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(item.amount.toFixed(2), leftMargin + priceColWidths[0] + 10, currentY + 9, {
            width: priceColWidths[1] - 20,
            align: 'right'
          });
        
        currentY += 25;
      });
      
      currentY += 10;
      
      const unitPricing = [
        { label: 'Unit Production Cost', value: unitCost, format: '0.0000' },
        { label: 'Unit Selling Price', value: unitSelling, format: '0.0000' },
        { label: 'Quantity', value: parseFloat(quantity) || 0, format: '0' }
      ];
      
      unitPricing.forEach((item) => {
        doc.fillColor(colors.dark)
          .fontSize(9)
          .font('Helvetica')
          .text(item.label, leftMargin + 10, currentY);
        
        doc.fillColor(colors.primary)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(item.format === '0.0000' ? `RM ${item.value.toFixed(4)}` : item.value.toString(), 
                leftMargin + priceColWidths[0] + 10, currentY, {
                  width: priceColWidths[1] - 20,
                  align: 'right'
                });
        
        currentY += 15;
      });
      
      currentY += 10;
      
      doc.rect(leftMargin, currentY, priceColWidths[0] + priceColWidths[1], 40)
        .fill(colors.primary);
      
      doc.fillColor('#ffffff')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('TOTAL SELLING PRICE', leftMargin + 10, currentY + 12);
      
      doc.fillColor('#ffffff')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(`RM ${totalAmount.toFixed(2)}`, leftMargin + priceColWidths[0] + 10, currentY + 10, {
          width: priceColWidths[1] - 20,
          align: 'right'
        });
      
      currentY += 50;
      
      // ========== TERMS & CONDITIONS ==========
      if (!checkPageSpace(150)) {
        doc.addPage();
        doc.y = 40;
        currentY = doc.y;
      }
      
      doc.fillColor(colors.primary)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('TERMS & CONDITIONS', leftMargin, currentY);
      
      currentY += 25;
      
      const terms = [
        '1. Prices are valid for 30 days from the date of this quotation.',
        '2. Minimum order quantity: 1,000 pieces.',
        '3. Lead time: 14-21 working days after confirmation.',
        '4. Payment: 50% deposit upon confirmation, 50% before delivery.',
        '5. Delivery: FOB Factory (Puchong, Selangor).',
        '6. Quality: Standard industry quality with ±5% tolerance.'
      ];
      
      doc.fillColor('#7f8c8d')
        .fontSize(9)
        .font('Helvetica');
      
      terms.forEach((term) => {
        doc.text(term, leftMargin, currentY, {
          width: contentWidth
        });
        currentY += 18;
      });
      
      currentY += 20;
      
      // ========== FOOTER ==========
      const thankYouLineHeight = 12;
      const generatedLineHeight = 15;
      const computerGeneratedLineHeight = 12;
      const totalFooterHeight = thankYouLineHeight + generatedLineHeight + computerGeneratedLineHeight + 25;
      
      if (doc.y + totalFooterHeight > pageHeight - 40) {
        doc.addPage();
        doc.y = 40;
      }
      
      doc.moveTo(leftMargin, doc.y)
        .lineTo(pageWidth - rightMargin, doc.y)
        .strokeColor(colors.border)
        .lineWidth(0.5)
        .stroke();
      
      doc.y += 10;
      
      doc.fillColor('#95a5a6')
        .fontSize(9)
        .font('Helvetica');
      
      doc.text('Thank you for your business!', leftMargin, doc.y);
      
      const generatedDate = new Date().toLocaleDateString('en-MY');
      doc.text(`Generated on ${generatedDate}`, 
              leftMargin, doc.y, {
                width: contentWidth,
                align: 'right'
              });
      
      doc.y += 15;
      
      doc.text('This is a computer-generated document. No signature required.', 
              leftMargin, doc.y, {
                width: contentWidth,
                align: 'center'
              });
      
      doc.end();
      
    } catch (error) {
      console.error('PDF generation error:', error);
      reject(error);
    }
  });
}

// ==================== TEXT QUOTATION FUNCTION ====================
function generateTextQuotation(quotation, isAdmin = false) {
  const data = quotation.quotation_data || {};
  const companyInfo = isAdmin ? quotation.user_company : quotation.company_name;
  const contactPerson = isAdmin ? quotation.user_contact_person : quotation.contact_person;
  
  const getValue = (path, defaultValue = 'N/A') => {
    const keys = path.split('.');
    let value = data;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) return defaultValue;
    }
    return value || defaultValue;
  };

  return `
MLM PACKAGING SDN BHD
No. 123, Jalan Industri 3, Taman Perindustrian Puchong
47100 Puchong, Selangor Darul Ehsan
📞 +603-8066 1234 | 📧 sales@mlmpackaging.com | 🌐 www.mlmpackaging.com
${'='.repeat(80)}

QUOTATION: ${quotation.quotation_number}
Date: ${new Date(quotation.created_at).toLocaleDateString('en-MY')}
Status: ${quotation.status.toUpperCase()}

CLIENT INFORMATION:
${'-'.repeat(20)}
Company: ${companyInfo}
Contact Person: ${contactPerson}
Email: ${isAdmin ? quotation.user_email : quotation.email}
Phone: ${isAdmin ? quotation.user_phone : quotation.phone || 'Not provided'}
Address: ${isAdmin ? quotation.user_address : quotation.address || 'Not provided'}

PRODUCT SPECIFICATIONS:
${'-'.repeat(20)}
Bag Type: Custom Paper Bag
Dimensions: ${getValue('input.dimensions.width', getValue('width', 'N/A'))}mm × ${getValue('input.dimensions.height', getValue('height', 'N/A'))}mm
Gusset: ${getValue('input.dimensions.gusset', getValue('gusset', 'N/A'))}mm
Material: ${getValue('input.paper', getValue('paperName', 'Standard Paper'))}
Printing: ${getValue('input.printing', getValue('printingOption', 'None'))}
Quantity: ${getValue('input.quantity', getValue('quantity', 'N/A'))} pieces
Handle Type: ${getValue('input.handleType', 'Standard Handle')}
Bottom Type: ${getValue('input.bottomType', 'Flat Bottom')}

PRICING BREAKDOWN:
${'-'.repeat(20)}
Material Cost: RM ${(parseFloat(getValue('summary.totalCost', 0)) * 0.4).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
Printing Cost: RM ${(parseFloat(getValue('summary.totalCost', 0)) * 0.3).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
Production Cost: RM ${(parseFloat(getValue('summary.totalCost', 0)) * 0.2).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
Handling & Packaging: RM ${(parseFloat(getValue('summary.totalCost', 0)) * 0.1).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
Subtotal: RM ${parseFloat(getValue('summary.totalCost', 0)).toLocaleString('en-MY', { minimumFractionDigits: 2 })}

Unit Production Cost: RM ${parseFloat(getValue('summary.unitCost', 0)).toFixed(4)}
Unit Selling Price: RM ${parseFloat(getValue('summary.unitSellingPrice', 0)).toFixed(4)}

TOTAL SELLING PRICE: RM ${parseFloat(quotation.total_amount || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}

TERMS & CONDITIONS:
${'-'.repeat(20)}
1. Prices valid for 30 days
2. Minimum order: 1,000 pieces
3. Lead time: 14-21 working days
4. Payment: 50% deposit, 50% before delivery
5. Delivery: FOB Factory

${'='.repeat(80)}
Generated: ${new Date().toLocaleString('en-MY')}
${isAdmin ? '--- ADMIN COPY ---' : ''}
`.trim();
}

// ==================== DEBUG & FALLBACK ROUTES ====================

// GET /api/login - for debugging direct browser access
app.get('/api/login', (req, res) => {
  console.log('🔍 GET request to /api/login');
  res.status(200).json({
    message: 'Login API Endpoint',
    instructions: 'This endpoint requires POST method for authentication',
    example: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { 
        email: 'user@example.com', 
        password: 'password123', 
        rememberMe: false 
      }
    },
    curl: 'curl -X POST https://mlmbackend.vercel.app/api/login -H "Content-Type: application/json" -d \'{"email":"test@test.com","password":"test123"}\'',
    availableEndpoints: [
      { method: 'POST', path: '/api/login', description: 'User login' },
      { method: 'POST', path: '/api/register', description: 'User registration' },
      { method: 'POST', path: '/api/admin/login', description: 'Admin login' },
      { method: 'GET', path: '/api/health', description: 'Health check' }
    ]
  });
});

// GET /api/register - for debugging
app.get('/api/register', (req, res) => {
  res.status(200).json({
    message: 'Register API Endpoint',
    method: 'POST',
    requiredFields: ['email', 'password', 'company_name', 'contact_person'],
    optionalFields: ['phone', 'address']
  });
});

// ==================== AUTHENTICATION ROUTES ====================
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, company_name, contact_person, phone, address } = req.body;

    if (!email || !password || !company_name || !contact_person) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await DBQuery.getOne(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    
    // Insert new user
    const result = await DBQuery.insert(
      `INSERT INTO users (email, password_hash, company_name, contact_person, phone, address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, password_hash, company_name, contact_person, phone, address]
    );

    // Get the inserted user ID
    const insertId = result.insertId || result.id;
    
    // Get the new user
    const newUser = await DBQuery.getOne(
      'SELECT id, email, company_name, contact_person, phone, address FROM users WHERE id = ?',
      [insertId]
    );

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await DBQuery.getOne(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const expiresIn = rememberMe ? '30d' : '24h';
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn }
    );

    res.json({
      message: 'Login successful',
      token,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        company_name: user.company_name,
        contact_person: user.contact_person,
        phone: user.phone,
        address: user.address
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await DBQuery.getOne(
      'SELECT * FROM admins WHERE email = ? AND is_active = TRUE',
      [email]
    );

    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Update last login
    await DBQuery.update(
      'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [admin.id]
    );

    const expiresIn = rememberMe ? '30d' : '24h';
    
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        email: admin.email, 
        role: admin.role,
        isAdmin: true 
      }, 
      JWT_SECRET,
      { expiresIn }
    );

    res.json({
      message: 'Admin login successful',
      token,
      expiresIn,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isAdmin: true
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PROFILE ROUTES ====================
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await DBQuery.getOne(
      'SELECT id, email, company_name, contact_person, phone, address, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { company_name, contact_person, phone, address } = req.body;

    if (!company_name || !contact_person) {
      return res.status(400).json({ error: 'Company name and contact person are required' });
    }

    const affectedRows = await DBQuery.update(
      `UPDATE users 
      SET company_name = ?, contact_person = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?`,
      [company_name, contact_person, phone, address, req.user.id]
    );

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await DBQuery.getOne(
      'SELECT id, email, company_name, contact_person, phone, address, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/profile', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const admin = await DBQuery.getOne(
      'SELECT id, email, name, role, last_login, created_at FROM admins WHERE id = ?',
      [req.admin.id]
    );

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ user: admin });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== QUOTATION ROUTES ====================
app.post('/api/quotations', authenticateToken, async (req, res) => {
  try {
    const { quotation_data, status = 'draft' } = req.body;
    
    if (!quotation_data) {
      return res.status(400).json({ error: 'Quotation data is required' });
    }

    const quotation_number = 'QT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    const result = await DBQuery.insert(
      `INSERT INTO quotations (user_id, quotation_data, quotation_number, status, total_amount) 
      VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        JSON.stringify(quotation_data),
        quotation_number,
        status,
        quotation_data.summary?.totalSellingPrice || 0
      ]
    );

    const insertId = result.insertId || result.id;

    res.status(201).json({
      message: 'Quotation saved successfully',
      quotation: {
        id: insertId,
        quotation_number,
        status,
        total_amount: quotation_data.summary?.totalSellingPrice || 0
      }
    });

  } catch (error) {
    console.error('Save quotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/quotations', authenticateToken, async (req, res) => {
  try {
    const quotations = await DBQuery.getAll(
      `SELECT id, quotation_number, status, total_amount, created_at, updated_at, quotation_data
      FROM quotations 
      WHERE user_id = ? 
      ORDER BY created_at DESC`,
      [req.user.id]
    );

    const quotationsWithParsedData = quotations.map(quotation => ({
      ...quotation,
      quotation_data: quotation.quotation_data ? JSON.parse(quotation.quotation_data) : {}
    }));

    res.json({ quotations: quotationsWithParsedData });

  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/quotations/:id', authenticateToken, async (req, res) => {
  try {
    const quotationId = req.params.id;

    const quotation = await DBQuery.getOne(
      `SELECT id, quotation_number, status, total_amount, created_at, updated_at, quotation_data
      FROM quotations 
      WHERE id = ? AND user_id = ?`,
      [quotationId, req.user.id]
    );

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    quotation.quotation_data = quotation.quotation_data ? JSON.parse(quotation.quotation_data) : {};

    res.json({ quotation });

  } catch (error) {
    console.error('Get quotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PDF ROUTES ====================
app.get('/api/quotations/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const quotationId = req.params.id;

    const quotation = await DBQuery.getOne(
      `SELECT 
        q.*,
        u.company_name,
        u.contact_person,
        u.email,
        u.phone,
        u.address
      FROM quotations q
      LEFT JOIN users u ON q.user_id = u.id
      WHERE q.id = ? AND q.user_id = ?`,
      [quotationId, req.user.id]
    );

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    quotation.quotation_data = quotation.quotation_data ? JSON.parse(quotation.quotation_data) : {};

    console.log('📊 Generating professional PDF...');
    
    const pdfBuffer = await generateProfessionalPDF(quotation, false);
    
    console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="quotation-${quotation.quotation_number}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Generate PDF error:', error.message);
    res.redirect(`/api/quotations/${req.params.id}/text`);
  }
});

app.get('/api/quotations/:id/text', authenticateToken, async (req, res) => {
  try {
    const quotationId = req.params.id;

    const quotation = await DBQuery.getOne(
      `SELECT 
        q.*,
        u.company_name,
        u.contact_person,
        u.email,
        u.phone,
        u.address
      FROM quotations q
      LEFT JOIN users u ON q.user_id = u.id
      WHERE q.id = ? AND q.user_id = ?`,
      [quotationId, req.user.id]
    );

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    quotation.quotation_data = quotation.quotation_data ? JSON.parse(quotation.quotation_data) : {};

    const textContent = generateTextQuotation(quotation, false);
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="quotation-${quotation.quotation_number}.txt"`);
    res.send(textContent);

  } catch (error) {
    console.error('Generate text error:', error);
    res.status(500).json({ error: 'Failed to generate text file' });
  }
});

// ==================== ADMIN PDF ROUTES ====================
app.get('/api/admin/quotations/:id/pdf', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const quotationId = req.params.id;

    const quotation = await DBQuery.getOne(
      `SELECT 
        q.*,
        u.company_name as user_company,
        u.contact_person as user_contact_person,
        u.email as user_email,
        u.phone as user_phone,
        u.address as user_address
      FROM quotations q
      LEFT JOIN users u ON q.user_id = u.id
      WHERE q.id = ?`,
      [quotationId]
    );

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    quotation.quotation_data = quotation.quotation_data ? JSON.parse(quotation.quotation_data) : {};

    console.log('📊 Generating admin PDF...');
    
    const pdfBuffer = await generateProfessionalPDF(quotation, true);
    
    console.log('✅ Admin PDF generated successfully');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="admin-quotation-${quotation.quotation_number}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Generate admin PDF error:', error.message);
    res.redirect(`/api/admin/quotations/${req.params.id}/text`);
  }
});

app.get('/api/admin/quotations/:id/text', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const quotationId = req.params.id;

    const quotation = await DBQuery.getOne(
      `SELECT 
        q.*,
        u.company_name as user_company,
        u.contact_person as user_contact_person,
        u.email as user_email,
        u.phone as user_phone,
        u.address as user_address
      FROM quotations q
      LEFT JOIN users u ON q.user_id = u.id
      WHERE q.id = ?`,
      [quotationId]
    );

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    quotation.quotation_data = quotation.quotation_data ? JSON.parse(quotation.quotation_data) : {};

    const textContent = generateTextQuotation(quotation, true);
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="admin-quotation-${quotation.quotation_number}.txt"`);
    res.send(textContent);

  } catch (error) {
    console.error('Generate admin text error:', error);
    res.status(500).json({ error: 'Failed to generate text file' });
  }
});

// ==================== ADMIN ROUTES ====================
app.get('/api/admin/quotations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = `
      SELECT 
        q.*,
        u.company_name as user_company,
        u.contact_person as user_contact_person,
        u.email as user_email,
        u.phone as user_phone,
        u.address as user_address
      FROM quotations q
      LEFT JOIN users u ON q.user_id = u.id
      WHERE 1=1
    `;
    
    let params = [];
    
    if (status && status !== 'all') {
      query += ' AND q.status = ?';
      params.push(status);
    }
    
    if (search) {
      query += ' AND (u.company_name LIKE ? OR q.quotation_number LIKE ? OR u.contact_person LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY q.created_at DESC';
    
    const quotations = await DBQuery.getAll(query, params);
    
    const quotationsWithParsedData = quotations.map(quotation => ({
      ...quotation,
      quotation_data: quotation.quotation_data ? JSON.parse(quotation.quotation_data) : {}
    }));

    res.json({
      quotations: quotationsWithParsedData
    });
    
  } catch (error) {
    console.error('Get all quotations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/quotations/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const quotationId = req.params.id;

    const quotation = await DBQuery.getOne(
      `SELECT 
        q.*,
        u.company_name as user_company,
        u.contact_person as user_contact_person,
        u.email as user_email,
        u.phone as user_phone,
        u.address as user_address
      FROM quotations q
      LEFT JOIN users u ON q.user_id = u.id
      WHERE q.id = ?`,
      [quotationId]
    );

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    quotation.quotation_data = quotation.quotation_data ? JSON.parse(quotation.quotation_data) : {};

    res.json({ quotation });

  } catch (error) {
    console.error('Get admin quotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/quotations/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const quotationId = req.params.id;
    const { status } = req.body;

    if (!status || !['draft', 'submitted', 'reviewed', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const affectedRows = await DBQuery.update(
      'UPDATE quotations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, quotationId]
    );

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    res.json({ 
      message: 'Quotation status updated successfully',
      status: status 
    });

  } catch (error) {
    console.error('Update quotation status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const statusCounts = await DBQuery.getAll(`
      SELECT status, COUNT(*) as count 
      FROM quotations 
      GROUP BY status
    `);

    const userCount = await DBQuery.getOne('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE');
    
    const revenueResult = await DBQuery.getOne(`
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue 
      FROM quotations 
      WHERE status IN ('submitted', 'approved')
    `);

    const stats = {
      quotations: {
        total: statusCounts.reduce((sum, item) => sum + parseInt(item.count), 0),
        byStatus: statusCounts.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {})
      },
      users: {
        total: parseInt(userCount.count)
      },
      revenue: {
        total: parseFloat(revenueResult.total_revenue) || 0
      }
    };

    res.json({ stats });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Quotation API is running',
    timestamp: new Date().toISOString()
  });
});

// ==================== ROOT ROUTE ====================
app.get('/', (req, res) => {
  res.json({
    message: 'MLM Packaging Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      login: '/api/login',
      register: '/api/register',
      quotations: '/api/quotations'
    },
    documentation: 'Add /api/ to access endpoints'
  });
});

// ==================== CATCH-ALL 404 ====================
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    available: '/api/health, /api/login, /api/register'
  });
});

// ==================== FOR VERCEL ====================
module.exports = app;

// ==================== START SERVER (LOCAL ONLY) ====================
if (require.main === module) {
  async function startServer() {
    try {
      const PORT = process.env.PORT || 3001;
      app.listen(PORT, () => {
        console.log('\n🎉 ===== QUOTATION SYSTEM STARTED =====');
        console.log('🚀 Server running on port', PORT);
        console.log('💾 Database: Dual Mode (MySQL Local + PostgreSQL Production)');
        console.log('📄 PDF Service: Professional PDFKit');
        console.log('👑 ADMIN ACCOUNTS:');
        FIXED_ADMINS.forEach(admin => {
          console.log(`   📧 ${admin.email} / 🔑 ${admin.password} (${admin.role})`);
        });
        console.log('========================================\n');
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    }
  }
  
  startServer();
}