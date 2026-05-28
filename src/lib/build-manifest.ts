export type ManifestIcon = {
  src: string;
  sizes: string;
  type: string;
  purpose?: "any" | "maskable" | "monochrome";
};

export type ManifestShortcut = {
  name: string;
  short_name?: string;
  url: string;
  icons?: ManifestIcon[];
};

export type ShareTargetConfig = {
  action: string;
  method?: "GET" | "POST";
  enctype?: "application/x-www-form-urlencoded" | "multipart/form-data";
  params: {
    title?: string;
    text?: string;
    url?: string;
    files?: Array<{ name: string; accept: string[] }>;
  };
};

export type WebAppManifestConfig = {
  id?: string;
  name: string;
  short_name: string;
  description: string;
  start_url?: string;
  scope?: string;
  display?: "standalone" | "fullscreen" | "minimal-ui" | "browser";
  orientation?: string;
  theme_color: string;
  background_color: string;
  lang?: string;
  categories?: string[];
  icons: ManifestIcon[];
  shortcuts?: ManifestShortcut[];
  share_target?: ShareTargetConfig;
};

export function buildManifest(config: WebAppManifestConfig): Record<string, unknown> {
  return {
    id: config.id ?? "/",
    name: config.name,
    short_name: config.short_name,
    description: config.description,
    start_url: config.start_url ?? "/",
    scope: config.scope ?? "/",
    display: config.display ?? "standalone",
    orientation: config.orientation ?? "portrait-primary",
    theme_color: config.theme_color,
    background_color: config.background_color,
    lang: config.lang ?? "en-US",
    categories: config.categories ?? ["productivity", "utilities"],
    icons: config.icons,
    ...(config.shortcuts?.length ? { shortcuts: config.shortcuts } : {}),
    ...(config.share_target ? { share_target: config.share_target } : {}),
  };
}

export function buildProjectFastStyleShareTarget(action = "/share-target"): ShareTargetConfig {
  return {
    action,
    method: "POST",
    enctype: "multipart/form-data",
    params: {
      title: "title",
      text: "text",
      url: "url",
      files: [
        {
          name: "media",
          accept: [
            "image/*",
            "video/*",
            "audio/*",
            "application/pdf",
            ".pdf",
            ".doc",
            ".docx",
            ".txt",
          ],
        },
      ],
    },
  };
}
