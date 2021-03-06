/**
 * Created by naeimzarei on 3/25/17.
 */
require("../node_modules/artyom.js/build-vanilla/artyom.min.js");
require("../node_modules/howler/dist/howler.js");
import React, {Component} from "react";
import GameLabel from "./GameLabel";
import GameMessage from "./GameMessage";
import SettingsBar from "./SettingsBar";
import Racket from "./Racket";
import Ball from "./Ball";

export default class Background extends Component {
    constructor() {
        super();
        this.state = {
            idLeft: 0,
            idRight: 0,
            idBall: 0,
            idMessage: 0,
            idTimer: 0,
            isLeftRacketIntervalOn: false,
            isRightRacketIntervalOn: false,
            isBallIntervalOn: false,
            isLeftServing: true,
            isRightServing: false,
            isKeyUp: false,
            hasCollided: false,
            hasPressedSideKey: false,
            RACKET_OFFSET: 1,
            RACKET_INTERVAL: 30,
            RACKET_INTERVAL_AI: 400,
            AI_LAG: 200,
            BALL_INTERVAL: 100,
            SPEECH_SYNTHESIZER_DELAY: 250,
            mode: "Easy",
            score: "0-0",
            time: 0,
            winner: "",
            backgroundCSS: {
                position: "fixed",
                backgroundColor: "#346547",
                width: "1000px",
                height: "500px",
                margin: "0 auto",
                borderRadius: "10px",
                border: "2px solid black"
            },
            gameMessageArray: [
                <GameMessage key={-1} text="Press any key to begin!" />
            ],
            radioArrays: [
                [false, true, false],
                [false, true, false]
            ],
            leftRacket: { // Player
                top: 40, // 0
                left: 0, // 0
                css: {
                    position: "absolute",
                    width: "150px",
                    height: "150px",
                    transform: "rotate(270deg)",
                    top: "40%",
                    left: "0%"
                }
            },
            rightRacket: { // Computer
                top: 40, // 0
                left: 85, // 85
                css: {
                    position: "absolute",
                    width: "150px",
                    height: "150px",
                    top: "40%",
                    left: "85%"
                }
            },
            ball: {
                top: 47, // 0
                left: 0, // 0
                css: {
                    position: "absolute",
                    width: "35px",
                    height: "35px",
                    top: "47%",
                    left: "0%"
                }
            }
        };
        
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleRadioChange = this.handleRadioChange.bind(this);
        this.Artyom = window.artyom;
    }
    
    /**
     * Adds focus to the main game
     * storyboard during start up
     */
    componentDidMount() {
        const self = this;
        self.refs.board.focus();
        self.blurBackground();
        self.Artyom.shutUp();
    
        window.onbeforeunload = function() {
            self.Artyom.shutUp();
        };
        
        setTimeout(function() {
            self.Artyom.initialize({
                lang: "en-US",
                continuous: true,
                listen: true,
                debug: false,
                speed: 1.1,
                volume: 0.3
            }).then(function(){
                self.Artyom.say("Easy mode. Move to the announced position using the up and down keys. " +
                    "There are only three spaces you can go to: top, center, and bottom. " +
                    "You always start in the center at the beginning of each round. You can say restart to " +
                    "start over at any time. You can also say hard to change to the hard mode. " +
                    "Press any key to begin!");
            });
            
            var commands = [
                {
                    indexes: ["restart"],
                    action: function() {
                        self.restart();
                    }
                },
                {
                    indexes: ["hard"],
                    action: function() {
                        self.restart();
                        self.setState({mode: "Hard"}, function() {
                            self.Artyom.shutUp();
                            self.Artyom.say("Hard mode. Same rules as easy mode, however, " +
                                "you must move to the correct position " +
                                "and then immediately press the left or right key. " +
                                "You will hear the announcer say, Ready. Press any key to begin!");
                        });
                    }
                },
                {
                    indexes: ["easy"],
                    action: function() {
                        self.restart();
                        self.Artyom.shutUp();
                        self.Artyom.say("Easy mode. Press any key to begin!");
                    }
                }
            ];
            self.Artyom.addCommands(commands);
        }, self.state.SPEECH_SYNTHESIZER_DELAY);
    }
    
    /**
     * Pauses speech recognition
     */
    pauseVoiceRecognition() {
        const self = this;
        self.Artyom.dontObey();
    }
    
    /**
     * Starts speech recognition
     */
    startVoiceRecognition() {
        const self = this;
        self.Artyom.obey();
    }
    
    /**
     * Starts the game
     */
    startGame() {
        const self = this;
        self.removeGameMessage(-1);
        self.removeGameMessage(-2);
        self.unblurBackground();
        self.startRound();
    }
    
    /**
     * Ends the game
     */
    endGame() {
        const self = this;
        const leftScore = self.getLeftScore();
        const rightScore = self.getRightScore();
        
        var message;
        if (leftScore > rightScore) {
            message = "You won! Press any key to play again.";
        } else {
            message = "You lost! Press any key to play again.";
        }

        clearInterval(self.state.idTimer);
        self.resetStateVariables();
        self.Artyom.say(message);
        self.setState({ gameMessageArray: [<GameMessage key={-2} text={message} />] });
        self.blurBackground();
        
        self.refs.Settings.restart();
    }
    
    /**
     * Restarts the game
     */
    restart() {
        const self = this;
        self.Artyom.shutUp();
        clearInterval(self.state.idTimer);
        clearInterval(self.state.idBall);
        clearInterval(self.state.idLeft);
        clearInterval(self.state.idRight);
        self.resetStateVariables();
        self.Artyom.say("Game restarted in " + self.state.mode + " mode.");
        self.setState({ gameMessageArray: [<GameMessage key={-2} text={"Press any key to begin!"} />]});
        self.blurBackground();
    }
    
    /**
     * Resets all state variables
     * back to beginning state
     */
    resetStateVariables() {
        const self = this;
        self.setState({
            idLeft: 0,
            idRight: 0,
            idBall: 0,
            idMessage: 0,
            idTimer: 0,
            isLeftRacketIntervalOn: false,
            isRightRacketIntervalOn: false,
            isBallIntervalOn: false,
            isLeftServing: true,
            isRightServing: false,
            hasCollided: false,
            isKeyUp: false,
            hasPressedSideKey: false,
            RACKET_OFFSET: self.state.RACKET_OFFSET,
            RACKET_INTERVAL: self.state.RACKET_INTERVAL,
            RACKET_INTERVAL_AI: self.state.RACKET_INTERVAL_AI,
            AI_LAG: self.state.AI_LAG,
            BALL_INTERVAL: self.state.BALL_INTERVAL,
            SPEECH_SYNTHESIZER_DELAY: self.state.SPEECH_SYNTHESIZER_DELAY,
            score: "0-0",
            time: 0,
            winner: "",
            mode: self.state.mode,
            backgroundCSS: {
                position: "fixed",
                backgroundColor: "#346547",
                width: "1000px",
                height: "500px",
                margin: "0 auto",
                borderRadius: "10px",
                border: "2px solid black"
            },
            gameMessageArray: [],
            leftRacket: {
                top: 40,
                left: 0,
                css: {
                    position: "absolute",
                    width: "150px",
                    height: "150px",
                    transform: "rotate(270deg)",
                    top: "40%"
                }
            },
            rightRacket: {
                top: 40,
                left: 85,
                css: {
                    position: "absolute",
                    width: "150px",
                    height: "150px",
                    top: "40%",
                    left: "85%"
                }
            },
            ball: {
                top: 47,
                left: 0,
                css: {
                    position: "absolute",
                    width: "35px",
                    height: "35px",
                    top: "47%",
                    left: ""
                }
            }
        });
    }
    
    /**
     * Given how many digits places,
     * converts the input to the
     * hundreds place
     * @param {Number} input
     * @param {Number} digits
     * @return {String} output
     */
    convertInteger(input, digits) {
        if (input >= 999) { return "999" }
        return input.toLocaleString("en-US", {minimumIntegerDigits: digits});
    }
    
    /**
     * Clears a setInterval, given the id
     * @param {Number} id
     */
    endFrame(id) {
        clearInterval(id);
    }
    
    /**
     *
     * @param {Number} min
     * @param {Number} max
     * @return {Number} randomNum
     */
    getRandomInclusive(min, max) {
        return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
    }
    
    /**
     * Returns a Coordinate object
     * of the Ball component
     * @return {Object} Coordinate
     */
    getBallCoordinates() {
        var self = this;
        return {
            x: parseInt(self.state.ball.left, 10),
            y: parseInt(self.state.ball.top, 10)
        };
    }
    
    /**
     * Given a side, "left" or "right",
     * returns the racket's center point
     * @param {String} side
     * @return {Object} coordinates
     */
    getRacketCoordinates(side) {
        const self = this;
        if (side === "left") {
            return {
                x: parseInt(self.state.leftRacket.left, 10),
                y: parseInt(self.state.leftRacket.top, 10)
            };
        }
        
        return {
            x: parseInt(self.state.rightRacket.left, 10),
            y: parseInt(self.state.rightRacket.top, 10)
        };
    }
    
    /**
     * Checks if the Ball component
     * has collided into a racket
     * @return {Boolean}
     */
    hasCollided() {
        const self = this;
        
        if (self.state.isLeftServing || self.state.isRightServing) return false;
        
        const left_center = self.getRacketCoordinates("left");
        const right_center = self.getRacketCoordinates("right");
        
        const x_offset = 15;
        const y_offset = 18;
        
        const RANGE_LEFT = {
            x1: left_center.x - self.state.RACKET_OFFSET - x_offset,
            x2: left_center.x + self.state.RACKET_OFFSET + x_offset,
            y1: left_center.y - self.state.RACKET_OFFSET - y_offset,
            y2: left_center.y + self.state.RACKET_OFFSET + y_offset
        };
        const RANGE_RIGHT = {
            x1: right_center.x - self.state.RACKET_OFFSET - x_offset,
            x2: right_center.x + self.state.RACKET_OFFSET + x_offset,
            y1: right_center.y - self.state.RACKET_OFFSET - y_offset,
            y2: right_center.y + self.state.RACKET_OFFSET + y_offset
        };
        
        const ballCoordinate = self.getBallCoordinates();
    
        function updateState() {
            self.setState({hasCollided: true});
        }
        
        if ((ballCoordinate.x >= RANGE_LEFT.x1 && ballCoordinate.x <= RANGE_LEFT.x2) &&
            (ballCoordinate.y >= RANGE_LEFT.y1 && ballCoordinate.y <= RANGE_LEFT.y2)) {
            //console.log("Collision left");
            updateState();
            return true;
        }
    
        if ((ballCoordinate.x >= RANGE_RIGHT.x1 && ballCoordinate.x <= RANGE_RIGHT.x2) &&
            (ballCoordinate.y >= RANGE_RIGHT.y1 && ballCoordinate.y <= RANGE_RIGHT.y2)) {
            //console.log("Collision right");
            updateState();
            return true;
        }
        
        return false;
    }
    
    /**
     * Plays the Ping sound
     */
    playPing() {
        const sound = new window.Howl({
            src: [require("../sound/Ping.mp3")],
            autoplay: false,
            volume: 20
        });
        sound.pos(-5, 0, 0);
        sound.play();
    }
    
    /**
     * Plays the Pong sound
     */
    playPong() {
        const sound = new window.Howl({
            src: [require("../sound/Pong.mp3")],
            autoplay: false,
            volume: 20
        });
        sound.pos(5, 0, 0);
        sound.play();
    }
    
    /**
     * Plays a sound as Racket
     * moves up
     */
    playUp() {
        const sound = new window.Howl({
            src: [require("../sound/Sweep.mp3")],
            autoplay: false,
            volume: 0.8,
            sprite: {
                up: [185, 215]
            }
        });
        sound.play("up");
    }
    
    /**
     * Plays a sound as Racket
     * moves down
     */
    playDown() {
        const sound = new window.Howl({
            src: [require("../sound/Sweep.mp3")],
            autoplay: false,
            volume: 0.8,
            sprite: {
                down: [400, 500]
            }
        });
        sound.play("down");
    }
    
    /**
     * Plays a sound that
     * says "Ready"
     */
    playReady() {
        const sound = new window.Howl({
            src: [require("../sound/Ready.mp3")],
            autoplay: false,
            volume: 2,
            sprite: {
                ready: [25, 600]
            }
        });
        sound.play("ready");
    }
    
    /**
     * Takes care of what happens
     * when a round of ping pong
     * is complete.
     * @param {String} winner
     */
    endOfRoundHelper(winner) {
        const self = this;
        
        self.endFrame(self.state.idLeft);
        self.endFrame(self.state.idRight);
        self.endFrame(self.state.idBall);
        self.endFrame(self.state.idTimer);
        
        self.setState({
            idLeft: 0,
            idRight: 0,
            idRacket: 0,
            isLeftRacketIntervalOn: false,
            isRightRacketIntervalOn: false,
            isBallIntervalOn: false,
            isLeftServing: (winner === "left"),
            isRightServing: (winner !== "left"),
            hasCollided: false,
            isKeyUp: false,
            hasPressedSideKey: false,
            RACKET_OFFSET: self.state.RACKET_OFFSET,
            RACKET_INTERVAL: self.state.RACKET_INTERVAL,
            RACKET_INTERVAL_AI: self.state.RACKET_INTERVAL_AI,
            AI_LAG: self.state.AI_LAG,
            BALL_INTERVAL: self.state.BALL_INTERVAL,
            SPEECH_SYNTHESIZER_DELAY: self.state.SPEECH_SYNTHESIZER_DELAY,
            winner: (winner === "left") ? "left" : "right",
            leftRacket: {
                top: 40,
                left: 0,
                css: {
                    position: "absolute",
                    width: "150px",
                    height: "150px",
                    transform: "rotate(270deg)",
                    top: "40%"
                }
            },
            rightRacket: {
                top: 40,
                left: 85,
                css: {
                    position: "absolute",
                    width: "150px",
                    height: "150px",
                    top: "40%",
                    left: "85%"
                }
            },
            ball: {
                top: 47,
                left: (winner === "left") ? 0: 95,
                css: {
                    position: "absolute",
                    width: "35px",
                    height: "35px",
                    top: "47%",
                    left: (winner === "left") ? "0%":"95%"
                }
            }
        });
        
        if (winner === "left") {
            if (self.getLeftScore() + 1 === 7) {
                self.endGame();
                return;
            }
            self.addGameMessage("You scored! Press any key to continue.");
            self.Artyom.say("You scored! Press any key to continue.");
            self.setState({
                score: (self.getLeftScore() + 1) + "-" + self.getRightScore()
            });
        } else {
            if (self.getRightScore() + 1 === 7) {
                self.endGame();
                return;
            }
            self.addGameMessage("Computer scored! Press any key to continue.");
            self.Artyom.say("Computer scored! Press any key to continue.");
            self.setState({
                score: self.getLeftScore() + "-" + (self.getRightScore() + 1)
            });
        }
    }
    
    /**
     * Adds a GameMessage component to state
     * variable
     * @param {String} message
     * @return {String} key
     */
    addGameMessage(message) {
        const self = this;
        
        var gameMessageArray = self.getMessageArray();
        const gameMessage = <GameMessage text={message} key={self.state.idMessage + 1}/>;
        
        gameMessageArray.push(gameMessage);
        self.setState({
            idMessage: self.state.idMessage + 1,
            gameMessageArray: gameMessageArray
        }, function() {
            self.blurBackground();
        });
    }
    
    /**
     * Given a key, removes a particular
     * GameMessage component
     * @param {Number} key
     */
    removeGameMessage(key) {
        const self = this;
        var gameMessageArray = self.getMessageArray();
        for (var i = 0; i < gameMessageArray.length; i++) {
            if (parseInt(gameMessageArray[i].key, 10) === key) {
                gameMessageArray.splice(i, 1);
                self.setState({gameMessageArray: gameMessageArray});
                return;
            }
        }
    }
    
    /**
     * Removes all GameMessage
     * components from the DOM
     */
    removeAllGameMessages() {
        const self = this;
        self.setState({
            gameMessageArray: []
        });
    }
    
    /**
     * Blurs the ping pong table background
     */
    blurBackground() {
        const self = this;
        const newBackgroundCSS = {
            position: "fixed",
            backgroundColor: "#346547",
            width: "1000px",
            height: "500px",
            margin: "0 auto",
            borderRadius: "10px",
            border: "2px solid black",
            filter: "blur(10px)"
        };
        self.setState({
            backgroundCSS: newBackgroundCSS
        });
    }
    
    /**
     * Un-blurs the ping pong table background
     */
    unblurBackground() {
        const self = this;
        const newBackgroundCSS = {
            position: "fixed",
            backgroundColor: "#346547",
            width: "1000px",
            height: "500px",
            margin: "0 auto",
            borderRadius: "10px",
            border: "2px solid black"
        };
        self.setState({
            backgroundCSS: newBackgroundCSS
        });
    }
    
    /**
     * Clones the state variable
     * gameMessageArray
     * @return {Array} gameMessageArray
     */
    getMessageArray() {
        const self = this;
        return self.state.gameMessageArray.slice();
    }
    
    /**
     * Returns the left side score
     * @return {Number} leftScore
     */
    getLeftScore() {
        const self = this;
        return parseInt(self.state.score.charAt(0), 10);
    }
    
    /**
     * Returns the right side score
     * @return {Number} rightScore
     */
    getRightScore() {
        const self = this;
        return parseInt(self.state.score.charAt(2), 10);
    }
    
    /**
     * Starts a round of Ping Pong
     */
    startRound() {
        const self = this;
        self.setState({idTimer: setInterval(() => { self.setState({time: self.state.time + 1});}, 1000)});
        self.removeAllGameMessages();
        self.unblurBackground();
        self.Artyom.shutUp();
        if (self.state.winner === "left") {
            self.animateBallRight();
        } else if (self.state.winner === "right") {
            self.animateBallLeft();
        } else {
            self.animateBallRight();
        }
    }
    
    /**
     * Handles key press events
     * @param {Event} event
     */
    handleKeyDown(event) {
        if (this.state.gameMessageArray[0] !== undefined) {
            const key = parseInt(this.state.gameMessageArray[0].key, 10);
            if (key === -1 || key === -2) {
                this.startGame();
                return;
            } else {
                this.startRound();
                return;
            }
        }
        
        switch(event.which) {
            case 32: // spacebar
                if (this.state.mode === "Hard") {
                    if (this.state.hasPressedSideKey === false) {
                        this.playReady();
                    }
                }
                this.setState({hasPressedSideKey: true});
                break;
            case 37: // left
                if (this.state.mode === "Hard") {
                    if (this.state.hasPressedSideKey === false) {
                        this.playReady();
                    }
                }
                this.setState({hasPressedSideKey: true});
                break;
            case 38: // up
                this.animateUp();
                break;
            case 39: // right
                if (this.state.mode === "Hard") {
                    if (this.state.hasPressedSideKey === false) {
                        this.playReady();
                    }
                }
                this.setState({hasPressedSideKey: true});
                break;
            case 40: // down
                this.animateDown();
                break;
            case 65: // A
                if (this.state.mode === "Hard") {
                    if (this.state.hasPressedSideKey === false) {
                        this.playReady();
                    }
                }
                this.setState({hasPressedSideKey: true});
                break;
            case 68: // D
                if (this.state.mode === "Hard") {
                    if (this.state.hasPressedSideKey === false) {
                        this.playReady();
                    }
                }
                this.setState({hasPressedSideKey: true});
                break;
            case 87: // w
                this.animateUp();
                break;
            case 83: // s
                this.animateDown();
                break;
            default:
                break;
        }
    }
    
    /**
     * Animates the racket downwards
     */
    animateDown() {
        var self = this;
        
        if (self.state.leftRacket.top >= 70) return;
        if (self.state.isLeftRacketIntervalOn) return;
        
        self.playDown();
        
        self.setState({
            idLeft: setInterval(frame, self.state.RACKET_INTERVAL),
            isLeftRacketIntervalOn: true
        });
        
        var counter = 0;
        
        function frame() {
            const newCSS = {
                position: "absolute",
                width: "150px",
                height: "150px",
                top: self.state.leftRacket.top + 10 + "%",
                left: self.state.leftRacket.left + "%",
                transform: "rotate(270deg)"
            };
            const newObject = {
                top: self.state.leftRacket.top + 10,
                left: self.state.leftRacket.left,
                css: newCSS
            };
            
            if (self.state.leftRacket.top > 60) {
                self.endFrame(self.state.idLeft);
                self.setState({isLeftRacketIntervalOn: false});
            } else if (counter === 40) {
                self.endFrame(self.state.idLeft);
                self.setState({isLeftRacketIntervalOn: false});
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
        var self = this;
    
        if (self.state.leftRacket.top <= 0) return;
        if (self.state.isLeftRacketIntervalOn) return;

        self.playUp();
    
        self.setState({
            idLeft: setInterval(frame, self.state.RACKET_INTERVAL),
            isLeftRacketIntervalOn: true
        });
    
        var counter = 0;
    
        function frame() {
            const newCSS = {
                position: "absolute",
                width: "150px",
                height: "150px",
                top: self.state.leftRacket.top - 10 + "%",
                left: self.state.leftRacket.left + "%",
                transform: "rotate(270deg)"
            };
            const newObject = {
                top: self.state.leftRacket.top - 10,
                left: self.state.leftRacket.left,
                css: newCSS
            };
        
            if (self.state.leftRacket.top <= 0) {
                self.endFrame(self.state.idLeft);
                self.setState({isLeftRacketIntervalOn: false});
            } else if (counter === 40) {
                self.endFrame(self.state.idLeft);
                self.setState({isLeftRacketIntervalOn: false});
            } else {
                counter += 10;
                self.setState({
                    leftRacket: newObject
                });
            }
        }
    }
    
    /**
     * Animates the right racket (computer)
     * upwards.
     */
    animateAIUp() {
        var self = this;
        if (self.state.rightRacket.top <= 0) return;
        if (self.state.isRightRacketIntervalOn) return;
    
        self.setState({
            idRight: setInterval(frame, self.state.RACKET_INTERVAL_AI),
            isRightRacketIntervalOn: true
        });
    
        var counter = 0;
    
        function frame() {
            const newCSS = {
                position: "absolute",
                width: "150px",
                height: "150px",
                top: self.state.rightRacket.top - 10 + "%",
                left: self.state.rightRacket.left + "%"
            };
            const newObject = {
                top: self.state.rightRacket.top - 10,
                left: self.state.rightRacket.left,
                css: newCSS
            };
        
            if (self.state.rightRacket.top <= 0) {
                self.endFrame(self.state.idRight);
                self.setState({isRightRacketIntervalOn: false});
            } else if (counter === 40) {
                self.endFrame(self.state.idRight);
                self.setState({isRightRacketIntervalOn: false});
            } else {
                counter += 10;
                self.setState({
                    rightRacket: newObject
                });
            }
        }
    }
    
    /**
     * Animates the right racket (computer)
     * downwards.
     */
    animateAIDown() {
        var self = this;
    
        if (self.state.rightRacket.top >= 70) return;
        if (self.state.isRightRacketIntervalOn) return;
    
        self.setState({
            idRight: setInterval(frame, self.state.RACKET_INTERVAL_AI),
            isRightRacketIntervalOn: true
        });
    
        var counter = 0;
    
        function frame() {
            const newCSS = {
                position: "absolute",
                width: "150px",
                height: "150px",
                top: self.state.rightRacket.top + 10 + "%",
                left: self.state.rightRacket.left + "%"
            };
            const newObject = {
                top: self.state.rightRacket.top + 10,
                left: self.state.rightRacket.left,
                css: newCSS
            };
            if (self.state.rightRacket.top > 60) {
                self.endFrame(self.state.idRight);
                self.setState({isRightRacketIntervalOn: false});
            } else if (counter === 40) {
                self.endFrame(self.state.idRight);
                self.setState({isRightRacketIntervalOn: false});
            } else {
                counter += 10;
                self.setState({
                    rightRacket: newObject
                });
            }
        }
    }
    
    /**
     * Returns a random left and top integer
     * specifying how the ball is animated, given
     * the direction of movement
     * @return {Object}
     * @param {String} direction
     */
    randomizeMovementValues(direction) {
        const self = this;
        const Coordinate = self.getBallCoordinates();
        
        const left = (direction === "left") ? -5:5;
    
        var location;
        if ((Coordinate.x === 95 && Coordinate.y === 0) || (Coordinate.x === 0 && Coordinate.y === 0)) {
            location = "top";
        } else if ((Coordinate.x === 95 && Coordinate.y === 47) || (Coordinate.x === 0 && Coordinate.y === 47)) {
            location = "center";
        } else {
            location = "bottom";
        }
    
        const randomLocation = self.getRandomInclusive(1, 3);
        var MovementValues = {
            left: null,
            top: null,
            location: null
        };
    
        if (location === "top") {
            MovementValues.location = "top";
            switch (randomLocation) {
                case 1: MovementValues.left = left; MovementValues.top = 0; break;
                case 2: MovementValues.left = left; MovementValues.top = 2.5; break;
                case 3: MovementValues.left = left; MovementValues.top = 5; break;
                default: break;
            }
        } else if (location === "center") {
            MovementValues.location = "center";
            switch (randomLocation) {
                case 1: MovementValues.left = left; MovementValues.top = -2.5; break;
                case 2: MovementValues.left = left; MovementValues.top = 0; break;
                case 3: MovementValues.left = left; MovementValues.top = 2.5; break;
                default: break;
            }
        } else {
            MovementValues.location = "bottom";
            switch (randomLocation) {
                case 1: MovementValues.left = left; MovementValues.top = -5; break;
                case 2: MovementValues.left = left; MovementValues.top = -2.5; break;
                case 3: MovementValues.left = left; MovementValues.top = 0; break;
                default: break;
            }
        }
    
        return MovementValues;
    }
    
    /**
     * Given the random movement values,
     * calculates the "higher level"
     * direction of the ball
     * @param {Object} MovementValues
     * @return {String} direction
     */
    getHigherLevelDirection(MovementValues) {
        const top = MovementValues.top;
        const location = MovementValues.location;
        
        var direction = null;
        if (location === "top") {
            if (top === 0) {
                direction = "top";
            } else if (top === 2.5) {
                direction = "center";
            } else {
                direction = "bottom";
            }
        } else if (location === "center") {
            if (top === -2.5) {
                direction = "top";
            } else if (top === 0) {
                direction = "center";
            } else {
                direction = "bottom";
            }
        } else {
            if (top === -5) {
                direction = "top";
            } else if (top === -2.5) {
                direction = "center";
            } else {
                direction = "bottom";
            }
        }
        return direction;
    }
    
    /**
     * Automates the movement of the
     * right racket
     * @param {Object} MovementValues
     */
    automateAI(MovementValues) {
        const self = this;
        const higherLevelDirection = self.getHigherLevelDirection(MovementValues);
        const y = self.getRacketCoordinates("right").y;
        
        if (higherLevelDirection === "top") {
            if (y === 30 || y === 40) {
                self.animateAIUp();
            } else if (y === 70) {
                self.animateAIUp();
                setTimeout(function() {
                    self.animateAIUp();
                }, self.state.AI_LAG);
            }
        } else if (higherLevelDirection === "center") {
            if (y === 0) {
                self.animateAIDown();
            } else if (y === 70) {
                self.animateAIUp();
            }
        } else {
            if (y === 0) {
                self.animateAIDown();
                setTimeout(function() {
                    self.animateAIDown();
                }, self.state.AI_LAG);
            } else if (y === 30 || y === 40) {
                self.animateAIDown();
            }
        }
    }
    
    /**
     * Animates the racket ball to the right
     */
    animateBallRight() {
        const self = this;
        if (self.state.isBallIntervalOn) return;
        if (self.state.isRightServing) return;
        if (self.state.isKeyUp) return;
        self.setState({isKeyUp: true});
        self.setState({hasPressedSideKey: false});
        
        self.setState({
            idBall: setInterval(frame, self.state.BALL_INTERVAL)
        });
        
        const MovementValues = self.randomizeMovementValues("right");
        self.automateAI(MovementValues);
    
        self.playPing();
        
        var timer = 0;
        
        function frame() {
            if (self.state.isLeftServing) {
                setTimeout(function() {
                    self.setState({
                        isLeftServing: false
                    });
                }, 300);
            }
            
            if (timer >= 8) {
                self.hasCollided();
            } else {
                timer++;
            }
            
            const newCSS = {
                position: "absolute",
                width: "30px",
                height: "30px",
                top: (self.state.ball.top + MovementValues.top) + "%",
                left: (self.state.ball.left + MovementValues.left) + "%",
            };
            const newObject = {
                top: self.state.ball.top + MovementValues.top,
                left: self.state.ball.left + MovementValues.left,
                css: newCSS
            };
            
            if (self.getBallCoordinates().x < 95) {
                self.setState({
                    ball: newObject,
                    isBallIntervalOn: true
                });
            } else {
                if (self.state.hasCollided === false) {
                    self.endOfRoundHelper("left");
                } else {
                    self.endFrame(self.state.idBall);
                    self.setState({isBallIntervalOn: false, hasCollided: false, isKeyUp: false});
                    self.animateBallLeft();
                }
            }
        }
    }
    
    /**
     * Animates the racket ball to the left.
     * Speaks where the ball is moving.
     */
    animateBallLeft() {
        const self = this;
        if (self.state.isBallIntervalOn) return;
        if (self.state.isLeftServing) return;
        if (self.state.isKeyUp) return;
        self.setState({isKeyUp: true});
    
        self.setState({
            idBall: setInterval(frame, self.state.BALL_INTERVAL)
        });
        
        const MovementValues = self.randomizeMovementValues("left");
        
        self.Artyom.say(self.getHigherLevelDirection(MovementValues));
        self.playPong();
        
        var timer = 0;
    
        function frame() {
            if (self.state.isRightServing) {
                setTimeout(function() {
                    self.setState({
                        isRightServing: false
                    });
                }, 300);
            }
            
            if (timer >= 8) {
                self.hasCollided();
            } else {
                timer++;
            }
            
            const newCSS = {
                position: "absolute",
                width: "30px",
                height: "30px",
                top: (self.state.ball.top + MovementValues.top) + "%",
                left: (self.state.ball.left + MovementValues.left) + "%",
            };
            const newObject = {
                top: self.state.ball.top + MovementValues.top,
                left: self.state.ball.left + MovementValues.left,
                css: newCSS
            };
            
            if (self.getBallCoordinates().x > 0) {
                self.setState({
                    ball: newObject,
                    isBallIntervalOn: true
                });
            } else {
                if (self.state.hasCollided === false) {
                    self.endOfRoundHelper("right");
                } else {
                    if (self.state.mode === "Hard") {
                        if (self.state.hasPressedSideKey === false) {
                            self.endOfRoundHelper("right");
                            return;
                        }
                    }
                    self.endFrame(self.state.idBall);
                    self.setState({isBallIntervalOn: false, hasCollided: false, isKeyUp: false});
                    self.animateBallRight();
                }
            }
        }
    }
    
    /**
     * Checks selected radio button in SettingsBar
     * and changes game constants
     */
    handleRadioChange() {
        const self = this;
        self.refs.board.focus();
        self.restart();
        
        setTimeout(function() {
            const ballChecked = self.refs.Settings.state.ballChecked.slice();
            const computerChecked = self.refs.Settings.state.computerChecked.slice();
            
            var radioArrays = [];
            radioArrays.push(ballChecked);
            radioArrays.push(computerChecked);
            self.setState({radioArrays: radioArrays});
            
            var factor;
            if (ballChecked[0]) {
                factor = 1.5;
            } else if (ballChecked[1]) {
                factor = 1;
            } else {
                factor = 0.5;
            }
            self.setState({BALL_INTERVAL: 100 / factor});
            
            if (computerChecked[0]) {
                factor = 1.5;
            } else if (computerChecked[1]) {
                factor = 1;
            } else {
                factor = 0.5;
            }
            self.setState({RACKET_INTERVAL_AI: 400 / factor});
        }, 75);
    }
    
    /**
     * Renders components to DOM
     */
    render() {
        return (
            <div className="Background-Container">
                <SettingsBar ref="Settings" checked={this.state.radioArrays} handleRadioChange={this.handleRadioChange} />
                <GameLabel labels={[this.state.score, this.convertInteger(this.state.time, 3), this.state.mode + " mode"]} />
                <div ref="board" tabIndex="0" onKeyDown={this.handleKeyDown} style={this.state.backgroundCSS}>
                    <Racket css={this.state.leftRacket.css} />
                    <Racket css={this.state.rightRacket.css} />
                    <Ball css={this.state.ball.css}/>
                    <div className="Vertical-Line" />
                </div>
                {this.state.gameMessageArray}
                <GameLabel css="bottom" labels={["", "Ping Pong", ""]} />
            </div>
        );
    }
}