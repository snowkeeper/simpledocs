import React from 'react';
import Debug from 'debug'
import Gab from '../common/gab'
import { pickIcon } from '../common/utils';
import { DropDownMenu, MenuItem, ToolbarGroup, Toolbar, ToolbarSeparator, Divider, CardText, CardMedia, CardHeader, CardActions, Card, CardTitle, Styles, List, IconButton, ListItem, FlatButton, FontIcon } from 'material-ui/lib';
import { Col } from 'react-bootstrap';
import Icons from '../assets/icons';
import Menu from '../common/components/menu';

let debug = Debug('simpledocs:app:pages:home');
		
export default class Home extends React.Component {
	constructor(props) {
		super(props)
		this.displayName = 'Home Component';	
		this.state = {
			ready: true,
			page: props.page,
		};
		if(props.page) props.sockets.page(props.page);
		this._update = false;
	}
	
	componentWillReceiveProps(props) {
		this._update = true;
		debug('home got props',props, props.sockets.page)
		if(props.page !== this.state.page) {
			props.sockets.page(props.page);
			snowUI.page = props.page;
			this.setState({
				page: props.page
			});
		}
	}
	componentDidUpdate() {
		debug('didUpdate');
	}
	componentDidMount() {
		debug('did mount');
		
	}
	render() {
		debug('home render', this.state, this.props);
		let content;
		if(this.props.contents) {
			content = UI.render.call(this);
		} else {
			content = 'Loading';
		}
		return (<Col xs={12} >
			<Card>
				<CardText>
					{content}
				</CardText>
			</Card>
		</Col>);
	}
}
let UI ={
	render: function() {
		var _this = this;
		var printMenu = <Menu { ...this.props } />;
		
		//console.log(this.state.ready,this.props.contents);
		if(this.state.ready && this.props.contents) {
			var doc = this.props.contents;
			if(doc.ok) {
				/* search results */
				var search = true;
				var prev;
				var next;
				var results = doc.results.length;
				if(results > 0) {
					var display = doc.results.map(function(result) {
						var score = result.score;
						var page = result.obj;
						var content = 
							page.display === 1 ? 
								page.markdown ? 
									(<div key="fullcontent"><div dangerouslySetInnerHTML={{__html: page.markdown.html}} /> </div>)
									: <span /> 
								: page.display === 2 ? 
									(<div key="fullcontent" ><div dangerouslySetInnerHTML={{__html:page.html}} /> </div>)
									: page.display === 3 ? 
										(<div key="fullcontent"> <div key="fullcontentB"  dangerouslySetInnerHTML={{__html: page.html}} /><div  key="fullcontentA"  dangerouslySetInnerHTML={{__html: page.html}} /></div>) 
										: page.display === 4 ? 
											(<div key="fullcontent"> <div key="fullcontentA"  dangerouslySetInnerHTML={{__html: page.html}} /><div  key="fullcontentB"  dangerouslySetInnerHTML={{__html: page.markdown.html}} /></div>)
											: <span />  
						return (<div key={score} className="search-result item">
							<div className="title"><h3><a href={snowUI.path.root + '/' + page.slug} className="sdlink" >{page.title}</a></h3></div>
							<div className="score" style={{width:(parseFloat(score)*100) + '%'}} />
							<div className="blurb">{content}</div>
						</div>);
					});
				} else {
					var display = <h4>No results</h4>;
				}
				
			} else {
				/* page data */
				debug('display page data', doc, this.props.contents)
				var search = false;
				if(typeof doc !== 'object')doc = {}
				if(typeof doc.parent !== 'object')doc.parent = {}
				var content = 
					doc.display === 1 ? 
						this.props.contents.markdown ? 
							(<div key="fullcontent"><div dangerouslySetInnerHTML={{__html: this.props.contents.markdown.html}} /> </div>)
							: <span /> 
						: doc.display === 2 ? 
							(<div key="fullcontent" ><div dangerouslySetInnerHTML={{__html: this.props.contents.html}} /> </div>)
							: doc.display === 3 ? 
								(<div key="fullcontent"> <div key="fullcontentB"  dangerouslySetInnerHTML={{__html: this.props.contents.markdown.html}} /><div  key="fullcontentA"  dangerouslySetInnerHTML={{__html: this.props.contents.html}} /></div>) 
								: doc.display === 4 ? 
									(<div key="fullcontent"> <div key="fullcontentA"  dangerouslySetInnerHTML={{__html: this.props.contents.html}} /><div  key="fullcontentB"  dangerouslySetInnerHTML={{__html: this.props.contents.markdown.html}} /></div>)
									: <span />  
				
				
				if(doc.type === 1) {
					/* show the content only */
					var display = content;
					
				} else if(doc.type === 2) {
					/* show list of child root documents */
					if(snowUI.menu[doc._id]) {
						var list = snowUI.menu[doc._id].docs;
						var display = <Menu list={list} { ...this.props } />;			
					}
					
				} else {
					/* show the contents then a list of child root documents */
					//snowlog.info('show content and child doc list',snowUI.menu,doc._id);
					var display = [];
					if(snowUI.menu[doc._id]) {
						var list = snowUI.menu[doc._id].docs;
						display.push(<Menu list={list} { ...this.props } />);			
					}
					display.unshift(<div key="dualpage">{content}</div>);
				}
				/* navigation butoons for bottom */
				if(snowUI.menu[doc._id]) {
					var prev = snowUI.menu[doc.parent._id] ? 
						typeof snowUI.menu[doc.parent._id].docs[doc.order-2] === 'object' ? 
							(
								 <FlatButton
									label={snowUI.menu[doc.parent._id].docs[doc.order-2].title}
									onClick={e => {
										e.preventDefault();
										this.props.goTo(snowUI.menu[doc.parent._id].docs[doc.order-2].slug);
									}}
									secondary={true}
									icon={<FontIcon className="material-icons" color={Styles.Colors.lightBlue600} hoverColor={Styles.Colors.lightBlue300} >home</FontIcon>}
								/>
							) 
							: <span /> 
						: <span />;
					var next = snowUI.menu[doc._id] ? 
						typeof snowUI.menu[doc._id].docs[0] === 'object' ? 
							(
								<FlatButton
									label={snowUI.menu[doc._id].docs[0].title}
									onClick={e => {
										e.preventDefault();
										this.props.goTo(snowUI.menu[doc._id].docs[0].slug);
									}}
									labelPosition="before"
									secondary={true}
									icon={<FontIcon className="material-icons" color={Styles.Colors.lightBlue600} hoverColor={Styles.Colors.lightBlue300} >chevron_right</FontIcon>}
								/>
							) 
							: <span /> 
						: <span />;
				} else {
					var prev = snowUI.menu[doc.parent._id] ?
						typeof snowUI.menu[doc.parent._id].docs[doc.order-2] === 'object' ?
							(
								<FlatButton
									label={snowUI.menu[doc.parent._id].docs[doc.order-2].title}
									onClick={e => {
										e.preventDefault();
										this.props.goTo(snowUI.menu[doc.parent._id].docs[doc.order-2].slug);
									}}
									secondary={true}
									icon={<FontIcon className="material-icons" color={Styles.Colors.lightBlue600} hoverColor={Styles.Colors.lightBlue300} >home</FontIcon>}
								/>
							) 
							:  snowUI.menu[doc.parent.parent] ?
								typeof snowUI.menu[doc.parent.parent].docs[doc.parent.order-1] === 'object' ?
									(
										<FlatButton
											label={snowUI.menu[doc.parent.parent].docs[doc.parent.order-1].title}
											onClick={e => {
												e.preventDefault();
												this.props.goTo(snowUI.menu[doc.parent.parent].docs[doc.parent.order-1].slug);
											}}
											secondary={true}
											icon={<FontIcon className="material-icons" color={Styles.Colors.lightBlue600} hoverColor={Styles.Colors.lightBlue300} >home</FontIcon>}
										/>
									
									) 
									: <span />
								: <span /> 
						: <span />;
					var next = snowUI.menu[doc.parent._id] ?
						typeof snowUI.menu[doc.parent._id].docs[doc.order] === 'object' ? 
							(
								<FlatButton
									label={snowUI.menu[doc.parent._id].docs[doc.order].title}
									onClick={e => {
										e.preventDefault();
										this.props.goTo(snowUI.menu[doc.parent._id].docs[doc.order].slug);
									}}
									labelPosition="before"
									icon={<FontIcon className="material-icons" color={Styles.Colors.lightBlue600} hoverColor={Styles.Colors.lightBlue300} >home</FontIcon>}
								/>
							) 
							: snowUI.menu[doc.parent.parent] ?
								typeof snowUI.menu[doc.parent.parent].docs[doc.parent.order] === 'object' ? 
									(
										<FlatButton
											label={snowUI.menu[doc.parent.parent].docs[doc.parent.order].title}
											onClick={e => {
												e.preventDefault();
												this.props.goTo(snowUI.menu[doc.parent.parent].docs[doc.parent.order].slug);
											}}
											labelPosition="before"
											
											icon={<FontIcon className="material-icons" color={Styles.Colors.lightBlue600} hoverColor={Styles.Colors.lightBlue300} >home</FontIcon>}
										/>
									) 
									: <span />
								: <span />
						: <span />;
				}
			}
			var related = []; 
			if(Object.prototype.toString.call(doc.links) !== '[object Array]')doc.links=[];
			if(doc.links.length > 0) {
				related = doc.links.map(function(v){
					return (<div className="related-bubble" key={v.slug + 'related'} ><a className="badge bg-primary" onClick={e => { e.preventDefault(); _this.props.goTo(v.slug);}}>{v.title}</a></div>);
				});
			}
			if(doc.externalLinks) {
				var ll = doc.externalLinks.replace(',',' ').split(' ');
				ll.forEach(function(v){
					related.push(<div className="related-bubble" key={v + 'linksE'}><a  className="badge bg-primary" target="_blank" href={v}>{v}</a></div>);
				});
			}
			if(related.length>0)related.unshift(<div className="related" key="related">Related</div>);
			
			var printMenu = function(pages) {
				//snowlog.log('print menu', pages);
				var list = pages.map(function(v) {
					return (
						<MenuItem primaryText={v.title} />
					);
				});
				return list;
			}
			
			return ( <div id="showconent"> 
				{display}
				<div className="clearfix ">
					{related}
				</div>
				<Toolbar style={{marginTop:25, background: Styles.Colors.blueGrey50}}>
					<ToolbarGroup firstChild={true} float="left">
						<IconButton onClick={(e)=>{e.preventDefault();this.props.goTo(snowUI.homepage);}} ><FontIcon className="material-icons" color={Styles.Colors.lightBlue600} hoverColor={Styles.Colors.lightBlue300} >home</FontIcon></IconButton>
					</ToolbarGroup>
					<ToolbarGroup float="left">
						{prev}
					</ToolbarGroup>
					
					<ToolbarGroup  lastChild={true} float="right">
						{next}
					</ToolbarGroup>
				</Toolbar>
			<div className="clearfix" style={{ height: 25 }} />
			</div>);
		} else {
			var menu;
			if(snowUI.tree>0) {
				menu = snowUI.tree.map(function(v) {
					
					return (<div className="" key={v.slug}>
							
							<a className="" >{v.title}</a>
							
							{v.documents.length > 0  ? <Menu list={v.documents} { ...this.props } />: ''}
						</div>
					);
					
				});
			}
			return ( <div id=""> 
				{menu}
			</div>);
		}
	},
	
	
	
};
