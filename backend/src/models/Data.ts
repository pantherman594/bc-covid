import {
  getModelForClass,
  index,
  prop,
} from 'typegoose';

@index({ date: 1 })
export class Data {
  @prop({ required: true, default: Date.now })
  public date!: Date;

  @prop({ required: true })
  public totalTested!: number;

  @prop({ required: true })
  public totalPositive!: number;

  @prop({ required: true })
  public undergradTested!: number;

  @prop({ required: true })
  public undergradPositive!: number;

  @prop({ required: true })
  public isolation!: number;

  @prop({ required: true, type: String, default: [] })
  public flags!: string[];
}

const DataModel = getModelForClass(Data);
export default DataModel;
