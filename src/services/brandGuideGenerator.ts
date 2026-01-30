import { jsPDF } from 'jspdf';
import type { EventDetails, ColorInfo, GeneratedAsset } from '../types';
import { AssetType } from '../types';
import { sanitizeFileName } from '../utils';

interface BrandGuideOptions {
  eventDetails: EventDetails;
  colorPalette: ColorInfo[];
  slogans: string[];
  logoDataUrl?: string;
  assets: GeneratedAsset[];
}

export const generateBrandStyleGuide = async ({
  eventDetails,
  colorPalette,
  slogans,
  logoDataUrl,
  assets,
}: BrandGuideOptions): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper functions
  const addNewPage = () => {
    doc.addPage();
    y = margin;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      addNewPage();
    }
  };

  const drawSectionHeader = (title: string) => {
    checkPageBreak(60);
    doc.setFillColor(100, 126, 234); // Primary color
    doc.rect(margin, y, contentWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 15, y + 23);
    doc.setTextColor(0, 0, 0);
    y += 50;
  };

  const drawDivider = () => {
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;
  };

  // ===== COVER PAGE =====
  // Background gradient simulation
  doc.setFillColor(100, 126, 234);
  doc.rect(0, 0, pageWidth, pageHeight / 2, 'F');
  
  doc.setFillColor(118, 75, 162);
  doc.rect(0, pageHeight / 2, pageWidth, pageHeight / 2, 'F');

  // Logo if available
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', pageWidth / 2 - 60, 120, 120, 120);
    } catch (e) {
      console.warn('Could not add logo to PDF:', e);
    }
  }

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(eventDetails.name || 'Event', contentWidth);
  doc.text(titleLines, pageWidth / 2, logoDataUrl ? 280 : 200, { align: 'center' });

  // Subtitle
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text('Brand Style Guide', pageWidth / 2, logoDataUrl ? 330 : 250, { align: 'center' });

  // Event details
  doc.setFontSize(12);
  const details = [
    eventDetails.date,
    eventDetails.location,
    eventDetails.website,
  ].filter(Boolean);
  
  details.forEach((detail, i) => {
    doc.text(detail!, pageWidth / 2, (logoDataUrl ? 380 : 300) + i * 20, { align: 'center' });
  });

  // Footer
  doc.setFontSize(10);
  doc.text(`Generated ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 50, { align: 'center' });

  // ===== TABLE OF CONTENTS =====
  addNewPage();
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Table of Contents', margin, y);
  y += 40;

  const tocItems = [
    { title: 'Brand Overview', page: 3 },
    { title: 'Logo Guidelines', page: 3 },
    { title: 'Color Palette', page: 4 },
    { title: 'Typography', page: 5 },
    { title: 'Voice & Tone', page: 5 },
    { title: 'Taglines & Slogans', page: 6 },
    { title: 'Application Examples', page: 6 },
  ];

  doc.setFontSize(12);
  tocItems.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.text(item.title, margin + 20, y);
    doc.text(String(item.page), pageWidth - margin - 20, y, { align: 'right' });
    
    // Dotted line
    doc.setLineDashPattern([2, 2], 0);
    doc.setDrawColor(200, 200, 200);
    const textWidth = doc.getTextWidth(item.title);
    doc.line(margin + 25 + textWidth, y - 3, pageWidth - margin - 30, y - 3);
    doc.setLineDashPattern([], 0);
    y += 25;
  });

  // ===== BRAND OVERVIEW =====
  addNewPage();
  drawSectionHeader('Brand Overview');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const description = eventDetails.description || 
    'This brand guide establishes the visual identity standards for our event. These guidelines ensure consistent, professional representation across all materials and touchpoints.';
  
  const descLines = doc.splitTextToSize(description, contentWidth);
  doc.text(descLines, margin, y);
  y += descLines.length * 18 + 30;

  // Mission/Vision
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Mission', margin, y);
  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('To create memorable experiences that inspire, connect, and transform.', margin, y);
  y += 40;

  // ===== LOGO GUIDELINES =====
  drawSectionHeader('Logo Guidelines');

  if (logoDataUrl) {
    try {
      // Primary logo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Primary Logo', margin, y);
      y += 15;
      
      doc.addImage(logoDataUrl, 'PNG', margin, y, 120, 120);
      
      // Usage notes
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const logoNotes = [
        '• Maintain minimum clear space equal to logo height',
        '• Never stretch or distort the logo',
        '• Use only approved color variations',
        '• Minimum size: 1 inch / 72px for digital',
      ];
      logoNotes.forEach((note, i) => {
        doc.text(note, margin + 150, y + 20 + i * 18);
      });
      y += 150;
    } catch (e) {
      console.warn('Could not add logo guidelines:', e);
    }
  }

  // ===== COLOR PALETTE =====
  addNewPage();
  drawSectionHeader('Color Palette');

  if (colorPalette.length > 0) {
    const swatchSize = 80;
    const swatchesPerRow = 4;
    
    colorPalette.forEach((color, i) => {
      const row = Math.floor(i / swatchesPerRow);
      const col = i % swatchesPerRow;
      const x = margin + col * (swatchSize + 20);
      const swatchY = y + row * (swatchSize + 80);

      checkPageBreak(swatchSize + 100);

      // Color swatch
      const rgb = hexToRgb(color.hex);
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.roundedRect(x, swatchY, swatchSize, swatchSize, 8, 8, 'F');

      // Color info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(color.name || 'Color', x, swatchY + swatchSize + 15);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(color.hex.toUpperCase(), x, swatchY + swatchSize + 28);
      doc.text(color.rgb, x, swatchY + swatchSize + 40);
      doc.text(color.cmyk, x, swatchY + swatchSize + 52);
      doc.text(color.pantone, x, swatchY + swatchSize + 64);
    });

    y += Math.ceil(colorPalette.length / swatchesPerRow) * (swatchSize + 85);
  }

  // ===== TYPOGRAPHY =====
  addNewPage();
  drawSectionHeader('Typography');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Primary Font Family: Inter', margin, y);
  y += 30;

  // Font samples
  const fontSamples = [
    { weight: 'Bold', size: 24, sample: 'Headlines & Titles' },
    { weight: 'Medium', size: 16, sample: 'Subheadings' },
    { weight: 'Regular', size: 12, sample: 'Body text and descriptions' },
    { weight: 'Light', size: 10, sample: 'Captions and fine print' },
  ];

  fontSamples.forEach((sample) => {
    doc.setFontSize(sample.size);
    doc.setFont('helvetica', sample.weight.toLowerCase() === 'bold' ? 'bold' : 'normal');
    doc.text(`${sample.weight} ${sample.size}pt — ${sample.sample}`, margin, y);
    y += sample.size + 15;
  });

  y += 20;
  drawDivider();

  // ===== VOICE & TONE =====
  drawSectionHeader('Voice & Tone');

  const voiceAttributes = [
    { title: 'Professional', desc: 'Authoritative yet approachable' },
    { title: 'Innovative', desc: 'Forward-thinking and cutting-edge' },
    { title: 'Inclusive', desc: 'Welcoming to all audiences' },
    { title: 'Inspiring', desc: 'Motivating action and engagement' },
  ];

  voiceAttributes.forEach((attr) => {
    checkPageBreak(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`• ${attr.title}`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(attr.desc, margin + 120, y);
    y += 25;
  });

  // ===== TAGLINES & SLOGANS =====
  if (slogans.length > 0) {
    addNewPage();
    drawSectionHeader('Taglines & Slogans');

    doc.setFontSize(11);
    slogans.slice(0, 8).forEach((slogan, i) => {
      checkPageBreak(30);
      doc.setFont('helvetica', 'normal');
      doc.text(`${i + 1}.`, margin, y);
      doc.setFont('helvetica', 'italic');
      const sloganLines = doc.splitTextToSize(`"${slogan}"`, contentWidth - 30);
      doc.text(sloganLines, margin + 25, y);
      y += sloganLines.length * 15 + 15;
    });
  }

  // ===== APPLICATION EXAMPLES =====
  addNewPage();
  drawSectionHeader('Application Examples');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('The following asset types have been generated for this event:', margin, y);
  y += 25;

  const assetsByCategory: Record<string, string[]> = {};
  assets.forEach((asset) => {
    const category = getCategoryName(asset.type);
    if (!assetsByCategory[category]) {
      assetsByCategory[category] = [];
    }
    assetsByCategory[category].push(asset.title);
  });

  Object.entries(assetsByCategory).forEach(([category, titles]) => {
    checkPageBreak(40 + titles.length * 15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(category, margin, y);
    y += 18;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    titles.forEach((title) => {
      doc.text(`• ${title}`, margin + 15, y);
      y += 15;
    });
    y += 10;
  });

  // ===== FOOTER ON ALL PAGES =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`${eventDetails.name} Brand Style Guide`, margin, pageHeight - 30);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 30, { align: 'right' });
  }

  // Save
  doc.save(`${sanitizeFileName(eventDetails.name || 'event')}_brand_style_guide.pdf`);
};

// Helper function
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
};

const getCategoryName = (type: AssetType): string => {
  const categoryMap: Partial<Record<AssetType, string>> = {
    [AssetType.Palette]: 'Branding',
    [AssetType.Logo]: 'Branding',
    [AssetType.Slogans]: 'Branding',
    [AssetType.StyleGuide]: 'Branding',
    [AssetType.SocialPost]: 'Digital',
    [AssetType.SocialStory]: 'Digital',
    [AssetType.EmailHeader]: 'Digital',
    [AssetType.Banner]: 'Print & Signage',
    [AssetType.NameTag]: 'Print & Signage',
    [AssetType.EventSignage]: 'Print & Signage',
    [AssetType.Tshirt]: 'Merchandise',
    [AssetType.Lanyard]: 'Merchandise',
    [AssetType.SwagBag]: 'Merchandise',
    [AssetType.WifiSign]: 'Utilities',
    [AssetType.QRCode]: 'Utilities',
  };
  return categoryMap[type] || 'Other';
};
