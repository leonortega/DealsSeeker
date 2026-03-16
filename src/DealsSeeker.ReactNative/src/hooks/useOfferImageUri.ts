import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import { resolveOfferImageUri } from '../utils/images';

const imageCacheDirectory = Platform.OS === 'web' ? null : new Directory(Paths.cache, 'offer-images');
const pendingWrites = new Map<string, Promise<string | null>>();

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
  return Platform.OS !== 'web' && /^data:image\/[a-z0-9.+-]+;base64,/iu.test(uri);
}

function getCachedImageUri(dataUri: string) {
  const existing = pendingWrites.get(dataUri);
  if (existing) {
    return existing;
  }

  const pending = materializeDataUriImage(dataUri);
  pendingWrites.set(dataUri, pending);
  void pending.finally(() => {
    if (pendingWrites.get(dataUri) === pending) {
      pendingWrites.delete(dataUri);
    }
  });

  return pending;
}

async function materializeDataUriImage(dataUri: string) {
  if (!imageCacheDirectory) {
    return null;
  }

  const parsed = parseBase64ImageDataUri(dataUri);
  if (!parsed) {
    return null;
  }

  ensureImageCacheDirectory();

  const file = new File(imageCacheDirectory, `${hashString(dataUri)}.${mimeTypeToExtension(parsed.mimeType)}`);
  if (!file.exists) {
    file.create({ intermediates: true, overwrite: true });
    file.write(parsed.base64, { encoding: 'base64' });
  }

  return file.uri;
}

function ensureImageCacheDirectory() {
  if (!imageCacheDirectory) {
    return;
  }

  if (!imageCacheDirectory.exists) {
    imageCacheDirectory.create({ idempotent: true, intermediates: true });
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
