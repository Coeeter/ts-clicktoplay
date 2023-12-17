'use server';

import Vibrant from 'node-vibrant';

function isLightColor(color: string | undefined) {
  if (!color) return false;
  const hex = color.replace('#', '');
  const c_r = parseInt(hex.substring(0, 0 + 2), 16);
  const c_g = parseInt(hex.substring(2, 2 + 2), 16);
  const c_b = parseInt(hex.substring(4, 4 + 2), 16);
  const brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000;
  return brightness > 155;
}

function isVeryDark(color: string | undefined) {
  if (!color) return false;
  const hex = color.replace('#', '');
  const c_r = parseInt(hex.substring(0, 0 + 2), 16);
  const c_g = parseInt(hex.substring(2, 2 + 2), 16);
  const c_b = parseInt(hex.substring(4, 4 + 2), 16);
  const brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000;
  return brightness < 30;
}

export const extractMainColor = async (
  image: string | null,
  fallBackColor?: string
): Promise<{ vibrant?: string; darkVibrant?: string }> => {
  try {
    if (!image)
      return {
        vibrant: fallBackColor,
        darkVibrant: fallBackColor,
      };
    const colors = await Vibrant.from(image).getPalette();
    const vibrant =
      (!isLightColor(colors.Vibrant?.hex) && !isVeryDark(colors.Vibrant?.hex)
        ? colors.Vibrant?.hex
        : colors.Muted?.hex) ?? fallBackColor;
    const darkVibrant =
      (!isLightColor(colors.DarkVibrant?.hex) &&
      !isVeryDark(colors.DarkVibrant?.hex)
        ? colors.DarkVibrant?.hex
        : colors.DarkMuted?.hex) ?? fallBackColor;

    return {
      vibrant,
      darkVibrant,
    };
  } catch (e) {
    console.log(e);
    return {
      vibrant: fallBackColor,
      darkVibrant: fallBackColor,
    };
  }
};
