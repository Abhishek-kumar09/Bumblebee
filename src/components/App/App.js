import React from 'react'
import Authentication from '../../util/Authentication/Authentication'

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
            ]
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

    // player = [
    //     {name:"Abhishek Kumar", ign:"Abhi@87649817"},
    //     {name:"Shivam Beniwal", ign:"beniwal@1223" },
    //     {name:"Peter Nguyen", ign:"petercrackthecode"},
    //     {name:"Nguyen's Brother", ign:"nguyen'sbrother"},
    //     {name:}
    // ]


    render() {
        if (this.state.finishedLoading && this.state.isVisible) {
            return (
                <div className="App">
                    <div className="container-board App-dark">
                        <h3>
                            Ready Players: {this.state.items.length}
                        </h3>
                        {this.state.items.map(({name, ign}, index) => {
                            return <CardItem key={index} id={index+1} name={name} ign={ign} key={index} />
                        })}
                    </div>
                    {/* <iframe src="https://gifer.com/embed/xw" width="150" height="150" frameBorder="0" allowFullScreen
                        style={{
                            pointerEvents: 'none',
                            backgroundColor: 'green',
                            position: 'absolute',
                            right: 0,
                            top: 200
                        }}o
                    /> */}

                    {/* <div className={this.state.theme === 'light' ? 'App-light' : 'App-dark'}>
                        <p>Hello Peter</p>
                        <p>My token is: {this.Authentication.state.token}</p>
                        <iframe src="https://gifer.com/embed/xw" width="150" height="150" frameBorder="0" allowFullScreen style={{ pointerEvents: 'none' }} />
                        <iframe src="https://gifer.com/embed/1aFh" width="150" height="150" frameBorder="0" allowFullScreen></iframe>
                        <p>My opaque ID is {this.Authentication.getOpaqueId()}.</p>
                        <div>
                            {this.Authentication.isModerator()
                                ? <p>I am currently a mod, and here's a special mod button <input value='mod button' type='button' /></p>
                                : 'I am currently not a mod.'}</div>
                        <p>I have {this.Authentication.hasSharedId() ? `shared my ID, and my user_id is ${this.Authentication.getUserId()}` : 'not shared my ID'}.</p>
                    </div> */}
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


function CardItem({id, name, ign }) {
    return (
        <div className="player-card" >
            <div style={{ display: 'flex', flexGrow: 1 }}>
                <h5 className="number" style={{marginTop: '20px'}}>
                    {id}
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
                <button className="button-play" onClick={() => { console.log("hello") }}>
                    <h5>Play</h5>
                </button>
                <button className="button-remove">
                    <h5>Remove</h5>
                </button>
            </div>
        </div>
    )
}