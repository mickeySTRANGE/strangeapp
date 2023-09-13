function onloadFunc() {

    /**
     * trigger main
     */
    // const root = ReactDOM.createRoot(document.getElementsByTagName("main")[0]);
    // root.render(<Timer />);

    /**
     * for master link
     */
    const fontClassList = ["font-aoboshi", "font-cherryBomb", "font-chokokutai", "font-delaGothic"];
    let fontClass = fontClassList[Math.floor(Math.random() * fontClassList.length)];
    document.getElementById("masterlink").classList.add(fontClass);

    /**
     * version
     */
    const request = new Request(
        "version.txt",
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
                    document.getElementById("version").innerText = "v" + responseText;
                    document.getElementById("dummy").innerText = "v" + responseText;
                }
            );
        }
    );
}

if (document.readyState === 'complete') {
    onloadFunc();
} else {
    window.onload = onloadFunc;
}
