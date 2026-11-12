/**
 * Discord REST API v10 Client Helper (Server-side only)
 * Never import or execute this on the client.
 */

const DISCORD_API_BASE = "https://discord.com/api/v10";

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  bot?: boolean;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  parent_id?: string | null;
  topic?: string | null;
}

export interface DiscordRole {
  id: string;
  name: string;
  permissions: string;
  color: number;
  position: number;
}

export class DiscordRestClient {
  private token: string;

  constructor(token: string) {
    this.token = token.trim().replace(/^Bot\s+/i, "");
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${DISCORD_API_BASE}${endpoint}`;
    const headers = {
      Authorization: `Bot ${this.token}`,
      "Content-Type": "application/json",
      "User-Agent": "CommunityBuilder (https://github.com/fajarasshodiq91-rgb/community-builder, v1.0)",
      ...options.headers,
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errText = await res.text();
      let message = `Discord API Error (${res.status} ${res.statusText})`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.message) message += `: ${parsed.message}`;
      } catch {
        message += `: ${errText}`;
      }
      throw new Error(message);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  }

  /**
   * Get Current Bot User
   */
  public async getBotUser(): Promise<DiscordUser> {
    return this.request<DiscordUser>("/users/@me");
  }

  /**
   * List Guild Channels
   */
  public async getGuildChannels(guildId: string): Promise<DiscordChannel[]> {
    return this.request<DiscordChannel[]>(`/guilds/${guildId}/channels`);
  }

  /**
   * List Guild Roles
   */
  public async getGuildRoles(guildId: string): Promise<DiscordRole[]> {
    return this.request<DiscordRole[]>(`/guilds/${guildId}/roles`);
  }

  /**
   * Create Guild Role
   */
  public async createGuildRole(
    guildId: string,
    params: {
      name: string;
      permissions?: string;
      color?: number;
      mentionable?: boolean;
    }
  ): Promise<DiscordRole> {
    return this.request<DiscordRole>(`/guilds/${guildId}/roles`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Create Guild Channel (Category or Channel)
   * Channel Types:
   * 0 = Text, 2 = Voice, 4 = Category, 5 = Announcement, 15 = Forum
   */
  public async createGuildChannel(
    guildId: string,
    params: {
      name: string;
      type: number;
      parent_id?: string;
      topic?: string;
    }
  ): Promise<DiscordChannel> {
    return this.request<DiscordChannel>(`/guilds/${guildId}/channels`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  }
}
