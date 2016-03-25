import React from 'react';
import Debug from 'debug'
import Gab from '../common/gab'
import { GridList, GridTile, Divider, FontIcon, Styles, CardText, Card, CardActions, CardHeader, CardMedia, CardTitle } from 'material-ui/lib';

let debug = Debug('simpledocs:app:pages:status');
		
export default class Status extends React.Component {
	constructor(props) {
		super(props)
		this.displayName = 'Status Component'	
		this.state = {
			
		}
		this._update = false
	}
	
	componentWillReceiveProps(props) {
		debug('receiveProps');
		this._update = true;
	}
	componentDidUpdate() {
		snowUI.fadeIn();
		debug('didUpdate');
	}
	componentDidMount() {
		debug('did mount');
		snowUI.fadeIn();
	}
	render() {
		debug('status render', this.props);
		let status;
		if(this.props.connected || !snowUI.usesockets) {
			let msg = !snowUI.usesockets ? '' : "The server is online and accepting page requests.";
			status =  (
				<CardHeader 
					title={"SimpleDocs document generator"}
					subtitle={msg}
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
		let ghpages = <span />;
		if(snowUI.chief) {
			ghpages = (
				<Card>
					<CardHeader 
						title={"Create Builds"}
						subtitle={"Create static build for ghpages and download"}
						avatar={<FontIcon style={{}} className="material-icons" color={Styles.Colors.blueGrey600} hoverColor={Styles.Colors.blueGrey600} >file_download</FontIcon>}
						titleColor={Styles.Colors.blue600}
						subtitleColor={Styles.Colors.grey500}
						actAsExpander={true}
						showExpandableButton={true}
					/>
					<CardText expandable={true} >
						<GridList
							cellHeight={100}
							style={{width:'100%'}}
							cols={3}
						>
							<GridTile 
								key="GitHub"
								title="GitHub Pages"
								onClick={e => this.props.goTo('builds')}
								subtitle="Build for gh-pages"
								style={{backgroundColor: '#333335', cursor: 'pointer'}}
							/>
							<GridTile 
								key="pdf"
								title="PDF"
								onClick={e => this.props.goTo('builds')}
								subtitle="Download a PDF"
								style={{backgroundColor: '#9F4206', cursor: 'pointer'}}
							/>
							<GridTile 
								key="static"
								title="HTML Download"
								onClick={e => this.props.goTo('builds')}
								subtitle="all pages zipped up"
								style={{backgroundColor: '#23214C', cursor: 'pointer'}}
							/>
						</GridList>
					</CardText>
				</Card>
			);
		}
		return (<div className="col-xs-12" >
			<Card>
				{status}
				<CardText style={{}} >
					
				</CardText>
				{ghpages}
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
							cellHeight={75}
							style={{width:'100%'}}
						>
							<GridTile 
								key="npmTile"
								title="NPM"
								subtitle={<a style={{color: Styles.Colors.grey300, textDecoration: 'none'}} href="https://npmjs.org/package/simpledocs" target="_blank">Package Info</a>}
								style={{backgroundColor: '#CB3837'}}
							/>
							<GridTile 
								key="github"
								title="GitHub"
								subtitle={<a style={{color: Styles.Colors.grey300, textDecoration: 'none'}} href="https://github.com/inquisive/simpledocs" target="_blank">Source</a>}
								style={{backgroundColor: '#333333'}}
							/>
						</GridList>
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
						<h4>A few of the libraries used to build SimpleDocs. </h4> 
						<GridList
							cellHeight={75}
							style={{ width:'100%' }}
							cols={3}
						>
							<GridTile 
								key="nodeTile"
								title={<a style={{color: Styles.Colors.grey300, textDecoration: 'none'}} href="http://nodejs.org" target="_blank">Nodejs</a>}
								style={{backgroundColor: '#2D542D'}}
							/>
							<GridTile 
								key="mongoTile"
								title={<a style={{color: Styles.Colors.grey300, textDecoration: 'none'}} href="http://mongoosejs.com/" target="_blank">Mongoose & MongoDB</a>}
								style={{backgroundColor: '#2B4BA7'}}
							/>
							<GridTile 
								key="keystoneTime"
								title={<a style={{color: Styles.Colors.grey300, textDecoration: 'none'}} href="http://keystonejs.com/" target="_blank">Keystone</a>}
								style={{backgroundColor: '#2B4BA7'}}
							/>
							<GridTile 
								key="bootTile"
								title={<a style={{color: Styles.Colors.grey300, textDecoration: 'none'}} href="http://getbootstrap.com/" target="_blank">Bootstrap</a>}
								style={{backgroundColor: '#2B4BA7'}}
							/>
							<GridTile 
								key="reactTile"
								title={<a style={{color: Styles.Colors.grey300, textDecoration: 'none'}} href="http://facebook.github.io/react/docs/thinking-in-react.html" target="_blank">React JS</a>}
								style={{backgroundColor: '#2B3D6D'}}
							/>
							<GridTile 
								key="matrerialTile"
								title={<a style={{color: Styles.Colors.grey300, textDecoration: 'none'}} href="http://material-ui.com/" target="_blank">Material-UI</a>}
								style={{backgroundColor: '#4EAEBB'}}
							/>
						</GridList>
					</CardText>
				</Card>
				<Card>
					<CardHeader 
						title={"Theme"}
						subtitle={"switch between the available themes"}
						avatar={<FontIcon style={{}} className="material-icons" color={Styles.Colors.blueGrey600} hoverColor={Styles.Colors.blueGrey600} >invert_colors</FontIcon>}
						titleColor={Styles.Colors.blue600}
						subtitleColor={Styles.Colors.grey500}
						actAsExpander={false}
						showExpandableButton={false}
					/>
				</Card>
				<GridList
					cellHeight={100}
					style={{width:'100%'}}
					cols={7}
					padding={0}
				>
					<GridTile 
						key="MaterialL7ightTheme"
						title={"Cream"}
						onClick={e => this.props.switchTheme('cream')}
						style={{backgroundColor: '#FFFCEF', cursor: 'pointer'}}
					/>
					<GridTile 
						key="MaterialLightTheme"
						title={"Light"}
						onClick={e => this.props.switchTheme('light')}
						style={{backgroundColor: '#eeeeee', cursor: 'pointer'}}
					/>
					<GridTile 
						key="MaterialDLightTheme"
						title={"Blue"}
						onClick={e => this.props.switchTheme('blue')}
						style={{backgroundColor: '#0C87C1', cursor: 'pointer'}}
					/>
					<GridTile 
						key="MaterialTheme"
						title={"Graphite"}
						onClick={e => this.props.switchTheme('graphite')}
						style={{backgroundColor: '#303030', cursor: 'pointer'}}
					/>
					<GridTile 
						key="MaterialDarkTheme"
						title={"Night"}
						onClick={e => this.props.switchTheme('night')}
						style={{backgroundColor: '#223E77', cursor: 'pointer'}}
					/>
					<GridTile 
						key="MateriallDDarkTheme"
						title={"Dark"}
						onClick={e => this.props.switchTheme('dark')}
						style={{backgroundColor: '#0097A7', cursor: 'pointer'}}
					/>
					<GridTile 
						cols={1}
						key="bliteTheme"
						title="Bootstrap UI"
						onClick={e => this.props.appState({
							newconfirm: {
								html: 'Do you want to switch to the Bootstrap UI?',
								title: 'Bootstrap UI',
								open: true,
								yesText: 'Yes, go to Bootstrap UI.',
								noText: 'No, close prompt.',
								answer: () => { location.href = snowUI.path.bootstrap }
							}
						})}
						style={{backgroundColor: '#0C87C1', cursor: 'pointer'}}
					/>
				</GridList>
			</Card>
		</div>);	
	}
}

