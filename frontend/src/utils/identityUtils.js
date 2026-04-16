
/**
 * Safely formats a doctor's name to ensure it has exactly one "Dr. " prefix.
 * Prevents "Dr. Dr. Name" issues.
 */
export const formatDoctorName = (name) => {
  if (!name) return "";
  let cleanedName = name.trim();
  
  // Remove existing "Dr." or "Dr" prefix (case insensitive, with or without dot/space)
  // Pattern: starts with "dr" followed by optional ".", then optional space
  const drPattern = /^dr\.?\s*/i;
  
  if (drPattern.test(cleanedName)) {
    // If it already has it, we strip the existing one and re-apply consistently
    // this handles "dr.shoaib" -> "Dr. shoaib"
    // and "Dr. Dr. Shoaib" -> "Dr. Dr. Shoaib" (wait, we want one)
    
    // Better regex to strip ALL leading "Dr." variants
    while (drPattern.test(cleanedName)) {
      cleanedName = cleanedName.replace(drPattern, "");
    }
  }
  
  return `Dr. ${cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1)}`;
};
