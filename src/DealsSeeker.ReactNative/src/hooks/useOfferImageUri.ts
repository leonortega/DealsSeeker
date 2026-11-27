import { useEffect, useState } from 'react';
import { Directory, File, Paths } from 'expo-file-system';
import { resolveOfferImageUri } from '../utils/images';

export const IMAGE_CACHE_CAPACITY = 50;

const imageCacheDirectory = new Directory(Paths.cache, 'offer-images');
const pendingWrites = new Map<string, Promise<string | null>>();
// Oldest first. Bounded by IMAGE_CACHE_CAPACITY so a long scrolling session cannot grow forever.
const cacheOrder: string[] = [];

export function useOfferImageUri(imageUrl?: string | null) {
  const [resolvedUri, setResolvedUri] = useState<string | null>(() => {
    const candidate = resolveOfferImageUri(imageUrl);
    return candidate && !shouldCacheDataUri(candidate) ? candidate : null;
  });

  useEffect(() => {
    let active = true;
    const candidate = resolveOfferImageUri(imageUrl);

    if (!candidate) {
      setResolvedUri(null);
      return () => {
        active = false;
      };
    }

    if (!shouldCacheDataUri(candidate)) {
      setResolvedUri(candidate);
      return () => {
        active = false;
      };
    }

    setResolvedUri(null);

    void getCachedImageUri(candidate).then((cachedUri) => {
      if (active) {
        setResolvedUri(cachedUri ?? candidate);
      }
    });

    return () => {
      active = false;
    };
  }, [imageUrl]);

  return resolvedUri;
}

function shouldCacheDataUri(uri: string) {
  return /^data:image\/[a-z0-9.+-]+;base64,/iu.test(uri);
}

function getCachedImageUri(dataUri: string) {
  const cacheKey = hashString(dataUri);
  const existing = pendingWrites.get(cacheKey);
  if (existing) {
    return existing;
  }

  const pending = materializeDataUriImage(dataUri, cacheKey);
  pendingWrites.set(cacheKey, pending);
  void pending.finally(() => {
    if (pendingWrites.get(cacheKey) === pending) {
      pendingWrites.delete(cacheKey);
    }
  });

  return pending;
}

async function materializeDataUriImage(dataUri: string, cacheKey: string) {
  const parsed = parseBase64ImageDataUri(dataUri);
  if (!parsed || !imageCacheDirectory) {
    return null;
  }

  ensureImageCacheDirectory();

  const fileName = `${cacheKey}.${mimeTypeToExtension(parsed.mimeType)}`;
  const file = new File(imageCacheDirectory, fileName);
  if (!file.exists) {
    await writeImageFile(file, parsed.base64);
  }
  rememberCacheEntry(fileName);

  return file.uri;
}

async function writeImageFile(file: File, base64: string) {
  // expo-file-system's write() is asynchronous; writeSync() would block the interface thread.
  await file.write(base64, { encoding: 'base64' });
}

function ensureImageCacheDirectory() {
  if (imageCacheDirectory && !imageCacheDirectory.exists) {
    imageCacheDirectory.create({ idempotent: true, intermediates: true });
  }
}

function rememberCacheEntry(fileName: string) {
  const existingIndex = cacheOrder.indexOf(fileName);
  if (existingIndex >= 0) {
    cacheOrder.splice(existingIndex, 1);
  }
  cacheOrder.push(fileName);

  while (cacheOrder.length > IMAGE_CACHE_CAPACITY) {
    const evicted = cacheOrder.shift();
    if (!evicted) {
      return;
    }
    pendingWrites.delete(evicted);
    const file = new File(imageCacheDirectory, evicted);
    void file.delete();
  }
}

function parseBase64ImageDataUri(dataUri: string) {
  const match = dataUri.match(/^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/iu);
  if (!match) {
    return null;
  }

  return {
    mimeType: match[1].toLowerCase(),
    base64: match[2],
  };
}

function mimeTypeToExtension(mimeType: string) {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    case 'image/webp':
      return 'webp';
    case 'image/bmp':
      return 'bmp';
    case 'image/svg+xml':
      return 'svg';
    case 'image/jpg':
    case 'image/jpeg':
    default:
      return 'jpg';
  }
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}
