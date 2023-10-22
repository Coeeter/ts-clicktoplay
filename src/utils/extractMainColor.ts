import Vibrant from 'node-vibrant';

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
    return {
      vibrant: colors.Vibrant?.hex ?? fallBackColor,
      darkVibrant: colors.DarkVibrant?.hex ?? fallBackColor,
    };
  } catch (e) {
    console.log(e);
    return {
      vibrant: fallBackColor,
      darkVibrant: fallBackColor,
    };
  }
};
