interface CPUAverage {
  timestamp: number,
  cpusAvg: number[],
  loadAverage: number,
}

export function fetchCPUAverage(): Promise<CPUAverage> {
  return fetch(process.env.REACT_APP_API_CPU_LOAD_URL as string)
    .then(response => response.json())
}
