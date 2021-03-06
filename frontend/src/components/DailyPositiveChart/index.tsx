import React, { useState } from 'react';
import moment from 'moment';
import {
  ComposedChart, XAxis, YAxis, Legend, Bar, Line, Tooltip,
} from 'recharts';

import style from './style.module.css';
import { ChartContainer } from '../index';
import { create, CovidDataItem } from '../../types';

interface DailyPositiveChartProps {
  data: CovidDataItem[];
  scale: 'log' | 'linear';
}

const DailyPositiveChart = (props: DailyPositiveChartProps) => {
  const { data: rawData, scale } = props;

  const [toggles, setToggles] = useState({
    totalPositive: false,
    undergradPositive: false,
    communityPositive: false,
    total7DayAvg: false,
    undergrad7DayAvg: false,
    community7DayAvg: false,
    percent: false,
  });

  // format date property from Date obj to milliseconds
  const toPlotData = (data: CovidDataItem[]): any[] => {
    const averages: any[] = [];

    data.forEach((item: CovidDataItem) => {
      let totalSum = item.totalPositive;
      let undergradSum = item.undergradPositive;
      let communitySum = item.totalPositive - item.undergradPositive;

      if (item.recoveryIndex > -1) {
        const rI = item.recoveryIndex;
        totalSum -= data[rI].totalPositive;
        undergradSum -= data[rI].undergradPositive;
        communitySum -= data[rI].totalPositive - data[rI].undergradPositive;
      }

      const items = item.recoveryIndex < 0
        ? item.daysSinceFirst + 1
        : item.daysSinceFirst - data[item.recoveryIndex].daysSinceFirst;
      averages.push({
        'Total 7 Day Average': totalSum / items,
        'Undergrad 7 Day Average': undergradSum / items,
        'Non-undergrad 7 Day Average': communitySum / items,
      });
    });

    return data.map((item: CovidDataItem, index: number, array: CovidDataItem[]) => {
      const prev = array[index - 1] || create();

      const totalPositive = item.totalPositive - prev.totalPositive;
      const undergradPositive = item.undergradPositive - prev.undergradPositive;
      const communityPositive = totalPositive - undergradPositive;

      return {
        Total: totalPositive,
        Undergrads: undergradPositive,
        'Non-undergrads': communityPositive,
        ...averages[index],
        date: item.date.getTime(),
      };
    });
  };

  const dateTickFormatter = (tick: number) => moment(tick).format('M/D');

  const renderTooltipContent = (o: any) => {
    const { payload, label } = o;

    return (
      <div className={style.customTooltip}>
        <p>{dateTickFormatter(label)}</p>
        {
          payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {`${entry.name}: ${Math.round(entry.value)}`}
            </p>
          ))
        }
      </div>
    );
  };

  return (
    <ChartContainer
      title="Positive Test Results per Day"
      width="100%"
      height={500}
      chartComp={ComposedChart}
      chartProps={{ data: toPlotData(rawData), syncId: 'syncTestPercent' }}
    >
      <XAxis
        dataKey="date"
        tickFormatter={dateTickFormatter}
        type="number"
        scale="time"
        domain={['dataMin - 43200000', 'dataMax + 43200000']}
      />
      <YAxis
        orientation="left"
        scale={scale}
        domain={[scale === 'log' ? 0.5 : 'auto', 'auto']}
        allowDataOverflow
      />
      <Tooltip content={renderTooltipContent} />
      <Legend
        onClick={(dataProps: any) => {
          let key = dataProps.dataKey;
          if (key.includes('Percent')) key = 'percent';
          setToggles((newToggles: any) => ({
            ...newToggles,
            [key]: !newToggles[key],
          }));
        }}
      />
      <Bar
        stackId="1"
        dataKey="Undergrads"
        stroke="#8884d8bb"
        fillOpacity={1}
        fill="url(#colorUndergrad)"
        hide={toggles.undergradPositive}
      />
      <Bar
        stackId="1"
        dataKey="Non-undergrads"
        stroke="#009dffbb"
        fillOpacity={1}
        fill="url(#colorCommunity)"
        hide={toggles.communityPositive}
      />
      <Line
        type="monotone"
        dataKey="Total 7 Day Average"
        stroke="#5f6d7d"
        strokeDasharray="5 5"
        hide={toggles.total7DayAvg}
      />
      <Line
        type="monotone"
        dataKey="Undergrad 7 Day Average"
        stroke="#8884d8"
        strokeDasharray="5 5"
        hide={toggles.undergrad7DayAvg}
      />
      <Line
        type="monotone"
        dataKey="Non-undergrad 7 Day Average"
        stroke="#009dff"
        strokeDasharray="5 5"
        hide={toggles.community7DayAvg}
      />
    </ChartContainer>
  );
};

export default DailyPositiveChart;
