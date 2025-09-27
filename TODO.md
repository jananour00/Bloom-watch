# TODO for SuperBloom Map Layer Enhancements

## Overview
Enhance the SuperBloomMap to use real TIFF data with lazy-loaded layers for NDVI, EVI, Soil Moisture, and Bloom Prediction. Implement on-demand rendering, accurate bounds, and smooth interactions.

## Steps

1. **[ ] Update layers array and colorScales** in `src/Components/Map/SuperBloomMap.jsx`:
   - Set `layers = ['NDVI', 'EVI', 'Soil Moisture', 'Bloom Prediction']`.
   - Adjust `colorScales` for new layers (e.g., Soil Moisture: blue scale; Bloom Prediction: green-to-purple).
   - Remove unused layers (Rainfall, Temperature, Fire, BloomStage) and update CSV filtering/mapping (use Rainfall as Soil Moisture proxy, BloomStage as Bloom Prediction).

2. **[ ] Integrate geotiff for TIFF loading** in `loadTiff` function of `src/Components/Map/SuperBloomMap.jsx`:
   - Import `parse` from 'geotiff'.
   - Fetch TIFF from `/data/SuperBloom_AllLayers_${year}.tif`.
   - Parse GeoTIFF, extract 4 bands (assume: Band 1=NDVI, 2=EVI, 3=Soil Moisture/Rainfall, 4=Bloom Prediction/BloomStage).
   - Get geospatial bounds from TIFF metadata.
   - Store raw rasters (Float32Arrays) in `tiffData` (e.g., `{ rasters: [ndviRaster, eviRaster, ...], width, height, bounds }`).
   - Fallback to CSV mock if TIFF fails.

3. **[ ] Implement lazy overlay generation** in `src/Components/Map/SuperBloomMap.jsx`:
   - Add state for `overlayCache` (object keyed by layer/year).
   - Use `useEffect` on `visibleLayers` and `selectedYear` to generate canvas/PNG only for newly visible layers (using chroma-js for coloring).
   - In JSX, render `ImageOverlay` only if `overlays[layer]` exists and visible.
   - Downsample rasters for low zoom levels (e.g., if zoom < 8, average pixels).

4. **[ ] Enhance popup data sampling** in `handleMapClick` of `src/Components/Map/SuperBloomMap.jsx`:
   - Use TIFF bounds and raster dimensions to convert lat/lng to pixel index.
   - Sample nearest or bilinear interpolated value from each visible layer's raster.
   - Display in popup with units (e.g., NDVI: 0-1, Soil Moisture: mm, Bloom Prediction: stage 0-5).

5. **[ ] Update CSS for smooth transitions** in `src/Components/Map/SuperBloomMap.css`:
   - Add `transition: opacity 0.3s ease;` to overlay images.
   - Ensure legend updates dynamically.

6. **[ ] Testing and Verification**:
   - Run `npm run dev`.
   - Load Data page, toggle layers (check lazy load in console/performance tab).
   - Change years, verify TIFF parsing (no uniform colors).
   - Click map for accurate popups, zoom/pan smoothly.
   - Test fallback (e.g., offline TIFFs).
   - Optimize if slow (e.g., worker for canvas gen).

## Dependencies
- geotiff: Already installed.
- No new installs needed.

## Notes
- Band assumptions: Adjust if TIFF structure differs (e.g., via console.log bands).
- Performance: TIFFs in public/ for static serving; consider tiling for very large files.
- Completion: Mark steps as done after each edit and test.
