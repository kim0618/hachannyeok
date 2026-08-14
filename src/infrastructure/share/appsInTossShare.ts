import { Share } from '@apps-in-toss/web-framework';
import type { SharePort } from './SharePort';

interface AppsInTossShareOptions {
  deepLink?: string;
}

export function createAppsInTossShare({ deepLink }: AppsInTossShareOptions = {}): SharePort {
  return {
    async open(message) {
      const shareMessage = deepLink
        ? `${message}\n${await Share.createLink({ path: deepLink })}`
        : message;
      await Share.sendMessage({ message: shareMessage });
    },
  };
}

export const appsInTossShare = createAppsInTossShare();
