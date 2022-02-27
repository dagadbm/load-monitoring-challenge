interface CPUAverage {
  timestamp: number,
  cpusAvg: number[],
  loadAverage: number,
}

export function fetchCPUAverage(): Promise<CPUAverage> {
  return new Promise(async (resolve, reject) => {
    const response = await fetch(process.env.REACT_APP_API_CPU_LOAD_URL as string);
    const data = await response.json()
    if (response.status < 200 || response.status >= 300) {
      return reject(data)
    }
    return resolve(data)
  });
}
