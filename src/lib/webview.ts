/**
 * Detects whether the app is running inside an embedded Android WebView.
 * Google blocks OAuth inside embedded WebViews (disallowed_useragent),
 * so we surface this to callers so they can route Google sign-in to the
 * system browser / Chrome Custom Tabs instead.
 */
export function isAndroidWebView(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  if (!isAndroid) return false;

  // The "; wv)" token is the canonical Android WebView marker.
  // We also treat Android Chrome without the "Chrome/" Safari-style marker
  // (i.e. bare "Version/x.x") as a WebView.
  const hasWvToken = /;\s*wv\)/i.test(ua);
  const isChromeShell = /Chrome\/[.\d]+ Mobile/i.test(ua) && /Safari\//i.test(ua);
  const looksLikeWrapper = /(FB_IAB|FBAN|Instagram|Line|MicroMessenger|Twitter|GSA)/i.test(ua);

  return hasWvToken || looksLikeWrapper || (isAndroid && !isChromeShell);
}

/**
 * Opens a URL in the system browser / Chrome Custom Tab instead of the
 * current WebView. Falls back to `window.open` when no native bridge exists.
 */
export function openInSystemBrowser(url: string): boolean {
  try {
    // Native wrapper hooks (Capacitor / custom Android bridge)
    const w = window as unknown as {
      AndroidBridge?: { openExternal?: (u: string) => void };
      Capacitor?: { Plugins?: { Browser?: { open: (opts: { url: string }) => void } } };
    };
    if (w.AndroidBridge?.openExternal) {
      w.AndroidBridge.openExternal(url);
      return true;
    }
    if (w.Capacitor?.Plugins?.Browser) {
      w.Capacitor.Plugins.Browser.open({ url });
      return true;
    }
    // Android intent fallback — Chrome will handle it in a Custom Tab.
    const intent =
      url.replace(/^https?:\/\//, "intent://") +
      "#Intent;scheme=https;package=com.android.chrome;end";
    window.location.href = intent;
    return true;
  } catch {
    try {
      window.open(url, "_blank", "noopener,noreferrer");
      return true;
    } catch {
      return false;
    }
  }
}
