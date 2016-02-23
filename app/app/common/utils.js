import ProgressButton from 'react-progress-button';
import React from 'react';
import { Cell } from 'fixed-data-table';
import { Styles, Checkbox } from 'material-ui/lib';
import { FontIcon, IconButton } from 'material-ui/lib';
import moment from 'moment';
import hat from 'hat';

import debugging from 'debug';
let	debug = debugging('epg:app:common:utils');

export const Button = ProgressButton;

export class iButton extends React.Component {
	constructor(props){
		super(props);
	}
	render() {
		debug('render iconButton');
		return <IconButton onClick={this.props.clickOn} ><FontIcon { ...this.props } >{this.props.dataIcon}</FontIcon></IconButton>;
	}
}

export const clickButton = function(onClick, opts) {
	return <FontIcon  onClick={onClick} { ...opts } >{opts.dataIcon}</FontIcon>;
}

export const pickIcon = function pickIcon(text) {
	if(text.toLowerCase() === 'cable') {
		return 'tv';
	} else if(text.toLowerCase() === 'satellite') {
		return 'satellite';
	} else if(text.toLowerCase() === 'antenna') {
		return 'settings_input_antenna';
	} else  {
		return 'tv';
	} 
}

export const setChannelKey = function(v) {
	if(!v || typeof v !== 'object') {
		return 'undefined';
	}
	if(v.atscMajor) {
		return v.atscMajor + '-' + v.atscMinor;
	} 
	if(v.channel) {
		return v.channel;
	}
	if(v.frequencyHz && v.serviceID) {
		return v.serviceID;
	}
	if(v.uhfVhf) {
		return v.uhfVhf;
	}
	
	debug('no channel', v)
	return false;
}


export const DateCell = ({rowIndex, data, col, ...props}) => {
	let val = data[rowIndex][col];
	return (<Cell {...props}>
		{val}
	</Cell>);
}
export const ImageCell = ({rowIndex, data, col, backgroundColor = 'white', ...props}) => {
	let val = data[rowIndex][col];
	let logo = <div style={{backgroundColor: backgroundColor,width:'100%',height:'100%'}}><FontIcon className="material-icons" color={Styles.Colors.lightBlue600} hoverColor={Styles.Colors.greenA200} >tv</FontIcon></div>;
	if(val) {
		logo = <div style={{backgroundColor: backgroundColor,width:'100%',height:'100%',backgroundSize:'contain',backgroundImage:'url('+val.URL+')',backgroundRepeat:'no-repeat',backgroundPosition:'center'}} />
	}
	return (logo);
};

export const LinkCell = ({rowIndex, data, col, ...props}) => {
	let val = data[rowIndex][col];
	return (<Cell {...props}>
		<a href="#">{val}</a>
	</Cell>);
}
export const TextCell = ({rowIndex, data, col, ...props}) => {
			
	let val;

	if(col === 'hd') {
		let search = data[rowIndex].name ? data[rowIndex].name : data[rowIndex].callsign ? data[rowIndex].callsign : 'sd';
		val = search.toLowerCase().search('hd') > -1  ? 'HD': search.toLowerCase().search('dt') > -1  ? 'HD' :'SD';
	} else {
		val = data[rowIndex][col];
	}
				
	return (<Cell {...props}>
		{val}
	</Cell>);
}

export const isTimeInGuideData = (station, time, splits, zero) => {
	let first = (zero === 0);
	let ret = [];
	
	if(station[time]) {
		// add an exact match
		ret.push(station[time]);
	
	} else if(first) {
		// this is the first item and it does not begin at the start of our guide
		let keys = Object.keys(station);
		keys.push(time);
		let findBefore = keys.sort().indexOf(time) - 1;
		
		const found = station[keys[findBefore]];
		//debug('first item not exact', keys, findBefore, found);
		if( found === Object(found) ) {
			ret.push(found);
		}
	}
	
	let _b = time;
	let _e = moment(time).add(splits, 'minutes').valueOf();
	
	for(let day in station) {
		if(day < _e && day >= _b ) {
			ret.push(station[day]);
		}
	}	
	
	return ret;
}

export const GenreColors = {
	'action': 'rgba(41,61,107,.65)',
	'adventure': 'rgba(31,57,42,.65)',
	'drama': 'rgba(68,25,85,.65)',
	'sports': 'rgba(226,112,28,.65)',
	'news': 'rgba(113,93,85,.65)',
	'comedy': 'rgba(43,69,71,.60)',
	'horror': 'rgba(140,69,114,.65)',
	'educational': 'rgba(22,213,71,.65)',
	'children': 'rgba(120,123,193,.65)',
	'animated': 'rgba(87,73,140,.65)',
	'science': 'rgba(171,159,108,.65)',
	'fantasy': 'rgba(190,216,117,.65)',
	'game show': 'rgba(40,14,52,.65)',
	'animals': 'rgba(35,102,56,.65)',
	'special': 'rgba(194,125,227,.65)',
	'travel': 'rgba(40,144,166,.65)',
	'sitcom': 'rgba(30,12,49,.65)',
	'mystery': 'rgba(129,169,139,.65)',
	'crime drama': 'rgba(56,146,166,.65)',
	'default': {
		title: {
			color: Styles.Colors.amber800, //'#F4AA30',
		},
		time: {
			color: Styles.Colors.blueGrey200,
			fontSize:'11px'
		},
		description: {
			color:'#FBDCB4',
			fontSize:'11px'
		},
		main: {	
			backgroundColor: 'inherit'
		},
		class: ''//'tartan'
			
	}
}

export const selectGenreColor = (current, genre) => {
	genre = genre.toLowerCase();
	let keys = Object.keys(GenreColors);
	let index = keys.indexOf(genre);
	if(GenreColors[keys[index]]) {
		
		let style = GenreColors[keys[index]];
		if(style === Object(style)) {
			current.title = Object.assign(current.title, style.title || {});
			current.description = Object.assign(current.description, style.description || {});
			current.time = Object.assign(current.time, style.time || {});
			current.main = Object.assign(current.main, style.main || {});
		} else {
			style = GenreColors['default'];
			current.title = Object.assign(current.title, style.title || {});
			current.description = Object.assign(current.description, style.description || {});
			current.time = Object.assign(current.time, style.time || {});
			current.main = Object.assign(current.main, style.main || {});
			current.main.backgroundColor = GenreColors[keys[index]];
		}
		return Object.assign({}, current);
		
	} else {
		return GenreColors.default;
	}
	
}

export const ProgramCell = ({rowIndex, data, guide, time, zero, splits, click, ...props}) => {
	let val = data[rowIndex].stationID;
	let text;
	let styleD = {
		title: {
			color: '#F4AA30',
		},
		time: {
			color: Styles.Colors.blueGrey200,
			fontSize:'11px'
		},
		description: {
			color:'#FBDCB4',
			fontSize:'11px'
		},
		main: {	
			marginLeft: 0,
			width: props.width,
			position: 'fixed',
			zIndex: 20,
			display: 'block'
		},
		class: ''//'tartan'
	};
	let final = [];
	//debug('val',val, data[rowIndex]);
	let programs = !guide[val] ? [] : isTimeInGuideData(guide[val], time, splits, zero);
	
	for(let i=0; i<programs.length; i++) {
		
		let info = programs[i];
		
		let style = Object.assign({}, styleD);
		
		if(Array.isArray(info.genres)) {
			info.genres.forEach((genre) => {
				let newstyle = selectGenreColor(style, genre);
				style[genre] = newstyle;
			});
		}
		
		if(!Array.isArray(info.titles)) {
			final.push(<Cell key={hat()} width={style.main.width} className="epg__timeSlot tartan" style={style.main}>
			</Cell>);
			
		} else {
		
			let airTime = moment(info.airDateTime);		
			
			
			style.main.width = info.duration / 12;
			if(zero === 0 && time > airTime.valueOf()) {
				let t1 = (time - airTime.valueOf()) / 1000;
				let t2 = info.duration - t1;
				style.main.width = t2 / 12;
				debug(info.name,(time - airTime.valueOf()) / 1000, info.duration, t2, t2/12, 'width', style.main.width);
			} else if(airTime.valueOf() > time) {
				// 12 is a number that Maths correlates to 150px per splits(30)
				style.main.marginLeft = (airTime.valueOf() - time) / 1000 / 12;
			}
			let description;
			if(info.descriptions === Object(info.descriptions)) {
				description = info.descriptions;
			} else {
				description = {};
			}
			
			let dd = <span style={style.time}>{airTime.format('LT')} till {airTime.add(info.duration, 'seconds').format('LT')}</span>;
			
			text = (<div> 
				<span style={style.title}>{Array.isArray(info.titles) ? info.titles[0].title120 : 'no title'} </span><br />
				{dd} <br />
				<span style={style.description}>{description.short}</span>
			</div>);
			
			let clickMe = () => {
				click(info);
			}
			
			final.push(<Cell onClick={clickMe} width={style.main.width}  key={i+'-'+val+'-'+airTime.valueOf()+'-'+info.programID} className={"epg__timeSlot click " + style.class} style={style.main}>
				{text}
			</Cell>);
		}
	} 	
	if(!guide[val]) {
		final.push(<Cell key={hat()} width={styleD.main.width} className="epg__timeSlot tartan" style={styleD.main}>
			{text}
		</Cell>);
	}
	const sendBack = (<div>{final}</div>);
	return sendBack;
}

export const ChannelCell = ({rowIndex, data, col, backgroundColor = 'white', click,  ...props}) => {
	let val = data[rowIndex][col];
	let logo = <div style={{backgroundColor: backgroundColor,width:'100%',height:'100%'}}><FontIcon className="material-icons" color={Styles.Colors.amber600} hoverColor={Styles.Colors.red200} >tv</FontIcon></div>;
	if(val) {
		logo = (<div onClick={click} className="logo " style={{backgroundImage:'url('+val.URL+')'}} />);
	}
	return (<div className="epg__channelSlot logo" style={{width:'100%',height:'100%'}} >
			{logo}
			<div className="text" >
				{data[rowIndex].channel}
			</div>
		</div>);
};

export const ChannelCheckbox = ({rowIndex, data, col, ...props}) => {
	// for channels only		
	let val = !!data[rowIndex][col];
				
	return (<Cell {...props} style={{textAlign:'center'}} >
		<Checkbox
			name={col+rowIndex}
			value={""+val}
			defaultChecked={val}
			checkedIcon={<FontIcon className="material-icons" color={Styles.Colors.green400} >visibility</FontIcon>}
			unCheckedIcon={<FontIcon className="material-icons" color={Styles.Colors.grey300}  >visibility</FontIcon>}
			onCheck={(e) => {
				debug('update ', props.source, data[rowIndex]);
				// we cheat here and mutate the state object...
				// our update listener should fix the state quickly
				data[rowIndex][col] = !val;
				props.sockets['update' + props.source](data[rowIndex], { [col]: !val });
			}}
		/>
	</Cell>);
}
