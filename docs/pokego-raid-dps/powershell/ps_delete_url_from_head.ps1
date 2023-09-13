If ([string]::IsNullOrEmpty((Get-Content C:\Users\micke\Documents\GitHub\strangeapp\docs\pokego-raid-dps\php\index_url_list.txt | Select-Object -Skip 1))) {
    Set-Content C:\Users\micke\Documents\GitHub\strangeapp\docs\pokego-raid-dps\php\index_url_list.txt -Value "" -NoNewline
}
else {
    (Get-Content C:\Users\micke\Documents\GitHub\strangeapp\docs\pokego-raid-dps\php\index_url_list.txt | Select-Object -Skip 1) | Set-Content C:\Users\micke\Documents\GitHub\strangeapp\docs\pokego-raid-dps\php\index_url_list.txt
}

