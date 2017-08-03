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
import React, { Component } from 'react';

import * as MapStyle from '../constants/MapStyle';

export default class BaseContainer extends Component {
    constructor(props) {
        super(props);

        /* TODO: no real associative arrays in JavaScript
         * the amount of geolines is okay to iterate directly
         * compared to JSON'ing everything */
        this.geolineMapping = {
            keys: [],
            handles: []
        };
    }

    /* creates an array of handles for a geoline and its dashed sections */
    makeGeolineSet(geoline) {
        let last = 0;
        let res = [];

        geoline.selection.forEach(function(segment) {
            let seg = { start: segment.start - geoline.offset,
                        end: segment.end - geoline.offset };

            /* +1 to include seg.start and seg.end */
            if(seg.start - last > 0) {
                res.push(this.makeGeoline(geoline.geo_line.slice(last, seg.start + 1), MapStyle.SessionLeftovers));
            }

            if(seg.end - seg.start > 0) {
                res.push(this.makeGeoline(geoline.geo_line.slice(seg.start, seg.end + 1), MapStyle.Session));
            }

            last = seg.end;
        }.bind(this));

        if(geoline.geo_line.length - 1 - last > 0) {
            res.push(this.makeGeoline(geoline.geo_line.slice(last), MapStyle.SessionLeftovers));
        }
    }

    /* recursively clear the handles */
    clearHandles(handles) {
        if(handles instanceof Array) {
            handles.forEach(function(handle) {
                this.clearHandles(handle);
            }.bind(this));
        } else { /* call the derived method if not an array */
            //this.clearHandle(handles);
        }
    }

    componentWillReceiveProps(newProps) {
        /* check if the state has geolines that the map doesn't know */
        newProps.options.geolines.forEach(function(geoline) {
            /* indexOf compares by reference (===) */
            if(this.geolineMapping.keys.indexOf(geoline) < 0) {
                this.geolineMapping.keys.push(geoline);
                this.geolineMapping.handles.push(this.makeGeolineSet(geoline));
            }
        }.bind(this));

        /* check if the map has outdated geolines
         * TODO: which order of these 2 checks is better? */
        for (let i = 0; i < this.geolineMapping.keys.length; i++) {
            let geoline = this.geolineMapping.keys[i];

            if(newProps.options.geolines.indexOf(geoline) < 0) {
                this.geolineMapping.keys.splice(i, 1);
                this.clearHandles(this.geolineMapping.handles[i]);
                this.geolineMapping.handles.splice(i, 1);

                /* retry the same position since the array has shifted */
                i--;
            }
        }
    }

    /* derived classes are expected to implement:
     * - getStyle(style) -- convert the style template into a native one
     * - setVisibility(handle, bool) -- show/hide a map marker
     * - createGeoline(geoline) -- make a geoline object onscreen
     */
};
