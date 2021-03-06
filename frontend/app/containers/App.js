import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';

import Nav from '../components/Nav';
import Panel from '../components/Panel';
import Footer from '../components/Footer';

import mapActionsCreators from '../actions/Map';
import userActionsCreators from '../actions/User';
import RESTActionsCreators from '../actions/REST';
import searchActionsCreators from '../actions/Search';
import selectionActionsCreators from '../actions/Selection';

import MapPanel from '../components/UniversalMap';
import TimeAndPositionPanel from '../components/TimeAndPosition';

import SearchForm from '../components/SearchForm.js';
import SearchResults from '../components/SearchResults.js';

import {strings, getCookie, getInterfaceLanguage, setLanguage } from '../localizations/localization'
import EventEmitter from 'event-emitter';

class App extends Component {
    constructor(props) {
        super(props);

        /* redux is too slow here */
        this.ee = new EventEmitter();

        this.updateDimensions = this.updateDimensions.bind(this);

        this.props.userActions.profile();

        /* localisation settings */
        let language = getCookie("lang") || getInterfaceLanguage() || "en";
        if (language.toLowerCase().slice(0, 2) === "ru"){
            setLanguage('uk');
        } else {
            setLanguage(language);
        }
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
        };

        this.props.mapActions.toggleDims(dims);
    }

    render() {

        /* hide possible scrollbar when resizing to ultralow dimensions in fullscreen mode */
        document.body.style.overflow = (this.props.mapOptions.full ? 'hidden' : null);

        return (
            <div>
                <Nav actions = {this.props.userActions} userData = {this.props.userData} />
                <div className="main-part">
                    <Col md={6} sm={12}>
                        <Row>
                            <TimeAndPositionPanel
                                ee = {this.ee}
                                options = {this.props.searchOptions}
                                selection = {this.props.selection}
                                selectionActions = {this.props.selectionActions}
                                searchActions = {this.props.searchActions}
                            />
                        </Row>
                        <Row>
                            <MapPanel
                                ee = {this.ee}
                                selection = {this.props.selection}
                                options = {this.props.mapOptions}
                                searchOptions = {this.props.searchOptions}
                                mapActions = {this.props.mapActions}
                                selectionActions = {this.props.selectionActions}
                            />
                        </Row>
                    </Col>
                    <Col md={6} sm={12}>
                        <Row>
                            <Panel title = {strings.searchTitle}>
                                <SearchForm
                                    storage = {this.props.storage}        /* generic storage for api data */
                                    options = {this.props.searchOptions}   /* general options, datetime, etc */
                                    mapped  = {this.props.mapActions}     /* for geoline management */
                                    actions = {this.props.RESTActions}     /* api-related actions */
                                    search = {this.props.searchActions}     /* for setting time back */
                                    selected = {this.props.selectionActions}    /* for flushing selection */
                                    selection = {this.props.selection}    /* selection array */
                                    results = {this.props.storage.measurements}
                                />
                            </Panel>
                        </Row>
                        <Row>
                            <Panel title = {strings.searchResultTitle}>
                                <SearchResults
                                    results = {this.props.storage.measurements}
                                    options = {this.props.searchOptions}
                                    storage = {this.props.storage}
                                    actions = {this.props.RESTActions}
                                    mapped  = {this.props.mapActions}     /* for geoline management */
                                    /* TODO: remove temporary code */
                                    map     = {this.props.mapOptions}
                                />
                            </Panel>
                        </Row>
                    </Col>
                </div>
                <Footer/>
            </div>
        )
    }
}

/* Redux state to App props */
function mapStateToProps(state) {
    return {
        searchOptions: state.Search,
        mapOptions: state.Map,
        selection: state.Selection,
        userData: state.User,
        storage: state.REST
    }
}

/* Bind actions(events) to dispatch (allow event flow via Redux */
function mapDispatchToProps(dispatch) {
    return {
        mapActions       : bindActionCreators(mapActionsCreators, dispatch),
        searchActions    : bindActionCreators(searchActionsCreators, dispatch),
        selectionActions : bindActionCreators(selectionActionsCreators, dispatch),
        RESTActions      : bindActionCreators(RESTActionsCreators, dispatch),
        userActions      : bindActionCreators(userActionsCreators, dispatch)
    }
}

/* connect to Redux and export */
export default connect(mapStateToProps, mapDispatchToProps)(App);
