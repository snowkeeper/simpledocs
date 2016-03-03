import React from 'react';
import Debug from 'debug'
import Gab from '../common/gab'
import { pickIcon } from '../common/utils';
import { GridList, GridTile, Divider, FontIcon, Styles, CardText, Card, CardActions, CardHeader, CardMedia, CardTitle } from 'material-ui/lib';
import { Col } from 'react-bootstrap';

let debug = Debug('simpledocs:app:pages:disconnect');
		
export default class Disconnect extends React.Component {
	constructor(props) {
		super(props)
		this.displayName = 'Disconnect Component'	
		this.state = {
			
		}
		this._update = false
	}
	
	componentWillReceiveProps(props) {
		debug('receiveProps');
		this._update = true;
	}
	componentDidUpdate() {
		debug('didUpdate');
	}
	componentDidMount() {
		debug('did mount');
		
	}
	render() {
		debug('disconnect render', this.state, this.props);
		let status;
		if(this.props.sockets.io.connected) {
			status =  (
				<CardHeader 
					title={"Server Connected"}
					subtitle={"The agent is currently responding to socket requests"}
					avatar={<FontIcon style={{fontSize:'42px'}} className="material-icons" color={Styles.Colors.green600} hoverColor={Styles.Colors.blue600} >cloud_done</FontIcon>}
					titleColor={Styles.Colors.green600}
					subtitleColor={Styles.Colors.grey500}
				/>
			);
		} else {
			status = (
				<CardHeader 
					title={"Server Connection Issues"}
					subtitle={"The agent is currently not responding to socket requests"}
					avatar={<FontIcon style={{fontSize:'42px'}} className="material-icons" color={Styles.Colors.red600} hoverColor={Styles.Colors.amber500} >cloud_off</FontIcon>}
					titleColor={Styles.Colors.red600}
					subtitleColor={Styles.Colors.grey500}
				/>
			);
		}
		
		return (<Col xs={12}  >
			<Card>
				{status}
				<CardText style={{}} >
					
				</CardText>
			
				<Card>
					<CardHeader 
						title={"Get SimpleDocs"}
						subtitle={"GitHub and NPM information"}
						avatar={<FontIcon style={{}} className="material-icons" color={Styles.Colors.blueGrey600} hoverColor={Styles.Colors.blueGrey600} >file_download</FontIcon>}
						titleColor={Styles.Colors.blue600}
						subtitleColor={Styles.Colors.grey500}
						actAsExpander={true}
						showExpandableButton={true}
					/>
					<CardText expandable={true} >
						<GridList
							cellHeight={150}
							style={{width:'100%'}}
						>
							<GridTile 
								key="npmTile"
								title="NPM"
								subtitle={<a style={{color: Styles.Colors.grey300}} href="https://npmjs.org/package/simpledocs" target="_blank">Package Info</a>}
								style={{backgroundColor: '#CB3837'}}
							/>
							<GridTile 
								key="github"
								title="GitHub"
								subtitle={<a style={{color: Styles.Colors.grey300}} href="https://github.com/inquisive/simpledocs" target="_blank">Source</a>}
								style={{backgroundColor: '#333333'}}
							/>
						</GridList>
						<div style={{borderBottom:'transparent 15px solid'}} />
					</CardText>
				</Card>
				<Card>
					<CardHeader 
						title={"About"}
						subtitle={"information"}
						avatar={<FontIcon style={{}} className="material-icons" color={Styles.Colors.blueGrey600} hoverColor={Styles.Colors.blueGrey600} >info_outline</FontIcon>}
						titleColor={Styles.Colors.blue600}
						subtitleColor={Styles.Colors.grey500}
						actAsExpander={true}
						showExpandableButton={true}
					/>
					<CardText expandable={true} >
						<div className="">
							SimpleDocs is built with these libraries and more...
							<div className="row">
								<div className="col-xs-6 col-sm-4 col-md-3"><a href="http://nodejs.org" target="_blank">nodejs</a></div>
								<div className="col-xs-6 col-sm-4 col-md-3"><a href="http://keystonejs.com" target="_blank">KeystoneJS</a></div>
								<div className="col-xs-6 col-sm-4 col-md-3"><a href="http://getbootstrap.com/" target="_blank">Bootstrap</a></div>
								<div className="col-xs-6 col-sm-4 col-md-3"><a href="http://facebook.github.io/react/docs/thinking-in-react.html" target="_blank">ReactJS</a></div>
								
							</div>
							<div style={{borderBottom:'transparent 15px solid'}} />
						</div>
					</CardText>
				</Card>
				<Card>
					<CardHeader 
						title={"Theme"}
						subtitle={"switch between the available themes"}
						avatar={<FontIcon style={{}} className="material-icons" color={Styles.Colors.blueGrey600} hoverColor={Styles.Colors.blueGrey600} >invert_colors</FontIcon>}
						titleColor={Styles.Colors.blue600}
						subtitleColor={Styles.Colors.grey500}
						actAsExpander={true}
						showExpandableButton={true}
					/>
					<CardText expandable={true} >
						<div className="">
							<div className="row">
								<div title="change theme" className="col-xs-offset-1 col-xs-11"> <a style={{cursor:'pointer'}} onClick={snowUI.toggleTheme}>Switch between light and dark themes</a></div>
								<br />
							</div>
							<div style={{borderBottom:'transparent 15px solid'}} />
						</div>
					</CardText>
				</Card>
				
			</Card>
		</Col>);	
	}
}

