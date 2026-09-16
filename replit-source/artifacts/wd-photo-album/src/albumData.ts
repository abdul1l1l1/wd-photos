export type Photo = {
  id: number;
  src: string;
  caption: string;
  description: string;
};

export type Album = { title: string; photos: Photo[] };

export const STORAGE_KEY = 'wd-photo-album-v1';
export const STORAGE_DIRTY_KEY = 'wd-photo-album-unsynced';
const PHOTO_COPY_VERSION_KEY = 'wd-photo-album-copy-version';
const PHOTO_COPY_VERSION = '5';

export const starterAlbum: Album = {
  title: 'WD Photo',
  photos: [
    { id: 1, src: '/images/restored-photo-01-v2.jpg', caption: 'Autumn', description: 'A tree-lined path shows the seasonal color change of deciduous foliage. As chlorophyll breaks down in cooler weather, yellow and orange pigments become more visible before the leaves fall and return nutrients to the forest floor.' },
    { id: 2, src: '/images/restored-photo-02-v2.jpg', caption: 'Listening to Music', description: 'This collection of headphones, earbuds, cables, charging cases, and portable players represents several ways people listen to recorded audio. Wired equipment carries the signal through a physical connection, while wireless devices trade cables for rechargeable batteries and Bluetooth connectivity.' },
    { id: 3, src: '/images/restored-photo-03-v2.jpg', caption: 'Downtown San Diego', description: 'Downtown San Diego combines office towers, hotels, apartments, entertainment districts, and transportation corridors near San Diego Bay. After sunset, illuminated high-rises and moving traffic reveal the density and activity of the city center.' },
    { id: 4, src: '/images/restored-photo-04-v2.jpg', caption: 'Rainy Car Rides', description: 'Raindrops on a windshield scatter traffic lights into soft shapes and reduce contrast on the road ahead. Wet pavement also increases stopping distance, making slower speeds, greater following distance, and clear visibility especially important during a rainy drive.' },
    { id: 5, src: '/images/restored-photo-05-v2.jpg', caption: 'Beneath the Manhattan Bridge', description: 'The steel span of the Manhattan Bridge crosses overhead while the distant skyline appears beyond its columns in warm late-day light.' },
    { id: 6, src: '/images/restored-photo-06-v2.jpg', caption: 'Open Octagon', description: 'Dark structural beams form a precise octagonal frame around a bright opening, drawing the eye upward toward a clear and nearly featureless sky.' },
    { id: 7, src: '/images/photo-07.jpg', caption: 'Lantern hour', description: 'Dusk settling in, warm glow illuminating the evening as the day winds down.' },
    { id: 8, src: '/images/photo-08.jpg', caption: 'Hard light', description: 'Sharp contrasts created by the unforgiving midday sun, highlighting every detail.' },
    { id: 9, src: '/images/photo-09.jpg', caption: 'Edge of water', description: 'Where the land meets the calm surface, reflecting the sky in a perfect mirror.' },
  ],
};

const legacyPhotoCopy = new Map([
  [1, { srcs: ['/images/photo-01.jpg', '/images/restored-photo-01.jpg', '/images/restored-photo-01-v2.jpg'], captions: ['Upside-Down City', 'Autumn Passage'], descriptions: ['A narrow rain puddle turns the brick building across the street upside down, holding its windows and pointed roof inside a quiet strip of wet pavement.', 'A pale gravel path disappears into a tunnel of copper and rust-colored trees, with fallen leaves gathering along the quiet woodland trail.'] }],
  [2, { srcs: ['/images/photo-02.jpg', '/images/restored-photo-02.jpg', '/images/restored-photo-02-v2.jpg'], captions: ['One Line Above', 'Everyday Audio Kit'], descriptions: ['A charcoal wall cuts diagonally across a bright cyan sky while a single white contrail passes overhead, reducing the scene to color, scale, and one precise line.', 'Headphones, earbuds, charging cases, cables, and pocket-sized devices are arranged across dark fabric like the contents of a daily listening routine.'] }],
  [3, { srcs: ['/images/photo-03.jpg', '/images/restored-photo-03.jpg', '/images/restored-photo-03-v2.jpg'], captions: ['Red Towers, Blue Sky', 'City After Dark'], descriptions: ['Two reflective skyscrapers rise from opposite corners, their warm red grids framing a vivid opening of blue sky and drifting white clouds.', 'A brightly illuminated skyline rises against the night, with glass towers, colorful lights, and flowing traffic defining the city after sunset.'] }],
  [4, { srcs: ['/images/photo-04.jpg', '/images/restored-photo-04.jpg', '/images/restored-photo-04-v2.jpg'], captions: ['White Rhythm', 'Through the Rain'], descriptions: ['Soft vertical folds move from shadow into light, transforming a simple white curtain into a quiet study of repetition, texture, and brightness.', 'Traffic signals and red brake lights blur behind a rain-covered windshield, turning an ordinary drive into a layered study of water, color, and motion.'] }],
  [5, { srcs: ['/images/photo-05.jpg', '/images/restored-photo-05.jpg'], captions: ['Under the bridge'], descriptions: ['Shadows cast long and deep, hiding secrets beneath concrete and steel.'] }],
  [6, { srcs: ['/images/photo-06.jpg', '/images/restored-photo-06.jpg'], captions: ['Open to sky'], descriptions: ['A rare clearing where the clouds gather, uninterrupted by the city below.'] }],
]);

type StoredPhoto = Omit<Photo, 'description'> & { description?: unknown };
type StoredAlbum = Omit<Album, 'photos'> & { photos: StoredPhoto[] };

export function normalizeAlbum(album: StoredAlbum, upgradePhotoCopy = false): Album {
  return {
    ...album,
    photos: album.photos.map((photo) => {
      const starter = starterAlbum.photos.find((candidate) => candidate.id === photo.id);
      const legacy = legacyPhotoCopy.get(photo.id);
      const shouldUpgradeCopy =
        upgradePhotoCopy &&
        Boolean(starter) &&
        Boolean(legacy) &&
        legacy?.srcs.includes(photo.src) === true;

      return {
        ...photo,
        src: shouldUpgradeCopy ? starter?.src ?? photo.src : photo.src,
        caption:
          shouldUpgradeCopy && legacy?.captions.includes(photo.caption)
            ? starter?.caption ?? photo.caption
            : photo.caption,
        description:
          typeof photo.description !== 'string'
            ? starter?.description ?? ''
            : shouldUpgradeCopy && legacy?.descriptions.includes(photo.description)
              ? starter?.description ?? photo.description
              : photo.description,
      };
    }),
  };
}

type AlbumStorage = Pick<Storage, 'getItem'> & Partial<Pick<Storage, 'setItem'>>;

export function readAlbum(storage: AlbumStorage | undefined = typeof window === 'undefined' ? undefined : window.localStorage): Album {
  if (!storage) return starterAlbum;
  try {
    const stored = storage.getItem(STORAGE_KEY);
    if (!stored) return starterAlbum;
    const parsed = JSON.parse(stored) as StoredAlbum;
    if (!parsed?.title || !Array.isArray(parsed.photos) || parsed.photos.length !== 9) return starterAlbum;
    const needsPhotoCopyUpgrade = storage.getItem(PHOTO_COPY_VERSION_KEY) !== PHOTO_COPY_VERSION;
    const normalized = normalizeAlbum(parsed, needsPhotoCopyUpgrade);
    if (needsPhotoCopyUpgrade) {
      storage.setItem?.(PHOTO_COPY_VERSION_KEY, PHOTO_COPY_VERSION);
    }
    return normalized;
  } catch {
    return starterAlbum;
  }
}

export function markAlbumUnsynced(storage: Pick<Storage, 'setItem'>): void {
  storage.setItem(STORAGE_DIRTY_KEY, 'true');
}

export function albumsEqual(left: Album, right: Album): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function hasUnsyncedAlbumChanges(
  album: Album,
  baseline: Album,
  preserveExistingDirty: boolean,
): boolean {
  return preserveExistingDirty || !albumsEqual(album, baseline);
}
export function cloneStarters(): Album {
  return { title: starterAlbum.title, photos: starterAlbum.photos.map((photo) => ({ ...photo })) };
}

export function albumAfterServerLoad(
  localAlbum: Album,
  serverAlbum: Album,
  hasUnsyncedLocalChanges: boolean,
): Album {
  return hasUnsyncedLocalChanges ? localAlbum : serverAlbum;
}

export function reconcileAlbumAfterServerLoad(
  localAlbum: Album,
  serverAlbum: Album,
  wasMarkedUnsynced: boolean,
  hasStoredLocalAlbum = false,
): { album: Album; hasUnsyncedLocalChanges: boolean } {
  const hasUnsyncedLocalChanges =
    (wasMarkedUnsynced || hasStoredLocalAlbum) &&
    !albumsEqual(localAlbum, serverAlbum);
  return {
    album: albumAfterServerLoad(
      localAlbum,
      serverAlbum,
      hasUnsyncedLocalChanges,
    ),
    hasUnsyncedLocalChanges,
  };
}
