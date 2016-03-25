import React from 'react';
import Debug from 'debug'
import Gab from '../common/gab'
import { DropDownMenu, MenuItem, ToolbarGroup, Toolbar, ToolbarSeparator, Divider, CardText, CardMedia, CardHeader, CardActions, Card, CardTitle, Styles, List, IconButton, ListItem, FlatButton, FontIcon } from 'material-ui/lib';
import Menu from '../common/components/menu';

let debug = Debug('simpledocs:app:pages:home');
		
export default class Home extends React.Component {
	constructor(props) {
		super(props);
		this.displayName = 'Home Component';	
		this.state = {
			ready: true,
			page: props.page,
			contents: props.contents
		};
		
		debug('home start props', props);
		this._update = false;
		this._updating = true;
	}
	
	componentWillReceiveProps(props) {
		
		if(props.page !== this.state.page || (props.forceGrab && !this._updating)) {
			debug('home got page', props, this._updating)
			if(props.page === snowUI.singlePage) {
				Gab.request(props.page, props.anchor);
			} else if(!snowUI.usesockets) {
				Gab.request(props.page, props.search);
			} else {
				props.sockets.page(props.page, props.search);
			}
			this._updating = true;
			snowUI.page = props.page;
			this.setState({
				page: props.page,
				contents: false
			});
			
			return true;
		}
		if(props.contents && this._updating) {
			debug('home got contents',props)
			this.setState({
				contents: props.contents
			}, function() {
				
			});
			this._update = true;
			this._updating = false;
			return true;
		}
		if(props.forceUpdate) {
			this._update = true;
		}
	}
	
	shouldComponentUpdate() {
		debug('should update? ', this._update);
		var ret = this._update ? this._update : this._update; // !this.props.allinone;
		return ret;
	}
	
	componentDidUpdate() {
		debug('didUpdate', this._update);
		if(this._update) {
			var simple = document.getElementById("simpledocs");
			simple.scrollTop = 0;
			this._update = false;
			snowUI.fadeIn();
		}
	}
	
	componentDidMount() {
		debug('did mount');
		if(this.props.page === snowUI.singlePage) {
			Gab.request(this.props.page, this.props.anchor);
		} else if( !snowUI.usesockets) {
			Gab.request(this.props.page, this.props.search);
		} else if(this.props.page) {
			this.props.sockets.page(this.props.page, this.props.search);
		}
	}
	
	componentWillUnmount() {
		snowUI.code.__unmountUI();
	}
	
	render() {
		debug('home render', this.state, this.props);
		let content = [];
		let _this = this;
		if(Array.isArray( this.state.contents ) ) { 
			this.props.contents.forEach(function(v) {
				content.push(Home.UI.render.call(_this, v, true));
			});
		} else if(this.state.contents) {
			content.push(Home.UI.render.call(this, this.props.contents));
		} else {
			content.push(<div style={{textAlign:'center',width:'100%'}}><FontIcon style={{fontSize:'128px'}} className="material-icons" color={Styles.Colors.blueGrey100} >file_download</FontIcon></div>);
		}
		return (<div className="col-xs-12" >
			<Card style={{minHeight: snowUI.contentHeight}} >
				<CardText>
					
						{content}
					
				</CardText>
			</Card>
		</div>);
	}
}

/* page display renderer */
Home.UI = {
	render: function( doc, allinone ) {
		var _this = this;
		var printMenu = <Menu { ..._this.props } />;
		
		//console.log(this.state.ready,this.props.contents);
		if(this.state.ready && doc) {
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
				//debug('display page data', doc)
				var search = false;
				if(typeof doc !== 'object')doc = {}
				if(typeof doc.parent !== 'object')doc.parent = {}
				var content = 
					doc.display === 1 ? 
						doc.markdown ? 
							(<div key="fullcontent"><div dangerouslySetInnerHTML={{__html: doc.markdown.html}} /> </div>)
							: <span /> 
						: doc.display === 2 ? 
							(<div key="fullcontent" ><div dangerouslySetInnerHTML={{__html: doc.html}} /> </div>)
							: doc.display === 3 ? 
								(<div key="fullcontent"> <div key="fullcontentB"  dangerouslySetInnerHTML={{__html: doc.markdown.html}} /><div  key="fullcontentA"  dangerouslySetInnerHTML={{__html: doc.html}} /></div>) 
								: doc.display === 4 ? 
									(<div key="fullcontent"> <div key="fullcontentA"  dangerouslySetInnerHTML={{__html: doc.html}} /><div  key="fullcontentB"  dangerouslySetInnerHTML={{__html: doc.markdown.html}} /></div>)
									: <span />  
				
				var newcontent = [];
				newcontent.push(<input type="hidden" value={doc.slug} className="hiddenTitle" />)
				newcontent.push(content);
				
				if(doc.type === 1) {
					/* show the content only */
					var display = newcontent;
					
				} else if(doc.type === 2) {
					/* show list of child root documents */
					if(snowUI.menu[doc._id]) {
						var list = doc;
						list.documents = snowUI.menu[doc._id].docs;
						var display = <Menu list={[list]} { ...this.props } open={!this.props.allinone} childopen={!this.props.allinone} />;			
					}
				} else {
					/* show the contents then a list of child root documents */
					//snowlog.info('show content and child doc list',snowUI.menu,doc._id);
					var display = [];
					if(snowUI.menu[doc._id]) {
						var list = doc;
						list.documents = snowUI.menu[doc._id].docs;
						display.push(<Menu list={[list]} { ...this.props } key="displayMenu" open={!this.props.allinone} childopen={!this.props.allinone}  />);			
					}
					display.unshift(<div key="dualpage">{newcontent}</div>);
				}
				var prev;
				var next;
				var makePageNavButton = (page, current, prev, text) => {
					return (<FlatButton
						label={text || ''}//{snowUI.menu[doc.parent.parent].docs[doc.parent.order].title}
						onClick={e => {
							e.preventDefault();
							this.props.goTo({
								page,
								current
							});
						}}
						labelPosition={prev ? "after" : "before"}
						icon={<FontIcon className="material-icons" color={Styles.Colors.lightBlue600} hoverColor={Styles.Colors.lightBlue300} >{prev ? 'chevron_left' : 'chevron_right'}</FontIcon>}
					/>);
				}
				/* navigation butoons for bottom */
				if(snowUI.menu[doc._id]) {
					prev = snowUI.menu[doc.parent._id] ? 
						typeof snowUI.menu[doc.parent._id].docs[doc.order-2] === 'object' ? 
							makePageNavButton(snowUI.menu[doc.parent._id].docs[doc.order-2].slug, snowUI.menu[doc.parent._id].docs[doc.order-2], true, 'prev')
							: <span /> 
						: <span />;
					next = snowUI.menu[doc._id] ? 
						typeof snowUI.menu[doc._id].docs[0] === 'object' ? 
							makePageNavButton(snowUI.menu[doc._id].docs[0].slug, snowUI.menu[doc._id].docs[0], false, 'next') 
							: <span /> 
						: <span />;
				} else if(doc.parent) {
					prev = snowUI.menu[doc.parent._id] ?
						typeof snowUI.menu[doc.parent._id].docs[doc.order-2] === 'object' ?
							makePageNavButton(snowUI.menu[doc.parent._id].docs[doc.order-2].slug, snowUI.menu[doc.parent._id].docs[doc.order-2], true, 'prev')
							:  snowUI.menu[doc.parent.parent] ?
								typeof snowUI.menu[doc.parent.parent].docs[doc.parent.order-1] === 'object' ?
									makePageNavButton(snowUI.menu[doc.parent.parent].docs[doc.parent.order-1].slug, snowUI.menu[doc.parent.parent].docs[doc.parent.order-1], true, 'prev')
									: <span />
								: <span /> 
						: <span />;
					next = snowUI.menu[doc.parent._id] ?
						typeof snowUI.menu[doc.parent._id].docs[doc.order] === 'object' ? 
							makePageNavButton(snowUI.menu[doc.parent._id].docs[doc.order].slug, snowUI.menu[doc.parent._id].docs[doc.order], false, 'next')
							: snowUI.menu[doc.parent.parent] ?
								typeof snowUI.menu[doc.parent.parent].docs[doc.parent.order] === 'object' ? 
									makePageNavButton(snowUI.menu[doc.parent.parent].docs[doc.parent.order].slug, snowUI.menu[doc.parent.parent].docs[doc.parent.order], false, 'next')
									: <span />
								: <span />
						: <span />;
				}
			}
			
			var related = []; 
			if(Object.prototype.toString.call(doc.links) !== '[object Array]') {
				doc.links=[];
			}
			
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
			
			if(related.length>0) {
				related.unshift(<div className="related" key="related">Related</div>);
			}
			
			let nav = this.props.allinone ? <span /> : (
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
			);
			
			return ( <div id="showconent" key={doc.slug + Math.random()}> 
				{display}
				<div className="clearfix ">
					{related}
				</div>
				{nav}
				<div className="clearfix" style={{ height: 25 }} />
			</div>);
		} else {
			var menu = <span />;
			if(snowUI.tree > 0) {
				menu = <Menu { ...this.props } />;
			}
			return ( <div id="" key={Math.random()}> 
				{menu}
			</div>);
		}
	},	
};
