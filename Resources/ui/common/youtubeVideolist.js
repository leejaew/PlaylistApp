/* 
 *Original Js module 'youtubeVideolist.js' by Karthi Ponnusamy
 * 
 */

exports.youtubeVideolist = function(title_name, playlist_id) {
	
	var isAndroid = Ti.Platform.osname === 'android';
	
	var win = Ti.UI.createWindow({
		title				: title_name,
		backgroundColor		: '#fff',
		fullscreen			: true
	});

	// Empty array "rowData" for our tableview
	var data = [];
	
	// Create our HTTP Client and name it "loader"
	var loader = Titanium.Network.createHTTPClient();
	
	// Sets the HTTP request method, and the URL to get data from
	loader.open("GET", "http://gdata.youtube.com/feeds/api/playlists/" + playlist_id + "?v=2");

	// Runs the function when the data is ready for us to process
	loader.onload = function() {

		var doc = this.responseXML.documentElement;
		var items = doc.getElementsByTagName("entry");

		for (var c = 0; c < items.length; c++) {
		
			var item = items.item(c);
			var thumbnails = item.getElementsByTagName("media:thumbnail");

			if (thumbnails && thumbnails.length > 0) {
				
				var media = thumbnails.item(0).getAttribute("url");
				var title = item.getElementsByTagName("title").item(0).textContent;
				var videoId = item.getElementsByTagName("yt:videoid").item(0).textContent;
				
				var row = Ti.UI.createTableViewRow({
					video_id		: videoId,
					video_title 	: title,
					height			: Ti.UI.SIZE,
				});
				
				var label = Ti.UI.createLabel({
					text		: title,
					left		: '92dp',
					top			: '5dp',
					bottom		: '5dp',
					right		: '5dp',
					height 		: Ti.UI.SIZE,
					color 		: '#000',
					font 		: 
					{
						fontSize	: '14dp',
						fontWeight	: 'bold'
					}
				});
				
				row.add(label);

				var img = Ti.UI.createImageView({
					image		: media,
					left		: '5dp',
					height		: '60dp',
					width		: '80dp',
					top			: '5dp',
					bottom		: '5dp'
				});

				row.add(img);
				data.push(row);
			}
		}
		
		var tableView = Titanium.UI.createTableView({
			// top				: 0,
			bottom			: !isAndroid ? '45dp' : 0,
			backgroundColor	: '#fff',
			data			: data
		});
		
		//Add the table view to the window
		win.add(tableView);

		if (!isAndroid) {
			
			var flexSpace = Titanium.UI.createButton({
				systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
			});
	
			var btnBack = Titanium.UI.createButton({
				title	: 'Back',
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
			
			win.add(navBar);
	
			btnBack.addEventListener('click', function(e) {
				win.close();
			});
	
		}
		
		tableView.addEventListener('click', function(e) {

			if (isAndroid) {
			
				Titanium.Platform.openURL('http://www.youtube.com/watch?v=' + e.rowData.video_id);
			
			} else {
				
				var ytVideoSrc = "http://www.youtube.com/v/" + e.rowData.video_id;
				var playerWin = Ti.UI.createWindow({
					backgroundColor	: '#ccc'
				});
				
				playThisVid(playerWin, ytVideoSrc);
			}
		});

		function playThisVid(view, video) {
			
			// Set the window orientation
			view.orientationModes = [Ti.UI.LANDSCAPE_RIGHT];

			var videoUrl = video;
			var htmlheader = "<html><head></head><body style='margin:0'><embed id='yt' src='";
			var htmlfooter = "' type='application/x-shockwave-flash' width='100%' height='100%'></embed></body></html>";
			var htmlmash = htmlheader + videoUrl + htmlfooter;

			if (!isAndroid) {
				var flexSpace = Titanium.UI.createButton({
					systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
				});
	
				var done = Titanium.UI.createButton({
					title	: 'Exit',
					style	: Titanium.UI.iPhone.SystemButtonStyle.BORDERED
				});
	
				var navBar = Titanium.UI.iOS.createToolbar({
					items 			: [flexSpace, flexSpace, done],
					top				: 0,
					borderBottom 	: true,
					barColor		: '#fff',
					translucent		: true
				});
				
				view.add(navBar);
	
				done.addEventListener('click', function(e) {
					view.close();
				});
			}

			webview = Ti.UI.createWebView({
				top		: isAndroid ? 0 : '34dp',
				html	: htmlmash
			});

			view.add(webview);
			
			view.open({ fullscreen: true });
		}

	};

	loader.onerror = function(e) {
		//Ti.API.debug(e.error);
		alert("Unable to connect to server");
	};

	loader.timeout = 5000;
	/* in milliseconds */

	// Send the HTTP request
	loader.send();

	return win;
};
