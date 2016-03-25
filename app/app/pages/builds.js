import React from 'react';
import Debug from 'debug'
import Gab from '../common/gab'
import { GridList, GridTile, Divider, FontIcon, Styles, CardText, Card, CardActions, CardHeader, CardMedia, CardTitle } from 'material-ui/lib';

let debug = Debug('simpledocs:app:pages:builds');

export default class GHPages extends React.Component {
	constructor(props) {
		super(props)
		this.displayName = 'GHPages Component'	
		this.state = {
			log: {
				build: [],
				publish: [],
			},
			buildSuccess: false,
			building: false,
			publishing: false,
			publishSuccess: false
		}
		
		this._update = false
		
		this.updates = this.updates.bind(this);
		this.buildPages = this.buildPages.bind(this);
		
		
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
		Gab.on('buildPages', this.updates);
	}
	componentWillUnmount() {
		Gab.removeListener('buildPages', this.updates);
	}
	buildPages(e) {
		e.preventDefault();
		let state = { ...this.state };
		state.log.build = ['Starting to build GitHub Pages source'];
		state.buildSuccess = false;
		state.building = true;
		this.setState(state);
		debug('build pages', snowUI.path.root + '/buildPages');
		Gab.rawRequest(snowUI.path.root + '/buildPages');
	}
	publishPages(e) {
		e.preventDefault();
		let state = { ...this.state };
		state.log.build = ['Starting to publish GitHub Pages source'];
		state.publishSuccess = false;
		state.publishing = true;
		this.setState(state);
		debug('publish pages', snowUI.path.root + '/publishPages');
		Gab.rawRequest(snowUI.path.root + '/publishPages');
	}
	updates(data = {}) {
		debug('build update', data);
		if(data.message && this.state.log.build.indexOf(data.message) === -1) {
			let state = { ...this.state };
			state.log.build.unshift(data.message);
			this.setState(state);
		}
		if(data.success) {
			this.setState({ buildSuccess: true, building: false });
		}
		if(data.published) {
			this.setState({ publishSuccess: true, publishing: false });
		}
	}
	render() {
		debug('status render', this.props);
		
		let buildLog = [];
		
		this.state.log.build.forEach(page => {
			buildLog.push(<span>{page}<br /></span>);
		});
		
		return (<div className="col-xs-12" >
			<Card>
				<Card>
					<CardHeader 
						title={"Build GitHub Pages"}
						subtitle={"Select your options, build the files and upload to a repo."}
						avatar={<FontIcon style={{}} className="material-icons" color={Styles.Colors.blueGrey600} hoverColor={Styles.Colors.blueGrey600} >file_download</FontIcon>}
						titleColor={Styles.Colors.blue600}
						subtitleColor={Styles.Colors.grey500}
					/>
					<CardText  >
						<GridList
							cellHeight={75}
							style={{width:'100%'}}
						> 
							<GridTile 
								key="npmTile"
								title="Build GitHub Pages"
								subtitle={<a style={{color: Styles.Colors.grey300, textDecoration: 'none'}} >Create the files for a gh-pages branch</a>}
								onClick={e => {
									if(!this.state.building && !this.state.publishing) {
										this.props.appState({
											newconfirm: {
												html: 'Do you want to build the GitHub Pages? <br /> This will erase any previous builds!',
												title: 'Build GitHub Pages',
												open: true,
												yesText: 'Yes, start build process.',
												noText: 'STOP',
												answer: () => { this.buildPages(e); }
											}
										});
									} 
								}}
								style={{backgroundColor: this.state.building ? Styles.Colors.amber500 : this.state.buildSuccess ? Styles.Colors.green500 : '#CB3837', cursor: this.state.building || this.state.publishing ? 'not-allowed' : 'pointer'}}
							/>
							<GridTile 
								key="github" 
								title="Publish GitHub Pages"
								subtitle={<a style={{color: Styles.Colors.grey300, textDecoration: 'none'}} >use <code>gh-pages</code> to publish</a>}
								onClick={e => {
									if(!this.state.building && !this.state.publishing) {
										this.props.appState({
											newconfirm: {
												html: 'Do you want to publish the GitHub Pages? <br /> ',
												title: 'Publish GitHub Pages',
												open: true,
												yesText: 'Yes, start publishing process.',
												noText: 'STOP',
												answer: () => { this.publishPages(e); }
											}
										})
									}
								}}
								style={{backgroundColor: this.state.publishing ? Styles.Colors.amber500 : this.state.publishSuccess ? Styles.Colors.green500 : '#333333', cursor: this.state.building || this.state.publishing ? 'not-allowed' : 'pointer'}}
							/>
						</GridList>
					</CardText>
					<CardText style={{}}>
						{buildLog}
					</CardText>
				</Card>
			</Card>	
		</div>);	
	}
}
