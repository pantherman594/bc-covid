import React, { useState } from 'react';
import style from './style.module.css';
import { Pie, PieChart, ResponsiveContainer } from 'recharts';
import { create, CovidDataItem } from '../../types';

interface DialChartProps {
  data: CovidDataItem[];
  recoveryDays: number;
}

const NUM_UNDERGRADS = 8000;
const NUM_COMMUNITY = 10000;
// Pad the pie with 1.5 degree on both sides, in case the value is too small to hover.
const PADDING_UNDERGRADS = 1.5 * NUM_UNDERGRADS / 360;
const PADDING_COMMUNITY = 1.5 * NUM_COMMUNITY / 360;
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

const noStroke = {
  blendStroke: false,
  stroke: 'none',
};

export const DialChart = (props: DialChartProps) => {
  const [activePie, setActivePie] = useState(0);

  if (props.data.length === 0) return null;

  const latest = props.data[props.data.length - 1];

  // Estimate the current number of infected students as the number of total positive tests
  // minus the number of positive tests from recoveryDays days ago. This assumes someone with
  // COVID-19 will recover in recoveryDays days.
  const recoveryData = props.data[props.data.length - 1 - Math.floor(props.recoveryDays / 2)] || create();

  const curNumRecovered = Math.max(-1, latest.recovered - recoveryData.recovered);

  const curNumPositive = Math.max(-1, latest.undergradPositive - recoveryData.undergradPositive);
  const curNumTested = Math.max(-1, latest.undergradTested - recoveryData.undergradTested);

  const curNumCommunityPositive = Math.max(-1, (latest.totalPositive - latest.undergradPositive)
    - (recoveryData.totalPositive - recoveryData.undergradPositive));
  const curNumCommunityTested = Math.max(-1, (latest.totalTested - latest.undergradTested)
    - (recoveryData.totalTested - recoveryData.undergradTested));

  const renderLabel = (props: any) => {
    const { cx, cy, payload } = props;

    const percent = (payload.percentage || 0) * 100;
    const percentStr = percent.toFixed(percent < 10 ? 2 : 1);

    return (
      <g>
        <rect x={cx - 180} y={cy - 12} width={360} height={payload.percentage ? 50 : 30} fill={'#0005'} />
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={'#fff'}>{payload.name}</text>
        { payload.percentage ? (
          <text x={cx} y={cy + 20} dy={8} textAnchor="middle" fill={'#ccc'}>({percentStr}%)</text>
        ) : null }
      </g>
    );
  };

  const onPieEnter = (pie: number) => (_data: any, index: number) => {
    if ((pie === 6 && index === 3) || (pie !== 6 && index === 2)) {
      setActivePie(pie < 4 ? 0 : 1);
    } else {
      if (pie === 6 && (index === 1 || index === 2)) {
        setActivePie(7);
      } else {
        setActivePie(pie);
      }
    }
  };

  let recoveryDuration = `${props.recoveryDays} days`;
  if (props.recoveryDays === 1) {
    recoveryDuration = 'day';
  }

  const numberFormat = (n: number): string => {
    if (n === -1) {
      return '< 0 *';
    }

    return n.toLocaleString();
  };

  return (
    <div className={style['chart-container']}>
      <ResponsiveContainer
        width={'100%'}
        aspect={1}
      >
        <PieChart
        >
          {/* This pie fills in the space between the outer pies. */}
          <Pie
            {...defaultProps}
            {...noStroke}
            data={[{ name: 'Total', value: 1 }]}
            fill="#5f6d7daa"
            innerRadius={'75%'}
            outerRadius={'100%'}
          />

          {/* This pie renders the number of positive cases. */}
          <Pie
            {...defaultProps}
            data={[
              { name: 'Positive', value: curNumCommunityPositive, fill: '#bc0e02' },
              { name: 'Padding After', value: PADDING_COMMUNITY, fill: BG_COLOR },
              { name: 'Remaining', value: NUM_COMMUNITY - curNumCommunityPositive - PADDING_COMMUNITY * 2, fill: BG_COLOR },
              { name: 'Padding After', value: PADDING_COMMUNITY, fill: BG_COLOR },
            ]}
            innerRadius={'82%'}
            outerRadius={'100%'}
            onMouseEnter={onPieEnter(2)}
          />

          {/* This pie renders the number of tested community. */}
          <Pie
            {...defaultProps}
            data={[
              { name: 'Tested', value: curNumCommunityTested, fill: '#ebc634' },
              { name: 'Padding After', value: PADDING_COMMUNITY, fill: BG_COLOR },
              { name: 'Remaining', value: NUM_COMMUNITY - curNumCommunityTested - PADDING_COMMUNITY * 2, fill: BG_COLOR },
              { name: 'Padding After', value: PADDING_COMMUNITY, fill: BG_COLOR },
            ]}
            innerRadius={'75%'}
            outerRadius={'80%'}
            onMouseEnter={onPieEnter(3)}
          />

          {/* This pie fills in the space between the inner pies. */}
          <Pie
            {...defaultProps}
            {...noStroke}
            data={[{ name: 'Total', value: 1 }]}
            fill="#5f6d7daa"
            innerRadius={'10%'}
            outerRadius={'65%'}
          />

          {/* This pie renders the number of tested students. */}
          <Pie
            {...defaultProps}
            data={[
              { name: 'Tested', value: curNumTested, fill: '#ebc634' },
              { name: 'Padding After', value: PADDING_UNDERGRADS, fill: BG_COLOR },
              { name: 'Remaining', value: NUM_UNDERGRADS - curNumTested - PADDING_UNDERGRADS * 2, fill: BG_COLOR },
              { name: 'Padding After', value: PADDING_UNDERGRADS, fill: BG_COLOR },
            ]}
            innerRadius={'60%'}
            outerRadius={'65%'}
            onMouseEnter={onPieEnter(4)}
          />

          {/* This pie renders the number of positive cases. */}
          <Pie
            {...defaultProps}
            data={[
              { name: 'Positive', value: curNumPositive, fill: '#bc0e02' },
              { name: 'Padding After', value: PADDING_UNDERGRADS, fill: BG_COLOR },
              { name: 'Remaining', value: NUM_UNDERGRADS - curNumPositive - PADDING_UNDERGRADS * 2, fill: BG_COLOR },
              { name: 'Padding After', value: PADDING_UNDERGRADS, fill: BG_COLOR },
            ]}
            innerRadius={'20%'}
            outerRadius={'58%'}
            onMouseEnter={onPieEnter(5)}
          />

          {/* This pie renders the number of isolated and recovered students. */}
          <Pie
            {...defaultProps}
            data={[
              { name: 'Isolated', value: latest.isolation, fill: '#d95c00' },
              { name: 'Recovered', value: curNumRecovered, fill: '#3dbd00' },
              { name: 'Padding After', value: PADDING_UNDERGRADS, fill: BG_COLOR },
              { name: 'Remaining', value: NUM_UNDERGRADS - latest.isolation - curNumRecovered - PADDING_UNDERGRADS * 2, fill: BG_COLOR },
              { name: 'Padding Before', value: PADDING_UNDERGRADS, fill: BG_COLOR },
            ]}
            innerRadius={'10%'}
            outerRadius={'18%'}
            onMouseEnter={onPieEnter(6)}
          />

          {/* This pie renders the text in the center. */}
          <Pie
            {...defaultProps}
            activeIndex={activePie}
            activeShape={renderLabel}
            data={[
              {
                name: `Estimated total community: ${numberFormat(NUM_COMMUNITY)}`,
                value: NUM_UNDERGRADS,
              },
              {
                name: `Estimated total undergrads: ${numberFormat(NUM_UNDERGRADS)}`,
                value: NUM_UNDERGRADS,
              },
              {
                name: `Positive community tests in the last ${recoveryDuration}: ${numberFormat(curNumCommunityPositive)}`,
                value: curNumPositive,
                percentage: curNumCommunityPositive / NUM_COMMUNITY,
              },
              {
                name: `Community tests in the last ${recoveryDuration}: ${numberFormat(curNumCommunityTested)}`,
                value: curNumTested,
                percentage: curNumCommunityTested / NUM_COMMUNITY,
              },
              {
                name: `Undergrad tests in the last ${recoveryDuration}: ${numberFormat(curNumTested)}`,
                value: curNumTested,
                percentage: curNumTested / NUM_UNDERGRADS,
              },
              {
                name: `Positive undergrad tests in the last ${recoveryDuration}: ${numberFormat(curNumPositive)}`,
                value: curNumPositive,
                percentage: curNumPositive / NUM_UNDERGRADS,
              },
              {
                name: `Isolated students: ${numberFormat(latest.isolation)}`,
                value: latest.isolation,
                percentage: latest.isolation / NUM_UNDERGRADS,
              },
              {
                name: `Recovered undergrads in the last ${recoveryDuration}: ${numberFormat(curNumRecovered)}`,
                value: curNumRecovered,
                percentage: curNumRecovered / NUM_UNDERGRADS,
              },
            ]}
            fill="#0000"
            innerRadius={'0%'}
            outerRadius={'1%'}
          />

        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
