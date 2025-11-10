import { ServiceProvider } from '../models/ConnectedService';
import { SpotifyAdapter } from './SpotifyAdapter';
import { FitbitAdapter } from './FitbitAdapter';
import { GoogleCalendarAdapter } from './GoogleCalendarAdapter';
import { PlaidAdapter } from './PlaidAdapter';
import { NotionAdapter } from './NotionAdapter';

export type AdapterInstance =
  | SpotifyAdapter
  | FitbitAdapter
  | GoogleCalendarAdapter
  | PlaidAdapter
  | NotionAdapter;

/**
 * Factory to create appropriate adapter based on service provider
 */
export class AdapterFactory {
  static createAdapter(provider: ServiceProvider, accessToken: string): AdapterInstance {
    switch (provider) {
      case 'spotify':
        return new SpotifyAdapter(accessToken);
      case 'fitbit':
        return new FitbitAdapter(accessToken);
      case 'google':
        return new GoogleCalendarAdapter(accessToken);
      case 'plaid':
        return new PlaidAdapter(accessToken);
      case 'notion':
        return new NotionAdapter(accessToken);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Get normalized data from any adapter
   */
  static async getNormalizedData(
    provider: ServiceProvider,
    accessToken: string,
    options?: any
  ): Promise<any> {
    const adapter = this.createAdapter(provider, accessToken);

    switch (provider) {
      case 'spotify':
        return (adapter as SpotifyAdapter).getNormalizedData();
      case 'fitbit':
        return (adapter as FitbitAdapter).getNormalizedData(options?.days);
      case 'google':
        return (adapter as GoogleCalendarAdapter).getNormalizedData(options?.days);
      case 'plaid':
        return (adapter as PlaidAdapter).getNormalizedData(options?.days);
      case 'notion':
        return (adapter as NotionAdapter).getNormalizedData();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
