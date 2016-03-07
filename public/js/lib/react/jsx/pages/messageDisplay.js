import React from 'react';
export default class messageDisplay extends React.Component {
	constructor(props) {
		super(props);
		this.displayName = 'messageDisplay Component';	
		this.state = {
			
		};
		
		
	}	
	componentDidMount() {
		//snowUI.loaderRender();
	}
	componentDidUpdate() {
		
	}
	componentDidMount() {
		this.componentDidUpdate()
	}
	render() {
	     
	    snowlog.log('warning message component')
	    
	    return (<div  style={{padding:'5px 20px'}} >
			<div className={this.props.type}>
				<span> {this.props.title || 'I have an important message for you.'}</span>
				<div className="message">
					<p>{this.props.message}</p>
				</div>
			</div>
			
		</div>);
	}
};
