# GeoJSON Atlas

A curated collection of GeoJSON maps for the world, its countries, and regions. All maps are published under the CC0 license, meaning they are in the public domain. Feel free to use them for any purpose without attribution.

> ⚠️IMPORTANT⚠️ **Border policy:** Country borders follow the Natural Earth project's definitions (explained [here](https://www.naturalearthdata.com/about/disputed-boundaries-policy/)). By providing the maps in this repository, the authors and contributors do not take a stance on geopolitical disputes and do not wish to be involved in them. Requests to alter geopolitical borders in this repository are **not accepted**. You are welcome to fork the repository and make any adjustments you see fit for your own use case.

The `geojson` folder in this project contains:

- World country maps in 110m, 50m and 10m resolutions.
- Country-level files with admin-1 subdivisions (states and provinces) in 10m resolution.
- Postprocessed country geometries for practical rendering use-cases (antimeridian-safe and mainland variants).
- Region maps (currently Africa, Europe, North America, South America, Oceania).
- Projected map variants (exported in pseudo-WGS84 coordinates specifically for Web Mercator renderers).

## Map Variants and Naming

- Standard country files: ISO-A2-based names such as `DE.geojson`.
- `-joined` suffix: geometries adjusted to avoid antimeridian splits.
- `-main` suffix: mainland-focused variants with far-away overseas areas removed.
- Projected world map variants: filename includes projection suffix, for example `-mollweide`, `-miller`, `-behrmann`.
- Regions:
    - Europe: currently WGS84 and Lambert Conformal Conic (lcc) variants.
    - Asia: currently WGS84 and Lambert Conformal Conic (lcc) variants.
        - Western Asia / Middle East: currently WGS84.
        - Central Asia: currently WGS84.
        - Southern Asia: currently WGS84.
        - Eastern Asia: currently WGS84.
        - South-Eastern Asia: currently WGS84.
    - North America: currently WGS84 and Equidistant Conic (eqdc) variants.
    - South America: currently WGS84 and Equidistant Conic (eqdc) variants.
    - Africa: currently WGS84 and Equidistant Conic (eqdc) variants.
    - Oceania: currently WGS84 and Lambert Azimuthal Equal-Area (laea) variants.

## Projection Behavior

Projected GeoJSON files contain pseudo-WGS84 coordinates intended for display in renderers that use the Web Mercator projection (e.g. Leaflet). They are produced by projecting first from WGS84 to the desired target projection (e.g. LCC) and then a second time from Web Mercator to WGS84. The second projection is reversed by the renderer (who will project from WGS84 to Web Mercator), leaving us with the desired target projection. The advantages are two-fold:
1) We don't have to rely on the renderer to offer the desired target projection.
2) We don't have to re-project on the client side, which can be expensive for large datasets.

This keeps data easy to consume in common web mapping stacks. The downside is that the coordinates in the projected GeoJSON files are not in standard WGS84 format and will not fit on common tile layers.

## Similar Projects

https://geojson-maps.kyd.au also provides country and region shapes based on Natural Earth data. Compared to geojson-maps, we additionally offer:
- country maps that include admin-1 subdivisions (states, provinces).
- country-level variants without far-away overseas areas (e.g. France's overseas territories).
- country-level variants that mediate the antimeridian split issue (e.g. the Chukchi Peninsula in Russia or Alaskan islands in the US).
- world and regional maps in different projections.

## Data Source

All source geometries come from the Natural Earth project:

- https://www.naturalearthdata.com
- https://github.com/nvkelso/natural-earth-vector

## Repository Structure

- `geojson`: contains the generated maps in GeoJSON format.
- `src`: contains NodeJS scripts to generate the maps.

## Contribute & Development

You don't need to install anything to use the GeoJSON files. You can download them directly from GitHub. However, if you want to contribute to this project you need NodeJS.

To install the project dependencies:
~~~bash
npm install
~~~

To run the full generation pipeline:
~~~bash
npm run all
~~~

To run individual stages:
~~~bash
npm run download
npm run extract_countries
npm run postprocess_countries
npm run project_world
npm run create_europe
npm run create_north_america
npm run create_south_america
npm run create_africa
npm run create_oceania
npm run create_asia
npm run create_western_asia
npm run create_central_asia
npm run create_southern_asia
npm run create_south-eastern_asia
npm run create_eastern_asia
~~~

## License

Creative Commons Zero v1.0 Universal (CC0).
