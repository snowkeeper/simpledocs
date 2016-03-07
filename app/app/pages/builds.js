import React from 'react';
import Debug from 'debug'
import Gab from '../common/gab'
import { GridList, GridTile, Divider, FontIcon, Styles, CardText, Card, CardActions, CardHeader, CardMedia, CardTitle } from 'material-ui/lib';

let debug = Debug('simpledocs:app:pages:gh-pages');
		
export default class GHPages extends React.Component {
	constructor(props) {
		super(props)
		this.displayName = 'GHPages Component'	
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
								title="NPM"
								subtitle={<a style={{color: Styles.Colors.grey300, textDecoration: 'none'}} href="https://npmjs.org/package/simpledocs" target="_blank">Package Info</a>}
								style={{backgroundColor: '#CB3837', cursor: 'pointer'}}
							/>
							<GridTile 
								key="github"
								title="GitHub"
								subtitle={<a style={{color: Styles.Colors.grey300, textDecoration: 'none'}} href="https://github.com/inquisive/simpledocs" target="_blank">Source</a>}
								style={{backgroundColor: '#333333', cursor: 'pointer'}}
							/>
						</GridList>
					</CardText>
				</Card>
			</Card>	
		</div>);	
	}
}

