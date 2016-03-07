import React from 'react';
export default class AppIfo extends React.Component {
	constructor(props) {
		super(props);
		this.displayName = 'AppInfo Component';	
		this.state = {};
	}	
	render() {
		return (
			<div id="easter-egg" style={{display:'none'}} >
				<div className="col-xs-offset-1 col-md-offset-1">
					<div className="col-xs-12 col-md-5">
						<h4>Get SimpleDocs</h4>
						<div className="row">
							<div className="col-sm-12">GitHub &nbsp;&nbsp;&nbsp;<a href="https://github.com/inquisive/simpledocs" target="_blank">source</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;<a href="https://github.com/inquisive/simpledocs/archive/latest.zip" target="_blank">latest.zip</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="https://github.com/inquisive/simpledocs/archive/latest.tar.gz" target="_blank">latest.tar.gz</a></div>
							<div className=" col-sm-12">NPM &nbsp;&nbsp;&nbsp;<a href="https://npmjs.org/package/simpledocs" target="_blank">Package Info</a></div>							
						</div>
						<div style={{borderBottom:'transparent 15px solid'}} />
					</div>
					<div className="clearfix" style={{borderBottom:'transparent 15px solid'}} />
					<div className="col-xs-11 col-md-10">
						<h4>Theme</h4>
						<div className="row">
							<div title="change theme" className="col-sm-12"  > 
								<a style={{cursor:'pointer'}} onClick={e => snowUI.setTheme('')}>White theme</a> &nbsp; |  &nbsp;
								<a style={{cursor:'pointer'}} onClick={e => snowUI.setTheme('light-theme')}>Blue theme</a>  &nbsp;| &nbsp;
								<a style={{cursor:'pointer'}} onClick={e => snowUI.setTheme('dark-theme')}>Dark theme</a> &nbsp;| &nbsp;
								<a style={{cursor:'pointer'}} href={snowUI.path.material}>material-ui</a>
							 </div>
							<div className="clearfix" />
							<br />
						</div>
					</div>
					<div className="clearfix" style={{borderBottom:'transparent 15px solid'}} />
			      </div>
			</div>
		);
	}
};
