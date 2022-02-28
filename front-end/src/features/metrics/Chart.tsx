import React, { useEffect, useRef } from 'react';
import ChartJS from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns';

import {
  poolCPUAverageAsync,
  fetchCPUAverageAsync,
  selectCPUAverage,
  selectThreshold,
} from './metricsSlice';
import { useAppSelector, useAppDispatch } from '../../app/hooks';

ChartJS.register(annotationPlugin);

export function Chart() {
  const dataPoints = useAppSelector(selectCPUAverage);
  const threshold = useAppSelector(selectThreshold);
  const dispatch = useAppDispatch();

  // use a ref to store the chart instance since it it mutable
  const chartRef = useRef<ChartJS | null>(null);

  React.useEffect(() => {
    // get the first data point
    dispatch(fetchCPUAverageAsync());
    // pool the others
    dispatch(poolCPUAverageAsync());
  }, [dispatch]);


  // callback creates the chart on the canvas element
  const canvasCallback = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) {
      return;
    }

    if (!chartRef.current) {
      chartRef.current = new ChartJS(canvas, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'CPU Load Average',
              data: dataPoints,
              borderColor: '#7EB26D',
              backgroundColor: '#7EB26D',
              tension: 0.1,
              parsing: false,
              normalized: true,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: 'timeseries',
              time: {
                unit: 'minute',
                minUnit: 'second',
                displayFormats: {
                  minute: 'HH:mm',
                },
              },
            },
            y: {
              type: 'linear',
              min: 0.1,
            },
          },
          plugins: {
            annotation: {
              annotations: {
                threshold: {
                  type: 'line',
                  value: threshold,
                  scaleID: 'y',
                  borderColor: '#BF1B00',
                  borderWidth: 2,
                },
              },
            },
          },
        },
      });
    }
  };

  // update chart data
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.data.datasets[0].data = dataPoints;
      chartRef.current.update();
    }
  }, [dataPoints]);

  // update chart threshold line
  useEffect(() => {
    // must verify that the chart exists
    if (chartRef.current) {
      const annotations = chartRef.current?.options?.plugins?.annotation?.annotations;
      if (annotations) {
        // @ts-expect-error
        annotations.threshold.value = threshold;
        chartRef.current.update();
      }
    }
  }, [threshold]);


  return <canvas ref={canvasCallback}></canvas>;
}
