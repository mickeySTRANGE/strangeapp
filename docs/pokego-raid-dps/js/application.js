const RAID_TARGET_LIST = ["ゲノセクト(ブレイズカセット)"];

class Calculator extends React.Component {

    constructor() {
        super();

        const initTarget = "ゲノセクト(ブレイズカセット)";
        this.state = {
            targetName: initTarget,
            filterText: "",
            options: POKEMON_DATA.slice(),
            isExcludeMegaEvolved: true,
            isExcludeShadowApex: true
        };
    }

    onChangePokemonFilterText() {
        const text = document.getElementById("pokemonFilterText").value;

        const options = [];
        let targetName = "";

        POKEMON_DATA.forEach(pokemon => {
            if (text !== "" && pokemon.name.indexOf(text) === -1) {
                return;
            }
            if (this.state.targetName === pokemon.name) {
                targetName = this.state.targetName;
            }
            options.push(pokemon);
        });

        if (targetName === "" && options.length > 0) {
            targetName = options[0].name;
        }

        this.setState({
            targetName: targetName,
            filterText: text,
            options: options
        });
    }

    onChangePokemonSelect() {
        const target = document.getElementById("pokemonSelect").value;
        this.setState({ targetName: target });
    }

    renderSearchArea() {

        const options = [];
        this.state.options.forEach(pokemon => {
            if (this.state.targetName === pokemon.name) {
                options.push(<option value={pokemon.name} selected>{pokemon.name}</option>);
            } else {
                options.push(<option value={pokemon.name} >{pokemon.name}</option>);
            }
        });

        return (
            <div id="searchArea">
                <div className="areaTitle">
                    レイドボスの選択
                </div>
                <div className="areaRow">
                    <div style={{ "width": "35%" }}>
                        絞り込み：
                    </div>
                    <input
                        type="text"
                        id="pokemonFilterText"
                        value={this.state.filterText}
                        onChange={() => this.onChangePokemonFilterText()}
                        style={{ "font-family": "'RocknRoll One', sans-serif", "width": "65%" }} />
                </div>
                <div className="areaRow">
                    <div style={{ "width": "35%" }}>
                        選択：
                    </div>
                    <select
                        id="pokemonSelect"
                        onChange={() => this.onChangePokemonSelect()}
                        style={{ "font-family": "'RocknRoll One', sans-serif", "width": "65%" }}>
                        {options}
                    </select>
                </div>
            </div>
        );
    }

    onClickConfigCheckbox(target) {
        if (target === "megaEvolved") {
            this.setState({ isExcludeMegaEvolved: !this.state.isExcludeMegaEvolved });
        } else if (target === "shadowApex") {
            this.setState({ isExcludeShadowApex: !this.state.isExcludeShadowApex });
        }
    }

    renderConfigArea() {

        return (
            <div id="configArea">
                <div className="areaTitle">
                    詳細設定
                </div>
                <div className="areaRow" onClick={() => this.onClickConfigCheckbox("megaEvolved")} >
                    {this.state.isExcludeMegaEvolved ? <GoogleIcon name="check_box" /> : <GoogleIcon name="check_box_outline_blank" />}
                    メガシンカポケモンを除く
                </div>
                <div className="areaRow" onClick={() => this.onClickConfigCheckbox("shadowApex")} >
                    {this.state.isExcludeShadowApex ? <GoogleIcon name="check_box" /> : <GoogleIcon name="check_box_outline_blank" />}
                    シャドウAPEX専用技を除く
                </div>
            </div >
        );
    }

    renderResult() {

        const dpsList = this.calc();

        const resultList = [];
        dpsList.forEach((dps, index) => {
            const checkboxTarget = Math.floor(index / 20) * 20 + 1;
            if (index % 20 === 0 && index !== 0) {
                const lastCount = Math.min(checkboxTarget + 19, dpsList.length + 1);
                resultList.push(<input type="checkbox" id={`resultViewCheckbox${checkboxTarget}`} className="hidden" />);
                resultList.push(
                    <label htmlFor={`resultViewCheckbox${checkboxTarget}`} className={`resultViewOnButton${checkboxTarget}`}>
                        {checkboxTarget}位～{lastCount}位を表示
                    </label>
                );
            }
            resultList.push(<ResultOne dps={dps} rank={index + 1} maxdps={dpsList[0].dps} checkboxTarget={checkboxTarget} />);
            if (index % 20 === 19 && index !== 19) {
                resultList.push(
                    <label htmlFor={`resultViewCheckbox${checkboxTarget}`} className={`resultViewOffButton${checkboxTarget}`}>
                        {checkboxTarget}位～{checkboxTarget + 19}位を非表示
                    </label>
                );
            }
        });
        if (dpsList.length % 20 !== 0) {
            const checkboxTarget = Math.floor(dpsList.length / 20) * 20 + 1;
            resultList.push(
                <label htmlFor={`resultViewCheckbox${checkboxTarget}`} className={`resultViewOffButton${checkboxTarget}`}>
                    {checkboxTarget}位～{dpsList.length}位を非表示
                </label>
            );
        }

        return (
            <div id="resultArea">
                {resultList}
            </div>
        );
    }

    render() {

        const jsxArray = [];

        jsxArray.push(this.renderSearchArea());
        jsxArray.push(this.renderConfigArea());
        jsxArray.push(this.renderResult());

        return jsxArray;
    }

    calc() {
        if (this.state.targetName === "") {
            return [];
        }
        const start = Date.now();

        const target = getPokemonData(this.state.targetName);

        let dpsList = [];
        POKEMON_DATA.forEach(attackerData => {
            // 最大CP2000以下はどうせ結果ふるわないのでスキップ
            if (attackerData.cp < 2000) {
                return;
            }

            if (this.state.isExcludeMegaEvolved && isMegaEvolved(attackerData.name)) {
                return;
            }

            let normalAttack = null;
            let specialAttack = null;
            let dps = -1;

            // ノーマルアタックとスペシャルアタックのクロスジョインで各DPSを計算する
            attackerData.normalAttack.forEach(currentNormalAttack => {
                const currentNormalAttackData = getAttackData(currentNormalAttack);
                const normalDamage = calcOnceDamage(attackerData, target, currentNormalAttackData);
                attackerData.specialAttack.forEach(currentSpecialAttack => {
                    if (this.state.isExcludeShadowApex && isShadowApex(currentSpecialAttack)) {
                        return;
                    }
                    const currentSpecialAttackData = getAttackData(currentSpecialAttack);
                    const specialDamage = calcOnceDamage(attackerData, target, currentSpecialAttackData);
                    let currentDps = 0;
                    if (currentSpecialAttackData.gauge === 1) {
                        // スペシャルアタック1回分を計算
                        const normalCount = Math.floor(100 / currentNormalAttackData.epTank) + 1;
                        const totalDamage = normalDamage * normalCount + specialDamage;
                        const totalTime = currentNormalAttackData.time * normalCount + currentSpecialAttackData.time;
                        currentDps = totalDamage / totalTime;
                    } else {
                        // ノーマルアタック100回分のゲージを消費するまでを計算
                        const specialAttackCount = currentNormalAttackData.epTank * currentSpecialAttackData.gauge;
                        const totalDamage = normalDamage * 100 + specialDamage * specialAttackCount;
                        const totalTime = currentNormalAttackData.time * 100 + currentSpecialAttackData.time * specialAttackCount;
                        currentDps = totalDamage / totalTime;
                    }
                    if (currentDps > dps) {
                        normalAttack = currentNormalAttackData;
                        specialAttack = currentSpecialAttackData;
                        dps = currentDps;
                    }
                });
            });

            dpsList.push(
                {
                    attackerData: attackerData,
                    normalAttackData: normalAttack,
                    specialAttackData: specialAttack,
                    dps: dps
                }
            );
        });

        dpsList.sort(function (a, b) {
            return b.dps - a.dps;
        });

        const millis = Date.now() - start;
        console.log(`${this.state.targetName}:${millis}ms`);
        return dpsList;
    }
}

class ResultOne extends React.Component {

    render() {

        const attacker = this.props.dps.attackerData;
        const dpsData = this.props.dps;

        const rank = (
            <div className="resultRank">
                {this.props.rank === 1 ? <IconCrown color="gold" /> : ""}
                {this.props.rank === 2 ? <IconCrown color="silver" /> : ""}
                {this.props.rank === 3 ? <IconCrown color="peru" /> : ""}
                {this.props.rank}
                :
                <Type type={attacker.types[0]} />
                {attacker.types.length === 2 ? <Type type={attacker.types[1]} /> : ""}
                {attacker.name}
            </div>
        );

        const status = (
            <div className="resultStatus">
                <div>
                    (H{attacker.hp}-A{attacker.attack}-D{attacker.defense})
                </div>
            </div>
        );

        const attacks = (
            <div className="resultAttacks">
                <div className="resultAttacksList">
                    <div>わざ</div>
                    <div className="attack">
                        <Type type={dpsData.normalAttackData.type} />{dpsData.normalAttackData.name}
                    </div>
                    <div>
                        <Type type={dpsData.specialAttackData.type} />{dpsData.specialAttackData.name}
                    </div>
                </div>
                <div className="resultAttacksDps">
                    <div>DPS(1位比)</div>
                    <div>
                        {formatNumberDisplay(dpsData.dps)}<br />
                    </div>
                    <div>
                        ({formatNumberDisplay(dpsData.dps * 100 / this.props.maxdps)}%)
                    </div>
                </div>
                <div>&nbsp;</div>
            </div>
        );

        return (
            <div className={`result resultView${this.props.checkboxTarget}`}>
                {rank}
                {status}
                {attacks}
            </div>
        );
    }
}

class IconCrown extends React.Component {

    render() {

        const height = typeof this.props.height === "undefined" ? "1em" : this.props.height;

        return (
            <svg style={{ fill: this.props.color, height: height }} width="24" height="24" viewBox="0 0 24 24"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" /></svg>
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

class Type extends React.Component {

    render() {

        const height = typeof this.props.height === "undefined" ? "1em" : this.props.height;

        // return (
        //     <span style={{ "background-color": getTypeData(this.props.type).color, "border-radius": "1vh" }}>{this.props.type}</span>
        // );
        return (
            <img height="90" width="90" style={{ height: height, width: height }} src={`images/types/${getTypeData(this.props.type).index}.jpg`} />
        );
    }
}

function calcOnceDamage(attacker, receiver, move) {

    const statusRatio = ((attacker.attack + 15) * 0.8403) / ((receiver.defense + 15) * 0.7903);

    let typeEffectiveness = getTypeCompatibility(move.type, receiver.types[0]);
    if (receiver.types.length === 2) {
        typeEffectiveness += getTypeCompatibility(move.type, receiver.types[1]);
    }
    const typeEffectivenessNumber = Math.pow(1.6, typeEffectiveness);

    const sameTypeAttackBonus = typeof attacker.types.find(element => element === move.type) === "undefined" ? 1 : 1.2;

    return Math.floor(0.5 * move.power * statusRatio * typeEffectivenessNumber * sameTypeAttackBonus) + 1;
}


function getTypeCompatibility(attackType, receiveType) {
    return TYPE_CHART[getTypeData(attackType).index][getTypeData(receiveType).index];

}

function getPokemonData(name) {
    return POKEMON_DATA.find(element => element.name === name);
}

function getAttackData(name) {
    return ATTACK_DATA.find(element => element.name === name);
}

function getTypeData(name) {
    return TYPES.find(element => element.name === name);
}

function formatNumberDisplay(number) {
    return Math.floor(number * 100) / 100;
}

function isMegaEvolved(name) {
    const megaPrefix = name.slice(0, 2);
    if (megaPrefix === "メガ") {
        const megaSuffix = name.slice(2);
        if (typeof getPokemonData(megaSuffix) !== "undefined") {
            return true;
        }
        const megaSuffix2 = megaSuffix.slice(-1);
        if (megaSuffix2 === "X" || megaSuffix2 === "Y") {
            const leftover = megaSuffix.slice(0, -1);
            if (typeof getPokemonData(leftover) !== "undefined") {
                return true;
            }
        }
    }
    const genshiPrefix = name.slice(0, 3);
    if (genshiPrefix === "ゲンシ") {
        const suffix = name.slice(3);
        if (typeof getPokemonData(suffix) !== "undefined") {
            return true;
        }
    }
    return false;
}

function isShadowApex(name) {
    if (name === "せいなるほのお++"
        || name === "せいなるほのお+"
        || name === "エアロブラスト++"
        || name === "エアロブラスト+") {
        return true;
    }
    return false;
}

function onloadFunc() {

    /**
                * trigger main
                */
    const reactRoot = ReactDOM.createRoot(document.getElementById("Calculator"));
    reactRoot.render(<Calculator />);

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


const TYPE_INDEX_NORMAL = 0;
const TYPE_INDEX_FIRE = 1;
const TYPE_INDEX_WATER = 2;
const TYPE_INDEX_ELECTRIC = 3;
const TYPE_INDEX_GRASS = 4;
const TYPE_INDEX_ICE = 5;
const TYPE_INDEX_FIGHTING = 6;
const TYPE_INDEX_POISON = 7;
const TYPE_INDEX_GROUND = 8;
const TYPE_INDEX_FLYING = 9;
const TYPE_INDEX_PSYCHIC = 10;
const TYPE_INDEX_BUG = 11;
const TYPE_INDEX_ROCK = 12;
const TYPE_INDEX_GHOST = 13;
const TYPE_INDEX_DRAGON = 14;
const TYPE_INDEX_DARK = 15;
const TYPE_INDEX_STEEL = 16;
const TYPE_INDEX_FAIRY = 17;

const TYPES = [
    {
        name: "ノーマル",
        index: TYPE_INDEX_NORMAL,
        color: "#939AA0"
    },
    {
        name: "ほのお",
        index: TYPE_INDEX_FIRE,
        color: "#F2A261"
    },
    {
        name: "みず",
        index: TYPE_INDEX_WATER,
        color: "#5E8FD0"
    },
    {
        name: "でんき",
        index: TYPE_INDEX_ELECTRIC,
        color: "#EFD35B"
    },
    {
        name: "くさ",
        index: TYPE_INDEX_GRASS,
        color: "#5FB954"
    },
    {
        name: "こおり",
        index: TYPE_INDEX_ICE,
        color: "#8BCDC2"
    },
    {
        name: "かくとう",
        index: TYPE_INDEX_FIGHTING,
        color: "#BF4B6A"
    },
    {
        name: "どく",
        index: TYPE_INDEX_POISON,
        color: "#A566C6"
    },
    {
        name: "じめん",
        index: TYPE_INDEX_GROUND,
        color: "#CC7D51"
    },
    {
        name: "ひこう",
        index: TYPE_INDEX_FLYING,
        color: "#95A8DA"
    },
    {
        name: "エスパー",
        index: TYPE_INDEX_PSYCHIC,
        color: "#E77678"
    },
    {
        name: "むし",
        index: TYPE_INDEX_BUG,
        color: "#9DC14A"
    },
    {
        name: "いわ",
        index: TYPE_INDEX_ROCK,
        color: "#C4B890"
    },
    {
        name: "ゴースト",
        index: TYPE_INDEX_GHOST,
        color: "#5768A7"
    },
    {
        name: "ドラゴン",
        index: TYPE_INDEX_DRAGON,
        color: "#2E67BB"
    },
    {
        name: "あく",
        index: TYPE_INDEX_DARK,
        color: "#595365"
    },
    {
        name: "はがね",
        index: TYPE_INDEX_STEEL,
        color: "#60899B"
    },
    {
        name: "フェアリー",
        index: TYPE_INDEX_FAIRY,
        color: "#E095E0"
    },
];

const TYPE_CHART = [
    Array(18).fill(0),
    Array(18).fill(0),
    Array(18).fill(0),
    Array(18).fill(0),
    Array(18).fill(0),
    Array(18).fill(0),
    Array(18).fill(0),
    Array(18).fill(0),
    Array(18).fill(0),
    Array(18).fill(0),
    Array(18).fill(0),
    Array(18).fill(0),
    Array(18).fill(0),
    Array(18).fill(0),
    Array(18).fill(0),
    Array(18).fill(0),
    Array(18).fill(0),
    Array(18).fill(0)
];

TYPE_CHART[TYPE_INDEX_NORMAL][TYPE_INDEX_ROCK] = -1;
TYPE_CHART[TYPE_INDEX_NORMAL][TYPE_INDEX_GHOST] = -2;
TYPE_CHART[TYPE_INDEX_NORMAL][TYPE_INDEX_STEEL] = -1;
TYPE_CHART[TYPE_INDEX_FIRE][TYPE_INDEX_FIRE] = -1;
TYPE_CHART[TYPE_INDEX_FIRE][TYPE_INDEX_WATER] = -1;
TYPE_CHART[TYPE_INDEX_FIRE][TYPE_INDEX_GRASS] = 1;
TYPE_CHART[TYPE_INDEX_FIRE][TYPE_INDEX_ICE] = 1;
TYPE_CHART[TYPE_INDEX_FIRE][TYPE_INDEX_BUG] = 1;
TYPE_CHART[TYPE_INDEX_FIRE][TYPE_INDEX_ROCK] = -1;
TYPE_CHART[TYPE_INDEX_FIRE][TYPE_INDEX_DRAGON] = -1;
TYPE_CHART[TYPE_INDEX_FIRE][TYPE_INDEX_STEEL] = 1;
TYPE_CHART[TYPE_INDEX_WATER][TYPE_INDEX_FIRE] = 1;
TYPE_CHART[TYPE_INDEX_WATER][TYPE_INDEX_WATER] = -1;
TYPE_CHART[TYPE_INDEX_WATER][TYPE_INDEX_GRASS] = -1;
TYPE_CHART[TYPE_INDEX_WATER][TYPE_INDEX_GROUND] = 1;
TYPE_CHART[TYPE_INDEX_WATER][TYPE_INDEX_ROCK] = 1;
TYPE_CHART[TYPE_INDEX_WATER][TYPE_INDEX_DRAGON] = -1;
TYPE_CHART[TYPE_INDEX_ELECTRIC][TYPE_INDEX_WATER] = 1;
TYPE_CHART[TYPE_INDEX_ELECTRIC][TYPE_INDEX_ELECTRIC] = -1;
TYPE_CHART[TYPE_INDEX_ELECTRIC][TYPE_INDEX_GRASS] = -1;
TYPE_CHART[TYPE_INDEX_ELECTRIC][TYPE_INDEX_GROUND] = -2;
TYPE_CHART[TYPE_INDEX_ELECTRIC][TYPE_INDEX_FLYING] = 1;
TYPE_CHART[TYPE_INDEX_ELECTRIC][TYPE_INDEX_DRAGON] = -1;
TYPE_CHART[TYPE_INDEX_GRASS][TYPE_INDEX_FIRE] = -1;
TYPE_CHART[TYPE_INDEX_GRASS][TYPE_INDEX_WATER] = 1;
TYPE_CHART[TYPE_INDEX_GRASS][TYPE_INDEX_GRASS] = -1;
TYPE_CHART[TYPE_INDEX_GRASS][TYPE_INDEX_POISON] = -1;
TYPE_CHART[TYPE_INDEX_GRASS][TYPE_INDEX_GROUND] = 1;
TYPE_CHART[TYPE_INDEX_GRASS][TYPE_INDEX_FLYING] = -1;
TYPE_CHART[TYPE_INDEX_GRASS][TYPE_INDEX_BUG] = -1;
TYPE_CHART[TYPE_INDEX_GRASS][TYPE_INDEX_ROCK] = 1;
TYPE_CHART[TYPE_INDEX_GRASS][TYPE_INDEX_DRAGON] = -1;
TYPE_CHART[TYPE_INDEX_GRASS][TYPE_INDEX_STEEL] = -1;
TYPE_CHART[TYPE_INDEX_ICE][TYPE_INDEX_FIRE] = -1;
TYPE_CHART[TYPE_INDEX_ICE][TYPE_INDEX_WATER] = -1;
TYPE_CHART[TYPE_INDEX_ICE][TYPE_INDEX_GRASS] = 1;
TYPE_CHART[TYPE_INDEX_ICE][TYPE_INDEX_ICE] = -1;
TYPE_CHART[TYPE_INDEX_ICE][TYPE_INDEX_GROUND] = 1;
TYPE_CHART[TYPE_INDEX_ICE][TYPE_INDEX_FLYING] = 1;
TYPE_CHART[TYPE_INDEX_ICE][TYPE_INDEX_DRAGON] = 1;
TYPE_CHART[TYPE_INDEX_ICE][TYPE_INDEX_STEEL] = -1;
TYPE_CHART[TYPE_INDEX_FIGHTING][TYPE_INDEX_NORMAL] = 1;
TYPE_CHART[TYPE_INDEX_FIGHTING][TYPE_INDEX_ICE] = 1;
TYPE_CHART[TYPE_INDEX_FIGHTING][TYPE_INDEX_POISON] = -1;
TYPE_CHART[TYPE_INDEX_FIGHTING][TYPE_INDEX_FLYING] = -1;
TYPE_CHART[TYPE_INDEX_FIGHTING][TYPE_INDEX_PSYCHIC] = -1;
TYPE_CHART[TYPE_INDEX_FIGHTING][TYPE_INDEX_BUG] = -1;
TYPE_CHART[TYPE_INDEX_FIGHTING][TYPE_INDEX_ROCK] = 1;
TYPE_CHART[TYPE_INDEX_FIGHTING][TYPE_INDEX_GHOST] = -2;
TYPE_CHART[TYPE_INDEX_FIGHTING][TYPE_INDEX_DARK] = 1;
TYPE_CHART[TYPE_INDEX_FIGHTING][TYPE_INDEX_STEEL] = 1;
TYPE_CHART[TYPE_INDEX_FIGHTING][TYPE_INDEX_FAIRY] = -1;
TYPE_CHART[TYPE_INDEX_POISON][TYPE_INDEX_GRASS] = 1;
TYPE_CHART[TYPE_INDEX_POISON][TYPE_INDEX_POISON] = -1;
TYPE_CHART[TYPE_INDEX_POISON][TYPE_INDEX_GROUND] = -1;
TYPE_CHART[TYPE_INDEX_POISON][TYPE_INDEX_ROCK] = -1;
TYPE_CHART[TYPE_INDEX_POISON][TYPE_INDEX_GHOST] = -1;
TYPE_CHART[TYPE_INDEX_POISON][TYPE_INDEX_STEEL] = -2;
TYPE_CHART[TYPE_INDEX_POISON][TYPE_INDEX_FAIRY] = 1;
TYPE_CHART[TYPE_INDEX_GROUND][TYPE_INDEX_FIRE] = 1;
TYPE_CHART[TYPE_INDEX_GROUND][TYPE_INDEX_ELECTRIC] = 1;
TYPE_CHART[TYPE_INDEX_GROUND][TYPE_INDEX_GRASS] = -1;
TYPE_CHART[TYPE_INDEX_GROUND][TYPE_INDEX_POISON] = 1;
TYPE_CHART[TYPE_INDEX_GROUND][TYPE_INDEX_FLYING] = -2;
TYPE_CHART[TYPE_INDEX_GROUND][TYPE_INDEX_BUG] = -1;
TYPE_CHART[TYPE_INDEX_GROUND][TYPE_INDEX_ROCK] = 1;
TYPE_CHART[TYPE_INDEX_GROUND][TYPE_INDEX_STEEL] = 1;
TYPE_CHART[TYPE_INDEX_FLYING][TYPE_INDEX_ELECTRIC] = -1;
TYPE_CHART[TYPE_INDEX_FLYING][TYPE_INDEX_GRASS] = 1;
TYPE_CHART[TYPE_INDEX_FLYING][TYPE_INDEX_FIGHTING] = 1;
TYPE_CHART[TYPE_INDEX_FLYING][TYPE_INDEX_BUG] = 1;
TYPE_CHART[TYPE_INDEX_FLYING][TYPE_INDEX_ROCK] = -1;
TYPE_CHART[TYPE_INDEX_FLYING][TYPE_INDEX_STEEL] = -1;
TYPE_CHART[TYPE_INDEX_PSYCHIC][TYPE_INDEX_FIGHTING] = 1;
TYPE_CHART[TYPE_INDEX_PSYCHIC][TYPE_INDEX_POISON] = 1;
TYPE_CHART[TYPE_INDEX_PSYCHIC][TYPE_INDEX_PSYCHIC] = -1;
TYPE_CHART[TYPE_INDEX_PSYCHIC][TYPE_INDEX_DARK] = -2;
TYPE_CHART[TYPE_INDEX_PSYCHIC][TYPE_INDEX_STEEL] = -1;
TYPE_CHART[TYPE_INDEX_BUG][TYPE_INDEX_FIRE] = -1;
TYPE_CHART[TYPE_INDEX_BUG][TYPE_INDEX_GRASS] = 1;
TYPE_CHART[TYPE_INDEX_BUG][TYPE_INDEX_FIGHTING] = -1;
TYPE_CHART[TYPE_INDEX_BUG][TYPE_INDEX_POISON] = -1;
TYPE_CHART[TYPE_INDEX_BUG][TYPE_INDEX_FLYING] = -1;
TYPE_CHART[TYPE_INDEX_BUG][TYPE_INDEX_PSYCHIC] = 1;
TYPE_CHART[TYPE_INDEX_BUG][TYPE_INDEX_GHOST] = -1;
TYPE_CHART[TYPE_INDEX_BUG][TYPE_INDEX_DARK] = 1;
TYPE_CHART[TYPE_INDEX_BUG][TYPE_INDEX_STEEL] = -1;
TYPE_CHART[TYPE_INDEX_BUG][TYPE_INDEX_FAIRY] = -1;
TYPE_CHART[TYPE_INDEX_ROCK][TYPE_INDEX_FIRE] = 1;
TYPE_CHART[TYPE_INDEX_ROCK][TYPE_INDEX_ICE] = 1;
TYPE_CHART[TYPE_INDEX_ROCK][TYPE_INDEX_FIGHTING] = -1;
TYPE_CHART[TYPE_INDEX_ROCK][TYPE_INDEX_GROUND] = -1;
TYPE_CHART[TYPE_INDEX_ROCK][TYPE_INDEX_FLYING] = 1;
TYPE_CHART[TYPE_INDEX_ROCK][TYPE_INDEX_BUG] = 1;
TYPE_CHART[TYPE_INDEX_ROCK][TYPE_INDEX_STEEL] = -1;
TYPE_CHART[TYPE_INDEX_GHOST][TYPE_INDEX_NORMAL] = -2;
TYPE_CHART[TYPE_INDEX_GHOST][TYPE_INDEX_PSYCHIC] = 1;
TYPE_CHART[TYPE_INDEX_GHOST][TYPE_INDEX_GHOST] = 1;
TYPE_CHART[TYPE_INDEX_GHOST][TYPE_INDEX_DARK] = -1;
TYPE_CHART[TYPE_INDEX_DRAGON][TYPE_INDEX_DRAGON] = 1;
TYPE_CHART[TYPE_INDEX_DRAGON][TYPE_INDEX_STEEL] = -1;
TYPE_CHART[TYPE_INDEX_DRAGON][TYPE_INDEX_FAIRY] = -2;
TYPE_CHART[TYPE_INDEX_DARK][TYPE_INDEX_FIGHTING] = -1;
TYPE_CHART[TYPE_INDEX_DARK][TYPE_INDEX_PSYCHIC] = 1;
TYPE_CHART[TYPE_INDEX_DARK][TYPE_INDEX_GHOST] = 1;
TYPE_CHART[TYPE_INDEX_DARK][TYPE_INDEX_DARK] = -1;
TYPE_CHART[TYPE_INDEX_DARK][TYPE_INDEX_FAIRY] = -1;
TYPE_CHART[TYPE_INDEX_STEEL][TYPE_INDEX_FIRE] = -1;
TYPE_CHART[TYPE_INDEX_STEEL][TYPE_INDEX_WATER] = -1;
TYPE_CHART[TYPE_INDEX_STEEL][TYPE_INDEX_ELECTRIC] = -1;
TYPE_CHART[TYPE_INDEX_STEEL][TYPE_INDEX_ICE] = 1;
TYPE_CHART[TYPE_INDEX_STEEL][TYPE_INDEX_ROCK] = 1;
TYPE_CHART[TYPE_INDEX_STEEL][TYPE_INDEX_STEEL] = -1;
TYPE_CHART[TYPE_INDEX_STEEL][TYPE_INDEX_FAIRY] = 1;
TYPE_CHART[TYPE_INDEX_FAIRY][TYPE_INDEX_FIRE] = -1;
TYPE_CHART[TYPE_INDEX_FAIRY][TYPE_INDEX_FIGHTING] = 1;
TYPE_CHART[TYPE_INDEX_FAIRY][TYPE_INDEX_POISON] = -1;
TYPE_CHART[TYPE_INDEX_FAIRY][TYPE_INDEX_DRAGON] = 1;
TYPE_CHART[TYPE_INDEX_FAIRY][TYPE_INDEX_DARK] = 1;
TYPE_CHART[TYPE_INDEX_FAIRY][TYPE_INDEX_STEEL] = -1;


if (document.readyState === 'complete') {
    onloadFunc();
} else {
    window.onload = onloadFunc;
}