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
export declare class NotionAdapter {
    private client;
    constructor(accessToken: string);
    /**
     * Get authenticated user
     */
    getUser(): Promise<NotionUser>;
    /**
     * Search all accessible pages and databases
     */
    search(query?: string): Promise<{
        pages: NotionPage[];
        databases: NotionDatabase[];
    }>;
    /**
     * Get pages from a database
     */
    getDatabasePages(databaseId: string): Promise<NotionPage[]>;
    /**
     * Extract title from Notion properties
     */
    private extractTitle;
    /**
     * Get normalized data for the platform
     */
    getNormalizedData(): Promise<NotionData>;
}
//# sourceMappingURL=NotionAdapter.d.ts.map