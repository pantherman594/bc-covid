import React from 'react';
import moment from 'moment';
import { ComposedChart, XAxis, YAxis, Legend, Bar, Line, Tooltip } from 'recharts';

import style from './style.module.css';
import { ChartContainer } from '../index';
import { CovidDataItem } from '../../types';

interface CumulativeTestedChartProps {
  data: CovidDataItem[];
  scale: 'log' | 'linear';
}

export const CumulativeTestedChart = (props: CumulativeTestedChartProps) => {
  // format date property from Date obj to milliseconds
  const toPlotData = (data: CovidDataItem[]): any[] => {
    if (data.length === 0) return [];

    const averages: any[] = [];

    let startIndex = 0;
    let totalSum = 0;
    let undergradSum = 0;
    let communitySum = 0;

    data.forEach((item: CovidDataItem, index: number) => {
      totalSum += item.totalTested;
      undergradSum += item.undergradTested;
      communitySum += item.totalTested - item.undergradTested;

      while (item.recoveryIndex >= startIndex) {
        totalSum -= data[startIndex].totalTested;
        undergradSum -= data[startIndex].undergradTested;
        communitySum -= data[startIndex].totalTested - data[startIndex].undergradTested;

        startIndex += 1;
      }

      const items = item.recoveryIndex < 0 ? item.daysSinceFirst + 1 : (index - item.recoveryIndex);
      averages.push({
        total7DayAvg: totalSum / items,
        undergrad7DayAvg: undergradSum / items,
        community7DayAvg: communitySum / items,
      })
    });

    return data.map((item: CovidDataItem, index: number) => {
      return {
        total: item.totalTested,
        undergrad: item.undergradTested,
        community: item.totalTested - item.undergradTested,
        ...averages[index],
        date: item.date.getTime(),
      };
    });
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
          payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${Math.round(entry.value)}`}
            </p>
          ))
        }
      </div>
    );
  };

  return (
    <ChartContainer
      title="Cumulative Tests"
      width={'100%'}
      height={500}
      chartComp={ComposedChart}
      chartProps={{ data: toPlotData(props.data), syncId: "syncTestPercent" }}
    >
      <XAxis
        dataKey="date"
        tickFormatter={dateTickFormatter}
        type="number"
        scale="time"
        domain={['dataMin - 43200000', 'dataMax + 43200000']}
      />
      <YAxis
        scale={props.scale}
        domain={[1, 'dataMax']}
        allowDataOverflow
      />
      <Tooltip content={renderTooltipContent} />
      <Legend />
      <Bar
        dataKey="undergrad"
        stroke="#8884d8bb"
        fillOpacity={1}
        fill="url(#colorUndergrad)"
      />
      <Bar
        dataKey="community"
        stroke="#009dffbb"
        fillOpacity={1}
        fill="url(#colorCommunity)"
      />
      <Line
        type="monotone"
        dataKey="undergrad7DayAvg"
        stroke="#8884d8"
      />
      <Line
        type="monotone"
        dataKey="community7DayAvg"
        stroke="#009dff"
      />
      <Line
        type="monotone"
        dataKey="total7DayAvg"
        stroke="#5f6d7d"
      />
    </ChartContainer>
  );
};
