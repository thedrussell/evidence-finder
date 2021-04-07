import MAP_STYLE from './style/style.json';

const defautLayer = {
      "id": "data",
      "type": "symbol",
      "source": "studiesByLocation",
      "layout": {
          "icon-image": "marker-15",
          "icon-allow-overlap": {
              "base": 1,
              "stops": [[0, true], [22, true]]
          },
          "icon-size": {"base": 1, "stops": [[0, 1], [18, 3]]}
      },
      "paint": {}
  }


  export const implementationClusterLayer = {
    id: 'implementation-clusters',
    type: 'circle',
    source: 'implementation',
    filter: ['has', 'point_count'],
    paint: {
      // Base colour, change based on increasing thing
      'circle-color': ['step', ['get', 'point_count'], '#5DB5BC', 100, '#5DB5BC', 750, '#5DB5BC'],
      'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 30, 25],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    }
  };

  export const implementationClusterCountLayer = {
    id: 'implementation-cluster-count',
    type: 'symbol',
    source: 'implementation',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['Roboto Regular', 'Arial Unicode MS Bold'],
      'text-size': 12
    }
  };

  export const implementationUnclusteredPointLayer = {
    id: 'implementation-unclustered-point',
    type: 'circle',
    source: 'implementation',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#5DB5BC',
      'circle-radius': {
      'base': 1.75,
      'stops': [
          [4, 4],
          [12, 6],
          [22, 200]
        ]
      },
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    }
  };

  export const effectClusterLayer = {
    id: 'effect-clusters',
    type: 'circle',
    source: 'effectiveness',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], '#ED716D', 100, '#ED716D', 750, '#ED716D'],
      'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 30, 25],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    }
  };

  export const effectClusterCountLayer = {
    id: 'effect-cluster-count',
    type: 'symbol',
    source: 'effectiveness',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['Roboto Regular', 'Arial Unicode MS Bold'],
      'text-size': 12
    }
  };

  export const effectUnclusteredPointLayer = {
    id: 'effect-unclustered-point',
    type: 'circle',
    source: 'effectiveness',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#ED716D',
      'circle-radius': {
      'base': 1.75,
      'stops': [
          [4, 4],
          [12, 6],
          [22, 180]
        ]
      },
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff',
    }
  };

export const dataLayers = {
  default: defautLayer,
  implementationClusterLayer: implementationClusterLayer,
  implementationClusterCountLayer: implementationClusterCountLayer,
  implementationUnclusteredPointLayer: implementationUnclusteredPointLayer,
  effectClusterLayer: effectClusterLayer,
  effectClusterCountLayer: effectClusterCountLayer,
  effectUnclusteredPointLayer: effectUnclusteredPointLayer,
};

export const defaultMapStyle = MAP_STYLE
