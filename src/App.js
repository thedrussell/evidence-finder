import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import './css/Main.css';
import './css/PopUp.css';
import * as React from 'react';
import ReactMapGL, {Source, Layer, Popup, NavigationControl, FlyToInterpolator} from 'react-map-gl';
import Filters from './Filters/index.js';
import geoJSON from "./data/geo.json";
import { defaultMapStyle, dataLayers } from './data/map-style';

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

class App extends React.Component {

  constructor(){
    super();
      this.state = {
        mapStyle: defaultMapStyle,
        data: geoJSON,
        showPopup: false,
        currentFilter: null,
        selectedFeature: null,
        doUpdateMap: false,
        viewport: {
          latitude: 46,
          longitude: -55,
          zoom: 2.5,
          minZoom: 1,
          bearing: 0,
          pitch: 0
        }
      }

      this.mapRef = React.createRef();
  }

  componentDidMount = () => {
    this._loadMapData(geoJSON);
  }

  render = () => {
    let { mapStyle, data, viewport, showPopup } = this.state;
    return (
      <>
      <ReactMapGL
        {...viewport}
        mapStyle={mapStyle}
        width="100%"
        height="100%"
        onViewportChange={(viewport) => this.setState({
          viewport: viewport
        })}
        onClick = {this.handleMapClick}
        ref={this.mapRef}
        scrollZoom={(!showPopup)}
        maxZoom={14}
        interactiveLayerIds={
          [
            'implementation-unclustered-point',
            'implementation-clusters',
            'effect-unclustered-point',
            'effect-clusters',
          ]
        }
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}>

        {showPopup && this.displayPopup()}

        <Source id="implementation" type="geojson" data={this.state.implementationData}
            cluster={true}
            clusterMaxZoom={13}
            clusterRadius={50}>
          <Layer {...dataLayers.implementationClusterLayer} />
          <Layer {...dataLayers.implementationClusterCountLayer} />
          <Layer id="implementation-unclustered-point"
          {...dataLayers.implementationUnclusteredPointLayer} />
        </Source>

        <Source id="effectiveness" type="geojson" data={this.state.effectivenessData}
          cluster={true}
          clusterMaxZoom={13}
          clusterRadius={50}>
          <Layer {...dataLayers.effectClusterLayer} />
          <Layer {...dataLayers.effectClusterCountLayer} />
          <Layer {...dataLayers.effectUnclusteredPointLayer} />
        </Source>

        <NavigationControl
            className="nav-control"
            onViewportChange={(viewport) => this.setState({viewport: viewport})}
            showCompass={false}
          />
      </ReactMapGL>
      <Filters data={data} filterData={this.filterData}/>
      </>
    );
  }

  zoomIntoCluser = (feature) => {
    let clusterId = feature.properties.cluster_id;
    let source = feature.source;

    const mapboxSource = this.mapRef.current.getMap().getSource(source);

    mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) {
        return;
      }

      this.setState({
        viewport: {
          ...this.state.viewport,
          longitude: feature.geometry.coordinates[0],
          latitude: feature.geometry.coordinates[1],
          zoom,
          transitionDuration: 1000
        }
      })
    });
  }

  handleMapClick = (event) => {
    let { features } = event;
    const selectedFeatures = (features.length) && features.filter(f => f.source === 'implementation' || f.source === 'effectiveness');

    // If we haven't hit anything clickable do nothing.
    if (!selectedFeatures.length) {
      return
    }

    // If there's a cluster in our clicked area zoom in on it.
    let hasACluster = selectedFeatures.some((item) => item.properties.cluster);
    if (hasACluster) {
      let clusterItem = selectedFeatures.find((item) => item.properties.cluster);
      this.zoomIntoCluser(clusterItem);
      return;
    }

    // If we haven't hit a cluster, get all the unique studies
    let uniqueIDs = [];
    let uniqueFeatures = selectedFeatures.filter((item) => {
      if (uniqueIDs.includes(item.properties.unique_id))  {
        return false;
      } else {
        uniqueIDs.push(item.properties.unique_id);
        return true;
      }
    });

    // Set the selected feature to either an array of many or just one.
    let selectedFeature = (uniqueFeatures.length === 1) ? uniqueFeatures[0] : uniqueFeatures;
    // Pass in appropriate lon/lat. If it's an array just pass in the coords for the first one.
    let lon = (Array.isArray(selectedFeature)) ? selectedFeature[0].geometry.coordinates[0] : selectedFeature.geometry.coordinates[0];
    let lat = (Array.isArray(selectedFeature)) ? selectedFeature[0].geometry.coordinates[1] : selectedFeature.geometry.coordinates[1];


    let currentZoom = this.state.viewport.zoom;

    // Zoom into clicked area
    this.setState({
      showPopup: true,
      selectedFeature: selectedFeature,
      viewport: {
        ...this.state.viewport,
        longitude: lon,
        latitude: lat,
        zoom: (currentZoom > 8.5) ? currentZoom : 8.5,
        transitionInterpolator: new FlyToInterpolator(),
        transitionDuration: 800
      }
    });
  }


  displayPopup = () => {
    let { selectedFeature } = this.state;

    let isMultiple = Array.isArray(selectedFeature);
    let contentSource = (isMultiple) ? selectedFeature : [selectedFeature];

    // If we have multiple entries to show get the geometry from first one.
    let geometry = contentSource[0].geometry;
    let layerOffset = contentSource[0].layer.paint["circle-translate"];

    // Pass in either the array of features, or make an array of one and pass it
    let { coordinates } = geometry;

    // Generate content
    let content = this.generatePopupContent(contentSource);

    return (
      <Popup
      longitude={coordinates[0]}
      latitude={coordinates[1]}
      sortByDepth={true}
      closeButton={true}
      closeOnClick={false}
      onClose={this.handlePopupClose}
      offsetTop={layerOffset[0]}
      offsetLeft={layerOffset[1]}
      anchor="bottom">
      {content}
    </Popup>)
  }

  generatePopupContent = (properties) => {

    // Check if it's just one object
    let isSingle = properties.length === 1;

    let content =
    <>
      {!isSingle && <p className="popup__multiple-label">Multiple studies ({properties.length})</p>}
      <div className={`popup__inner ${!isSingle && "popup__inner--multi"}`}>
      {/* If it's not single, show the multiple studies label. */}
          {properties.map((item, i) => {
            let { type, title, url, year, authors, studyDesign } = item.properties;
            let hasUrl = (url.length > 0);
            return (
              <div className="popup__item" key={i}>
                <p className="popup__study-type">{type}, {studyDesign}</p>
                <h1 className="popup__title">
                  {hasUrl ? <a href={url} target="_blank"rel=" noopener noreferrer">{title.toLowerCase()}</a> : title.toLowerCase()}
                </h1>
                <h2 className="popup__year">
                  <strong>{year}</strong>
                </h2>
                <h3 className="popup__authors">
                  {authors.replace(/ ;/g, ",").replace(/.$/, ".")}
                </h3>
              </div>
            )
          })}
      </div>
      </>
    return content;
  }

  handlePopupClose = () => {
    // Just close pop up
    this.setState({
      showPopup: false,
      selectedFeature: false,
    })
  }

  _loadMapData = (data) => {
    // Split data into two sources
    const featureCollections = this._getFeatureCollections(data);
    // Make available in state
    this.setState({
      implementationData: featureCollections.implementation,
      effectivenessData: featureCollections.effectiveness,
    });
  }

  _getFeatureCollections = (data) => {
    // Split data into two sources.
    let implementationFeatureCollection = {...geoJSON}
    const implementationFeatures = data.features.filter(n => n.properties.type === 'Implementation');
    implementationFeatureCollection.features = implementationFeatures;

    let effectivenessFeatureCollection = {...geoJSON}
    const effectivenessFeatures = data.features.filter(n => n.properties.type === 'Effectiveness');
    effectivenessFeatureCollection.features = effectivenessFeatures;

    return {
      implementation: implementationFeatureCollection,
      effectiveness: effectivenessFeatureCollection
    }
  }

  filterData = (filters) => {
    // Filters is an array of objects with type and value

    // Create copy of data
    let data = {...geoJSON};

    // Check if have active filters
    const hasFilters = filters.length;

    if(hasFilters) {
      // We reduce the data down to only the ones with matching key:values of filters
      const filteredFeatures = data.features.reduce((filteredFeaturesArr, feature) => {

        const { properties } = feature;

        // --------
        // check if matches ALL filters <-- use if filters are dynamic
        const isExcluded = filters
          .map(filter => properties[filter.name].includes(filter.value))
          .includes(false);

        !isExcluded && filteredFeaturesArr.push(feature);
        // --------
        // // check if matches ANY filter <-- use if filters are static
        // const isIncluded = filters
        //   .map(filter => properties[filter.name].includes(filter.value))
        //   .includes(true);
        //
        // isIncluded && filteredFeaturesArr.push(feature);
        // --------

        return filteredFeaturesArr;
      }, []);

      // Returns an array of features that match the filter
      data.features = filteredFeatures;
    }

    // Update the map data
    this._loadMapData(data);
  }

}

export default App;
