// set up the routes
import Router from './router';
import React from 'react';
//React.initializeTouchEvents(true);
import Alert from './pages/Alert';
import messageDisplay from './pages/messageDisplay';
import Content from './pages/Content';
import home from './pages/home';
import Menu from './pages/Menu';
import Banner from './pages/Banner';
import UI from './pages/UI';
import AppInfo from './pages/AppInfo';

snowUI.UI = {
	Alert,
	messageDisplay,
	Content,
	home,
	Menu,
	Banner,
	UI,
	AppInfo
} 

//connect error component
snowUI.UI.displayMessage = snowUI.UI.messageDisplay;

Router();
