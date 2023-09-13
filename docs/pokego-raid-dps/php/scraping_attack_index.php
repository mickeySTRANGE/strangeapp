<?php

require_once __DIR__ . '/vendor/autoload.php';

use PHPHtmlParser\Dom;

/**
 * 全わざ一覧ページ解析
 */
$url = 'https://pokemongo.gamewith.jp/article/show/34385';

$client = new GuzzleHttp\Client();
$response = $client->request('GET', $url, ['verify' => false]);
$html = (string) $response->getBody();
$htmlCrawler = (new Dom)->loadStr($html);

file_put_contents("index_url_list.txt", "");

$tWazaTableList = $htmlCrawler->find(".pokego-Twaza-table");
foreach ($tWazaTableList as $tWazaTable) {
    $tWazaTrList = (new Dom)->loadStr($tWazaTable->outerHtml)->find("tr");
    foreach ($tWazaTrList as $i => $tr) {
        if ($i === 0) {
            continue;
        }
        $aElement = (new Dom)->loadStr($tr->outerHtml)->find("a")[0];
        $name = $aElement->innerText;
        $href = $aElement->getAttribute("href");
        file_put_contents("index_url_list.txt", urlencode($name) . "," . $href . "\n", FILE_APPEND);
    }
}

$gWazaTableList = $htmlCrawler->find(".pokego-Gwaza-table");
foreach ($gWazaTableList as $gWazaTable) {
    $gWazaTrList = (new Dom)->loadStr($gWazaTable->outerHtml)->find("tr");
    foreach ($gWazaTrList as $i => $tr) {
        if ($i === 0) {
            continue;
        }
        $aElement = (new Dom)->loadStr($tr->outerHtml)->find("a")[0];
        $name = $aElement->innerText;
        $href = $aElement->getAttribute("href");
        file_put_contents("index_url_list.txt", urlencode($name) . "," . $href . "\n", FILE_APPEND);
    }
}

$output = "const ATTACK_DATA = [\n";
file_put_contents("../js/attack.js", $output);