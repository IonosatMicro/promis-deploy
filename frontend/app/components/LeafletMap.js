import React, { Component } from 'react';

import Leaflet from 'leaflet';
import LeafletBing from 'leaflet-bing-layer';
import LeafletGeodesy from 'leaflet-geodesy';

import { Types, latlngRectangle } from '../constants/Selection';
import { BingKey, GridTypes } from '../constants/Map';

import * as MapStyle from '../constants/MapStyle';

import 'leaflet/dist/leaflet.css';

export default class LeafletContainer extends Component {
    constructor(props) {
        super(props);

        /* handles */
        this.map = null;
        this.pointHandles = new Array();
        this.shapeHandles = new Array();
        this.geolineHandles = new Array();
        this.previewHandles = null;
        this.latlngHandles = null;
        this.magGridHandle = {};

        /* options */
        this.mapParams = { center: [31.5, 10.2], zoom: 1, zoomControl: false, minZoom: 1, worldCopyJump: true};
        this.bingParams = { bingMapsKey : BingKey, imagerySet : 'AerialWithLabels' };

        /* events handling */
        this.initEvents = this.initEvents.bind(this);
        this.clearEvents = this.clearEvents.bind(this);
        this.eventToPoint = this.eventToPoint.bind(this);
        this.pointToRadius = this.pointToRadius.bind(this);
        this.startDrawEvent = this.startDrawEvent.bind(this);
        this.moveDrawEvent = this.moveDrawEvent.bind(this);
        this.stopDrawEvent = this.stopDrawEvent.bind(this);
        this.voidDrawEvent = this.voidDrawEvent.bind(this);

        /* update functions */
        this.repaint = this.repaint.bind(this);
        this.updateMap = this.updateMap.bind(this);

        /* drawing functions */
        this.makeShape = this.makeShape.bind(this);
        this.clearShape = this.clearShape.bind(this);
        this.makeGeoline = this.makeGeoline.bind(this);
        this.previewShape = this.previewShape.bind(this);
        this.makeSelectionPoint = this.makeSelectionPoint.bind(this);
        this.makeIsolines = this.makeIsolines.bind(this);
    }

    /* update only for fullscreen toggling */
    shouldComponentUpdate(nextProps) {
        return (nextProps.options.full !== this.props.options.full) ||
               (this.props.options.dims.width !== nextProps.options.dims.width ||
                this.props.options.dims.height !== nextProps.options.dims.height);
    }

    repaint() {
        if(this.map) {
            this.map.invalidateSize();
        }
    }

    componentWillReceiveProps(nextProps) {
        //console.log('new propz');
        this.updateMap(nextProps);
        this.repaint();
    }

    componentDidUpdate() {
        this.repaint();
    }

    componentDidMount() {
        /* mount to div */
        if(! this.map) {
            this.map = Leaflet.map(this.mapNode, this.mapParams);
            Leaflet.tileLayer.bing(this.bingParams).addTo(this.map);
        }

        this.initEvents();
        this.updateMap();
    }

    componentWillUnmount() {
        this.clearEvents();
    }

    initEvents() {
        this.map.on('contextmenu', this.voidDrawEvent);
        this.map.on('mousedown',   this.startDrawEvent);
        this.map.on('mousemove',   this.moveDrawEvent);
        this.map.on('mouseup',     this.stopDrawEvent);
    }

    clearEvents() {
        this.map.off('contextmenu', this.voidDrawEvent);
        this.map.off('mousedown',   this.startDrawEvent);
        this.map.off('mousemove',   this.moveDrawEvent);
        this.map.off('mouseup',     this.stopDrawEvent);
    }

    makeIsolines(isodata) {
        let isolines = [];

        isodata.forEach(function(isoline){
            /* TODO: combine with makeGeoline or make global */
            let shifter = function(s) {
                return function(x) {
                    return [ x[0], x[1] + s ];
                };
            }
            let segs = [ isoline.coords, isoline.coords.map(shifter(360)), isoline.coords.map(shifter(-360)) ];

            segs.forEach(function(seg){
                let line = Leaflet.polyline(seg, this.getStyle(isoline.style));

                isolines.push(line);
            }.bind(this));

        }.bind(this));

        return isolines;
    }

    makeGeoline(xcoords, style)
    {
        let coords = xcoords.map(function(x) { return [x[0], x[1]]; });

        /* shifted geoline components */
        let lines = new Array();

        /* First point of the segment that we're currently adding */
        let anchor = 0;

        for (let i = 1; i < coords.length; i++) {
            /* If it's the last point or there is a -180/180 jump, add what we have */
            if (i + 1 == coords.length || Math.abs(coords[i][1] - coords[i - 1][1]) > 90) {
                let sliced = ( i + 1 == coords.length ) ? coords.slice(anchor) : coords.slice(anchor, i);

                /* If we are not adding the final segment, add the current point
                    mirrored, e.g. -170 is +190 and so on. */
                if (i + 1 < coords.length) {
                    let mirror = coords[i].slice();
                    let s = Math.sign(mirror[1]);

                    mirror[1] = mirror[1] - s * 360;
                    sliced.push(mirror)
                }


                /* Utility that creates shift functions for longitude */
                let shifter = function(s) {
                    return function(x) {
                        return [ x[0], x[1] + s ];
                    };
                }

                /* Adding the segment, then the same one shifted +360°/-360° */
                let segs = [ sliced, sliced.map(shifter(360)), sliced.map(shifter(-360)) ];

                for (let j = 0; j < segs.length; j++) {
                    let line = Leaflet.polyline(segs[j], this.getStyle(style));

                    lines.push(line);
                    line.addTo(this.map);
                }

                /* Recording new anchor, if it was the last point it wouldn't matter anyway */
                anchor = i;
            }
        }

        return lines;
    }

    /* remove given shape from map */
    /* TODO: is assigning to null necessary? */
    clearShape(shape) {
        if(shape && 'remove' in shape) {
            shape.remove();
            shape = null;
        }
    }

    /* recursively clear an array */
    clearShapes(shapes) {
        if(shapes && 'length' in shapes) {
            while(shapes.length > 0) {
                let shape = shapes.pop();
                this.clearShape(shape);
            }
        }
    }

    /* make 3 copies of the same shape at 0 and ±360°, return an array */
    makeShapes(type, data, opts) {
        /* TODO: can we merge this with makeGeoline? */
        let shifts = [ 0, -360, 360 ];
        let shapes = new Array();

        shifts.forEach(function(shift) {
            shapes.push(this.makeShape(type, data, opts, shift));
        }.bind(this));

        return shapes;
    }

    /* make shape from current selection */
    makeShape(type, data, opts, shift = 0) {
        let shape = null;
        let options = (opts !== undefined ? opts : this.getStyle(MapStyle.Selection));

        switch(type) {
            case Types.Rect:
                let bounds = [ [ data[0][0], data[0][1] + shift ], [ data[1][0], data[1][1] + shift ] ];
                shape = Leaflet.rectangle(bounds, options);
            break;

            case Types.Circle:
                let center = [ data[0][0], data[0][1] + shift ];
                /* Picking up a good amount of points for approximation */
                /* TODO: currently 1 point pert 10000 meters of radius */
                options.parts = Math.trunc(data[1] / 10000)

                shape = LeafletGeodesy.circle(center, data[1], options);
            break;

            case Types.Polygon:
                /* TODO: we only support normal polygons w/o holes and multipolygons okay? */
                let points = new Array(data.length);
                for(let i = 0; i < data.length; i++) {
                    points[i] = [ data[i][0], data[i][1] + shift ];
                }
                shape = Leaflet.polygon(points, options);
            break;
        }

        if(shape) {
            shape.addTo(this.map);
        }

        return shape;
    }

    /* make preview shape */
    previewShape(newpoint) {
        let temp = null;
        let last = this.props.onSelect.getLastPoint();
        let type = this.props.onSelect.getCurrentType();

        if(last) {
            /* calc radius for circles or just assign new point */
            if(type == Types.Circle) {
                temp = this.pointToRadius(last, newpoint);
            } else {
                temp = newpoint;
            }

            /* clear last preview */
            this.clearShapes(this.previewHandles);

            /* and make new one */
            this.previewHandles = this.makeShapes(type, new Array(last, temp), this.getStyle(MapStyle.SelectionPreview));
        }
    }

    /* make anchor point of selection */
    makeSelectionPoint(location) {
        if(location) {
            let point = Leaflet.circleMarker(location, this.getStyle(MapStyle.SelectionHandle));

            point.setRadius(MapStyle.SelectionHandle.radius);
            point.addTo(this.map);

            return point;
        }

        return null;
    }

    /* TODO: generalize, see #244 */
    makeRegularGrid() {
        let grid = [];
        for (let lat = -90, even = false; lat <= 90; lat+=10, even = !even) {
            grid.push(Leaflet.polyline([[lat, -540],[lat, 540]], this.getStyle(even ? MapStyle.GridEven : MapStyle.Grid)));
        }

        for (let lon = -540, even = false; lon <= 540; lon+=10, even = !even) {
            grid.push(Leaflet.polyline([[-90, lon],[90, lon]], this.getStyle(even ? MapStyle.GridEven : MapStyle.Grid)));
        }
        return grid;
    }

    /* update visible areas according to current state */
    updateMap(maybeProps) {
        // TODO: rewrite this mess, use setLatLng to update existing elements rather than adding and deleting
        // in order to reduce flickering
        let props = maybeProps !== undefined ? maybeProps : this.props;

        if(! props.selection.active) {
            for (let gridkey in GridTypes) {
                let gridtype = GridTypes[gridkey];
                let grid = props.options.grid[gridtype];

                /* TODO: refactor */
                if (gridtype == GridTypes.Geographic) {
                    if (this.magGridHandle[gridtype] == null) {
                        this.magGridHandle[gridtype] = this.makeRegularGrid();
                    }
                } else {
                    if(Array.isArray(grid.data) && this.magGridHandle[gridtype] == null) {
                        this.magGridHandle[gridtype] = this.makeIsolines(grid.data);
                    } else if (grid.data == null && this.magGridHandle[gridtype] != null) {
                        this.magGridHandle[gridtype].forEach(function(handle) {
                            this.clearShape(handle);
                        }.bind(this));
                        this.magGridHandle[gridtype] = null;
                    }
                }

                /* visibility control */
                // TODO: constantly adding/removing might be excessive, general fix coming in #244
                if(this.magGridHandle[gridtype]) {
                    if(grid.visible) {
                        this.magGridHandle[gridtype].forEach(function(shape) {
                            shape.addTo(this.map);
                        }.bind(this));
                    } else {
                        this.magGridHandle[gridtype].forEach(function(shape) {
                            shape.removeFrom(this.map);
                        }.bind(this));
                    }
                }
            }

            /* clear geolines */
            this.geolineHandles.forEach(function(handle) {
                this.clearShape(handle);
            }.bind(this));

            /* draw new geolines if they're present */
            if(Array.isArray(props.options.geolines) && props.options.geolines.length > 0) {
                this.geolineHandles = new Array();

                props.options.geolines.forEach(function(geoline) {
                    // TODO generalise to UniversalMap
                    // TODO stub code
                    let last = 0;
                    geoline.selection.forEach(function(segment) {
                        let seg = { start: segment.start - geoline.offset,
                                    end: segment.end - geoline.offset };

                        // +1 to include seg.start and seg.end
                        if(seg.start - last > 0) {
                            this.makeGeoline(geoline.geo_line.slice(last, seg.start + 1), MapStyle.SessionLeftovers).forEach(function(handle) {
                                this.geolineHandles.push(handle);
                            }.bind(this));
                        }

                        if(seg.end - seg.start > 0) {
                            this.makeGeoline(geoline.geo_line.slice(seg.start, seg.end + 1), MapStyle.Session).forEach(function(handle) {
                                this.geolineHandles.push(handle);
                            }.bind(this));
                        }

                        last = seg.end;
                    }.bind(this));

                    if(geoline.geo_line.length - 1 - last > 0) {
                        this.makeGeoline(geoline.geo_line.slice(last), MapStyle.SessionLeftovers).forEach(function(handle) {
                            this.geolineHandles.push(handle);
                        }.bind(this));
                    }
                }.bind(this));
                // TODO end of stub code
            }

            /* clear old shapes */
            this.clearShapes(this.previewHandles);

            this.shapeHandles.forEach(function(handle) {
                this.clearShapes(handle);
            }.bind(this));

            /* clear old selection points */
            this.pointHandles.forEach(function(point) {
                this.clearShape(point);
            }.bind(this));

            /* if there's some selection, draw it */
            if(props.selection.current > 0) {
                this.shapeHandles = new Array();
                this.pointHandles = new Array();

                props.selection.elements.forEach(function(selection, rootIndex) {
                    if(selection.data.length) {
                        let selected = (rootIndex == props.selection.highlight ? this.getStyle(MapStyle.SelectionHighlight) : undefined);
                        this.shapeHandles.push(this.makeShapes(selection.type, selection.data, selected));

                        selection.data.every(function(point, itemIndex) {
                            this.pointHandles.push(this.makeSelectionPoint(point));
                            // point drag handler here

                            /* break if we've got a circle */
                            return selection.type != Types.Circle;
                        }.bind(this));
                    }
                }.bind(this));
            }

            /* if there is a manual input on geography filter, draw it */
            this.clearShapes(this.latlngHandles);

            let latlng = latlngRectangle(props.searchOptions.rectangle);
            if(latlng) {
                this.latlngHandles = this.makeShapes(latlng.type, latlng.data, this.getStyle(MapStyle.Selection));
            }
        }
    }

    /* shortcut */
    eventToPoint(e) {
        return new Array(this.props.onSelect.fixedPoint(e.latlng.lat), this.props.onSelect.fixedPoint(e.latlng.lng));
    }

    /* another shortcut */
    pointToRadius(from, to) {
        let latlng = Leaflet.latLng(from);

        return latlng.distanceTo(Leaflet.latLng(to));
    }

    startDrawEvent(e) {
        if(this.props.selection.active) {
            this.map.dragging.disable();

            this.props.onSelect.addToSelection(this.eventToPoint(e));
        }
    }

    moveDrawEvent(e) {
        if(this.props.selection.active) {
            let point = this.eventToPoint(e);

            this.previewShape(point);

            if(this.props.onPreview) {
                this.props.onPreview(point);
            }
        }
    }

    stopDrawEvent(e) {
        if(this.props.selection.active) {
            this.map.dragging.enable();

            let point = this.eventToPoint(e);

            /* add radius instead of coords if dealing with circle */
            if(this.props.onSelect.getCurrentType() == Types.Circle) {
                point = this.pointToRadius(this.props.onSelect.getLastPoint(), point);
            }

            this.props.onSelect.addToSelection(point);
            this.props.onSelect.finishSelection();
            this.props.onChange.toggleFlush();
        }
    }

    voidDrawEvent(event) {
        if(this.props.selection.active) {
            this.map.dragging.enable();
            this.props.onSelect.discardSelection();
            this.props.onChange.toggleFlush();
        }
    }

    render() {
        var zoom = this.props.options.zoom;
        var height = {height: this.props.options.full ? this.props.options.dims.height : 350};

        return (
            <div>
                <div style = {height} ref = { function(node) { this.mapNode = node; }.bind(this) } id = 'leaflet'></div>
            </div>
        )
    }

    /* convert the Constants/Map style notation to leaflet style */
    getStyle(style) {
        var st = {};

        st.color = style.stroke;
        st.weight = style.width;
        st.opacity = style.strokeAlpha;

        if(style.fill) {
            st.fillColor = style.fill;
            st.fillOpacity = style.fillAlpha;
        }

        if(style.dashed) {
            st.dashArray = '5, 10';
        }

        return st;
    }
}
