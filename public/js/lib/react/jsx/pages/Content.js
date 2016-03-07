import React from 'react';
let yes = true;
let no = false;

export default class Content extends React.Component {
	constructor(props) {
		super(props);
		this.displayName = 'Content Component';	
		this.state = {
			ready: yes,
			register: no,
			mounted: no,
			response:no,
			data:{}
		};
		
		
	}
	componentWillReceiveProps(props) {
		snowlog.log(props)
	}
	render() {
	
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
	}
	componentDidMount() {
		// When the component is added let me know
		this.setState({
			mounted: yes
		});
	}
	
}; 
