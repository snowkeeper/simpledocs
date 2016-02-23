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
		let runTree = (slug,children) => {
			/* run through the kids and see if one of them is active so we can show the kid links */
			if(Object.prototype.toString.call( children ) === '[object Array]' ) {
				return children.reduce((runner, current) => {
					//snowlog.log(current.slug,slug);
					if(runner)return runner;
					if(current.slug === slug || (snowUI.menu[current.parent] && snowUI.menu[current.parent].slug === slug)) {
						debug(true,current.slug,slug);
						runner = true
						return runner;
					}
					return runTree(slug,current.documents); 
				},false); 
				
			} else {
				return false;
			}
		};
		let printMenu = (pages,skiptree) => {
			var list = pages.map(v => {
				var active = _this.props.page === v.slug ? 'active' : '';
				var rantree = active === 'active' && !snowUI.singleBranch 
					? true 
					: skiptree === undefined 
						? runTree(_this.props.page,v.documents) 
						: skiptree;
				var collapse = snowUI.collapse ? rantree === true || active === 'active' ? true : false : true;
				return (
					<ListItem 
						key={v.slug} 
						className="fixmenuleft"
						style={{fontSize:'12px', marginLeft:0}} 
						primaryText={v.title} 
						onClick={(e) => {
							e.preventDefault(e);
							this.props.goTo({
								page: v.slug,
								current: v
							});
						}}
						initiallyOpen={collapse}
						primaryTogglesNestedList={true}
						nestedItems={printMenu(v.documents, rantree)}
					/>
				);
			});
			return list;
		}
		let lookfor = snowUI.tree;
		if(this.props.list) {
			lookfor = this.props.list
		} 
		let menuList = lookfor.map(v => {
			var active = _this.props.page === v.slug ? 'active' : '';
			/* our first entry is the root document
			 * printMenu takes care of the children
			* */
			return (
				
				<ListItem
						key={v.slug} 
						primaryText={v.title}
						initiallyOpen={snowUI.collapse}
						primaryTogglesNestedList={false}
						onClick={(e) => {
							e.preventDefault(e);
							this.props.goTo({
								page: v.slug,
								current: v
							});
						}}
						nestedItems={printMenu(v.documents)}
				/>
			);
			
		});
		
        let LeftNavMenu = 	(
			<LeftNav 
				docked={false}
				open={this.props.leftNav}
				width={255}
				onRequestChange={open => {
					debug('request change', open, this.props);
					this.props.handleLeftNav({
						leftNav: open
					})
				}}
			>
				<List subheading={snowUI.name}>
					{menuList}
				</List>
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

