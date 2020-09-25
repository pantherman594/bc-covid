import React from 'react';
import moment from 'moment';
import { ComposedChart, XAxis, YAxis, Legend, Line, Tooltip } from 'recharts';

import style from './style.module.css';
import { ChartContainer } from '../index';
import { create, CovidDataItem } from '../../types';

interface PercentPositiveChartProps {
  data: CovidDataItem[];
}

export const PercentPositiveChart = (props: PercentPositiveChartProps) => {
  // format date property from Date obj to milliseconds
  const toPlotData = (data: CovidDataItem[]): any[] => {
    if (data.length === 0) return [];

    const averages: any[] = [];

    data.forEach((item: any) => {
      let { totalTested, undergradTested, totalPositive, undergradPositive } = item;
      let communityTested = totalTested - undergradTested;
      let communityPositive = totalPositive - undergradPositive;

      if (item.recoveryIndex > -1) {
        const rI = item.recoveryIndex;

        totalTested -= data[rI].totalTested;
        totalPositive -= data[rI].totalPositive;
        undergradTested -= data[rI].undergradTested;
        undergradPositive -= data[rI].undergradPositive;
        communityTested -= data[rI].totalTested - data[rI].undergradTested;
        communityPositive -= data[rI].totalPositive - data[rI].undergradPositive;
      }

      averages.push({
        total7Day: totalPositive <= 0 ? 0 : totalPositive / totalTested,
        undergrad7Day: undergradPositive <= 0 ? 0 : undergradPositive / undergradTested,
        community7Day: communityPositive <= 0 ? 0 : communityPositive / communityTested,
      });
    });

    return data.map((item: CovidDataItem, index: number, array: CovidDataItem[]) => {
      const prev = array[index - 1] || create();

      const totalPositive = item.totalPositive - prev.totalPositive;
      const totalTested = item.totalTested - prev.totalTested;
      const percentTotal = totalTested <= 0 ? 0
        : totalPositive / totalTested;

      const undergradPositive = item.undergradPositive - prev.undergradPositive;
      const undergradTested = item.undergradTested - prev.undergradTested;
      const percentUndergrad = undergradTested <= 0 ? 0
        : undergradPositive / undergradTested;

      const communityPositive = totalPositive - undergradPositive;
      const communityTested = totalTested - undergradTested;
      const percentCommunity = communityTested <= 0 ? 0
        : communityPositive / communityTested;

      return {
        totalPercent: percentTotal,
        undergradPercent: percentUndergrad,
        communityPercent: percentCommunity,
        ...averages[index],
        date: item.date.getTime(),
      };
    });
  };

  const dateTickFormatter = (tick: number) => moment(tick).format('M/D');
  const percentTickFormatter = (tick: number) => {
    if (tick === 0) return '0%';

    let places = 2;
    if (tick >= 0.01) places = 1;
    if (tick >= 0.1) places = 0;

    return `${(100 * tick).toFixed(places)}%`;
  };

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
      chartComp={ComposedChart}
      chartProps={{ data: toPlotData(props.data), syncId: "syncTestPercent" }}
    >
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
        dataKey="totalPercent"
        stroke="#5f6d7d"
      />
      <Line
        type="monotone"
        dataKey="undergradPercent"
        stroke="#8884d8"
      />
      <Line
        type="monotone"
        dataKey="communityPercent"
        stroke="#009dff"
      />
      <Line
        type="monotone"
        dataKey="total7Day"
        stroke="#5f6d7d"
        strokeDasharray="5 5"
      />
      <Line
        type="monotone"
        dataKey="undergrad7Day"
        stroke="#8884d8"
        strokeDasharray="5 5"
      />
      <Line
        type="monotone"
        dataKey="community7Day"
        stroke="#009dff"
        strokeDasharray="5 5"
      />
    </ChartContainer>
  );
};
