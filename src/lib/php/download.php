



<?php


$minX = "-100.7854275";
$minY = "50.3287183";

$maxX = "-100.5075719";
$maxY = "50.5943249";


function PostGeoServer_soil($minX,$minY,$maxX,$maxY)
{
	// FB::trace("function worked");

	
	// getting WCS data from geoserver usinng url
	
	$url_soil = 'http://127.0.0.1:8080/geoserver/ows?service=WCS&version=2.0.1&request=GetCoverage&CoverageId=Canada:canada_clay_250_sl1&subset=Long('.$minX.','.$maxX.')&subset=Lat('.$minY.','.$maxY.')';
	// FB::info($url_soil);


	// Setup the headers and post options, then execute curlPOST
	$ch = curl_init($url_soil);    
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

	$ch_result_soil = curl_exec($ch);
	$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
	// FB::info($contentType);
	curl_close($ch);


	// $reader = new XMLReader();
	// $reader->xml(ch_result_soil);
	// if ($reader->read())
	// {
	// 	$errMsg = "\n\n" . date("Y-m-d H:i:s") . " ERROR " . $_SERVER["REQUEST_TIME"] . "\n\t " . __FILE__ . "\n\t Request XML error: POST request returned without a valid GeoTIFF.\n\t Refer to XML for info:\n\t XML Response:\n\t url: {$url}\n\t xml:\n\t {$ch_result} ";
 //        file_put_contents("error/errorlog.txt", $errMsg, FILE_APPEND);
 //        return("this is an error save tiff file");
	// }

	// else
	// {
		// $filesave = "../../temp/data-download.tif";
		file_put_contents("download.tif", $ch_result_soil);
		// file_put_contents("Tmpfile.tif", fopen("http://127.0.0.1:8080/geoserver/ows?service=WCS&version=2.0.1&request=GetCoverage&CoverageId=Canada:canada_clay_250_sl1&subset=Long('.$minX.','.$maxX.')&subset=Lat('.$minY.','.$maxY.')", 'r'));
		// return ($filesave);
	// }

}



$postStatus = PostGeoServer_soil($minX,$minY,$maxX,$maxY);

?>