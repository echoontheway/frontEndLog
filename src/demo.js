import React, { Component } from 'react'
import ReactDOM from "react-dom"
import style from "./main.css"
import log from './index'
import ErrorBoundary from './errorBoundary'

window.logger = new log({
    mode:window.PAGE_CONFIG.env
})

class Animal{
    constructor(name){
        this.name = name
    }
    eat(){
        //promise
        new Promise(function(resolve,reject){
            throw new Error('promise inner error')
        }).catch(e=>logger.errorTransAndAdd(e))
        //async函数
        async function myAsyncFun(){
            await x+2
        }
        myAsyncFun().catch(e=>logger.errorTransAndAdd(e))
    }
    run(){
        //setTimeout内的抛错交由window.onerror处理
        setTimeout(function(){
            throw new Error('setTimeout inner error')
        },0)
    }
    
}

@logger.catchClass
class Cat extends Animal{
    constructor(name){
        super(name)
        this.feature = 'many lifes'
    }
    jump(){
        throw new Error('method error from common class')
    }
}

class Button extends Component{
    constructor(props){
        super(props)
        this.state = {
            incurError:false
        }
        this.childError = this.childError.bind(this)
    }
    childError(){
        this.setState(prevState=>({incurError:true}))
    }
    render(){
        const {incurError} = this.state
        return incurError?a.b:<button onClick={this.childError} style={{display:'block'}}>click me and test</button>
    }
}

class App extends Component{
    constructor(props){
        super(props)
        this.state = {
            act:false,
            click:false,
            jump:false,
            eat:false,
            run:false,
            incurError:false
        }
        this.cat = new Cat('kitty')
    }
    @logger.trackAction('test user action collection')
    handleAct(act){
        this.setState(prevState=>({act}));
    }
    @logger.catchMethod
    handleClick(click){
        a.b = click
        this.setState(prevState=>({click}))
    }
    catJump(jump){
        this.cat.jump()
        this.setState(prevState=>({jump}))
    }
    catEat(eat){
        this.cat.eat()
        this.setState(prevState=>({eat}))
    }
    catRun(run){
        this.cat.run()
        this.setState(prevState=>({run}))
    }
    render(){
        const {act,click,jump,eat,run,incurError} = this.state
        return (
            <div>
                open your console (F12) to view the log 
                <div className='container'>
                    <section>
                        <h2>user action</h2>
                        <code>@logger.trackAction('test user action collection')</code>
                        <button onClick={this.handleAct.bind(this,!act,{a:1,b:false,c:null,d:undefined,e:[null,undefined,1],f:function(){}},NaN)} style={{display:'block'}}>
                            {act?'try again':'click me and test'}
                        </button>
                    </section>
                    <section>
                        <h2>methods of class error</h2>
                        <code>@logger.catchClass</code>
                        <button onClick={this.catJump.bind(this,!jump)} style={{display:'block'}}>
                            {jump?'try again':'click me and test'}
                        </button>
                    </section>
                    <section>
                        <h2>manually catch and call errorTransAndAdd</h2>
                        <code>catch(e=>logger.errorTransAndAdd(e))</code>
                        <button onClick={this.catEat.bind(this,!eat)} style={{display:'block'}}>
                            {eat?'try again':'click me and test'}
                        </button>
                    </section>
                    <section>
                        <h2>uncought error</h2>
                        <code>window.onerror</code>
                        <button onClick={this.catRun.bind(this,!run)} style={{display:'block'}}>
                            {run?'try again':'click me and test'}
                        </button>
                    </section>
                    <section>
                        <h2>react component event handler error</h2>
                        <code>@logger.catchMethod</code>
                        <button onClick={this.handleClick.bind(this,!click)} style={{display:'block'}}>
                            {click?'try again':'click me and test'}
                        </button>
                    </section>
                    <section>
                        <h2>react child component special methods error</h2>
                        <code>Error Boundary:componentDidCatch</code>
                        <ErrorBoundary>
                            <Button />
                        </ErrorBoundary>
                    </section>
                </div>
            </div>
        )
    }
}
 
ReactDOM.render(<App />,document.getElementById("app"))