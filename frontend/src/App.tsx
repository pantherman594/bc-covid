import React from 'react';
import { data } from './utils/dummy-data';
import { TestedAreaChart } from './components';
import './App.css';

export const App: React.FunctionComponent = () => {
  return (
    <div className="App">
      <h1>Boston College Covid-19 Live Statistics</h1>
      <TestedAreaChart data={data} />
    </div>
  );
};
