import React from 'react';
import { RaisedButton, FlatButton, Dialog, Styles } from 'material-ui/lib';

import debugging from 'debug';
let	debug = debugging('epg:app:common:components:confirm');

	
let myStyles = {
	//textColor: Styles.Colors.blue600,
	//alternateTextColor: Styles.Colors.amber400,
	//accent1Color: "#FF6040",
	//accent2Color: "#F5001E",
	//accent3Color: "#FA905C"
}

export default class Modal extends React.Component {
	constructor(props) {
		super(props);
				
		this.handleYes = this.handleYes.bind(this);
		this.handleNo = this.handleNo.bind(this);
	}
	
	getChildContext() {
		console.log(this.props)
		return {
			muiTheme: this.props.theme
		};
	}
	
	handleYes() {
		if(typeof this.props.answer == 'function') {
			this.props.answer(true);
		}
	}
	
	handleNo() {
		if(typeof this.props.answer == 'function') {
			this.props.answer(false);
		}
	}
	
	render() {
		const actions = [
			<FlatButton
				label={this.props.noText}
				secondary={true}
				onTouchTap={this.handleNo}
				style={{float: 'left', color: Styles.Colors.blueGrey500}} 
			/>,
			<FlatButton
				label={this.props.yesText}
				primary={true}
				onTouchTap={this.handleYes} 
			/>,
			
		];

		return (
			<div>
				
				<Dialog
					title={this.props.title}
					actions={actions}
					modal={true}
					open={this.props.open}
					className={this.props.class}
				>
					<div style={this.props.style.body} dangerouslySetInnerHTML={{__html:this.props.html}} />
				</Dialog>
			</div>
		);
	}
}

Modal.defaultProps = {
	yesText: 'Delete',
	noText: 'Cancel',
	open: false,
	html: 'Placeholder Text',
	title: 'Confirm',
	style: {
		body: {}
	},
	class: 'epg__confirm epg__amber'
};
Modal.childContextTypes = {
    muiTheme: React.PropTypes.object
};
