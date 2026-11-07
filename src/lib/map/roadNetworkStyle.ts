import type { Map as MapLibreMap } from "maplibre-gl";

interface OriginalLayerProps {
  [layerId: string]: {
    lineColor?: any;
    lineWidth?: any;
    lineOpacity?: any;
    fillOpacity?: any;
  };
}

let originalProps: OriginalLayerProps = {};

export function toggleRoadNetworkMode(map: MapLibreMap, enable: boolean) {
  if (!map.isStyleLoaded()) return;

  const style = map.getStyle();
  if (!style || !style.layers) return;

  if (enable) {
    // Save original props and apply mission-control road network visualization
    style.layers.forEach((layer) => {
      const id = layer.id;
      const sourceLayer = (layer as any)["source-layer"] || "";
      const isRoadLayer =
        sourceLayer === "transportation" ||
        sourceLayer === "road" ||
        id.includes("road") ||
        id.includes("transport") ||
        id.includes("highway") ||
        id.includes("motorway");

      if (isRoadLayer && layer.type === "line") {
        if (!originalProps[id]) {
          originalProps[id] = {
            lineColor: map.getPaintProperty(id, "line-color"),
            lineWidth: map.getPaintProperty(id, "line-width"),
            lineOpacity: map.getPaintProperty(id, "line-opacity"),
          };
        }

        // Apply distinct hierarchical colors
        if (id.includes("motorway") || id.includes("trunk") || id.includes("primary")) {
          map.setPaintProperty(id, "line-color", "#75E6C2"); // Vibrant Teal
          map.setPaintProperty(id, "line-opacity", 1.0);
        } else if (id.includes("secondary") || id.includes("tertiary")) {
          map.setPaintProperty(id, "line-color", "#71B9E8"); // Neon Cyan
          map.setPaintProperty(id, "line-opacity", 0.9);
        } else {
          map.setPaintProperty(id, "line-color", "#4E6982"); // Cool steel for minor/residential
          map.setPaintProperty(id, "line-opacity", 0.7);
        }
      } else if (layer.type === "fill" && !id.includes("water")) {
        // Dim building and landuse footprints to make roads glow
        if (!originalProps[id]) {
          originalProps[id] = {
            fillOpacity: map.getPaintProperty(id, "fill-opacity"),
          };
        }
        map.setPaintProperty(id, "fill-opacity", 0.05);
      }
    });
  } else {
    // Restore standard view
    Object.keys(originalProps).forEach((id) => {
      if (map.getLayer(id)) {
        const props = originalProps[id];
        if (props.lineColor !== undefined) map.setPaintProperty(id, "line-color", props.lineColor);
        if (props.lineWidth !== undefined) map.setPaintProperty(id, "line-width", props.lineWidth);
        if (props.lineOpacity !== undefined) map.setPaintProperty(id, "line-opacity", props.lineOpacity);
        if (props.fillOpacity !== undefined) map.setPaintProperty(id, "fill-opacity", props.fillOpacity);
      }
    });
    originalProps = {};
  }
}
