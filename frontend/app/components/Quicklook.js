import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineMarkSeries, HeatmapSeries} from 'react-vis';
import { Button } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import { dataURLToBlob } from 'blob-util';
import Modal from './Modal';

// TODO: temporary workaround
const reactVisStyle = "<style>.rv-treemap{font-size:12px;position:relative}.rv-treemap__leaf{overflow:hidden;position:absolute}.rv-treemap__leaf--circle{align-items:center;border-radius:100%;display:flex;justify-content:center}.rv-treemap__leaf__content{overflow:hidden;padding:10px;text-overflow:ellipsis}.rv-xy-plot{color:#c3c3c3;position:relative}.rv-xy-plot canvas{pointer-events:none}.rv-xy-plot .rv-xy-canvas{pointer-events:none;position:absolute}.rv-xy-plot__inner{display:block}.rv-xy-plot__axis__line{fill:none;stroke-width:2px;stroke:#e6e6e9}.rv-xy-plot__axis__tick__line{stroke:#e6e6e9}.rv-xy-plot__axis__tick__text{fill:#6b6b76;font-size:11px}.rv-xy-plot__axis__title text{fill:#6b6b76;font-size:11px}.rv-xy-plot__grid-lines__line{stroke:#e6e6e9}.rv-xy-plot__circular-grid-lines__line{fill-opacity:0;stroke:#e6e6e9}.rv-xy-plot__series,.rv-xy-plot__series path{pointer-events:all}.rv-xy-plot__circular-grid-lines__line{fill-opacity:0;stroke:#e6e6e9}.rv-xy-plot__series,.rv-xy-plot__series path{pointer-events:all}.rv-xy-plot__series--line{fill:none;stroke:#000;stroke-width:2px}.rv-crosshair{position:absolute;font-size:11px;pointer-events:none}.rv-crosshair__line{background:#47d3d9;width:1px}.rv-crosshair__inner{position:absolute;text-align:left;top:0}.rv-crosshair__inner__content{border-radius:4px;background:#3a3a48;color:#fff;font-size:12px;padding:7px 10px;box-shadow:0 2px 4px rgba(0,0,0,0.5)}.rv-crosshair__inner--left{right:4px}.rv-crosshair__inner--right{left:4px}.rv-crosshair__title{font-weight:bold;white-space:nowrap}.rv-crosshair__item{white-space:nowrap}.rv-hint{position:absolute;pointer-events:none}.rv-hint__content{border-radius:4px;padding:7px 10px;font-size:12px;background:#3a3a48;box-shadow:0 2px 4px rgba(0,0,0,0.5);color:#fff;text-align:left;white-space:nowrap}.rv-discrete-color-legend{box-sizing:border-box;overflow-y:auto;font-size:12px}.rv-discrete-color-legend.horizontal{white-space:nowrap}.rv-discrete-color-legend-item{color:#3a3a48;border-radius:1px;padding:9px 10px}.rv-discrete-color-legend-item.horizontal{display:inline-block}.rv-discrete-color-legend-item.horizontal .rv-discrete-color-legend-item__title{margin-left:0;display:block}.rv-discrete-color-legend-item__color{background:#dcdcdc;display:inline-block;height:2px;vertical-align:middle;width:14px}.rv-discrete-color-legend-item__title{margin-left:10px}.rv-discrete-color-legend-item.disabled{color:#b8b8b8}.rv-discrete-color-legend-item.clickable{cursor:pointer}.rv-discrete-color-legend-item.clickable:hover{background:#f9f9f9}.rv-search-wrapper{display:flex;flex-direction:column}.rv-search-wrapper__form{flex:0}.rv-search-wrapper__form__input{width:100%;color:#a6a6a5;border:1px solid #e5e5e4;padding:7px 10px;font-size:12px;box-sizing:border-box;border-radius:2px;margin:0 0 9px;outline:0}.rv-search-wrapper__contents{flex:1;overflow:auto}.rv-continuous-color-legend{font-size:12px}.rv-continuous-color-legend .rv-gradient{height:4px;border-radius:2px;margin-bottom:5px}.rv-continuous-size-legend{font-size:12px}.rv-continuous-size-legend .rv-bubbles{text-align:justify;overflow:hidden;margin-bottom:5px;width:100%}.rv-continuous-size-legend .rv-bubble{background:#d8d9dc;display:inline-block;vertical-align:bottom}.rv-continuous-size-legend .rv-spacer{display:inline-block;font-size:0;line-height:0;width:100%}.rv-legend-titles{height:16px;position:relative}.rv-legend-titles__left,.rv-legend-titles__right,.rv-legend-titles__center{position:absolute;white-space:nowrap;overflow:hidden}.rv-legend-titles__center{display:block;text-align:center;width:100%}.rv-legend-titles__right{right:0}.rv-radial-chart .rv-xy-plot__series--label{pointer-events:none}</style>";

export default class Quicklook extends Component {
    constructor(props) {
        super(props);

        this.svg = null;

        this.width = this.props.width;
        this.height = this.props.height;
        this.saveMe = this.saveMe.bind(this);
        this.formatData = this.formatData.bind(this);
        this.makeFilename = this.makeFilename.bind(this);
        this.makeWatermark = this.makeWatermark.bind(this);
        this.data = this.formatData(this.props.data, this.props.time, this.props.data_type);
        this.data_type = this.props.data_type;
    }

    componentDidUpdate() {
        /* get rendered SVG graph element */
        if(this.el) {
            this.svg = findDOMNode(this.el).querySelector('svg');
        }
    }

    makeWatermark(canvas, context) {
        let hw = canvas.width / 2, hh = canvas.height / 2;
        let fs = 24;

        context.save();
        context.rotate( - Math.PI / 4 );

        function random(of) {
            return Math.floor((Math.random() * of) + 1);
        }

        for(let i = 0; i < hh; i ++) {
            context.font = 'italic ' + fs + 'px sans';
            context.fillStyle = 'rgba(' + random(255) + ', ' + random(192) + ', ' + random(192) + ', 0.1)';
            context.textAlign = 'center';
            context.fillText(this.props.watermarkText, random(hw * 2) - hw, i * (fs * 2));
        }

        context.restore();
    }

    makeFilename() {
        return this.props.title + ' quicklook.png';
    }

    saveMe() {
        if(this.svg) {
            var canvas = null, context = null;
            var imageData = null, image = null;

            /* setup offscreen canvas */
            canvas = document.createElement('canvas');
            canvas.width = this.props.graphWidth;
            canvas.height = this.props.graphHeight;

            /* obtain context and make white bg */
            context = canvas.getContext('2d');//offscreen.getContext('2d');
            context.fillStyle = 'white'
            context.fillRect(0, 0, canvas.width, canvas.height);

            /* create new image from svg */
            /* TODO: hardcore magic happens here, refactor the shit out of this
             * Problem: we need to include styles
             * Solution A: use canvas
             * Solution B: serialize CSS somehow
             * Solution C: use computed style
             */
            let svgtxt = new XMLSerializer().serializeToString(this.svg);
            svgtxt = svgtxt.slice(0,91) + reactVisStyle + svgtxt.slice(91);

            imageData = 'data:image/svg+xml,' + svgtxt;
            image = new Image();

            /* draw image callback */
            image.onload = function() {
                context.drawImage(image, 0, 0);

                this.makeWatermark(canvas, context);

                dataURLToBlob(canvas.toDataURL('image/png')).then(function(blob) {
                    saveAs(blob, this.makeFilename());
                }.bind(this));
            }.bind(this);

            /* set image data and trigger callback when done */
            image.src = imageData;
        } else window.alert('Quicklook is not completely loaded yet!');
    }

    formatData(data, time, data_type) {
        var formatted = new Array();

        if(data_type=="timeseries") {
            /* Adjusting the X axis to the actual duration */
            /* TODO: do we include the last second? */
            var data_duration = time.end - time.start + 1;
            var sec_per_sample = data_duration / data.length;

            /* TODO: foreach?? */
            data.map(function(item, index) {
                formatted.push({ x: sec_per_sample * index, y: item });
            })
        } else if(data_type=="fftseries") {
            data.forEach(function(item, index) {
                item.forEach(function(vitem, vindex) {
                    formatted.push({ x: index, y: vindex, color: vitem });
                });
            });
        } 
        else formatted = [{ x: 0, y: 20 }, { x: 1, y: 30 }, { x: 2, y: 10 }, { x: 3, y: 5 }, { x: 4, y: 8 }, { x: 5, y: 15 }, { x: 6, y: 10 }];

        return formatted;
    }

    render() {
        /* TODO: switch, generalise */
        let plot_obj = ( self.data_type == "timeseries" ? 
            (<LineMarkSeries data={this.data} size={3}/>) :
            (<HeatmapSeries data={this.data}/>) );

        return (
            <Modal show = {this.props.show} title = {this.props.timelapse} onClose = {this.props.onClose}>
                <h4>{this.props.title}</h4>
                <XYPlot 
                    width = { this.props.graphWidth } 
                    height = { this.props.graphHeight }
                    margin = { { left: 60, right: 10, top: 10, bottom: 40} }
                    ref = { function(node) { this.el = node; }.bind(this) }>
                    <XAxis title={this.props.xlabel}/>
                    <YAxis title={this.props.ylabel}/>
                    <HorizontalGridLines/>
                    { plot_obj }
                </XYPlot>
                
                <Button onClick = {this.saveMe}>
                    Save
                </Button>
            </Modal>
        );
    }
}

Quicklook.defaultProps = {
    grid: true,
    show: true,
    width: '100%',
    height: '100%',
    onClose: function() {;},
    graphWidth: 560, //640,
    graphHeight: 480,
    watermarkText: 'https://promis.ikd.kiev.ua',
    title: 'Quicklook description',
    xlabel: 'time (sec)', /* TODO: localisation */
    ylabel: 'y axis label'
}
