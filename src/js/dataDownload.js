/****************************  Fetch GeoTiffs from Drawing AOI  ***********************/

$('.download-draw').click(function() {
    var lyrCount = getSelectedLayers().length;
    if (lyrCount > 2) {
        $('.ui.basic.modal .icon.header').html('<i class="warning sign icon"></i>' +
                                               lyrCount + ' Layers Selected');
        $('.ui.basic.modal').modal('show');
    }
    if (drawCoords !== null)
        getGeoTiffs(drawCoords);        
     else 
        getGeoTiffs(bboxCoords);
});



function getSelectedLayers() {     
    var selectedLayers = [],
        featureExtent;  
    
    $('.selected-layers-list .content').each(function(){
        selectedLayers.push(this.innerText);
    })  
    
    return(selectedLayers);
};


function getGeoTiffs(extentData) {
    var layers = getSelectedLayers();
    console.log(layers, extentData, selectType);
    
    
};