import { Enum, State } from '../constants/Search';

export default function SearchReducer(state = State, action) {
    switch(action.type) {
        /* timelapse */
        case Enum.DateFromChanged:
            return {
                ...state,
                timelapse: {
                    ...state.timelapse,
                    begin: action.payload
                }
            };

        case Enum.DateToChanged:
            return {
                ...state,
                timelapse: {
                    ...state.timelapse,
                    end: action.payload
                }
            };

        /* manual polygon */
        case Enum.LatFromChanged:
            return {
                ...state,
                rectangle: {
                    ...state.rectangle,
                    begin: [action.payload, state.rectangle.begin[1]]
                }
            };

        case Enum.LatToChanged:
            return {
                ...state,
                rectangle: {
                    ...state.rectangle,
                    end: [action.payload, state.rectangle.end[1]]
                }
            };

        case Enum.LngFromChanged:
            return {
                ...state,
                rectangle: {
                    ...state.rectangle,
                    begin: [state.rectangle.begin[0], action.payload]
                }
            };

        case Enum.LngToChanged:
            return {
                ...state,
                rectangle: {
                    ...state.rectangle,
                    end: [state.rectangle.end[0], action.payload]
                }
            };

        /* altitude */
        case Enum.AltFromChanged:
            return {
                ...state,
                altitude: {
                    ...state.altitude,
                    begin: action.payload
                }
            };

        case Enum.AltToChanged:
            return {
                ...state,
                altitude: {
                    ...state.altitude,
                    end: action.payload
                }
            };

        /* channels/parameters */
        case Enum.ChannelsModeChanged:
            return {
                ...state,
                useChannels: action.payload
            };

        /* query handling */
        case Enum.QueryClearData:
            return {
                ...state,
                query: {
                    ...state.query,
                    devices: [],
                    channels: [],
                    parameters: []
                }
            };

        case Enum.QuerySetProject:
            return {
                ...state,
                query: {
                    ...state.query,
                    project: action.payload
                }
            };

        case Enum.QuerySetDevice:
            return {
                ...state,
                query: {
                    ...state.query,
                    devices: [...state.query.devices, action.payload]
                }
            };

        case Enum.QuerySetChannel:
            return {
                ...state,
                query: {
                    ...state.query,
                    channels: [...state.query.channels, action.payload]
                }
            };

        case Enum.QueryClearChannel:
            return {
                ...state,
                query: {
                    ...state.query,
                    channels: state.query.channels.filter((e) => e !== action.payload)
                }
            };

        case Enum.QuerySetParameter:
            return {
                ...state,
                query: {
                    ...state.query,
                    parameters: [...state.query.parameters, action.payload]
                }
            };

        case Enum.QueryClearParameter:
            return {
                ...state,
                query: {
                    ...state.query,
                    parameters: state.query.parameters.filter((e) => e !== action.payload)
                }
            };

        default:
            return state;
    }
}
