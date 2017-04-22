import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row, Well } from 'react-bootstrap';

import Nav from '../components/Nav';
import Panel from '../components/Panel';

import mapActionsCreators from '../actions/Map';
import genActionsCreators from '../actions/Generic';
import selActionsCreators from '../actions/Selection';

import MapPanel from '../components/UniversalMap';
import TimeAndPositionPanel from '../components/TimeAndPosition';


class App extends Component {
    constructor(props) {
        super(props);

        this.updateDimensions = this.updateDimensions.bind(this);
    }

    componentDidMount() {
        this.updateDimensions();

        window.addEventListener('resize', this.updateDimensions.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions.bind(this));
    }

    updateDimensions() {
        /* pass new size to map */
        var dims = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        this.props.mapActions.toggleDims(dims);
    }

    render() {
        return (
            <div>
                <Nav />
                <div style = {{ width: '95%', margin: '0 auto' }}>
                    <Well bsSize="large">
                        <h3>Ionosat PROMIS</h3>
                        <p>We are glad to welcome you on this page. Please use the filters below to refine your search</p>
                    </Well>
                    <Row>
                        
                            <TimeAndPositionPanel options = {this.props.inputOptions} selection = {this.props.selection} actions = {this.props.genActions} />
                        
                        <Panel>Panel two</Panel>
                    </Row>
                    <Row>
                        { this.props.inputOptions.mapEnabled &&
                        <MapPanel
                            selection = {this.props.selection}
                            options = {this.props.mapOptions}
                            actions = {this.props.mapActions}
                        />
                        }
                        <Panel>Panel four</Panel>
                    </Row>
                </div>
            </div>
        )
    }
}

/* Redux state to App props */
function mapStateToProps(state) {
    return {
        inputOptions: state.Generic,
        mapOptions: state.Map,
        selection: state.Selection
    }
}

/* Bind actions(events) to dispatch (allow event flow via Redux */
function mapDispatchToProps(dispatch) {
    return {
        mapActions : bindActionCreators(mapActionsCreators, dispatch),
        genActions : bindActionCreators(genActionsCreators, dispatch),
        selActions : bindActionCreators(selActionsCreators, dispatch)
    }
}

/* connect to Redux and export */
export default connect(mapStateToProps, mapDispatchToProps)(App);
