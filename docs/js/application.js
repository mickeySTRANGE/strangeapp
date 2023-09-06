function onloadFunc() {

    const fontClassList = ["font-aoboshi", "font-cherryBomb", "font-chokokutai", "font-delaGothic"];
    let fontClass = fontClassList[Math.floor(Math.random() * fontClassList.length)];
    document.getElementById("pageTitle").classList.add(fontClass);

    setAppVersion();
}

function setAppVersion() {
    const versionUrlList = [
        {
            url: "https://mushi-deck-simulator-ef2b6bec2ae8.herokuapp.com/GetApplicationVersion",
            id: "mushiDeckSimulatorVersion"
        },
        {
            url: "https://new-book-notice.herokuapp.com/GetApplicationVersion",
            id: "newBookNoticeVersion"
        }
    ];

    versionUrlList.forEach(element => {
        const request = new Request(
            element.url,
            {
                method: "GET"
            });
        fetch(request).then(
            function (response) {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                response.text().then(
                    function (responseText) {
                        document.getElementById(element.id).innerText = "v" + responseText;
                    }
                );
            }
        );
    });

}

if (document.readyState === 'complete') {
    onloadFunc();
} else {
    window.onload = onloadFunc;
}
