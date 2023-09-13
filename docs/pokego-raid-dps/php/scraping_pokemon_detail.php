<?php

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/scraping_utils.php';

use PHPHtmlParser\Dom;

$url = getUrlFromHead();
if ($url == "") {
    exit(0);
}
deleteUrlFromHead();

$client = new GuzzleHttp\Client();
$response = $client->request('GET', $url, ['verify' => false]);
$html = (string) $response->getBody();
$htmlCrawler = (new Dom)->loadStr($html);

$pagenationHtml = $htmlCrawler->find(".pgo_pagenation")[0]->outerHtml;
$pagenationTdList = (new Dom)->loadStr($pagenationHtml)->find("td");
if (count($pagenationTdList) === 3) {
    $tdIndex = 1;
} else {
    // 最初と最後ケア
    if (count((new Dom)->loadStr($pagenationTdList[0]->outerHtml)->find(".bolder"))) {
        $tdIndex = 0;
    } else {
        $tdIndex = 1;
    }
}
$td = (new Dom)->loadStr($pagenationTdList[$tdIndex]->outerHtml);
$td->find("span")[0]->delete();
$name = $td->innerText;
write_log($name);
if (in_array($name, ["メタモン", "ドーブル"])) {
    kickNext(__FILE__);
    exit(0);
}

$typesString = $htmlCrawler->find("._type-text")[0]->innerText;
$types = array_map("trim", explode("/", $typesString));

$baseStatusDiv = $htmlCrawler->find(".shuzoku")[0];
$baseStatusCrawler = (new Dom)->loadStr($baseStatusDiv->outerHtml);
$baseStatusTrList = $baseStatusCrawler->find("td");
$cp = (int) (new Dom)->loadStr($baseStatusTrList[0]->outerHtml)->find("td")[0]->innerText;
$hp = (int) (new Dom)->loadStr($baseStatusTrList[3]->outerHtml)->find("td")[0]->innerText;
$attack = (int) (new Dom)->loadStr($baseStatusTrList[1]->outerHtml)->find("td")[0]->innerText;
$defense = (int) (new Dom)->loadStr($baseStatusTrList[2]->outerHtml)->find("td")[0]->innerText;

$raidAttackAreaHtml = $htmlCrawler->find("[data-toggle-name=\"toggle-switch-1\"]")[0]->outerHtml;
$AttackDivList = (new Dom)->loadStr($raidAttackAreaHtml)->find(".pgo_hyouka_waza");

$normalAttackCrawler = (new Dom)->loadStr($AttackDivList[0]->outerHtml);
$normalAttackTrList = $normalAttackCrawler->find("tr");
$normalAttack = [];
foreach ($normalAttackTrList as $index => $normalAttackTr) {
    if ($index === 0) {
        continue;
    }
    $normalAttackTrCrawler = (new Dom)->loadStr($normalAttackTr->outerHtml);
    $normalAttackAnchor = $normalAttackTrCrawler->find("a");
    $normalAttack[] = $normalAttackAnchor[0]->innerText;
}

$specialAttackCrawler = (new Dom)->loadStr($AttackDivList[1]->outerHtml);
$specialAttackTrList = $specialAttackCrawler->find("tr");
$specialAttack = [];
foreach ($specialAttackTrList as $index => $specialAttackTr) {
    if ($index === 0) {
        continue;
    }
    $specialAttackTrCrawler = (new Dom)->loadStr($specialAttackTr->outerHtml);
    $specialAttackAnchor = $specialAttackTrCrawler->find("a");
    $specialAttack[] = $specialAttackAnchor[0]->innerText;
}

$pokemonData = [
    "name" => $name,
    "types" => $types,
    "cp" => $cp,
    "hp" => $hp,
    "attack" => $attack,
    "defense" => $defense,
    "normalAttack" => $normalAttack,
    "specialAttack" => $specialAttack
];
$output = json_encode($pokemonData, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT | JSON_THROW_ON_ERROR);

$isExistNext = getUrlFromHead() != "";
if ($isExistNext) {
    $output .= ",\n";
    file_put_contents("../js/pokemon.js", $output, FILE_APPEND);
    kickNext(__FILE__);
} else {
    $output .= "\n];";
    file_put_contents("../js/pokemon.js", $output, FILE_APPEND);
}

write_log(memory_get_usage());
exit(0);