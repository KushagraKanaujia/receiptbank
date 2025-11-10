"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterFactory = void 0;
const SpotifyAdapter_1 = require("./SpotifyAdapter");
const FitbitAdapter_1 = require("./FitbitAdapter");
const GoogleCalendarAdapter_1 = require("./GoogleCalendarAdapter");
const PlaidAdapter_1 = require("./PlaidAdapter");
const NotionAdapter_1 = require("./NotionAdapter");
/**
 * Factory to create appropriate adapter based on service provider
 */
class AdapterFactory {
    static createAdapter(provider, accessToken) {
        switch (provider) {
            case 'spotify':
                return new SpotifyAdapter_1.SpotifyAdapter(accessToken);
            case 'fitbit':
                return new FitbitAdapter_1.FitbitAdapter(accessToken);
            case 'google':
                return new GoogleCalendarAdapter_1.GoogleCalendarAdapter(accessToken);
            case 'plaid':
                return new PlaidAdapter_1.PlaidAdapter(accessToken);
            case 'notion':
                return new NotionAdapter_1.NotionAdapter(accessToken);
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
    /**
     * Get normalized data from any adapter
     */
    static async getNormalizedData(provider, accessToken, options) {
        const adapter = this.createAdapter(provider, accessToken);
        switch (provider) {
            case 'spotify':
                return adapter.getNormalizedData();
            case 'fitbit':
                return adapter.getNormalizedData(options?.days);
            case 'google':
                return adapter.getNormalizedData(options?.days);
            case 'plaid':
                return adapter.getNormalizedData(options?.days);
            case 'notion':
                return adapter.getNormalizedData();
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
}
exports.AdapterFactory = AdapterFactory;
//# sourceMappingURL=AdapterFactory.js.map