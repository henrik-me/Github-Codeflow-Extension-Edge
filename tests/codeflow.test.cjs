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

const reactList = `
    <ul role="list">
        <li id="generated-row-a"><h3><a data-testid="listitem-title-link" href="${prUrl}">First PR</a></h3></li>
        <li id="generated-row-b"><h3><a data-testid="listitem-title-link" href="/owner/repo/pull/11">Second PR</a></h3></li>
    </ul>`;

test("React list uses PR links rather than generated row IDs", async t => {
    const page = createPage(t, reactList, "https://github.com/owner/repo/pulls?q=is%3Aopen");
    await page.settle();
    assertLink(page.document.querySelector("#generated-row-a"));
    assertLink(page.document.querySelector("#generated-row-b"), prUrl.replace("/10", "/11"));
});

test("legacy list uses the linked PR number, not the internal issue ID", async t => {
    const page = createPage(t, `
        <div class="js-issue-row" id="issue_999999">
            <a class="js-navigation-open" href="/owner/repo/pull/10">PR</a>
        </div>`, "https://github.com/owner/repo/pulls/");
    await page.settle();
    assertLink(page.document.querySelector(".js-issue-row"));
});

test("PR list ignores external, invalid, and non-PR title links", async t => {
    const page = createPage(t, `
        <ul>
            <li><a data-testid="listitem-title-link" href="https://example.com/owner/repo/pull/10">External</a></li>
            <li><a data-testid="listitem-title-link" href="/owner/repo/issues/10">Issue</a></li>
            <li><a data-testid="listitem-title-link" href="javascript:void(0)">Action</a></li>
            <li><a data-testid="listitem-title-link" href="https://[">Invalid</a></li>
        </ul>`, "https://github.com/owner/repo/pulls");
    await page.settle();
    assert.equal(page.document.querySelectorAll(linkSelector).length, 0);
});

for (const suffix of ["/", "/files?diff=split#diff-123", "/commits/abc123",
    "/checks?check_run_id=1", "/changes?diff=unified#diff-456"]) {
    test("PR destination is canonical on " + suffix, async t => {
        const page = createPage(t, reactHeader, prUrl + suffix);
        await page.settle();
        assertLink(page.document.querySelector("h1"));
    });
}

test("URL normalization preserves a repository named commits", async t => {
    const url = "https://github.com/owner/commits/pull/10";
    const page = createPage(t, reactHeader, url + "/commits");
    await page.settle();
    assertLink(page.document.querySelector("h1"), url);
});

test("a header reused for a different PR gets the new destination", async t => {
    const page = createPage(t, reactHeader);
    await page.settle();
    const nextUrl = prUrl.replace("/10", "/11");
    page.window.history.pushState({}, "", nextUrl);
    page.document.querySelector(".markdown-title").textContent = "Next PR";
    await page.settle();
    assertLink(page.document.querySelector("h1"), nextUrl);
});

test("a list row reused by filtering gets the new destination without duplicates", async t => {
    const page = createPage(t, reactList, "https://github.com/owner/repo/pulls");
    await page.settle();
    const row = page.document.querySelector("#generated-row-a");
    const nextUrl = prUrl.replace("/10", "/12");
    row.querySelector("a[data-testid]").href = nextUrl;
    await page.settle();
    assertLink(row, nextUrl);
});

test("repository-to-list-to-PR navigation works without reloading the content script", async t => {
    const page = createPage(t, "<h1>Repository</h1>", "https://github.com/owner/repo");
    await page.settle();
    assert.equal(page.document.querySelectorAll(linkSelector).length, 0);
    page.window.history.pushState({}, "", "/owner/repo/pulls");
    page.document.body.innerHTML = reactList;
    await page.settle();
    assertLink(page.document.querySelector("#generated-row-a"));
    page.window.history.pushState({}, "", prUrl);
    page.document.body.innerHTML = reactHeader;
    await page.settle();
    assertLink(page.document.querySelector("h1"));
});

test("an icon removed by a DOM refresh is restored", async t => {
    const page = createPage(t, reactHeader);
    await page.settle();
    page.document.querySelector(linkSelector).parentElement.remove();
    await page.settle();
    assertLink(page.document.querySelector("h1"));
});

test("an existing icon moved into a hidden span is relocated", async t => {
    const page = createPage(t, reactHeader);
    await page.settle();
    page.document.querySelector(".sr-only").appendChild(
        page.document.querySelector(linkSelector).parentElement);
    await page.settle();
    assertLink(page.document.querySelector("h1"));
});

test("list pages do not decorate unrelated page headings", async t => {
    const page = createPage(t, reactHeader + reactList, "https://github.com/owner/repo/pulls");
    await page.settle();
    assert.equal(page.document.querySelector("h1").querySelector(linkSelector), null);
    assertLink(page.document.querySelector("#generated-row-a"));
});
