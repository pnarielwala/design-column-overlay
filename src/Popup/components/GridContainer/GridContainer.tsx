import React from 'react'
import ReactDOM from 'react-dom'

const gridRoot = document.getElementsByTagName('body')

type PropsT = {}

class GridContainer extends React.Component<PropsT> {
  el: HTMLDivElement
  constructor(props: PropsT) {
    super(props)
    this.el = document.createElement('div')
  }

  componentDidMount() {
    gridRoot?.[0].appendChild(this.el)
  }

  componentWillUnmount() {
    gridRoot?.[0].removeChild(this.el)
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.el)
  }
}

export default GridContainer
