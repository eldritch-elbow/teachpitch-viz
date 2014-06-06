var geojson;
var info = L.control();

var count_threshold = 25;

function getColor(d, max_linear_val) {
	inc = max_linear_val / 6
	return d > (inc*6) ? '#b10026' : d > (inc*5) ? '#e31a1c' : d > (inc*4) ? '#fc4e2a' : d > (inc*3) ? '#fd8d3c' : d > (inc*2) ? '#feb24c' : d > (inc*1) ? '#fed976' : '#ffffb2';
}

function style(feature) {
	return {
		fillColor: getColor(countData[feature.id], count_threshold),
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7
	};
}

function highlightFeature(e) {
	var layer = e.target;
	layer.setStyle({
		weight: 5,
		color: '#666',
		dashArray: '',
		fillOpacity: 0.7
	});
	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}
	info.update(layer.feature);
}

function resetHighlight(e) {
	geojson.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
}
info.onAdd = function(map) {
	this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	this.update();
	return this._div;
};
// method that we will use to update the control based on feature properties passed
info.update = function(feature) {

	this._div.innerHTML = 
		'<h4>Teachers By Country</h4>' + 
		(feature ? 
			'<b>' + feature.properties.name + '</b>'+			
			'<br/>' + 
			(countData[feature.id] || 0) + '00 teachers'
		: 'Hover over a region');
};




var map = L.map('map').setView([37.8, 0], 2);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; ' + '<a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ',
}).addTo(map);

var geojson = null;
function refreshGeojson() {

if (geojson) {
		map.removeLayer(geojson);
	}

	geojson = L.geoJson(regionData, {
		style: style,
		onEachFeature: onEachFeature
	}).addTo(map);

}

refreshGeojson();



info.addTo(map);


var filter_panel = L.control({position: 'bottomleft'});

filter_panel.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'control filter'); 
    this.update();
    return this._div;
};


filter_panel.update = function (props) {
    this._div.innerHTML = 
		'<div id="threshold_control">'+
	        '<div id="threshold_display"></div><br>'+
	        '<div id="threshold_slider"></div>'+
		'</div>';
};

filter_panel.addTo(map);

	threshold_slider = $("#threshold_slider");
	threshold_display = $("#threshold_display");

max_count = 0;

$.each( countData , function( index, value ) {
	max_count =Math.max(max_count, value)
});

	/* Create threshold slider, display initial value */
    threshold_slider.slider({
        range: false,
        min:   1,
        max:   max_count,
        value: count_threshold,
        step:  1,
        slide: slide_threshold
    });


function update_threshold_display( ) {
	threshold_display = $("#threshold_display");
	threshold_display.text( 'Teacher count threshold: ' + count_threshold);
}

function slide_threshold(event, ui) {
	console.log(ui.value);

count_threshold = ui.value;
	update_threshold_display()

	refreshGeojson();

}

update_threshold_display();

	$('.control').mouseenter(function() {
	  map.dragging.disable();
	  map.doubleClickZoom.disable();
	});

	$('.control').mouseleave(function() {
	  map.dragging.enable();
	  map.doubleClickZoom.enable();
	});

