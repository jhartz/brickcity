function msg(cmd, data) {
    switch (cmd) {
        case "open":
            openWebsite.apply(this, data);
            break;
    }
}

function send(cmd, data) {
    window.opener.postMessage(JSON.stringify({
        cmd: cmd,
        data: data
    }), "*");
}

function loadWebsites(sites) {
    var ul = document.getElementById("control-ul");
    var data, li, strong, em, span;
    for (data of sites) {
        li = document.createElement("li");
        
        // title
        strong = document.createElement("strong");
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

function sendWebsite(url, title, creator, alwaysRefresh) {
    send("open", [url, title, creator, alwaysRefresh]);
    openWebsite(url, title, creator, alwaysRefresh);
}

function openWebsite(url, title, creator, alwaysRefresh) {
    document.getElementById("control-info-title").textContent = title;
    document.getElementById("control-info-creator").textContent = creator;
    var li;
    for (li of document.getElementById("control-ul").getElementsByTagName("li")) {
        li.classList.toggle("current", li.getAttribute("data-url") == url);
    }
}

window.addEventListener("load", function (event) {
    if (typeof title == "string") {
        document.getElementById("control-title").textContent = title;
        document.title = title;
        if (typeof subtitle == "string") {
            document.title += " - " + subtitle;
        }
    }
    window.addEventListener("message", function (event) {
        var data = JSON.parse(event.data);
        msg(data.cmd, data.data);
    }, false);
    document.getElementById("control-refresh").addEventListener("click", function (event) {
        send("refresh", []);
    }, false);
    loadWebsites(websites);
}, false);

