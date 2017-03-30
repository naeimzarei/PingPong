/**
 * Created by naeimzarei on 3/25/17.
 */
import React, {Component} from "react";
import GameLabel from "./GameLabel";
import Racket from "./Racket";
import Ball from "./Ball";

export default class Background extends Component {
    constructor() {
        super();
        this.state = {
            idLeft: 0,
            idRight: 0,
            RACKET_INTERVAL: 10,
            leftRacket: {
                top: 0,
                left: 0,
                css: {
                    position: "absolute",
                    width: "100px",
                    height: "100px"
                }
            },
            rightRacket: {
                top: 0,
                left: 0,
                css: {
                    position: "absolute",
                    width: "100px",
                    height: "100px"
                }
            }
        };
        
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }
    
    /**
     * Adds focus to the main game
     * storyboard during start up
     */
    componentDidMount() {
        this.refs.board.focus();
    }
    
    /**
     * Handles key press events
     * @param {Event} event
     */
    handleKeyDown(event) {
        switch(event.which) {
            case 37: // left
                break;
            case 38: // up
                this.animateUp();
                break;
            case 39: // right
                break;
            case 40: // down
                this.animateDown();
                break;
            default:
                break;
        }
    }
    
    /**
     * Clears a setInterval, given the id
     * @param {Number} id
     */
    endFrame(id) {
        clearInterval(id);
    }
    
    /**
     * Animates the racket downwards
     */
    animateDown() {
        var self = this;
        
        if (self.state.leftRacket.top === 80) {
            return;
        }
        
        self.setState({
            idLeft: setInterval(frame, self.state.RACKET_INTERVAL)
        });
        
        var counter = 0;
        
        function frame() {
            const newCSS = {
                position: "absolute",
                width: "100px",
                height: "100px",
                top: self.state.leftRacket.top + 10 + "%",
                left: self.state.leftRacket.left + "%"
            };
            const newObject = {
                top: self.state.leftRacket.top + 10,
                left: self.state.leftRacket.left,
                css: newCSS
            };
            
            if (self.state.leftRacket.top > 70) {
                self.endFrame(self.state.idLeft);
            } else if (counter === 40) {
                self.endFrame(self.state.idLeft);
            } else {
                counter += 10;
                self.setState({
                    leftRacket: newObject
                });
            }
        }
    }
    
    /**
     * Animates the racket upwards
     */
    animateUp() {
        
    }
    
    /**
     * Renders components to DOM
     * @returns {XML}
     */
    render() {
        return (
            <div className="Background-Container">
                <GameLabel labels={["Score", "Time", "Settings"]} />
                <div ref="board" className="Background" tabIndex="0" onKeyDown={this.handleKeyDown}>
                    <Racket css={this.state.leftRacket.css}/>
                    <div className="Vertical-Line" />
                </div>
                <GameLabel css="bottom" labels={["", "Ping Pong", ""]} />
            </div>
        );
    }
}