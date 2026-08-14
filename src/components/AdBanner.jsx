import React from 'react';

// AdBanner disabled — returns null so UI spots that used to render ads keep layout but show nothing.
// Keeping the export for compatibility so existing imports don't break.
const AdBanner = ({ slot = '', format = 'auto', style = {} }) => null;

export default AdBanner;
