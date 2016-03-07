import React from 'react';
import Debug from 'debug'
import { LeftNav, List, FontIcon, Styles, ListItem } from 'material-ui/lib';

let debug = Debug('simpledocs:app:common:components:menu');
		
export default class Menu extends React.Component {
	constructor(props) {
		super(props)
		this.displayName = 'Menu Component'	
		this.state = {};
	}
	render() {
		debug('menu render', this.props);
		const _this = this;
		const _pre = Math.random() + '__';
		let runTree = (slug, children) => {
			/* run through the kids and see if one of them is active so we can show the kid links */
			if(Object.prototype.toString.call( children ) === '[object Array]' ) {
				return children.reduce((runner, current) => {
					snowlog.log(current.slug, slug);
					if(runner) {
						return runner;
					}
					if(current.slug === slug || (snowUI.menu[current.parent] && snowUI.menu[current.parent].slug === slug)) {
						debug(true,current.slug,slug);
						runner = true;
						return runner;
					}
					return runTree(slug, current.documents); 
				},false); 
				
			} else {
				return false;
			}
		};
		let printMenu = (pages, skiptree, index) => {
			var list = pages.map(v => {
				let active = _this.props.page === v.slug ? 'active' : '';
				let rantree = active === 'active' && !snowUI.singleBranch 
					? true 
					: skiptree === undefined 
						? runTree(_this.props.page, v.documents) 
						: skiptree;
				let collapse = snowUI.collapse ? index ? true : rantree === true || active === 'active' ? true : false : true;
				
				let onclick;
				if(_this.props.allinone) {
					onclick = (e) => {
						e.preventDefault();
						this.props.goToAnchor(v.slug, v);
					};
				} else {
					onclick = (e) => {
						e.preventDefault(e);
						this.props.goTo({
							page: v.slug,
							current: v
						});
					}
				}
				let innerDiv;
				if(v.documents.length <= 0) {
					innerDiv = {fontSize:'12px',  paddingTop: 7, paddingBottom: 4}
				} else {
					innerDiv = {fontSize:'12px',  paddingTop: 7, paddingBottom: 4}
				}
				return (
					<ListItem 
						key={_pre + v.slug + Math.random()} 
						className="fixmenuleft"
						innerDivStyle={innerDiv} 
						primaryText={v.menuTitle || v.title} 
						onClick={onclick}
						initiallyOpen={this.props.childopen}
						primaryTogglesNestedList={false}
						nestedItems={printMenu(v.documents, rantree, false)}
					/>
				);
			});
			if(index) {
				let allinone = !snowUI.allinone || this.props.allinone   ?
					<span />
				:
					<ListItem
						key={_pre + 'allinone' + Math.random()} 
						primaryText="single page"
						innerDivStyle={{fontSize:'12px', paddingTop: 7, paddingBottom: 4}} 
						onClick={(e) => {
							e.preventDefault();
							_this.props.allInOne();
						}}
					/>
				list.unshift(allinone);
			}
			return list;
		}
		let lookfor = snowUI.tree;
		if(this.props.list) {
			lookfor = this.props.list
		} 
		let menuList = lookfor.map(v => {
			let active = _this.props.page === v.slug ? 'active' : '';
			/* our first entry is the root document
			 * printMenu takes care of the children
			* */
			return (
				
				<ListItem
						key={_pre + v.slug + Math.random()} 
						primaryText={v.menuTitle || v.title}
						initiallyOpen={this.props.open}
						primaryTogglesNestedList={false}
						onClick={(e) => {
							e.preventDefault(e);
							this.props.goTo({
								page: v.slug,
								current: {
									title: v.title,
									menuTitle: v.menuTitle || v.title,
									id: v._id,
									slug: v.slug
								}
							});
						}}
						nestedItems={printMenu(v.documents, false, (v.documents.length > 0))}
				/>
			);
			
		});
		debug('menu list', menuList);
        let LeftNavMenu = 	(
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
					<List subheading={snowUI.name}>
						{menuList}
					</List>
				</div>
			</LeftNav>
		);
		
		if(this.props.docked) {
			return (LeftNavMenu);
		} else {
			return (
				<List subheading={snowUI.name}>
					{menuList}
				</List>
			);
		} 	
	}
}

Menu.defaultProps = {
    open: false,
    childopen: false
};
