/**
 * Created by naeimzarei on 3/25/17.
 */
import React, {Component} from "react";

export default class Racket extends Component {
    render() {
        return (
            <img alt="Racket" style={this.props.css} src={require("../images/racket.png")}/>
        );
    }
}