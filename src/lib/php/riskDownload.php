<?php

// ob_strart();
// $firephp = FirePHP::getInstance(true);
// $todays_date = date(‘l jS of F Y h:i:s A‘);
// $firephp->log($todays_date, ‘Date‘);
// FB::info('Info message');
// FB::warn('Warn message');
// FB::error('Error message');
// FB::trace('Simple Trace');

require('../firephp-master/lib/FirePHPCore/fb.php');


// FB::info(simplexml_load_file("info.xml"));


if (empty($_REQUEST["minX"]) || empty($_REQUEST["minY"]) || empty($_REQUEST["maxX"]) || empty($_REQUEST["maxY"]) || !is_numeric($_REQUEST["minX"]) || !is_numeric($_REQUEST["minY"]) || !is_numeric($_REQUEST["maxX"]) || !is_numeric($_REQUEST["maxY"]))
{
    
    // Throws error if inputs aren't entered or numeric. 
    $errMsg = "*Oops, all fields are required and must be WGS84 coordinates.";
    
} else

{
	$minX = $_REQUEST['minX'];
	$minY = $_REQUEST['minY'];
	$maxX = $_REQUEST['maxX'];
	$maxY = $_REQUEST['maxY'];        
}

// Testing to see if data pass in fine
FB::info($minX);
FB::info($minY);
FB::info($maxX);
FB::info($maxY);




$url_cropping_history = 'http://127.0.0.1:8080/geoserver/ows?service=WCS&version=2.0.1&request=GetCoverage&CoverageId=manitoba:crop_risk&subset=Long('.$minX.','.$maxX.')&subset=Lat('.$minY.','.$maxY.')';

// Setup the headers and post options, then execute curlPOST  &subset=Long('.$minX.','.$maxX.')&subset=Lat('.$minY.','.$maxY.')
$ch_soil = curl_init($url_cropping_history);    

curl_setopt($ch_soil, CURLOPT_RETURNTRANSFER, 1);

$ch_result_cropping_history = curl_exec($ch_soil);
$contentType = curl_getinfo($ch_soil, CURLINFO_CONTENT_TYPE);

// FB::info($contentType);
curl_close($ch_soil);

$filesave_cropping_history = "../../temp/cropping_history.tif";
file_put_contents($filesave_cropping_history, $ch_result_cropping_history);

$cropping_path = "http://localhost/web_gis/src/temp/cropping_history.tif";


function PostGeoServer_soil($minX,$minY,$maxX,$maxY)
{
	FB::trace("function worked");

	
	// getting WCS data from geoserver usinng url
	
	$url_soil = 'http://127.0.0.1:8080/geoserver/ows?service=WCS&version=2.0.1&request=GetCoverage&CoverageId=Canada:canada_clay_250_sl1&subset=Long('.$minX.','.$maxX.')&subset=Lat('.$minY.','.$maxY.')';
	FB::info($url_soil);


	// Setup the headers and post options, then execute curlPOST
	$ch = curl_init($url_soil);    
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

	$ch_result_soil = curl_exec($ch);
	$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
	FB::info($contentType);
	curl_close($ch);


	$reader = new XMLReader();
	$reader->xml(ch_result_soil);
	if ($reader->read())
	{
		$errMsg = "\n\n" . date("Y-m-d H:i:s") . " ERROR " . $_SERVER["REQUEST_TIME"] . "\n\t " . __FILE__ . "\n\t Request XML error: POST request returned without a valid GeoTIFF.\n\t Refer to XML for info:\n\t XML Response:\n\t url: {$url}\n\t xml:\n\t {$ch_result} ";
        file_put_contents("error/errorlog.txt", $errMsg, FILE_APPEND);
        return("this is an error save tiff file");
	}

	else
	{
		$filesave = "../../temp/data-download.tif";
		file_put_contents($filesave, $ch_result_soil);
		$download_path = "http://localhost/web_gis/src/temp/data-download.tif";
		return ($download_path);
	}

}


$postStatus = PostGeoServer_soil($minX,$minY,$maxX,$maxY);

echo json_encode(array($postStatus,$cropping_path));

// $clean = shell_exec('python3 ../SCRIPT/python/cleanup.py');


?>