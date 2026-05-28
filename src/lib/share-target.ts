export type ParsedSharePayload = {
  title: string;
  text: string;
  url: string;
  sourceUrl: string;
  files: File[];
};

const URL_REGEX = /https?:\/\/[^\s]+/i;

export function resolveCaptureSourceUrl(input: {
  sourceUrl?: string;
  text?: string;
}): string {
  const direct = input.sourceUrl?.trim();
  if (direct) return direct;
  const text = input.text?.trim() ?? "";
  const match = text.match(URL_REGEX);
  return match?.[0] ?? "";
}

export async function parseShareTargetFormData(
  formData: FormData,
): Promise<ParsedSharePayload> {
  const title = formData.get("title")?.toString() ?? "";
  const text = formData.get("text")?.toString() ?? "";
  const rawUrl = formData.get("url")?.toString() ?? "";
  const sourceUrl = resolveCaptureSourceUrl({ sourceUrl: rawUrl, text });

  const files: File[] = [];
  for (const entry of formData.getAll("files")) {
    if (entry instanceof File && entry.size > 0) files.push(entry);
  }
  for (const entry of formData.getAll("media")) {
    if (entry instanceof File && entry.size > 0) files.push(entry);
  }

  return { title, text, url: rawUrl, sourceUrl, files };
}

export function buildShareTargetRedirectParams(payload: ParsedSharePayload): URLSearchParams {
  const params = new URLSearchParams();
  if (payload.sourceUrl) params.set("url", payload.sourceUrl);
  if (payload.title) params.set("title", payload.title);
  if (payload.text) params.set("text", payload.text);
  return params;
}
