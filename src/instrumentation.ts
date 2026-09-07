/**
 * Startup hook. The actual work lives in a Node-only module that is imported
 * lazily, so the Edge bundle never has to resolve Node built-ins.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.OSSZ_SKIP_BOOTSTRAP === "1") return;
  const { bootstrap } = await import("@/lib/bootstrap");

  // Fire-and-forget. `register()` is awaited by Next before the server begins
  // serving, so awaiting a seed run here would delay startup — and a slow or
  // unreachable database would hold the whole site down. Recovery is a
  // background concern; serving pages is not.
  void bootstrap().catch(() => {});
}
