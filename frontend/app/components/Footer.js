import React, { Component } from 'react';
import { Grid, Col } from 'react-bootstrap';



export default class PromisFooter extends Component {
        constructor(props) {
        super(props);
        }

        // TODO: text of first Col is too long on mobile devices
        render() {
            return (
                <div className="footer navbar-inverse">
                    <Grid>
                        <Col xs={12} md={7}>
                            <a href="http://ionosat-micro.ikd.kiev.ua/" target="_blank">
                                    <img src="/img/LabMiniLogo.gif" />
                                    <b>©&nbsp;Space&nbsp;Research&nbsp;Institute&nbsp;of&nbsp;Ukraine,
                                    Laboratory&nbsp;for&nbsp;Satellite&nbsp;Near&nbsp;Space&nbsp;Exploration </b>
                            </a>
                        </Col>
                        <Col xs={4} md={2}>
                            <a href="https://github.com/IonosatMicro" target="_blank">
                                <img src="/img/github-20x20.png" />
                                <b>Visit us on GitHub</b>
                            </a>
                        </Col>
                        <Col xs={8} md={3} style={{textAlign: "right"}}>
                                <a href="https://ecognize.me" target="_blank">
                                    <img src="/img/ecognize-20x20.png" />
                                    <b>Development assisted by Ecognize.me&nbsp;OÜ</b>
                                </a>
                        </Col>
                    </Grid>
                </div>
            )

        }
}
