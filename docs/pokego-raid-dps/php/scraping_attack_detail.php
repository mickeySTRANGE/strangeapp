<?php

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/scraping_utils.php';

use PHPHtmlParser\Dom;

$data = getUrlFromHead();
if ($data == "") {
    exit(0);
}
deleteUrlFromHead();

$dataArray = explode(",https://", $data);
$name = urldecode($dataArray[0]);
$url = "https://" . $dataArray[1];

// $url = "https://pokemongo.gamewith.jp/article/show/83229";
// $url = "https://pokemongo.gamewith.jp/article/show/34677";

$client = new GuzzleHttp\Client();
$response = $client->request('GET', $url, ['verify' => false]);
$html = (string) $response->getBody();
$htmlCrawler = (new Dom)->loadStr($html);

$isNormalAttack = false;
$isSpecialAttack = false;
$type = "";
$gauge = 0;
$power = 0;
$time = 0;
$epTank = 0;

$tableList = $htmlCrawler->find(".kihon_table");
foreach ($tableList as $table) {
    if (preg_match("/.*種類.*攻撃.*タイプ.*/", $table->outerHtml)) {
        foreach ((new DOM)->loadStr($table->outerHtml)->find("tr") as $kihonTr) {
            $thText = (new DOM)->loadStr($kihonTr->outerHtml)->find("th")[0]->innerText;
            $tdElement = (new DOM)->loadStr($kihonTr->outerHtml)->find("td")[0];
            switch ($thText) {
                case "種類":
                    if ($tdElement->innerText === "通常攻撃") {
                        $isNormalAttack = true;
                    } else if ($tdElement->innerText === "ゲージ攻撃") {
                        $isSpecialAttack = true;
                    }
                    break;
                case "タイプ":
                    $type = $tdElement->innerText;
                    break;
                case "ゲージ数":
                    preg_match("/_(\d)\.png/", $tdElement->outerHtml, $output);
                    $gauge = (int) $output[1];
                    break;
                default:
                    break;
            }
        }
    } else if (preg_match("/.*発動時間.*DPS.*/", $table->outerHtml)) {
        foreach ((new DOM)->loadStr($table->outerHtml)->find("tr") as $kihonTr) {
            $thText = (new DOM)->loadStr($kihonTr->outerHtml)->find("th")[0]->innerText;
            $tdElement = (new DOM)->loadStr($kihonTr->outerHtml)->find("td")[0];
            switch ($thText) {
                case "威力(タイプ一致)":
                    preg_match("/((\d+)\(\d)/", $tdElement->innerText, $output);
                    $power = (int) $output[1];
                    break;
                case "発動時間":
                    $time = floatval($tdElement->innerText);
                    break;
                case "EPtank":
                    $epTank = floatval($tdElement->innerText);
                    break;
            }
        }
    }
}

$attackData = [
    "name" => $name,
    "type" => $type,
    "power" => $power,
    "time" => $time,
    "epTank" => $epTank,
    "gauge" => $gauge
];
$output = json_encode($attackData, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT | JSON_THROW_ON_ERROR);

$isExistNext = getUrlFromHead() != "";
if ($isExistNext) {
    $output .= ",\n";
    file_put_contents("../js/attack.js", $output, FILE_APPEND);
    kickNext(__FILE__);
} else {
    $output .= "\n];";
    file_put_contents("../js/attack.js", $output, FILE_APPEND);
}

write_log(memory_get_usage());
exit(0);