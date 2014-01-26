function ApplicationWindow() {

	var videoList = require('ui/common/youtubeVideolist');
	
	var isAndroid = Ti.Platform.osname === 'android';
	
	var channelName = "SamsungMobile"; //apple

	//create object instance
	var self = Ti.UI.createWindow({
		title			: channelName,
		exitOnClose		: true,
		navBarHidden	: false,
		backgroundColor	: '#ffffff'
	});
	
	// Empty array "rowData" for our tableview
	var rowData = [];
	
	// Create our HTTP Client and name it "loader"
	var loader = Titanium.Network.createHTTPClient();
	
	// Sets the HTTP request method, and the URL to get data from
	loader.open("GET", "http://gdata.youtube.com/feeds/api/users/"+channelName+"/playlists?v=2");
	
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
			top 			: 0,
			backgroundColor	: '#fff',
			data 			: rowData
		});

		//Add the table view to the window
		self.add(tableView);
	
		tableView.addEventListener('click', function(e) {
			
			var window = videoList.youtubeVideolist(e.rowData.titleText, e.rowData.palaylist_id);
			
			if (!isAndroid) {
				window.open(window, {
					animated : true
				});
			} else {
				window.open();
			}
		});
	};
	
	loader.onerror = function(e) {
		Ti.API.debug(e.error);
		alert("Unable to connect to server");
		Ti.App.fireEvent('hide_indicator');
	};
	
	loader.timeout = 10000;
	/* in milliseconds */
	
	// Send the HTTP request
	loader.send();

	return self;
};

module.exports = ApplicationWindow;