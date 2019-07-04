//
// Copyright 2017 Space Research Institute of NASU and SSAU (Ukraine)
//
// Licensed under the EUPL, Version 1.1 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
//
// https://joinup.ec.europa.eu/software/page/eupl
//
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
//
import Papa from 'papaparse';
import * as MarchingSquares from 'marchingsquares';
import React, { Component } from 'react';

import ToolboxButton from './ToolboxButton';
import { GridTypes } from '../constants/Map';
import * as MapStyle from '../constants/MapStyle';

/* you can set up some magnetic grid parameters here */
const GridIsolineCount = 40;        /* amount of isolines to draw [Intensity] */
const GridIsolineStep = 5;          /* step for isolines in degrees [Inclination] */
const GridStep = 5;                 /* input resolution in degrees */
const GridAltitude = 600;           /* sea level kms */
const GridModel = 'IGRF';           /* 'IGRF' or 'WMM' */
const GridDate = new Date();        /* TODO: whether we need some control over this? */

const GridComponents = {
    [GridTypes.Inclination] :  'i',
    [GridTypes.Intensity]   :  'f'
};

/* functions to generate thresholds at which to put the isolines */
const GridLines = {
    /* inclination lines are from -90° to +90° at a configurable step
     * equator is painted differently */
    [GridTypes.Inclination] :  function(minVal, maxVal) {
        let vals = [];
        let even = false;
        for(let angle = -90; angle <= 90; angle += GridIsolineStep) {
            /* equator is at 0°, for the rest, use even-odd pattern */
            let equator = (angle == 0);
            if(!equator) { even = !even; }
            let style = equator? MapStyle.GridEquator : (even? MapStyle.GridEven : MapStyle.Grid);

            vals.push({
                value: angle,
                style: style
            });
        }
        return vals;
    },
    /* intensitly lines are sampled from the value range with configurable
     * total amount of lines */
    [GridTypes.Intensity]   :  function(minVal, maxVal) {
        let vals = [];

        for (let i = 0; i < GridIsolineCount; i++) {
            vals.push({
                value: Math.floor(minVal + i * (maxVal - minVal) / GridIsolineCount),
                style: (i%2 == 0)? MapStyle.GridEven : MapStyle.Grid
            });
        }
        return vals;
    },
};

export default class GridButton extends Component {
    constructor(props) {
        super(props);

        this.actions = this.props.actions;
        this.toggleGrid = this.toggleGrid.bind(this);
    }

    toggleGrid() {
        this.actions.changeGridState(this.props.grid.type, !this.props.grid.visible);
    }

    componentDidMount() {
        /* skip altogether if the grid has no load capacity
         * or is somehow fetching already */
        if(this.props.grid.fetching === undefined || this.props.grid.fetching)
            return;

        /* notify that we are fetching */
        this.actions.changeGridFetchState(this.props.grid.type, true);

        /* clear if necessary */
        if(this.props.grid.data != null) { this.actions.clearGridData(); }

        /* composing the request URL */
        let url = 'https://www.ngdc.noaa.gov/geomag-web/calculators/calculateIgrfgrid';

        /* boundaries */
        url += '?lat1=-90&lat2=90&lon1=-180&lon2=180&coordinateSystem=M'

        /* url grid step */
        url += '&latStepSize=' + GridStep;
        url += '&lonStepSize=' + GridStep;

        /* elevation */
        url += '&elevationUnits=K&elevation=' + GridAltitude;

        /* component */
        url += '&magneticComponent=' + GridComponents[this.props.grid.type];

        /* model */
        url += '&model=' + GridModel

        /* dates, currently only one */
        url += '&startYear=' + GridDate.getFullYear()
            +  '&startMonth=' + GridDate.getMonth()
            +  '&startDay=' + GridDate.getDate();
        url += '&endYear=' + GridDate.getFullYear()
            +  '&endMonth=' + GridDate.getMonth()
            +  '&endDay=' + GridDate.getDate();
        url += '&dateStepSize=1.0';

        /* rest of the options */
        url += '&resultFormat=csv&fragment=igrfgrid#igrfgrid';

        /* requesting data */
        Papa.parse(url, {
            dynamicTyping: true,
            comments: '#',
            download: true, /* implies a worker thread */

            complete: function(results) {
                /* notifying that we are no longer fetching anything */
                this.actions.changeGridFetchState(this.props.grid.type, false);

                var curLat = null;
                var rowData = null;
                let magData = [];
                let minVal = null;
                let maxVal = null;

                /* will be updated from the csv */
                let maxLat = 0, maxLon = 0;
                let minLat = 0, minLon = 0;

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
                    if(minLat > i[1]) { minLat = i[1]; }
                    if(minLon > i[2]) { minLon = i[2]; }

                    /* append the values, update band limits */
                    var data = i[4];
                    if(minVal == null || minVal > data) { minVal = data; }
                    if(maxVal == null || maxVal < data) { maxVal = data; }
                    rowData.push(data);
                });

                let rows = magData[0].length - 1;
                let cols = magData.length - 1;

                /* convert from grid coordinates to lat/lon */
                let gridToGeo = function(point) {
                    return [
                        point[1] * (minLat - maxLat) / cols + maxLat,
                        point[0] * (maxLon - minLon) / rows + minLon
                    ];
                };

                /* generating the type-specific array of threshold values and
                 * drawing the isolines at those breaks */
                let isolines = [];

                GridLines[this.props.grid.type](minVal, maxVal).forEach(function(threshold){
                    MarchingSquares.isoContours(magData, threshold.value).forEach(function(contour) {
                        isolines.push({
                            ...threshold,
                            coords: contour.map(gridToGeo),
                        });
                    });
                });

                this.props.actions.setGridData(this.props.grid.type, isolines);
            }.bind(this),
        });
    }

    render() {
        /* show a spinner if the button is capable of loading, is actively fetching something
         * disable if its data is empty or it is fetching */
        let canload = this.props.grid.fetching !== undefined;
        let loading = canload? this.props.grid.fetching : false;
        let disabled = canload? (this.props.grid.data == null || loading): false;

        return (
            <ToolboxButton
                active = { this.props.grid.visible }
                icon = { this.props.icon }
                help = { this.props.help }
                loading = { loading }
                disabled = { disabled }
                onClick = { this.toggleGrid }
                />
        );
    }
}
