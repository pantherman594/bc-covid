import React, { useState } from 'react';
import moment from 'moment';
import { Pie, PieChart } from 'recharts';
import { CovidDataItem } from '../../types';

interface CurrentPositiveChartProps {
  data: CovidDataItem[];
}

const NUM_UNDERGRADS = 9000;
// Pad the pie with 1.5 degree on both sides, in case the value is too small to hover.
const PADDING = 1.5 * NUM_UNDERGRADS / 360;

const defaultProps = {
  dataKey: 'value',
  nameKey: 'name',
  cx: '50%',
  cy: '50%',
  startAngle: 450,
  endAngle: 90,
  blendStroke: true,
  paddingAngle: 0,
};

export const CurrentPositiveChart = (props: CurrentPositiveChartProps) => {
  const [activePie, setActivePie] = useState(0);

  const latest = props.data[props.data.length - 1];

  const lastDate = latest.date;
  const twoWeeksPrior = moment(lastDate).subtract(2, 'weeks').endOf('day');

  // Find the most recent data entry that is at least two weeks prior.
  const estNumRecovered = props.data.reduceRight((result: number, cur: CovidDataItem) => {
    if (result < 0 && twoWeeksPrior.isAfter(cur.date)) {
      return cur.undergradPositive;
    }

    return result;
  }, -1);

  // Estimate the current number of infected students as the number of total positive tests
  // minus the number of positive tests from two weeks ago. This assumes COVID-19 has a
  // two week recovery time.
  const curNumPositive = latest.undergradPositive - Math.max(0, estNumRecovered);

  const renderLabel = (props: any) => {
    const { cx, cy, payload } = props;

    const percent = (payload.value / NUM_UNDERGRADS) * 100;
    const percentStr = percent.toFixed(percent < 10 ? 2 : 1);

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={'#000'}>{payload.name}</text>
        { payload.percentage ? (
          <text x={cx} y={cy + 20} dy={8} textAnchor="middle" fill={'#333'}>({percentStr}%)</text>
        ) : null }
      </g>
    );
  };

  const onPieEnter = (pie: number) => (_data: any, index: number) => {
    if (index === 2) {
      setActivePie(0);
    } else {
      setActivePie(pie);
    }
  };

  return (
    <PieChart
      width={500}
      height={500}
    >
      {/* This pie renders the text in the center. */}
      <Pie
        {...defaultProps}
        activeIndex={activePie}
        activeShape={renderLabel}
        data={[
          {
            name: `Estimated Total Undergraduates: ${NUM_UNDERGRADS.toLocaleString()}`,
            value: NUM_UNDERGRADS,
            percentage: false,
          },
          {
            name: `Estimated Current Positive Cases: ${curNumPositive.toLocaleString()}`,
            value: curNumPositive,
            percentage: true,
          },
          {
            name: `Isolated Students: ${latest.isolation.toLocaleString()}`,
            value: latest.isolation,
            percentage: true,
          },
        ]}
        fill="#0000"
        innerRadius={'0%'}
        outerRadius={'75%'}
      />

      {/* This pie fills in the space between the next two pies. */}
      <Pie
        {...defaultProps}
        data={[{ name: 'Total', value: 1, fill: '#ccc' }]}
        innerRadius={'79%'}
        outerRadius={'83%'}
      />

      {/* This pie Renders the number of positive cases. */}
      <Pie
        {...defaultProps}
        data={[
          { name: 'Positive', value: curNumPositive, fill: '#bc0e02' },
          { name: 'Padding After', value: PADDING, fill: '#ccc' },
          { name: 'Remaining', value: NUM_UNDERGRADS - curNumPositive - PADDING * 2, fill: '#ccc' },
          { name: 'Padding After', value: PADDING, fill: '#ccc' },
        ]}
        innerRadius={'82%'}
        outerRadius={'100%'}
        stroke="none"
        onMouseEnter={onPieEnter(1)}
      />

      {/* This pie Renders the number of isolated students. */}
      <Pie
        {...defaultProps}
        data={[
          { name: 'Isolated', value: latest.isolation, fill: '#d95c00' },
          { name: 'Padding After', value: PADDING, fill: '#ccc' },
          { name: 'Remaining', value: NUM_UNDERGRADS - latest.isolation - PADDING * 2, fill: '#ccc' },
          { name: 'Padding Before', value: PADDING, fill: '#ccc' },
        ]}
        innerRadius={'75%'}
        outerRadius={'80%'}
        stroke="none"
        onMouseEnter={onPieEnter(2)}
      />
    </PieChart>
  );
};
