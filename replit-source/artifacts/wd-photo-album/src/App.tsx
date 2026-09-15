import { useEffect, useState, useRef, type CSSProperties, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ImagePlus, Pencil, RotateCcw, Upload, X } from 'lucide-react';
import { Route, Switch, useLocation, Router as WouterRouter, Link } from 'wouter';
import NotFound from '@/pages/not-found';

import { useGetAlbum, useSyncAlbum, getGetAlbumQueryKey } from '@workspace/api-client-react';
import { ClerkProvider, SignIn, SignUp, useUser, useClerk, ClerkLoaded } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { dark } from '@clerk/themes';

type Photo = { id: number; src: string; caption: string };
type Album = { title: string; photos: Photo[] };

const STORAGE_KEY = 'wd-photo-album-v1';
const STORAGE_DIRTY_KEY = 'wd-photo-album-unsynced';
const starterAlbum: Album = {
  title: 'WD Photo',
  photos: [
    { id: 1, src: '/images/photo-01.jpg', caption: 'After the rain' },
    { id: 2, src: '/images/photo-02.jpg', caption: 'Quiet geometry' },
    { id: 3, src: '/images/photo-03.jpg', caption: 'Looking up' },
    { id: 4, src: '/images/photo-04.jpg', caption: 'Soft repetition' },
    { id: 5, src: '/images/photo-05.jpg', caption: 'Under the bridge' },
    { id: 6, src: '/images/photo-06.jpg', caption: 'Open to sky' },
    { id: 7, src: '/images/photo-07.jpg', caption: 'Lantern hour' },
    { id: 8, src: '/images/photo-08.jpg', caption: 'Hard light' },
    { id: 9, src: '/images/photo-09.jpg', caption: 'Edge of water' },
  ],
};

function readAlbum(): Album {
  if (typeof window === 'undefined') return starterAlbum;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return starterAlbum;
    const parsed = JSON.parse(stored) as Album;
    if (!parsed?.title || !Array.isArray(parsed.photos) || parsed.photos.length !== 9) return starterAlbum;
    return parsed;
  } catch {
    return starterAlbum;
  }
}

function cloneStarters(): Album {
  return { title: starterAlbum.title, photos: starterAlbum.photos.map((photo) => ({ ...photo })) };
}

function Home() {
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { data: serverAlbum } = useGetAlbum();
  const syncAlbum = useSyncAlbum();
  const queryClient = useQueryClient();

  const [album, setAlbum] = useState<Album>(readAlbum);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [toast, setToast] = useState('');
  const [syncStatus, setSyncStatus] = useState('');

  const initializedForId = useRef<string | null>(null);
  const hadUnsyncedLocal = useRef(window.localStorage.getItem(STORAGE_DIRTY_KEY) === 'true');
  const lastSaved = useRef<Album>({ title: '', photos: [] });
  const mutateFnRef = useRef(syncAlbum.mutate);
  mutateFnRef.current = syncAlbum.mutate;

  useEffect(() => {
    if (serverAlbum && initializedForId.current !== 'loaded') {
      initializedForId.current = 'loaded';
      lastSaved.current = { title: serverAlbum.title, photos: serverAlbum.photos };
      if (!hadUnsyncedLocal.current) {
        setAlbum({ title: serverAlbum.title, photos: serverAlbum.photos });
      }
    }
  }, [serverAlbum]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(album));
    if (
      initializedForId.current === 'loaded' &&
      JSON.stringify(album) !== JSON.stringify(lastSaved.current)
    ) {
      window.localStorage.setItem(STORAGE_DIRTY_KEY, 'true');
    }
  }, [album]);

  const [debouncedAlbum, setDebouncedAlbum] = useState(album);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAlbum(album);
    }, 1000);
    return () => clearTimeout(timer);
  }, [album]);

  const canEdit = serverAlbum?.canEdit ?? false;
  const ownerClaimed = serverAlbum?.ownerClaimed ?? true;
  const showClaimMessage = serverAlbum && !ownerClaimed;

  useEffect(() => {
    if (initializedForId.current !== 'loaded') return;

    const hasChanged = JSON.stringify(debouncedAlbum) !== JSON.stringify(lastSaved.current);
    if (!canEdit) {
      if (hasChanged) {
        setSyncStatus(isSignedIn ? 'Saved locally — owner sign-in required to sync' : 'Saved locally — sign in to sync');
      }
      return;
    }

    if (hasChanged) {
      setSyncStatus('Saving...');
      mutateFnRef.current({ data: debouncedAlbum }, {
        onSuccess: (data) => {
          setSyncStatus('Saved');
          const savedAlbum = { title: data.title, photos: data.photos };
          lastSaved.current = savedAlbum;
          setAlbum(savedAlbum);
          window.localStorage.removeItem(STORAGE_DIRTY_KEY);
          queryClient.setQueryData(getGetAlbumQueryKey(), data);
          setTimeout(() => setSyncStatus(''), 2000);
        },
        onError: () => {
          setSyncStatus('Sync failed - saved locally');
        }
      });
    }
  }, [debouncedAlbum, canEdit, isSignedIn, queryClient]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const notify = (message: string) => setToast(message);

  const updateCaption = (id: number, caption: string) => {
    setAlbum((current) => ({
      ...current,
      photos: current.photos.map((photo) => (photo.id === id ? { ...photo, caption } : photo)),
    }));
  };

  const updateSource = (id: number, src: string) => {
    setAlbum((current) => ({
      ...current,
      photos: current.photos.map((photo) => (photo.id === id ? { ...photo, src } : photo)),
    }));
  };

  const resetAlbum = () => {
    if (!window.confirm('Reset the album to the nine starter photos? Your edits will be removed.')) return;
    setAlbum(cloneStarters());
    setIsEditing(false);
    setEditingPhoto(null);
    notify('Starter album restored');
  };

  const effectiveIsEditing = isEditing;

  return (
    <main className="album-shell">
      <header className="page-wrap masthead">
        <div className="masthead-top">
          <div className="brand-lockup" aria-label="WD Photo album">
            <span className="brand-mark" aria-hidden="true">W·D</span>
            <span className="brand-name">Photo archive</span>
          </div>
          <div className="top-actions">
            {showClaimMessage && (
              <span className="status-note" style={{ color: 'var(--accent)' }}>
                {isSignedIn ? 'Claim this album by saving changes' : 'First to sign in and save becomes owner'}
              </span>
            )}
            {!showClaimMessage && (
              <span className="status-note">
                {syncStatus || (effectiveIsEditing ? 'Editing on' : 'A small collection')}
              </span>
            )}

            <button
              type="button"
              className="outline-btn"
              onClick={() => setIsEditing((value) => !value)}
              data-testid="button-toggle-edit"
              aria-pressed={effectiveIsEditing}
            >
              {effectiveIsEditing ? 'Done editing' : 'Edit album'}
            </button>
            {effectiveIsEditing && (
              <button type="button" className="accent-btn" onClick={resetAlbum} data-testid="button-reset-album">
                <RotateCcw size={13} strokeWidth={1.8} aria-hidden="true" /> Reset
              </button>
            )}

            {!isSignedIn ? (
              <Link href="/sign-in" className="outline-btn" data-testid="link-sign-in">Owner sign in</Link>
            ) : (
              <button type="button" className="outline-btn" onClick={() => signOut({ redirectUrl: basePath || "/" })} data-testid="button-sign-out">
                Sign out
              </button>
            )}
          </div>
        </div>

        <div className="intro">
          <div>
            <p className="eyebrow">Nine frames / one point of view</p>
            {effectiveIsEditing ? (
              <input
                className="title-input"
                value={album.title}
                onChange={(event) => setAlbum((current) => ({ ...current, title: event.target.value }))}
                aria-label="Album title"
                data-testid="input-album-title"
                maxLength={48}
              />
            ) : (
              <h1 className="title-text" data-testid="text-album-title">{album.title}</h1>
            )}
            {effectiveIsEditing && <p className="edit-hint">Title changes save automatically</p>}
          </div>
          <p className="intro-copy">
            An evolving set of images, kept deliberately small. Change the pictures,
            leave a note, and make the sequence feel like yours.
          </p>
        </div>
      </header>

      <section className="page-wrap" aria-labelledby="collection-heading">
        <div className="gallery-grid">
          {album.photos.map((photo, index) => (
            <article className="photo-card" key={photo.id} style={{ '--i': index } as CSSProperties} data-testid={`card-photo-${photo.id}`}>
              <div
                className="photo-frame"
                role="button"
                tabIndex={0}
                onClick={() => setLightboxPhoto(photo)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') setLightboxPhoto(photo);
                }}
                aria-label={`View ${photo.caption}`}
                data-testid={`button-view-photo-${photo.id}`}
              >
                <img src={photo.src} alt={photo.caption} referrerPolicy="no-referrer" data-testid={`img-photo-${photo.id}`} />
                <div className="photo-hover">
                  <button
                    type="button"
                    className="edit-photo-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditingPhoto(photo);
                    }}
                    aria-label={`Edit ${photo.caption}`}
                    data-testid={`button-edit-photo-${photo.id}`}
                  >
                    <Pencil size={15} strokeWidth={1.7} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="page-wrap footer">
        <span>WD Photo / Personal archive</span>
        <span className="footer-accent">{canEdit ? 'Changes sync automatically' : 'Changes save on this device'}</span>
      </footer>

      {editingPhoto && (
        <PhotoEditor
          photo={editingPhoto}
          onClose={() => setEditingPhoto(null)}
          onSave={(next) => {
            updateCaption(editingPhoto.id, next.caption);
            updateSource(editingPhoto.id, next.src);
            setEditingPhoto(null);
            notify('Frame updated');
          }}
        />
      )}

      {lightboxPhoto && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={lightboxPhoto.caption}>
          <button type="button" className="lightbox-close" onClick={() => setLightboxPhoto(null)} data-testid="button-close-lightbox" aria-label="Close preview">
            <X size={25} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <img src={lightboxPhoto.src} alt={lightboxPhoto.caption} referrerPolicy="no-referrer" data-testid="img-lightbox" />
        </div>
      )}

      {toast && <div className="toast-note" role="status" data-testid="status-toast">{toast}</div>}
    </main>
  );
}

function PhotoEditor({
  photo,
  onClose,
  onSave,
}: {
  photo: Photo;
  onClose: () => void;
  onSave: (next: { caption: string; src: string }) => void;
}) {
  const [caption, setCaption] = useState(photo.caption);
  const [src, setSrc] = useState(photo.src);
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [urlError, setUrlError] = useState('');

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSrc(reader.result);
        setFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const applyImageUrl = (onReady?: (nextSrc: string) => void) => {
    const nextSrc = url.trim();
    if (!nextSrc) {
      setUrlError('Paste a direct image URL first.');
      return;
    }

    try {
      const parsed = new URL(nextSrc);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        throw new Error('Unsupported protocol');
      }
    } catch {
      setUrlError('Enter a valid http or https image URL.');
      return;
    }

    setUrlError('');
    const image = new Image();
    image.referrerPolicy = 'no-referrer';
    image.onload = () => {
      setSrc(nextSrc);
      onReady?.(nextSrc);
    };
    image.onerror = () => {
      setUrlError('This link did not load as an image. Try a direct JPG, PNG, or WebP URL.');
    };
    image.src = nextSrc;
  };

  return (
    <>
      <div className="backdrop" onClick={onClose} data-testid="button-close-editor-backdrop" />
      <aside className="editor-panel" role="dialog" aria-modal="true" aria-labelledby="editor-heading">
        <div className="panel-top">
          <div>
            <p className="panel-kicker">Frame {String(photo.id).padStart(2, '0')}</p>
            <h2 id="editor-heading" className="panel-title">Make it yours</h2>
          </div>
          <button type="button" className="close-btn" onClick={onClose} data-testid="button-close-editor" aria-label="Close editor">
            <X size={25} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <div className="editor-preview">
          <img src={src} alt="" referrerPolicy="no-referrer" />
        </div>

        <label className="field-label" htmlFor="photo-caption">Caption</label>
        <input
          id="photo-caption"
          className="field-input"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Give this frame a name"
          data-testid="input-photo-caption"
          maxLength={80}
        />

        <div className="source-section">
          <p className="source-label">Replace the image</p>
          <label className="file-drop" htmlFor="photo-file">
            <span>{fileName || 'Choose an image from this device'}</span>
            <span className="file-cta"><Upload size={12} aria-hidden="true" /> Browse</span>
            <input
              id="photo-file"
              type="file"
              accept="image/*"
              onChange={(event) => handleFile(event.target.files?.[0])}
              data-testid="input-photo-file"
            />
          </label>
          <div className="url-row">
            <input
              className="field-input"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setUrlError('');
              }}
              placeholder="Paste an image URL"
              aria-label="Image URL"
              data-testid="input-photo-url"
            />
            <button
              type="button"
              className="url-apply"
              onClick={() => applyImageUrl()}
              data-testid="button-apply-photo-url"
            >
              Use URL
            </button>
          </div>
          {urlError && <p className="field-error" role="alert">{urlError}</p>}
        </div>

        <div className="panel-actions">
          <button type="button" className="outline-btn" onClick={onClose} data-testid="button-cancel-photo">Cancel</button>
          <button
            type="button"
            className="accent-btn save-btn"
            onClick={() => {
              if (url.trim()) {
                applyImageUrl((nextSrc) => onSave({ caption: caption.trim(), src: nextSrc }));
                return;
              }
              onSave({ caption: caption.trim(), src });
            }}
            data-testid="button-save-photo"
          >
            <ImagePlus size={14} strokeWidth={1.8} aria-hidden="true" /> Save frame
          </button>
        </div>
      </aside>
    </>
  );
}

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) {
  console.warn('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: dark,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
  },
  variables: {
    colorPrimary: "hsl(72 100% 64%)",
    colorForeground: "#edeade",
    colorMutedForeground: "#85847b",
    colorDanger: "hsl(0 74% 60%)",
    colorBackground: "#111111",
    colorInput: "#191919",
    colorInputForeground: "#edeade",
    colorNeutral: "#33332f",
    fontFamily: "var(--app-font-sans)",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#111111] border border-[#33332f] rounded-[14px] w-[440px] max-w-full overflow-hidden shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#edeade] font-medium text-2xl tracking-tight",
    headerSubtitle: "text-[#85847b]",
    socialButtonsBlockButtonText: "text-[#edeade] font-medium tracking-wide",
    formFieldLabel: "text-[#929188] uppercase tracking-widest text-[10px] font-mono",
    footerActionLink: "text-[#d7ff62] hover:text-[#e6ff91]",
    footerActionText: "text-[#85847b]",
    dividerText: "text-[#85847b]",
    identityPreviewEditButton: "text-[#d7ff62]",
    formFieldSuccessText: "text-[#d7ff62]",
    alertText: "text-[#edeade]",
    logoBox: "flex justify-center mb-4 hidden",
    socialButtonsBlockButton: "border border-[#33332f] bg-[#191919] hover:bg-[#20201f] text-[#edeade]",
    formButtonPrimary: "bg-[#d7ff62] text-[#080808] hover:bg-[#e6ff91] font-medium transition-all",
    formFieldInput: "bg-[#191919] border border-[#33332f] text-[#edeade] rounded-md focus:border-[#d7ff62] focus:ring-0",
    footerAction: "bg-transparent",
    dividerLine: "bg-[#33332f]",
    alert: "bg-[#191919] border border-[#33332f]",
    otpCodeFieldInput: "bg-[#191919] border border-[#33332f] text-[#edeade]",
    formFieldRow: "mb-4",
    main: "gap-6",
  },
};

function SignInPage() {
  return (
    <main className="album-shell flex items-center justify-center px-4">
      <div className="relative z-10 w-full flex justify-center">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </main>
  );
}

function SignUpPage() {
  return (
    <main className="album-shell flex items-center justify-center px-4">
      <div className="relative z-10 w-full flex justify-center">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      </div>
    </main>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const queryClient = new QueryClient();

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "WD Photo",
            subtitle: "Sign in to manage your archive",
          },
        },
        signUp: {
          start: {
            title: "WD Photo",
            subtitle: "Create your owner account",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <RoutedErrorBoundary>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/sign-in/*?" component={SignInPage} />
              <Route path="/sign-up/*?" component={SignUpPage} />
              <Route component={NotFound} />
            </Switch>
          </RoutedErrorBoundary>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
