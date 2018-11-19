import React, { Component } from 'react';
import LinkedIn from 'react-linkedin-login';
import { Nav, Navbar, NavItem, NavDropdown, MenuItem, Button, ButtonToolbar } from 'react-bootstrap';

import LoginWindow from './LoginWindow';
import RegisterWindow from './RegisterWindow';

// Temporary solution before https://github.com/react-bootstrap/react-bootstrap/pull/2711
class ExternalNavItem extends NavItem {
    handleClick(e) {
        if (this.props.disabled) {
            e.preventDefault();
        } else {
            if (this.props.onSelect) {
                this.props.onSelect(this.props.eventKey, e);
            }
        }
    }
}

export default class PromisNavbar extends Component {
    constructor(props) {
        super(props);

        this.state = { 
            login: false,
            register: false
        }

        /*
        axios.get('promis/isloggedin').then(function(response){
            if(response.user)
                this.setState({user: response.user })
            else
                this.setState({user: null});
        })*/
        this.toggleWindow = this.toggleWindow.bind(this);
        this.callbackLinkedIn = this.callbackLinkedIn.bind(this);
    }

    toggleWindow(what, state) {
        var newState = {};

        this.setState(function(){
            newState[what] = state;

            return newState;
        })
    }
    
    callbackLinkedIn ({code, redirectUri}) {
        
        /* Original buttons:
         * <Button onClick = {this.toggleWindow.bind(null, 'login', true)} bsStyle="success">Sign in</Button>
            <Button onClick = {this.toggleWindow.bind(null, 'register', true)} bsStyle="primary">Register</Button> 
        */
    }

    render() {
        var data = this.props.userData;
        var actions = this.props.actions;

        return (
            <Navbar inverse collapseOnSelect>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href="#">PROMIS</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    { /*<Nav>
                        <NavDropdown eventKey={3} title="Language" id="basic-nav-dropdown">
                            <MenuItem eventKey={3.1}>English</MenuItem>
                            <MenuItem eventKey={3.2}>Ukrainian</MenuItem>
                        </NavDropdown>
                    </Nav> */ }
                    <Nav pullRight>
                        <ExternalNavItem href="http://ionosat-micro.ikd.kiev.ua/" target="_blank">
                                <img src="/img/ionosat-41x41.png" style={{height: "41px", marginTop: -7}} />
                                <b>Ionosat-Micro</b>
                        </ExternalNavItem>
                        <NavItem>
                            <div></div>
                        { data.user ? (
                        <div>
                            <span className = 'welcome'>Hello, {data.user.name} </span>
                            <Button onClick = {actions.logout} bsStyle="warning">Sign out</Button>
                        </div>
                        ) : (
                        <ButtonToolbar>
                            <LinkedIn
                                clientId='863rt496vyjrrd'
                                callback={this.callbackLinkedIn}
                                className='btn btn-primary'
                            text='LinkedIn' />
                            <LoginWindow
                                onLogin = {actions.login}
                                userData = {data}
                                show = {this.state.login}
                                onClose = {this.toggleWindow.bind(null, 'login', false)}
                            />
                            <RegisterWindow
                                onRegister = {actions.register}
                                show = {this.state.register}
                                onClose = {this.toggleWindow.bind(null, 'register', false)}
                            />
                        </ButtonToolbar>
                        ) }
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}
