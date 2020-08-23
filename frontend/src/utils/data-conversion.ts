import { CovidDataItem, PlotDataItem } from '../types';

// take a property from CovidData and create a plottable dataset
export const dataToPoints = (
  property: string,
  data: CovidDataItem[]
): PlotDataItem[] => {
  if (data.length == 0) return [];
  if (!data[0].hasOwnProperty(property)) return [];

  return data.map(
    (item: CovidDataItem, index: number) =>
      <PlotDataItem>{ x: index, y: item[property] }
  );
};
