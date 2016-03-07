module.exports = React.createClass({
	getInitialState: function() {
		var now = new Date();
		return {mounted: false};
	},
	openEgg: function() {
		$('#easter-egg').slideToggle();
		$("#simpledocs").animate({ scrollTop: 0 }, 200);
		return false;
	},
	render: function() {
		var banner =	<div className="banner-inside" >
					<div id="name" className="col-xs-4 col-sm-4 col-md-3 col-lg-2">
						<div className="inside">{snowUI.name}</div>
					</div>
					<div id="title" className="col-xs-6 col-sm-4 col-md-9 col-lg-10">
						<div className="inside">{typeof this.props.page === 'object' && this.props.page.term ? 'search: ' + this.props.page.term : this.props.title}</div>
					</div>
					<div id="logo">
						<a onClick={this.openEgg} />
					</div>
				</div>;
			   
		return ( <div id="banner" > {banner} </div>);
	},
	componentDidMount: function() {
		// When the component is added, turn it into a modal
		this.setState({mounted: !this.state.mounted});
	}
});
	
