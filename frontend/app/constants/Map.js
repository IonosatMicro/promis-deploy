export const Enum = {
    ZoomChanged      : 'MapZoomChanged',
    SizeChanged      : 'MapSizeChanged',
    DimsChanged      : 'MapDimsChanged',
    ModeChanged      : 'MapModeChanged',
    GridChanged      : 'MapGridToggled',
    RectChanged      : 'MapRectToggled',
    PolyChanged      : 'MapPolyChanged',
    RoundChanged     : 'MapRoundChanged',
    FlushTools       : 'MapFlushTools',
    PushGeolines     : 'MapPushGeolines',
    FlushGeolines    : 'MapFlushGeolines',
    SelectionUpdated : 'MapSelectionUpdated',
    UpdateTotal      : 'MapUpdateTotal',
    UpdateLoaded     : 'MapUpdateLoaded',
    MagGridRequested : 'MapMagGridRequested',
    MagGridReady     : 'MapMagGridReady',
    MagGridRemove    : 'MagGridRemove'
};

export const GridTypes = {
    Inclination      : 'inclination',
    Intensity        : 'intensity',
    Geographic       : 'geographic'
};

export const State = {
    zoom: 5,               /* zoom level */
    flat: true,            /* true for 2D, false for 3D */
    full: false,           /* fullscreen mode */
    rect: false,           /* rectangular selection tool status */
    poly: false,           /* polygon selection tool status */
    round: false,          /* circular selection tool status */
    grid: false,
    dims: [300, 300],      /* map fullscreen dimensions */
    geolines: new Array(), /* geolines to draw */
    total: 0,              /* total geolines expected */
    // TODO: remove this
    loaded: 0,          /* geolines currently downloaded */

    magGrid: {
        fetching: false,
        data: null
    },

    grid: {                /* grid status */
        inclination: {
            type: GridTypes.Inclination,    /* for polymorphism, pls don't alter */
            data: null,                     /* isoline data */
            fetching: false,                /* if we are fetching the data from NASA site */
            visible: false                  /* on/off switch */
        },
        intensity: {
            type: GridTypes.Intensity,
            data: null,
            fetching: false,
            visible: false
        },
        geographic: {
            type: GridTypes.Geographic,
            visible: false
        }
    }
};

export const BingKey = 'AjsNBiX5Ely8chb5gH7nh6HLTjlQGVKOg2A6NLMZ30UhprYhSkg735u3YUkGFipk';
