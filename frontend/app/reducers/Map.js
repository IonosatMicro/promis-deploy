import { Enum, State } from '../constants/Map';

export default function MapReducer(state = State, action) {
    switch(action.type) {
        case Enum.ZoomChanged:
            return {
                ...state,
                zoom: action.payload
            };
        break;

        case Enum.SizeChanged:
            return {
                ...state,
                full: action.payload
            };
        break;

        case Enum.DimsChanged:
            return {
                ...state,
                dims: {
                    width: action.payload.width,
                    height: action.payload.height
                }
            };
        break;

        case Enum.ModeChanged:
            return {
                ...state,
                flat: action.payload
            };
        break;

        case Enum.RectChanged:
            return {
                ...state,
                rect: action.payload
            };
        break;

        case Enum.PolyChanged:
            return {
                ...state,
                poly: action.payload
            };
        break;

        case Enum.RoundChanged:
            return {
                ...state,
                round: action.round
            };
        break;

        case Enum.FlushTools:
            return {
                ...state,
                round: false,
                rect: false,
                poly: false
            };
        break;

        /* to be enabled */
        case Enum.PushGeoline:
            /*return {
                ...state,
                geolines: new Array({
                    ...state
                }
            }*/
        break;

        /* ideally atomic, but requires major map rework */
        case Enum.PushGeolines:
            return {
                ...state,
                geolines: action.payload
            };
        break;

        case Enum.FlushGeolines:
            return {
                ...state,
                geolines: new Array(),
                total: 0,
                loaded: 0
            };
        break;

        case Enum.UpdateTotal:
            return {
                ...state,
                total: action.payload
            };
        break;

        case Enum.UpdateLoaded:
            return {
                ...state,
                loaded: action.payload
            };
        break;

        case Enum.GridChanged:
            return {
                ...state,
                grid: {
                    ...state.grid,
                    [action.payload.type]: {
                        ...state.grid[action.payload.type],
                        visible: action.payload.state
                    }
                }
            };
        break;

        case Enum.GridDataCleared:
            return {
                ...state,
                grid: {
                    ...state.grid,
                    [action.payload.type]: {
                        ...state.grid[action.payload.type],
                        data: null,
                        visible: false
                    }
                }
            };
        break;

        case Enum.GridDataSet:
            return {
                ...state,
                grid: {
                    ...state.grid,
                    [action.payload.type]: {
                        ...state.grid[action.payload.type],
                        data: action.payload.data
                    }
                }
            };
        break;

        case Enum.GridDataFetch:
            return {
                ...state,
                grid: {
                    ...state.grid,
                    [action.payload.type]: {
                        ...state.grid[action.payload.type],
                        fetching: action.payload.state
                    }
                }
            };
        break;

        default:
            return state;
        break;
    }
}
