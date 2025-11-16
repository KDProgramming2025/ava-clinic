// Assign unique, meaningful ids to elements that lack an id, for SEO/analytics/anchors
// Heuristics: prefer aria-label, alt, name, placeholder, href/file names, and visible text snippets
// Ensures page-wide uniqueness by appending numeric suffix when needed

function slugify(value: string): string {
  if (!value) return '';
  // Keep unicode letters/digits, replace whitespace with '-', strip punctuation
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\u200C\u200F\u202A-\u202E]/g, '') // remove bidi/zwnj control chars
    .replace(/[_\s]+/g, '-')
    .replace(/[^\p{L}\p{N}\-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function textSnippet(el: Element, max = 40): string {
  const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > max ? text.slice(0, max) : text;
}

function hrefPart(el: HTMLAnchorElement | HTMLLinkElement | HTMLImageElement): string {
  const href = (el as any).href || (el as HTMLImageElement).src || '';
  try {
    const url = new URL(href, window.location.origin);
    const last = url.pathname.split('/').filter(Boolean).pop();
    return last || url.hostname || '';
  } catch {
    const m = href.split('/').filter(Boolean).pop();
    return m || '';
  }
}

function buildCandidateId(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const parts: string[] = [];
  parts.push(tag);

  const role = el.getAttribute('role') || '';
  const aria = (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || '').toString();
  const name = (el as any).name || el.getAttribute('name') || '';
  const placeholder = (el as any).placeholder || el.getAttribute('placeholder') || '';
  const alt = (el as any).alt || el.getAttribute('alt') || '';
  const type = (el as any).type || el.getAttribute('type') || '';

  if (role) parts.push(role);
  if (type) parts.push(type);
  if (aria) parts.push(aria);
  if (name) parts.push(name);
  if (placeholder) parts.push(placeholder);
  if (alt) parts.push(alt);

  if (tag === 'a' || tag === 'link' || tag === 'img') {
    const hp = hrefPart(el as any);
    if (hp) parts.push(hp);
  }

  // last resort, use visible text
  if (parts.length <= 2) {
    const snip = textSnippet(el);
    if (snip) parts.push(snip);
  }

  const candidate = slugify(parts.filter(Boolean).join('-'));
  if (candidate) return candidate;

  // Fallback: structural path e.g., div-2-span-1
  const idx = (e: Element) => (e.parentElement ? Array.from(e.parentElement.children).indexOf(e) + 1 : 1);
  const segs: string[] = [];
  let cur: Element | null = el;
  let depth = 0;
  while (cur && depth < 5) { // limit depth to keep ids short
    segs.unshift(`${cur.tagName.toLowerCase()}-${idx(cur)}`);
    cur = cur.parentElement;
    depth++;
  }
  return slugify(segs.join('-')) || `${tag}-${Math.random().toString(36).slice(2, 8)}`;
}

const defaultSkipTags = new Set([
  'html','head','body','script','style','meta','title','link','noscript','source','track','path','defs','g','use','br'
]);

export function assignUniqueIds(root: ParentNode = document.body, options?: { skipTags?: Set<string> }) {
  if (!root) return;
  const skipTags = options?.skipTags || defaultSkipTags;

  const existing = new Set<string>();
  // seed existing ids
  document.querySelectorAll('[id]').forEach(n => existing.add((n as HTMLElement).id));

  const ensureUnique = (base: string): string => {
    if (!existing.has(base)) { existing.add(base); return base; }
    let i = 2;
    while (existing.has(`${base}-${i}`)) i++;
    const id = `${base}-${i}`;
    existing.add(id);
    return id;
  };

  const process = (el: Element) => {
    if (el.hasAttribute('id')) return;
    if (el.hasAttribute('data-id-ignore')) return;
    const tag = el.tagName.toLowerCase();
    if (skipTags.has(tag)) return;
    const base = buildCandidateId(el);
    const unique = ensureUnique(base);
    (el as HTMLElement).id = unique;
  };

  const treeWalker = document.createTreeWalker(root as any, NodeFilter.SHOW_ELEMENT);
  let node = treeWalker.currentNode as Element;
  if (node && node.nodeType === 1) process(node);
  while (treeWalker.nextNode()) {
    node = treeWalker.currentNode as Element;
    if (node) process(node);
  }
}

export function observeAndAssignIds() {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach(n => {
        if (n.nodeType === 1) assignUniqueIds(n as ParentNode);
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}
