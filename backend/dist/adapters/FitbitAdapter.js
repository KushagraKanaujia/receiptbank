"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FitbitAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
class FitbitAdapter {
    constructor(accessToken) {
        this.client = axios_1.default.create({
            baseURL: 'https://api.fitbit.com/1',
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
        const response = await this.client.get('/user/-/profile.json');
        const user = response.data.user;
        return {
            id: user.encodedId,
            displayName: user.displayName,
            age: user.age,
            height: user.height,
            weight: user.weight,
            timezone: user.timezone,
        };
    }
    /**
     * Get activity summary for a date range
     */
    async getActivities(startDate, endDate) {
        const response = await this.client.get(`/user/-/activities/date/${startDate}/${endDate}.json`);
        return response.data['activities-steps'].map((item, index) => ({
            date: item.dateTime,
            steps: parseInt(item.value),
            distance: parseFloat(response.data['activities-distance'][index]?.value || '0'),
            calories: parseInt(response.data['activities-calories'][index]?.value || '0'),
            activeMinutes: parseInt(response.data['activities-minutesFairlyActive'][index]?.value || '0'),
        }));
    }
    /**
     * Get heart rate data
     */
    async getHeartRate(startDate, endDate) {
        const response = await this.client.get(`/user/-/activities/heart/date/${startDate}/${endDate}.json`);
        return response.data['activities-heart'].map((item) => ({
            date: item.dateTime,
            restingHeartRate: item.value?.restingHeartRate || 0,
            zones: item.value?.heartRateZones || [],
        }));
    }
    /**
     * Get sleep data
     */
    async getSleep(startDate, endDate) {
        const response = await this.client.get(`/user/-/sleep/date/${startDate}/${endDate}.json`);
        return response.data.sleep.map((item) => ({
            date: item.dateOfSleep,
            duration: item.duration,
            efficiency: item.efficiency,
            minutesAsleep: item.minutesAsleep,
            minutesAwake: item.minutesAwake,
        }));
    }
    /**
     * Get normalized data for the platform
     */
    async getNormalizedData(days = 30) {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
        const [profile, activities, heartRate, sleep] = await Promise.all([
            this.getProfile(),
            this.getActivities(startDate, endDate),
            this.getHeartRate(startDate, endDate),
            this.getSleep(startDate, endDate),
        ]);
        // Calculate averages
        const avgSteps = activities.reduce((sum, a) => sum + a.steps, 0) / activities.length;
        const avgCalories = activities.reduce((sum, a) => sum + a.calories, 0) / activities.length;
        const avgSleepHours = sleep.reduce((sum, s) => sum + s.minutesAsleep, 0) / sleep.length / 60;
        return {
            profile,
            activities,
            heartRate,
            sleep,
            averages: {
                steps: Math.round(avgSteps),
                calories: Math.round(avgCalories),
                sleepHours: parseFloat(avgSleepHours.toFixed(1)),
            },
        };
    }
}
exports.FitbitAdapter = FitbitAdapter;
//# sourceMappingURL=FitbitAdapter.js.map