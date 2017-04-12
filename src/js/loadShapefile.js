 /****************************  Add some shapefile spice   *****************************/
    
// New style for the shapefile uploads
var shapeStyle = new ol.style.Style ({
    image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
            color: 'rgba(230,249,255,.2)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(0,154,204,0.5)'
        })
    }),
    fill: new ol.style.Fill({
        color: 'rgba(230,249,255,.2)'
    }),
    stroke: new ol.style.Stroke({
        color: 'rgba(0,154,204,0.5)'
    })
});

// Define new source for new layer
var shapefileSource = new ol.source.Vector({
    wrapX: false 
});

// Define new layer for shapefile upload
var shapefileLayer = new ol.layer.Vector({
    name: 'shapefileLayer',
    source: shapefileSource,
    style: shapeStyle
})
map.addLayer(shapefileLayer);

// Add users shapefile upload
var file;
function loadShpZip() {            
    shapefileSource.clear();

    var check,
        encoding = ($('#options-encoding').val() == '') ? 'UTF-8' : $('#options-encoding').val(),
        epsg = ($('#options-epsg').val() == '') ? '4326' : $('#options-epsg').val();

    loadshp({
        url: file,
        encoding: encoding,
        EPSG: epsg
    }, function(data, error){
        console.log("data");
        console.log(error);
        var feature = new ol.format.GeoJSON().readFeatures(data, {
            featureProjection: 'EPSG:3857'
        });
        shapefileLayer.getSource().addFeatures(feature);
        shapefileLayer.set('name', file.name);

        var extent = shapefileLayer.getSource().getExtent();
        map.getView().fit(extent, map.getSize());
        check = true;
        console.log(check);
    });

    console.log("eh?2");
    return check;           
};         

// Show options and enable preview when user adds zipped file
$("#file").change(function(evt) {
    file = evt.target.files[0];
    var html = '<div class="field">' +                         
                 '<div id="dataName" class="ui label">' +
                   '<i class="checkmark icon"></i>' + file.name +
                   '<div id="dataSize" class="detail">' + file.size + ' kb' + 
               '</div></div></div>';
    if (file.size > 0) {
        $('#dataInfo').addClass('field').html(html);                            
        $('#options').slideDown(500);
        $('.preview-shapefile').removeClass('disabled');
    }            
});

// Clear all map features and load users shapefile 
$( '.preview-shapefile' ).click(function () {
    var dDDown = $('.drawing-dropdown');
    if (dDDown.dropdown('get value') == "None") {
        selectType = dDDown.dropdown('get value');
        map.removeInteraction(draw);
        addInteraction();
    } else {
        dDDown.dropdown('set selected', "None");
    }
//            try {
//                console.log(loadShpZip());
//                console.log("eh?3")
//            }
//            catch(err) {                
//            }
    if (loadShpZip())
        console.log("success");
    else
        console.log("failed");
});