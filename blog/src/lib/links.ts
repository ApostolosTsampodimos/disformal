import type { CollectionEntry } from 'astro:content';
import { BLOG_URL } from '../../site.config.mjs';

type Post = CollectionEntry<'posts'>;

/** Post ids that a post's text links to (Markdown links and <a href>), in order of appearance. */
function linkedIds(post: Post, ids: Set<string>): string[] {
  const body = post.body ?? '';
  const targets = [
    ...[...body.matchAll(/\]\(\s*<?([^)\s>]+)/g)].map((m) => m[1]),
    ...[...body.matchAll(/href=["']([^"']+)["']/g)].map((m) => m[1]),
  ];
  const found: string[] = [];
  for (let t of targets) {
    if (t.startsWith(BLOG_URL)) t = t.slice(BLOG_URL.length);
    if (!t.startsWith('/')) continue; // external or relative: ignore
    const id = t.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');
    if (ids.has(id) && id !== post.id && !found.includes(id)) found.push(id);
  }
  return found;
}

/** For every post: which posts it links to, and which posts link to it. */
export function buildLinkGraph(posts: Post[]) {
  const byId = new Map(posts.map((p) => [p.id, p]));
  const ids = new Set(byId.keys());
  const linksTo = new Map<string, Post[]>();
  const linkedFrom = new Map<string, Post[]>();
  for (const p of posts) {
    linksTo.set(p.id, []);
    linkedFrom.set(p.id, []);
  }
  for (const p of posts) {
    for (const id of linkedIds(p, ids)) {
      linksTo.get(p.id)!.push(byId.get(id)!);
      linkedFrom.get(id)!.push(p);
    }
  }
  for (const list of linkedFrom.values()) {
    list.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  }
  return { linksTo, linkedFrom };
}
