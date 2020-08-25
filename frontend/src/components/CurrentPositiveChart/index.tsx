import React, { useState } from 'react';
import moment from 'moment';
import './styles.css';
import { Pie, PieChart } from 'recharts';
import { create, CovidDataItem } from '../../types';

interface CurrentPositiveChartProps {
  data: CovidDataItem[];
  recoveryDays: number;
}

const NUM_UNDERGRADS = 8500;
// Pad the pie with 1.5 degree on both sides, in case the value is too small to hover.
const PADDING = 1.5 * NUM_UNDERGRADS / 360;
const BG_COLOR = "#0000";

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

  if (props.data.length === 0) return null;

  const latest = props.data[props.data.length - 1];

  // Estimate the current number of infected students as the number of total positive tests
  // minus the number of positive tests from recoveryDays days ago. This assumes someone with
  // COVID-19 will recover in recoveryDays days.
  const recoveryData = props.data[props.data.length - 1 - props.recoveryDays] || create();

  const curNumPositive = latest.undergradPositive - recoveryData.undergradPositive;
  const curNumTested = latest.undergradTested - recoveryData.undergradTested;

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

  let recoveryDuration = `${props.recoveryDays} days`;
  if (props.recoveryDays === 1) {
    recoveryDuration = 'day';
  }

  return (
    <div className='chart-container'>
      <PieChart
        width={500}
        height={500}
      >
        {/* This pie fills in the space between the next pies. */}
        <Pie
          {...defaultProps}
          data={[{ name: 'Total', value: 1 }]}
          fill="#5f6d7daa"
          innerRadius={'60%'}
          outerRadius={'100%'}
        />

        {/* This pie renders the number of positive cases. */}
        <Pie
          {...defaultProps}
          data={[
            { name: 'Tested', value: curNumTested, fill: '#3dbd00' },
            { name: 'Padding After', value: PADDING, fill: BG_COLOR },
            { name: 'Remaining', value: NUM_UNDERGRADS - curNumTested - PADDING * 2, fill: BG_COLOR },
            { name: 'Padding After', value: PADDING, fill: BG_COLOR },
          ]}
          innerRadius={'60%'}
          outerRadius={'65%'}
          stroke="none"
          onMouseEnter={onPieEnter(1)}
        />

        {/* This pie renders the number of positive cases. */}
        <Pie
          {...defaultProps}
          data={[
            { name: 'Positive', value: curNumPositive, fill: '#bc0e02' },
            { name: 'Padding After', value: PADDING, fill: BG_COLOR },
            { name: 'Remaining', value: NUM_UNDERGRADS - curNumPositive - PADDING * 2, fill: BG_COLOR },
            { name: 'Padding After', value: PADDING, fill: BG_COLOR },
          ]}
          innerRadius={'67%'}
          outerRadius={'93%'}
          stroke="none"
          onMouseEnter={onPieEnter(2)}
        />

        {/* This pie renders the number of isolated students. */}
        <Pie
          {...defaultProps}
          data={[
            { name: 'Isolated', value: latest.isolation, fill: '#d95c00' },
            { name: 'Padding After', value: PADDING, fill: BG_COLOR },
            { name: 'Remaining', value: NUM_UNDERGRADS - latest.isolation - PADDING * 2, fill: BG_COLOR },
            { name: 'Padding Before', value: PADDING, fill: BG_COLOR },
          ]}
          innerRadius={'95%'}
          outerRadius={'100%'}
          stroke="none"
          onMouseEnter={onPieEnter(3)}
        />
        {/* This pie renders the text in the center. */}
        <Pie
          {...defaultProps}
          activeIndex={activePie}
          activeShape={renderLabel}
          data={[
            {
              name: `Estimated total undergrads: ${NUM_UNDERGRADS.toLocaleString()}`,
              value: NUM_UNDERGRADS,
              percentage: false,
            },
            {
              name: `Tests in the last ${recoveryDuration}: ${curNumTested.toLocaleString()}`,
              value: curNumTested,
              percentage: true,
            },
            {
              name: `Estimated current positive cases: ${curNumPositive.toLocaleString()}`,
              value: curNumPositive,
              percentage: true,
            },
            {
              name: `Isolated students: ${latest.isolation.toLocaleString()}`,
              value: latest.isolation,
              percentage: true,
            },
          ]}
          fill="#0000"
          innerRadius={'0%'}
          outerRadius={'60%'}
        />

      </PieChart>
    </div>
  );
};
