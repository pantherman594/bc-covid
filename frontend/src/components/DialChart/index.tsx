import React, { useState } from 'react';
import { Pie, PieChart, ResponsiveContainer } from 'recharts';
import Color from 'color';
import style from './style.module.css';
import { create, CovidDataItem } from '../../types';

interface DialChartProps {
  data: CovidDataItem[];
  recoveryDays: number;
}

const NUM_UNDERGRADS = 8600;
const NUM_COMMUNITY = 6500;
// Pad the pie with 1.5 degree on both sides, in case the value is too small to hover.
const PADDING_UNDERGRADS = 1.5 * (NUM_UNDERGRADS / 360);
const PADDING_COMMUNITY = 1.5 * (NUM_COMMUNITY / 360);
const BG_COLOR = '#0000';

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

const interpolateColors = (colors: string[], colorCount: number) => {
  if (colors.length === 0) {
    return Array(colorCount).fill('#000000');
  }
  if (colors.length === 1) {
    return Array(colorCount).fill(colors[0]);
  }
  const colorArray = [];

  for (let i = 0; i < colors.length - 1; i += 1) {
    const start = Color(colors[i]).object();
    const end = Color(colors[i + 1]).object();
    colorArray.push(Color(start).hex());
    const segmentLength: number = i === colors.length - 2
      ? colorCount - colorArray.length - 1
      : Math.round(colorCount / colors.length);

    const deltaBlend = 1.0 / (segmentLength + 1);
    for (
      let j = 0, blend = deltaBlend;
      j < segmentLength;
      j += 1, blend += deltaBlend
    ) {
      const r = end.r * blend + (1 - blend) * start.r;
      const g = end.g * blend + (1 - blend) * start.g;
      const b = end.b * blend + (1 - blend) * start.b;

      colorArray.push(Color.rgb(r, g, b).hex());
    }
  }

  colorArray.push(Color(colors[colors.length - 1]).hex());
  return colorArray;
};

const DialChart = (props: DialChartProps) => {
  const { data, recoveryDays } = props;

  const [activePie, setActivePie] = useState(0);

  if (data.length === 0) return null;

  const latest = data[data.length - 1];

  // Estimate the current number of infected students as the number of total positive tests
  // minus the number of positive tests from recoveryDays days ago. This assumes someone with
  // COVID-19 will recover in recoveryDays days.
  const recoveryData = data[latest.recoveryIndex] || create();

  const curNumRecovered = Math.max(-1, latest.undergradRecovered - recoveryData.undergradRecovered);

  const curNumPositive = Math.max(-1, latest.undergradPositive - recoveryData.undergradPositive);
  const curNumTested = Math.max(-1, latest.undergradTested - recoveryData.undergradTested);

  const curNumCommunityPositive = Math.max(-1, (latest.totalPositive - latest.undergradPositive)
    - (recoveryData.totalPositive - recoveryData.undergradPositive));
  const curNumCommunityTested = Math.max(-1, (latest.totalTested - latest.undergradTested)
    - (recoveryData.totalTested - recoveryData.undergradTested));

  const renderLabel = (labelProps: any) => {
    const { cx, cy, payload } = labelProps;

    const percent = (payload.percentage || 0) * 100;
    const percentStr = percent.toFixed(percent < 10 ? 2 : 1);

    return (
      <g>
        <rect x={cx - 180} y={cy - 12} width={360} height={payload.percentage ? 50 : 30} fill="#0005" />
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#fff">{payload.name}</text>
        { payload.percentage ? (
          <text x={cx} y={cy + 20} dy={8} textAnchor="middle" fill="#ccc">
            (
            {percentStr}
            %)
          </text>
        ) : null }
      </g>
    );
  };

  const renderGradientSector = (spiralProps: any) => {
    const RADIAN = Math.PI / 180;
    const {
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    } = spiralProps;
    const r = (innerRadius + outerRadius) / 2;
    const width = outerRadius - innerRadius;

    const precision = 2;
    const size = Math.ceil((startAngle - endAngle) / precision);
    const minColors = Math.ceil(360 / precision);

    const color = interpolateColors(['#f3e75b', '#f58d1e'], Math.max(minColors, size));

    const trim = endAngle + 360;

    const paths = Array.from({ length: size }, (_v, i) => {
      const start = endAngle + i * precision;

      if (start > trim) return null;

      const end = start + precision + 0.5;
      const sx = cx + r * Math.cos(-RADIAN * start);
      const sy = cy + r * Math.sin(-RADIAN * start);
      const ex = cx + r * Math.cos(-RADIAN * end);
      const ey = cy + r * Math.sin(-RADIAN * end);

      return (
        <path
          key={`path-${i}`}
          d={`M ${sx} ${sy} A ${r} ${r} 0 0 0 ${ex} ${ey}`}
          stroke={color[size - 1 - i]}
          strokeWidth={width}
          fill={color[size - 1 - i]}
        />
      );
    });

    paths.reverse();

    return <g>{paths}</g>;
  };

  const onPieEnter = (pie: number) => (_data: any, index: number) => {
    if ((pie === 6 && index === 3) || (pie !== 6 && index === 2)) {
      setActivePie(pie < 4 ? 0 : 1);
    } else if (pie === 6 && (index === 1 || index === 2)) {
      setActivePie(7);
    } else {
      setActivePie(pie);
    }
  };

  let recoveryDuration = `${recoveryDays} days`;
  if (recoveryDays === 1) {
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
        width="100%"
        aspect={1}
      >
        <PieChart>
          {/* This pie fills in the space between the outer pies. */}
          <Pie
            {...defaultProps}
            {...noStroke}
            data={[{ name: 'Total', value: 1 }]}
            fill="#5f6d7daa"
            innerRadius="75%"
            outerRadius="100%"
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
            innerRadius="82%"
            outerRadius="100%"
            onMouseEnter={onPieEnter(2)}
          />

          {/* This pie renders the number of tested community. */}
          <Pie
            {...defaultProps}
            activeIndex={0}
            activeShape={renderGradientSector}
            data={[
              { name: 'Tested', value: curNumCommunityTested },
              { name: 'Padding After', value: PADDING_COMMUNITY, fill: BG_COLOR },
              { name: 'Remaining', value: NUM_COMMUNITY - curNumCommunityTested - PADDING_COMMUNITY * 2, fill: BG_COLOR },
              { name: 'Padding After', value: PADDING_COMMUNITY, fill: BG_COLOR },
            ]}
            innerRadius="75%"
            outerRadius="80%"
            onMouseEnter={onPieEnter(3)}
          />
          {/* Hover for tested community. */}
          <Pie
            {...defaultProps}
            data={[
              { name: 'Tested', value: curNumCommunityTested, fill: BG_COLOR },
              { name: 'Padding After', value: PADDING_COMMUNITY, fill: BG_COLOR },
              { name: 'Remaining', value: Math.max(NUM_COMMUNITY - curNumCommunityTested, 0) - PADDING_COMMUNITY * 2, fill: BG_COLOR },
              { name: 'Padding After', value: PADDING_COMMUNITY, fill: BG_COLOR },
            ]}
            innerRadius="75%"
            outerRadius="80%"
            onMouseEnter={onPieEnter(3)}
          />

          {/* This pie fills in the space between the inner pies. */}
          <Pie
            {...defaultProps}
            {...noStroke}
            data={[{ name: 'Total', value: 1 }]}
            fill="#5f6d7daa"
            innerRadius="10%"
            outerRadius="65%"
          />

          {/* This pie renders the number of tested students. */}
          <Pie
            {...defaultProps}
            activeIndex={0}
            activeShape={renderGradientSector}
            data={[
              { name: 'Tested', value: curNumTested },
              { name: 'Padding After', value: PADDING_UNDERGRADS, fill: BG_COLOR },
              { name: 'Remaining', value: NUM_UNDERGRADS - curNumTested - PADDING_UNDERGRADS * 2, fill: BG_COLOR },
              { name: 'Padding After', value: PADDING_UNDERGRADS, fill: BG_COLOR },
            ]}
            innerRadius="60%"
            outerRadius="65%"
          />
          {/* Hover for tested students. */}
          <Pie
            {...defaultProps}
            data={[
              { name: 'Tested', value: curNumTested, fill: BG_COLOR },
              { name: 'Padding After', value: PADDING_UNDERGRADS, fill: BG_COLOR },
              { name: 'Remaining', value: Math.max(NUM_UNDERGRADS - curNumTested, 0) - PADDING_UNDERGRADS * 2, fill: BG_COLOR },
              { name: 'Padding After', value: PADDING_UNDERGRADS, fill: BG_COLOR },
            ]}
            innerRadius="60%"
            outerRadius="65%"
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
            innerRadius="20%"
            outerRadius="58%"
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
            innerRadius="10%"
            outerRadius="18%"
            onMouseEnter={onPieEnter(6)}
          />

          {/* This pie renders the text in the center. */}
          <Pie
            {...defaultProps}
            activeIndex={activePie}
            activeShape={renderLabel}
            data={[
              {
                name: `Estimated total non-undergrads: ${numberFormat(NUM_COMMUNITY)}`,
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
            innerRadius="0%"
            outerRadius="1%"
          />

        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DialChart;
