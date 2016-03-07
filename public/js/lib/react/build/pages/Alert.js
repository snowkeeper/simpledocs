
var Alert = ReactBootstrap.Alert;

module.exports = React.createClass({
	getInitialState: function() {
		return {
			isVisible: true
		};
	},
	getDefaultProps: function() {
		return ({showclass:'info'});
	},
	render: function() {
		if(!this.state.isVisible)
		    return null;

		var message = this.props.children;
		return (
		    <Alert bsStyle={this.props.showclass} onDismiss={this.dismissAlert}>
			<p>{message}</p>
		    </Alert>
		);
	},

	dismissAlert: function() {
		this.setState({isVisible: false});
		if(this.props.clearintervals instanceof Array)this.props.clearintervals.map(Link.Interval.clearIntervals);
		if(this.props.cleartimeouts instanceof Array)this.props.cleartimeouts.map(clearTimeout);
	}
});
