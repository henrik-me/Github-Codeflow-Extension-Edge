(function(){

var codeflowPngInGithub = "https://github.com/henrik-me/Github-Codeflow-Extension-Edge/blob/master/icons/icon.png?raw=true";

function makeLink(prlink, height) {
    return " <a id='CodeFlow' href='codeflow:open?pullrequest=" + prlink +
        "&amp;ref=EdgeExtension' aria-label='Open in CodeFlow' title='Open in CodeFlow'>" +
        "<img class='v-align-middle' src='" + codeflowPngInGithub + "' height='" + height + "'></a>";
}

// For individual pull request page, commits tab and checks tab
function ApplyToPullRequest() {
    var discussionHeaders = document.getElementsByClassName("gh-header-title");
    if (discussionHeaders.length > 0)
    {
        var discussionHeader = discussionHeaders[0];
        var prlink = document.location.href;
        
        // Link to a specific change: remove # elements as CodeFlow doesn't support this
        prlink = prlink.replace(document.location.hash, "")
        
        // File Tab: Remove the files part of the url as CodeFlow doesn't support that
        var filesPosition = prlink.indexOf("/files");
        if (filesPosition !== -1)
        {
          prlink = prlink.substring(0, filesPosition);
        }
        
        // Commit and checks tab: remove commit from the link
        prlink = prlink.replace("/commits", "")
        prlink = prlink.replace("/checks", "")
        console.log(prlink);

        var codeflowElement = document.createElement("span");
        codeflowElement.innerHTML = makeLink(prlink, 27);
        var headerSpans = discussionHeader.getElementsByTagName("span");
        numberSpan = headerSpans[1];
        numberSpan.insertAdjacentElement('beforeend', codeflowElement);
        return true;
    }
    return false;
}

// For individual pull request page, commits tab and checks tab, when scrolling down
function ApplyToPullRequestScrolledDown() {
    var discussionHeaders = document.getElementsByClassName("gh-header-number");
    if (discussionHeaders.length > 0)
    {
        var discussionHeader = discussionHeaders[0];
        var prlink = document.location.href;
        
        // Link to a specific change: remove # elements as CodeFlow doesn't support this
        prlink = prlink.replace(document.location.hash, "")
        
        // File Tab: Remove the files part of the url as CodeFlow doesn't support that
        var filesPosition = prlink.indexOf("/files");
        if (filesPosition !== -1)
        {
          prlink = prlink.substring(0, filesPosition);
        }
        
        // Commit and checks tab: remove commit from the link
        prlink = prlink.replace("/commits", "")
        prlink = prlink.replace("/checks", "")
        console.log(prlink);

        var codeflowElement = document.createElement("span");
        codeflowElement.innerHTML = makeLink(prlink, 27);
        discussionHeader.insertAdjacentElement('beforeend', codeflowElement);
        return true;
    }
    return false;
}

// for pull request list page
function ApplyToPullRequestList() {
    var issueListHeaders = document.getElementsByClassName("js-issue-row");
    len = issueListHeaders.length;
    for (var i = 0; i < len; i++) {
        var id = issueListHeaders[i].id.replace("issue_", "");

        // back up from pulls to pull/id.
        var prlink = makeLink(document.URL.substring(0, document.URL.length-1) + "/" + id, 16);
        var codeflowElement = document.createElement("span");
        codeflowElement.innerHTML = prlink;
        var titleLink = issueListHeaders[i].getElementsByClassName("js-navigation-open")[0];
        titleLink.insertAdjacentElement('afterend', codeflowElement);
    }
    return issueListHeaders.length > 0;
}

// apply settigns if the document hasn't already been updated.
function applyLinks() {
    if (document.hasOwnProperty('codeflowApplied')) {
        return true;
    }

    var result = ApplyToPullRequest() || ApplyToPullRequestList();
    var result2 = ApplyToPullRequestScrolledDown(); 

    if (result == true || result2) {
        document.codeflowApplied = true;
    }
};

// Retry to accomodate dynamic content.
var retries = 5;
function tryUntilSuccess() {
    retries = retries - 1;
    if (retries == 0) {
        return;
    }
    if (applyLinks() == false) 
    {
        setTimeout(tryUntilSuccess(), 300);
    }
}

tryUntilSuccess();

})();
