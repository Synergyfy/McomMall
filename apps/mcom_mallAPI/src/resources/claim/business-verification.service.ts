import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class BusinessVerificationService {
  /**
   * Returns evidence if the authenticated Google user manages a location with placeId.
   */
  async verifyPlaceOwnership(oauthClient: any, placeId: string) {
    const accountMgmt = google.mybusinessaccountmanagement('v1');
    const bizInfo = google.mybusinessbusinessinformation('v1');

    const accountsResp = await accountMgmt.accounts.list({ auth: oauthClient });
    const accounts = accountsResp.data.accounts ?? [];

    for (const account of accounts) {
      let pageToken: string | undefined;
      do {
        const { data } = await bizInfo.accounts.locations.list({
          auth: oauthClient,
          parent: account.name!, // e.g. "accounts/1234567890"
          readMask: 'name,title,metadata',
          pageSize: 100,
          pageToken,
        });

        const locations = data.locations ?? [];
        const match = locations.find(
          (loc: any) => loc?.metadata?.placeId === placeId,
        );

        if (match) {
          return {
            ok: true,
            evidence: {
              accountResource: account.name,
              accountName: (account as any).accountName ?? account.name,
              locationResource: match.name,
              locationTitle: match.title,
              placeId,
            },
          };
        }

        pageToken = data.nextPageToken ?? undefined;
      } while (pageToken);
    }

    return { ok: false, evidence: null };
  }
}
