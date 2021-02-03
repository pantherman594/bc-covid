import React from 'react';
import moment from 'moment';
import {
  ComposedChart, XAxis, YAxis, Legend, Bar, Line, Tooltip,
} from 'recharts';

import style from './style.module.css';
import { ChartContainer } from '../index';
import { CovidDataItem } from '../../types';

interface CumulativeTestedChartProps {
  data: CovidDataItem[];
  scale: 'log' | 'linear';
}

const CumulativeTestedChart = (props: CumulativeTestedChartProps) => {
  const { data: rawData, scale } = props;

  // format date property from Date obj to milliseconds
  const toPlotData = (data: CovidDataItem[]): any[] => {
    if (data.length === 0) return [];

    const averages: any[] = [];

    let startIndex = 0;
    let totalSum = 0;
    let undergradSum = 0;
    let communitySum = 0;

    data.forEach((item: CovidDataItem, index: number) => {
      totalSum += item.totalTested;
      undergradSum += item.undergradTested;
      communitySum += item.totalTested - item.undergradTested;

      while (item.recoveryIndex >= startIndex) {
        totalSum -= data[startIndex].totalTested;
        undergradSum -= data[startIndex].undergradTested;
        communitySum -= data[startIndex].totalTested - data[startIndex].undergradTested;

        startIndex += 1;
      }

      const items = item.recoveryIndex < 0 ? item.daysSinceFirst + 1 : (index - item.recoveryIndex);
      averages.push({
        'Total 7 Day Average': totalSum / items,
        'Undergrad 7 Day Average': undergradSum / items,
        'Non-undergrad 7 Day Average': communitySum / items,
      });
    });

    return data.map((item: CovidDataItem, index: number) => ({
      Total: item.totalTested,
      Undergrads: item.undergradTested,
      'Non-undergrads': item.totalTested - item.undergradTested,
      ...averages[index],
      date: item.date.getTime(),
    }));
  };

  const dateTickFormatter = (tick: number) => {
    let str = moment(tick).format('M/D');

    if (str === '9/3') str += '*';

    return str;
  };

  const renderTooltipContent = (o: any) => {
    const { payload, label } = o;

    return (
      <div className={style.customTooltip}>
        <p>{dateTickFormatter(label)}</p>
        {
          payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {`${entry.name}: ${Math.round(entry.value)}`}
            </p>
          ))
        }
      </div>
    );
  };

  return (
    <ChartContainer
      title="Cumulative Tests"
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
        domain={['dataMin - 43200000', 'dataMax + 43200000']}
      />
      <YAxis
        scale={scale}
        domain={[1, 'dataMax']}
        allowDataOverflow
      />
      <Tooltip content={renderTooltipContent} />
      <Legend />
      <Bar
        dataKey="Undergrads"
        stroke="#8884d8bb"
        fillOpacity={1}
        fill="url(#colorUndergrad)"
      />
      <Bar
        dataKey="Non-undergrads"
        stroke="#009dffbb"
        fillOpacity={1}
        fill="url(#colorCommunity)"
      />
      <Line
        type="monotone"
        dataKey="Undergrad 7 Day Average"
        stroke="#8884d8"
      />
      <Line
        type="monotone"
        dataKey="Non-undergrad 7 Day Average"
        stroke="#009dff"
      />
      <Line
        type="monotone"
        dataKey="Total 7 Day Average"
        stroke="#5f6d7d"
      />
    </ChartContainer>
  );
};

export default CumulativeTestedChart;
