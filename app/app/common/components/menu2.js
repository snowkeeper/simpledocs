import React from 'react';
import Debug from 'debug'
import { LeftNav } from 'material-ui/lib';

let debug = Debug('simpledocs:app:common:components:menu');
		
export default class Menu extends React.Component {
	constructor(props) {
		super(props)
		this.displayName = 'Menu Component'	
		this.state = {
			page: props.page,
			leftNav: props.leftNav
		};
		this._update = true;
	}
	componentWillReceiveProps(props) {
		debug("menu2 props", props);
		if(props.leftNav !== this.state.leftNav || props.update || this.state.page !== props.page) {
			this._update = true;
			this.setState({
				page: props.page,
				leftNav: props.leftNav
			});
			return;
		}
		if(props.allinone) {
			debug('allinone updatre menu');
			this._update = true;
		}
	}
	shouldComponentUpdate() {
		debug('should update? ', this._update);
		if(this._update) {
			this._update = false;
			return true;
		}
		return false;
	}
	render() {
		debug('simple menu render', this.props);
		const _this = this;
		debug('simple menu tree', snowUI.tree);
		
		let page = this.props.anchor || this.props.page;
		
		let runTree = (slug, children) => {
			/* run through the kids and see if one of them is active so we can show the kid links */
			if(Object.prototype.toString.call( children ) === '[object Array]' ) {
				return children.reduce(function(runner, current) {
					//snowlog.log(current.slug,slug);
					if(runner)return runner;
					if(current.slug === slug || (snowUI.menu[current.parent] && snowUI.menu[current.parent].slug === slug)) {
						debug(true, current.slug, slug);
						runner = true
						return runner;
					}
					return runTree(slug, current.documents); 
				},false); 
				
			} else {
				return false;
			}
		};
		let printMenu = (pages, skiptree) => {
			let list = pages.map((v) => {
				let active = page === v.slug ? 'active' : '';
				let rantree = active === 'active' && !snowUI.singleBranch 
					? true 
					: skiptree === undefined 
						? runTree(page, v.documents) 
						: skiptree;
				//snowlog.log(v.slug,rantree,skiptree);
				let collapse = snowUI.collapse ? rantree === true || active === 'active' ? ' ': ' hidden' : ' ';
				//debug('should menu list be open', snowUI.collapse, rantree, active, snowUI.singleBranch, v.slug);
				let onclick;
				let linkto;
				if(_this.props.allinone) {
					onclick = (e) => {
						e.preventDefault();
						this.props.goToAnchor(v.slug, v);
					};
					linkto = <a 
						className={"list-group-item " + active}
						onClick={onclick} 
						href={"#" + v.slug}
					>{v.menuTitle || v.title}</a>;
				} else {
					onclick = (e) => {
						e.preventDefault(e);
						this.props.goTo({
							page: v.slug,
							current: v
						});
					}
					linkto = <a className={"list-group-item " + active} onClick={onclick} href={snowUI.path.root + '/' + v.slug}>{v.menuTitle || v.title}</a>;
				}
				return (<div key={v.slug} className="">
						{linkto}
						<div className={"link " + collapse}>
							{printMenu(v.documents)}
						</div>
					</div>)
			});
			return list;
		}
		
		let menu = snowUI.tree.map((v) => {
			let active = page === v.slug ? 'active' : '';
			/* our first entry is the root document
			 * printMenu takes care of the children
			* */
			let onclick;
			let linkto;
			let allinone = !snowUI.allinone || v.documents.length < 1 ?
				<span />
			:
				(_this.props.allinone) ?
					<a className={"list-group-item " + active} onClick={(e) => {
						e.preventDefault(e);
						this.props.goTo({
							page: page,
							current: v
						});
					}} 
					href={snowUI.path.root + '/' + v.slug} >{snowUI.text['multi page']}</a>
				:
					<a className="list-group-item" href="" onClick={(e) => {
						e.preventDefault();
						this.props.allInOne(v.slug);
					}} >{snowUI.text['single page']}</a>
			
			if(_this.props.allinone) {
				linkto = <a className={"list-group-item " + active} onClick={(e) => {
							e.preventDefault();
							this.props.goToAnchor(v.slug);
						}} 
					href={"#" + v.slug}>{v.menuTitle || v.title}</a>;
			} else {
				onclick = (e) => {
						e.preventDefault(e);
						this.props.goTo({
							page: v.slug,
							current: v
						});
					}
				linkto = <a className={"list-group-item " + active} onClick={onclick} href={snowUI.path.root + '/' + v.slug}>{v.menuTitle || v.title}</a>;
			}
			let search;
			if(snowUI.search) {
				search = (<span>
					<div className="search-slider">
						<input className="form-control" placeholder="Search" title="Press Enter to submit search" />
					</div>
					<div key={v.slug} style={{position:'relative'}}>
						{linkto}
						<span className="glyphicon glyphicon-search searchToggle"  onClick={this.props.searchToggle} />
					</div>
				</span>);
			} else {
				search = (<span>
					<div key={v.slug} style={{position:'relative'}}>
						{linkto}
					</div>
				</span>);
			}
			return (<div className="list-group" key={v.slug}>
					{search}
					<div style={{position:'relative'}}>
						{allinone}
					</div>
					{printMenu(v.documents)}
				</div>
			);
			
		});
		debug('menu list', menu);
        let LeftNavMenu = (
			<LeftNav 
				docked={false}
				desktop={true}
				open={this.props.leftNav}
				width={255}
				onRequestChange={open => {
					debug('request change', open, this.props);
					this.props.handleLeftNav({
						leftNav: open
					})
				}}
			>
				<div className="menu" style={{
					height: '100%',
					width: '100%',
					overflow: 'auto',
				}} >
					{menu}
				</div>
			</LeftNav>
		);
		
		if(this.props.docked) {
			return (LeftNavMenu);
		} else {
			return (<div>{menu}</div>);
		} 	
	}
}

