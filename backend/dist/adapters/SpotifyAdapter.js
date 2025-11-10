"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
class SpotifyAdapter {
    constructor(accessToken) {
        this.client = axios_1.default.create({
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
    async getProfile() {
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
    async getTopTracks(limit = 20) {
        const response = await this.client.get('/me/top/tracks', {
            params: {
                limit,
                time_range: 'medium_term',
            },
        });
        return response.data.items.map((track) => ({
            id: track.id,
            name: track.name,
            artists: track.artists.map((artist) => ({ name: artist.name })),
            album: { name: track.album.name },
            duration_ms: track.duration_ms,
        }));
    }
    /**
     * Get recently played tracks
     */
    async getRecentlyPlayed(limit = 50) {
        const response = await this.client.get('/me/player/recently-played', {
            params: { limit },
        });
        return response.data.items.map((item) => ({
            id: item.track.id,
            name: item.track.name,
            artists: item.track.artists.map((artist) => ({ name: artist.name })),
            album: { name: item.track.album.name },
            duration_ms: item.track.duration_ms,
            played_at: item.played_at,
        }));
    }
    /**
     * Get normalized data for the platform
     */
    async getNormalizedData() {
        const [profile, topTracks, recentlyPlayed] = await Promise.all([
            this.getProfile(),
            this.getTopTracks(),
            this.getRecentlyPlayed(),
        ]);
        // Calculate listening time
        const totalListeningTime = recentlyPlayed.reduce((sum, track) => sum + track.duration_ms, 0);
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
exports.SpotifyAdapter = SpotifyAdapter;
//# sourceMappingURL=SpotifyAdapter.js.map