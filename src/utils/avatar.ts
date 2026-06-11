/**
 * Generates an automatic high-quality, lightweight SVG Initials Avatar as a data URL.
 * Offers modern gradients and visual styling based on the user's name hash.
 */
export function getInitialsAvatar(name: string): string {
  const cleanName = (name || '').trim();
  if (!cleanName) {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%234f46e5"/><text x="50%" y="54%" font-family="sans-serif" font-size="36" font-weight="bold" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">V</text></svg>';
  }

  const parts = cleanName.split(/\s+/);
  const initials = parts.length > 1 
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0] ? parts[0][0].toUpperCase() : 'V';
    
  // A palette of premium, designer color gradients
  const gradients = [
    { start: '#4f46e5', end: '#6366f1', text: '#ffffff' }, // Indigo
    { start: '#0284c7', end: '#0ea5e9', text: '#ffffff' }, // Sky
    { start: '#059669', end: '#10b981', text: '#ffffff' }, // Emerald
    { start: '#d97706', end: '#f59e0b', text: '#ffffff' }, // Amber
    { start: '#db2777', end: '#ec4899', text: '#ffffff' }, // Pink
    { start: '#7c3aed', end: '#8b5cf6', text: '#ffffff' }, // Violet
    { start: '#dc2626', end: '#ef4444', text: '#ffffff' }, // Red
    { start: '#0d9488', end: '#14b8a6', text: '#ffffff' }, // Teal
    { start: '#2563eb', end: '#3b82f6', text: '#ffffff' }, // Blue
    { start: '#475569', end: '#64748b', text: '#ffffff' }, // Slate
  ];
  
  // Custom deterministic string hashing based on user's name
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % gradients.length;
  const grad = gradients[colorIndex];
  
  // Build a responsive, beautiful SVG with gradient fill & shadow-like letter contrast
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
      <defs>
        <linearGradient id="grad-${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${grad.start}" />
          <stop offset="100%" stop-color="${grad.end}" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="36" fill="url(%23grad-${colorIndex})" />
      <text 
        x="50%" 
        y="53%" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="44" 
        font-weight="800" 
        fill="${grad.text}" 
        text-anchor="middle" 
        dominant-baseline="middle"
        letter-spacing="-0.5"
      >${initials}</text>
    </svg>
  `.trim().replace(/\s+/g, ' ');
  
  // Make sure to escape specific characters properly for consistent SVG XML in image source
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
