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

        case Enum.GridChanged:
            return {
                ...state,
                grid: action.payload
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

        case Enum.MagGridRequested:
            return {
                ...state,
                magGrid : {
                    data : null,
                    fetching : true
                }
            };
        break;

        case Enum.MagGridReady:
            return {
                ...state,
                magGrid : {
                    data : action.payload,
                    fetching : false
                }
            };
        break;

        case Enum.MagGridRemove:
            return {
                ...state,
                magGrid : {
                    data : null,
                    fetching : false
                }
            };
        break;

        default:
            return state;
        break;
    }
}
