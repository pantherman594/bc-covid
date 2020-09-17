import React from 'react';
import moment from 'moment';
import { ComposedChart, XAxis, YAxis, Legend, Line, Tooltip } from 'recharts';

import style from './style.module.css';
import { ChartContainer } from '../index';
import { create, CovidDataItem } from '../../types';
import getRecoveryDays from '../../utils/recoveryDays';

interface PercentPositiveChartProps {
  data: CovidDataItem[];
}

export const PercentPositiveChart = (props: PercentPositiveChartProps) => {
  // format date property from Date obj to milliseconds
  const toPlotData = (data: CovidDataItem[]): any[] => {
    const plotData: any[] = [];

    data.forEach((item: CovidDataItem, index: number, array: CovidDataItem[]) => {
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

      plotData.push({
        totalPercent: percentTotal,
        undergradPercent: percentUndergrad,
        communityPercent: percentCommunity,
        date: item.date.getTime(),
      });
    });

    let startIndex = 0;
    let totalSum = 0;
    let undergradSum = 0;
    let communitySum = 0;

    plotData.forEach((item: any, index: number) => {
      totalSum += item.totalPercent;
      undergradSum += item.undergradPercent;
      communitySum += item.communityPercent;

      const recoveryDays = getRecoveryDays(item.date, 7);

      if (index >= recoveryDays) {
        totalSum -= plotData[startIndex].totalPercent;
        undergradSum -= plotData[startIndex].undergradPercent;
        communitySum -= plotData[startIndex].communityPercent;

        startIndex += 1;
      }

      const items = Math.min(index + 1, 7);
      plotData[index].total7DayAvg = totalSum / items;
      plotData[index].undergrad7DayAvg = undergradSum / items;
      plotData[index].community7DayAvg = communitySum / items;
    });

    return plotData;
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
        dataKey="total7DayAvg"
        stroke="#5f6d7d"
        strokeDasharray="5 5"
      />
      <Line
        type="monotone"
        dataKey="undergrad7DayAvg"
        stroke="#8884d8"
        strokeDasharray="5 5"
      />
      <Line
        type="monotone"
        dataKey="community7DayAvg"
        stroke="#009dff"
        strokeDasharray="5 5"
      />
    </ChartContainer>
  );
};
