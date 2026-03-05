import { tenant } from "@teamhanko/passkeys-next-auth-provider";

function getHanko() {
  if (!process.env.HANKO_API_KEY || !process.env.NEXT_PUBLIC_HANKO_TENANT_ID) {
    throw new Error(
      "Please set HANKO_API_KEY and NEXT_PUBLIC_HANKO_TENANT_ID in your .env.local file.",
    );
  }
  return tenant({
    apiKey: process.env.HANKO_API_KEY,
    tenantId: process.env.NEXT_PUBLIC_HANKO_TENANT_ID,
  });
}

let _hanko: ReturnType<typeof tenant> | null = null;

const hanko = new Proxy({} as ReturnType<typeof tenant>, {
  get(_, prop) {
    if (!_hanko) _hanko = getHanko();
    const v = (_hanko as Record<string, unknown>)[prop as string];
    if (typeof v === "function") return (v as (...args: unknown[]) => unknown).bind(_hanko);
    return v;
  },
});

export default hanko;
