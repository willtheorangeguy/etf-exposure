import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export function isPublicAddress(address: string): boolean {
  if (isIP(address) === 6) return /^[23][0-9a-f]{3}:/i.test(address);
  if (isIP(address) !== 4) return false;
  const [a, b] = address.split(".").map(Number);
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || a === 169 && b === 254 ||
    a === 172 && b >= 16 && b <= 31 || a === 192 && (b === 168 || b === 0) ||
    a === 100 && b >= 64 && b <= 127 || a === 198 && (b === 18 || b === 19));
}

export async function assertPublicUrl(value: string) {
  const url = new URL(value);
  if (!/^https?:$/.test(url.protocol) || url.username || url.password) throw new Error("Use a public HTTP or HTTPS URL without credentials.");
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  // Explicit opt-in for private issuer mirrors and isolated integration tests.
  if ((process.env.TRUSTED_SOURCE_HOSTS ?? "").split(",").includes(hostname)) return;
  const addresses = await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some((entry) => !isPublicAddress(entry.address))) throw new Error("Sources must resolve to public internet addresses.");
}
