import React from 'react';
import { ResponsiveContainer, CartesianGrid } from 'recharts';
import './styles.css';

interface ChartContainerProps {
  title: string;
  width: string | number;
  height: string | number;
  chartComp: React.ComponentType;
  chartProps: Object;
  children: React.ReactNode[];
}

// Wrapper for rechart component
const ChartContainer = (props: ChartContainerProps) => {
  const {
    title,
    width,
    height,
    chartComp: ChartComp,
    chartProps,
    children,
  } = props;

  return (
    <div className="chart-container">
      <h1>{title}</h1>
      <ResponsiveContainer width={width} height={height}>
        <ChartComp {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" />
          {children}
        </ChartComp>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartContainer;
