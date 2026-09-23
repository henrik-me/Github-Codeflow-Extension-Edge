(function () {
    const EnableDebugging = false;
    const codeflowPngInGithub = "https://github.com/henrik-me/Github-Codeflow-Extension-Edge/blob/master/icons/icon-16x16.png?raw=true";
    const codeflowLinkSelector = "[data-codeflow-link]";
    const applyDelayMs = 150;
    const maxInitialRetries = 10;
    const pullRequestPathPattern = /^\/[^\/]+\/[^\/]+\/pull\/\d+(?:\/.*)?$/;
    const pullRequestListPathPattern = /^\/[^\/]+\/[^\/]+\/pulls\/?$/;

    var applyTimer = null;
    var retriesRemaining = maxInitialRetries;
    var scheduledApplyUsesRetries = false;
    var lastUrl = document.location.href;

    function debugLog(message) {
        if (EnableDebugging) {
            console.log("[CodeFlow] " + message);
        }
    }

    debugLog("Starting");

    function makeLink(href, height) {
        var link = document.createElement("a");
        link.setAttribute("data-codeflow-link", "true");
        link.href = href;
        link.setAttribute("aria-label", "Open in CodeFlow");
        link.title = "Open in CodeFlow";

        var icon = document.createElement("img");
        icon.className = "v-align-middle";
        icon.src = codeflowPngInGithub;
        icon.height = height;

        link.appendChild(icon);
        return link;
    }

    function normalizePullRequestUrl(url) {
        var parsedUrl = new URL(url);
        var prlink = parsedUrl.origin + parsedUrl.pathname.split("/").slice(0, 5).join("/");

        debugLog("PR Link: " + prlink);
        return prlink;
    }

    function isSupportedPage() {
        var path = document.location.pathname;
        return pullRequestPathPattern.test(path) || pullRequestListPathPattern.test(path);
    }

    function ensureLink(lookupContainer, insertTarget, position, prlink, height) {
        if (!lookupContainer || !insertTarget) {
            return false;
        }

        var href = "codeflow:open?pullrequest=" + prlink + "&ref=EdgeExtension";
        var link = lookupContainer.querySelector(codeflowLinkSelector);
        var codeflowElement;
        if (link !== null) {
            codeflowElement = link.parentElement;
            if (link.href !== href) {
                link.href = href;
            }
        } else {
            codeflowElement = document.createElement("span");
            codeflowElement.appendChild(document.createTextNode(" "));
            codeflowElement.appendChild(makeLink(href, height));
        }

        var correctlyPlaced = position === "beforeend" ?
            codeflowElement.parentElement === insertTarget :
            insertTarget.nextElementSibling === codeflowElement;
        if (!correctlyPlaced) {
            insertTarget.insertAdjacentElement(position, codeflowElement);
        }
        return true;
    }

    // For individual pull request page, commits tab and checks tab
    function ApplyToPullRequest() {
        debugLog("ApplyToPullRequest");

        var discussionHeaders = document.querySelectorAll('h1[data-component="PH_Title"], h1.gh-header-title');
        if (discussionHeaders.length === 0) {
            return false;
        }

        var discussionHeader = discussionHeaders[0];
        // The React heading's PR-number span is screen-reader-only.
        return ensureLink(discussionHeader, discussionHeader, "beforeend", normalizePullRequestUrl(document.location.href), 27);
    }

    // For individual pull request page, commits tab and checks tab, when scrolling down
    function ApplyToPullRequestScrolledDown() {
        debugLog("ApplyToPullRequestScrolledDown");

        var legacyTitleLink = document.querySelector('a.js-issue-title[href="#top"]');
        var discussionHeader = document.querySelector('h2[data-component="PH_Title"]') ||
            (legacyTitleLink && legacyTitleLink.closest("h1"));
        if (!discussionHeader) {
            return false;
        }

        var titleLink = discussionHeader.querySelector('a[href="#top"]');
        var titleRow = titleLink ? titleLink.parentElement : discussionHeader;
        return ensureLink(discussionHeader, titleRow, "beforeend", normalizePullRequestUrl(document.location.href), 27);
    }

    // for pull request list page
    function ApplyToPullRequestList() {
        debugLog("ApplyToPullRequestList");

        var titleLinks = document.querySelectorAll('a[data-testid="listitem-title-link"], .js-issue-row a.js-navigation-open');
        var foundTarget = false;

        for (var i = 0; i < titleLinks.length; i++) {
            var titleLink = titleLinks[i];
            if (titleLink.origin !== document.location.origin || !pullRequestPathPattern.test(titleLink.pathname)) {
                debugLog("Skipping a title link that does not point to a GitHub PR.");
                continue;
            }

            var issueListHeader = titleLink.closest("li, .js-issue-row") || titleLink.parentElement;
            foundTarget = true;
            ensureLink(issueListHeader, titleLink, "afterend", normalizePullRequestUrl(titleLink.href), 16);
        }

        return foundTarget;
    }

    function applyLinks() {
        if (isSupportedPage() === false) {
            return false;
        }

        if (pullRequestListPathPattern.test(document.location.pathname)) {
            return ApplyToPullRequestList();
        }

        var foundTarget = ApplyToPullRequest();
        return ApplyToPullRequestScrolledDown() || foundTarget;
    }

    function scheduleApply(useRetries) {
        scheduledApplyUsesRetries = scheduledApplyUsesRetries || useRetries;

        if (applyTimer !== null) {
            clearTimeout(applyTimer);
        }

        applyTimer = setTimeout(function () {
            applyTimer = null;
            var retryThisRun = scheduledApplyUsesRetries;
            scheduledApplyUsesRetries = false;

            if (applyLinks() === false && retryThisRun === true && retriesRemaining > 0) {
                retriesRemaining = retriesRemaining - 1;
                debugLog("Re-Try");
                scheduleApply(true);
            }
        }, applyDelayMs);
    }

    function onNavigationOrDomChange(useRetries) {
        var urlChanged = lastUrl !== document.location.href;

        if (urlChanged) {
            lastUrl = document.location.href;
            retriesRemaining = maxInitialRetries;
        }

        if (isSupportedPage() === false) {
            if (applyTimer !== null) {
                clearTimeout(applyTimer);
                applyTimer = null;
            }

            scheduledApplyUsesRetries = false;
            return;
        }

        scheduleApply(useRetries);
    }

    var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].type === "attributes" || mutations[i].addedNodes.length > 0 ||
                mutations[i].removedNodes.length > 0 || lastUrl !== document.location.href) {
                onNavigationOrDomChange(false);
                return;
            }
        }
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
    }

    document.addEventListener("pjax:end", function () { onNavigationOrDomChange(true); });
    document.addEventListener("turbo:load", function () { onNavigationOrDomChange(true); });
    document.addEventListener("turbo:render", function () { onNavigationOrDomChange(true); });
    window.addEventListener("popstate", function () { onNavigationOrDomChange(true); });
    window.addEventListener("pageshow", function () { onNavigationOrDomChange(true); });

    onNavigationOrDomChange(true);
})();
