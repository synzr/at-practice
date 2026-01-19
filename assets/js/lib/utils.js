/**
 * Get filter options from session storage
 * @returns {Object} Filter options
 */
export function getFilterOptions() {
  return JSON.parse(
    sessionStorage.getItem("options")
  );
}
