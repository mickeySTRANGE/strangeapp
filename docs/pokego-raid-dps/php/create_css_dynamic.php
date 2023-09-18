<?php

$file = "../css/application_dynamic.css";

file_put_contents($file, "");

for ($i = 1; $i < 50; $i++) {
    if ($i !== 1) {
        file_put_contents($file, "\n\n", FILE_APPEND);
    }
    $number = $i * 20 + 1;
    $output = <<<TEXT
    #resultViewCheckbox{$number}:checked~.resultView{$number} {
        display: block;
    }
    
    #resultViewCheckbox{$number}:not(checked)~.resultViewOnButton{$number},
    #resultViewCheckbox{$number}:checked~.resultViewOffButton{$number} {
        display: block;
        width: 80%;
        text-align: center;
        border: thin solid black;
        margin-bottom: 2vh;
    }
    
    #resultViewCheckbox{$number}:checked~.resultViewOnButton{$number},
    #resultViewCheckbox{$number}:not(checked)~.resultViewOffButton{$number},
    #resultViewCheckbox{$number}:not(checked)~.resultView{$number} {
        display: none;
    }
    TEXT;
    file_put_contents($file, $output, FILE_APPEND);
}


exit(0);