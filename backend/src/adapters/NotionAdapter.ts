import { Client } from '@notionhq/client';

export interface NotionUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface NotionPage {
  id: string;
  title: string;
  createdTime: string;
  lastEditedTime: string;
  url: string;
}

export interface NotionDatabase {
  id: string;
  title: string;
  createdTime: string;
  lastEditedTime: string;
  itemCount?: number;
}

export interface NotionData {
  user: NotionUser;
  databases: NotionDatabase[];
  pages: NotionPage[];
  summary: {
    totalPages: number;
    totalDatabases: number;
    recentlyEdited: NotionPage[];
  };
}

export class NotionAdapter {
  private client: Client;

  constructor(accessToken: string) {
    this.client = new Client({
      auth: accessToken,
    });
  }

  /**
   * Get authenticated user
   */
  async getUser(): Promise<NotionUser> {
    const response = await this.client.users.me({});

    return {
      id: response.id,
      name: (response as any).name || 'Notion User',
      email: (response as any).person?.email || '',
      avatarUrl: (response as any).avatar_url,
    };
  }

  /**
   * Search all accessible pages and databases
   */
  async search(query?: string): Promise<{ pages: NotionPage[]; databases: NotionDatabase[] }> {
    const response = await this.client.search({
      query,
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time',
      },
    });

    const pages: NotionPage[] = [];
    const databases: NotionDatabase[] = [];

    response.results.forEach((item: any) => {
      if (item.object === 'page') {
        const title = this.extractTitle(item.properties);
        pages.push({
          id: item.id,
          title,
          createdTime: item.created_time,
          lastEditedTime: item.last_edited_time,
          url: item.url,
        });
      } else if (item.object === 'database') {
        const title = this.extractTitle(item.title);
        databases.push({
          id: item.id,
          title,
          createdTime: item.created_time,
          lastEditedTime: item.last_edited_time,
        });
      }
    });

    return { pages, databases };
  }

  /**
   * Get pages from a database
   */
  async getDatabasePages(databaseId: string): Promise<NotionPage[]> {
    try {
      const response: any = await (this.client as any).databases.query({
        database_id: databaseId,
      });

      return response.results.map((page: any) => {
        const title = this.extractTitle(page.properties);
        return {
          id: page.id,
          title,
          createdTime: page.created_time,
          lastEditedTime: page.last_edited_time,
          url: page.url,
        };
      });
    } catch (error) {
      console.error('Error querying database:', error);
      return [];
    }
  }

  /**
   * Extract title from Notion properties
   */
  private extractTitle(properties: any): string {
    if (Array.isArray(properties)) {
      // Title array format (for databases)
      if (properties.length > 0 && properties[0].plain_text) {
        return properties[0].plain_text;
      }
      return 'Untitled';
    }

    // Properties object format (for pages)
    for (const key in properties) {
      const prop = properties[key];
      if (prop.type === 'title' && prop.title && prop.title.length > 0) {
        return prop.title[0].plain_text;
      }
    }

    return 'Untitled';
  }

  /**
   * Get normalized data for the platform
   */
  async getNormalizedData(): Promise<NotionData> {
    const user = await this.getUser();
    const { pages, databases } = await this.search();

    // Get item counts for databases
    const databasesWithCounts = await Promise.all(
      databases.slice(0, 10).map(async (db) => {
        try {
          const dbPages = await this.getDatabasePages(db.id);
          return { ...db, itemCount: dbPages.length };
        } catch (error) {
          return { ...db, itemCount: 0 };
        }
      })
    );

    // Get recently edited pages
    const recentlyEdited = pages
      .sort(
        (a, b) =>
          new Date(b.lastEditedTime).getTime() - new Date(a.lastEditedTime).getTime()
      )
      .slice(0, 10);

    return {
      user,
      databases: databasesWithCounts,
      pages,
      summary: {
        totalPages: pages.length,
        totalDatabases: databases.length,
        recentlyEdited,
      },
    };
  }
}
