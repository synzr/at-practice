export function getFilterOptions() {
  return JSON.parse(
    sessionStorage.getItem("options")
  );
}
