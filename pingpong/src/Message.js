/**
 * Created by naeimzarei on 3/25/17.
 */
import React, {Component} from "react";

export default class Message extends Component {
    render() {
        return (
            <span className="Message">{this.props.message}</span>
        );
    }
}