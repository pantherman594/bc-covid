import React from 'react';
import moment from 'moment';
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, Tooltip } from 'recharts';

import style from './style.module.css';
import { ChartContainer } from '../index';
import { CovidDataItem } from '../../types';

interface TestedBarChartProps {
  data: CovidDataItem[];
}

export const TestedBarChart = (props: TestedBarChartProps) => {
  // format date property from Date obj to milliseconds
  const toPlotData = (data: CovidDataItem[]): any[] => {
    return data.map((item: CovidDataItem) => {
      return {
        ...item,
        remainingTested: -1 * (item.totalTested - item.undergradTested),
        remainingPositive: -1 * (item.totalPositive - item.undergradPositive),
        date: item.date.toLocaleDateString(undefined, { month: 'numeric', day: '2-digit' }),
      };
    });
  };

  const valueTickFormatter = (tick: number) => Math.abs(tick);

  const renderTooltipContent = (o: any) => {
    const { payload, label } = o;

    if (payload.length !== 4) return null;
    const totalPositive = payload[0].value - payload[2].value;
    const totalTested = payload[1].value - payload[3].value;

    return (
      <div className={style.customTooltip}>
        <p>{label}</p>
        <p>
          {`Total Positive: ${totalPositive}`}
        </p>
        <p>
          {`Total Tested: ${totalTested}`}
        </p>
        {
          payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name.replace(/([A-Z])/g, " $1")}: ${valueTickFormatter(entry.value)}`}
            </p>
          ))
        }
      </div>
    );
  };

  return (
    <ChartContainer
      title="BC Tested and Positive Cases"
      width={'80%'}
      height={500}
      chartComp={BarChart}
      chartProps={{ data: toPlotData(props.data), stackOffset: 'sign' }}
    >
      <XAxis
        dataKey="date"
      />
      <YAxis
        tickFormatter={valueTickFormatter}
      />
      <Tooltip content={renderTooltipContent} />
      <ReferenceLine y={0} stroke="#000" />
      <Bar
        dataKey="undergradPositive"
        fill="#ff0000bb"
        stackId="stack"
      />
      <Bar
        dataKey="undergradTested"
        fill="#5f6d7dbb"
        stackId="stack"
      />
      <Bar
        dataKey="remainingPositive"
        fill="#ff0000bb"
        stackId="stack"
      />
      <Bar
        dataKey="remainingTested"
        fill="#5f6d7dbb"
        stackId="stack"
      />
    </ChartContainer>
  );
};
