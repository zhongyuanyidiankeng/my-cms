import clientPromise, {USE_MOCK_DATA} from '../lib/mongodb';
import { CmsModule } from '../models/CmsModule';

const mockCmsModules: CmsModule[] = [
  { name: "Telegram", config:{icon: "/icons/telegram.svg", desc: "多媒体内容展示与分析"}, route: "/telegram"  },
  { name: "GitHub", config:{icon: "/icons/github.svg", desc: "今日流行项目推荐"}, route: "/github" },
  { name: "Tools", config:{icon: "/icons/tools.svg", desc: "实用工具集合，提升工作效率"}, route: "/tools" },
  { name: "Knowledge", config:{icon: "/icons/knowledge.svg", desc: "常用编程示例"}, route: "/knowledge"}
];

export async function getAllCmsModules(): Promise<CmsModule[]> {
  if (USE_MOCK_DATA) {
    return Promise.resolve([...mockCmsModules]);
  }
  const client = await clientPromise;
  const collection = client.db("cms").collection('cms_module');
  return collection.find({}).toArray() as Promise<CmsModule[]>;
}

export async function createCmsModule(module: Omit<CmsModule, '_id'>): Promise<CmsModule> {
  const client = await clientPromise;
  const collection = client.db("cms").collection('cms_module');
  const result = await collection.insertOne(module);
  return { ...module, _id: result.insertedId };
}

export async function updateCmsModule(name: string, module: Partial<CmsModule>): Promise<boolean> {
  const client = await clientPromise;
  const collection = client.db("cms").collection('cms_module');
  const result = await collection.updateOne({ name }, { $set: module });
  return result.modifiedCount > 0;
}

export async function deleteCmsModule(name: string): Promise<boolean> {
  const client = await clientPromise;
  const collection = client.db("cms").collection('cms_module');
  const result = await collection.deleteOne({ name });
  return result.deletedCount > 0;
}