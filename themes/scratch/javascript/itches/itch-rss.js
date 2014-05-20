;
(function($) {
	var type = 'rss';
	var typeClass = '.itch-type-' + type;

	var parserss = function (url, container) {
		$.ajax({
			url: document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(url),
			dataType: 'json',
			success: function(data) {
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
		Scratch.loading(body);
		parserss(itchData.data.url,body);
	};
	

	var renderOptions = function(itch) {
		// re-use the embed editting form
		Scratch.editForm(itch, '#EmbedEditForm');
	};

	
	$(document).on('prepareGeneralMenu', function (e, items) {
		items[type] = { name: "RSS" };
	});

	$(document).on('itchCreated', typeClass, function() {
		$(this).removeClass('initialising');
		renderOptions($(this));
	})

	$(document).on('renderItch', typeClass, function() {
		render($(this));
	});

	$(document).on('click', typeClass + ' .itch-handle', function() {
		var itch = $(this).parents('.itch');
		if (itch.find('.itchForm').length > 0) {
			render(itch);
		} else {
			renderOptions(itch);
		}
	});

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