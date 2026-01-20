/**
 * @returns {Object} Объект с параметрами фильтрации
 */
export function getFilterOptions() {
  return JSON.parse(
    sessionStorage.getItem("options")
  );
}
