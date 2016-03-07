import React from 'react';
let yes = true;
let no = false;

export default class Home extends React.Component {
	constructor(props) {
		super(props);
		this.displayName = 'Home Component';	
		this.state = {
			ready: no,
			register: no,
			mounted: no,
			response:no,
			page: false,
			data:{},
		};
		
		this._update = false;
	}	
	componentWillReceiveProps(props) {
		snowlog.log('home got props', props)
		if(props.contents.slug || props.contents.ok || props.contents.length || props.config.allinone) {
			var page = this.state.page;
			if(props.page !== this.state.page) {
				this._update = true;
				page = props.page;
			}
			this.setState({ 
				ready: yes,
				page: page 
			});
		} else {
			this.setState({
				ready: no
			});
		}
	}
	componentDidMount() {
		// When the component is added let me know
		this.setState({
			mounted: yes
		});
		
	}
	
	componentDidUpdate() {
		this._update = false;	
	}
	render() {
		var _this = this;
		var printMenu = function(pages) {
			//snowlog.log('print menu', pages);
			var list = pages.map(function(v) {
				var onclick = (!_this.props.config.allinone) ?
					_this.props.getPage
				:
					function(e) {
						e.preventDefault();
						_this.props.goToAnchor(v.slug);
					
					}
				return (<div key={v.slug} className="link">
					<a onClick={onclick} href={snowUI.path.root + '/' + v.slug}>{v.title}</a>
					<div className="link">
						{v.documents.length > 0  ? printMenu(v.documents): ''}
					</div>
				</div>)
			});
			return list;
		}
		
		var doc = this.props.contents
		//console.log(this.state.ready,this.props.contents);
		if(this.state.ready && this.props.contents) {
			var doc = this.props.contents;
			var fullpage = [];
			if(doc.length > 1) {
				doc.forEach(function(v) {
					fullpage.push(displayDoc(v, true));
				});
			} else {
				fullpage.push(displayDoc(doc));
			}
			return (<div>
				{fullpage}
			</div>);
			
		} else {
			var menu;
			if(snowUI.tree>0) {
				menu = snowUI.tree.map(function(v) {
					
					return (<div className="" key={v.slug}>
							
							<a className="" onClick={_this.props.getPage} href={snowUI.path.root + '/' + v.slug}>{v.title}</a>
							
							{v.documents.length > 0  ? printMenu(v.documents): ''}
						</div>
					);
					
				});
			}
			return ( <div id=""> 
				<snowUI.UI.AppInfo  />
				{menu}
			</div>);
		} 
		
		function displayDoc( doc, allinone ) {
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
						var list = snowUI.menu[doc._id].docs;
						var display = printMenu(list)			
					}
					
				} else {
					/* show the contents then a list of child root documents */
					//snowlog.info('show content and child doc list',snowUI.menu,doc._id);
					var display = [];
					if(snowUI.menu[doc._id]) {
						var list = snowUI.menu[doc._id].docs;
						var display = printMenu(list)			
					}
					display.unshift(<div key="dualpage">{newcontent}</div>);
				}
				var prev;
				var next;
				if(snowUI.menu[doc._id]) {
					prev = snowUI.menu[doc.parent._id] ? 
						typeof snowUI.menu[doc.parent._id].docs[doc.order-2] === 'object' ? 
							(<li className="previous"><a href={snowUI.path.root + '/' + snowUI.menu[doc.parent._id].docs[doc.order-2].slug}  onClick={_this.props.getPage}  >&larr; {snowUI.menu[doc.parent._id].docs[doc.order-2].title}</a></li>) 
							: <span /> 
						: <span />;
					next = snowUI.menu[doc._id] ? 
						typeof snowUI.menu[doc._id].docs[0] === 'object' ? 
							(<li className="next"><a href={snowUI.path.root + '/' + snowUI.menu[doc._id].docs[0].slug}  onClick={_this.props.getPage}  >&rarr; {snowUI.menu[doc._id].docs[0].title}</a></li>) 
							: <span /> 
						: <span />;
				} else if(doc.parent) {
					prev = snowUI.menu[doc.parent._id] ?
						typeof snowUI.menu[doc.parent._id].docs[doc.order-2] === 'object' ?
							(<li className="previous"><a href={snowUI.path.root + '/' + snowUI.menu[doc.parent._id].docs[doc.order-2].slug}  onClick={_this.props.getPage}  >&larr; {snowUI.menu[doc.parent._id].docs[doc.order-2].title}</a></li>) 
							:  snowUI.menu[doc.parent.parent] ?
								typeof snowUI.menu[doc.parent.parent].docs[doc.parent.order-1] === 'object' ?
									(<li className="previous"><a href={snowUI.path.root + '/' + snowUI.menu[doc.parent.parent].docs[doc.parent.order-1].slug}  onClick={_this.props.getPage}  >&larr; {snowUI.menu[doc.parent.parent].docs[doc.parent.order-1].title}</a></li>) 
									: <span />
								: <span /> 
						: <span />;
					next = snowUI.menu[doc.parent._id] ?
						typeof snowUI.menu[doc.parent._id].docs[doc.order] === 'object' ? 
							(<li className="next"><a href={snowUI.path.root + '/' + snowUI.menu[doc.parent._id].docs[doc.order].slug}  onClick={_this.props.getPage}  >&rarr;  {snowUI.menu[doc.parent._id].docs[doc.order].title}</a></li>) 
							: snowUI.menu[doc.parent.parent] ?
								typeof snowUI.menu[doc.parent.parent].docs[doc.parent.order] === 'object' ? 
									(<li className="next"><a href={snowUI.path.root + '/' + snowUI.menu[doc.parent.parent].docs[doc.parent.order].slug}  onClick={_this.props.getPage}  >&rarr;  {snowUI.menu[doc.parent.parent].docs[doc.parent.order].title}</a></li>) 
									: <span />
								: <span />
						: <span />;
				}
			}
			var related = []; 
			if(Object.prototype.toString.call(doc.links) !== '[object Array]')
			{
				doc.links=[];
			}
			if(doc.links.length > 0) {
				related = doc.links.map(function(v){
					return (<div className="related-bubble" key={v.slug + 'related'} ><a className="badge bg-primary" onClick={_this.props.getPage} href={snowUI.path.root + '/' + v.slug}>{v.title}</a></div>);
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
			if(!allinone) {
				var navLinks = (<div className="clearfix linkPager">
					<nav className="">
						<ul className="pager">
							{prev}
							<li><a href={snowUI.path.root + '/'} onClick={_this.props.getPage}><span className="glyphicon glyphicon-home" /></a></li>
							{next}
							
						</ul>
					</nav>
				</div>)
			} else {
				var navlinks = <span />;
			}
			return (
				<div id="showconent" key={doc._id}> 
					<snowUI.UI.AppInfo  />
					{display}
					<div className="clearfix ">
						{related}
					</div>
					{navLinks}
				</div>
			);	
		}
	}
};
