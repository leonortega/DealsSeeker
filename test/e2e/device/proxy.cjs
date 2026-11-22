// Diagnostic proxy: logs API traffic between the device and the real API.
// Start with: node test/e2e/device/proxy.cjs
// Then restart Metro with EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5006
const http = require('http');

const PORT = Number(process.env.PROXY_PORT || 5006);
const TARGET_PORT = Number(process.env.API_PORT || 5005);

http
  .createServer((req, res) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      console.log(`\n>>> ${req.method} ${req.url}`);
      if (body.length) console.log(body.toString().slice(0, 1200));

      const proxy = http.request(
        {
          hostname: '127.0.0.1',
          port: TARGET_PORT,
          path: req.url,
          method: req.method,
          headers: { ...req.headers, host: `127.0.0.1:${TARGET_PORT}` },
        },
        (upstream) => {
          const responseChunks = [];
          upstream.on('data', (chunk) => responseChunks.push(chunk));
          upstream.on('end', () => {
            const responseBody = Buffer.concat(responseChunks);
            console.log(`<<< ${upstream.statusCode} ${responseBody.toString().slice(0, 1200)}`);
            res.writeHead(upstream.statusCode || 502, upstream.headers);
            res.end(responseBody);
          });
        }
      );
      proxy.on('error', (error) => {
        console.error(`proxy error: ${error.message}`);
        res.writeHead(502);
        res.end();
      });
      proxy.end(body);
    });
  })
  .listen(PORT, () => console.log(`API diagnostic proxy listening on ${PORT} -> ${TARGET_PORT}`));
