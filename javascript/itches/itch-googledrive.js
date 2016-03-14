;
(function($) {
	var type = 'googledrive';
	var typeClass = '.itch-type-' + type;
	var SCOPES = [
		'https://www.googleapis.com/auth/drive.file',
		'https://www.googleapis.com/auth/userinfo.email',
		'https://www.googleapis.com/auth/userinfo.profile',
	];

	var loaded = false;
	var saving = false;
	var CLIENT_ID = '';
	var API_KEY = '';

	var picker;

	/**
	 * gets the single instance itch that is doing anything
	 * 
	 * @returns element
	 */
	var activeItch = function() {
		return $(typeClass).first();
	};

	var render = function(itch) {
		// check if markdown is loaded yet
		var itchData = itch.data('itch');
		var body = itch.find('.itch-body');
		body.empty();
		
		if (!loaded) {
			body.html('Connecting to google drive...');
			checkAuth();
		} else {
			if (itchData && itchData.data && (itchData.data.filename || itchData.data.fileId)) {
				body.append('Saving to ' + itchData.data.filename + ' (#' + itchData.data.fileId + ')');
				body.append('<button class="save-to-drive">Save to Drive</button>');
			}
			if (picker) {
				body.append('<button class="load-from-drive">Load from Drive</button>');
			}
		}

		if (!updateTimer) {
			createTimer(itchData);
		}
	};
	var renderOptions = function(itch) {
		var elems = [
			{
				name: 'filename',
				type: 'text',
				caption: 'Filename to save into'
			},
			{
				name: 'fileId',
				type: 'text',
				caption: 'Drive file ID - will be auto-populated after hitting save, or you can manually set to the file ID to read. '
			},
			{
				'name': 'saveFrequency',
				'caption': 'How often will data be saved to Drive?',
				'type': 'select',
				options: {
					'0': 'No auto save',
					'300': '5 minutes',
					'600': '10 minutes',
					'1800': '30 minutes'
				}
			},
			{
				type: 'submit',
				value: 'Update'
			}
		];
		Scratch.editForm(itch, elems, null, function(event, itchData) {
			createTimer(itchData);
		});
	}

/** 
 * Auto save is currently disabled...
 */
	var autoSave = function() {
		var itch = activeItch();
		// only do auto saving _if_ the saving flag has been set true
		if (saving && itch && loaded) {
			var itchData = itch.data('itch');
			var body = itch.find('.itch-body');
		}
	}

	/**
	 * Load a json file from google drive
	 * 
	 * @returns 
	 */
	var loadFromDrive = function() {
		var itch = activeItch();
		if (!itch) {
			return;
		}

		picker.setCallback(function(response) {
			if (response.action == 'picked') {
				if (response.docs && response.docs.length) {
					for (var i in response.docs) {
						var metadata = response.docs[i];

						if (metadata.mimeType != 'application/json') {
							continue;
						}

						loadFile(metadata);
					}
				}
			}
		});

		picker.setVisible(true);
	};

	/**
	 * 
	 * @param {type} googleMetadata
	 * @returns promise
	 */
	var loadFile = function(googleMetadata) {
		var itch = activeItch();
		if (!itch) {
			return;
		}
		var itchData = itch.data('itch');

		itchData.data.loadedFileId = googleMetadata.id;
		itchData.data.loadedFilename = googleMetadata.name;

		Scratch.save();

		var request = gapi.client.drive.files.get({
			'fileId': googleMetadata.id
		});

		request.execute(function(resp) {
			if (!resp.error) {
				if (resp.downloadUrl) {
					return $.ajax(
						resp.downloadUrl,
						{
							headers: {'Authorization': 'Bearer ' + gapi.auth.getToken().access_token }
						}
					).then(function (data) {
						Scratch.loadItches(data);
					});
				}
			} else if (resp.error.code == 401) {
				// Access token might have expired.
				checkAuth();
			} else {
				Scratch.log('An error occured: ' + resp.error.message);
			}
		});

	};

	/**
	 * Given a data set of itches, load them one by one
	 * 
	 * @param object dataSet
	 * @returns 
	 * 
	 */
	var processScratchData = function(dataSet) {

	}

	var exportAndSave = function() {
		var itch = activeItch();
		var itchData = itch.data('itch');
		var body = itch.find('.itch-body');
		var filename = itchData.data.filename ? itchData.data.filename : 'scratch.json';
		var fileId = itchData.data.fileId;

		var msg = $('<div class="gdrive-msg">').text('Saving to ' + filename);
		body.append(msg);

		if (fileId) {
			// we're updating an existing one
			Scratch.log("Saving to " + fileId);

			var content = JSON.stringify(Scratch.forExport());
			updateFile(fileId, '{}', content, function(response) {
				if (response.error) {
					if (response.error.code == '404') {
						delete itchData.data.fileId;
						exportAndSave();
					}
				} else {
					Scratch.log(response);
					// okay done!
					$('.gdrive-msg').fadeOut();
				}
			});
		} else {
			// we're creating a new one
			var mydata = {};
			mydata.title = filename;
			mydata.mimeType = "application/json";
			mydata.description = "File saved from Scratch'n'Think";
			var request = gapi.client.drive.files.insert({'resource': mydata});

			request.execute(function(resp) {
				if (!resp.error) {
					itchData.data.fileId = resp.id;
					Scratch.save();
					exportAndSave();
					msg.remove();
				}
			});
		}
	};

	var updateTimer = null;
	var createTimer = function(itchData) {
		if (!itchData) {
			return;
		}

		if (itchData.data.saveFrequency > 0) {
			if (updateTimer) {
				clearInterval(updateTimer);
			}
			autoSave();
			updateTimer = setInterval(autoSave, itchData.data.saveFrequency * 1000);
		}
	}

	$(document).on('click', '.save-to-drive', function(e) {
		exportAndSave();
	});

	$(document).on('click', '.load-from-drive', loadFromDrive);

	$(document).on('updateGeneralMenu', function(e, items) {
		items[type] = {name: "Google Drive"};
	});

	window.googleClientLoad = function() {
		checkAuth();
	}

	function checkAuth() {
		gapi.auth.authorize({
			'client_id': CLIENT_ID,
			'scope': SCOPES.join(' '),
			'immediate': true
		}, handleAuthResult);
	}

	function handleAuthResult(authResult) {
		if (authResult) {
			// Access token has been successfully retrieved, requests can be sent to the API
			loaded = true;
			gapi.client.load('drive', 'v2', function() {
				loaded = true;
				// save in a minute's time
				var itch = activeItch();
				if (itch) {
					render(itch);
				}
			});

			gapi.load('picker', {'callback': function() {
					picker = new google.picker.PickerBuilder().
						addView(google.picker.ViewId.DOCS).
						setOAuthToken(authResult.access_token).
						setDeveloperKey(API_KEY).
						build();
//				picker.setVisible(true);
				}});

		} else {
			// No access token could be retrieved, force the authorization flow.
			gapi.auth.authorize({
				'client_id': CLIENT_ID,
				'scope': SCOPES,
				'immediate': false
			}, handleAuthResult);
		}
	}

	function updateFile(fileId, fileMetadata, fileContent, callback) {
		var boundary = '-------314159265358979323846';
		var delimiter = "\r\n--" + boundary + "\r\n";
		var close_delim = "\r\n--" + boundary + "--";

		var contentType = fileMetadata.type || 'application/json';
		// Updating the metadata is optional and you can instead use the value from drive.files.get.
		var base64Data = Base64.encode(fileContent);
		var multipartRequestBody =
			delimiter +
			'Content-Type: application/json\r\n\r\n' +
			JSON.stringify(fileMetadata) +
			delimiter +
			'Content-Type: ' + contentType + '\r\n' +
			'Content-Transfer-Encoding: base64\r\n' +
			'\r\n' +
			base64Data +
			close_delim;

		var request = gapi.client.request({
			'path': '/upload/drive/v2/files/' + fileId,
			'method': 'PUT',
			'params': {'uploadType': 'multipart', 'alt': 'json'},
			'headers': {
				'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
			},
			'body': multipartRequestBody
		});

		if (!callback) {
			callback = function(file) {

			};
		}
		request.execute(callback);
	}

	Scratch.loadScript("https://apis.google.com/js/client.js?onload=googleClientLoad").done(function() {

	});
	
	
	Scratch.prepareItchType(type, {render: render, renderEdit: renderOptions});
	
})(jQuery);
