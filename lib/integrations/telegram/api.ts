/**
 * Telegram Bot API Client Helper (Server-side only)
 */

export interface TelegramBotUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
  title?: string;
  is_forum?: boolean;
}

export interface TelegramChatMember {
  status: "creator" | "administrator" | "member" | "restricted" | "left" | "kicked";
  can_manage_topics?: boolean;
}

export interface TelegramForumTopic {
  message_thread_id: number;
  name: string;
  icon_color: number;
}

export class TelegramRestClient {
  private token: string;
  private baseUrl: string;

  constructor(token: string) {
    this.token = token.trim();
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
  }

  private async callApi<T>(method: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}/${method}`;
    const options: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    const data = await res.json();

    if (!data.ok) {
      throw new Error(`Telegram API Error: ${data.description || "Unknown error"}`);
    }

    return data.result as T;
  }

  public async getMe(): Promise<TelegramBotUser> {
    return this.callApi<TelegramBotUser>("getMe");
  }

  public async getChat(chatId: string | number): Promise<TelegramChat> {
    return this.callApi<TelegramChat>("getChat", { chat_id: chatId });
  }

  public async getChatMemberCount(chatId: string | number): Promise<number> {
    return this.callApi<number>("getChatMemberCount", { chat_id: chatId });
  }

  public async getChatAdministrators(chatId: string | number): Promise<TelegramChatMember[]> {
    return this.callApi<TelegramChatMember[]>("getChatAdministrators", { chat_id: chatId });
  }

  public async getChatMember(
    chatId: string | number,
    userId: number
  ): Promise<TelegramChatMember> {
    return this.callApi<TelegramChatMember>("getChatMember", {
      chat_id: chatId,
      user_id: userId,
    });
  }

  public async createForumTopic(
    chatId: string | number,
    name: string,
    iconColor?: number
  ): Promise<TelegramForumTopic> {
    return this.callApi<TelegramForumTopic>("createForumTopic", {
      chat_id: chatId,
      name,
      icon_color: iconColor,
    });
  }

  public async sendMessage(
    chatId: string | number,
    text: string,
    messageThreadId?: number
  ): Promise<unknown> {
    return this.callApi("sendMessage", {
      chat_id: chatId,
      text,
      message_thread_id: messageThreadId,
    });
  }
}
