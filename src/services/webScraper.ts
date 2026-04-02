import axios from "axios";
import * as cheerio from "cheerio";

const normalizeUrl = (rawUrl) => {
  try {
    const parsed = new URL(rawUrl);
    parsed.hash = "";

    if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    return parsed.toString();
  } catch {
    return null;
  }
};

const shouldKeepUrl = (candidate, originUrl) => {
  try {
    const candidateUrl = new URL(candidate);
    const baseUrl = new URL(originUrl);

    if (candidateUrl.origin !== baseUrl.origin) {
      return false;
    }

    const blockedExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".svg",
      ".webp",
      ".ico",
      ".pdf",
      ".zip",
      ".tar",
      ".gz",
      ".ts",
      ".css",
      ".map",
      ".xml",
      ".json",
    ];

    if (
      blockedExtensions.some((ext) =>
        candidateUrl.pathname.toLowerCase().endsWith(ext),
      )
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

const parseSitemapUrls = (xml) => {
  if (!xml || typeof xml !== "string") {
    return [];
  }

  const locRegex = /<loc>(.*?)<\/loc>/gi;
  const urls = [];
  let match = locRegex.exec(xml);

  while (match) {
    urls.push(match[1].trim());
    match = locRegex.exec(xml);
  }

  return urls;
};

const discoverFromSitemap = async (baseUrl, maxPages) => {
  const base = new URL(baseUrl);
  const sitemapCandidates = [
    `${base.origin}/sitemap.xml`,
    `${base.origin}/sitemap_index.xml`,
  ];

  for (const sitemapUrl of sitemapCandidates) {
    try {
      const response = await axios.get(sitemapUrl, { timeout: 15000 });
      const urls = parseSitemapUrls(response.data)
        .map(normalizeUrl)
        .filter((url) => Boolean(url) && shouldKeepUrl(url, baseUrl));

      if (urls.length > 0) {
        return urls.slice(0, maxPages);
      }
    } catch {
      continue;
    }
  }

  return [];
};

const discoverByCrawling = async (baseUrl, maxPages) => {
  const visited = new Set();
  const queue = [normalizeUrl(baseUrl)].filter(Boolean);
  const discovered = [];

  while (queue.length > 0 && discovered.length < maxPages) {
    const current = queue.shift();

    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);

    try {
      const response = await axios.get(current, { timeout: 20000 });
      const $ = cheerio.load(response.data);

      discovered.push(current);

      $("a[href]").each((_, element) => {
        const href = $(element).attr("href");
        if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) {
          return;
        }

        const absolute = normalizeUrl(new URL(href, current).toString());

        if (
          absolute &&
          !visited.has(absolute) &&
          !queue.includes(absolute) &&
          shouldKeepUrl(absolute, baseUrl)
        ) {
          queue.push(absolute);
        }
      });
    } catch {
      return;
    }
  }

  return discovered;
};

export const discoverDocumentationUrls = async ({baseUrl, maxPages}) => {
  const sitemapUrls = await discoverFromSitemap(baseUrl, maxPages);
  console.log(
    `[url.documentation] sitemap returned ${sitemapUrls.length} urls`,
  );
  if (sitemapUrls.length > 0) {
    return sitemapUrls;
  }

  return discoverByCrawling(baseUrl, maxPages);
};

export const scraper = {
  fromSiteMap: discoverFromSitemap,
  byCrawling: discoverByCrawling,
  documentation: discoverDocumentationUrls,
};
