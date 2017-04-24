import React, { Component } from 'react';

import CesiumContainer from './CesiumMap';
import LeafletContainer from './LeafletMap';
import MapZoomBox from './MapZoomBox';
import MapToolbox from './MapToolBox';
import Panel from './Panel';

export default class UniversalMap extends Component {
    constructor(props) {
        super(props);

        this.updateMap = this.updateMap.bind(this);
        this.determineStyle = this.determineStyle.bind(this);
    }

    updateMap() {

    }

    determineStyle(options) {
        var styles = {
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

    render() {
        var actions = this.props.actions;
        var options = this.props.options;
        var selection = this.props.selection;
        var mapStyles = this.determineStyle(options);

        return (
            <Panel disableDrag = {options.full} title = 'Map' className = 'mapPanel'>
                <div style = {mapStyles}>
                    <div className = 'mapContainer'>
                        <MapZoomBox onChange = {actions.toggleZoom} defaultZoom = {options.defaultZoom} />
                        <MapToolbox onChange = {actions} options = {options} hasSelection = {selection.current > 0} />
                        { options.flat ? (
                        <LeafletContainer onChange = {actions.updateMap} options = {options} selection = {selection} />
                        ) : (
                        <CesiumContainer onChange = {actions.updateMap} options = {options} selection = {selection} />
                        ) }
                    </div>
                </div>
            </Panel>
        );
    }
}