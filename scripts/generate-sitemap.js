import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define your site URL - supports both VITE_SITE_URL and SITE_URL for flexibility
const SITE_URL = process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://guell-store.com';

// Define static routes for the GÜELL ecosystem
const routes = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/auth', changefreq: 'monthly', priority: 0.5 },
  { url: '/search', changefreq: 'daily', priority: 0.8 },
  { url: '/store', changefreq: 'daily', priority: 0.9 },
  { url: '/food', changefreq: 'daily', priority: 0.9 },
  { url: '/account/dashboard', changefreq: 'weekly', priority: 0.7 },
  { url: '/merchant/dashboard', changefreq: 'weekly', priority: 0.6 },
  { url: '/store/auth', changefreq: 'monthly', priority: 0.5 },
  { url: '/store/search', changefreq: 'daily', priority: 0.8 },
  { url: '/store/subscription', changefreq: 'monthly', priority: 0.6 },
  { url: '/store/wishlist', changefreq: 'weekly', priority: 0.6 },
  { url: '/store/checkout', changefreq: 'daily', priority: 0.5 },
  { url: '/store/orders', changefreq: 'weekly', priority: 0.7 },
  { url: '/store/admin', changefreq: 'weekly', priority: 0.5 },
  { url: '/store/seller', changefreq: 'weekly', priority: 0.6 },
  { url: '/store/terms', changefreq: 'monthly', priority: 0.3 },
  { url: '/store/help', changefreq: 'monthly', priority: 0.5 },
  { url: '/store/support', changefreq: 'monthly', priority: 0.5 },
  { url: '/store/support-center', changefreq: 'monthly', priority: 0.5 },
  { url: '/store/compare', changefreq: 'weekly', priority: 0.5 },
  { url: '/store/account', changefreq: 'weekly', priority: 0.7 },
  { url: '/store/account/settings', changefreq: 'monthly', priority: 0.5 },
  { url: '/store/account/addresses', changefreq: 'monthly', priority: 0.5 },
  { url: '/store/account/payments', changefreq: 'monthly', priority: 0.5 },
  { url: '/store/account/notifications', changefreq: 'monthly', priority: 0.5 },
  { url: '/store/sell', changefreq: 'monthly', priority: 0.6 },
  { url: '/store/deals', changefreq: 'daily', priority: 0.8 },
  { url: '/store/registry', changefreq: 'monthly', priority: 0.5 },
  { url: '/food', changefreq: 'daily', priority: 0.9 },
  { url: '/food/admin', changefreq: 'weekly', priority: 0.5 },
  { url: '/table', changefreq: 'daily', priority: 0.7 },
  { url: '/kitchen', changefreq: 'daily', priority: 0.5 },
  { url: '/admin', changefreq: 'weekly', priority: 0.5 },
  { url: '/seller', changefreq: 'weekly', priority: 0.6 },
  { url: '/terms', changefreq: 'monthly', priority: 0.3 },
  { url: '/help', changefreq: 'monthly', priority: 0.5 },
  { url: '/support', changefreq: 'monthly', priority: 0.5 },
];

// Generate sitemap XML
const generateSitemap = () => {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const urlsetStart = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const urlsetEnd = '</urlset>';
  
  const urlElements = routes.map(route => {
    const fullUrl = `${SITE_URL}${route.url}`;
    const lastmod = new Date().toISOString().split('T')[0];
    return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }).join('\n');
  
  return xmlHeader + urlsetStart + urlElements + '\n' + urlsetEnd;
};

// Write sitemap to public folder
const sitemapContent = generateSitemap();
const publicDir = path.join(__dirname, '..', 'public');
const sitemapPath = path.join(publicDir, 'sitemap.xml');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(sitemapPath, sitemapContent);
console.log('✅ Sitemap generated successfully at:', sitemapPath);
