import { ReplitConnectors } from "@replit/connectors-sdk";

const OWNER = "abdul1l1l1";
const REPO = "wd-photos";
const BRANCH = "main";
const REPO_API = `/repos/${OWNER}/${REPO}`;
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
let syncQueue: Promise<void> = Promise.resolve();

export type AlbumPhoto = {
  id: number;
  src: string;
  caption: string;
  description: string;
};

export type AlbumDocument = {
  title: string;
  photos: AlbumPhoto[];
  lastSyncedAt: string | null;
};

type GitHubContent = {
  content?: string;
  encoding?: string;
};

type GitRef = {
  object: { sha: string };
};

type GitCommit = {
  tree: { sha: string };
};

type GitBlob = {
  sha: string;
};

type GitTree = {
  sha: string;
};

const starterAlbum: AlbumDocument = {
  title: "WD Photo",
  photos: [
    { id: 1, src: "/images/photo-01.jpg", caption: "Upside-Down City", description: "A narrow rain puddle turns the brick building across the street upside down, holding its windows and pointed roof inside a quiet strip of wet pavement." },
    { id: 2, src: "/images/photo-02.jpg", caption: "One Line Above", description: "A charcoal wall cuts diagonally across a bright cyan sky while a single white contrail passes overhead, reducing the scene to color, scale, and one precise line." },
    { id: 3, src: "/images/photo-03.jpg", caption: "Red Towers, Blue Sky", description: "Two reflective skyscrapers rise from opposite corners, their warm red grids framing a vivid opening of blue sky and drifting white clouds." },
    { id: 4, src: "/images/photo-04.jpg", caption: "White Rhythm", description: "Soft vertical folds move from shadow into light, transforming a simple white curtain into a quiet study of repetition, texture, and brightness." },
    { id: 5, src: "/images/photo-05.jpg", caption: "Under the bridge", description: "The underside of a city bridge stretches overhead, its heavy structure balanced by warm light beyond." },
    { id: 6, src: "/images/photo-06.jpg", caption: "Open to sky", description: "A pale opening interrupts a dark architectural grid, drawing the eye toward a small patch of sky." },
    { id: 7, src: "/images/photo-07.jpg", caption: "Lantern hour", description: "A glowing lantern hangs against deepening blue, marking the quiet transition from daylight into evening." },
    { id: 8, src: "/images/photo-08.jpg", caption: "Hard light", description: "Sharp sunlight divides the scene into bold planes, revealing texture through strong contrast and shadow." },
    { id: 9, src: "/images/photo-09.jpg", caption: "Edge of water", description: "Water meets the built edge in a calm horizon, with muted tones that hold the scene in stillness." },
  ],
  lastSyncedAt: null,
};

class GitHubRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function githubRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const connectors = new ReplitConnectors();
  const response = await connectors.proxy("github", path, {
    method: init.method ?? "GET",
    headers: init.body ? { "content-type": "application/json" } : undefined,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new GitHubRequestError(message || "GitHub request failed", response.status);
  }

  return (await response.json()) as T;
}

export async function readAlbumFromGitHub(): Promise<AlbumDocument> {
  try {
    const file = await githubRequest<GitHubContent>(
      `${REPO_API}/contents/album.json?ref=${BRANCH}`,
    );
    if (!file.content || file.encoding !== "base64") return starterAlbum;

    const parsed = JSON.parse(
      Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8"),
    ) as Omit<AlbumDocument, "photos"> & {
      photos: Array<Omit<AlbumPhoto, "description"> & { description?: string }>;
    };

    if (
      typeof parsed.title !== "string" ||
      !Array.isArray(parsed.photos) ||
      parsed.photos.length !== 9
    ) {
      return starterAlbum;
    }

    return {
      ...parsed,
      photos: parsed.photos.map((photo) => ({
        ...photo,
        description:
          typeof photo.description === "string"
            ? photo.description
            : starterAlbum.photos.find((starter) => starter.id === photo.id)
                ?.description ?? "",
      })),
    };
  } catch (error) {
    if (error instanceof GitHubRequestError && error.status === 404) {
      return starterAlbum;
    }
    throw error;
  }
}

function uploadedImage(
  photo: AlbumPhoto,
): { bytes: Buffer; extension: "jpg" | "png" | "webp" } | null {
  const match = photo.src.match(
    /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=\s]+)$/,
  );
  if (!match) return null;

  const extension = match[1] === "jpeg" ? "jpg" : match[1];
  const bytes = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) {
    throw new Error(`Photo ${photo.id} must be smaller than 6 MB`);
  }

  return { bytes, extension: extension as "jpg" | "png" | "webp" };
}

async function commitAlbumToGitHub(
  album: Omit<AlbumDocument, "lastSyncedAt">,
): Promise<AlbumDocument> {
  const ref = await githubRequest<GitRef>(`${REPO_API}/git/ref/heads/${BRANCH}`);
  const parentCommit = await githubRequest<GitCommit>(
    `${REPO_API}/git/commits/${ref.object.sha}`,
  );
  const syncedAt = new Date().toISOString();
  const treeEntries: Array<{
    path: string;
    mode: "100644";
    type: "blob";
    sha: string;
  }> = [];

  const normalizedPhotos = await Promise.all(
    album.photos.map(async (photo) => {
      const upload = uploadedImage(photo);
      if (!upload) return photo;

      const path = `images/photo-${String(photo.id).padStart(2, "0")}.${upload.extension}`;
      const blob = await githubRequest<GitBlob>(`${REPO_API}/git/blobs`, {
        method: "POST",
        body: {
          content: upload.bytes.toString("base64"),
          encoding: "base64",
        },
      });
      treeEntries.push({ path, mode: "100644", type: "blob", sha: blob.sha });

      return {
        ...photo,
        src: `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}?v=${encodeURIComponent(syncedAt)}`,
      };
    }),
  );

  const document: AlbumDocument = {
    title: album.title,
    photos: normalizedPhotos,
    lastSyncedAt: syncedAt,
  };

  const albumBlob = await githubRequest<GitBlob>(`${REPO_API}/git/blobs`, {
    method: "POST",
    body: {
      content: Buffer.from(JSON.stringify(document, null, 2), "utf8").toString(
        "base64",
      ),
      encoding: "base64",
    },
  });
  treeEntries.push({
    path: "album.json",
    mode: "100644",
    type: "blob",
    sha: albumBlob.sha,
  });

  const tree = await githubRequest<GitTree>(`${REPO_API}/git/trees`, {
    method: "POST",
    body: {
      base_tree: parentCommit.tree.sha,
      tree: treeEntries,
    },
  });
  const commit = await githubRequest<{ sha: string }>(`${REPO_API}/git/commits`, {
    method: "POST",
    body: {
      message: `Sync WD Photo album ${syncedAt}`,
      tree: tree.sha,
      parents: [ref.object.sha],
    },
  });
  await githubRequest<GitRef>(`${REPO_API}/git/refs/heads/${BRANCH}`, {
    method: "PATCH",
    body: { sha: commit.sha, force: false },
  });

  return document;
}

export function saveAlbumToGitHub(
  album: Omit<AlbumDocument, "lastSyncedAt">,
): Promise<AlbumDocument> {
  const run = syncQueue.then(() => commitAlbumToGitHub(album));
  syncQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}