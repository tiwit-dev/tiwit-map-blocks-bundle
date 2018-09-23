/*
 * Display map on front for simple map block
 */
const tiwitSimpleMap = document.querySelectorAll('.wp-block-tiwit-map-blocks-bundle-simple-map');

Array.prototype.forEach.call( tiwitSimpleMap, function(mapWrapper) {
	let mapData = mapWrapper.dataset.map

	if( mapData ){
		mapData = JSON.parse( mapData );

		if( mapData.lat && mapData.lon ){

			mapWrapper.style.height =  '70vh';

			const latLongObj = [ parseFloat( mapData.lat ), parseFloat( mapData.lon )]
			const mymap = L.map(mapWrapper).setView(latLongObj, mapData.zoom );

			L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png').addTo(mymap);
			const marker = L.marker( latLongObj ).addTo( mymap );

			// Add popup
			if( mapData.popup ){
				marker.bindPopup(mapData.popup);
			}
		}

	}
});

