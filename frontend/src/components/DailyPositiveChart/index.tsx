import React, { useState } from 'react';
import moment from 'moment';
import { ComposedChart, XAxis, YAxis, Legend, Bar, Line, Tooltip } from 'recharts';

import style from './style.module.css';
import { ChartContainer } from '../index';
import { create, CovidDataItem } from '../../types';

interface DailyPositiveChartProps {
  data: CovidDataItem[];
  scale: 'log' | 'linear';
}

export const DailyPositiveChart = (props: DailyPositiveChartProps) => {
  const [toggles, setToggles] = useState({
    totalPositive: false,
    undergradPositive: false,
    communityPositive: false,
    total7DayAvg: false,
    undergrad7DayAvg: false,
    community7DayAvg: false,
    percent: false,
  });

  // format date property from Date obj to milliseconds
  const toPlotData = (data: CovidDataItem[]): any[] => {
    const averages: any[] = [];

    data.forEach((item: CovidDataItem) => {
      let totalSum = item.totalPositive;
      let undergradSum = item.undergradPositive;
      let communitySum = item.totalPositive - item.undergradPositive;

      if (item.recoveryIndex > -1) {
        const rI = item.recoveryIndex;
        totalSum -= data[rI].totalPositive;
        undergradSum -= data[rI].undergradPositive;
        communitySum -= data[rI].totalPositive - data[rI].undergradPositive;
      }

      const items = item.recoveryIndex < 0
        ? item.daysSinceFirst + 1
        : item.daysSinceFirst - data[item.recoveryIndex].daysSinceFirst;
      averages.push({
        total7DayAvg: totalSum / items,
        undergrad7DayAvg: undergradSum / items,
        community7DayAvg: communitySum / items,
      })
    });

    return data.map((item: CovidDataItem, index: number, array: CovidDataItem[]) => {
      const prev = array[index - 1] || create();

      const totalPositive = item.totalPositive - prev.totalPositive;
      const undergradPositive = item.undergradPositive - prev.undergradPositive;
      const communityPositive = totalPositive - undergradPositive;

      return {
        totalPositive,
        undergradPositive,
        communityPositive,
        ...averages[index],
        date: item.date.getTime(),
      };
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
              {`${entry.name}: ${Math.round(entry.value)}`}
            </p>
          ))
        }
      </div>
    );
  };

  return (
    <ChartContainer
      title="Positive Test Results per Day"
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
        orientation="left"
        scale={props.scale}
        domain={[props.scale === 'log' ? 0.5 : 'auto', 'auto']}
        allowDataOverflow
      />
      <Tooltip content={renderTooltipContent} />
      <Legend 
        onClick={(dataProps: any) => {
          let key = dataProps.dataKey;
          if (key.includes('Percent')) key = 'percent';
          setToggles((toggles: any) => {
            return {
              ...toggles,
              [key]: !toggles[key],
            };
          });
        }}
      />
      <Bar
        stackId="1"
        dataKey="undergradPositive"
        stroke="#8884d8bb"
        fillOpacity={1}
        fill="url(#colorUndergrad)"
        hide={toggles.undergradPositive}
      />
      <Bar
        stackId="1"
        dataKey="communityPositive"
        stroke="#009dffbb"
        fillOpacity={1}
        fill="url(#colorCommunity)"
        hide={toggles.communityPositive}
      />
      <Line
        type="monotone"
        dataKey="total7DayAvg"
        stroke="#5f6d7d"
        strokeDasharray="5 5"
        hide={toggles.total7DayAvg}
      />
      <Line
        type="monotone"
        dataKey="undergrad7DayAvg"
        stroke="#8884d8"
        strokeDasharray="5 5"
        hide={toggles.undergrad7DayAvg}
      />
      <Line
        type="monotone"
        dataKey="community7DayAvg"
        stroke="#009dff"
        strokeDasharray="5 5"
        hide={toggles.community7DayAvg}
      />
    </ChartContainer>
  );
};
