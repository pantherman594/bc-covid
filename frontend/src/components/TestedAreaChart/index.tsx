import React from 'react';
import moment from 'moment';
import { AreaChart, XAxis, YAxis, Area, Label } from 'recharts';
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

  const tickFormatter = (tick: number) => moment(tick).format('MM-DD-YYYY');

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
          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
        </linearGradient>
      </defs>

      <XAxis
        dataKey="date"
        tickFormatter={tickFormatter}
        type="number"
        scale="time"
        domain={['dataMin', 'dataMax']}
      >
        <Label value="Time" position="outside" offset={-50} />
      </XAxis>
      <YAxis>
        <Label value="# Students" position="outside" offset={10} />
      </YAxis>
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
        stroke="#8884d8"
        fillOpacity={1}
        fill="url(#colorUv)"
      />
    </ChartContainer>
  );
};
