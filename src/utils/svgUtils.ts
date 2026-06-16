// SVG Utility Functions for detecting, rendering, and handling SVG content

/**
 * Check if a string contains SVG content
 */
export const isSvgContent = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false;
  
  const trimmed = content.trim();
  
  // Check for SVG data URL
  if (trimmed.startsWith('data:image/svg+xml')) return true;
  
  // Check for raw SVG content
  if (trimmed.startsWith('<svg') || trimmed.startsWith('<?xml')) return true;
  
  // Check for SVG within the content
  if (trimmed.includes('<svg') && trimmed.includes('</svg>')) return true;
  
  return false;
};

/**
 * Check if content is an SVG data URL
 */
export const isSvgDataUrl = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false;
  return content.trim().startsWith('data:image/svg+xml');
};

/**
 * Check if content is raw SVG markup
 */
export const isRawSvg = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false;
  const trimmed = content.trim();
  return (trimmed.startsWith('<svg') || trimmed.startsWith('<?xml')) && trimmed.includes('</svg>');
};

/**
 * Convert raw SVG to a data URL for use in img src
 */
export const svgToDataUrl = (svgContent: string): string => {
  if (isSvgDataUrl(svgContent)) return svgContent;
  
  // Ensure we have proper SVG content
  if (!isRawSvg(svgContent)) {
    console.warn('svgToDataUrl: Content is not valid SVG');
    return '';
  }
  
  // Encode the SVG content
  const encoded = encodeURIComponent(svgContent)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
    
  return `data:image/svg+xml,${encoded}`;
};

/**
 * Convert SVG data URL to raw SVG markup
 */
export const dataUrlToSvg = (dataUrl: string): string => {
  if (!isSvgDataUrl(dataUrl)) {
    console.warn('dataUrlToSvg: Content is not an SVG data URL');
    return dataUrl;
  }
  
  // Handle base64 encoded SVGs
  if (dataUrl.includes('base64,')) {
    const base64 = dataUrl.split('base64,')[1];
    return atob(base64);
  }
  
  // Handle URL-encoded SVGs
  const encoded = dataUrl.replace(/^data:image\/svg\+xml,/, '');
  return decodeURIComponent(encoded);
};

/**
 * Sanitize SVG content for safe rendering
 * Removes potentially dangerous elements like scripts
 */
export const sanitizeSvg = (svgContent: string): string => {
  if (!svgContent) return '';
  
  // Create a temporary DOM element to parse and sanitize
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  
  // Check for parsing errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    console.warn('SVG parsing error:', parserError.textContent);
    return '';
  }
  
  const svg = doc.querySelector('svg');
  if (!svg) return '';

  // Remove dangerous elements entirely
  svg.querySelectorAll('script, foreignObject, foreignobject, iframe, object, embed, link, meta, style').forEach((el) => el.remove());

  // Strip event handlers and unsafe URL attributes
  const HREF_ATTRS = ['href', 'xlink:href'];
  const URL_ATTRS = ['src', 'data', 'formaction', 'action'];
  const isUnsafeUrl = (v: string | null) => {
    if (!v) return false;
    const s = v.trim().toLowerCase();
    return s.startsWith('javascript:') || s.startsWith('data:text/html') || s.startsWith('vbscript:');
  };

  const allElements = [svg, ...Array.from(svg.querySelectorAll('*'))];
  allElements.forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
        return;
      }
      if (HREF_ATTRS.includes(name)) {
        const v = attr.value || '';
        const s = v.trim().toLowerCase();
        // Allow only same-document fragment refs (#id), data:image/*, http(s), or relative paths
        const ok =
          s.startsWith('#') ||
          s.startsWith('data:image/') ||
          s.startsWith('http://') ||
          s.startsWith('https://') ||
          (!s.includes(':') && !isUnsafeUrl(v));
        if (!ok) el.removeAttribute(attr.name);
        return;
      }
      if (URL_ATTRS.includes(name) && isUnsafeUrl(attr.value)) {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  // Serialize back to string
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svg);
};

/**
 * Get dimensions from SVG content
 */
export const getSvgDimensions = (svgContent: string): { width: number; height: number } | null => {
  if (!svgContent) return null;
  
  let rawSvg = svgContent;
  if (isSvgDataUrl(svgContent)) {
    rawSvg = dataUrlToSvg(svgContent);
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  
  if (!svg) return null;
  
  // Try to get explicit width/height
  const width = svg.getAttribute('width');
  const height = svg.getAttribute('height');
  
  if (width && height) {
    return {
      width: parseFloat(width),
      height: parseFloat(height),
    };
  }
  
  // Try viewBox
  const viewBox = svg.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/);
    if (parts.length >= 4) {
      return {
        width: parseFloat(parts[2]),
        height: parseFloat(parts[3]),
      };
    }
  }
  
  return null;
};

/**
 * Prepare SVG for display - returns a safe data URL
 */
export const prepareSvgForDisplay = (content: string): string => {
  if (isSvgDataUrl(content)) {
    // If it's already a data URL, sanitize the underlying SVG
    const rawSvg = dataUrlToSvg(content);
    const sanitized = sanitizeSvg(rawSvg);
    return svgToDataUrl(sanitized);
  }
  
  if (isRawSvg(content)) {
    const sanitized = sanitizeSvg(content);
    return svgToDataUrl(sanitized);
  }
  
  return content;
};

/**
 * Check if content is any type of image (including SVG)
 */
export const isImageContent = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false;
  
  // Check for image data URLs
  if (content.startsWith('data:image/')) return true;
  
  // Check for blob URLs
  if (content.startsWith('blob:')) return true;
  
  // Check for raw SVG
  if (isRawSvg(content)) return true;
  
  return false;
};

/**
 * Get the appropriate src for an img element
 * Handles both regular images and SVGs
 */
export const getImageSrc = (content: string): string => {
  if (!content) return '';
  
  // If it's a raw SVG, convert to data URL
  if (isRawSvg(content)) {
    return prepareSvgForDisplay(content);
  }
  
  // Otherwise return as-is (already a data URL or blob)
  return content;
};
