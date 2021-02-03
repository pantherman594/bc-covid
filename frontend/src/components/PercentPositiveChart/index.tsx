import React from 'react';
import moment from 'moment';
import {
  ComposedChart, XAxis, YAxis, Legend, Line, Tooltip,
} from 'recharts';

import style from './style.module.css';
import { ChartContainer } from '../index';
import { create, CovidDataItem } from '../../types';

interface PercentPositiveChartProps {
  data: CovidDataItem[];
}

const PercentPositiveChart = (props: PercentPositiveChartProps) => {
  const { data: rawData } = props;
  // format date property from Date obj to milliseconds
  const toPlotData = (data: CovidDataItem[]): any[] => {
    if (data.length === 0) return [];

    const averages: any[] = [];

    data.forEach((item: any) => {
      let {
        totalTested, undergradTested, totalPositive, undergradPositive,
      } = item;
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
        'Total 7 Day Percent': totalPositive <= 0 ? 0 : totalPositive / totalTested,
        'Undergrad 7 Day Percent': undergradPositive <= 0 ? 0 : undergradPositive / undergradTested,
        'Non-undergrad 7 Day Percent': communityPositive <= 0 ? 0 : communityPositive / communityTested,
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
        Total: percentTotal,
        Undergrads: percentUndergrad,
        'Non-undergrads': percentCommunity,
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
          payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }}>
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
      width="100%"
      height={500}
      chartComp={ComposedChart}
      chartProps={{ data: toPlotData(rawData), syncId: 'syncTestPercent' }}
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
        dataKey="Total"
        stroke="#5f6d7d"
      />
      <Line
        type="monotone"
        dataKey="Undergrads"
        stroke="#8884d8"
      />
      <Line
        type="monotone"
        dataKey="Non-undergrads"
        stroke="#009dff"
      />
      <Line
        type="monotone"
        dataKey="Total 7 Day Percent"
        stroke="#5f6d7d"
        strokeDasharray="5 5"
      />
      <Line
        type="monotone"
        dataKey="Undergrad 7 Day Percent"
        stroke="#8884d8"
        strokeDasharray="5 5"
      />
      <Line
        type="monotone"
        dataKey="Non-undergrad 7 Day Percent"
        stroke="#009dff"
        strokeDasharray="5 5"
      />
    </ChartContainer>
  );
};

export default PercentPositiveChart;
