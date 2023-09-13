<?php

function getUrlFromHead()
{
    $output = Shell_Exec('powershell -InputFormat none -ExecutionPolicy ByPass -NoProfile -Command "& { . \"C:\\Users\\micke\\Documents\\GitHub\\strangeapp\\docs\\pokego-raid-dps\\powershell\\ps_get_url_from_head.ps1\"; }"');
    $url = trim($output);
    return $url;
}

function deleteUrlFromHead()
{
    Shell_Exec('powershell -InputFormat none -ExecutionPolicy ByPass -NoProfile -Command "& { . \"C:\\Users\\micke\\Documents\\GitHub\\strangeapp\\docs\\pokego-raid-dps\\powershell\\ps_delete_url_from_head.ps1\"; }"');
}

function kickNext($file)
{
    pclose(popen("start /B " . "php " . $file . " > nul", "r"));
}

function write_log($message)
{
    $log = date(DateTimeInterface::ATOM, time()) . " [" . getmypid() . "] :" . $message;
    file_put_contents("scraping.log", $log . "\n", FILE_APPEND);
}