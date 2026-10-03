export const autonomyPath = "/writing/trustworthy-autonomy/";
export const agencyPath = "/writing/how-intelligence-finds-its-way/";

export const writingPath = (item) => item.seriesNumber
  ? `/writing/${item.collectionSlug || "trustworthy-autonomy"}/${item.slug}/`
  : `/writing/${item.slug}/`;
