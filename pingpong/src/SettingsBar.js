/**
 * Created by naeimzarei on 5/1/17.
 */
import React, {Component} from "react";

export default class SettingsBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            outerStyle: {
                position: "fixed",
                backgroundColor: "beige",
                height: "200px",
                width: "250px",
                top: "40px",
                left: "1025px",
                opacity: "0.7",
                borderRadius: "10px",
                textAlign: "center"
            },
            innerStyle: {
                textAlign: "left"
            },
            formStyle: {
                paddingLeft: "2.5em"
            },
            headerStyle: {
                fontSize: "22px"
            },
            ballChecked: props.checked[0],
            computerChecked: props.checked[1]
        };
        
        this.handleBallChange = this.handleBallChange.bind(this);
        this.handleComputerChange = this.handleComputerChange.bind(this);
        this.restart = this.restart.bind(this);
    }
    
    handleBallChange(event) {
        const self = this;
        var array = [];
        if (event.target.value === "Fast") {
            array = [true, false, false];
        } else if (event.target.value === "Normal") {
            array = [false, true, false];
        } else {
            array = [false, false, true];
        }
        self.setState({ballChecked: array});
        self.props.handleRadioChange();
    }
    
    handleComputerChange(event) {
        const self = this;
        var array = [];
        if (event.target.value === "Fast") {
            array = [true, false, false];
        } else if (event.target.value === "Normal") {
            array = [false, true, false];
        } else {
            array = [false, false, true];
        }
        self.setState({computerChecked: array});
        self.props.handleRadioChange();
    }
    
    restart() {
        const self = this;
        self.setState({
            ballChecked: [false, true, false],
            computerChecked: [false, true, false]
        });
    }
    
    render() {
        return (
            <div style={this.state.outerStyle}>
                <span style={this.state.headerStyle}> Settings</span>
                <div style={this.state.innerStyle}>
                    Ball Speed
                    <div style={this.state.formStyle}>
                        <form>
                            <label>
                                <input type="radio" name="speed"
                                       value="Fast"
                                       checked={this.state.ballChecked[0]}
                                       onChange={this.handleBallChange}/> Fast
                            </label> <br />
                            <label>
                                <input type="radio" name="speed"
                                       value="Normal"
                                       checked={this.state.ballChecked[1]}
                                       onChange={this.handleBallChange}/> Normal
                            </label> <br />
                            <label>
                                <input type="radio" name="speed"
                                       value="Slow"
                                       checked={this.state.ballChecked[2]}
                                       onChange={this.handleBallChange}/> Slow
                            </label> <br />
                        </form>
                    </div>
                </div>
                <div style={this.state.innerStyle}>
                    Computer Speed
                    <div style={this.state.formStyle}>
                        <form>
                            <label>
                                <input type="radio" name="speed"
                                       value="Fast"
                                       checked={this.state.computerChecked[0]}
                                       onChange={this.handleComputerChange}/> Fast
                            </label> <br />
                            <label>
                                <input type="radio" name="speed"
                                       value="Normal"
                                       checked={this.state.computerChecked[1]}
                                       onChange={this.handleComputerChange}/> Normal
                            </label> <br />
                            <label>
                                <input type="radio" name="speed"
                                       value="Slow"
                                       checked={this.state.computerChecked[2]}
                                       onChange={this.handleComputerChange}/> Slow
                            </label> <br />
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}