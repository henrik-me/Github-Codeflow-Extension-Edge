(function(){

var codeflowIcon = "iVBORw0KGgoAAAANSUhEUgAAABsAAAAYCAYAAAALQIb7AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTnU1rJkAAAEjklEQVRIS72W+W9UVRTH+VuMaAQJWBUCLYtIMQHKNkQBE0SjIqSoFW1RKgQjrVIoS1ugTNgaSwpqkRK6sViwEMvQ6XSbgc7SWd5sdGPa6SzdPt736pQuD4FE/eGTN/ecc8/33nvOfW8mAf8bYwafbE5mT0Ym3+/JEMjP0ci28faYTc2XyRfbUkVaFbH5by7G6XQSiUSIRqP/Cg8etJG0UiPSjxObtyARq9WG3eEUOJSnw+HC4ZSGEb+HfWNptTuw2lqxWK20mC3cN5sxmu7RbDThdrtZtnz1RLG5CxZhs9lwuiSxQwm3x02zs4ZaeyW61kpMLr2Y7MUluYW4U0na0NiMwdBArd6ATqenpubuCH8KHGIh6mJvJNLaasfjEQndLiqMZynU7ecnXRZna7M4V5fNxfrj1Bn1GOobqRMi+rp65RnDYGgag7y4pOVqxyjE7HY7fnHO15svk1+1D23VAbQ397OvPJ3NhavYWqih+k41jU0mmppj3MNobKHeWIfOWEW1qZhf9HvQ3kjnQGk6szVzJorJO5MbxCxZOFyWzcHSg2ReyODtQxoSdsexMHMmFbdKud9iEbWxYhZYLA5sDitVluMUNm4ir3YpP1THo8l5jVe/imPq568Qt30aS/bGK4JjxCSXmzJ9OT8WZ/PZiTTSTqezKS+ZKSnTKbpShMUsairqOYwXY1slpW2bOS+tpcCyihOmpazXzmZy8stMT5vK3MyXSMp/gTUFz40TE93o83o5d+NXtuamUlF9DbvNgcfto8VqFruw4fc/wOdrx+P1cNt1iiL7On52r6OkfQOX2t/jZNO71DbUINk9SA6PMn+ZWs0SRDf6fD525O8iZX8a7W0dPOwKKHR1PVQIBHpwtd2nqDGFQ3cXcqT+LbTNyzhjXsGn5xYwbcsM1mVsoMHcSHd3j5LvMa2fiFd04qmLZ9iZ9x2h3jDhcIRQKEQ4JC56uJ+OHon8OxvIuBHP3ltzybo9j+ya+aRemsOLyVOI2zGZ1dqp3DZdEXPDjxeTu1G+hENDQ2gvnsTkNNEdChCM9OAPuNE7b5J+eQlpl2bzbWUCu67Gk/VHIucNX9PZ0UWkN0q4N0I4GCYkGBwcEsfuf7JYW6Cd1NM7WH9gIx8d/YCNxzSsPDiTtcdmsfHULD4ufJ3sax+iM1cSDPYqc9SQxZYmrZooNl/uRklSggaHBgkEuzn8Wz6zvlzE81umMWPbdBJ2xpFS8D4VtRfEffTT19c/QWA0TxQbGBgQRzA4QjQSxS45udOkU5om2N1Lf7R/xD/Q36/KkPAN1+wxYi6XS3nrx5Df3H3RPrGDUYixbB8dp0afiJHFklao1GzR4iWKMxgMjiC373h6eh75/wm5i51OF5o170wUk5E/dnlHjpKTm6dQVlau3C+v1ycW4qejo4Or138fEyOT+zejbTk5uezctVukfZR/jNh4iouL6ezsUr4Esmh5eYUwq8c+DarGGLJYIBAQO+pEEtdivP9ZUTXGkMXkOrWKT8/pggJhUo97WlSNMUpKSsRfBSvbv0kXQ/WYZ0HV+N/ApL8AkCnu0uy0fdIAAAAASUVORK5CYII=";
var installIcon = 'iVBORw0KGgoAAAANSUhEUgAAABsAAAAYCAYAAAALQIb7AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABl0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4xOdTWsmQAAAUfSURBVEhLvZZrTJNXGMfNsiz7uA9+2Id9MIu6TWd0bNMoeJmKSxRUrDGimXPLnJfgJnOCk05gjDJFwBsqNnghYtBtOCBy9QIO3bBSyqWt0Hv79maBWii9oPDfc17Sri01+7BlH345Pec8z///nnOe876dAuB/I6yza3cKckV5+DFXRLA2FDYWOR4YizaXh2/2p5FsFLOlK1bBaDTC5/PB7/f/Jzx54kDiegHJR5gtWRYPjUYLvcFIGPjWYDDBYOQmoN8Tc+Ho9AZotDqoNRr0qdToVamgUD6GXKGE2WxGwtoNk80WL1sJrVYLo4mjFXIwW8yQG9vQrm+ERNcIpUlKyVaYODOZG3nRrm45ZLIutEtlkEikaGt7FORPwkAPEt3so3jodHpYLCRoNqFBcRXlkgJckeTjans+rnUUoqrzPDoUUsg6u9FBJtKOTr4NIJP1hMEeLnFttG0kM71eDzvt8x35TZQ0H4O4uQjiewU4Vi/E7vIk7C0XoPVhK7p7lOiRB3gMhaIPnYoOSBTNaFVW4hdpLsQtQhTVCrFQsGiyGVsZKxAVp8bJukIcrz2OvBsibDohQFx2DJbnzUfD/Vr09qnpbDRQEWq1AVqDBs3q8yjv3oni9jX4qTUWglMf4P0DMZi97z3EHJyD1UdjecMwM85kRp20HkcqC/F1aTrSLwmxszgFs1LnoqKpAmoVnSmd5wRWKByNqHXsxnVuM8rUSShVrsEW8ULMSHkXc9NnY3HeO0gsmYmNZW9GmFE12qxWXGv5FXtPp6Gh9Tb0WgMsZhv6NCpahRZ2+xPYbP2wWC14YLqICn0yfjYno7p/G2r6P8WFnq1o72oDp7eAM1j4/IRoZxZH1Wiz2ZBRkonUgnT0Owbw1OnicTqf8rhcwzA5elHRnYoTj5bjTOfHEMsTcFm1Dl9dW4Y5e+YhWbQNXapuDA0N83ovKP14WKkSL1ZdxuHiH+AZ8cLr9cHj8cDroYvufYaBYQ4lD7dB1BKLo/cXI//BEhS2LUVazSK8lTILMRkzsEE8Gw+UTZTrfbEZq0Z2CcfHxyGuugClUYkhjwtu3zDsLjOkxnsQ3lyN9JqF+L4xDpm3YpH/ezyuy77D4IATvhE/vCM+eN1eeIixsXHadvs/mzlc/Ui7lIEtRdux4+zn2H5OgPXH52PzuQXYfnEBviz/EIW3v4BE1Qi3e4TPiQYzW5OYNNlsKatGjuODxsbH4HIP4eRvJVjw7UpM3zMH8/bPRdzhGKSWfYaG9ht0H+0YHX02ySAUppck2ISsrKxpjElmz58/py0YC+L3+aHnjHjYI+GLxj00guqqapSWlqKoqCiMnJwcJvxCwsxMJhP/1g/A3tyj/lFaQQjUZ5c/Ozs7qmAoh3MyQvs1QbOVq1bz1eN2u4Ow8o1keHhirqWlJSiYrJuGDc7XsNb/ChJILsAn8lkBIyfxRtCMwT52xWfO4tTpYp66unr+flmtNnoQOwYGBnDrzt1gTK5IxIsdKNmBhLGXwozWeV9FxpEDAbNdTD/MLJLKykoMDjr5LwEzra9voOG/50lkKmFigjubVoSZpdxYFzC6G4gPJkaDmblcLlrRIDi6FpHzDBKLI54x4S2q6bzR1t6ZvFFmVqab2mmB2EnJoTAzdk46+vRcKiujoehxJChk4mzbNjqm4lBBamBV+0LjwpIiqa6upr8KGhw8JKRu9BgGib5MNDEDYV56wOgPNh4aF5b0byDh1wkHM6Lt81H7dngMpvwFZFueRCQg9x4AAAAASUVORK5CYII=';
var installLink = "https://microsoft.sharepoint.com/teams/codeflow/Shared%20Documents/CodeFlowInstaller.exe";

function makeLink(prlink) {
    return " <a id='CodeFlow' href='codeflow:open?pullrequest=" + prlink 
        + "&amp;ref=EdgeExtension' aria-label='Open in CodeFlow' title='Open in CodeFlow'>"
        + "<img src='data:image/gif;base64," + codeflowIcon + "' width='27' height='24'></a>"
        + " <a id='CodeFlowInstall' href='" + installLink 
        + "' aria-label='Install CodeFlow' Title='Install CodeFlow'>"
        + "<img src='data:image/gif;base64," + installIcon + "' width='27' height='24'></a>";
}

// For individual pull request page, commits tab and checks tab
function ApplyToPullRequest() {
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
    
        var codeflowElement = document.createElement("span");
        codeflowElement.innerHTML = makeLink(prlink);
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
        var prlink = makeLink(document.URL.substring(0, document.URL.length-1) + "/" + id);
        var codeflowElement = document.createElement("span");
        codeflowElement.innerHTML = prlink;
        var statusElement = issueListHeaders[i].getElementsByClassName("commit-build-statuses");
        statusElement[0].insertAdjacentElement('beforeend', codeflowElement);
    }
    return issueListHeaders.length > 0;
}

// apply settigns if the document hasn't already been updated.
function applyLinks() {
    if (document.hasOwnProperty('codeflowApplied')) {
        return true;
    }

    var result = ApplyToPullRequest() || ApplyToPullRequestList();

    if (result == true) {
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
        setTimeout(tryUntilSuccess(), 500);
    }
}

tryUntilSuccess();

// window.onload = tryUntilSuccess;
// document.addEventListener("pageshow", tryUntilSuccess)

})();