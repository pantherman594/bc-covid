import React from 'react';
import moment from 'moment';
import { AreaChart, XAxis, YAxis, Area, Tooltip } from 'recharts';

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
      return { ...item, date: item.date.getTime() };
    });
  };

  const dateTickFormatter = (tick: number) => moment(tick).format('M/D');

  const renderTooltipContent = (o: any) => {
    const { payload, label } = o;

    return (
      <div className={style.customTooltip}>
        <p>{dateTickFormatter(label)}</p>
        {
          payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name.replace(/([A-Z])/g, " $1")}: ${entry.value}`}
            </p>
          ))
        }
      </div>
    );
  };

  return (
    <ChartContainer
      title="Undergraduates Tested and Positive Cases"
      width={'80%'}
      height={500}
      chartComp={AreaChart}
      chartProps={{ data: toPlotData(props.data) }}
    >
      <defs>
        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#ff0000" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#ff0000" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
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
      <Area
        type="monotone"
        dataKey="undergradTested"
        stroke="#82ca9d"
        fillOpacity={1}
        fill="url(#colorPv)"
      />
      <Area
        type="monotone"
        dataKey="undergradPositive"
        stroke="#ff0000"
        fillOpacity={1}
        fill="url(#colorUv)"
      />
      <Tooltip content={renderTooltipContent} />
    </ChartContainer>
  );
};
