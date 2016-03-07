module.exports = React.createClass({
	getInitialState: function() {
		return {
			ready: yes,
			register: no,
			mounted: no,
			response:no,
			data:{}
		};
	},
	componentWillReceiveProps: function(props) {
		snowlog.log(props)
	},
	render: function() {
		
		var renderMe;
		var showcomp = this.props.config.page || 'home';
		var UI = snowUI.UI;
		
		snowlog.log('content component')
		
		if(this.state.error ) {
			 renderMe = (<UI.displayMessage   message ={this.state.message} type = 'warning' />);
		} else if(!this.state.ready) {
			snowlog.warn('empty render for content')
			return (<div />)
		
		} else if(UI[showcomp]) {
			var po = UI[showcomp]
			renderMe = (<po config={this.props.config} />)
		
		} else {
			renderMe = (<UI.displayMessage  title = '404 Not Found' message = 'I could not find the page you are looking for. ' type = 'requesterror' />);
		}     
		return renderMe;
	},
	componentDidMount: function() {
		// When the component is added let me know
		this.setState({
			mounted: yes
		});
	},
	
}); 
