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
        date: item.date.getTime(),
      };
    });
  };

  let maxUndergrad = 0;
  let maxRemaining = 0;

  for (const item of props.data) {
    if (item.undergradTested > maxUndergrad) maxUndergrad = item.undergradTested;
    if (item.totalTested - item.undergradTested > maxRemaining)
      maxRemaining = item.totalTested - item.undergradTested;
  }

  const dateTickFormatter = (tick: number) => {
    let str = moment(tick).format('M/D');

    if (str === '9/3') str += '*';

    return str;
  };

  const valueTickFormatter = (tick: number) => Math.abs(tick);

  const renderTooltipContent = (o: any) => {
    const { payload, label } = o;

    if (payload.length !== 4) return null;
    const totalPositive = payload[0].value - payload[2].value;
    const totalTested = payload[1].value - payload[3].value;

    return (
      <div className={style.customTooltip}>
        <p>{dateTickFormatter(label)}</p>
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
      title="Tests and Results per Day"
      width={'100%'}
      height={500}
      chartComp={BarChart}
      chartProps={{ data: toPlotData(props.data), stackOffset: 'sign' }}
    >
      <Tooltip content={renderTooltipContent} />
      <ReferenceLine y={maxUndergrad} stroke="#0000" label="Undergraduates" />
      <ReferenceLine y={-1 * maxRemaining} stroke="#0000" label="Remaining BC Community" />
      <XAxis
        dataKey="date"
        tickFormatter={dateTickFormatter}
      />
      <YAxis tickFormatter={valueTickFormatter} />
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
