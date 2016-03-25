;(function ($) {
	var type = 'switcher';
	
	var storeKey = 'switcher-scratches';
	
	var handlers = {
		render: function (itch) {
			var allScratches = {};
			// check if markdown is loaded yet
			var res = localStorage.getItem(storeKey);
			if (res) {
				allScratches = JSON.parse(localStorage.getItem(storeKey));
			}
			
			var current = Scratch.getStorePrefix();
			
			if (!allScratches[current]) {
				allScratches[current] = current;
				localStorage.setItem(storeKey, JSON.stringify(allScratches));
			}
			var opts = {'': ''};
			for (var opt in allScratches) {
				opts[opt] = allScratches[opt];
			}
			
			var elems = [
				{
					'name': 'switchTo',
					'caption': 'Switch to scratch',
					'type': 'select',
					options: opts
				},
				{
					'name': 'newStore',
					'caption': "New scratch",
					"type": "text"
				},
//				{
//					"name": "deleteScratch",
//					"type": "checkbox",
//					"caption": "Delete selected scratch",
//					"value": "1"
//				},
				{
					"type": "submit",
					"value": "Update",
				}
			];
			Scratch.editForm(itch, elems, function () {
				
			}, function (form, itchData) {
				var to = itchData.data.switchTo;
				
				if (itchData.data.deleteScratch && to.length) {
					delete itchData.data.deleteScratch;
					itchData.data.switchTo = 'Default';
				}
				var newStore = itchData.data.newStore;
				if (newStore && newStore.length) {
					itchData.data.switchTo = newStore;
				}
				
				to = itchData.data.switchTo;
				
				itchData.data.newStore = '';
				itchData.data.switchTo = '';
				Scratch.save();
				
				if (to && to.length > 0) {
					if (to != current) {
						// create a new store... ?
						Scratch.start(to);
						var newUrl = Scratch.currentUrl() + '?s=' + encodeURIComponent(to);
						if (window.history) {
							window.history.pushState({}, to, newUrl);
						}
					}
				}
			});
			
		},
		renderEdit: function (itch) {
			
		}
	};
	
	$(document).on('updateGeneralMenu', function(e, items) {
		items[type] = {name: "Switcher"};
	});

	Scratch.prepareItchType('switcher', handlers);
})(jQuery);
