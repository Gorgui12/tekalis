export default function robots() {
return {
rules: [
{
userAgent: '*',
allow: ['/', '/products', '/products/*', '/blog', '/blog/*', '/category/*', '/category/*/*'],
disallow: ['/admin', '/api/', '/cart', '/checkout', '/dashboard', '/login', '/register', '/wishlist', '/configurator'],
},
{
userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'AhrefsSiteAudit'],
disallow: '/',
},
{
userAgent: 'Googlebot',
allow: '/',
crawlDelay: 1,
},
],
sitemap: 'https://tekalis.com/sitemap.xml',
host: 'https://tekalis.com',
};
}
