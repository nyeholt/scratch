;(function($) {
	function LocalStorage () {
		
	};
	
	LocalStorage.prototype = {
		save: function (key, data) {
			localStorage.setItem(key, JSON.stringify(data));
		},
		get: function (key) {
			var item = localStorage.getItem(key);
			if (item) {
				return JSON.parse(item);
			}
		},
		remove: function (key) {
			localStorage.removeItem(key);
		},
		
		clear: function () {
			localStorage.clear();
		}
	};

	Scratch.setStore(new LocalStorage());
	
})(jQuery);

