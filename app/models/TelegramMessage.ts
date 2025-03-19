import { ObjectId } from 'mongodb';

export interface TelegramMessage {
  _id?: ObjectId;
  text?: string;
  image?: string[];
  create_at: String;
}

export default TelegramMessage;