import { ObjectId } from 'mongodb';
import clientPromise, {USE_MOCK_DATA} from '../lib/mongodb';
import {ProgramKnowledge, Example} from '../models/ProgramKnowledge';

const mockProgramKnowledge: ProgramKnowledge[] = [
    {"_id": new ObjectId("6417e1e11b4598000153e66c"),
      "logic_code": "mongodb",
      "type": "MongoDB",
      "example": [
        { "desc": "连接MongoDB数据库", "code": "mongoose.connect('mongodb://localhost:27017/mydb')" },
        { "desc": "创建Schema", "code": "const Schema = mongoose.Schema;\nconst userSchema = new Schema({ name: String, age: Number });" },
        { "desc": "查询数据", "code": "User.find({ age: { $gt: 18 } }).then(users => console.log(users));" }
      ]
    },
    {
      "_id": new ObjectId("6417e1e11b4598000153e76c"),
      "logic_code": "react",
      "type": "React",
      "example": [
        { "desc": "使用useState", "code": "const [count, setCount] = useState(0);" },
        { "desc": "使用useEffect", "code": "useEffect(() => {\n  console.log('组件已挂载');\n  return () => console.log('组件将卸载');\n}, []);" }
      ]
    },
    {
      "_id": new ObjectId("6417e1e11b4598000153e68c"),
      "logic_code": "nodejs",
      "type": "Node.js",
      "example": [
        { "desc": "创建HTTP服务器", "code": "const http = require('http');\nhttp.createServer((req, res) => {\n  res.writeHead(200);\n  res.end('Hello World');\n}).listen(3000);" },
        { "desc": "读取文件", "code": "const fs = require('fs');\nfs.readFile('file.txt', 'utf8', (err, data) => {\n  if (err) throw err;\n  console.log(data);\n});" }
      ]
    }
];

export async function getAllProgramKnowledges(): Promise<ProgramKnowledge[]> {
  if (USE_MOCK_DATA) {
    return Promise.resolve([...mockProgramKnowledge]);
  }
  const client = await clientPromise;
  const collection = client.db("cms").collection('program_knowledge');
  // 先将结果转为 unknown 类型，然后再转为 ProgramKnowledge[] 类型
  return collection.find({}).toArray() as Promise<ProgramKnowledge[]>;
}

export async function createProgramKnowledge(module: Omit<ProgramKnowledge, '_id'>): Promise<ProgramKnowledge> {
  const client = await clientPromise;
  const collection = client.db("cms").collection('program_knowledge');
  await collection.insertOne(module);
  return { ...module };
}

export async function deleteProgramKnowledge(logic_code: string): Promise<boolean> {
  const client = await clientPromise;
  const collection = client.db("cms").collection('program_knowledge');
  const result = await collection.deleteOne({ logic_code });
  return result.deletedCount > 0;
}

export async function addExample(logic_code: string, example: Example): Promise<boolean> {
  const client = await clientPromise;
  const collection = client.db("cms").collection<ProgramKnowledge>('program_knowledge');
  const result = await collection.updateOne(
    { logic_code },
    { $push: { example } }
  );
  return result.modifiedCount > 0;
}

export async function deleteExample(logic_code: string, exampleIndex: number): Promise<boolean> {
  const client = await clientPromise;
  const collection = client.db("cms").collection('program_knowledge');
  
  // 先获取当前的示例数组
  const module = await collection.findOne({ logic_code });
  if (!module) return false;
  
  const examples = module.example || [];
  if (exampleIndex < 0 || exampleIndex >= examples.length) return false;
  
  // 移除指定索引的示例
  examples.splice(exampleIndex, 1);
  
  // 更新文档
  const result = await collection.updateOne(
    { logic_code },
    { $set: { example: examples } }
  );
  
  return result.modifiedCount > 0;
}