export const autonomyPath = "/writing/trustworthy-autonomy/";

export const writingPath = (item) => item.seriesNumber
  ? `${autonomyPath}${item.slug}/`
  : `/writing/${item.slug}/`;
