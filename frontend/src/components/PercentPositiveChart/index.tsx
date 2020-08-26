import React from 'react';
import moment from 'moment';
import { LineChart, XAxis, YAxis, Legend, Line, Tooltip } from 'recharts';

import style from './style.module.css';
import { ChartContainer } from '../index';
import { create, CovidDataItem } from '../../types';

interface PercentPositiveChartProps {
  data: CovidDataItem[];
}

export const PercentPositiveChart = (props: PercentPositiveChartProps) => {
  // format date property from Date obj to milliseconds
  const toPlotData = (data: CovidDataItem[]): any[] => {
    return data.map((item: CovidDataItem, index: number, array: CovidDataItem[]) => {
      const prev = array[index - 1] || create();

      const totalPositive = item.totalPositive - prev.totalPositive;
      const totalTested = item.totalTested - prev.totalTested;
      const percentTotal = totalTested === 0 ? '0'
        : (100 * totalPositive / totalTested).toFixed(2);

      const undergradPositive = item.undergradPositive - prev.undergradPositive;
      const undergradTested = item.undergradTested - prev.undergradTested;
      const percentUndergrad = undergradTested === 0 ? '0'
        : (100 * undergradPositive / undergradTested).toFixed(2);

      return { total: percentTotal, undergrads: percentUndergrad, date: item.date.getTime() };
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
              {`${entry.name}: ${percentTickFormatter(entry.value)}`}
            </p>
          ))
        }
      </div>
    );
  };

  return (
    <ChartContainer
      title="Test Percent Positive per Day"
      width={'100%'}
      height={500}
      chartComp={LineChart}
      chartProps={{ data: toPlotData(props.data), syncId: "syncTestPercent" }}
    >
      <defs>
        <linearGradient id="colorPTotal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#009dff" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#009dff" stopOpacity={0.2} />
        </linearGradient>
        <linearGradient id="colorPUnder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2} />
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
      <Tooltip content={renderTooltipContent} />
      <Legend />
      <Line
        type="monotone"
        dataKey="total"
        stroke="#009dff"
      />
      <Line
        type="monotone"
        dataKey="undergrads"
        stroke="#8884d8"
      />
    </ChartContainer>
  );
};
