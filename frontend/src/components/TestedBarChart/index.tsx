import React from 'react';
import moment from 'moment';
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, Tooltip } from 'recharts';

import style from './style.module.css';
import { ChartContainer } from '../index';
import { CovidDataItem } from '../../types';

interface TestedBarChartProps {
  data: CovidDataItem[];
  scale: 'log' | 'linear';
}

export const TestedBarChart = (props: TestedBarChartProps) => {
  // format date property from Date obj to milliseconds
  const toPlotData = (data: CovidDataItem[]): any[] => {
    return data.map((item: CovidDataItem) => {
      const remainingPositive = item.totalPositive - item.undergradPositive;
      return {
        undergradTested: item.undergradTested - item.undergradPositive,
        undergradPositive: item.undergradPositive,
        remainingTested: item.totalTested - item.undergradTested - remainingPositive,
        remainingPositive,
        date: item.date.getTime(),
      };
    });
  };

  let max = 0;
  for (const item of props.data) {
    if (item.undergradTested > max) max = item.undergradTested;
    if (item.totalTested - item.undergradTested > max)
      max = item.totalTested - item.undergradTested;
  }

  max += 1000;

  const dateTickFormatter = (tick: number) => {
    let str = moment(tick).format('M/D');

    if (str === '9/3') str += '*';

    return str;
  };

  const valueTickFormatter = (tick: number) => Math.abs(tick);

  const renderTooltipContent = (o: any) => {
    const { payload, label } = o;

    if (payload.length !== 4) return null;
    const totalPositive = payload[0].value + payload[2].value;
    const totalTested = payload[1].value + payload[3].value;

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
            <p key={`item-${index}`} style={{ color: entry.color.substring(0, entry.color.length - 2) }}>
              {`${entry.name.replace(/([A-Z])/g, " $1")}: ${valueTickFormatter(entry.value)}`}
            </p>
          ))
        }
      </div>
    );
  };

  return (
    <div>
      <ChartContainer
        title="Cumulative Tests and Results"
        width={'100%'}
        height={250}
        chartComp={BarChart}
        chartProps={{ data: toPlotData(props.data), stackOffset: 'sign' }}
      >
        <Tooltip content={renderTooltipContent} />
        <XAxis
          dataKey="date"
          tickFormatter={dateTickFormatter}
          type="number"
          scale="time"
          domain={['dataMin - 43200000', 'dataMax + 43200000']}
          hide
        />
        <YAxis
          tickFormatter={valueTickFormatter}
          scale={props.scale}
          domain={props.scale === 'log' ? [1, 100000] : [0, max + 2000]}
          allowDataOverflow
        />
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
          fill="#ff000000"
          stackId="stack"
        />
        <Bar
          dataKey="remainingTested"
          fill="#5f6d7d00"
          stackId="stack"
        />
        <ReferenceLine y={props.scale === 'log' ? 50000 : max} stroke="#0000" label="Undergraduates" />
      </ChartContainer>
      <ChartContainer
        title=""
        width={'100%'}
        height={250}
        chartComp={BarChart}
        chartProps={{ data: toPlotData(props.data), stackOffset: 'sign', style: { marginTop: -10 } }}
      >
        <Tooltip content={renderTooltipContent} />
        <XAxis
          dataKey="date"
          tickFormatter={dateTickFormatter}
          type="number"
          scale="time"
          domain={['dataMin - 43200000', 'dataMax + 43200000']}
        />
        <YAxis
          tickFormatter={valueTickFormatter}
          scale={props.scale}
          domain={props.scale === 'log' ? [1, 100000] : [0, max + 2000]}
          reversed
          allowDataOverflow
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
        <Bar
          dataKey="undergradPositive"
          fill="#ff000000"
          stackId="stack"
        />
        <Bar
          dataKey="undergradTested"
          fill="#5f6d7d00"
          stackId="stack"
        />
        <ReferenceLine y={props.scale === 'log' ? 1 : 0} stroke="#000" />
        <ReferenceLine y={props.scale === 'log' ? 50000 : max} stroke="#0000" label="Remaining BC Community" />
      </ChartContainer>
    </div>
  );
};
