(function () {
    const EnableDebugging = false;
    const codeflowPngInGithub = "https://github.com/henrik-me/Github-Codeflow-Extension-Edge/blob/master/icons/icon-16x16.png?raw=true";
    const codeflowLinkSelector = "[data-codeflow-link]";
    const applyDelayMs = 150;
    const maxInitialRetries = 10;

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

    function makeLink(prlink, height) {
        var link = document.createElement("a");
        link.setAttribute("data-codeflow-link", "true");
        link.href = "codeflow:open?pullrequest=" + prlink + "&ref=EdgeExtension";
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
        var prlink = url.replace(document.location.hash, "");
        var filesPosition = prlink.indexOf("/files");

        if (filesPosition !== -1) {
            prlink = prlink.substring(0, filesPosition);
        }

        prlink = prlink.replace("/commits", "");
        prlink = prlink.replace("/checks", "");

        if (prlink.endsWith("/") && prlink.length > 2) {
            prlink = prlink.substring(0, prlink.length - 1);
        }

        debugLog("PR Link: " + prlink);
        return prlink;
    }

    function ensureLink(lookupContainer, insertTarget, position, prlink, height) {
        if (!lookupContainer || !insertTarget) {
            return false;
        }

        if (lookupContainer.querySelector(codeflowLinkSelector) !== null) {
            return true;
        }

        var codeflowElement = document.createElement("span");
        codeflowElement.appendChild(document.createTextNode(" "));
        codeflowElement.appendChild(makeLink(prlink, height));
        insertTarget.insertAdjacentElement(position, codeflowElement);
        return true;
    }

    // For individual pull request page, commits tab and checks tab
    function ApplyToPullRequest() {
        debugLog("ApplyToPullRequest");

        var discussionHeaders = document.querySelectorAll('h1[data-component="PH_Title"]');
        if (discussionHeaders.length === 0) {
            return false;
        }

        var discussionHeader = discussionHeaders[0];
        var headerSpans = discussionHeader.getElementsByTagName("span");
        if (headerSpans.length === 0) {
            debugLog("Unable to identify location to insert codeflow element.");
            return false;
        }

        var numberSpan = headerSpans.length > 1 ? headerSpans[1] : headerSpans[0];
        return ensureLink(discussionHeader, numberSpan, "beforeend", normalizePullRequestUrl(document.location.href), 27);
    }

    // For individual pull request page, commits tab and checks tab, when scrolling down
    function ApplyToPullRequestScrolledDown() {
        debugLog("ApplyToPullRequestScrolledDown");

        var discussionHeaders = document.querySelectorAll('h2[data-component="PH_Title"]');
        if (discussionHeaders.length === 0) {
            return false;
        }

        var discussionHeader = discussionHeaders[0];
        return ensureLink(discussionHeader, discussionHeader, "beforeend", normalizePullRequestUrl(document.location.href), 27);
    }

    // for pull request list page
    function ApplyToPullRequestList() {
        debugLog("ApplyToPullRequestList");

        var issueListHeaders = document.getElementsByClassName("js-issue-row");
        var foundTarget = false;
        var basePath = document.location.pathname.replace(/\/pulls\/?$/, "/pull");
        var baseUrl = document.location.origin + basePath;

        for (var i = 0; i < issueListHeaders.length; i++) {
            var issueListHeader = issueListHeaders[i];
            var titleLink = issueListHeader.getElementsByClassName("js-navigation-open")[0];
            var id = issueListHeader.id.replace("issue_", "");

            if (!titleLink || !id) {
                continue;
            }

            foundTarget = true;
            ensureLink(issueListHeader, titleLink, "afterend", baseUrl + "/" + id, 16);
        }

        return foundTarget;
    }

    function applyLinks() {
        var foundTarget = false;

        foundTarget = ApplyToPullRequest() || foundTarget;
        foundTarget = ApplyToPullRequestList() || foundTarget;
        foundTarget = ApplyToPullRequestScrolledDown() || foundTarget;

        return foundTarget;
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
        if (lastUrl !== document.location.href) {
            lastUrl = document.location.href;
            retriesRemaining = maxInitialRetries;
        }

        scheduleApply(useRetries);
    }

    var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length > 0 || lastUrl !== document.location.href) {
                onNavigationOrDomChange(false);
                return;
            }
        }
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener("pjax:end", function () { onNavigationOrDomChange(true); });
    document.addEventListener("turbo:render", function () { onNavigationOrDomChange(true); });
    window.addEventListener("popstate", function () { onNavigationOrDomChange(true); });
    window.addEventListener("pageshow", function () { onNavigationOrDomChange(true); });

    onNavigationOrDomChange(true);
})();
