<html lang="en-US" xml:lang="en-US" xmlns="http://www.w3.org/1999/xhtml">

<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<title>Séminaires du département d'informatique et de génie logiciel</title>

<link rel="stylesheet" href="style.css" type="text/css" />
</head>
<body>
<div id="page">
<center>
</center>
<div id="content">
<div id="main">
<h1>Séminaires du département d'informatique et de génie logiciel</h1>

<p>À la session d'hiver 2024, les séminaires du département
d'informatique et de génie logiciel auront lieu en classe les vendredis à 13h30
au local PLT-2551 (sauf exception).
Ces séminaires sont publics et tous peuvent y assister. Si vous désirez donner un séminaire, veuillez
contacter <a href="mailto:claude-guy.quimper@ift.ulaval.ca?subject=Séminaire
départemental">Claude-Guy Quimper</a>.
<p>Vous pouvez recevoir les annonces des séminaires par courriel en vous abonnant à la liste de diffusion SEMINAIRES-IFT sur le serveur de diffusion <a href="http://listes.ulaval.ca/cgi-bin/wa?SUBED1=SEMINAIRES-IFT&A=1%E2%80%8B%E2%80%8B">LISTSERV</a>.
  <!-- <p>Les séminaires de la session d'hiver 2019 sont <a href="https://www.ift.ulaval.ca/recherche-et-innovation/seminaires/seminaires-2019">archivés ici</a>. -->

<?php
//  error_reporting(-1);

   // Take an XML object of type file and return a link whose label is xml_file->label and whose url is Publications/xml_file->path
   function getFileLink($xml_file) {
     if (strpos($xml_file->path, 'http') === 0) {
       return "<a href=\"" . $xml_file->path . "\">" . $xml_file->label . "</a>";
     } else {
       return "<a href=\"files/" . $xml_file->path . "\">" . $xml_file->label . "</a>";
     }
   }

  $MONTHS = array(
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
  $JOURS = array("Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi");
  $SECTION_TITLES = array("SÉMINAIRE AUJOURD'HUI", "Séminaires à venir", "Séminaires passés");

  $xml = simplexml_load_file("seminaires.xml");
  $default_parameters = $xml->xpath("default[1]");
  $default_parameters = $default_parameters[0];
  
  date_default_timezone_set('EST');
  $today_string = date("Ymd");
  // $today_string = 20130301;
  $seminaires_a_venir = $xml->xpath("seminar[(number(year) * 100 + number(month)) * 100 + number(day) > $today_string]");
  $seminaires_aujourdhui = $xml->xpath("seminar[(number(year) * 100 + number(month)) * 100 + number(day) = $today_string]");
  $seminaires_passes =  $xml->xpath("seminar[(number(year) * 100 + number(month)) * 100 + number(day) < $today_string]");
  usort($seminaires_passes, function ($a, $b) { return (intval($a->year) * 100 + intval($a->month)) * 100 + intval($a->day) - (intval($b->year) * 100 + intval($b->month)) * 100 + intval($b->day); });

  $listes_de_seminaires = array($seminaires_aujourdhui, $seminaires_a_venir, $seminaires_passes);


  for($i=0; $i<3; $i++) {
    if(count($listes_de_seminaires[$i]) > 0) {
      echo "<h2>" . $SECTION_TITLES[$i] . "</h2>";
    }

    foreach($listes_de_seminaires[$i] as $seminar) {
      $year = intval($seminar->year);
      $month = intval($seminar->month);
      $day = intval($seminar->day);
      $time = getdate(mktime(0, 0, 0, $month, $day, $year));
      $week_day = $time["wday"];

      echo "<div id=\"" . $day . $month . $year . "\">";
      echo "<h3>" . $JOURS[$week_day] . " " . $day;
      if ($day == 1) {
        echo "<sup>er</sup>";
      }
      echo " " . $MONTHS[$month] . " " . $year . "</h3>";

      echo "<p style=\"text-align:left;\"><b>" . $seminar->title . "</b><br>";
      if (isset($seminar->website) && $seminar->website != "") {
        echo "<a href=\"" . $seminar->website . "\">";
      }
      echo $seminar->speaker;
      if (isset($seminar->website)) {
        echo "</a>";
      }
      if (isset($seminar->job)) {
        echo "<br><i>" . $seminar->job . "</i>";
      }
      echo "</p>";

      if (isset($seminar->time)) {
        $heure = $seminar->time;
      } Else {
        $heure = $default_parameters->time;
      }
      echo "<p>";
      if ($heure != "") {
        echo "<b>Heure</b>: " . $heure . "<br>";
      }
      if (isset($seminar->room)) {
        $local = $seminar->room;
        if (strpos($local, 'http') === 0) {
          $local = "<a href=\"" . "$local" . "\">Zoom</a>";
        }
      } Else {
        $local = $default_parameters->room;
      }
      if ($local != "") {
         if (strpos($local, 'a href') === 1) {
            $label = "Visioconférence";
         } else {
            $label = "Local";
         }
         
         echo "<b>" . $label . "</b>: " . $local;
      }
      if (isset($seminar->zoom)) {
         echo "<br><b>Visioconférence</b>: <a href=\"" . $seminar->zoom . "\">Zoom</a></p/>";
      }
      echo  "</p>";


      if (isset($seminar->recording)) {
        echo "<p><b>Visioconférence: </b><a href=\"" . $seminar->recording->link . "\">Enregistrement</a>";
        if (isset($seminar->recording->password)) {
           echo " (mot de passe: " . $seminar->recording->password . ")";
        }
        echo "</p>";
      }

      if (isset($seminar->abstract)) {
        echo "<p><b>Résumé: </b><resume>" . $seminar->abstract . "</resume></p>";
      }
      if (isset($seminar->bio)) {
        echo "<p><b>Biographie: </b>" . $seminar->bio . "</p>";
      }
      if (isset($seminar->note)) {
        echo "<p><b>Note: </b>" . $seminar->note . "</p>";
      }

      $files = $seminar->xpath("file");
      if (count($files) > 0) {
        $link_text = "Lien";
        if (count($files) > 1) {
	  $link_text = "Liens";
	}
        echo "<p><b>$link_text</b>: " . implode(", ", array_map("getFileLink", $files)) . "</p>";
      }
      echo "</div>";
    }
  } 
?>

</div>
</div>
<!-- <div id="footer"> !>
</div>

</div>
</body>

</html>
