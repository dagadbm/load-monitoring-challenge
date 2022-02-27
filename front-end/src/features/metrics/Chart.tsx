import React, { useEffect, useRef } from 'react';
import ChartJS from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import {
  poolCPUAverageAsync,
  fetchCPUAverageAsync,
  selectCPUAverage,
} from './metricsSlice';
import { useAppSelector, useAppDispatch } from '../../app/hooks';


export function Chart() {
  const dataPoints = useAppSelector(selectCPUAverage);
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
                unit: 'minute',
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
    if (chartRef.current) {
      chartRef.current.data.datasets[0].data = dataPoints;
      chartRef.current.update();
    }
  }, [dataPoints]);


  return <canvas ref={canvasCallback}></canvas>;
}
