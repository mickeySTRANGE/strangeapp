class Timer extends React.Component {

    constructor() {
        super();
        this.state = {
            settingTime: 0.05 * 60 * 1000,
            settingSteps: [0.5 * 60 * 1000, 1 * 60 * 1000, 0],
            isSound: true,
            isVibrate: true,
            isNotification: false,
            startTime: 0,
            nowTime: 0,
            stepTime1: 0,
            stepTime2: 0,
            stepTime3: 0,
            finishTime: 0,
            intervalId: 0,
            timerStatus: TIMER_STATUS_SETTING
        };
    }

    onClickSoundSetting(target) {

        if (target === "sound") {
            this.setState({ isSound: !this.state.isSound });
        } else if (target === "vibrate") {
            this.setState({ isVibrate: !this.state.isVibrate });
        } else if (target === "notification") {
            this.setState({ isNotification: !this.state.isNotification });
        }
    }

    async onClickSoundTest(target) {

        if (target === "sound") {
            FINISH_SOUND.play();
        } else if (target === "vibrate") {
            navigator.vibrate([500, 500, 500, 500, 500]);
        } else if (target === "notification") {
            if (!("Notification" in window)) {
                alert("お使いのデバイスはプッシュ通知に非対応なようです。");
            } else if (Notification.permission === "granted") {
                if (navigator.serviceWorker) {
                    pushNotification("プッシュ通知のテストです。");
                }
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then((permission) => {
                    if (permission === "granted") {
                        if (navigator.serviceWorker) {
                            pushNotification("プッシュ通知のテストです。");
                        }
                    }
                });
            }
        }
    }

    startInterval() {

        const intervalId = setInterval(() => {
            const nowTime = Date.now();
            this.setState({ nowTime: nowTime });
            if (nowTime > this.state.finishTime) {
                FINISH_SOUND.play();
                navigator.vibrate([500, 500, 500, 500, 500]);
                this.onClickStop();
            }
        }, 10);
        this.setState({ intervalId: intervalId });
    }

    onClickStart() {

        const startTime = Date.now();
        let updateState = {
            startTime: startTime,
            nowTime: startTime,
            finishTime: startTime + this.state.settingTime,
            timerStatus: TIMER_STATUS_TICKING
        };
        this.setState(updateState);

        this.startInterval();
    }

    onClickPause() {

        clearInterval(this.state.intervalId);
        let updateState = {
            timerStatus: TIMER_STATUS_PAUSE
        };
        this.setState(updateState);
    }

    onClickRestart() {

        const nowTime = Date.now();
        const passedTime = this.state.nowTime - this.state.startTime;
        let updateState = {
            startTime: nowTime - passedTime,
            nowTime: nowTime,
            finishTime: nowTime - passedTime + this.state.settingTime,
            timerStatus: TIMER_STATUS_TICKING
        };
        this.setState(updateState);

        this.startInterval();
    }

    onClickStop() {

        clearInterval(this.state.intervalId);
        let updateState = {
            startTime: 0,
            nowTime: 0,
            finishTime: 0,
            intervalId: 0,
            timerStatus: TIMER_STATUS_SETTING
        };
        this.setState(updateState);
    }

    renderSoundSetting() {

        return (
            <div className="setting">
                <label className="labelForPopup" htmlFor="SoundSettingPopupCheckbox" >
                    <span class="material-symbols-outlined" style={{ "font-size": "inherit" }}>
                        settings
                    </span>
                </label>
                <input type="checkbox" id="SoundSettingPopupCheckbox" className="popupCheckbox" />
                <label className="overlay labelForPopup" htmlFor="SoundSettingPopupCheckbox">
                    <label className="labelForPopup" htmlFor="">
                        <div id="SoundSettingPopupInner">
                            <div className="settingRow">
                                <div className={`settingButton ${this.state.isSound ? "on" : "off"}`} onClick={() => this.onClickSoundSetting("sound")}>
                                    <span class="material-symbols-outlined" style={{ "font-size": "inherit" }}>
                                        {this.state.isSound ? "volume_up" : "volume_off"}
                                    </span>
                                </div>
                                <div className="testButton" onClick={() => this.onClickSoundTest("sound")}>おんせいテスト</div>
                            </div>
                            <div className="settingRow">
                                <div className={`settingButton ${this.state.isVibrate ? "on" : "off"}`} onClick={() => this.onClickSoundSetting("vibrate")}>
                                    <svg className={`vibrateSvg ${this.state.isVibrate ? "" : "hidden"}`} xmlns="http://www.w3.org/2000/svg" version="1.1" id="mdi-vibrate" width="24" height="24" viewBox="0 0 24 24"><path d="M16,19H8V5H16M16.5,3H7.5A1.5,1.5 0 0,0 6,4.5V19.5A1.5,1.5 0 0,0 7.5,21H16.5A1.5,1.5 0 0,0 18,19.5V4.5A1.5,1.5 0 0,0 16.5,3M19,17H21V7H19M22,9V15H24V9M3,17H5V7H3M0,15H2V9H0V15Z" /></svg>
                                    <svg className={`vibrateSvg ${this.state.isVibrate ? "hidden" : ""}`} xmlns="http://www.w3.org/2000/svg" version="1.1" id="mdi-vibrate-off" width="24" height="24" viewBox="0 0 24 24"><path d="M8.2,5L6.55,3.35C6.81,3.12 7.15,3 7.5,3H16.5A1.5,1.5 0 0,1 18,4.5V14.8L16,12.8V5H8.2M0,15H2V9H0V15M21,17V7H19V15.8L20.2,17H21M3,17H5V7H3V17M18,17.35L22.11,21.46L20.84,22.73L18,19.85C17.83,20.54 17.21,21 16.5,21H7.5A1.5,1.5 0 0,1 6,19.5V7.89L1.11,3L2.39,1.73L6.09,5.44L8,7.34L16,15.34L18,17.34V17.35M16,17.89L8,9.89V19H16V17.89M22,9V15H24V9H22Z" /></svg>
                                </div>
                                <div className="testButton" onClick={() => this.onClickSoundTest("vibrate")}>バイブテスト</div>
                            </div>
                            <div className="settingRow">
                                <div className={`settingButton ${this.state.isNotification ? "on" : "off"}`} onClick={() => this.onClickSoundSetting("notification")}>
                                    <span class="material-symbols-outlined" style={{ "font-size": "inherit" }}>
                                        {this.state.isNotification ? "notifications" : "notifications_off"}
                                    </span>
                                </div>
                                <div className="testButton" onClick={() => this.onClickSoundTest("notification")}>つうちテスト</div>
                            </div>
                        </div>
                    </label>
                </label>
            </div>
        );
    }

    renderClock() {

        const displayDate = this.state.timerStatus === TIMER_STATUS_SETTING
            ? new Date(this.state.settingTime)
            : new Date(this.state.finishTime - this.state.nowTime);

        const displayMinutes = displayDate.getUTCMinutes().toString().padStart(2, "0");
        const displaySeconds = displayDate.getUTCSeconds().toString().padStart(2, "0");

        const strokeDashoffset = this.state.timerStatus === TIMER_STATUS_SETTING
            ? "0px" : Math.floor(((this.state.settingTime - displayDate.valueOf()) / this.state.settingTime) * 628).toString() + "px";

        const isViewStart = this.state.timerStatus === TIMER_STATUS_SETTING;
        const isViewRestart = this.state.timerStatus === TIMER_STATUS_PAUSE;
        const isViewPause = this.state.timerStatus === TIMER_STATUS_TICKING;
        const isViewStop = this.state.timerStatus === TIMER_STATUS_TICKING || this.state.timerStatus === TIMER_STATUS_PAUSE;

        return (
            <div className="clock">
                <div id="circleArea1">
                    <div id="circleArea2">
                        <svg id="circleSvg" viewBox="0 0 210 210">
                            <circle id="circle" cx="105" cy="105" r="100" style={{ "stroke-dashoffset": strokeDashoffset }} />
                        </svg>
                    </div>
                </div>
                <div className="timerPanel">
                    <div className="time">
                        {displayMinutes}:{displaySeconds}
                    </div>
                    <div className={`${isViewStart ? "" : "hidden"}`} onClick={() => this.onClickStart()}>
                        <span className="material-symbols-outlined" style={{ "font-size": "inherit" }}>
                            play_circle
                        </span>
                    </div>
                    <div className={`${isViewRestart ? "" : "hidden"}`} onClick={() => this.onClickRestart()}>
                        <span className="material-symbols-outlined" style={{ "font-size": "inherit" }}>
                            play_circle
                        </span>
                    </div>
                    <div className={`${isViewPause ? "" : "hidden"}`} onClick={() => this.onClickPause()}>
                        <span className="material-symbols-outlined" style={{ "font-size": "inherit" }}>
                            pause_circle
                        </span>
                    </div>
                    <div className={`${isViewStop ? "" : "hidden"}`} onClick={() => this.onClickStop()}>
                        <span className="material-symbols-outlined" style={{ "font-size": "inherit" }}>
                            stop_circle
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    renderSteps() {

        let steps = [];
        this.state.settingSteps.forEach((element, index) => {
            if (element === 0) {
                steps.push(
                    <div className="step">
                        &nbsp;
                    </div>
                );
                return;
            }
            const displayDate = new Date(element);
            const displayMinutes = displayDate.getUTCMinutes().toString().padStart(2, "0");
            const displaySeconds = displayDate.getUTCSeconds().toString().padStart(2, "0");

            let bells = [];
            for (let i = 0; i < index + 1; i++) {
                bells.push(
                    <span className="material-symbols-outlined" style={{ "font-size": "inherit" }}>
                        room_service
                    </span>
                );
            }
            steps.push(
                <div className="step">
                    <div className="bells">{bells}</div>
                    <div className="stepTime">{displayMinutes}:{displaySeconds}</div>
                </div>
            );
        });

        return (
            <div className="steps">
                {steps}
            </div>
        );
    }

    render() {

        const soundSetting = this.renderSoundSetting();
        const clock = this.renderClock();
        const steps = this.renderSteps();

        return (
            <div className="timer">
                {soundSetting}
                {clock}
                {steps}
            </div>
        );
    }
}

const TIMER_STATUS_SETTING = 0;
const TIMER_STATUS_TICKING = 1;
const TIMER_STATUS_PAUSE = 2;

const BELL_SOUND = new Audio("sound/bell.mp3");
const FINISH_SOUND = new Audio("sound/finish.mp3");

/**
 * for popup
 */
class Popup extends React.Component {
    render() {
        return (
            <div>
                <label className="labelForPopup" htmlFor={this.props.id + 'Checkbox'}
                    dangerouslySetInnerHTML={{ __html: this.props.triggerHtml }} />
                <input type="checkbox" id={this.props.id + 'Checkbox'} className="popupCheckbox" />
                <label className="overlay labelForPopup" htmlFor={this.props.id + 'Checkbox'}
                    dangerouslySetInnerHTML={{ __html: this.props.innerHtml }} />
            </div>
        );
    }
}

async function pushNotification(message) {
    const register = await window.navigator.serviceWorker.register("js/service-worker.js");
    await register.update();
    register.active.postMessage(message);
}

function onloadFunc() {

    /**
     * trigger main
     */
    const root = ReactDOM.createRoot(document.getElementsByTagName("main")[0]);
    root.render(<Timer />);

    /**
     * for master link
     */
    const fontClassList = ["font-aoboshi", "font-cherryBomb", "font-chokokutai", "font-delaGothic"];
    let fontClass = fontClassList[Math.floor(Math.random() * fontClassList.length)];
    document.getElementById("masterlink").classList.add(fontClass);

    /**
     * for popup
     */
    const popupContainers = document.getElementsByClassName('popupContainer');
    for (let key in popupContainers) {
        if (popupContainers.hasOwnProperty(key)) {
            const popupTrigger = document.getElementById(popupContainers[key].id + 'Trigger');
            const popupInner = document.getElementById(popupContainers[key].id + 'Inner');
            const target = ReactDOM.createRoot(popupContainers[key]);
            target.render(<Popup id={popupContainers[key].id} triggerHtml={popupTrigger.outerHTML}
                innerHtml={popupInner.outerHTML} />);
        }
    }
}

if (document.readyState === 'complete') {
    onloadFunc();
} else {
    window.onload = onloadFunc;
}