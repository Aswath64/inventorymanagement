/**
 * Masks email addresses for privacy in UI
 * Example: "john.doe@example.com" -> "j***e@example.com"
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return 'N/A';
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email; // Invalid email format, return as-is
  
  // If local part is very short, just show first char
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  
  // Show first char, mask middle, show last char
  const masked = `${localPart[0]}***${localPart[localPart.length - 1]}`;
  return `${masked}@${domain}`;
};

/**
 * Gets display name from email (fallback)
 */
export const getDisplayNameFromEmail = (email) => {
  if (!email) return 'User';
  const localPart = email.split('@')[0];
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
};

