import axios, { AxiosInstance } from 'axios';

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

export class FitbitAdapter {
  private client: AxiosInstance;

  constructor(accessToken: string) {
    this.client = axios.create({
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
  async getProfile(): Promise<FitbitProfile> {
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
  async getActivities(startDate: string, endDate: string): Promise<FitbitActivitySummary[]> {
    const response = await this.client.get(
      `/user/-/activities/date/${startDate}/${endDate}.json`
    );

    return response.data['activities-steps'].map((item: any, index: number) => ({
      date: item.dateTime,
      steps: parseInt(item.value),
      distance: parseFloat(response.data['activities-distance'][index]?.value || '0'),
      calories: parseInt(response.data['activities-calories'][index]?.value || '0'),
      activeMinutes: parseInt(
        response.data['activities-minutesFairlyActive'][index]?.value || '0'
      ),
    }));
  }

  /**
   * Get heart rate data
   */
  async getHeartRate(startDate: string, endDate: string): Promise<FitbitHeartRate[]> {
    const response = await this.client.get(
      `/user/-/activities/heart/date/${startDate}/${endDate}.json`
    );

    return response.data['activities-heart'].map((item: any) => ({
      date: item.dateTime,
      restingHeartRate: item.value?.restingHeartRate || 0,
      zones: item.value?.heartRateZones || [],
    }));
  }

  /**
   * Get sleep data
   */
  async getSleep(startDate: string, endDate: string): Promise<FitbitSleep[]> {
    const response = await this.client.get(`/user/-/sleep/date/${startDate}/${endDate}.json`);

    return response.data.sleep.map((item: any) => ({
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
  async getNormalizedData(days: number = 30): Promise<FitbitData> {
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

    // averages
    const avgSteps =
      activities.reduce((sum, a) => sum + a.steps, 0) / activities.length;
    const avgCalories =
      activities.reduce((sum, a) => sum + a.calories, 0) / activities.length;
    const avgSleepHours =
      sleep.reduce((sum, s) => sum + s.minutesAsleep, 0) / sleep.length / 60;

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
