
export const AVATAR_PRESETS: Record<string, any> = {

  'user1': require('@/assets/avatar/user1.png'),
  'user2': require('@/assets/avatar/user2.png'),
  'user3': require('@/assets/avatar/user3.png'),
  'user4': require('@/assets/avatar/user4.png'),
  'user5': require('@/assets/avatar/user5.png'),
  'user6': require('@/assets/avatar/user6.png'),
  'user7': require('@/assets/avatar/user7.png'),
  'user8': require('@/assets/avatar/user8.png'),
};

export const PRESET_KEYS = Object.keys(AVATAR_PRESETS);

export const getAvatarSource = (avatarKey: string | undefined | null) => {

  if (avatarKey && AVATAR_PRESETS[avatarKey]) {
    return AVATAR_PRESETS[avatarKey];
  }
  return null;
};