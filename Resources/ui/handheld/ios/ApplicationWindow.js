function ApplicationWindow() {

	var videoList = require('ui/common/youtubeVideolist');
	//var isAndroid = Ti.Platform.osname === 'android';

	var channelSetting = Ti.UI.createWindow({
		//title			: channelName,
		exitOnClose		: true,
		navBarHidden	: false,
		backgroundColor	: '#ffffff'		
	}); 
	
	var dialogRecent = Ti.UI.createAlertDialog({
		title: 'Open recent channel?',
		message: Ti.App.Properties.getString('ch'),
		buttonNames: ['OK', 'RESET']
	});
	
	var dialogNew = Ti.UI.createAlertDialog({
	    title: 'Enter Channel Name',
	    buttonNames: ['OK'],
	    style: Ti.UI.iPhone.AlertDialogStyle.PLAIN_TEXT_INPUT
	});

	function openChannel(arg){
		
		//create object instance
		var self = Ti.UI.createWindow({
			title			: arg,
			// exitOnClose		: true,
			navBarHidden	: false,
			backgroundColor	: '#ffffff'
		});
		
		Ti.API.info('channelName: '+arg);
		
		// Empty array "rowData" for our tableview
		var rowData = [];
		
		// Create our HTTP Client and name it "loader"
		var loader = Titanium.Network.createHTTPClient();
		
		// Sets the HTTP request method, and the URL to get data from
		loader.open("GET", "http://gdata.youtube.com/feeds/api/users/"+arg+"/playlists?v=2");
		
		// Runs the function when the data is ready for us to process
		loader.onload = function() {
			
			var doc = this.responseXML.documentElement;
			var items = doc.getElementsByTagName("entry");
							
			for (var i = 0; i < items.length; i++) {
				
				var item = items.item(i);
				var al_title = item.getElementsByTagName("title").item(0).textContent;
				var vid_count = item.getElementsByTagName("yt:countHint").item(0).textContent;
				var pl_list_id = item.getElementsByTagName("yt:playlistId").item(0).textContent;
				var op_title = al_title + " (" + vid_count + ")";
									
				var row = Titanium.UI.createTableViewRow({
					height 			: 'auto',
					titleText		: op_title,
					palaylist_id	: pl_list_id,
					color 			: '#000',
					font 			: 
					{
						fontSize	: '15dp',
						fontWeight	: 'bold',
						fontFamily	: 'Helvetica Neue'
					}
				});
		
				var label = Ti.UI.createLabel({
					text			: op_title,
					left			: '5dp',
					top				: '8dp',
					bottom			: '8dp',
					right			: '5dp',
					height			: Ti.UI.SIZE,
					color			: '#000',
					font 			: 
					{
						fontSize	: '14dp',
						fontWeight	: 'bold'
					}
				});						
				row.add(label);
		
				rowData[i] = row;
			}
	
			var tableView = Titanium.UI.createTableView({
				// top 			: 0,
				bottom			: '45dp',
				backgroundColor	: '#fff',
				data 			: rowData
			});
			
			plCount = doc.getElementsByTagName("entry").length;

			if (plCount == 0){
				var emptyResult	= [
					{title:'This channel has no playlists.', hasChild:false}
				];
				tableView.data 	= emptyResult;
				Ti.App.Properties.setString('cP', 'playlist');
			}else{
				Ti.App.Properties.setString('cP', 'playlist');
			}

			//Add the table view to the window
			self.add(tableView);

			//if (!isAndroid) {
				
				var flexSpace = Titanium.UI.createButton({
					systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
				});
		
				var btnBack = Titanium.UI.createButton({
					title	: arg,
					style	: Titanium.UI.iPhone.SystemButtonStyle.BORDERED
				});
		
				var navBar = Titanium.UI.iOS.createToolbar({
					items			: [flexSpace, btnBack, flexSpace],
					bottom 			: 0,
					borderTop		: true,
					borderColor		: '#e1e1e1',
					barColor		: '#efefef',
					translucent		: true
				});
				
				self.add(navBar);
		
				btnBack.addEventListener('click', function(e) {
					Ti.App.Properties.setString('cP', '');
					dialogRecent.message = Ti.App.Properties.getString('ch');
					self.close();
					dialogRecent.show();
				});
			//}

			tableView.addEventListener('click', function(e) {
				// Ti.App.Properties.setString('cP', 'playlist');
				if (plCount > 0){
					var window = videoList.youtubeVideolist(e.rowData.titleText, e.rowData.palaylist_id);
						window.open(window, {
							animated : true
						});
/*					
					if (!isAndroid) {
						window.open(window, {
							animated : true
						});
					} else {
						window.open();
					}
*/	
				}
			});
		};
		
		loader.onerror = function(e) {
			Ti.API.info(e.error);
			alert("Invalid channel name. Try again.");
			dialogNew.show();
			Ti.App.fireEvent('hide_indicator');
		};
		
		loader.timeout = 10000; // in milliseconds
		
		// Send the HTTP request
		loader.send();

		self.open();
	};

	if(Ti.App.Properties.getString('ch')){
		dialogRecent.show();
	} else {
		dialogNew.show();
	}

	dialogRecent.addEventListener('click', function(e){
		Ti.API.info('input text: '+e.text);
		
		if(e.index == 0){
			openChannel(Ti.App.Properties.getString('ch'));
		} else if (e.index == 1) {
			Ti.App.Properties.setString('ch', '');
			dialogNew.show();
		}
	});
	
	dialogNew.addEventListener('click', function(e){
		Ti.API.info('input text: '+e.text);
		
		Ti.App.Properties.setString('ch', e.text);
		openChannel(e.text);
	});
	
	Ti.App.addEventListener('resume', resumeWin);
	
	function resumeWin(){
		var curPage = Ti.App.Properties.getString('cP');
		Ti.API.info('cur page: '+curPage);
		if(curPage == null || curPage == ''){
			if(Ti.App.Properties.getString('ch')){
				dialogRecent.show();
			} else {
				dialogNew.show();
			}
		}
	}

	return channelSetting;
};

module.exports = ApplicationWindow;