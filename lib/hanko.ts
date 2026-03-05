import { tenant } from "@teamhanko/passkeys-next-auth-provider";

const HANKO_ERROR =
  "Please set HANKO_API_KEY and NEXT_PUBLIC_HANKO_TENANT_ID in your .env.local file.";

/** No-op tenant used when Hanko env vars are missing (e.g. at build time). Throws only when methods are invoked. */
function createNoOpTenant(): ReturnType<typeof tenant> {
  const throwErr = () => {
    throw new Error(HANKO_ERROR);
  };
  return new Proxy({} as ReturnType<typeof tenant>, {
    get(_, prop) {
      if (prop === "user" || prop === "registration" || prop === "credential") {
        return new Proxy(throwErr, {
          get() {
            return throwErr;
          },
        });
      }
      return throwErr;
    },
  });
}

function getHanko() {
  if (!process.env.HANKO_API_KEY || !process.env.NEXT_PUBLIC_HANKO_TENANT_ID) {
    return createNoOpTenant();
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
