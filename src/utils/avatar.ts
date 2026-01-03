import { createAvatar } from '@dicebear/core';
import * as lorelei from '@dicebear/lorelei';
import * as notionists from '@dicebear/notionists';
import * as openPeeps from '@dicebear/open-peeps';

export type AvatarStyle = 'lorelei' | 'notionists' | 'open-peeps';

export const avatarStyles = {
  lorelei,
  notionists,
  openPeeps,
};

export function getAvatarUrl(style: AvatarStyle, seed: string, size: number = 128): string {
  let styleModule;
  
  switch (style) {
    case 'lorelei':
      styleModule = lorelei;
      break;
    case 'notionists':
      styleModule = notionists;
      break;
    case 'open-peeps':
      styleModule = openPeeps;
      break;
    default:
      styleModule = lorelei;
  }

  const avatar = createAvatar(styleModule as any, {
    seed: seed,
    size: size,
  });

  return avatar.toDataUri();
}
