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
The extension runs directly from this folder; no build or Node.js installation is needed to load it in Edge.

For DOM regression tests, use Node.js 22.13+ (22.x) or 24+:

```text
npm ci
npm test
```

The tests cover React and legacy PR headers, sticky headers, PR lists, URL normalization, and in-page navigation. Test dependencies are development-only and are not used by the extension.

Before shipping a UI compatibility change, also load the unpacked extension on real GitHub PR pages. Check Conversation, Commits, Checks, Files changed, the scrolled sticky header, and the PR list. Navigate from the repository to the list and into a PR without refreshing. Confirm each icon is visible, not duplicated or inside a hidden accessibility element, and its `codeflow:` link points to the canonical PR URL. Repeat at narrow window widths; DOM-only tests cannot verify clipping or layout.
