
// ShopDemo local API — Lab 2 "Non-functional testing"
// Minimal HTTP server in Node.js, with no external dependency.
// Start: node server.js (or: npm start)
// Stop : Ctrl + C in the terminal where the server is running.
const http = require('http');
const PORT = Number(process.env.PORT) || 3000;
// Fictitious catalogue of 20 products
const categories = ['audio', 'computing', 'home', 'sport'];
const products = Array.from({ length: 20 }, (_, i) => ({
 id: i + 1,
 name: `Product ${i + 1}`,
 category: categories[i % categories.length],
 price: Number((9.99 + i * 5).toFixed(2)),
 stock: (i * 7) % 15,
}));
function sendJson(res, status, body) {
 const data = JSON.stringify(body);
 res.writeHead(status, {
 'Content-Type': 'application/json; charset=utf-8',
 'Content-Length': Buffer.byteLength(data),
 });
 res.end(data);
}
const server = http.createServer((req, res) => {
 if (req.method !== 'GET') {
 return sendJson(res, 405, { error: 'Method not allowed' });
  }
 const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
 // GET / : check that the API is up
 if (url.pathname === '/') {
 return sendJson(res, 200, {
 message: 'ShopDemo API online',
 endpoints: ['/products', '/products/:id', '/products-slow'],
 });
 }
 // GET /products : product list (optional filter ?category=audio)
 if (url.pathname === '/products') {
 const category = url.searchParams.get('category');
 const list = category ? products.filter((p) => p.category === category) : products;
 return sendJson(res, 200, { count: list.length, products: list });
 }
 // GET /products/:id : product details
 const match = url.pathname.match(/^\/products\/(\d+)$/);
 if (match) {
 const product = products.find((p) => p.id === Number(match[1]));
 return product
 ? sendJson(res, 200, product)
 : sendJson(res, 404, { error: 'Product not found' });
 }
 // GET /products-slow : TEACHING SIMULATION of a slow endpoint.
 // A random delay of 200 to 1,500 ms is added on purpose
  if (url.pathname === '/products-slow') {    const delay = 200 + Math.floor(Math.random() * 1300);    return setTimeout(      () => sendJson(res, 200, { count: products.length, products, simulatedDelayMs: delay }),      delay,    );  }
  return sendJson(res, 404, { error: 'Resource not found' }); });
server.listen(PORT, () => {  console.log(`ShopDemo API started on http://localhost:${PORT}`);  console.log('Stop: Ctrl + C'); });