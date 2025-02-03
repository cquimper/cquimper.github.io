<html lang="en-US" xml:lang="en-US" xmlns="http://www.w3.org/1999/xhtml">

<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<title>Diapositives du cours IFT-4001 / IFT-7020</title>

</head>
<body>
<table border=0>
<tr><th width=500 align=left>Chapitres</th><th align=left>Derni&egrave;res modifications</th></tr>
<?php
  $months = array(
    1 => "janvier",
    2 => "f&eacute;vrier",
    3 => "mars",
    4 => "avril",
    5 => "mai",
    6 => "juin",
    7 => "juillet",
    8 => "ao&ucirc;t",
    9 => "septembre",
    10 => "octobre",
    11 => "novembre",
    12 => "d&eacute;cembre");
$xml = simplexml_load_file("chapitres.xml");
foreach($xml->chapitre as $chapitre) {
  $d = getdate(filemtime($chapitre->fichier));
  echo "<tr><td><a href=\"" . $chapitre->fichier . "\">" . $chapitre->titre . "</a></td><td>";
  echo $d["mday"] . " " . $months[$d["mon"]] . " " . $d["year"] . " &agrave; " . $d["hours"] . "h";
  if ($d["minutes"] < 10) {
    echo "0";
  }
  echo $d["minutes"];
  echo "</td></tr>";
}
?>
</table>
</body>
</html>
