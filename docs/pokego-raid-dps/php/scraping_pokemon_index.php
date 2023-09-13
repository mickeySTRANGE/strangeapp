<?php

require_once __DIR__ . '/vendor/autoload.php';

use PHPHtmlParser\Dom;

/**
 * ポケモン図鑑ページ解析
 */
$url = 'https://pokemongo.gamewith.jp/article/show/26775';

$client = new GuzzleHttp\Client();
$response = $client->request('GET', $url, ['verify' => false]);
$html = (string) $response->getBody();
$htmlCrawler = (new Dom)->loadStr($html);
$tableHtml = $htmlCrawler->find("table.sorttable")[0]->outerHtml;

$tableCrawler = (new Dom)->loadStr($tableHtml);
$trList = $tableCrawler->find("tr.w-idb-element");

file_put_contents("index_url_list.txt", "");

$pokemonData = [];
foreach ($trList as $i => $tr) {

    $trCrawler = (new Dom)->loadStr($tr->outerHtml);
    $tdList = $trCrawler->find("td");

    $cp = (int) $tr->getAttribute("data-col4");
    if ($cp === 0) {
        continue;
    }

    $tdCrawler = (new Dom)->loadStr($tdList[1]);
    $href = $tdCrawler->find("a")[0]->getAttribute("href");

    file_put_contents("index_url_list.txt", $href . "\n", FILE_APPEND);
    $name = $tdList[1]->innerText;
    echo $name . "\n";
}

$output = "const POKEMON_DATA = [\n";
file_put_contents("../js/pokemon.js", $output);