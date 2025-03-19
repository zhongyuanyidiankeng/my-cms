import clientPromise, {USE_MOCK_DATA} from '../lib/mongodb';
import {ProgramKnowledge} from '../models/ProgramKnowledge';

const mockProgramKnowledge: ProgramKnowledge[] = [
    {
      "type": "mongodb",
      "example": [
        { "desc": "连接MongoDB数据库", "code": "mongoose.connect('mongodb://localhost:27017/mydb')" },
        { "desc": "创建Schema", "code": "const Schema = mongoose.Schema;\nconst userSchema = new Schema({ name: String, age: Number });" },
        { "desc": "查询数据", "code": "User.find({ age: { $gt: 18 } }).then(users => console.log(users));" }
      ]
    },
    {
      "type": "react",
      "example": [
        { "desc": "使用useState", "code": "const [count, setCount] = useState(0);" },
        { "desc": "使用useEffect", "code": "useEffect(() => {\n  console.log('组件已挂载');\n  return () => console.log('组件将卸载');\n}, []);" }
      ]
    },
    {
      "type": "nodejs",
      "example": [
        { "desc": "创建HTTP服务器", "code": "const http = require('http');\nhttp.createServer((req, res) => {\n  res.writeHead(200);\n  res.end('Hello World');\n}).listen(3000);" },
        { "desc": "读取文件", "code": "const fs = require('fs');\nfs.readFile('file.txt', 'utf8', (err, data) => {\n  if (err) throw err;\n  console.log(data);\n});" }
      ]
    }
];

export async function getAllCmsModules(): Promise<ProgramKnowledge[]> {
  if (true) {
    return Promise.resolve([...mockProgramKnowledge]);
  }
  const client = await clientPromise;
  const collection = client.db().collection('program_knowledge');
  return collection.find({}).toArray() as Promise<ProgramKnowledge[]>;
}

export async function createCmsModule(module: Omit<ProgramKnowledge, '_id'>): Promise<ProgramKnowledge> {
  const client = await clientPromise;
  const collection = client.db().collection('program_knowledge');
  const result = await collection.insertOne(module);
  return { ...module, _id: result.insertedId };
}

export async function updateCmsModule(name: string, module: Partial<ProgramKnowledge>): Promise<boolean> {
  const client = await clientPromise;
  const collection = client.db().collection('program_knowledge');
  const result = await collection.updateOne({ name }, { $set: module });
  return result.modifiedCount > 0;
}

export async function deleteCmsModule(name: string): Promise<boolean> {
  const client = await clientPromise;
  const collection = client.db().collection('program_knowledge');
  const result = await collection.deleteOne({ name });
  return result.deletedCount > 0;
}