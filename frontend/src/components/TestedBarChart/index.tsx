import React from 'react';
import moment from 'moment';
import {
  Bar,
  BarChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { CovidDataItem } from '../../types';
import { ChartContainer } from '../index';
import style from './style.module.css';

interface TestedBarChartProps {
  data: CovidDataItem[];
  scale: 'log' | 'linear';
}

const TestedBarChart = (props: TestedBarChartProps) => {
  const { data, scale } = props;

  // format date property from Date obj to milliseconds
  const plotData = data.map((item: CovidDataItem) => {
    const remainingPositive = item.totalPositive - item.undergradPositive;
    return {
      'Undergrad Tests': item.undergradTested - item.undergradPositive,
      'Undergrad Positives': item.undergradPositive,
      'Non-undergrad Tests': item.totalTested - item.undergradTested - remainingPositive,
      'Non-undergrad Positives': remainingPositive,
      date: item.date.getTime(),
    };
  });

  let max = 0;
  data.forEach((item: CovidDataItem) => {
    if (item.undergradTested > max) max = item.undergradTested;
    if (item.totalTested - item.undergradTested > max) {
      max = item.totalTested - item.undergradTested;
    }
  });

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
          payload.map((entry: any) => (
            <p
              key={entry.name}
              style={{ color: entry.color.substring(0, entry.color.length - 2) }}
            >
              {`${entry.name}: ${valueTickFormatter(entry.value)}`}
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
        width="100%"
        height={250}
        chartComp={BarChart}
        chartProps={{ data: plotData, stackOffset: 'sign' }}
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
          scale={scale}
          domain={scale === 'log' ? [1, 100000] : [0, max + 2000]}
          width={70}
          allowDataOverflow
        />
        <Bar
          dataKey="Undergrad Positives"
          fill="#ff0000bb"
          stackId="stack"
        />
        <Bar
          dataKey="Undergrad Tests"
          fill="#5f6d7dbb"
          stackId="stack"
        />
        <Bar
          dataKey="Non-undergrad Positives"
          fill="#ff000000"
          stackId="stack"
        />
        <Bar
          dataKey="Non-undergrad Tests"
          fill="#5f6d7d00"
          stackId="stack"
        />
        <ReferenceLine y={scale === 'log' ? 50000 : max} stroke="#0000" label="Undergraduates" />
      </ChartContainer>
      <ChartContainer
        title=""
        width="100%"
        height={250}
        chartComp={BarChart}
        chartProps={{ data: plotData, stackOffset: 'sign', style: { marginTop: -10 } }}
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
          scale={scale}
          domain={scale === 'log' ? [1, 100000] : [0, max + 2000]}
          width={70}
          reversed
          allowDataOverflow
        />
        <Bar
          dataKey="Non-undergrad Positives"
          fill="#ff0000bb"
          stackId="stack"
        />
        <Bar
          dataKey="Non-undergrad Tests"
          fill="#5f6d7dbb"
          stackId="stack"
        />
        <Bar
          dataKey="Undergrad Positives"
          fill="#ff000000"
          stackId="stack"
        />
        <Bar
          dataKey="Undergrad Tests"
          fill="#5f6d7d00"
          stackId="stack"
        />
        <ReferenceLine y={scale === 'log' ? 1 : 0} stroke="#000" />
        <ReferenceLine y={scale === 'log' ? 50000 : max * 0.95} stroke="#0000" label="Non-undergraduates" />
      </ChartContainer>
    </div>
  );
};

export default TestedBarChart;
