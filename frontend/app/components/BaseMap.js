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

import { GridTypes } from '../constants/Map';
import * as MapStyle from '../constants/MapStyle';

export default class BaseContainer extends Component {
    /* derived classes are expected to implement:
     * - getStyle(style) -- convert the style template into a native one
     * - makeGeoline(geoline, style) -- make a geoline object onscreen
     * - clearHandle(handle) -- remove a marker by handle
     * - setVisible(handle, bool) -- change visiblity of a marker
     */

    constructor(props) {
        super(props);

        /* TODO: no real associative arrays in JavaScript
         * the amount of geolines is okay to iterate directly
         * compared to JSON'ing everything */
        this.geolineMapping = {
            keys: [],
            handles: []
        };

        /* state and handles of grids */
        this.gridMapping = {};
        for (let gridkey in GridTypes) {
            let gridtype = GridTypes[gridkey];

            this.gridMapping[gridtype] = {
                handles: null,
                data: null,
                visible: false
            };
        }
        window.geolines = this.geolineMapping.handles;

    }

    /* creates an array of handles for a geoline and its dashed sections */
    makeGeolineSet(geoline) {
        let last = 0;
        let res = [];

        /* data inside segments are painted solidly, the rest is dashed */
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

        /* we may have left with something after the end of the last segment */
        if(geoline.geo_line.length - 1 - last > 0) {
            res.push(this.makeGeoline(geoline.geo_line.slice(last), MapStyle.SessionLeftovers));
        }

        return res;
    }

    /* traverse an array/tree/etc and apply function to each of the non-array elements */
    cascade(v,f) {
        if(v instanceof Array) {
            v.forEach(function(x) {
                this.cascade(x,f);
            }.bind(this));
        } else { /* call the function if not an array */
            f(v);
        }
    }

    componentDidMount() {
        /* call derived methods */
        this.postMount();

        /* update everything */
        this.componentWillReceiveProps(this.props);
        this.repaint();
    }

    componentWillReceiveProps(newProps) {
        /* check if the state has stuff that the map doesn't know */
        let needsRepaint = false;

        /* new geolines */
        newProps.options.geolines.forEach(function(geoline) {
            /* indexOf compares by reference (===) */
            if(this.geolineMapping.keys.indexOf(geoline) < 0) {
                this.geolineMapping.keys.push(geoline);
                this.geolineMapping.handles.push(this.makeGeolineSet(geoline));

                needsRepaint = true;
            }
        }.bind(this));

        /* check if the map has outdated geolines
         * TODO: which order of these 2 checks is better? */
        for (let i = 0; i < this.geolineMapping.keys.length; i++) {
            let geoline = this.geolineMapping.keys[i];

            if(newProps.options.geolines.indexOf(geoline) < 0) {
                /* #272: 3D geolines are messed up and don't clear up correctly */
                this.cascade(this.geolineMapping.handles[i], this.clearHandle);

                this.geolineMapping.keys.splice(i, 1);
                this.geolineMapping.handles.splice(i, 1);

                /* retry the same position since the array has shifted */
                i--;

                needsRepaint = true;
            }
        }

        /* grid isolines and visibility */
        for (let gridkey in GridTypes) {
            let gridtype = GridTypes[gridkey];
            let grid = newProps.options.grid[gridtype];
            let forceVisibilityChange = false;

            /* create/remove the handle if data changed */
            if(grid.data != this.gridMapping[gridtype].data) {
                /* if we have something currently, we need to remove it */
                if(this.gridMapping[gridtype].data != null) {
                    this.cascade(this.gridMapping[gridtype].handles, this.clearHandle);
                    this.gridMapping[gridtype].handles = null;
                    this.gridMapping[gridtype].visible = false;

                    needsRepaint = true;
                }

                /* if the new data is real, create isolines */
                if(grid.data != null) {
                    /* TODO: regular non-isoline grid */
                    this.gridMapping[gridtype].handles = this.makeIsolines(grid.data);
                    /* make sure the visibility state matches what the grid expects */
                    forceVisibilityChange = true;

                    needsRepaint = true;
                }

                this.gridMapping[gridtype].data = grid.data;
            }

            /* hide/show */
            if(grid.visible != this.gridMapping[gridtype].visible || forceVisibilityChange) {
                /* only change visibility if we have anything to show */
                if(this.gridMapping[gridtype].handles) {
                    this.cascade(this.gridMapping[gridtype].handles, function(handles) {
                        this.setVisible(handles, grid.visible);
                    }.bind(this));

                    needsRepaint = true;
                }

                /* update internal state anyway */
                this.gridMapping[gridtype].visible = grid.visible;
            }
        }

        /* If anything visibly changed, update the view */
        if(needsRepaint) {
            this.repaint();
        }
    }
};
