import React from 'react';
import moment from 'moment';
import {
  LineChart, XAxis, YAxis, Legend, Line, Tooltip,
} from 'recharts';

import style from './style.module.css';
import { ChartContainer } from '../index';
import { CovidDataItem } from '../../types';

// Assume 80% of all students and faculty return to campus. While this is not accurate, I
// couldn't find exact numbers so we'll use this just to compare the campuses.

// From https://www.bc.edu/content/dam/files/publications/factbook/pdf/19-20_factbook.pdf. Pages 25, 26, 28, 36.
//                      undergrad grad  staffFTE  profs facultyFTE
const BC_POP = Math.round((9370 + 4801 + 2621.45 + 878 + 1201.33) * 0.8);

// From https://facts.northeastern.edu/.
//                         undergrad grad     faculty staff  research pros
const NEU_POP = Math.round(((20400 + 17379) + (3092 + 2859 + 210)) * 0.8);

// From https://www.bu.edu/asir/files/2020/05/G3b-Fact-Sheet-FY2020.pdf.
//                       students faculty
const BU_POP = Math.round((34589 + 10517) * 0.8);

// From https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/.
const MASS_POP = 6892503; // From https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_county_population_usafacts.csv.
const SUFFOLK_POP = 803907; // From https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_county_population_usafacts.csv.

interface PopulationPercentChartProps {
  data: CovidDataItem[];
}

const PopulationPercentChart = (props: PopulationPercentChartProps) => {
  const { data } = props;

  const plotData = data.map((item: CovidDataItem, _i: number, array: CovidDataItem[]) => {
    const prev = array[item.recoveryIndex];
    if (!prev) return undefined;

    const bcPercent = (item.totalPositive - prev.totalPositive) / BC_POP;
    const buPercent = (item.buPositive - prev.buPositive) / BU_POP;
    const neuPercent = (item.neuPositive - prev.neuPositive) / NEU_POP;
    const suffolkPercent = (item.suffolkPositive - prev.suffolkPositive) / SUFFOLK_POP;
    const massPercent = (item.massPositive - prev.massPositive) / MASS_POP;

    return {
      BC: bcPercent,
      BU: buPercent,
      NEU: neuPercent,
      'Suffolk County': suffolkPercent,
      Massachusetts: massPercent,
      date: item.date.getTime(),
    };
  }).filter((entry: any) => entry !== undefined);

  const dateTickFormatter = (tick: number) => moment(tick).format('M/D');
  const percentTickFormatter = (tick: number) => `${(100 * tick).toFixed(2)}%`;

  const renderTooltipContent = (o: any) => {
    const { payload, label } = o;

    const pops = {
      BC: BC_POP,
      BU: BU_POP,
      NEU: NEU_POP,
      'Suffolk County': SUFFOLK_POP,
      Massachusetts: MASS_POP,
    } as any;

    return (
      <div className={style.customTooltip}>
        <p>{dateTickFormatter(label)}</p>
        {
          payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {`${entry.name}: ${percentTickFormatter(entry.value)} (${Math.round(pops[entry.name] * entry.value).toLocaleString()}/${pops[entry.name].toLocaleString()})`}
            </p>
          ))
        }
      </div>
    );
  };

  return (
    <ChartContainer
      title="7-Day Population Percent Newly Testing Positive"
      width="100%"
      height={500}
      chartComp={LineChart}
      chartProps={{ data: plotData }}
    >
      <XAxis
        dataKey="date"
        tickFormatter={dateTickFormatter}
        type="number"
        scale="time"
        domain={['auto', 'auto']}
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

export default PopulationPercentChart;
