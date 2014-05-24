;
(function($) {
	var type = 'rss';
	var typeClass = '.itch-type-' + type;

	var parserss = function (url, container) {
		$.ajax({
			url: document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(url),
			dataType: 'json',
			success: function(data) {
				if (!data) {
					alert("RSS data not found for " + url);
					return;
				}
				
				if (!data.responseData) {
					Scratch.log(data);
					alert("RSS data not found for " + url);
					return;
				}
				
				//console.log(data.responseData.feed);
				$(container).html('<h2>' + (data.responseData.feed.title) + '</h2>');

				$.each(data.responseData.feed.entries, function(key, value) {
					var containingDiv = $('<div class="rss-entry">');
					
					var thehtml = '<h3><a href="' + value.link + '" target="_blank" class="rss-link">' + value.title + '</a></h3>';
					if (value.content)
					thehtml += value.content;
					
					containingDiv.append(thehtml);
					
					$(container).append(containingDiv);
				});
				
			}
		});
	}

	var render = function(itch) {
		var itchData = itch.data('itch');
		var body = itch.find('.itch-body');
		if (itchData.data.url) {
			Scratch.loading(body);
			parserss(itchData.data.url,body);
		} else {
			body.html('Please insert  URL');
		}
	};

	var renderEdit = function(itch) {
		var elems = [
			{
				type: 'url',
				caption: ' URL',
				name: 'url'
			},
			{
				type: 'submit',
				value: 'Update'
			}
		];
		
		// re-use the embed editting form
		Scratch.editForm(itch, elems);
	};

	
	$(document).on('updateGeneralMenu', function (e, items) {
		items[type] = { name: "RSS" };
	});

	Scratch.prepareItchType(type, {render: render, renderEdit: renderEdit});

	// reload all itches every 10 minutes
	setInterval(function () {
		$(typeClass).each(function () {
			var itch = $(this);
			if (itch.find('.itchForm').length == 0) {
				render(itch);
			}
		})
	}, (300 * 1000));
})(jQuery);