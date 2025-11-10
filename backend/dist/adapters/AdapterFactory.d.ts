import { ServiceProvider } from '../models/ConnectedService';
import { SpotifyAdapter } from './SpotifyAdapter';
import { FitbitAdapter } from './FitbitAdapter';
import { GoogleCalendarAdapter } from './GoogleCalendarAdapter';
import { PlaidAdapter } from './PlaidAdapter';
import { NotionAdapter } from './NotionAdapter';
export type AdapterInstance = SpotifyAdapter | FitbitAdapter | GoogleCalendarAdapter | PlaidAdapter | NotionAdapter;
/**
 * Factory to create appropriate adapter based on service provider
 */
export declare class AdapterFactory {
    static createAdapter(provider: ServiceProvider, accessToken: string): AdapterInstance;
    /**
     * Get normalized data from any adapter
     */
    static getNormalizedData(provider: ServiceProvider, accessToken: string, options?: any): Promise<any>;
}
//# sourceMappingURL=AdapterFactory.d.ts.map