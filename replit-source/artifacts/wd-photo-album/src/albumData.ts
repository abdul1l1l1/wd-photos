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
const PHOTO_COPY_VERSION = '3';

export const starterAlbum: Album = {
  title: 'WD Photo',
  photos: [
    { id: 1, src: '/images/restored-photo-01.jpg', caption: 'Autumn Passage', description: 'A pale gravel path disappears into a tunnel of copper and rust-colored trees, with fallen leaves gathering along the quiet woodland trail.' },
    { id: 2, src: '/images/restored-photo-02.jpg', caption: 'Everyday Audio Kit', description: 'Headphones, earbuds, charging cases, cables, and pocket-sized devices are arranged across dark fabric like the contents of a daily listening routine.' },
    { id: 3, src: '/images/restored-photo-03.jpg', caption: 'City After Dark', description: 'A brightly illuminated skyline rises against the night, with glass towers, colorful lights, and flowing traffic defining the city after sunset.' },
    { id: 4, src: '/images/restored-photo-04.jpg', caption: 'Through the Rain', description: 'Traffic signals and red brake lights blur behind a rain-covered windshield, turning an ordinary drive into a layered study of water, color, and motion.' },
    { id: 5, src: '/images/restored-photo-05.jpg', caption: 'Beneath the Manhattan Bridge', description: 'The steel span of the Manhattan Bridge crosses overhead while the distant skyline appears beyond its columns in warm late-day light.' },
    { id: 6, src: '/images/restored-photo-06.jpg', caption: 'Open Octagon', description: 'Dark structural beams form a precise octagonal frame around a bright opening, drawing the eye upward toward a clear and nearly featureless sky.' },
    { id: 7, src: '/images/photo-07.jpg', caption: 'Lantern hour', description: 'Dusk settling in, warm glow illuminating the evening as the day winds down.' },
    { id: 8, src: '/images/photo-08.jpg', caption: 'Hard light', description: 'Sharp contrasts created by the unforgiving midday sun, highlighting every detail.' },
    { id: 9, src: '/images/photo-09.jpg', caption: 'Edge of water', description: 'Where the land meets the calm surface, reflecting the sky in a perfect mirror.' },
  ],
};

const legacyPhotoCopy = new Map([
  [1, { src: '/images/photo-01.jpg', caption: 'Upside-Down City', description: 'A narrow rain puddle turns the brick building across the street upside down, holding its windows and pointed roof inside a quiet strip of wet pavement.' }],
  [2, { src: '/images/photo-02.jpg', caption: 'One Line Above', description: 'A charcoal wall cuts diagonally across a bright cyan sky while a single white contrail passes overhead, reducing the scene to color, scale, and one precise line.' }],
  [3, { src: '/images/photo-03.jpg', caption: 'Red Towers, Blue Sky', description: 'Two reflective skyscrapers rise from opposite corners, their warm red grids framing a vivid opening of blue sky and drifting white clouds.' }],
  [4, { src: '/images/photo-04.jpg', caption: 'White Rhythm', description: 'Soft vertical folds move from shadow into light, transforming a simple white curtain into a quiet study of repetition, texture, and brightness.' }],
  [5, { src: '/images/photo-05.jpg', caption: 'Under the bridge', description: 'Shadows cast long and deep, hiding secrets beneath concrete and steel.' }],
  [6, { src: '/images/photo-06.jpg', caption: 'Open to sky', description: 'A rare clearing where the clouds gather, uninterrupted by the city below.' }],
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
        photo.src === legacy?.src;

      return {
        ...photo,
        src: shouldUpgradeCopy ? starter?.src ?? photo.src : photo.src,
        caption:
          shouldUpgradeCopy && photo.caption === legacy?.caption
            ? starter?.caption ?? photo.caption
            : photo.caption,
        description:
          typeof photo.description !== 'string'
            ? starter?.description ?? ''
            : shouldUpgradeCopy && photo.description === legacy?.description
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
): { album: Album; hasUnsyncedLocalChanges: boolean } {
  const hasUnsyncedLocalChanges =
    wasMarkedUnsynced && !albumsEqual(localAlbum, serverAlbum);
  return {
    album: albumAfterServerLoad(
      localAlbum,
      serverAlbum,
      hasUnsyncedLocalChanges,
    ),
    hasUnsyncedLocalChanges,
  };
}
