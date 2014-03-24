function ApplicationWindow() {
	
	var videoList = require('ui/common/youtubeVideolist');
	var isAndroid = Ti.Platform.osname === 'android';

	var channelSetting = Ti.UI.createWindow({
		//title			: channelName,
		exitOnClose		: true,
		navBarHidden	: false,
		backgroundColor	: '#ffffff'		
	}); 
	
	var textField = Ti.UI.createTextField({
		hintText: 'Enter Channel Name',
		value: Ti.App.Properties.getString('ch'),
		autocorrect : false,
		focusable: true,
		//clearOnEdit: true,
		softKeyboardOnFocus: Titanium.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS,
		borderStyle: Titanium.UI.INPUT_BORDERSTYLE_LINE,
		backgroundFocusedColor: '#fefefe',
		borderColor: '#96BCFC',
		borderWidth: 1,
		color: '#878787',
		top: '87dp',
		width: 250,
		height: 60,
		layout:'vertical'
	});
	textField.focus();

	var button = Titanium.UI.createButton({
	   title: 'View Playlist',
	   color: '#878787',
	   borderColor: '#ccc',
	   backgroundColor: '#efefef',
	   backgroundSelectedColor: '#e8e8e8', 
	   top: '227dp',
	   width: 125,
	   height: 60,
	   layout:'vertical'
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
				//bottom			: '45dp',
				backgroundColor	: '#fff',
				data 			: rowData
			});
			
			plCount = doc.getElementsByTagName("entry").length;

			if (plCount == 0){
				var emptyResult	= [
					{title:'This channel has no playlists.', hasChild:false}
				];
				tableView.data 	= emptyResult;
			}

			//Add the table view to the window
			self.add(tableView);

			tableView.addEventListener('click', function(e) {
				if (plCount > 0){
					var window = videoList.youtubeVideolist(e.rowData.titleText, e.rowData.palaylist_id);
					if (!isAndroid) {
						window.open(window, {
							animated : true
						});
					} else {
						window.open();
					}
				}
			});
		};
		
		loader.onerror = function(e) {

			Ti.API.info(e.error);

			var dialog = Ti.UI.createAlertDialog({
			    title: 'Invalid channel name. Try again.',
			    buttonNames: ['OK']
			});
			dialog.show();

			dialog.addEventListener('click', function(e){
				self.close();
				textField.value = '';
			});
		};
		
		loader.timeout = 10000; // in milliseconds
		
		// Send the HTTP request
		loader.send();

		self.open(
			textField.blur()
		);
	};

	channelSetting.add(textField);
	channelSetting.add(button);
	
	button.addEventListener('click', function(){
		Ti.API.info('input text: '+textField.value);
		if(textField.value !== ''){
			Ti.App.Properties.setString('ch', textField.value);
			openChannel(textField.value);			
		} else {
			var dialog = Ti.UI.createAlertDialog({
			    title: 'Invalid channel name. Try again.',
			    buttonNames: ['OK']
			});
			dialog.show();
		}
	});
	
	textField.addEventListener('return', function(e){
		Ti.API.info('input text: '+e.value);
		if(textField.value !== ''){
			Ti.App.Properties.setString('ch', e.value);
			textField.value = e.value;
			openChannel(e.value);			
		} else {
			var dialog = Ti.UI.createAlertDialog({
			    title: 'Invalid channel name. Try again.',
			    buttonNames: ['OK']
			});
			dialog.show();
		}
	});

	textField.addEventListener('swipe', function(e){
		textField.value = '';
		Ti.App.Properties.setString('ch', '');
	});

	return channelSetting;
};

module.exports = ApplicationWindow;