export const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY ?? '';

export const hasMapKey = MAPTILER_KEY.length > 0;

export const maptilerVectorStyle = (style = 'positron'): string =>
  `https://api.maptiler.com/maps/${style}/style.json?key=${MAPTILER_KEY}`;

export const maptilerRasterTile = (style = 'positron', retina = false): string =>
  `https://api.maptiler.com/maps/${style}/${retina ? '@2x/' : ''}{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;

export interface PlaceSuggestion {
  label: string;
  address: string;
  coords: [number, number]; // [lng, lat]
  score: number;
}

async function maptilerFetch(url: string): Promise<any | null> {
  if (!hasMapKey) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const searchPlaces = async (
  query: string,
  proximity?: [number, number]
): Promise<PlaceSuggestion[]> => {
  if (!hasMapKey || query.trim().length < 2) return [];
  const prox = proximity ? `&proximity=${proximity[0]},${proximity[1]}` : '';
  const data = await maptilerFetch(
    `https://api.maptiler.com/geocoding/${encodeURIComponent(
      query.trim()
    )}.json?key=${MAPTILER_KEY}&limit=6&fuzzyMatch=true&language=en&country=in${prox}`
  );
  if (!data?.features?.length) return [];
  return data.features
    .map((f: any) => ({
      label: f.text ?? f.place_name ?? '',
      address: f.place_name ?? f.formatted ?? '',
      coords: [f.center?.[0] ?? 0, f.center?.[1] ?? 0] as [number, number],
      score: f.relevance ?? 0,
    }))
    .filter((s: PlaceSuggestion) => s.coords[0] && s.coords[1]);
};

export const placeNameFromMapTiler = async (
  coords: [number, number]
): Promise<string | null> => {
  const [lng, lat] = coords;
  const data = await maptilerFetch(
    `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_KEY}&limit=1&language=en`
  );
  const f = data?.features?.[0];
  if (!f) return null;
  const context: { text?: string; kind?: string }[] = f.context ?? [];
  const place =
    context.find((c) => c.kind === 'place')?.text ??
    context.find((c) => c.kind === 'locality')?.text ??
    context.find((c) => c.kind === 'district')?.text ??
    context.find((c) => c.kind === 'suburb')?.text ??
    f.text ??
    null;
  return place;
};