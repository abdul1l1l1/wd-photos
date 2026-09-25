import assert from 'node:assert/strict';
import test from 'node:test';
import {
  albumAfterServerLoad,
  albumsEqual,
  hasUnsyncedAlbumChanges,
  markAlbumUnsynced,
  normalizeAlbum,
  readAlbum,
  reconcileAlbumAfterServerLoad,
  starterAlbum,
  STORAGE_DIRTY_KEY,
  STORAGE_KEY,
} from './albumData';

const legacyPhotos = starterAlbum.photos.map(({ description: _description, ...photo }) => ({ ...photo }));

test('a locally saved blank description survives reload', () => {
  const saved = {
    ...starterAlbum,
    photos: starterAlbum.photos.map((photo) =>
      photo.id === 4 ? { ...photo, description: '' } : photo,
    ),
  };
  const storage = { getItem: (key: string) => key === STORAGE_KEY ? JSON.stringify(saved) : null };

  assert.equal(readAlbum(storage).photos.find((photo) => photo.id === 4)?.description, '');
});

test('a blank edit made before server initialization wins over late server hydration', () => {
  const localAlbum = {
    ...starterAlbum,
    photos: starterAlbum.photos.map((photo) =>
      photo.id === 4 ? { ...photo, description: '' } : photo,
    ),
  };
  const values = new Map<string, string>([[STORAGE_KEY, JSON.stringify(localAlbum)]]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };

  markAlbumUnsynced(storage);
  const reloaded = readAlbum(storage);
  const hydrated = albumAfterServerLoad(
    reloaded,
    starterAlbum,
    storage.getItem(STORAGE_DIRTY_KEY) === 'true',
  );

  assert.equal(hydrated.photos.find((photo) => photo.id === 4)?.description, '');
});

test('no-op and reverted edits do not block a newer server blank description', () => {
  const localAlbum = starterAlbum;
  const revertedAlbum = {
    ...starterAlbum,
    photos: starterAlbum.photos.map((photo) => ({ ...photo })),
  };
  const newerServerAlbum = {
    ...starterAlbum,
    photos: starterAlbum.photos.map((photo) =>
      photo.id === 4 ? { ...photo, description: '' } : photo,
    ),
  };

  const hasUnsyncedNoOp = !albumsEqual(localAlbum, starterAlbum);
  const hasUnsyncedRevert = !albumsEqual(revertedAlbum, starterAlbum);
  assert.equal(hasUnsyncedNoOp, false);
  assert.equal(hasUnsyncedRevert, false);

  const hydrated = reconcileAlbumAfterServerLoad(
    revertedAlbum,
    newerServerAlbum,
    hasUnsyncedRevert,
  );
  assert.equal(hydrated.hasUnsyncedLocalChanges, false);
  assert.equal(hydrated.album.photos.find((photo) => photo.id === 4)?.description, '');
});

test('a stale dirty marker is cleared when local and server data already match', () => {
  const reconciled = reconcileAlbumAfterServerLoad(
    starterAlbum,
    starterAlbum,
    true,
  );

  assert.equal(reconciled.hasUnsyncedLocalChanges, false);
  assert.equal(reconciled.album, starterAlbum);
});

test('an unmarked locally stored album yields to late server hydration', () => {
  const localAlbum = {
    ...starterAlbum,
    title: 'My saved album',
    photos: starterAlbum.photos.map((photo) =>
      photo.id === 1 ? { ...photo, caption: 'My autumn photo' } : photo,
    ),
  };
  const serverAlbum = {
    ...starterAlbum,
    title: 'Original server album',
  };

  const reconciled = reconcileAlbumAfterServerLoad(
    localAlbum,
    serverAlbum,
    false,
    true,
  );

  assert.equal(reconciled.hasUnsyncedLocalChanges, false);
  assert.equal(reconciled.album, serverAlbum);
});

test('a stale locally stored starter copy is replaced by the newer server copy', () => {
  const staleLocalAlbum = {
    ...starterAlbum,
    photos: starterAlbum.photos.map((photo) =>
      photo.id === 1
        ? {
            ...photo,
            caption: 'Autumn Passage',
            description: 'A pale gravel path disappears into a tunnel of copper and rust-colored trees, with fallen leaves gathering along the quiet woodland trail.',
          }
        : photo,
    ),
  };

  const reconciled = reconcileAlbumAfterServerLoad(
    staleLocalAlbum,
    starterAlbum,
    true,
    true,
  );

  assert.equal(reconciled.hasUnsyncedLocalChanges, false);
  assert.equal(reconciled.album, starterAlbum);
});

test('a cached legacy description with the current caption is migrated', () => {
  const staleLocalAlbum = {
    ...starterAlbum,
    photos: starterAlbum.photos.map((photo) =>
      photo.id === 1
        ? {
            ...photo,
            description:
              'A tree-lined path shows the seasonal color change of deciduous foliage. As chlorophyll breaks down in cooler weather, yellow and orange pigments become more visible.',
          }
        : photo,
    ),
  };
  const storageValues = new Map<string, string>([
    [STORAGE_KEY, JSON.stringify(staleLocalAlbum)],
    ['wd-photo-album-copy-version', '16'],
  ]);
  const storage = {
    getItem: (key: string) => storageValues.get(key) ?? null,
    setItem: (key: string, value: string) => storageValues.set(key, value),
  };

  const migrated = readAlbum(storage);

  assert.equal(
    migrated.photos.find((photo) => photo.id === 1)?.description,
    starterAlbum.photos.find((photo) => photo.id === 1)?.description,
  );
  assert.equal(storageValues.get('wd-photo-album-copy-version'), '23');
});

test('a cached legacy GitHub image URL is migrated to the synced asset', () => {
  const staleLocalAlbum = {
    ...starterAlbum,
    photos: starterAlbum.photos.map((photo) =>
      photo.id === 1
        ? {
            ...photo,
            src: 'https://raw.githubusercontent.com/abdul1l1l1/wd-photos/main/images/photo-01.jpg?v=old',
            description:
              'A tree-lined path shows the seasonal color change of deciduous foliage. As chlorophyll breaks down in cooler weather, yellow and orange pigments become more visible.',
          }
        : photo,
    ),
  };
  const storageValues = new Map<string, string>([
    [STORAGE_KEY, JSON.stringify(staleLocalAlbum)],
    ['wd-photo-album-copy-version', '17'],
  ]);
  const storage = {
    getItem: (key: string) => storageValues.get(key) ?? null,
    setItem: (key: string, value: string) => storageValues.set(key, value),
  };

  const migrated = readAlbum(storage);
  const firstPhoto = migrated.photos.find((photo) => photo.id === 1);

  assert.equal(firstPhoto?.src, starterAlbum.photos.find((photo) => photo.id === 1)?.src);
  assert.equal(firstPhoto?.description, starterAlbum.photos.find((photo) => photo.id === 1)?.description);
  assert.equal(storageValues.get('wd-photo-album-copy-version'), '23');
});

test('a cached Photo 4 starter caption and description migrate to the updated copy', () => {
  const staleLocalAlbum = {
    ...starterAlbum,
    photos: starterAlbum.photos.map((photo) =>
      photo.id === 4
        ? {
            ...photo,
            caption: 'Rainlit Drive',
            description: 'Rain and city lights blur together during a quiet night drive.',
          }
        : photo,
    ),
  };
  const storageValues = new Map<string, string>([
    [STORAGE_KEY, JSON.stringify(staleLocalAlbum)],
    ['wd-photo-album-copy-version', '18'],
  ]);
  const storage = {
    getItem: (key: string) => storageValues.get(key) ?? null,
    setItem: (key: string, value: string) => storageValues.set(key, value),
  };

  const migrated = readAlbum(storage);
  const fourthPhoto = migrated.photos.find((photo) => photo.id === 4);

  assert.equal(fourthPhoto?.caption, 'Late Night Rides');
  assert.equal(
    fourthPhoto?.description,
    'Driving around with friends.',
  );
  assert.equal(storageValues.get('wd-photo-album-copy-version'), '23');
});

test('version 22 starter descriptions migrate to the latest copy except for photo 5', () => {
  const previousDescriptions = new Map<number, string>([
    [1, 'Fall days like this just feel peaceful.'],
    [2, 'Just me and the music for a while.'],
    [3, 'The city feels different after dark.'],
    [4, 'Late rides with friends just hit different.'],
    [6, 'A late walk helps me clear my head.'],
    [7, 'Slow nights like this are my favorite.'],
    [8, 'Just taking a minute to enjoy the day.'],
    [9, 'Nothing but peace out here.'],
  ]);
  const savedAlbum = {
    ...starterAlbum,
    photos: starterAlbum.photos.map((photo) => ({
      ...photo,
      description: previousDescriptions.get(photo.id) ?? photo.description,
    })),
  };
  const storageValues = new Map<string, string>([
    [STORAGE_KEY, JSON.stringify(savedAlbum)],
    ['wd-photo-album-copy-version', '22'],
  ]);
  const storage = {
    getItem: (key: string) => storageValues.get(key) ?? null,
    setItem: (key: string, value: string) => storageValues.set(key, value),
  };

  const migrated = readAlbum(storage);

  for (const photo of starterAlbum.photos) {
    const migratedPhoto = migrated.photos.find((candidate) => candidate.id === photo.id);
    assert.equal(migratedPhoto?.description, photo.description);
    assert.equal(migratedPhoto?.src, photo.src);
  }
  assert.equal(
    migrated.photos.find((photo) => photo.id === 5)?.description,
    'I AM MUSIC BY PLAYBOI CARTI',
  );
  assert.equal(storageValues.get('wd-photo-album-copy-version'), '23');
});

test('a cached Autumn description updates without replacing its image', () => {
  const externalImage = 'https://example.com/autumn-house.jpg';
  const staleLocalAlbum = {
    ...starterAlbum,
    photos: starterAlbum.photos.map((photo) =>
      photo.id === 1
        ? {
            ...photo,
            src: externalImage,
            description: 'A quiet path winds through trees covered in autumn leaves.',
          }
        : photo,
    ),
  };
  const storageValues = new Map<string, string>([
    [STORAGE_KEY, JSON.stringify(staleLocalAlbum)],
    ['wd-photo-album-copy-version', '20'],
  ]);
  const storage = {
    getItem: (key: string) => storageValues.get(key) ?? null,
    setItem: (key: string, value: string) => storageValues.set(key, value),
  };

  const migrated = readAlbum(storage);
  const autumnPhoto = migrated.photos.find((photo) => photo.id === 1);

  assert.equal(autumnPhoto?.src, externalImage);
  assert.equal(autumnPhoto?.caption, 'Autumn');
  assert.equal(autumnPhoto?.description, 'A quiet fall day.');
  assert.equal(storageValues.get('wd-photo-album-copy-version'), '23');
});

test('the previous Autumn thumbnail migrates to the latest saved image', () => {
  const previousImage =
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKD8eoSJRpJKWnXAl4O_vC-DEBikttkR8ET6n8Qn29jg&s=10';
  const staleLocalAlbum = {
    ...starterAlbum,
    photos: starterAlbum.photos.map((photo) =>
      photo.id === 1
        ? {
            ...photo,
            src: previousImage,
            description: 'A quiet path winds through trees covered in autumn leaves.',
          }
        : photo,
    ),
  };
  const storageValues = new Map<string, string>([
    [STORAGE_KEY, JSON.stringify(staleLocalAlbum)],
    ['wd-photo-album-copy-version', '20'],
  ]);
  const storage = {
    getItem: (key: string) => storageValues.get(key) ?? null,
    setItem: (key: string, value: string) => storageValues.set(key, value),
  };

  const migrated = readAlbum(storage);
  const autumnPhoto = migrated.photos.find((photo) => photo.id === 1);

  assert.equal(autumnPhoto?.src, starterAlbum.photos.find((photo) => photo.id === 1)?.src);
  assert.equal(autumnPhoto?.description, 'A quiet fall day.');
});

test('legacy copy migrates without replacing a newer external image', () => {
  const legacyValues = [
    {
      id: 1,
      caption: 'Autumn Passage',
      description:
        'A pale gravel path disappears into a tunnel of copper and rust-colored trees, with fallen leaves gathering along the quiet woodland trail.',
    },
    {
      id: 4,
      caption: 'Rainy Car Rides',
      description:
        'Rain covers the windshield and breaks the road ahead into soft amber and red shapes. The wiper edge cuts across the glass while blurred traffic and wet pavement make the car’s slow, enclosed nighttime ride feel private and cinematic.',
    },
    {
      id: 6,
      caption: 'Open Octagon',
      description:
        'Dark structural beams form a precise octagonal frame around a bright opening, drawing the eye upward toward a clear and nearly featureless sky.',
    },
  ];
  const externalSources = new Map(
    legacyValues.map(({ id }) => [
      id,
      `https://encrypted-tbn0.gstatic.com/images?photo=${id}`,
    ]),
  );
  const staleAlbum = {
    ...starterAlbum,
    photos: starterAlbum.photos.map((photo) => {
      const legacy = legacyValues.find((candidate) => candidate.id === photo.id);
      return legacy
        ? { ...photo, src: externalSources.get(photo.id)!, ...legacy }
        : photo;
    }),
  };
  const storageValues = new Map<string, string>([
    [STORAGE_KEY, JSON.stringify(staleAlbum)],
    ['wd-photo-album-copy-version', '19'],
  ]);
  const storage = {
    getItem: (key: string) => storageValues.get(key) ?? null,
    setItem: (key: string, value: string) => storageValues.set(key, value),
  };

  const migrated = readAlbum(storage);

  for (const legacy of legacyValues) {
    const migratedPhoto = migrated.photos.find((photo) => photo.id === legacy.id);
    const starter = starterAlbum.photos.find((photo) => photo.id === legacy.id);
    assert.equal(migratedPhoto?.src, externalSources.get(legacy.id));
    assert.equal(migratedPhoto?.caption, starter?.caption);
    assert.equal(migratedPhoto?.description, starter?.description);
  }
  assert.equal(storageValues.get('wd-photo-album-copy-version'), '23');
});

test('the supplied fifth photo replaces any cached fifth-photo variant', () => {
  const cachedAlbum = {
    ...starterAlbum,
    photos: starterAlbum.photos.map((photo) =>
      photo.id === 5
        ? {
            ...photo,
            src: 'data:image/jpeg;base64,cached-photo',
            caption: 'Beneath the Manhattan Bridge',
            description: 'The old bridge description.',
          }
        : photo,
    ),
  };

  const storageValues = new Map<string, string>([
    [STORAGE_KEY, JSON.stringify(cachedAlbum)],
    ['wd-photo-album-copy-version', '7'],
  ]);
  const storage = {
    getItem: (key: string) => storageValues.get(key) ?? null,
    setItem: (key: string, value: string) => storageValues.set(key, value),
  };

  const migrated = readAlbum(storage);
  const fifthPhoto = migrated.photos.find((photo) => photo.id === 5);

  assert.equal(fifthPhoto?.src, '/images/photo-05-v3.jpg');
  assert.equal(fifthPhoto?.caption, 'I AM MUSIC');
  assert.equal(fifthPhoto?.description, 'I AM MUSIC BY PLAYBOI CARTI');
});

test('an existing unsynced blank survives a pre-hydration edit and revert', () => {
  const dirtyLocalAlbum = {
    ...starterAlbum,
    photos: starterAlbum.photos.map((photo) =>
      photo.id === 4 ? { ...photo, description: '' } : photo,
    ),
  };
  const temporarilyEdited = { ...dirtyLocalAlbum, title: 'Temporary title' };
  const revertedBeforeHydration = { ...temporarilyEdited, title: dirtyLocalAlbum.title };

  assert.equal(
    hasUnsyncedAlbumChanges(
      revertedBeforeHydration,
      dirtyLocalAlbum,
      true,
    ),
    true,
  );

  const reconciled = reconcileAlbumAfterServerLoad(
    revertedBeforeHydration,
    starterAlbum,
    true,
  );
  assert.equal(reconciled.hasUnsyncedLocalChanges, true);
  assert.equal(
    reconciled.album.photos.find((photo) => photo.id === 4)?.description,
    '',
  );
});

test('missing legacy descriptions use the fallback for the matching photo ID', () => {
  const normalized = normalizeAlbum({ title: starterAlbum.title, photos: legacyPhotos });

  for (const photo of normalized.photos) {
    assert.equal(
      photo.description,
      starterAlbum.photos.find((starter) => starter.id === photo.id)?.description,
    );
  }
});

test('reordered legacy photos never receive another photo description', () => {
  const normalized = normalizeAlbum({
    title: starterAlbum.title,
    photos: [...legacyPhotos].reverse(),
  });

  assert.deepEqual(
    normalized.photos.map(({ id, description }) => ({ id, description })),
    [...starterAlbum.photos]
      .reverse()
      .map(({ id, description }) => ({ id, description })),
  );
});