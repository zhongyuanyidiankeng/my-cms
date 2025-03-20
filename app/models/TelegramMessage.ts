export interface TelegramMessage {
  logic_code: string;
  text?: string;
  image?: string[];
  create_at: string;
}

export default TelegramMessage;