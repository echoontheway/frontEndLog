import React, { Component } from 'react'
import ReactDOM from "react-dom"
import log from './index'

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = {
            hasError: false
        }
    }

    componentDidCatch(error, info) {
        // Display fallback UI
        this.setState({
            hasError: true
        });
        // You can also log the error to an error reporting service
        log.errorTransAndAdd(error,info)
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <p> button error </p>
        }
        return this.props.children
    }
}