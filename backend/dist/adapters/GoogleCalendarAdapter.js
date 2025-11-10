"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
class GoogleCalendarAdapter {
    constructor(accessToken) {
        this.client = axios_1.default.create({
            baseURL: 'https://www.googleapis.com',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
    }
    /**
     * Get user profile
     */
    async getProfile() {
        const response = await this.client.get('/oauth2/v2/userinfo');
        return {
            id: response.data.id,
            email: response.data.email,
            name: response.data.name,
            picture: response.data.picture,
        };
    }
    /**
     * Get list of calendars
     */
    async getCalendars() {
        const response = await this.client.get('/calendar/v3/users/me/calendarList');
        return response.data.items.map((cal) => ({
            id: cal.id,
            summary: cal.summary,
        }));
    }
    /**
     * Get events from primary calendar
     */
    async getEvents(maxResults = 100, timeMin, timeMax) {
        const params = {
            maxResults,
            singleEvents: true,
            orderBy: 'startTime',
        };
        if (timeMin)
            params.timeMin = timeMin;
        if (timeMax)
            params.timeMax = timeMax;
        const response = await this.client.get('/calendar/v3/calendars/primary/events', {
            params,
        });
        return response.data.items
            .filter((event) => event.start?.dateTime)
            .map((event) => ({
            id: event.id,
            summary: event.summary,
            description: event.description,
            start: {
                dateTime: event.start.dateTime,
                timeZone: event.start.timeZone,
            },
            end: {
                dateTime: event.end.dateTime,
                timeZone: event.end.timeZone,
            },
            attendees: event.attendees?.map((a) => ({ email: a.email })),
            location: event.location,
        }));
    }
    /**
     * Calculate event summary statistics
     */
    calculateSummary(events) {
        const totalEvents = events.length;
        let totalMinutes = 0;
        const eventsByDay = {};
        const attendeeCounts = {};
        events.forEach((event) => {
            // Calculate duration
            const start = new Date(event.start.dateTime);
            const end = new Date(event.end.dateTime);
            const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
            totalMinutes += durationMinutes;
            // Count events by day
            const day = start.toISOString().split('T')[0];
            eventsByDay[day] = (eventsByDay[day] || 0) + 1;
            // Count attendees
            event.attendees?.forEach((attendee) => {
                attendeeCounts[attendee.email] = (attendeeCounts[attendee.email] || 0) + 1;
            });
        });
        // Get top attendees
        const topAttendees = Object.entries(attendeeCounts)
            .map(([email, count]) => ({ email, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        return {
            totalEvents,
            totalHours: parseFloat((totalMinutes / 60).toFixed(1)),
            eventsByDay,
            topAttendees,
        };
    }
    /**
     * Get normalized data for the platform
     */
    async getNormalizedData(days = 30) {
        const timeMin = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const timeMax = new Date().toISOString();
        const [profile, calendars, events] = await Promise.all([
            this.getProfile(),
            this.getCalendars(),
            this.getEvents(250, timeMin, timeMax),
        ]);
        const summary = this.calculateSummary(events);
        return {
            profile,
            calendars,
            events,
            summary,
        };
    }
}
exports.GoogleCalendarAdapter = GoogleCalendarAdapter;
//# sourceMappingURL=GoogleCalendarAdapter.js.map