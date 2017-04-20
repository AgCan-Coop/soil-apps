/****************************  Fetch GeoTiffs from Drawing AOI  ***********************/

$('.download-draw').click(function() {
    var lyrCount = getSelectedLayers().length;
    if (lyrCount == 0) {
        $('.ui.basic.modal .icon.header').html('<i class="warning sign icon"></i>' +
                                               lyrCount + ' Layers Selected');
        $('.ui.basic.modal').modal('show');
    } else {
       getGeoTiffs();
    }
});



function getSelectedLayers() {     
    
    var selectedLayers = [],
        featureExtent; 
    $('.selected-layers-list .content').each(function(){
        selectedLayers.push(this.innerText);
    })
    return(selectedLayers);
};


function getGeoTiffs() {
   
    var extentData,
        layers = getSelectedLayers();
    
    if (drawCoords !== null)
        extentData = drawCoords;        
    else 
        extentData = bboxCoords;   
    console.log(layers, extentData, selectType);
    
    $.post("../lib/php/dataFetch.php", 
    {
        selectType : selectType,
        extentData : extentData,
        layers     : layers
    })
    .done(function(data, status) {
        console.log
    })
    
    
    
};