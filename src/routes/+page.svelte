<script>
  import { page } from "$app/stores";
  import throttle from "throttleit";
  import "../app.css";
  import Map from "$lib/components/Map.svelte";
  import Search from "$lib/components/Search.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import ShareButtons from "$lib/components/ShareButtons.svelte";
  import { greatCircle } from "@turf/great-circle";
  import { stringInterpolator, getMaxOffset } from "$lib/js/utils.js";

  let place1 = $state();
  let place2 = $state();
  let shareOpen = $state(false);

  function getPointsFromLine(coords) {
    if (coords[0][0][0])
      return {
        coords: [coords[0].slice(0, -1), coords[1].slice(1)].flat(),
        flip: true,
      };
    return { coords };
  }

  function flipBbox(bbox) {
    const lng1 = bbox[0];
    const lng2 = bbox[2];
    bbox[0] = lng2;
    bbox[2] = lng1 + 360;
  }

  function makePlaceData(place1, place2) {
    if (!(place1 && place2)) return null;

    const place1name = place1.name.toLowerCase();
    const place2name = place2.name.toLowerCase();
    const steps = getMaxOffset(place1name, place2name);

    const places = [place1name];
    for (let i = 1; i < steps; i++) {
      const a = i / steps;
      const name = stringInterpolator(place1name, place2name, a);
      places.push(name);
    }
    places.push(place2name);

    const line = greatCircle(
      { type: "Point", coordinates: place1.coords },
      { type: "Point", coordinates: place2.coords },
      { npoints: steps + 1, offset: 100 }
    );

    const { coords, flip } = getPointsFromLine(line.geometry.coordinates);

    const points = {
      type: "FeatureCollection",
      features: places.map((name, i) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: coords[i] },
        properties: { name },
      })),
    };
    const bbox = [
      Math.min(place1.coords[0], place2.coords[0]),
      Math.min(place1.coords[1], place2.coords[1]),
      Math.max(place1.coords[0], place2.coords[0]),
      Math.max(place1.coords[1], place2.coords[1]),
    ];
    if (flip) flipBbox(bbox);
    console.log(bbox);
    return { line, points, bbox };
  }

  let placeData = $derived(makePlaceData(place1, place2));

  async function suggest(query, populateResults) {
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=jsonv2`;
    const res = await fetch(url);
    const json = await res.json();
    const results = json.map((item) => ({
      code: item.osm_type[0].toUpperCase() + item.osm_id,
      name: item.name,
      group: item.display_name
        .slice(item.name.length + 2)
        .replace(/israel$/i, "Palestine"),
      coords: [+item.lon, +item.lat],
    }));
    populateResults(results);
  }

  $inspect(place1, place2);
</script>

<main>
  <div class="flex-row">
    <h1 class="flex-left">Place name tweener</h1>
    <div class="floating-icons flex-right">
      <button class="icon-button" onclick={() => (shareOpen = !shareOpen)}
        ><Icon type="share" margin />Share</button
      >
      <ShareButtons
        message="Try this pointless tool for mixing place names on a map %23PlaceNameTweener"
        url={$page.url.href}
        bind:open={shareOpen}
      />
    </div>
  </div>
  <p class="sub-header">
    A pointless tool for mixing place names on a map, inspired by <a
      href="https://x.com/TerribleMaps/status/1806242037752111123?lang=en"
      target="_blank">this Terrible Map</a
    >.
  </p>
  <div class="flex-row">
    <div class="flex-left">
      <Search
        label="Select origin"
        suggest={throttle(suggest, 1000)}
        on:change={(e) => (place1 = e.detail)}
      />
    </div>
    <div class="flex-left">
      <Search
        label="Select destination"
        suggest={throttle(suggest, 1000)}
        on:change={(e) => (place2 = e.detail)}
      />
    </div>
  </div>

  <Map {placeData} />

  <p class="credit">
    This nonsense was coded by <a
      target="_blank"
      href="https://bsky.app/profile/bothness.bsky.social">Ahmad Barclay</a
    >. Place search powered by
    <a target="_blank" href="https://nominatim.org/">Nominatim</a>. If you want
    to waste your time doing map puzzles, try
    <a href="https://bothness.github.io/anymap/">Any Map Puzzle</a>
    Get the
    <a target="_blank" href="https://github.com/bothness/placetweener/"
      >source code</a
    >
    on Github.
  </p>
</main>

<style>
  .credit {
    font-size: 0.9em;
  }
</style>
