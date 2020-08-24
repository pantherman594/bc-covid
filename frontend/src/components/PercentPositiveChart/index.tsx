import React from 'react';
import moment from 'moment';
import { AreaChart, XAxis, YAxis, Area, Tooltip } from 'recharts';

import style from './style.module.css';
import { ChartContainer } from '../index';
import { CovidDataItem } from '../../types';

interface PercentPositiveChartProps {
  data: CovidDataItem[];
}

export const PercentPositiveChart = (props: PercentPositiveChartProps) => {
  // format date property from Date obj to milliseconds
  const toPlotData = (data: CovidDataItem[]): any[] => {
    return data.map((item: CovidDataItem, index: number, array: CovidDataItem[]) => {
      const prev = array[index - 1] || {
        id: '',
        date: new Date(),
        totalTested: 0,
        totalPositive: 0,
        undergradTested: 0,
        undergradPositive: 0,
        isolation: 0,
        flags: [],
      };

      const totalPositive = item.totalPositive - prev.totalPositive;
      const totalTested = item.totalTested - prev.totalTested;
      const percentTotal = (100 * totalPositive / totalTested).toFixed(2);

      const undergradPositive = item.undergradPositive - prev.undergradPositive;
      const undergradTested = item.undergradTested - prev.undergradTested;
      const percentUndergrad = (100 * undergradPositive / undergradTested).toFixed(2);

      return { percentTotal, percentUndergrad, date: item.date.getTime() };
    });
  };

  const dateTickFormatter = (tick: number) => moment(tick).format('M/D');
  const percentTickFormatter = (tick: number) => `${tick}%`;

  const renderTooltipContent = (o: any) => {
    const { payload, label } = o;

    return (
      <div className={style.customTooltip}>
        <p>{dateTickFormatter(label)}</p>
        {
          payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name.replace(/([A-Z])/g, " $1")}: ${percentTickFormatter(entry.value)}`}
            </p>
          ))
        }
      </div>
    );
  };

  return (
    <ChartContainer
      title="Percentage of Positive Cases"
      width={'80%'}
      height={500}
      chartComp={AreaChart}
      chartProps={{ data: toPlotData(props.data) }}
    >
      <defs>
        <linearGradient id="colorPTotal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#009dff" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#009dff" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorPUnder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
        </linearGradient>
      </defs>

      <XAxis
        dataKey="date"
        tickFormatter={dateTickFormatter}
        type="number"
        scale="time"
        domain={['dataMin', 'dataMax']}
      />
      <YAxis tickFormatter={percentTickFormatter} />
      <Area
        type="monotone"
        dataKey="percentUndergrad"
        stroke="#8884d8"
        fillOpacity={1}
        fill="url(#colorPUnder)"
      />
      <Area
        type="monotone"
        dataKey="percentTotal"
        stroke="#009dff"
        fillOpacity={1}
        fill="url(#colorPTotal)"
      />
      <Tooltip content={renderTooltipContent} />
    </ChartContainer>
  );
};
