// Simple HTML sanitizer that removes dangerous tags and attributes
export const sanitizeHtml = (html: string): string => {
  // List of dangerous tags to remove
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'option', 'button'];
  
  // List of dangerous attributes to remove
  const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'onchange', 'onsubmit'];

  let sanitized = html;

  // Remove dangerous tags and their content
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis');
    sanitized = sanitized.replace(regex, '');
    // Also remove self-closing versions
    const selfClosingRegex = new RegExp(`<${tag}[^>]*/>`, 'gis');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });

  // Remove dangerous attributes
  dangerousAttributes.forEach(attr => {
    // Remove attributes with double quotes
    const regex = new RegExp(`\\s${attr}\\s*=\\s*"[^"]*"`, 'gis');
    sanitized = sanitized.replace(regex, '');
    // Remove attributes with single quotes
    const singleQuoteRegex = new RegExp(`\\s${attr}\\s*=\\s*'[^']*'`, 'gis');
    sanitized = sanitized.replace(singleQuoteRegex, '');
    // Remove attributes without quotes
    const noQuoteRegex = new RegExp(`\\s${attr}\\s*=\\s*[^\\s>]*`, 'gis');
    sanitized = sanitized.replace(noQuoteRegex, '');
  });

  // Remove any remaining dangerous protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');

  return sanitized;
};
