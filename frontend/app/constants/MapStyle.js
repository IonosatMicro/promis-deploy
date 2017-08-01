/* styles for various things drawn on the map */
/* TODO: make it a CSS somehow maybe? */
export const Default = {
    stroke:         "#aaaaaa",  /* stroke style as html color */
    strokeAlpha:    1,
    fill:           false,      /* fill style */
    fillAlpha:      1,
    dashed:         false,      /* whether stroke needs to be dashed */
    outline:        false,      /* whether to draw the outline in 3D */
    width:          4           /* stroke width in px(?) */

};

/* selections on the map */
export const Selection = {
    ...Default,
    stroke:         "#0000ff",
    strokeAlpha:    0.7,
    fill:           "#0000ff",
    fillAlpha:      0.3,
};

/* selection preview */
export const SelectionPreview = {
    ...Selection,
    stroke:         "#ffffff",
    fill:           "#ffffff",
    dashed:         true
};

/* active selection being edited */
export const SelectionHighlight = {
    ...Selection,
    stroke:         "#00ff00",
    fill:           "#00ff00"
};

/* selection handles which can be used for editing */
export const SelectionHandle = {
    ...Default,
    stroke:         "#ffff00",
    strokeAlpha:    1,
    fill:           "#ffff00",
    fillAlpha:      0.5,
};

/* grid lines and magnetic grid isolines */
export const Grid = {
    ...Default,
    stroke:        "#ffffff",
    strokeAlpha:   0.4,
    width:         0.5
};

/* equator line for grid */
export const GridEquator = {
    ...Grid,
    strokeAlpha:   0.6,
    width: 2
};

/* thicker style for each 5th isoline */
export const GridEven = {
    ...Grid,
    stroke:        "#ffff00",
};


/* parts of the session that match selection criteria */
export const Session = {
    ...Default,
    stroke:         "#dd0000",
    outline:        true
};

/* highlighted session part (mouseover at measurements panel) */
export const SessionHighlight = {
    ...Default,
    stroke:         "#ff0000",
    width:          6,
    outline:        true
};

/* leftover parts of the session */
export const SessionLeftovers = {
    ...Default,
    stroke:         "#ffffff",
    dashed:         true,
    width:          2
};

/* TODO: grid elements */
