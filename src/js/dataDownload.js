/****************************  Fetch GeoTiffs from Drawing AOI  ***********************/

// Initiate download on click, throw warning if layer count is too high
$('.download-draw, .download-shapefile').click(function(e) {
    var lyrCount = getSelectedLayers().length;
    console.log(e)
    
    if (lyrCount == 0) { 
        
        if (e.currentTarget.id == "download-draw"){ 
            
            $('.ui.basic.modal .icon.header').html('<i id="modal-draw" class="warning sign icon"></i>' + lyrCount + ' Layers Selected');            
        } else {
            
            $('.ui.basic.modal .icon.header').html('<i id="modal-shapefile" class="warning sign icon"></i>' + lyrCount + ' Layers Selected');
        }
        
        $('.ui.basic.modal').modal('show');
        
    } else 
        getGeoTiffs(e);    
});


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
        
    } else {
       // add shapefile's feature extent data
    }

    
    $.post("../lib/php/dataFetch.php", 
    {
        selectType : selectType,
        extentData : extentData,
        layers     : layers
    })
    .done(function(data, status) {
        console.log("Response:  ", status)
    })
    
    
};