import React from 'react';
import { PlotDataItem } from '../../types';
import {
  FlexibleXYPlot as XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalBarSeries,
} from 'react-vis';

export interface StackedBarProps {
  data: PlotDataItem[][];
}

export const StackedBar: React.FunctionComponent<StackedBarProps> = (
  props: StackedBarProps
) => {
  const renderBarSeries = (data: PlotDataItem[][]): Element[] => {
    // how do you type react jsx
    return data.map((plotData: PlotDataItem[], index: number): any => (
      <VerticalBarSeries key={index} barWidth={0.5} data={plotData} />
    ));
  };

  return (
    <XYPlot stackBy="y">
      <VerticalGridLines />
      <HorizontalGridLines />
      <XAxis />
      <YAxis />
      {renderBarSeries(props.data)}
    </XYPlot>
  );
};
