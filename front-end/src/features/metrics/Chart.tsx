import React, { useEffect, useRef } from 'react';
import ChartJS from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import {
  fetchCPUAverageAsync,
  selectLatestCPUAverage,
} from './metricsSlice';
import { useAppSelector, useAppDispatch } from '../../app/hooks';

export function Chart() {
  const dataPoint = useAppSelector(selectLatestCPUAverage);
  const dispatch = useAppDispatch();

  // use a ref to store the chart instance since it it mutable
  const chartRef = useRef<ChartJS | null>(null);

  React.useEffect(() => {
    setInterval(() => dispatch(fetchCPUAverageAsync()), 1000)
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
              label: 'CPU Average',
              data: [],
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
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
              min: Date.now(),
              time: {
                unit: 'second',
              },
            },
            y: {
              type: 'logarithmic',
              min: 0,
              max: 1,
            }
          }
        }
      });
    }
  };

  // effect to update the chart when props are updated
  useEffect(() => {
    // must verify that the chart exists
    if (chartRef.current && dataPoint) {
      chartRef.current.data.datasets[0].data.push({
        x: dataPoint.timestamp,
        y: dataPoint.avg,
      });
      chartRef.current.update();
    }
  }, [dataPoint]);


  return <canvas ref={canvasCallback}></canvas>;
}
