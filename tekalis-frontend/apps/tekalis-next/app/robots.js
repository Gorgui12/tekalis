export default function robots() {
return {
rules: [
{
userAgent: '*',
allow: ['/', '/products', '/products/*', '/blog', '/blog/*', '/category/*'],
disallow: ['/admin', '/api/', '/cart', '/checkout', '/dashboard', '/login', '/register'],
},
{
userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot'],
disallow: '/',
},
],
sitemap: 'https://tekalis.com/sitemap.xml',
};
}
