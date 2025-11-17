import axios, { AxiosInstance } from 'axios';

export interface SpotifyProfile {
  id: string;
  displayName: string;
  email: string;
  images: Array<{ url: string }>;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string };
  duration_ms: number;
  played_at?: string;
}

export interface SpotifyData {
  profile: SpotifyProfile;
  topTracks: SpotifyTrack[];
  recentlyPlayed: SpotifyTrack[];
  listeningTime: {
    total_ms: number;
    average_per_day_ms: number;
  };
}

export class SpotifyAdapter {
  private client: AxiosInstance;

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: 'https://api.spotify.com/v1',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<SpotifyProfile> {
    const response = await this.client.get('/me');
    return {
      id: response.data.id,
      displayName: response.data.display_name,
      email: response.data.email,
      images: response.data.images,
    };
  }

  /**
   * Get user's top tracks
   */
  async getTopTracks(limit: number = 20): Promise<SpotifyTrack[]> {
    const response = await this.client.get('/me/top/tracks', {
      params: {
        limit,
        time_range: 'medium_term',
      },
    });

    return response.data.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist: any) => ({ name: artist.name })),
      album: { name: track.album.name },
      duration_ms: track.duration_ms,
    }));
  }

  /**
   * Get recently played tracks
   */
  async getRecentlyPlayed(limit: number = 50): Promise<SpotifyTrack[]> {
    const response = await this.client.get('/me/player/recently-played', {
      params: { limit },
    });

    return response.data.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artists: item.track.artists.map((artist: any) => ({ name: artist.name })),
      album: { name: item.track.album.name },
      duration_ms: item.track.duration_ms,
      played_at: item.played_at,
    }));
  }

  /**
   * Get normalized data for the platform
   */
  async getNormalizedData(): Promise<SpotifyData> {
    const [profile, topTracks, recentlyPlayed] = await Promise.all([
      this.getProfile(),
      this.getTopTracks(),
      this.getRecentlyPlayed(),
    ]);

    // listening time
    const totalListeningTime = recentlyPlayed.reduce(
      (sum, track) => sum + track.duration_ms,
      0
    );

    return {
      profile,
      topTracks,
      recentlyPlayed,
      listeningTime: {
        total_ms: totalListeningTime,
        average_per_day_ms: totalListeningTime / 7, // Assuming recent tracks are from last week
      },
    };
  }
}
