import React from 'react';
import ZyngaScroller  from './ZyngaScroller';
import TouchableArea from './TouchableArea';

const PropTypes = React.PropTypes;

function isTouchDevice() {
  return 'ontouchstart' in document.documentElement // works on most browsers
      || 'onmsgesturechange' in window; // works on ie10
};

export default class TouchWrapper extends React.Component {

    constructor(props) {
        super(props);
        this.displayName = 'touch wrapper'	
        this.state = {
            left: 0,
            top: 0,
            contentHeight: 0,
            contentWidth: 0,
        }
        this._update = false
        
        this._handleScroll = this._handleScroll.bind(this);
        this._onContentHeightChange = this._onContentHeightChange.bind(this);
    }
  
    componentWillMount() {
        this.scroller = new ZyngaScroller(this._handleScroll);
    }

    render() {
        if (!isTouchDevice()) {
            return React.cloneElement(this.props.children, {
                height: this.props.tableHeight,
                width: this.props.tableWidth,
            });
        }

        var example = React.cloneElement(this.props.children, {
            onContentHeightChange: this._onContentHeightChange,
            scrollLeft: this.state.left,
            scrollTop: this.state.top,
            height: this.props.tableHeight,
            width: this.props.tableWidth,
            overflowX: 'hidden',
            overflowY: 'hidden',
        });

        return (
            <TouchableArea scroller={this.scroller}>
                {example}
            </TouchableArea>
        );
    }

    _onContentHeightChange(contentHeight) {
        this.scroller.setDimensions(
            this.props.tableWidth,
            this.props.tableHeight,
            Math.max(600, this.props.tableWidth),
            contentHeight
        );
    }

    _handleScroll(left, top) {
        this.setState({
            left: left,
            top: top
        });
    }
};

TouchWrapper.childContextTypes = {
    tableWidth: PropTypes.number.isRequired,
    tableHeight: PropTypes.number.isRequired,
};

