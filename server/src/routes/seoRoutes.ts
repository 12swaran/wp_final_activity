import { asyncRouter } from '../utils/asyncRouter';
import { BlogPost } from '../models/BlogPost';
import { Project } from '../models/Project';
import { Service } from '../models/Service';
import { env } from '../config/env';
import { escapeHtml } from '../utils/security';
export const seoRoutes = asyncRouter();
seoRoutes.get('/sitemap.xml', async (_req, res) => {
  const [services, projects, posts] = await Promise.all([
    Service.find({ isPublished: { $ne: false } }).select('slug'),
    Project.find().select('slug'),
    BlogPost.find({ isPublished: true }).select('slug'),
  ]);
  const paths = [
    '/',
    '/about',
    '/services',
    '/portfolio',
    '/pricing',
    '/contact',
    '/quote',
    '/book',
    '/reviews',
    '/blog',
    '/faqs',
    '/privacy',
    '/terms',
    ...services.map((value) => `/services/${encodeURIComponent(value.slug)}`),
    ...projects.map((value) => `/portfolio/${encodeURIComponent(value.slug)}`),
    ...posts.map((value) => `/blog/${encodeURIComponent(value.slug)}`),
  ];
  res
    .type('application/xml')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${escapeHtml(env.CLIENT_URL.replace(/\/$/, '') + path)}</loc></url>`).join('')}</urlset>`,
    );
});
seoRoutes.get('/robots.txt', (_req, res) =>
  res
    .type('text/plain')
    .send(
      `User-agent: *\nDisallow: /admin\nDisallow: /track\nDisallow: /manage-booking\nDisallow: /api\nSitemap: ${env.CLIENT_URL}/sitemap.xml\n`,
    ),
);
