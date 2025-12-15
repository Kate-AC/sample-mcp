export type FigmaConfig = {
  baseUrl: string;
};

export const loadFigmaConfig = (): FigmaConfig => {
  return {
    baseUrl: "https://api.figma.com/v1",
  };
};
