/**
 * Created by naeimzarei on 3/25/17.
 */
import React, {Component} from "react";

export default class Ball extends Component {
    render() {
        return (
            <img alt="Ball" className="Ball" src={require("../images/ball.png")} style={this.props.css}/>
        );
    }
}