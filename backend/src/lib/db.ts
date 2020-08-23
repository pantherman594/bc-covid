import bluebird from 'bluebird';
import mongoose from 'mongoose';

(mongoose as any).Promise = bluebird;

let isConnected: boolean | number = false;
const resolveStack: any[] = [];

const connectDB = (): Promise<typeof mongoose> => new Promise((resolve, _reject) => {
  if (resolveStack.length > 0) {
    console.log('MongoDB: Waiting for connection to establish.');
    resolveStack.push(resolve);
    return;
  }

  if (isConnected) {
    resolve(mongoose);
    return;
  }

  console.log('MongoDB: Creating new database connection.');
  mongoose.set('useNewUrlParser', true);
  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);
  mongoose.set('useUnifiedTopology', true);

  resolveStack.push(resolve);
  mongoose.connect(
    process.env.DB_URL || 'mongodb://localhost:27017/bccovid',
  )
    .then((db) => {
      console.log(`MongoDB: Connected. Resolving ${resolveStack.length} queued connections.`);
      isConnected = db.connections[0].readyState;
      while (resolveStack.length > 0) {
        (resolveStack.pop())();
      }
    });
});

export default connectDB;
