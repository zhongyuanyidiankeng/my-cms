import clientPromise,{ USE_MOCK_DATA } from '../lib/mongodb';
import { TelegramMessage } from '../models/TelegramMessage';

const mockTelegramMessages: TelegramMessage[] = [
  {"logic_code": "1","text":"<a href=\"https://github.com/LearningCircuit/local-deep-research\" target=\"_blank\" rel=\"noopener\" onclick=\"return confirm('Open this link?\\n\\n'+this.href);\">Local Deep Research</a>：强大的AI研究助手，助力深度研究与知识探索。<br><br>支持本地运行，保护隐私；集成多种LLM和搜索工具，涵盖Wikipedia、arXiv、PubMed等；提供Web界面，实时更新研究进度<span style=\"display: inline-block; width: 91px;\"></span>","image":["url(\"https://cdn5.cdn-telegram.org/file/LykXv-oqw8OkC8rUIpQxda5sIRgsPmouhxIOrPIskMFZIs5r8wmEyRkxTmW7_uZ4xap0BMrpgRD4CjXubClNFo3bVzAi-6zvoyBGrwm0U2vWG9lEdLLrDY7pGMGARHG477ZFmld6HVYGLR_iBBbXY6rHRaw3stLOS2mMhRmMZ3Ut8NzBQ9lwgql-plGFjH4EvYPAZZhsQkUAgIAxRXM505vkwzC2dk4LJFm6hDDKg6KtVlV6ICRO7HFASHxmqGGIql9mTAWXCyzYU1sJBIqhYKnH75urSbG0N8smdAthWmXb693XUZJ05Z1A2vfIhvH-ArPhrcgDCOhEMuHwWi7H7A.jpg\")"],"create_at":"2025-03-18"},
  {"logic_code": "2","text":"<a href=\"https://github.com/microsoft/typescript-go\" target=\"_blank\" rel=\"noopener\" onclick=\"return confirm('Open this link?\\n\\n'+this.href);\">TypeScript-Go</a>：原生移植TypeScript到Go语言的项目，为TypeScript的跨语言开发提供强大支持。<br><br>使用Go语言实现TypeScript编译器，性能显著提升；完成TypeScript 5.8的核心功能移植，包括语法解析、类型检查等；提供语言服务协议（LSP）原型，助力开发体验升级<span style=\"display: inline-block; width: 91px;\"></span>","image":["url(\"https://cdn5.cdn-telegram.org/file/UDix-edHs3dOvKwK2LAJ0lRpmhSm7HDoDJI0p_Un7v5FQQpoUyFFlg4mwvESbMb8JQi-79GxgdSfRNmdaPaysyDscyEao8gl60qWx8rTKHZiqunmUZA8Iv8sIWoGpSAxLM7zFLZzNkFRJBJj-FmYJz-4JFSxeDQ6pF26yApVBDHSAfiRTeXHcwsjt2trirYCR4AAzaGU_rpOHW0TGcIyDsHZKnQvHB6XchEMfUCX92dSfd8aRMBWJj5PFYT6VI4-KE--wnfFHKtySLADQRZd_1z9MCt_ppnUpydU8oFfYJ3Nm_ek6KqHOSb7ffmIpf-NYh36OqtHEsi7Rw2XgnKPEA.jpg\")"],"create_at":"2025-03-18"},
  {"logic_code": "3","text":"<a href=\"https://pan.quark.cn/s/2fe773fea18c\" target=\"_blank\" rel=\"noopener\" onclick=\"return confirm('Open this link?\\n\\n'+this.href);\">用好DeepSeek轻松辅导孩子作业</a><br><a href=\"https://pan.quark.cn/s/5ab37d325146\" target=\"_blank\" rel=\"noopener\" onclick=\"return confirm('Open this link?\\n\\n'+this.href);\">2025deepseek 视频文档学习课程大全</a><span style=\"display: inline-block; width: 130px;\"></span>","image":[],"create_at":"2025-03-18"},
  {"logic_code": "4","text":"<div class=\"tgme_widget_message_text js-message_text\" dir=\"auto\">千锋教育新版Python全栈高性能API接口服务爬虫数据分析课程<br><br>支持换课/回收正版课，加入会员免费学</div><span style=\"display: inline-block; width: 91px;\"></span>","image":["url(\"https://cdn5.cdn-telegram.org/file/FmK9tECDvHG3tJBQIE5WIMG16ZMhzvgDLIx86YOnsxLcxdLi6SrFGY5Nk0IwM_zuGmiPJVfYK6Lo42D8MF4UuVVcBngMQ2Vg3GdJT-3CGBp30Z8hzYeDdvaQXmoBWY7pXYlfWzJj_7YfOSdzpMgvpB58kjdK9_UBi9P5O14ab5z-2ESPse7ER36dOqBoKAg-P2SHt-sUKoq7ausHH-T4Yos3TnAk8KZhms7lHH-UFoyzQfqbbfAc7LaTODAG_PH7PT7zzxAxualxE3fhLXRfzzfQA-IYRyHl2-62GwRlVlexB3HsXhq1JqeGXqzXF7bByBK650F23ZIRlw5lmpr3wg.jpg\")"],"create_at":"2025-03-18"}
]

export async function getAllTelegramMessages(): Promise<TelegramMessage[]> {
  const client = await clientPromise;
  const collection = client.db("cms").collection('telegram_message');
  // 先将结果转为 unknown，然后再转为 TelegramMessage[] 类型
  return collection.find({}).sort({ create_at: -1 }).toArray().then(docs => {
    return docs.map(doc => ({
      logic_code: doc.logic_code as string,
      text: doc.text as string,
      image: doc.image as string[],
      create_at: doc.create_at as string
    }));
  });
}

export async function getTelegramMessageById(id: string): Promise<TelegramMessage | null> {
  const client = await clientPromise;
  const collection = client.db("cms").collection('telegram_message');
  return collection.findOne({ id }) as Promise<TelegramMessage | null>;
}

export async function updateTelegramMessage(id: string, message: Partial<TelegramMessage>): Promise<boolean> {
  const client = await clientPromise;
  const collection = client.db("cms").collection('telegram_message');
  const result = await collection.updateOne({ id }, { $set: message });
  return result.modifiedCount > 0;
}

export async function deleteTelegramMessage(logic_code: string): Promise<boolean> {
  const client = await clientPromise;
  const collection = client.db("cms").collection('telegram_message');
  const result = await collection.deleteOne({ logic_code: logic_code });
  return result.deletedCount > 0;
}

export async function getTelegramMessagesByDate(dateStr: string): Promise<TelegramMessage[]> {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockTelegramMessages.filter(message => message.create_at === dateStr));
  }
  const client = await clientPromise;
  const collection = client.db("cms").collection('telegram_message');
  
  // 由于create_at是yyyy-mm-dd格式的字符串，我们可以直接进行字符串比较
  return collection.find({
    create_at: dateStr
  }).sort({ create_at: -1 }).toArray().then(docs => {
    // 将MongoDB文档转换为TelegramMessage类型
    return docs.map(doc => ({
      logic_code: doc.logic_code as string,
      text: doc.text as string,
      image: doc.image as string[],
      create_at: doc.create_at as string
    }));
  });
}