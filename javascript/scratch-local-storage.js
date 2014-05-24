;(function($) {
	function LocalDataStore (prefix) {
		this.prefix = prefix ? prefix + '_' : '';
	};
	
	LocalDataStore.prototype = {
		save: function (key, data) {
			key = this.prefix + key;
			localStorage.setItem(key, JSON.stringify(data));
		},
		get: function (key) {
			key = this.prefix + key;
			var item = localStorage.getItem(key);
			if (item) {
				return JSON.parse(item);
			}
		},
		remove: function (key) {
			key = this.prefix + key;
			localStorage.removeItem(key);
		},
		
		clear: function () {
			localStorage.clear();
		}
	};
	
	window.LocalDataStore = LocalDataStore;
	
})(jQuery);

