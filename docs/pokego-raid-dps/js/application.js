function calc() {

    const start = Date.now();

    const targetName = "テッカグヤ";
    // const targetName = "ドクロッグ";

    const target = getPokemonData(targetName);

    let dpsList = [];
    POKEMON_DATA.forEach(attackerData => {
        // 最大CP2000以下はどうせ結果ふるわないのでスキップ
        if (attackerData.cp < 2000) {
            return;
        }

        // メガシンカはスキップ
        if (isMegaEvolved(attackerData.name)) {
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
                attacker: attackerData,
                normalAttack: normalAttack,
                specialAttack: specialAttack,
                dps: dps
            }
        );
    });

    dpsList.sort(function (a, b) {
        return b.dps - a.dps;
    });


    console.log(dpsList);
    const millis = Date.now() - start;

    console.log(`milli seconds elapsed = ${millis}`);
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
    debugger;
    return TYPE_CHART[getTypeIndex(attackType)][getTypeIndex(receiveType)];
}

function getPokemonData(name) {
    return POKEMON_DATA.find(element => element.name === name);
}

function getAttackData(name) {
    return ATTACK_DATA.find(element => element.name === name);
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


function getTypeIndex(type) {

    if (type === "ノーマル") return TYPE_INDEX_NORMAL;
    else if (type === "ほのお") return TYPE_INDEX_FIRE;
    else if (type === "みず") return TYPE_INDEX_WATER;
    else if (type === "でんき") return TYPE_INDEX_ELECTRIC;
    else if (type === "くさ") return TYPE_INDEX_GRASS;
    else if (type === "こおり") return TYPE_INDEX_ICE;
    else if (type === "かくとう") return TYPE_INDEX_FIGHTING;
    else if (type === "どく") return TYPE_INDEX_POISON;
    else if (type === "じめん") return TYPE_INDEX_GROUND;
    else if (type === "ひこう") return TYPE_INDEX_FLYING;
    else if (type === "エスパー") return TYPE_INDEX_PSYCHIC;
    else if (type === "むし") return TYPE_INDEX_BUG;
    else if (type === "いわ") return TYPE_INDEX_ROCK;
    else if (type === "ゴースト") return TYPE_INDEX_GHOST;
    else if (type === "ドラゴン") return TYPE_INDEX_DRAGON;
    else if (type === "あく") return TYPE_INDEX_DARK;
    else if (type === "はがね") return TYPE_INDEX_STEEL;
    else if (type === "フェアリー") return TYPE_INDEX_FAIRY;
    else return -1;
}


function onloadFunc() {

    initTypeChart();

    /**
     * trigger main
     */
    calc();
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

if (document.readyState === 'complete') {
    onloadFunc();
} else {
    window.onload = onloadFunc;
}


function initTypeChart() {
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
}