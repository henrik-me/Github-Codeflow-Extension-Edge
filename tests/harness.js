const tests = [];

export const assert = {
    equal(actual, expected, message = "Values must match") {
        if (!Object.is(actual, expected)) {
            throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
        }
    },
    fail(message) {
        throw new Error(message);
    }
};

export function test(name, callback) {
    tests.push({ name, callback });
}

export async function createPage(t, html, url = location.origin + "/owner/repo/pull/10") {
    const frame = document.createElement("iframe");
    frame.title = "Isolated regression fixture";
    t.after(() => frame.remove());
    const loaded = new Promise((resolve, reject) => {
        frame.onload = resolve;
        frame.onerror = () => reject(new Error("Unable to load fixture"));
    });
    frame.src = "/fixture.html";
    document.querySelector("#fixture").appendChild(frame);
    await loaded;

    const window = frame.contentWindow;
    window.history.replaceState({}, "", url);
    window.document.body.innerHTML = html;
    const errors = [];
    window.addEventListener("error", event => errors.push(event.error || new Error(event.message)));
    window.addEventListener("unhandledrejection", event => errors.push(new Error(String(event.reason))));
    const observers = [];
    window.MutationObserver = class extends window.MutationObserver {
        constructor(callback) {
            super(callback);
            observers.push(this);
        }
    };
    t.after(() => observers.forEach(observer => observer.disconnect()));
    const timers = new Map();
    let nextTimer = 0;
    window.setTimeout = callback => {
        timers.set(++nextTimer, callback);
        return nextTimer;
    };
    window.clearTimeout = id => timers.delete(id);
    window.eval(t.source);

    return {
        window,
        document: window.document,
        async settle() {
            for (let i = 0; i < 20; i++) {
                await Promise.resolve();
                if (errors.length) throw errors[0];
                if (timers.size === 0) return;
                const callbacks = [...timers.values()];
                timers.clear();
                callbacks.forEach(callback => callback());
            }
            assert.fail("Extension did not settle after DOM updates");
        }
    };
}

export async function run() {
    const response = await fetch("/codeflow.js");
    if (!response.ok) throw new Error(`Unable to load codeflow.js: HTTP ${response.status}`);
    const source = await response.text();
    const results = [];
    for (const { name, callback } of tests) {
        const cleanups = [];
        const result = { name, passed: false };
        try {
            await callback({ source, after: cleanup => cleanups.unshift(cleanup) });
            result.passed = true;
        } catch (error) {
            result.error = error.stack || String(error);
        } finally {
            cleanups.forEach(cleanup => cleanup());
        }
        results.push(result);
        const row = document.createElement("li");
        row.className = result.passed ? "pass" : "fail";
        row.textContent = `${result.passed ? "PASS" : "FAIL"}: ${name}` +
            (result.error ? `\n${result.error}` : "");
        document.querySelector("#results").appendChild(row);
    }
    const passed = results.filter(result => result.passed).length;
    document.querySelector("#summary").textContent =
        `${passed}/${results.length} passed; ${results.length - passed} failed.`;
    window.testResults = results;
    document.documentElement.dataset.testStatus = passed === results.length ? "passed" : "failed";
}
