// Gravatar avatar resolution using SHA-256 (Web Crypto API — no library needed).
// Uses d=404 so missing Gravatars return a 404 and the Avatar component falls through.

const cache = new Map<string, string>();

export async function getGravatarUrl(email: string, size = 200): Promise<string> {
  const key = email.toLowerCase().trim();
  if (cache.has(key)) return cache.get(key)!;

  const encoded = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const url = `https://gravatar.com/avatar/${hashHex}?s=${size}&d=404`;
  cache.set(key, url);
  return url;
}
