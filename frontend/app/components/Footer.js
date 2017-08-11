import React, { Component } from 'react';
import Grid from 'react-bootstrap/lib/Grid';


export default class PromisFooter extends Component {
        constructor(props) {
        super(props);
        }

        render() {
            return (
                <div className="footer">
                    <div>
                        <hr />
                        <p>© Company 2017</p>
                    </div>
                </div>
            )

        }
}
