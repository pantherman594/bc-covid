import React from 'react';
import { dataToPoints } from './utils/data-conversion';
import { data } from './utils/dummy-data';
import { StackedBar } from './components';
import 'react-vis/dist/style.css'; // react-vis stylesheet
import './App.css';
import { PlotDataItem } from './types';

export const App: React.FunctionComponent = () => {
  const plotDataArr: PlotDataItem[][] = [
    dataToPoints('totalTested', data),
    dataToPoints('totalPositive', data),
    dataToPoints('undergradTested', data),
    dataToPoints('undergradPositive', data),
  ].reverse();

  return (
    <div className="App">
      <div style={{ height: '500px' }}>
        <StackedBar data={plotDataArr} />
      </div>
    </div>
  );
};
