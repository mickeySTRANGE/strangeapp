function onloadFunc() {

    const fontClassList = ["font-aboshi", "font-cherryBomb", "font-chokokutai", "font-delaGothic"];
    let fontClass = fontClassList[Math.floor(Math.random() * fontClassList.length)];
    document.getElementById("pageTitle").classList.add(fontClass);
}

if (document.readyState === 'complete') {
    onloadFunc();
} else {
    window.onload = onloadFunc;
}
