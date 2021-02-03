import React from 'react';
import moment from 'moment';
import {
  ComposedChart, XAxis, YAxis, Legend, Bar, Line, Tooltip,
} from 'recharts';

import style from './style.module.css';
import { ChartContainer } from '../index';
import { CovidDataItem } from '../../types';

interface CumulativePositiveChartProps {
  data: CovidDataItem[];
  scale: 'log' | 'linear';
}

const CumulativePositiveChart = (props: CumulativePositiveChartProps) => {
  const { data: rawData, scale } = props;

  // format date property from Date obj to milliseconds
  const toPlotData = (data: CovidDataItem[]): any[] => {
    if (data.length === 0) return [];

    const averages: any[] = [];

    let startIndex = 0;
    let totalSum = 0;
    let undergradSum = 0;
    let communitySum = 0;

    data.forEach((item: CovidDataItem, index: number) => {
      totalSum += item.totalPositive;
      undergradSum += item.undergradPositive;
      communitySum += item.totalPositive - item.undergradPositive;

      while (item.recoveryIndex >= startIndex) {
        totalSum -= data[startIndex].totalPositive;
        undergradSum -= data[startIndex].undergradPositive;
        communitySum -= data[startIndex].totalPositive - data[startIndex].undergradPositive;

        startIndex += 1;
      }

      const items = item.recoveryIndex < 0 ? item.daysSinceFirst + 1 : (index - item.recoveryIndex);
      averages.push({
        'Total 7 Day Average': totalSum / items,
        'Undergrad 7 Day Average': undergradSum / items,
        'Non-undergrad 7 Day Average': communitySum / items,
      });
    });

    return data.map((item: CovidDataItem, index: number) => ({
      Total: item.totalPositive,
      Undergrads: item.undergradPositive,
      'Non-undergrads': item.totalPositive - item.undergradPositive,
      ...averages[index],
      date: item.date.getTime(),
    }));
  };

  const dateTickFormatter = (tick: number) => {
    let str = moment(tick).format('M/D');

    if (str === '9/3') str += '*';

    return str;
  };

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
      title="Cumulative Positive Tests"
      width="100%"
      height={500}
      chartComp={ComposedChart}
      chartProps={{ data: toPlotData(rawData), syncId: 'syncTestPercent' }}
    >
      <defs>
        <linearGradient id="colorUndergrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4} />
          <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
        </linearGradient>
        <linearGradient id="colorCommunity" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#009dff" stopOpacity={0.4} />
          <stop offset="95%" stopColor="#009dff" stopOpacity={0.1} />
        </linearGradient>
        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#5f6d7d" stopOpacity={0.4} />
          <stop offset="95%" stopColor="#5f6d7d" stopOpacity={0.1} />
        </linearGradient>
      </defs>

      <XAxis
        dataKey="date"
        tickFormatter={dateTickFormatter}
        type="number"
        scale="time"
        domain={['dataMin - 43200000', 'dataMax + 43200000']}
      />
      <YAxis
        scale={scale}
        domain={[1, 'dataMax']}
        allowDataOverflow
      />
      <Tooltip content={renderTooltipContent} />
      <Legend />
      <Bar
        dataKey="Undergrads"
        stroke="#8884d8bb"
        fillOpacity={1}
        fill="url(#colorUndergrad)"
      />
      <Bar
        dataKey="Non-undergrads"
        stroke="#009dffbb"
        fillOpacity={1}
        fill="url(#colorCommunity)"
      />
      <Line
        type="monotone"
        dataKey="Undergrad 7 Day Average"
        stroke="#8884d8"
      />
      <Line
        type="monotone"
        dataKey="Non-undergrad 7 Day Average"
        stroke="#009dff"
      />
      <Line
        type="monotone"
        dataKey="Total 7 Day Average"
        stroke="#5f6d7d"
      />
    </ChartContainer>
  );
};

export default CumulativePositiveChart;
