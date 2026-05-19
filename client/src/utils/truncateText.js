/**
 * Truncates text to a specified length and adds ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length of the text
 * @returns {string} - Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

/**
 * Truncates text based on number of lines
 * Used for multi-line text truncation
 * @param {string} text - The text to truncate
 * @param {number} maxLines - Maximum number of lines
 * @param {number} charsPerLine - Approximate characters per line
 * @returns {string} - Truncated text with ellipsis if needed
 */
export const truncateByLines = (text, maxLines = 2, charsPerLine = 50) => {
  if (!text) return "";
  const maxChars = maxLines * charsPerLine;
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars).trim() + "...";
};

/**
 * Creates a CSS class for text truncation with ellipsis
 * Can be used with className prop in JSX
 * @param {number} lines - Number of lines to show (1 for single line, 2+ for multi-line)
 * @returns {string} - CSS class name
 */
export const getTruncateClass = (lines = 1) => {
  if (lines === 1) {
    return "truncate-single-line";
  }
  return `truncate-${lines}-lines`;
};
