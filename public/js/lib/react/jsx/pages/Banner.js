import React from 'react';
export default class Banner extends React.Component {
	constructor(props) {
		super(props);
		this.displayName = 'Banner Component';	
		this.state = {
			mounted: false
		};
	}
	openEgg() {
		$('#easter-egg').slideToggle();
		$("#simpledocs").animate({ scrollTop: 0 }, 200);
		return false;
	}
	render() {
		
		const xs = snowUI.breaks.bannerMenu[0] === 0 ? 'hidden-xs' : 'col-xs-' + snowUI.breaks.bannerMenu[0];
		const sm = snowUI.breaks.bannerMenu[1] === 0 ? 'hidden-sm' : 'col-sm-' + snowUI.breaks.bannerMenu[1];
		const md = snowUI.breaks.bannerMenu[2] === 0 ? 'hidden-md' : 'col-md-' + snowUI.breaks.bannerMenu[2];
		const lg = snowUI.breaks.bannerMenu[3] === 0 ? 'hidden-lg' : 'col-lg-' + snowUI.breaks.bannerMenu[3];
		const xsT = snowUI.breaks.bannerContent[0] === 0 ? 'hidden-xs' : 'col-xs-' + snowUI.breaks.bannerContent[0];
		const smT = snowUI.breaks.bannerContent[1] === 0 ? 'hidden-sm' : 'col-sm-' + snowUI.breaks.bannerContent[1];
		const mdT = snowUI.breaks.bannerContent[2] === 0 ? 'hidden-md' : 'col-md-' + snowUI.breaks.bannerContent[2];
		const lgT = snowUI.breaks.bannerContent[3] === 0 ? 'hidden-lg' : 'col-lg-' + snowUI.breaks.bannerContent[3];
		
		var banner = (<div className="banner-inside" >
			<div id="name" className={xs + " " + sm + " " + md + " " + lg + " "}>
				<div className="inside">{snowUI.name}</div>
			</div>
			<div id="title" className={xsT + " " + smT + " " + mdT + " " + lgT + " "}>
				<div className="inside">{typeof this.props.page === 'object' && this.props.page.term ? 'search: ' + this.props.page.term : this.props.title}</div>
			</div>
			<div id="logo">
				<a onClick={this.openEgg} />
			</div>
		</div>);
			   
		return ( <div id="banner" > {banner} </div>);
	}
	componentDidMount() {
		// When the component is added, turn it into a modal
		this.setState({
			mounted: !this.state.mounted
		});
	}
};
	
