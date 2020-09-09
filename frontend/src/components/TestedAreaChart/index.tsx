import React from 'react';
import moment from 'moment';
import { AreaChart, XAxis, YAxis, Legend, Area, Tooltip } from 'recharts';

import style from './style.module.css';
import { ChartContainer } from '../index';
import { CovidDataItem } from '../../types';

interface TestedAreaChartProps {
  data: CovidDataItem[];
}

export const TestedAreaChart = (props: TestedAreaChartProps) => {
  // format date property from Date obj to milliseconds
  const toPlotData = (data: CovidDataItem[]): any[] => {
    return data.map((item: CovidDataItem) => {
      return {
        tested: item.totalTested - item.undergradTested,
        positive: item.totalPositive - item.undergradPositive,
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
              {`${entry.name}: ${entry.value}`}
            </p>
          ))
        }
      </div>
    );
  };

  return (
    <ChartContainer
      title="Cumulative Community Tests"
      width={'100%'}
      height={500}
      chartComp={AreaChart}
      chartProps={{ data: toPlotData(props.data), syncId: "syncTestPercent" }}
    >
      <defs>
        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#ff0000" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#ff0000" stopOpacity={0.2} />
        </linearGradient>
        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#5f6d7d" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#5f6d7d" stopOpacity={0.2} />
        </linearGradient>
      </defs>

      <XAxis
        dataKey="date"
        tickFormatter={dateTickFormatter}
        type="number"
        scale="time"
        domain={['dataMin', 'dataMax']}
      />
      <YAxis />
      <Tooltip content={renderTooltipContent} />
      <Legend />
      <Area
        type="monotone"
        dataKey="tested"
        stroke="#5f6d7d"
        fillOpacity={1}
        fill="url(#colorPv)"
      />
      <Area
        type="monotone"
        dataKey="positive"
        stroke="#ff0000"
        fillOpacity={1}
        fill="url(#colorUv)"
      />
    </ChartContainer>
  );
};
