const { createServer } = require("node:http");
const { readFile } = require("node:fs/promises");
const { join } = require("node:path");

const files = new Map([
    ["/", ["index.html", "text/html"]],
    ["/tests/codeflow.test.js", ["codeflow.test.js", "text/javascript"]],
    ["/tests/harness.js", ["harness.js", "text/javascript"]],
    ["/codeflow.js", [join("..", "codeflow.js"), "text/javascript"]]
]);
const fixture = `<!doctype html><html lang="en"><meta charset="utf-8">
<title>CodeFlow test fixture</title>
<style>
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(100%); }
    img { width: 27px; }
</style><body></body></html>`;

const server = createServer(async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    // Fixtures exercise DOM behavior without downloading GitHub's icon.
    response.setHeader("Content-Security-Policy", "img-src 'none'; connect-src 'self'");
    if (request.method !== "GET") {
        response.writeHead(405).end("Method not allowed");
        return;
    }
    if (request.url === "/fixture.html") {
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(fixture);
        return;
    }
    if (request.url === "/favicon.ico") {
        response.writeHead(204).end();
        return;
    }
    const file = files.get(request.url);
    if (!file) {
        response.writeHead(404).end("Not found");
        return;
    }
    try {
        const content = await readFile(join(__dirname, file[0]));
        response.writeHead(200, { "Content-Type": file[1] + "; charset=utf-8" }).end(content);
    } catch (error) {
        console.error(error);
        response.writeHead(500).end("Unable to read test file");
    }
});

server.listen(0, "127.0.0.1", () => {
    console.log(`Open http://127.0.0.1:${server.address().port}/ in Edge or Chrome to run the tests.`);
    console.log("No npm install required. Press Ctrl+C to stop the test server.");
});
