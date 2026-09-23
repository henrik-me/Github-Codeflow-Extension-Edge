# Github-Codeflow-Extension-Edge
Github Codeflow Extension for Edge Chromium

## Info:
+ TLDR; clone the repo and enable developer extensions in Edge Chromium. Load the extension from where you cloned the bits to.

+ This is the first step of creating the plug-in. Additional work is required to get this shipped in the Microsoft Store for Trusted apps.
+ If not cloning copy the files in this repo to your local disk.
+ Follow the steps described above [Sideloading Extensions](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/getting-started/extension-sideloading) to load the extension in developer mode.
+ Look for CodeFlow icon at end of PR titles that is link to open in CodeFlow. You may need to refresh existing pages for extension to connect.
+ After updating the checkout, reload Codeflow on `edge://extensions` and refresh any open GitHub tabs.

## Prerequisites
Code Flow: http://go.microsoft.com/fwlink/?LinkID=691968

## Development
The extension runs directly from this folder using plain JavaScript and native browser APIs. There are no npm dependencies, no build step, and no Node.js requirement to load it in Edge.

For regression tests, start the local server using an installed Node.js LTS release:

```text
node tests\serve.js
```

Open the localhost URL printed by the server in Edge or Chrome. All 21 tests run automatically and display pass/fail results; refresh to rerun, and press Ctrl+C in the terminal to stop the server. No `npm install` is needed. The server uses only Node.js built-ins and serves an explicit list of test files on the loopback interface.

The plain `.js` tests cover React and legacy PR headers, sticky headers, PR lists, URL normalization, and in-page navigation. Each case runs the unchanged extension script in a fresh iframe with the browser's real DOM, selectors, events, URL handling, and MutationObserver. Small helpers provide assertions and deterministic timers; there is no DOM emulator. Fixture URLs use localhost rather than GitHub, and image downloads are deliberately blocked by the test server's Content Security Policy so these tests can run offline. Expected image-blocking messages may appear in DevTools. Results are also available as `window.testResults` and `document.documentElement.dataset.testStatus`.

Before shipping a UI compatibility change, also load the unpacked extension on real GitHub PR pages. Check Conversation, Commits, Checks, Files changed, the scrolled sticky header, and the PR list. Navigate from the repository to the list and into a PR without refreshing. Confirm each icon is visible, not duplicated or inside a hidden accessibility element, and its `codeflow:` link points to the canonical PR URL. Repeat at narrow window widths; the fixture tests do not reproduce GitHub's full CSS or verify image downloads.
