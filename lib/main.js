var winref = null;
var currentIframe = null;
var currentURL = null;

function launchControlWindow() {
    winref = window.open("lib/control.html", "", [
        "width=550",
        "height=500",
        "centerscreen",
        "menubar=no",
        "toolbar=no",
        "location=no",
        "personalbar=no",
        "status=no",
        "resizable=yes",
        "scrollbars=yes"
    ].join(","));
    document.getElementById("main-launcher").style.display = "none";
}

function closeControlWindow() {
    if (winref && typeof winref.close == "function") winref.close();
}

function msg(cmd, data) {
    switch (cmd) {
        case "open":
            openWebsite.apply(this, data);
            break;
        case "refresh":
            refreshWebsite();
            break;
    }
}

function send(cmd, data) {
    winref && winref.postMessage(JSON.stringify({
        cmd: cmd,
        data: data
    }), "*");
}

function sendWebsite(url, title, creator, alwaysRefresh) {
    send("open", [url, title, creator, alwaysRefresh]);
    openWebsite(url, title, creator, alwaysRefresh);
}

function openWebsite(url, title, creator, alwaysRefresh) {
    currentURL = url;
    // See if an iframe for this url already exists (and hide any others)
    var foundIframe = false;
    var iframe;
    for (iframe of document.getElementsByTagName("iframe")) {
        if (iframe.getAttribute("data-url") == url) {
            foundIframe = iframe;
            iframe.style.display = "block";
        } else {
            iframe.style.display = "none";
        }
    }
    if (foundIframe) {
        iframe = foundIframe;
    } else {
        iframe = document.createElement("iframe");
        iframe.setAttribute("src", url);
        iframe.setAttribute("data-url", url);
        document.body.appendChild(iframe);
    }
    currentIframe = iframe;
    document.getElementById("main-info-title").textContent = title;
    document.getElementById("main-info-creator").textContent = "by " + creator;
    document.body.classList.remove("opened");
    if (foundIframe && alwaysRefresh == "true") refreshWebsite();
    iframe.focus();
}

function refreshWebsite() {
    if (currentIframe) {
        currentIframe.src = currentURL;
    }
}

function toggleNav() {
    document.body.classList.toggle("opened");
}

function loadWebsites(sites) {
    var ul = document.getElementById("main-ul");
    var data, li, strong, em, span;
    for (data of sites) {
        li = document.createElement("li");
        
        // title
        strong = document.createElement("span");
        strong.textContent = data.title;
        li.appendChild(strong);
        
        li.appendChild(document.createElement("br"));
        
        // creator
        em = document.createElement("em");
        em.textContent = "by " + data.creator;
        li.appendChild(em);
        
        // data
        li.setAttribute("data-title", data.title);
        li.setAttribute("data-creator", data.creator);
        li.setAttribute("data-url", data.url);
        li.setAttribute("data-alwaysRefresh", "" + !!data.alwaysRefresh);
        li.addEventListener("click", function (event) {
            sendWebsite(this.getAttribute("data-url"),
                        this.getAttribute("data-title"),
                        this.getAttribute("data-creator"),
                        this.getAttribute("data-alwaysRefresh"));
        }, false);
        
        ul.appendChild(li);
    }
}

function launchFullscreen() {
    var elem = document.body;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
    document.getElementById("main-fullscreen").style.display = "none";
}

window.addEventListener("load", function (event) {
    if (typeof title == "string") {
        document.getElementById("main-title").textContent = title;
        document.title = title;
        if (typeof subtitle == "string") {
            document.title += " - " + subtitle;
        }
    }
    if (typeof showControlWindowButton != "undefined" && showControlWindowButton) {
        document.getElementById("main-launcher").style.display = "block";
    }
    if (typeof showFullScreenButton != "undefined" && showFullScreenButton) {
        document.getElementById("main-fullscreen").style.display = "block";
    }
    window.addEventListener("message", function (event) {
        var data = JSON.parse(event.data);
        msg(data.cmd, data.data);
    }, false);
    window.addEventListener("beforeunload", function (event) {
        closeControlWindow();
    }, false);
    loadWebsites(websites);
    document.getElementById("main-fullscreen").addEventListener("click", function (event) {
        launchFullscreen();
    }, false);
    document.getElementById("main-refresh").addEventListener("click", function (event) {
        refreshWebsite();
    }, false);
    document.getElementById("main-launcher").addEventListener("click", function (event) {
        launchControlWindow();
    }, false);
    document.getElementById("main-header").addEventListener("click", function (event) {
        toggleNav();
    }, false);
    toggleNav();
}, false);

