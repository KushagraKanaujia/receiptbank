export interface GoogleProfile {
    id: string;
    email: string;
    name: string;
    picture: string;
}
export interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: {
        dateTime: string;
        timeZone?: string;
    };
    end: {
        dateTime: string;
        timeZone?: string;
    };
    attendees?: Array<{
        email: string;
    }>;
    location?: string;
}
export interface CalendarSummary {
    totalEvents: number;
    totalHours: number;
    eventsByDay: Record<string, number>;
    topAttendees: Array<{
        email: string;
        count: number;
    }>;
}
export interface GoogleCalendarData {
    profile: GoogleProfile;
    calendars: Array<{
        id: string;
        summary: string;
    }>;
    events: CalendarEvent[];
    summary: CalendarSummary;
}
export declare class GoogleCalendarAdapter {
    private client;
    constructor(accessToken: string);
    /**
     * Get user profile
     */
    getProfile(): Promise<GoogleProfile>;
    /**
     * Get list of calendars
     */
    getCalendars(): Promise<Array<{
        id: string;
        summary: string;
    }>>;
    /**
     * Get events from primary calendar
     */
    getEvents(maxResults?: number, timeMin?: string, timeMax?: string): Promise<CalendarEvent[]>;
    /**
     * Calculate event summary statistics
     */
    private calculateSummary;
    /**
     * Get normalized data for the platform
     */
    getNormalizedData(days?: number): Promise<GoogleCalendarData>;
}
//# sourceMappingURL=GoogleCalendarAdapter.d.ts.map