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
			Scratch.log(allScratches);
			
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
					'caption': "New store name",
					"type": "text"
				},
				{
					"type": "submit",
					"value": "Change"
				}
			];
			Scratch.editForm(itch, elems, function () {
				
			}, function (form, itchData) {
				var newStore = itchData.data.newStore;
				if (newStore && newStore.length) {
					itchData.data.switchTo = newStore;
				}
				
				var to = itchData.data.switchTo;
				
				itchData.data.newStore = '';
				itchData.data.switchTo = '';
				Scratch.save();
				
				if (to && to.length > 0) {
					if (to != current) {
						// create a new store... ?
						location.href = Scratch.currentUrl() + '?s=' + encodeURIComponent(to);
					}
				}
			});
			
		},
		renderEdit: function (itch) {
			// <textarea name="content" rows="10"></textarea>
//			var elems = [
//				{
//					type: 'textarea',
//					name: 'content',
//					caption: 'Markdown content'
//				},
//				{
//					type: 'submit',
//					value: 'Update'
//				}
//			];
//			Scratch.editForm(itch, elems, function () {
//				itch.find('textarea').autogrow();
//			});
		}
	};
	
	$(document).on('updateGeneralMenu', function(e, items) {
		items[type] = {name: "Switcher"};
	});

	Scratch.prepareItchType('switcher', handlers);
})(jQuery);
