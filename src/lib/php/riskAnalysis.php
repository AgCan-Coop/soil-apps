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


function runPython()
{
    $CropDensity = $_REQUEST['CropDensity'];        
    FB::info($CropDensity);

    if ($CropDensity=='low')
    {
    	$CropDensity = 10;
    }
    else if ($CropDensity =='normal')
    {
    	$CropDensity = 20;
    }
    else 
    {
    	$CropDensity = 30;
    }

    FB::info($CropDensity);

    FB::info(gettype($CropDensity));
    $CropDensity = (int)$CropDensity;
    FB::info(gettype($CropDensity));
    FB::info($CropDensity);

    $temp = json_encode($CropDensity);

    // echo $temp;
    $result = shell_exec('python3 ../py/riskcalc.py ' ."'".$temp."'");
    $result = shell_exec('python3 ../py/raster_calc.py '.'-A /var/www/html/web_gis/src/temp/CropDensity.tif -B /var/www/html/web_gis/src/temp/cropping_history.tif --outfile=/var/www/html/web_gis/src/temp/riskmap1.tif --calc="A+B"');
    $result = shell_exec('python3 ../py/raster_calc.py '.'-A /var/www/html/web_gis/src/temp/data-download.tif  -B /var/www/html/web_gis/src/temp/riskmap1.tif --outfile=/var/www/html/web_gis/src/temp/riskmap.tif --calc="A+B"');
    FB::info($result);
    $riskmap_save = "../../riskmap.tif";
    $riskmap_path = "http://localhost/web_gis/src/temp/riskmap.tif";
    return ($riskmap_path);
}



$riskResult = runPython();

echo json_encode($riskResult);

// $clean = shell_exec('python3 ../SCRIPT/python/cleanup.py');


?>