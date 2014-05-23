;
(function($) {
	var type = 'embed';
	var typeClass = '.itch-type-' + type;
	
	var loaded = false;

	var render = function(itch) {
		var itchData = itch.data('itch');
		var body = itch.find('.itch-body');
		body.empty();

		// done in render so that it's loaded globally on page load
		if (itchData.data.embedly && !Scratch.EmbedlyID) {
			Scratch.EmbedlyID = itchData.data.embedly;
		}

		if (itchData.data.embedInfo) {
			var info = itchData.data.embedInfo;
			
			if (info.media.html) {
				body.html(itchData.data.embedInfo.media.html);
			} else if (info.media.url && info.media.type == 'photo') {
				var caption = info.description ? info.description : info.title;
				if (!caption) {
					caption = info.original_url;
				}
				body.append('<div><a href="' + info.original_url +'" target="_blank"><img src="' + info.media.url + '" title="' + caption + '" /></a></div>')
			} else if (info.content) {
				body.html(info.content)
			} else {
				var linkText = info.title + ': ' + info.description;
				body.append('<div><a href="' + info.url +'" target="_blank">' + linkText + '</a></div>')
			}

//			$.get('jsonservice/socialGraph/convertUrl', {remoteUrl: itchData.data.url}, function (data) {
//				if (data && data.response && data.response.Content) {
//					body.html(data.response.Content);
//				}
//			})
		} else {
			renderEdit(itch);
		}
	};

	var renderEdit = function(itch) {
		var elems = [
			{
				type: 'url',
				caption: ' URL',
				name: 'url'
			}
		];

		if (!Scratch.EmbedlyID) {
			elems.push({
				type: 'text',
				caption: 'Embedly API key; you\'ll only need enter this if it can\'t be found on an existing embedded itch',
				name: 'embedly'
			});
		}
		
		elems.push({
			type: 'submit',
			value: 'Update'
		})
		
		Scratch.editForm(itch, elems, null, function(form, itchData) {
			itch.trigger('reloadEmbedData');
			return false;
		});
	};
	
	$(document).on('reloadEmbedData', '.itch', function (e) {
		var itch = $(this);
		var itchData = itch.data('itch');
		
		delete itchData.data.embedInfo;
		
		var embedlyId = itchData.data.embedly ? itchData.data.embedly : Scratch.EmbedlyID;

		if (itchData.data.url && embedlyId) {
			Scratch.loading(itch.find('.itch-body'));
			$.embedly.extract(itchData.data.url, {key: embedlyId}).progress(function(data) {
				itchData.data.embedInfo = data;
				itchData.options.title = data.title;
				Scratch.save();
				itch.trigger('optionsUpdate');
				render(itch);
			});
		}
	})

	$(document).on('updateGeneralMenu', function(e, items) {
		items[type] = {name: "Embed"};
	});
	
	Scratch.prepareItchType(type, {render: render, renderEdit: renderEdit});

	/**
	 * Class file for the wrapper around Embed itches
	 * 
	 * @param object itchData
	 * @returns {_L2.embedWrapper}
	 */
	var embedWrapper = function (itchData) {
		this.itchData = itchData;
	};
	embedWrapper.prototype.forExport = function () {
		return this.itchData;
	};
	
	Scratch.addWrapper(type, embedWrapper);
	
	Scratch.loadScript("themes/scratch/javascript/jquery/jquery.embedly-3.1.1.min.js").done(function () {
		loaded = true;
	});
	
})(jQuery);