import { Enum, RESTState } from '../constants/REST';
import { getCurrentLanguage } from '../localizations/localization';
import axios from 'axios';

function makeQuery(dispatch, name, path, params) {
    dispatch({
        type: Enum[name + RESTState.pending],
        payload: true
    });

    axios.get(path, params).then(function(response) {
        dispatch({
            type: Enum[name + RESTState.completed],
            payload: response.data.results
        });
    }).catch(function(error) {
        console.log(error)
        dispatch({
            type: Enum[name + RESTState.failed],
            payload: error.response ? error.response.status : error.request
        });
    })
}

export default {
    /* rework this */
    getSingle : function(path, params, callback) {
        /* manually fixing http: links to https: see #38 */
        if(window.location.protocol == "https:" && path.startsWith("http:")) {
            path = "https:" + path.slice(5);
        }

        return function(dispatch) {
            dispatch({
                type: RESTState.pending,
                payload: true
            });

            axios.get(path, params).then(function(response) {
                dispatch({
                    type: RESTState.completed,
                    payload: true
                });
                callback(response.data);
            }).catch(function(error) {
                dispatch({
                    type: RESTState.failed,
                    payload: true
                })
                console.log(error);
            });
        }
    },
    /* ^^^^ rework this */

    resetData : function() {
        return function(dispatch) {
            dispatch({
                type: Enum.ResetData,
                payload: true
            })
        }
    },

    getProjects : function() {
        return function(dispatch) {
            let lang = getCurrentLanguage();
            makeQuery(dispatch, 'Projects', '/' + lang + '/api/projects/');
        }
    },

    getSessions : function(project, geo, begin, end) {
        return function(dispatch) {
            let lang = getCurrentLanguage();
            makeQuery(dispatch, 'Sessions', '/' + lang + '/api/sessions/', {
                params: {
                    space_project: project,
                    time_begin: begin,
                    time_end: end,
                    polygon: geo
                }
            });
        }
    },

    getChannels : function(project) {
        return function(dispatch) {
            let lang = getCurrentLanguage();
            makeQuery(dispatch, 'Channels', '/' + lang + '/api/channels/', {
                params: {
                    space_project: project
                }
            });
        }
    },


    /* disabled until proper backend filter */
    /*
    getParameters : function() {
        return function(dispatch) {
            let lang = getCurrentLanguage();
            makeQuery(dispatch, 'Parameters', '/' + lang + '/api/parameters');
        }
    },*/

    /* also disabled until proper backend filter */
    /*
    getMeasurements : function() {
        return function(dispatch) {
            let lang = getCurrentLanguage();
            makeQuery(dispatch, 'Measurements', '/' + lang + '/api/measurements', {
                params: {

                }
            });
        }
    }*/

    // TODO: freaking seriously?

    /* used until backend fix */
    getParameters : function(project) {
        return function(dispatch) {
            let lang = getCurrentLanguage();

            dispatch({
                type: Enum['Parameters' + RESTState.pending],
                payload: true
            });

            let promises = new Array();
            let parameters = new Array();

            axios.get('/' + lang + '/api/channels', {
                params: {
                    space_project: project
                }
            }).then(function(response) {
                if(Array.isArray(response.data.results) && response.data.results.length > 0) {
                    response.data.results.forEach(function(channel) {
                        promises.push(axios.get('/' + lang + '/api/parameters', {
                            params: {
                                channel: channel.id,
                                space_project: project
                            }
                        }));
                    });

                    axios.all(promises).then(axios.spread(function(...responses) {
                        responses.forEach(function(response) {
                            if(Array.isArray(response.data.results) && response.data.results.length > 0) {
                                /*dispatch({
                                    type: Enum.PushMeasurement,
                                    payload: response.data.results[0].id
                                })*/
                                parameters.push(response.data.results[0]);
                            }
                        });
                    })).then(function(){
                        dispatch({
                            type: Enum['Parameters' + RESTState.completed],
                            payload: parameters
                        });
                    });
                }
            });
        }
    },

    /* also used until backend fix */
    // TODO: schedule removal
    getMeasurements : function(sessions, usechannels, data) {
        return function(dispatch) {
            let lang = getCurrentLanguage();

            dispatch({
                type: Enum['Measurements' + RESTState.pending],
                payload: true
            });

            let promises = new Array();
            let measurements = new Array();

            sessions.forEach(function(session) {
                data.forEach(function(param) {
                    promises.push(axios.get('/' + lang + '/api/measurements', {
                        params: {
                            /* warn: needs proper backend filter */
                            channel: 0, /* << filter still works */
                            session: session.id,
                            parameter: param
                        }
                    }));
                })
            });

            axios.all(promises).then(axios.spread(function(...responses) {
                responses.forEach(function(response) {
                    if(Array.isArray(response.data.results) && response.data.results.length > 0) {
                        /*dispatch({
                            type: Enum.PushMeasurement,
                            payload: response.data.results[0].id
                        })*/
                        measurements.push(response.data.results[0]);
                    }
                });
            })).then(function(){
                dispatch({
                    type: Enum['Measurements' + RESTState.completed],
                    payload: measurements
                });

            });
        }
    },

    /* TODO: rename to getMeasurements afterwards */
    getData : function(project, geo, begin, end, channels, parameters) {
        let lang = getCurrentLanguage();

        let channel_list = channels.length == 0 ? undefined : channels.join(',');
        let parameter_list = parameters.length == 0 ? undefined : parameters.join(',');

        return function(dispatch) {
            makeQuery(dispatch, 'Measurements', '/' + lang + '/api/data/', {
                params: {
                    space_project: project,
                    time_begin: begin,
                    time_end: end,
                    polygon: geo,
                    channels: channel_list,
                    parameters: parameter_list
                }
            });
        }
    },

}
