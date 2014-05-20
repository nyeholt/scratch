;
(function($) {

	var getEmbedlyId = function () {
		var embedlyId = $('#EmbedlyId');
		return embedlyId.val();
	}
	
	var saveEmbedlyId = function (id) {
		var elem = $('#EmbedlyId');
		if (elem.length === 0) {
			elem = $('<input type="hidden" id="EmbedlyId" />');
			$('body').append(elem);
		}
		elem.val(id);
	}

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
			} else if (info.content) {
				body.html(info.content)
			} else if (info.images) {
				$(info.images).each(function () {
					body.append('<div><a href="' + this.url +'" target="_blank"><img src="' + this.url + '" title="' + this.caption + '" /></a><p>'+ this.caption + '</p></div>')
				})
			} 

//			$.get('jsonservice/socialGraph/convertUrl', {remoteUrl: itchData.data.url}, function (data) {
//				if (data && data.response && data.response.Content) {
//					body.html(data.response.Content);
//				}
//			})
		} else {
			renderOptions(itch);
		}
	};

	var renderOptions = function(itch) {
		var embedlyId = getEmbedlyId();
		
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
			// after editing, we reset the embedContent
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
			return false;
		});
	};

	$(document).on('prepareGeneralMenu', function(e, items) {
		items['embed'] = {name: "Embed"};
	});

	$(document).on('itchCreated', '.itch-type-Embed', function() {
		renderOptions($(this));
	})

	$(document).on('renderItch', '.itch-type-Embed', function() {
		render($(this));
	});

	$(document).on('click', '.itch-type-Embed .itch-handle', function() {
		var itch = $(this).parents('.itch');
		if (itch.find('.itchForm').length > 0) {
			render(itch);
		} else {
			renderOptions(itch);
		}
	});
	
	var embedWrapper = function (itchData) {
		this.itchData = itchData;
	};
	
	embedWrapper.prototype.forExport = function () {
		return this.itchData;
	};
	
	Scratch.addWrapper('Embed', embedWrapper);
	
})(jQuery);