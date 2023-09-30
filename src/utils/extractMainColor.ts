import Vibrant from 'node-vibrant';

export const extractMainColor = async (
  image: string|null,
  fallBackColor?: string
): Promise<string | undefined> => {
  try {
    if (!image) return fallBackColor;
    const colors = (await Vibrant.from(image).getPalette()).DarkVibrant?.hex;
    return colors || fallBackColor;
  } catch (e) {
    console.log(e);
    return fallBackColor;
  }
};
