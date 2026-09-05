/**
 * Edge-compatible YAML frontmatter parser (v4 - full multi-key object support in lists)
 * Handles: strings, booleans, numbers, simple lists, and multi-key object lists
 */

function parseFrontmatter(rawFile) {
  const raw = rawFile.replace(/\r\n/g, '\n'); // Normalize line endings
  let data = {};
  let body = '';

  const match = raw.match(/^---\n([\s\S]*?)\n---(\n|$)([\s\S]*)/);
  if (!match) return { data, body: raw };

  const yaml = match[1];
  body = (match[3] || '').trim();
  data = parseYaml(yaml);

  return { data, body };
}

function parseYaml(yaml) {
  const lines = yaml.split('\n');
  const result = {};
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) { i++; continue; }

    // Top-level key
    const keyMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)/);
    if (keyMatch) {
      const key = keyMatch[1];
      const rest = keyMatch[2].trim();

      if (rest === '') {
        // Could be a list or nested object - look ahead
        i++;
        const collected = [];
        const nestedLines = [];
        while (i < lines.length) {
          const nextLine = lines[i];
          const nextTrimmed = nextLine.trim();
          if (!nextTrimmed) { i++; continue; }
          // If indented less or equal to 0, we're back to top level
          const indent = nextLine.search(/\S/);
          if (indent === 0) break;
          // List item
          if (nextTrimmed.startsWith('- ')) {
            const item = nextTrimmed.slice(2).trim();
            // Check if it has a colon (key: value) — it's a multi-key object start
            if (item.includes(': ') || item.match(/^[a-zA-Z_][a-zA-Z0-9_]*:/)) {
              // Start of an object in list
              const obj = {};
              // Parse first key from the - line
              const firstKeyMatch = item.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)/);
              if (firstKeyMatch) obj[firstKeyMatch[1]] = parseScalar(firstKeyMatch[2]);
              i++;
              // Keep parsing subsequent indented lines as object keys
              while (i < lines.length) {
                const objLine = lines[i];
                const objTrimmed = objLine.trim();
                if (!objTrimmed) { i++; continue; }
                const objIndent = objLine.search(/\S/);
                if (objTrimmed.startsWith('- ') || objIndent <= 0) break;
                const objKeyMatch = objTrimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)/);
                if (objKeyMatch) obj[objKeyMatch[1]] = parseScalar(objKeyMatch[2]);
                i++;
              }
              collected.push(obj);
            } else {
              // Simple string list item
              collected.push(parseScalar(item));
              i++;
            }
          } else {
            i++;
          }
        }
        result[key] = collected.length > 0 ? collected : '';
      } else {
        result[key] = parseScalar(rest);
        i++;
      }
    } else {
      i++;
    }
  }
  return result;
}

function parseScalar(val) {
  const v = (val || '').trim();
  if (!v || v === "''") return '';
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
  if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
  if (v !== '' && !isNaN(v)) return Number(v);
  return v;
}

// Glob imports — relative paths required by Vite
const productFiles  = import.meta.glob('../../../content/products/*.md',  { query: '?raw', import: 'default', eager: true });
const blogFiles     = import.meta.glob('../../../content/blog/*.md',      { query: '?raw', import: 'default', eager: true });
const settingsFiles = import.meta.glob('../../../content/settings/*.md',  { query: '?raw', import: 'default', eager: true });

function parseRaw(raw, path) {
  try {
    const { data, body } = parseFrontmatter(raw);
    const slug = data.slug || path.split('/').pop().replace('.md', '');
    return { ...data, slug, body };
  } catch (e) {
    console.error('Parse error for', path, e);
    return null;
  }
}

function getSetting(filename) {
  const entries = Object.entries(settingsFiles);
  const match = entries.find(([p]) => p.endsWith(`/settings/${filename}`));
  if (!match) return {};
  const { data } = parseFrontmatter(match[1]);
  return data;
}

/* =========================================
   PRODUCTS
   ========================================= */
export async function getProducts({ category, featured, limit, slug } = {}) {
  try {
    let products = Object.entries(productFiles)
      .map(([path, raw]) => parseRaw(raw, path))
      .filter(Boolean)
      .filter(p => p.published !== false);

    if (slug)     return products.find(p => p.slug === slug) ?? null;
    if (category) products = products.filter(p => p.category === category);
    if (featured) products = products.filter(p => p.featured === true);

    products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (limit) products = products.slice(0, limit);
    return products;
  } catch (e) {
    return slug ? null : [];
  }
}

/* =========================================
   BLOG POSTS
   ========================================= */
export async function getPosts({ limit, slug, tag } = {}) {
  try {
    let posts = Object.entries(blogFiles)
      .map(([path, raw]) => parseRaw(raw, path))
      .filter(Boolean)
      .filter(p => p.published !== false);

    if (slug) return posts.find(p => p.slug === slug) ?? null;
    if (tag)  posts = posts.filter(p => Array.isArray(p.tags) && p.tags.includes(tag));

    posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    if (limit) posts = posts.slice(0, limit);
    return posts;
  } catch (e) {
    return slug ? null : [];
  }
}

/* =========================================
   SETTINGS
   ========================================= */
export async function getSiteSettings()     { return getSetting('site.md'); }
export async function getAnnouncement()     { return getSetting('announcement.md'); }
export async function getHomepageSettings() { return getSetting('homepage.md'); }
export async function getHeaderSettings()   { return getSetting('header.md'); }
export async function getFooterSettings()   { return getSetting('footer.md'); }
export async function getSeoSettings()      { return getSetting('seo.md'); }
export async function getLegalSettings()    { return getSetting('legal.md'); }
