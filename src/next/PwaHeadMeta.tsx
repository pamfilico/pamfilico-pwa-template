export type PwaHeadMetaProps = {
  themeColor?: string;
  appTitle?: string;
  statusBarStyle?: "default" | "black" | "black-translucent";
};

/**
 * Client-safe meta tags for PWA installability.
 * Prefer Next.js metadata API in layout when possible; use this for quick integration.
 */
export default function PwaHeadMeta({
  themeColor = "#ff7800",
  appTitle,
  statusBarStyle = "default",
}: PwaHeadMetaProps) {
  return (
    <>
      <meta name="theme-color" content={themeColor} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content={statusBarStyle} />
      {appTitle ? <meta name="apple-mobile-web-app-title" content={appTitle} /> : null}
    </>
  );
}
