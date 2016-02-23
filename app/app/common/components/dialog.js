import React from 'react';
import { RaisedButton, FlatButton, Dialog, Styles } from 'material-ui/lib';

import debugging from 'debug';
let	debug = debugging('epg:app:common:components:dialog');

export default class Dialog2 extends React.Component {
	constructor(props) {
		super(props);
		
		this.handleNo = this.handleNo.bind(this);
	}
	
	handleNo() {
		if(typeof this.props.answer == 'function') {
			this.props.answer(false);
		}
	}
	
	render() {
		const actions = [
			<FlatButton
				label={this.props.closeText}
				secondary={true}
				onTouchTap={this.handleNo} 
				style={{ color: Styles.Colors.blueGrey500}} 
			/>,
			<div className="clearfix" />
		];

		return (
			<div>
				
				<Dialog
					title={this.props.title}
					actions={actions}
					modal={false}
					open={this.props.open}
					onRequestClose={this.handleNo}
				>
					
					<div dangerouslySetInnerHTML={{__html:this.props.html}} />
				
				</Dialog>
			</div>
		);
	}
}

Dialog2.defaultProps = {
	closeText: 'Close',
	open: false,
	html: 'Placeholder Text',
	title: 'Dialog',
};
