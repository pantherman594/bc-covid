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
export const ChartContainer = (props: ChartContainerProps) => {
  const ChartComp = props.chartComp;
  return (
    <div className="chart-container">
      <h1>{props.title}</h1>
      <ResponsiveContainer width={props.width} height={props.height}>
        <ChartComp {...props.chartProps}>
          <CartesianGrid strokeDasharray="3 3" />
          {props.children}
        </ChartComp>
      </ResponsiveContainer>
    </div>
  );
};
