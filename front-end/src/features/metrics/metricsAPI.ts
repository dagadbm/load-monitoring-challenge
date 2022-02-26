export async function fetchCPUAverage() {
  const data = await fetch(process.env.REACT_APP_API_CPU_LOAD_URL as string)
  .then(response => response.json());
  return data;
}
