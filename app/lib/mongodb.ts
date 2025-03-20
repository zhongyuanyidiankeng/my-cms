import { MongoClient, ServerApiVersion } from 'mongodb';

// 从环境变量获取mock数据控制标志
export const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

// 如果不使用mock数据，则需要MongoDB URI
if (!USE_MOCK_DATA && !process.env.MONGODB_URI) {
  throw new Error('请在环境变量中设置MONGODB_URI');
}

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/my-cms';
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};

let client;
let clientPromise: Promise<MongoClient>;

// 只有在不使用mock数据时才实际连接MongoDB
if (!USE_MOCK_DATA) {
  if (process.env.NODE_ENV === 'development') {
    // 在开发环境中使用全局变量，这样热重载不会每次都创建新连接
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // 在生产环境中为每个请求创建新的连接
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // 使用mock数据时，创建一个永远不会实际连接的Promise
  client = new MongoClient(uri, options);
  clientPromise = Promise.resolve(client);
}

export default clientPromise;