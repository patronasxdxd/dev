import React, { useState, useRef, useEffect, MutableRefObject } from "react";
import { Box, Card, Flex, useColorMode } from "theme-ui";

import { FIRST_ERC20_COLLATERAL } from "../../../utils/constants";

import { useTvl } from "./context/ChartContext";
import { tvlData, TimestampsObject } from "./context/ChartProvider";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ScriptableContext,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

ChartJS.register({
  id: 'uniqueid',
  beforeDraw: function (chart: any, _easing: any) {
    if (chart.tooltip._active && chart.tooltip._active.length) {
      const ctx = chart.ctx;
      const activePoint = chart.tooltip._active[0];
      const x = activePoint.element.x;
      const topY = chart.scales.y.top;
      const bottomY = chart.scales.y.bottom;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#e1e1e1';
      ctx.stroke();
      ctx.restore();
    }
  }
});

export const LineChart: React.FC = () => {
  const [hoverRef, isHovered] = useHover<HTMLDivElement>();
  
  const [colorMode] = useColorMode();
  const [activeData, setActiveData] = useState<number | string>('-');
  const [activeLabel, setActiveLabel] = useState<string>('-');
  const [chartData, setChartData] = useState<Array<tvlData>>();
  const [chartLabels, setChartLabels] = useState<Array<TimestampsObject>>();

  function useHover<T>(): [MutableRefObject<T>, boolean] {
    const [value, setValue] = useState<boolean>(false); 
    const ref: any = useRef<T | null>(null);
    const handleMouseOver = (): void => setValue(true);
    const handleMouseOut = (): void => setValue(false);

    useEffect(
      () => {
        const node: any = ref.current;
        if (node) {
          node.addEventListener("mouseover", handleMouseOver);
          node.addEventListener("mouseout", handleMouseOut);
          return () => {
            node.removeEventListener("mouseover", handleMouseOver);
            node.removeEventListener("mouseout", handleMouseOut);
          };
        }
      },
      [] // Recall only if ref changes
    );
    return [ref, value];
  };

  useTvl().then((result) => {
    if (!result) return null;
    const { tvl , timestamps } = result;
    setChartData(tvl);
    setChartLabels(timestamps);
  });

  const labels: Array<{[date: string]: string}> = [];

  chartLabels?.map((timestamp: TimestampsObject) => {
    const date = new Date(timestamp.localTimestamp * 1000) // convert timestamp to date;
    const day = date.getUTCDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getUTCFullYear();

    return labels.push({[day]: `${month} ${day}, ${year}`})
  });  

  const options = {
    borderWidth: 2,
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point:{
          radius: 0,
      },
    },
    scales: {
      y: {
        display: false,
        drawTicks: false,
        beginAtZero: true
      }, 
      x: {
        ticks: {
          padding: 12,
          autoSkip: true,
          maxTicksLimit: 20,
          font: {
            size: 11,
            weight: 'bold'
          }
        },
        grid: {
          display: false,
          drawBorder: false,
          drawTicks: false,
        },
      },
    },
    grid: {
      display: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false,
      },
      title: {
        display: false,
      },
    },
    onHover: (event: any) => {
      const chart = event.chart
      const activePoint = chart.tooltip._active[0];
      const setIndex = activePoint?.datasetIndex;
      const index = activePoint?.index;
      const activeData = chart.data?.datasets[setIndex]?.data[index];
      const labelIndex = labels[index];
      const activeLabel = labelIndex && Object.values(labelIndex)[0];
      setActiveData(activeData ? activeData : '-');
      setActiveLabel(activeLabel ?? '-')
    }
  };
  
  const data = {
    labels: labels.map((label: {[day: string]: string}) => {
      return Object.keys(label)
    }),
    datasets: [
      {
        fill: "start",
        lineTension: 0.4,
        label: 'TVL',
        data: chartData?.map((tvl: tvlData) => tvl?.totalCollateral),
        borderColor: colorMode === "dark" ? "#7d00ff" : colorMode === "darkGrey" ? "#f3f3f3b8" : "#20cb9d",
        pointBackgroundColor: colorMode === 'dark' ? "#7d00ff" : colorMode === "darkGrey" ? "#f3f3f3b8" : "#20cb9d",
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, colorMode === "dark" ? "#7c00fd8c" : colorMode === "darkGrey" ? "#e5e5e5b8" : "#28c39b40");
          gradient.addColorStop(1, colorMode === "dark" ? "#7d00ff00" : colorMode === "darkGrey" ? "#f3f3f321" :  "#ffffff40");
          return gradient;
        },
      },
    ],
  };
  return (
    <Card variant="layout.columns" style={{ height: "25em" }}>
      <Flex sx={{
        width: "100%",
        gap: 1,
        pb: 3,
        borderBottom: 1, 
        borderColor: "border"
      }}>
        TVL Chart
      </Flex>
      <Flex sx={{
        width: "100%",
        flexDirection: "column",
        pt: "1em",
        pl: ["1em", 0, 0, "1em"],
        gap: "1em",
      }}>
        <Box style={{
          height: "18.5em",
          marginTop: "2.5em",
          paddingBottom: "2.5em"
        }}>
          <Flex sx={{ 
            position: "absolute", 
            marginTop: "-1.6em",
            fontSize: "1.6em", 
            fontWeight: "bold", 
            color: "text"
          }}>
            {isHovered ? activeData : '-'} {isHovered && activeData > 0 && ` ${ FIRST_ERC20_COLLATERAL }` }
          </Flex>
          <Flex sx={{ 
            fontSize: ".9em",
            marginBottom: "1.5em"
          }}>
            {isHovered ? activeLabel : '-'}
          </Flex>
          <Box sx={{height: "100%"}} ref={hoverRef}>
            <Line 
              options={{
                ...options,
                interaction: {
                  mode: 'index',
                  intersect: false,
                }
              }}  
              data={data} 
            />
          </Box>
        </Box>
      </Flex>
    </Card>
  );
};
