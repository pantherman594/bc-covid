import React from 'react';
import styles from './styles.module.css';
import { create, CovidDataItem } from '../../types';

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

  let previous = create();

  if (props.data.length > 1) {
    previous = props.data[props.data.length - 2];
  }

  const NumberStat = (statProps: NumberStatProps) => {
    const { dataKey, description, ...rest } = statProps;
    const change = latest[dataKey] - previous[dataKey];

    let incr = change > 0;
    if ((dataKey as string).indexOf('Positive') !== -1) {
      incr = !incr;
    }

    return (
      <div className={styles.stat} {...rest}>
        <div className={styles.row}>
          {latest[dataKey].toLocaleString()}
          { change === 0 ? <div className={styles.change}>{"\u2013 +0"}</div> :
            <div className={[styles.change, styles[incr ? "incr" : "decr"]].join(" ")}>
              { change > 0 ? "\u25b2 +" : "\u25bc -" }{change.toLocaleString()}
            </div>
          }
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
          description="Total Tested"
        />
        <NumberStat
          dataKey="totalPositive"
          description="Total Positive"
        />
      </div>
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
      <NumberStat
        dataKey="isolation"
        description="Undergrads Isolated"
        style={{ flex: 0, paddingTop: 10 }}
      />
    </div>
  );
};
