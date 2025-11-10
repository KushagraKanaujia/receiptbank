"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionAdapter = void 0;
const client_1 = require("@notionhq/client");
class NotionAdapter {
    constructor(accessToken) {
        this.client = new client_1.Client({
            auth: accessToken,
        });
    }
    /**
     * Get authenticated user
     */
    async getUser() {
        const response = await this.client.users.me({});
        return {
            id: response.id,
            name: response.name || 'Notion User',
            email: response.person?.email || '',
            avatarUrl: response.avatar_url,
        };
    }
    /**
     * Search all accessible pages and databases
     */
    async search(query) {
        const response = await this.client.search({
            query,
            sort: {
                direction: 'descending',
                timestamp: 'last_edited_time',
            },
        });
        const pages = [];
        const databases = [];
        response.results.forEach((item) => {
            if (item.object === 'page') {
                const title = this.extractTitle(item.properties);
                pages.push({
                    id: item.id,
                    title,
                    createdTime: item.created_time,
                    lastEditedTime: item.last_edited_time,
                    url: item.url,
                });
            }
            else if (item.object === 'database') {
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
    async getDatabasePages(databaseId) {
        try {
            const response = await this.client.databases.query({
                database_id: databaseId,
            });
            return response.results.map((page) => {
                const title = this.extractTitle(page.properties);
                return {
                    id: page.id,
                    title,
                    createdTime: page.created_time,
                    lastEditedTime: page.last_edited_time,
                    url: page.url,
                };
            });
        }
        catch (error) {
            console.error('Error querying database:', error);
            return [];
        }
    }
    /**
     * Extract title from Notion properties
     */
    extractTitle(properties) {
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
    async getNormalizedData() {
        const user = await this.getUser();
        const { pages, databases } = await this.search();
        // Get item counts for databases
        const databasesWithCounts = await Promise.all(databases.slice(0, 10).map(async (db) => {
            try {
                const dbPages = await this.getDatabasePages(db.id);
                return { ...db, itemCount: dbPages.length };
            }
            catch (error) {
                return { ...db, itemCount: 0 };
            }
        }));
        // Get recently edited pages
        const recentlyEdited = pages
            .sort((a, b) => new Date(b.lastEditedTime).getTime() - new Date(a.lastEditedTime).getTime())
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
exports.NotionAdapter = NotionAdapter;
//# sourceMappingURL=NotionAdapter.js.map