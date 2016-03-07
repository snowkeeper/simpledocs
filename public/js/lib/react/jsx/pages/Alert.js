import React from 'react';

export default class Alert2 extends React.Component {
	constructor(props) {
		super(props);
		this.displayName = 'Alert Component';	
		this.state = {
			isVisible: true
		};
	}
	
	render() {
		if(!this.state.isVisible)
		    return null;

		var message = this.props.children;
		return (
		    <div className={"alert " + this.props.showclass + " alert-dismissable"} role="alert" >
				<button type="button" onClick={this.dismissAlert} className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<p>{message}</p>
		    </div>
		);
	}
	dismissAlert() {
		this.setState({
			isVisible: false
		});
		if(Array.isArray( this.props.clearintervals ))this.props.clearintervals.map(Link.Interval.clearIntervals);
		if(Array.isArray( this.props.cleartimeouts ))this.props.cleartimeouts.map(clearTimeout);
	}
};

Alert2.defaultProps = { 
	showclass: 'info'
}
