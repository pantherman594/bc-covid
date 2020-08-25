import React from 'react';
import moment from 'moment';
import { LineChart, XAxis, YAxis, Legend, Line, Tooltip } from 'recharts';

import style from './style.module.css';
import { ChartContainer } from '../index';
import { create, CovidDataItem } from '../../types';

// Assume 80% of all students and faculty return to campus. While this is not accurate, I
// couldn't find exact numbers so we'll use this just to compare the campuses.

// From https://www.bc.edu/bc-web/about/bc-facts.html.
//            students faculty
const BC_POP = (14600 + 860) * 0.8;

// From https://facts.northeastern.edu/.
//              undergrad grad     faculty staff  research pros
const NEU_POP = ((20400 + 17379) + (3092 + 2859 + 210)) * 0.8;

// From https://www.bu.edu/asir/files/2020/05/G3b-Fact-Sheet-FY2020.pdf.
//            students faculty
const BU_POP = (34589 + 10517) * 0.8;

// From https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/.
const MASS_POP = 6892503; // From https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_county_population_usafacts.csv.
const SUFFOLK_POP = 803907; // From https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_county_population_usafacts.csv.

interface PopulationPercentChartProps {
  data: CovidDataItem[];
  recoveryDays: number;
}

export const PopulationPercentChart = (props: PopulationPercentChartProps) => {
  const toPlotData = (data: CovidDataItem[]): any[] => {
    return data.map((item: CovidDataItem, index: number, array: CovidDataItem[]) => {
      const prev = array[index - props.recoveryDays] || create();

      const bcPercent = (100 * (item.totalPositive - prev.totalPositive) / BC_POP).toFixed(2);
      const buPercent = (100 * (item.buPositive - prev.buPositive) / BU_POP).toFixed(2);
      const neuPercent = (100 * (item.neuPositive - prev.neuPositive) / NEU_POP).toFixed(2);
      const suffolkPercent = (100 * (item.suffolkPositive - prev.suffolkPositive) / SUFFOLK_POP).toFixed(2);
      const massPercent = (100 * (item.massPositive - prev.massPositive) / MASS_POP).toFixed(2);

      return {
        BC: bcPercent,
        BU: buPercent,
        NEU: neuPercent,
        'Suffolk County': suffolkPercent,
        Massachusetts: massPercent,
        date: item.date.getTime(),
      };
    });
  };

  const dateTickFormatter = (tick: number) => moment(tick).format('M/D');
  const percentTickFormatter = (tick: number) => `${tick}%`;

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
      title="Population Percent Infected per Day"
      width={'80%'}
      height={500}
      chartComp={LineChart}
      chartProps={{ data: toPlotData(props.data), syncId: "syncTestPercent" }}
    >
      <defs>
        <linearGradient id="colorPTotal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#009dff" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#009dff" stopOpacity={0.2} />
        </linearGradient>
        <linearGradient id="colorPUnder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2} />
        </linearGradient>
      </defs>

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
        dataKey="BC"
        stroke="#8a100b"
      />
      <Line
        type="monotone"
        dataKey="BU"
        stroke="#cc0000"
      />
      <Line
        type="monotone"
        dataKey="NEU"
        stroke="#d41b2c"
      />
      <Line
        type="monotone"
        dataKey="Suffolk County"
        stroke="#8884d8"
      />
      <Line
        type="monotone"
        dataKey="Massachusetts"
        stroke="#009dff"
      />
    </ChartContainer>
  );
};
