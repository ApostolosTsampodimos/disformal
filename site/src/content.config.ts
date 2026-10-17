import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: new URL('./content/posts', import.meta.url),
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.coerce.date(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    type: z.enum(['essay', 'note']).optional().default('essay'),
    state: z.enum(['seed', 'growing', 'evergreen']).optional(),
    image: z.string().optional(),
    excerpt: z.string().optional(),
    audio: z.string().optional(),
    featured: z.boolean().optional().default(false),
    lastRevised: z.coerce.date().optional(),
  }),
});

export const collections = { posts };
