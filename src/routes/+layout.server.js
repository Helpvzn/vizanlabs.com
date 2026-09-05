import {
  getSiteSettings,
  getAnnouncement,
  getHeaderSettings,
  getFooterSettings,
  getHomepageSettings,
  getSeoSettings,
  getLegalSettings
} from '$lib/utils/content.js';

export async function load() {
  const [site, announcement, header, footer, homepage, seo, legal] = await Promise.all([
    getSiteSettings(),
    getAnnouncement(),
    getHeaderSettings(),
    getFooterSettings(),
    getHomepageSettings(),
    getSeoSettings(),
    getLegalSettings()
  ]);

  return { site, announcement, header, footer, homepage, seo, legal };
}
