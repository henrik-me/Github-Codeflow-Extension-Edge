const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const { JSDOM } = require("jsdom");

const source = readFileSync(join(__dirname, "..", "codeflow.js"), "utf8");
const prUrl = "https://github.com/owner/repo/pull/10";
const linkSelector = "[data-codeflow-link]";
const reactHeader = `
    <h1 data-component="PH_Title">
        <span class="markdown-title">Title with <code>inline code</code></span>
        <span class="sr-only"> - #10</span>
    </h1>
    <span aria-hidden="true">#10</span>`;
const legacyHeader = `
    <h1 class="gh-header-title">
        <bdi class="js-issue-title markdown-title">Title</bdi>
        <span class="gh-header-number">#10</span>
    </h1>`;

function createPage(t, html, url = prUrl) {
    const dom = new JSDOM(html, { url, runScripts: "outside-only" });
    const { window } = dom;
    const observers = [];
    window.MutationObserver = class extends window.MutationObserver {
        constructor(callback) {
            super(callback);
            observers.push(this);
        }
    };
    const timers = new Map();
    let nextTimer = 0;
    window.setTimeout = callback => {
        timers.set(++nextTimer, callback);
        return nextTimer;
    };
    window.clearTimeout = id => timers.delete(id);
    t.after(() => {
        observers.forEach(observer => observer.disconnect());
        window.close();
    });
    window.eval(source);

    return {
        window,
        document: window.document,
        async settle() {
            for (let i = 0; i < 20; i++) {
                await Promise.resolve();
                if (timers.size === 0) return;
                const callbacks = [...timers.values()];
                timers.clear();
                callbacks.forEach(callback => callback());
            }
            assert.fail("Extension did not settle after DOM updates");
        }
    };
}

function assertLink(container, url = prUrl) {
    const links = container.querySelectorAll(linkSelector);
    assert.equal(links.length, 1, "Exactly one CodeFlow link per target");
    const link = links[0];
    assert.equal(link.href, "codeflow:open?pullrequest=" + url + "&ref=EdgeExtension");
    assert.equal(link.getAttribute("aria-label"), "Open in CodeFlow");
    assert.equal(link.closest(".sr-only, [hidden], [aria-hidden='true']"), null,
        "The link must not be inside a hidden title/number");
    assert.equal(link.parentElement.closest("a"), null, "Links must not be nested");
    return link;
}

test("React title icon is outside the screen-reader-only PR number", async t => {
    const page = createPage(t, reactHeader);
    await page.settle();
    assertLink(page.document.querySelector("h1"));
    assert.equal(page.document.querySelector(".sr-only").textContent, " - #10");
});

test("legacy Files changed heading receives an icon", async t => {
    const page = createPage(t, legacyHeader, prUrl + "/files#diff-123");
    await page.settle();
    assertLink(page.document.querySelector("h1"));
});

test("React sticky icon stays on the title row, not below the branch summary", async t => {
    const page = createPage(t, `
        <h2 data-component="PH_Title">
            <div id="title-row"><a href="#top"><span class="markdown-title">Title</span></a><span>#10</span></div>
            <div id="summary">Branch summary</div>
        </h2>`);
    await page.settle();
    assertLink(page.document.querySelector("#title-row"));
    assert.equal(page.document.querySelector("#summary").querySelector(linkSelector), null);
});

test("legacy sticky heading receives an icon without nesting it in the title link", async t => {
    const page = createPage(t, `
        <h1 class="d-flex"><a class="js-issue-title" href="#top">Title</a><span>#10</span></h1>`);
    await page.settle();
    assertLink(page.document.querySelector("h1"));
});

test("title content arriving after initial retries still receives an icon", async t => {
    const page = createPage(t, "");
    await page.settle();
    page.document.body.innerHTML = reactHeader;
    await page.settle();
    assertLink(page.document.querySelector("h1"));
});

test("repeated navigation events do not duplicate header icons", async t => {
    const page = createPage(t, legacyHeader);
    await page.settle();
    for (const event of ["pjax:end", "turbo:load", "turbo:render", "pageshow", "popstate"]) {
        page.window.dispatchEvent(new page.window.Event(event, { bubbles: true }));
        page.document.dispatchEvent(new page.window.Event(event, { bubbles: true }));
        await page.settle();
    }
    assertLink(page.document.querySelector("h1"));
});
