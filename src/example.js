import React, { Component } from 'react'
import ReactDOM from "react-dom"
import style from "./main.css"
import log from './index'
import ErrorBoundary from './errorBoundary'

class Animal{
    constructor(name){
        this.name = name
    }
    feed(food){
        throw new Error('method error from common parent class')
        return `The ${this.name} eats ${food}`
    }
}

//@log.catchClass
class Cat extends Animal{
    constructor(name){
        super(name)
        this.feature = 'many lifes'
    }
    @log.catchMethod
    jump(place){
        //promise
        new Promise(function(resolve,reject){
            throw new Error('promise inner error')
        }).catch(e=>log.errorPre(e))
        //async函数
        async function myAsyncFun(){
            await x+2
        }
        myAsyncFun().catch(e=>log.errorPre(new Error('async function inner error')))
        //setTimeout内的抛错交由window.onerror处理
        setTimeout(function(){
            throw new Error('setTimeout inner error')
        },0)
        //throw new Error('method error from common class')
        return `The ${this.name} jumps to the ${place}`
    }
}

class Button extends Component{
    constructor(props){
        super(props)
        this.state = {
            species:new Cat(props.species),
            feed:false,
            jump:false
        }
        this.catFeed = this.catFeed.bind(this,{a:1,b:false,c:null,d:undefined,e:[null,undefined,1],f:function(){}},NaN)
        this.catJump = this.catJump.bind(this,{a:1,b:false,c:null,d:undefined,e:[null,undefined,1],f:function(){}},NaN)
    }
    @log.trackAction('sth')
    @log.catchMethod
    catFeed(data){
        this.setState((prevState, props) => {
            return {feed: !prevState.feed}
        })
        throw new Error('event handler error from React.Component')
    }
    catJump(data){
        this.setState((prevState, props) => {
            return {jump: !prevState.jump}
        })
    }
    render(){
        const {feed,jump,species} = this.state
        if(feed){
            //throw new Error('render error from React.Component')
        }
        return (
            <div>
                <button onClick={this.catFeed}>
                    {feed?`${species.feed('fish')}`:`feed ${species.name}`}
                </button>
                <button onClick={this.catJump}>
                    {jump?`${species.jump('roof')}`:`${species.name} jump`}
                </button>
            </div>
        )
    }
}

function App(){
    return (
        <div>
            <h2>collect user action,script error</h2>
            <ErrorBoundary>
                <Button species='cat'/>
            </ErrorBoundary>
        </div>
    )
}
 
ReactDOM.render(<App />,document.getElementById("app"))