import React from 'react';
import moment from 'moment';
import styles from './styles.module.css';
import { create, CovidDataItem } from '../../types';

interface NumberStatProps extends React.ComponentProps<'div'> {
  dataKey: keyof CovidDataItem;
  description: string;
}

interface NumberStatsProps {
  data: CovidDataItem[];
}

const NumberStats = (props: NumberStatsProps) => {
  const { data } = props;

  if (data.length === 0) {
    return null;
  }

  const latest = data[data.length - 1];

  let previous = create();

  if (data.length > 1) {
    previous = props.data[props.data.length - 2];
  }

  const NumberStat = (statProps: NumberStatProps) => {
    const { dataKey, description } = statProps;
    const change = latest[dataKey] - previous[dataKey];

    let incr = change > 0;
    if ((dataKey as string).indexOf('Positive') !== -1) {
      incr = !incr;
    }

    let style = incr ? styles.incr : styles.decr;
    if (dataKey === 'isolation') style = '';

    return (
      <div className={styles.stat}>
        <div className={styles.row}>
          {latest[dataKey].toLocaleString()}
          { change === 0 ? <div className={styles.change}>{'\u2013 +0'}</div>
            : (
              <div className={[styles.change, style].join(' ')}>
                { change > 0 ? '\u25b2 +' : '\u25bc ' }
                {change.toLocaleString()}
              </div>
            )}
        </div>
        <div className={styles.description}>
          {description}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.column}>
      <div className={styles.container}>
        <NumberStat
          dataKey="totalTested"
          description="Total Tests"
        />
        <NumberStat
          dataKey="totalPositive"
          description="Total Positive Tests"
        />
      </div>
      <div className={styles.container}>
        <NumberStat
          dataKey="undergradTested"
          description="Undergrad Tests"
        />
        <NumberStat
          dataKey="undergradPositive"
          description="Positive Undergrad Tests"
        />
      </div>
      <div className={styles.container}>
        <NumberStat
          dataKey="isolation"
          description="Undergrads Isolated"
        />
        <NumberStat
          dataKey="undergradRecovered"
          description="Undergrads Recovered"
        />
      </div>
      <div className="hint">
        Deltas compare to data collected
        {moment(previous.date).format(' MMMM D, Y')}
        .
      </div>
    </div>
  );
};

export default NumberStats;
