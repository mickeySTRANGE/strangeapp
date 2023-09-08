class TimePicker extends React.Component {

    onClickMinute(number) {

        const minutesDiv = document.getElementById(`timePicker${this.props.id}Minutes`);
        const secondsDiv = document.getElementById(`timePicker${this.props.id}Seconds`);

        let minutes = Number(minutesDiv.innerText);
        let seconds = Number(secondsDiv.innerText);

        minutes += number;
        if (minutes > 59) {
            minutes = 60;
            seconds = 0;
        } else if (minutes < 0) {
            minutes = 0;
            seconds = 0;
        }
        minutesDiv.innerText = minutes.toString().padStart(2, "0");
        secondsDiv.innerText = seconds.toString().padStart(2, "0");
    }

    onClickSecond(number) {

        const minutesDiv = document.getElementById(`timePicker${this.props.id}Minutes`);
        const secondsDiv = document.getElementById(`timePicker${this.props.id}Seconds`);

        let minutes = Number(minutesDiv.innerText);
        let seconds = Number(secondsDiv.innerText);

        seconds += number;
        if (seconds > 59) {
            minutes += 1;
            seconds -= 60;
        } else if (seconds < 0) {
            minutes -= 1;
            seconds += 60;
        }
        if (minutes > 59) {
            minutes = 60;
            seconds = 0;
        } else if (minutes < 0) {
            minutes = 0;
            seconds = 0;
        }

        minutesDiv.innerText = minutes.toString().padStart(2, "0");
        secondsDiv.innerText = seconds.toString().padStart(2, "0");
    }

    onClickDone() {
        const minutesDiv = document.getElementById(`timePicker${this.props.id}Minutes`);
        const secondsDiv = document.getElementById(`timePicker${this.props.id}Seconds`);

        let minutes = minutesDiv.innerText;
        let seconds = secondsDiv.innerText;

        this.props.onClickDone(minutes, seconds);
    }

    render() {

        return (
            <div className="timePicker">
                <div className="timePickerHeader">
                    {this.props.header}
                </div>
                <div className="timePickerArea">
                    <div className="timePickerMinutesArea">
                        <div className="timePickerButtonArea">
                            <div className="timePickerButton up" onClick={() => this.onClickMinute(10)}>
                                <GoogleIcon name="stat_2" />
                            </div>
                            <div className="timePickerButton up" onClick={() => this.onClickMinute(1)}>
                                <GoogleIcon name="stat_1" />
                            </div>
                        </div>
                        <div id={`timePicker${this.props.id}Minutes`}>
                            {this.props.displayMinutes}
                        </div>
                        <div className="timePickerButtonArea">
                            <div className="timePickerButton down" onClick={() => this.onClickMinute(-10)}>
                                <GoogleIcon name="stat_minus_2" />
                            </div>
                            <div className="timePickerButton down" onClick={() => this.onClickMinute(-1)}>
                                <GoogleIcon name="stat_minus_1" />
                            </div>
                        </div>
                    </div>
                    <div>
                        :
                    </div>
                    <div className="timePickerSecondsArea">
                        <div className="timePickerButtonArea">
                            <div className="timePickerButton up" onClick={() => this.onClickSecond(10)}>
                                <GoogleIcon name="stat_2" />
                            </div>
                            <div className="timePickerButton up" onClick={() => this.onClickSecond(1)}>
                                <GoogleIcon name="stat_1" />
                            </div>
                        </div>
                        <div id={`timePicker${this.props.id}Seconds`}>
                            {this.props.displaySeconds}
                        </div>
                        <div className="timePickerButtonArea">
                            <div className="timePickerButton down" onClick={() => this.onClickSecond(-10)}>
                                <GoogleIcon name="stat_minus_2" />
                            </div>
                            <div className="timePickerButton down" onClick={() => this.onClickSecond(-1)}>
                                <GoogleIcon name="stat_minus_1" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="timePickerOk" onClick={() => this.onClickDone()}>
                    <GoogleIcon name="done" />
                </div>
            </div>
        );
    }
}


class Timer extends React.Component {

    constructor() {
        super();
        this.state = {
            settingTime: 10 * 60 * 1000,
            settingSteps: [5 * 60 * 1000, 8 * 60 * 1000, 0],
            isSound: true,
            isVibrate: true,
            isNotification: false,
            startTime: 0,
            nowTime: 0,
            stepTimes: Array(3).fill(0),
            finishTime: 0,
            intervalId: 0,
            timerStatus: TIMER_STATUS_SETTING
        };
    }

    calcDisplay(time) {
        const displayDate = new Date(time);
        if (time === 60 * 60 * 1000) {
            return ["60", "00"];
        } else {
            const displayMinutes = displayDate.getUTCMinutes().toString().padStart(2, "0");
            const displaySeconds = displayDate.getUTCSeconds().toString().padStart(2, "0");
            return [displayMinutes, displaySeconds];
        }
    }

    onClickSoundSetting(target) {

        if (target === "sound") {
            this.setState({ isSound: !this.state.isSound });
        } else if (target === "vibrate") {
            this.setState({ isVibrate: !this.state.isVibrate });
        } else if (target === "notification") {
            this.setState({ isNotification: isAvailablePush() && !this.state.isNotification });
        }
    }

    async onClickSoundTest(target) {

        if (target === "sound") {
            FINISH_SOUND.play();
        } else if (target === "vibrate") {
            navigator.vibrate([500, 500, 500, 500, 500]);
        } else if (target === "notification") {
            if (isAvailablePush()) {
                pushNotification("プッシュ通知のテストです。");
            }
        }
    }

    notify(index) {

        if (index === -1) {
            if (this.state.isSound) {
                FINISH_SOUND.play();
            }
            if (this.state.isVibrate) {
                navigator.vibrate([500, 500, 500, 500, 500]);
            }
            if (this.state.isNotification) {
                const [displayMinutes, displaySeconds] = this.calcDisplay(this.state.settingTime);
                pushNotification(displayMinutes + ":" + displaySeconds);
            }
        } else {
            if (this.state.isSound) {
                BELL_SOUND[index].play();
            }
            if (this.state.isVibrate) {
                let pattern = [250];
                for (let i = 0; i < index; i++) {
                    pattern.push(0);
                    pattern.push(250);
                }
                navigator.vibrate(pattern);
            }
            if (this.state.isNotification) {
                const [displayMinutes, displaySeconds] = this.calcDisplay(this.state.settingSteps[index]);
                pushNotification(displayMinutes + ":" + displaySeconds);
            }
        }
    }

    startInterval() {

        const intervalId = setInterval(() => {
            const nowTime = Date.now();
            this.setState({ nowTime: nowTime });

            for (let i = 0; i < this.state.settingSteps.length; i++) {
                if (nowTime > this.state.stepTimes[i] && this.state.stepTimes[i] > 0) {
                    let steps = this.state.stepTimes.slice();
                    steps[i] = 0;
                    this.setState({ stepTimes: steps });
                    this.notify(i);
                }
            }

            if (nowTime > this.state.finishTime) {
                this.onClickStop();
                this.notify(-1);
            }
        }, 10);
        this.setState({ intervalId: intervalId });
    }

    onClickStart() {

        if (this.state.settingTime === 0) {
            alert("タイマーの時間を設定してください。");
            return;
        }

        const startTime = Date.now();
        let stepTimes = [];
        for (let i = 0; i < this.state.settingSteps.length; i++) {
            stepTimes.push(this.state.settingSteps[i] === 0 ? 0 : startTime + this.state.settingSteps[i]);
        }

        let updateState = {
            startTime: startTime,
            nowTime: startTime,
            stepTimes: stepTimes,
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
        let stepTimes = [];
        for (let i = 0; i < this.state.settingSteps.length; i++) {
            stepTimes.push(this.state.stepTimes[i] === 0 ? 0 : nowTime - passedTime + this.state.settingSteps[i]);
        }

        let updateState = {
            startTime: nowTime - passedTime,
            nowTime: nowTime,
            stepTimes: stepTimes,
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
            stepTimes: Array(3).fill(0),
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
                    <GoogleIcon name="settings" />
                </label>
                <input type="checkbox" id="SoundSettingPopupCheckbox" className="popupCheckbox" />
                <label className="overlay labelForPopup" htmlFor="SoundSettingPopupCheckbox">
                    <label className="labelForPopup" htmlFor="">
                        <div id="SoundSettingPopupInner">
                            <div className="settingRow">
                                <div className={`settingButton ${this.state.isSound ? "on" : "off"}`} onClick={() => this.onClickSoundSetting("sound")}>
                                    <GoogleIcon name={this.state.isSound ? "volume_up" : "volume_off"} />
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
                                    <GoogleIcon name={this.state.isNotification ? "notifications" : "notifications_off"} />
                                </div>
                                <div className="testButton" onClick={() => this.onClickSoundTest("notification")}>つうちテスト</div>
                            </div>
                        </div>
                    </label>
                </label>
            </div>
        );
    }

    reflectTimePicker(minutes, seconds, index) {

        const time = (Number(minutes) * 60 + Number(seconds)) * 1000;
        if (index === -1) {
            this.setState({ settingTime: time });
            document.getElementById("TimerSettingPopupCheckbox").checked = false;
        } else {
            let steps = this.state.settingSteps.slice();
            steps[index] = time;
            steps.sort((a, b) => {
                if (a === 0) {
                    return 1;
                }
                if (b === 0) {
                    return -1;
                }
                return a - b;
            });
            this.setState({ settingSteps: steps });
            document.getElementById(`Step${index}SettingPopupCheckbox`).checked = false;
        }
    }

    renderClock() {

        const displayTime = this.state.timerStatus === TIMER_STATUS_SETTING ? this.state.settingTime : this.state.finishTime - this.state.nowTime;
        const displayDate = new Date(displayTime);
        const [displayMinutes, displaySeconds] = this.calcDisplay(displayTime);

        const strokeDashoffset = this.state.timerStatus === TIMER_STATUS_SETTING
            ? "0px" : Math.floor(((this.state.settingTime - displayDate.valueOf()) / this.state.settingTime) * 628).toString() + "px";

        const isViewStart = this.state.timerStatus === TIMER_STATUS_SETTING;
        const isViewRestart = this.state.timerStatus === TIMER_STATUS_PAUSE;
        const isViewPause = this.state.timerStatus === TIMER_STATUS_TICKING;
        const isViewStop = this.state.timerStatus === TIMER_STATUS_TICKING || this.state.timerStatus === TIMER_STATUS_PAUSE;

        const timerSvg = (
            <svg className="timerSvg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,4a9,9,0,1,0,9,9A9,9,0,0,0,12,4Zm0,16a7,7,0,1,1,7-7A7,7,0,0,1,12,20ZM21.19,3.81A12.88,12.88,0,0,0,17.06,1l-.78,1.84a11.08,11.08,0,0,1,3.5,2.36,11.43,11.43,0,0,1,1.87,2.49l1.75-1A13.19,13.19,0,0,0,21.19,3.81Zm-13.47-1L6.94,1A12.88,12.88,0,0,0,2.81,3.81,13.19,13.19,0,0,0,.6,6.74l1.75,1A11.43,11.43,0,0,1,4.22,5.22,11.08,11.08,0,0,1,7.72,2.86ZM13,8H11v6h5V12H13Z" /></svg>
        );

        return (
            [
                <div className="clock">
                    <div id="circleArea1">
                        <div id="circleArea2">
                            <svg id="circleSvg" viewBox="0 0 210 210">
                                <circle id="circle" cx="105" cy="105" r="100" style={{ "stroke-dashoffset": strokeDashoffset }} />
                            </svg>
                        </div>
                    </div>
                    <div className="timerPanel">
                        {timerSvg}
                        <label className="time" htmlFor="TimerSettingPopupCheckbox">
                            {displayMinutes}:{displaySeconds}
                        </label>
                        <div className={`${isViewStart ? "" : "hidden"}`} onClick={() => this.onClickStart()}>
                            <GoogleIcon name="play_circle" />
                        </div>
                        <div className={`${isViewRestart ? "" : "hidden"}`} onClick={() => this.onClickRestart()}>
                            <GoogleIcon name="play_circle" />
                        </div>
                        <div className={`${isViewPause ? "" : "hidden"}`} onClick={() => this.onClickPause()}>
                            <GoogleIcon name="pause_circle" />
                        </div>
                        <div className={`${isViewStop ? "" : "hidden"}`} onClick={() => this.onClickStop()}>
                            <GoogleIcon name="stop_circle" />
                        </div>
                    </div>
                </div>,
                <div>
                    <Popup
                        popupId="TimerSetting"
                        content={
                            <TimePicker
                                id="timer"
                                displayMinutes={displayMinutes}
                                displaySeconds={displaySeconds}
                                header={timerSvg}
                                onClickDone={(minutes, seconds) => this.reflectTimePicker(minutes, seconds, -1)} />
                        } />
                </div>
            ]
        );
    }

    renderSteps() {

        let steps = [];
        let isFirstZeroStep = true;
        this.state.settingSteps.forEach((element, index) => {
            if (element === 0 && !isFirstZeroStep) {
                steps.push(
                    <div className="step">
                        &nbsp;
                    </div>
                );
                return;
            }

            let [displayMinutes, displaySeconds] = this.calcDisplay(element);
            let pickerDisplayMinutes = displayMinutes;
            let pickerDisplaySeconds = displaySeconds;
            if (element === 0) {
                isFirstZeroStep = false;
                displayMinutes = "--";
                displaySeconds = "--";
            }

            let bells = [];
            for (let i = 0; i < index + 1; i++) {
                bells.push(
                    <GoogleIcon name="room_service" />
                );
            }
            steps.push(
                <label className="step" htmlFor={`Step${index}SettingPopupCheckbox`}>
                    <div className={`bells ${element === 0 ? "disableStep" : ""}`}>
                        {bells}
                    </div>
                    <div className={`stepTime ${element === 0 ? "disableStep" : ""}`}>
                        {displayMinutes}:{displaySeconds}
                    </div>
                    <label className={`${element === 0 ? "hiddenIcon" : "disableStep"}`}
                        htmlFor="" onClick={() => this.reflectTimePicker(0, 0, index)}>
                        <GoogleIcon name="delete" />
                    </label>
                    <Popup
                        popupId={`Step${index}Setting`}
                        content={
                            <TimePicker
                                id={`step${index}`}
                                displayMinutes={pickerDisplayMinutes}
                                displaySeconds={pickerDisplaySeconds}
                                header={bells}
                                onClickDone={(minutes, seconds) => this.reflectTimePicker(minutes, seconds, index)} />
                        } />
                </label>
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

const BELL_SOUND = [
    new Audio("sound/bell1.mp3"),
    new Audio("sound/bell2.mp3"),
    new Audio("sound/bell3.mp3")
];
const FINISH_SOUND = new Audio("sound/finish.mp3");

/**
 * for popup
 */
class Popup extends React.Component {
    render() {
        return (
            [
                <input type="checkbox" id={`${this.props.popupId}PopupCheckbox`} className="popupCheckbox" />,
                <label className="overlay labelForPopup" htmlFor={`${this.props.popupId}PopupCheckbox`}>
                    <label className="labelForPopup" htmlFor="">
                        <div id={`${this.props.popupId}PopupInner`}>
                            {this.props.content}
                        </div>
                    </label>
                </label>
            ]
        );
    }
}

class GoogleIcon extends React.Component {
    render() {
        let size = "inherit";
        if (typeof this.props.size !== "undefined") {
            size = this.props.size;
        }
        return (
            <span className="material-symbols-outlined" style={{ "font-size": size }}>
                {this.props.name}
            </span>
        );
    }
}

function isAvailablePush() {

    if (!("Notification" in window)) {
        alert("お使いのデバイスはプッシュ通知に非対応なようです。");
        return false;
    } else if (Notification.permission === "granted") {
        return true;
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                return true;
            }
            return false;
        });
    } else if (Notification.permission === "denied") {
        alert("プッシュ通知の権限を確認してください。");
        return false;
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