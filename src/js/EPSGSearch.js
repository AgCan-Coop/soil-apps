/* 

 This code implements an ESPG code search function for
 the EPSG search bar. This functionality is found in the
 OpenLayers API documentation.

 Created for inclusion with the Data Portal prototype. 
 Author: Andrew Roberts 
 Modified: 2017-04-27

*/ 
        
        
function search(query) {
    $('#epsg').val('searching...');
    fetch('https://epsg.io/?format=json&q=' + query).then(function(response) {
        return response.json();
    }).then(function(json) {
        var results = json['results'];
        result2 = json['results'];
        if (results && results.length > 0) {
            for (var i = 0, ii = results.length; i < ii; i++) {
                var result = results[i];
                if (result) {
                    var code = result['code'], name = result['name'],
                        proj4def = result['proj4'], bbox = result['bbox'];
                    if (code && code.length > 0 && proj4def && proj4def.length > 0 &&
                       bbox && bbox.length == 4) {
                        $('#epsg').val(code);
                        $('#epsg-text').text('Your current code is EPSG:' + 
                                             code + ' for ' + name +' coordinate system.');
                        return
                    }
                }
            }
        }
        $('#epsg').val("Nothing found, using EPSG:4326 (WGS84)");
        $('#epsg-text').text('')
    })
}

$('.epsg-search').click(function() {
    var query = $('#epsg').val();
    search(query);
})