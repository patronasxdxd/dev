import { useEffect, useState } from "react";
import { Box, Card, Flex, useColorMode } from "theme-ui";
import { useTvl } from "./context/ChartContext";
import { TimestampsObject, Tvl } from "./context/ChartProvider";

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
import { Decimal } from "@liquity/lib-base";
import { useHover } from "../../../utils/hooks";
import { LoadingChart } from "./LoadingChart";

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
    if (chart?.tooltip?._active && chart?.tooltip?._active.length) {
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

export const LineChart = (): JSX.Element => {
  const [isMounted, setIsMounted] = useState<boolean>(true);
  const [hoverRef, isHovered] = useHover<HTMLDivElement>();
  const [colorMode] = useColorMode();
  const [activeData, setActiveData] = useState<number | string>('-');
  const [tvl, setTvl] = useState<Tvl[]>([]);
  const [loadedChart, setLoadedChart] = useState<boolean>(false);
  const [timestamps, setTimestamps] = useState<Array<TimestampsObject>>([]);
  const [activeLabel, setActiveLabel] = useState<string>('-');
  const [chartData, setChartData] = useState<Array<Number>>([]);
  const [lastTvl, setLastTvl] = useState<Decimal>();
  const [chartLabels, setChartLabels] = useState<Array<TimestampsObject>>();

  useTvl()
    .then((result) => {
      if (result === null || !isMounted) {
        return
      }
      setTvl(result.tvl)
      setTimestamps(result.timestamps)
      setLoadedChart(true)
    })
    .catch((error) => {
      setLoadedChart(false)
      console.error('tvl fetch error: ', error)
    })

    useEffect(() => {
      const cachedData = localStorage.getItem("chartData");
      const cachedLabels = localStorage.getItem("chartLabels");
    
      if (cachedData && cachedLabels) {
        setLoadedChart(true)
        setChartData(JSON.parse(cachedData));
        setChartLabels(JSON.parse(cachedLabels));
        setLastTvl(JSON.parse(cachedData)[cachedData.length - 1]);
        return;
      }
    
      if (!isMounted || !loadedChart) {
        return;
      }
    
      let historicalTvl: Decimal[] = [];
    
      for (const collateralTvl of tvl) {
        collateralTvl.tvl.forEach((tvl, index) => {
          if (historicalTvl[index] === undefined) {
            historicalTvl[index] = Decimal.from(0);
          }
          historicalTvl[index] = tvl.totalCollateral.add(historicalTvl[index]);
        });
      }
      const historicalTvlinNumber = historicalTvl.map(decimal => parseInt(decimal.toString()))
    
      setChartLabels(timestamps);
      setChartData(historicalTvlinNumber);
      setLastTvl(historicalTvl[historicalTvl.length - 1]);
    
      // Cache the data in localStorage
      historicalTvlinNumber.length > 0 && localStorage.setItem("chartData", JSON.stringify(historicalTvlinNumber));
      tvl.length > 0 && localStorage.setItem("chartLabels", JSON.stringify(timestamps));
    
      return () => {
        setIsMounted(false);
      };
    }, [isMounted, loadedChart, tvl, timestamps]);

  const labels: Array<{[date: string]: string}> = [];

  chartLabels?.map((timestamp: TimestampsObject) => {
    const date = new Date(timestamp.localTimestamp * 1000) // convert timestamp to date;
    const day = date.getUTCDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getUTCFullYear();

    return labels.push({[day]: `${month} ${day}, ${year}`})
  });  

  const options = {
    locale: 'en-US',
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
        beginAtZero: true,
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
      const activeData = chart.data?.datasets[setIndex] && 
      Decimal.from(chart.data?.datasets[setIndex]?.data[index]).prettify(2);
      const labelIndex = labels[index];
      const activeLabel = labelIndex && Object.values(labelIndex)[0];
      setActiveData(activeData ? activeData : '-');
      setActiveLabel(activeLabel ?? '-')
    }
  };
  
  const data = {
    labels: labels.map((label: {[day: string]: string}) => {
      return Object.keys(label)[0]
    }),
    datasets: [
      {
        fill: "start",
        lineTension: 0.4,
        label: 'TVL',
        data: chartData,
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
    <Card variant="layout.columns" sx={{height: "100%"}}>
      <Flex sx={{
        width: "100%",
        height: "2.5rem",
        gap: 1,
        pb: 3,
        borderBottom: 1, 
        borderColor: "border"
      }}>
        TVL Chart
      </Flex>
      <Flex sx={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        pl: ["1rem", 0, 0, "1rem"],
        py: "2rem",
        gap: "1rem",
      }}>
        <Box style={{
          height: "20em",
          width: "100%",
          paddingBottom: "2.5em",
        }}>
          {loadedChart && <>
            <Flex sx={{ 
              position: "absolute", 
              gap: "2rem",
              marginTop: "-1.6rem",
              fontSize: "1.6rem", 
              fontWeight: "bold", 
              color: "text"
            }}>
              {(lastTvl || (isHovered && activeData)) && '$'}
              {loadedChart && (
                isHovered 
                ? activeData 
                : lastTvl 
                  ? lastTvl.prettify(2) 
                  : '-'
              )} 
            </Flex>
            <Flex sx={{ 
              fontSize: ".9em",
              marginTop: "1rem",
              marginBottom: "1.5rem",
              height: "1rem",
            }}>
              {loadedChart && isHovered && activeLabel}
            </Flex>
          </>}
          <Box sx={{ display: "flex", paddingBottom: "1rem", height: "100%", width: "100%", justifyContent: "center", alignItems: "center" }} ref={hoverRef}>
            {
              !loadedChart 
                ? <LoadingChart />
                : <Line options={{ ...options, interaction: { mode: 'index', intersect: false } }}  data={data} />
            }
          </Box>
        </Box>
      </Flex>
    </Card>
  );
};
