import React, { Component } from 'react';

import Papa from 'papaparse';
import MarchingSquares from 'marchingsquares';
import ReactSpinner from 'react-spinjs';

import CesiumContainer from './CesiumMap';
import LeafletContainer from './LeafletMap';
import MapZoomBox from './MapZoomBox';
import MapToolbox from './MapToolBox';
import Panel from './Panel';

import { ProgressBar } from 'react-bootstrap';

import '../styles/map.css';

import { fixedPoint } from '../constants/Selection';

export default class UniversalMap extends Component {
    constructor(props) {
        super(props);

        /* bind this */
        this.preview = this.preview.bind(this);
        this.getSelection = this.getSelection.bind(this);
        this.getLastPoint = this.getLastPoint.bind(this);
        this.determineStyle = this.determineStyle.bind(this);
        this.getCurrentType = this.getCurrentType.bind(this);
        this.getCurrentIndex = this.getCurrentIndex.bind(this);
        this.setGrid = this.setGrid.bind(this);
        this.removeGrid = this.removeGrid.bind(this);

        /* make local copy of selection actions */
        this.selectionActions = this.props.selectionActions;

        /* and extend that copy */
        this.selectionActions.fixedPoint = fixedPoint;
        this.selectionActions.getLastPoint = this.getLastPoint;
        this.selectionActions.getSelection = this.getSelection;
        this.selectionActions.getCurrentType = this.getCurrentType;
        this.selectionActions.getCurrentData = this.getCurrentData;
        this.selectionActions.getCurrentIndex = this.getCurrentIndex;
    }

    componentWillReceiveProps(nextProps) {
    }

    /* next selection point coordinates callback */
    preview(data) {
        this.props.ee.emit('nextPoint', data);
    }

    /* get (current) selection item */
    getSelection(i) {
        let index = (i !== undefined ? i : this.props.selection.current);

        return this.props.selection.elements[index];
    }

    /* get current selection index */
    getCurrentIndex() {
        return this.props.selection.current;
    }

    /* get current selection type */
    getCurrentType() {
        let selection = this.getSelection();

        return selection.type;
    }

    /* get current selection data */
    getCurrentData() {
        let selection = this.getSelection();

        return selection.data;
    }

    /* get last point from current selection */
    getLastPoint() {
        let data = this.getSelection().data.slice(0);

        return data.pop();
    }

    /* adjust container style for fullscreen */
    determineStyle(options) {
        let styles = {
            position: 'relative'
        };

        if(this.props.options.full) {
            styles.display = 'block';
            styles.zIndex = 9999;
            styles.position = 'fixed';
            styles.top = 0;
            styles.right = 0;
            styles.left = 0;
            styles.bottom = 0;
            styles.overflow = 'auto';
            styles.width = options.dims.width;
            styles.height = options.dims.height;
        }

        return styles;
    }

    /* TODO: proper naming and placement */
    setGrid() {
      /* saving the step and isoline count for future reference */
      let gridStep = Number(document.getElementById('magGridStep').value);
      let isolineCount = Number(document.getElementById('magIsolineCount').value);
      let date = new Date(document.getElementById('magDate').value);

      /* composing the request URL */
      let url = 'https://www.ngdc.noaa.gov/geomag-web/calculators/calculateIgrfgrid';

      /* boundaries */
      url += '?lat1=-90&lat2=90&lon1=-180&lon2=180&coordinateSystem=M'

      /* url grid step */
      url += '&latStepSize=' + gridStep;
      url += '&lonStepSize=' + gridStep;

      /* elevation */
      url += '&elevationUnits=K&elevation=' + document.getElementById('magAlt').value;

      /* component */
      url += '&magneticComponent=' + document.getElementById('magComponent').value;

      /* model */
      url += '&model=' + document.getElementById('magModel').value;

      /* dates, currently only one */
      url += '&startYear=' + date.getFullYear()
          +  '&startMonth=' + date.getMonth()
          +  '&startDay=' + date.getDate();
      url += '&endYear=' + date.getFullYear()
          +  '&endMonth=' + date.getMonth()
          +  '&endDay=' + date.getDate();
      url += '&dateStepSize=1.0';

      /* rest of the options */
      url += '&resultFormat=csv&fragment=igrfgrid#igrfgrid';

      /* notifying the UI to show a spinner */
      this.props.mapActions.magGridRequest();

      /* requesting data */
      Papa.parse(url, {
        dynamicTyping: true,
        comments: '#',
        download: true, /* implies a worker thread */
        complete: function(results) {
          var curLat = null;
          var rowData = null;
          let magData = [];
          let minVal = null;
          let maxVal = null;

          /* will be updated from the csv */
          let maxLat = 0, maxLon = 0;

          /* converting the csv to an array */
          results.data.forEach(function(i) {
            /* skip incomplete lines */
            if(i.length<=1) return;

            /* create a new row if we jumped on a new latitude */
            if(curLat != i[1]) {
              rowData = [];
              magData.push(rowData);
              curLat = i[1];
            }

            /* update boundaries */
            if(maxLat < i[1]) { maxLat = i[1]; }
            if(maxLon < i[2]) { maxLon = i[2]; }

            /* append the values, update band limits */
            var data = i[4];
            if(minVal == null || minVal > data) { minVal = data; }
            if(maxVal == null || maxVal < data) { maxVal = data; }
            rowData.push(data);
          });

          /* generating isolines */
          let isolines = [];
          for (let i = 0; i < isolineCount; i++) {
            /* value to put the isoline at */
            let threshold = minVal + i * (maxVal-minVal) / isolineCount;
            MarchingSquares.isoContours(magData, threshold).forEach(function(contour) {
              isolines.push(contour.map(function (point) {
                /* convert from grid coordinates to lat/lon */
                /* TODO: double check the formula */
                return [
                  maxLat - point[1] * gridStep,
                  point[0] * gridStep - maxLon
                ]
              }));
            });
          }

          this.props.mapActions.magGridUpdate(isolines);
        }.bind(this),
      });
    }

    removeGrid() {
      this.props.mapActions.magGridRemove();
    }

    render() {
        let geo = this.props.geolines;
        let map = this.props.mapActions;
        let sel = this.selectionActions;
        let options = this.props.options;
        let searchOptions = this.props.searchOptions;
        let selection = this.props.selection;
        let mapStyles = this.determineStyle(options);

        /* creating a progressbar if needed */
        let loaded = this.props.options.loaded;
        let total = this.props.options.total;
        let Progress = (loaded < total) ? (
            <div className = 'mapProgressBar'>
                <ProgressBar active now = {loaded} max = {total} />
            </div> ) : null ;

        /* TODO: temporary UI for picking various magnetic grid options */
        let disabled = options.magGrid.fetching;
        let MagControl = (
          <div style={ { position: 'relative' } }>
            <label>Grid step (°)</label>
            <input disabled = {disabled} type="number" id="magGridStep" defaultValue="5"/><br/>

            <label>Isoline count</label>
            <input disabled = {disabled} type="number" id="magIsolineCount" defaultValue="20"/><br/>

            <label>Altitude (kms, sea level)</label>
            <input disabled = {disabled} type="number" id="magAlt" defaultValue="600"/><br/>

            <label>Date</label>
            <input disabled = {disabled} type="date" id="magDate" defaultValue="2017-07-17"/><br/>

            <label>Model</label>
            <select id="magModel" disabled = {disabled}>
            <option>WMM</option>
            <option>IGRF</option>
            </select><br/>

            <label>Component</label>
            <select id="magComponent" disabled = {disabled}>
            <option value="d">Declination</option>
            <option value="i">Inclination</option>
            <option value="x">X</option>
            <option value="y">Y</option>
            <option value="z">Z</option>
            <option value="f">Total intensity</option>
            <option value="h">Horizontal intensity</option>
            </select><br/>

            <button onClick = {this.setGrid} disabled = {disabled}>
            Set grid
            </button>

            <button onClick = {this.removeGrid} disabled = {disabled}>
            Remove grid
            </button>

            { disabled ? (<ReactSpinner/>) : null }
          </div>
        );

        return (
            <Panel disableDrag = {options.full} title = 'Map' className = 'mapPanel'>
                <div style = {mapStyles}>
                    <div className = 'mapContainer'>
                        <MapZoomBox onChange = {map.changeZoom} defaultZoom = {options.defaultZoom} />
                        <MapToolbox onSelect = {sel} onChange = {map} options = {options} hasSelection = {selection.current > 0} />
                        { options.flat ? (
                        <LeafletContainer
                            onPreview = {this.preview}
                            onChange = {map}
                            onSelect = {sel}
                            options = {options}
                            selection = {selection}
                            searchOptions = {searchOptions}
                        />
                        ) : (
                        <CesiumContainer
                            onPreview = {this.preview}
                            onChange = {map}
                            onSelect = {sel}
                            options = {options}
                            selection = {selection}
                            searchOptions = {searchOptions}
                        />
                        ) }
                        { Progress }
                    </div>
                </div>
                { MagControl }
            </Panel>
        );
    }
}
