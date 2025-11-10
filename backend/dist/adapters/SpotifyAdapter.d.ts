export interface SpotifyProfile {
    id: string;
    displayName: string;
    email: string;
    images: Array<{
        url: string;
    }>;
}
export interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{
        name: string;
    }>;
    album: {
        name: string;
    };
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
export declare class SpotifyAdapter {
    private client;
    constructor(accessToken: string);
    /**
     * Get user profile
     */
    getProfile(): Promise<SpotifyProfile>;
    /**
     * Get user's top tracks
     */
    getTopTracks(limit?: number): Promise<SpotifyTrack[]>;
    /**
     * Get recently played tracks
     */
    getRecentlyPlayed(limit?: number): Promise<SpotifyTrack[]>;
    /**
     * Get normalized data for the platform
     */
    getNormalizedData(): Promise<SpotifyData>;
}
//# sourceMappingURL=SpotifyAdapter.d.ts.map