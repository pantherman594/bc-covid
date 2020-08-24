import React from 'react';
import styles from './styles.module.css';
import { CovidDataItem } from '../../types';

interface NumberStatProps extends React.ComponentProps<"div"> {
  dataKey: keyof CovidDataItem;
  description: string;
}

interface NumberStatsProps {
  data: CovidDataItem[];
}

export const NumberStats = (props: NumberStatsProps) => {
  if (props.data.length === 0) {
    return null;
  }

  const latest = props.data[props.data.length - 1];

  let previous: CovidDataItem = {
    id: '',
    date: new Date(),
    totalTested: 0,
    totalPositive: 0,
    undergradTested: 0,
    undergradPositive: 0,
    isolation: 0,
    flags: [],
  };

  if (props.data.length > 1) {
    previous = props.data[props.data.length - 2];
  }

  const NumberStat = (statProps: NumberStatProps) => {
    const { dataKey, description, ...rest } = statProps;
    const change = latest[dataKey] - previous[dataKey];
    return (
      <div className={styles.stat} {...rest}>
        <div className={styles.row}>
          {latest[dataKey].toLocaleString()}
          <div className={[styles.change, styles[change > 0 ? "incr" : "decr"]].join(" ")}>
            { change > 0 ? "\u25b2 +" : "\u25bc " }{change.toLocaleString()}
          </div>
        </div>
        <div className={styles.description}>
          {description}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.row}>
      <div className={styles.column}>
        <div className={styles.container}>
          <NumberStat
            dataKey="undergradTested"
            description="Undergrads Tested"
          />
          <NumberStat
            dataKey="undergradPositive"
            description="Undergrads Positive"
          />
        </div>
        <div className={styles.container}>
          <NumberStat
            dataKey="totalTested"
            description="Total Tested"
          />
          <NumberStat
            dataKey="totalPositive"
            description="Total Positive"
          />
        </div>
      </div>
      <NumberStat
        dataKey="isolation"
        description="Undergrads Isolated"
        style={{ flex: 0 }}
      />
    </div>
  );
};
