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

export const State = {
    zoom: 5,               /* zoom level */
    flat: true,            /* true for 2D, false for 3D */
    full: false,           /* fullscreen mode */
    grid: false,           /* grid status */
    rect: false,           /* rectangular selection tool status */
    poly: false,           /* polygon selection tool status */
    round: false,          /* circular selection tool status */
    dims: [300, 300],      /* map fullscreen dimensions */
    geolines: new Array(), /* geolines to draw */
    total: 0,              /* total geolines expected */
    // TODO: remove this
    loaded: 0,          /* geolines currently downloaded */
    // TODO: allow multiple grids to be shown
    magGrid: {
      data: null,          /* isoline data */
      fetching: false      /* if we are fetching the data from NASA site */
    }
};

export const BingKey = 'AjsNBiX5Ely8chb5gH7nh6HLTjlQGVKOg2A6NLMZ30UhprYhSkg735u3YUkGFipk';
