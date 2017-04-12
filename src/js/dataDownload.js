/****************************  Fetch GeoTiffs from Drawing AOI  ***********************/

$('.download-draw').click(function() {
    console.log(getSelectedLayers());
})

function getSelectedLayers(){

    var selectedLayers = [],
        featureExtent;

    $('.selected-layers-list .content').each(function(){
        selectedLayers.push(this.innerText);
    })
    
    return(selectedLayers);
}


