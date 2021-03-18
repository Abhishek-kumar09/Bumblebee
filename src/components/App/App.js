import React from 'react'
import Authentication from '../../util/Authentication/Authentication'
import axios from 'axios'
import {firebase, firestore} from '../firebase/firebase'
import './App.css'

export default class App extends React.Component {
    constructor(props) {
        super(props)
        this.Authentication = new Authentication()

        //if the extension is running on twitch or dev rig, set the shorthand here. otherwise, set to null. 
        this.twitch = window.Twitch ? window.Twitch.ext : null
        this.state = {
            finishedLoading: false,
            theme: 'light',
            isVisible: true,
            items: [
                { name: "Abhishek Kumar", ign: "Abhi@87649817" },
                { name: "Shivam Beniwal", ign: "beniwal@1223" },
                { name: "Peter Nguyen", ign: "petercrackthecode" },
                { name: "Nguyen's Brother", ign: "nguyen'sbrother" },
                { name: "Penguin Lover", ign: "penguintheDev" },
            ],
            minified: false,
            req: ""
        }
    }

    contextUpdate(context, delta) {
        if (delta.includes('theme')) {
            this.setState(() => {
                return { theme: context.theme }
            })
        }
    }

    visibilityChanged(isVisible) {
        this.setState(() => {
            return {
                isVisible
            }
        })
    }

    componentDidMount() {
        if (this.twitch) {
            this.twitch.onAuthorized((auth) => {
                this.Authentication.setToken(auth.token, auth.userId)
                if (!this.state.finishedLoading) {
                    // if the component hasn't finished loading (as in we've not set up after getting a token), let's set it up now.

                    // now we've done the setup for the component, let's set the state to true to force a rerender with the correct data.
                    this.setState(() => {
                        return { finishedLoading: true }
                    })
                }
            })

            this.twitch.listen('broadcast', (target, contentType, body) => {
                this.twitch.rig.log(`New PubSub message!\n${target}\n${contentType}\n${body}`)
                // now that you've got a listener, do something with the result... 

                // do something...

            })

            this.twitch.onVisibilityChanged((isVisible, _c) => {
                this.visibilityChanged(isVisible)
            })

            this.twitch.onContext((context, delta) => {
                this.contextUpdate(context, delta)
            })
        }

    }

    componentWillUnmount() {
        if (this.twitch) {
            this.twitch.unlisten('broadcast', () => console.log('successfully unlistened'))
        }
    }

    toggleHide() {
        this.setState(() => { return { minified: !this.state.minified } })
    }

    handlePlay(index) {
        const added = this.state.items.splice(index, 1)
        this.addTofirebase("added", added[0])

        this.setState(() => {
            return {
                items: this.state.items
            }
        })
    }

    handleRemove(index) {
        const removed = this.state.items.splice(index, 1)

        this.addTofirebase("removed", removed[0])

        this.setState(() => {
            return {
                items: this.state.items
            }
        })
    }


    addTofirebase(status, data) {
        const time = new Date()
        data.time = time;

        firestore.collection(status).doc().set(data)
            .then(() => {
                console.log("Document successfully written!");
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    }

    render() {
        if (this.state.finishedLoading && this.state.isVisible) {
            return (
                <div className="App">
                    {this.state.minified
                        ? (
                            <div className="image-wrapper" onClick={this.toggleHide.bind(this)} >
                                <img
                                    src={require("./i.png")}
                                    alt="logo"
                                    height="50px"
                                />
                            </div>
                        )
                        : (
                            <div className="container-board App-dark">
                                <div className="header-wrapper">
                                    <h3 style={{ flexGrow: 1 }}>
                                        Ready Players: {this.state.items.length}
                                    </h3>
                                    <button className="button" onClick={this.toggleHide.bind(this)}>Hide</button>
                                </div>
                                {this.state.items.map(({ name, ign }, index) => {
                                    return (<div key={index} className="player-card" >
                                        <div style={{ display: 'flex', flexGrow: 1 }}>
                                            <h5 className="number" style={{ marginTop: '20px' }}>
                                                {index + 1}
                                            </h5>
                                            <div>
                                                <h5>
                                                    {name}
                                                </h5>
                                                <h6>
                                                    IGN: {ign}
                                                </h6>
                                            </div>
                                        </div>
                                        <div className="buttons">
                                            <button className="button-play" onClick={() => this.handlePlay(index)}>
                                                <h5>Play</h5>
                                            </button>
                                            <button className="button-remove" onClick={() => this.handleRemove(index)}>
                                                <h5>Remove</h5>
                                            </button>
                                        </div>
                                    </div>)
                                })}
                            </div>)}
                </div>
            )
        } else {
            return (
                <div className="App">
                </div>
            )
        }
    }
}
