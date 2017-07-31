//
// Copyright 2017 Space Research Institute of NASU and SSAU (Ukraine)
//
// Licensed under the EUPL, Version 1.1 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
//
// https://joinup.ec.europa.eu/software/page/eupl
//
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
//
import Papa from 'papaparse';
import MarchingSquares from 'marchingsquares';
import React, { Component } from 'react';

import ToolboxButton from './ToolboxButton';
import { GridTypes } from '../constants/Map';

export default class GridButton extends Component {
    componentDidMount() {
        /* skip altogether if the grid has no load capacity */
        if(this.props.fetching === undefined)
            return;
    }

    render() {
        /* show a spinner if the button is capable of loading, is actively fetching something
         * disable if its data is empty or it is fetching */
        let canload = this.props.grid.fetching !== undefined;
        let loading = canload? this.props.grid.fetching : false;
        let disabled = canload? (this.props.data == null || loading): false;

        return (
            <ToolboxButton
                active = { this.props.grid.visible }
                icon = { this.props.icon }
                help = { this.props.help }
                loading = { loading }
                disabled = { disabled }
                />
        );
    }
}
