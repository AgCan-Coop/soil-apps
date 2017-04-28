/****************************  Fetch GeoTiffs from Drawing AOI  ***********************/


// Fetch list of currently selected layers for download
function getSelectedLayers() {     
    
    var selectedLayers = [],
        featureExtent; 
    
    $('.selected-layers-list .content').each(function(){
        selectedLayers.push(this.innerText);
    })
    return(selectedLayers);
};


// Pass data to php script and return process geotiffs
function getGeoTiffs(e) {    
    
    var layers = getSelectedLayers(),
        extentData, 
        id; 
    
    id = (e instanceof jQuery) ? $('.warning.sign.icon').attr('id') : e.currentTarget.id;    

    if (id == "download-draw" || id == "modal-draw") {        
        
        if (drawCoords !== null)
            extentData = drawCoords;        
        else 
            extentData = bboxCoords;         
    } 
    else 
    {
        // add shapefile's feature extent data
        var shapeExtent = getShapefileExtent();
        if (shapeExtent == "none") {
            $(".shape-warning").removeClass('hidden');
            return;
        }
        else 
        {
            $(".shape-warning").addClass('hidden');
            console.log(shapeExtent);
            return;
        }
        
    }
    
    // made it past conditions, launch the loader
    $(".data-loader").addClass("active");

    // *** Handle point download right here!
    
    $.post("../lib/php/dataFetch.php", 
    {
        selectType : selectType,
        extentData : extentData,
        layers     : layers
    })
    .done(function(data, status) {
        data = jQuery.parseJSON(data);
        if (data[0] !== "fail") {
            // do good stuff
            $(".data-loader").removeClass("active");
            $("#data-link").attr("href", "../lib/php/" + data[1]);
            $("#data-ready").slideDown(500);
        } 
        else 
        {
            // do bad stuff
        }
        console.log("Response:  ", data, status)
    })
    
    
};


// Initiate download on click, throw warning if layer count is too high
$('.download-draw, .download-shapefile').click(function(e) {
    var lyrCount = getSelectedLayers().length;
    console.log(e)
    
    if (lyrCount == 0 || lyrCount > 6) { 
        if (lyrCount > 6) {
            if (e.currentTarget.id == "download-draw"){             
                $('.count-many .icon.header').html('<i id="modal-draw" class="warning sign icon"></i>' + lyrCount + ' Layers Selected');            
            } 
            else 
            {            
                $('.count-many .icon.header').html('<i id="modal-shapefile" class="warning sign icon"></i>' + lyrCount + ' Layers Selected');
            }        
            $('.count-many').modal('show');
        }
        else
        {
            $('.count-zero').modal('show');
        }        
    }
    else 
        getGeoTiffs(e);    
});




















