<html lang="en-US" xml:lang="en-US" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<title>Claude-Guy Quimper - Publications</title>

<link rel="stylesheet" href="style.css" type="text/css" />

</head>
<body>
<div id="page">
<div id="header">
</div>
<center>
<div id="navbar">
<ul id="navlist">
<li><a href="index.html">Bienvenue</a></li>
<li><a href="research.html">Recherche</a></li>
<li><b>Publications</b></li>
<li><a href="presentations.php">Présentations</a></li>
</ul>
</div>
</center>
<div id="content">
<div id="main">
<?php
   // Take an XML object of type file and return a link whose label is xml_file->label and whose url is Publications/xml_file->path
   function getFileLink($xml_file) {
     if (strpos($xml_file->path, 'http') === 0) {
       return "<a href=\"" . $xml_file->path . "\">" . $xml_file->label . "</a> ";
     } else {
       return "<a href=\"publications/" . $xml_file->path . "\">" . $xml_file->label . "</a> ";
     }
   }

   function convert_to_nserc_name($author) {
       $prefix = "";
       if (isset($author['student'])) {
          $prefix = "*";
       }
       $tokens = explode(" ", str_replace(".", "", $author->shortname));
       return $prefix . $tokens[1] . " " . $tokens[0];
   }

   // Display options
   $display_cv_mode = isset($_GET['cvmode']);
   $nserc_mode = isset($_GET['nserc']);
   $nserc_names = $nserc_mode;
   $display_acceptance_rates = isset($_GET['acceptancerate']) && $_GET['acceptancerate'] == 'true' || !isset($_GET['acceptancerate']) && $display_cv_mode;
   $display_files = !isset($_GET['files']) && !$display_cv_mode || $_GET['files'] == 'true';
   $display_author_links = !isset($_GET['authorlinks']) && !$display_cv_mode && !$nserc_mode || $_GET['authorlinks'] == 'true';
   $display_awards = !isset($_GET['awards']) || $_GET['awards'] == 'true';
   $display_numbers = (isset($_GET['numbers']) && $_GET['numbers'] == 'true') || (!isset($_GET['numbers']) && $display_cv_mode);
   $short_names = (isset($_GET['shortnames']) && $_GET['shortnames'] == 'true') || (!isset($_GET['shortnames']) && $display_cv_mode);

   if (isset($_GET['today']) && is_numeric($_GET['today'])) {
     $today_string = $_GET['today'];
   } else {
     date_default_timezone_set('UTC');
     $today_string = date("Ymd");
   }

   if ($display_numbers) {
     $open_list = "<ol>";
     $close_list = "</ol>";
   } else {
     $open_list = "<ul>";
     $close_list = "</ul>";
   }

   $xml = simplexml_load_file("publications.xml");
   foreach($xml->section as $section) {
     echo "<h3>". $section->title . "</h3>";
     $counter = count($section->paper);
     echo $open_list;
     foreach($section->paper as $paper) {
       echo "<li class=\"paper\" value=$counter>";
       $counter = $counter - 1;
       $ref = $paper->reference;
       // Set title in italic
       $tokens = explode(". ", $ref);
       if (count($tokens) == 3) {
         $ref = $tokens[0] . ". <i>" . $tokens[1] . ".</i> " . $tokens[2];
       }
       // Add hyper links for each author
       if ($display_author_links) {
         foreach($xml->xpath("author[website]") as $author) {
           $ref= str_replace($author->name, "<a href=\"" . $author->website . "\">" . $author->name . "</a>", $ref);
         }
       }
       // Convert all names by the short name
       if ($short_names) {
         foreach($xml->xpath("author[shortname]") as $author) {
           $ref = str_replace($author->name, $author->shortname, $ref);
         }
       }
       else if ($nserc_names) {
         foreach($xml->xpath("author[shortname]") as $author) {
           $ref = str_replace(" and ", ", ", str_replace(", and ", ", ", str_replace($author->name, convert_to_nserc_name($author), $ref)));
         }
       }

       echo $ref;
       // Display acceptance rate
       if ($display_acceptance_rates && isset($paper->acceptancerate)) {
         echo " Acceptance rate: " . $paper->acceptancerate . "&nbsp;%.";
       }
       // Display awards
       if ($display_awards && isset($paper->award)) {
         echo "<br><b>" . $paper->award . "</b>";
       }
       // Display related files
       if ($display_files) {
          $files = $paper->xpath("file[not(publish_date) or publish_date<=$today_string]");
          if (count($files) > 0) {
             echo "<br>[ " . implode(" | ", array_map("getFileLink", $files)) . " ]";
          }
       }
       echo "</li>";
     }
     echo $close_list;
   }
?>
</div>
</div>
</div>

</div>
</body>

</html>
