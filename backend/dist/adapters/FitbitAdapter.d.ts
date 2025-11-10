export interface FitbitProfile {
    id: string;
    displayName: string;
    age: number;
    height: number;
    weight: number;
    timezone: string;
}
export interface FitbitActivitySummary {
    date: string;
    steps: number;
    distance: number;
    calories: number;
    activeMinutes: number;
}
export interface FitbitHeartRate {
    date: string;
    restingHeartRate: number;
    zones: Array<{
        name: string;
        minutes: number;
        caloriesOut: number;
    }>;
}
export interface FitbitSleep {
    date: string;
    duration: number;
    efficiency: number;
    minutesAsleep: number;
    minutesAwake: number;
}
export interface FitbitData {
    profile: FitbitProfile;
    activities: FitbitActivitySummary[];
    heartRate: FitbitHeartRate[];
    sleep: FitbitSleep[];
    averages: {
        steps: number;
        calories: number;
        sleepHours: number;
    };
}
export declare class FitbitAdapter {
    private client;
    constructor(accessToken: string);
    /**
     * Get user profile
     */
    getProfile(): Promise<FitbitProfile>;
    /**
     * Get activity summary for a date range
     */
    getActivities(startDate: string, endDate: string): Promise<FitbitActivitySummary[]>;
    /**
     * Get heart rate data
     */
    getHeartRate(startDate: string, endDate: string): Promise<FitbitHeartRate[]>;
    /**
     * Get sleep data
     */
    getSleep(startDate: string, endDate: string): Promise<FitbitSleep[]>;
    /**
     * Get normalized data for the platform
     */
    getNormalizedData(days?: number): Promise<FitbitData>;
}
//# sourceMappingURL=FitbitAdapter.d.ts.map