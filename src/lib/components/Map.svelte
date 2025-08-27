<script>
  import { onMount } from "svelte";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";

  let { placeData } = $props();

  let container = $state();
  let map = $state();

  function init() {
    map = new maplibregl.Map({
      container,
      style: "https://demotiles.maplibre.org/style.json",
      center: [0, 0],
      zoom: 2,
    });
		map.addControl(new maplibregl.NavigationControl({
        showZoom: true,
        showCompass: false
    }));
    map.on("style.load", () => {
      map.setProjection({
        type: "globe", // Set projection to globe
      });
    });
    map.scrollZoom.disable();
  }
  onMount(init);

	function updateMap(placeData) {
		console.log("updating map", placeData);
		if (!map || !placeData) return;

		for (const id of ["line", "points"]) {
			if (!map.getSource(id)) map.addSource(id, {
				type: "geojson",
				data: placeData[id]
			});
			else map.getSource(id).setData(placeData[id]);
		}
		
		if (!map.getLayer("line")) map.addLayer({
			id: "line",
			source: "line",
			type: "line",
			paint: {
				"line-color": "black",
				"line-opacity": 0.5,
				"line-width": 1
			}
		});

		if (!map.getLayer("markers")) map.addLayer({
			id: "markers",
			source: "points",
			type: "circle",
			paint: {
				"circle-color": "black",
				"circle-radius": 3
			}
		});

		if (!map.getLayer("names")) map.addLayer({
			id: "names",
			source: "points",
			type: "symbol",
			layout: {
				"text-field": "{name}",
				"text-anchor": "bottom",
				"text-transform": "uppercase",
				"text-offset": [0, -0.2]
			},
			paint: {
				"text-color": "black",
				"text-halo-color": "white",
				"text-halo-width": 2
			}
		});

		map.fitBounds(placeData.bbox, {padding: 20});
	}

	$effect(() => updateMap(placeData));

	$inspect(placeData);
</script>

<div class="map" bind:this={container}></div>

<style>
  .map {
    height: 480px;
  }
</style>
