import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_NAME } from '../../site.config.mjs';

export async function GET(context) {
  const posts = (await getCollection('posts')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  return rss({
    title: SITE_NAME,
    description: SITE_NAME,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.subtitle,
      pubDate: post.data.date,
      link: `/${post.id}/`,
    })),
  });
}
