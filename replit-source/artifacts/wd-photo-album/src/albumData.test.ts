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

test('an existing locally stored album is never replaced by late server hydration', () => {
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

  assert.equal(reconciled.hasUnsyncedLocalChanges, true);
  assert.equal(reconciled.album, localAlbum);
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
  assert.match(fifthPhoto?.description ?? '', /album cover/);
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