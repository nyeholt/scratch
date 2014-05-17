<!DOCTYPE html>
<html>
	<head>
		<% base_tag %>
		<title>My project</title>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<script type="text/javascript" src="themes/scratch/javascript/base64.js"></script>
		
		<script type="text/javascript" src="themes/scratch/javascript/jquery-2.0.0.js"></script>
		<script type="text/javascript" src="themes/scratch/javascript/jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.js"></script>
		
		<script type="text/javascript" src="themes/scratch/javascript/jquery.mousewheel.js"></script>
		<script type="text/javascript" src="themes/scratch/javascript/jquery.serializejson.min.js"></script>
		<script type="text/javascript" src="themes/scratch/javascript/jquery.populate.js"></script>
		<script type="text/javascript" src="themes/scratch/javascript/jquery.dform-1.1.0.js"></script>
		
		<script src="themes/scratch/javascript/jquery.panzoom.js"></script>
		<script src="themes/scratch/javascript/jquery-context/jquery.contextMenu.js"></script>
		<script src="themes/scratch/javascript/jquery.gdb.js?v1.2.1"></script>
		
		<script src="themes/scratch/javascript/markdown-0.6.1/markdown.js"></script>

		<script src="themes/scratch/javascript/scratch.js"></script>
		<script src="themes/scratch/javascript/scratch-local-storage.js"></script>
		
		<script src="themes/scratch/javascript/itches/scratch-itch.js"></script>
		<script src="themes/scratch/javascript/itches/scratch-embed.js"></script>
		<script src="themes/scratch/javascript/itches/scratch-rss.js"></script>
		<script src="themes/scratch/javascript/itches/scratch-saver.js"></script>
		
		<link rel="stylesheet" href="themes/scratch/javascript/jquery-ui-1.10.4.custom/css/ui-lightness/jquery-ui-1.10.4.custom.css" />
		<link rel="stylesheet" href="themes/scratch/css/scratch.css" />
		<link rel="stylesheet" href="themes/scratch/javascript/jquery-context/jquery.contextMenu.css" />
	</head>
	<body>
		<div id="controls">
			<div id="zoomcontrols">
			<button id="zoomout" value="-">-</button><button id="resetzoom">0</button><button id="zoomin" value="+">+</button>
			</div>
			<div id="controls-body">
				
			</div>
			
			<button id="collapsecontrols">Close</button>
		</div>
		
		
		<div id="container">
		<div class="panzoom">
			
		</div>
		</div>
		
		<script type="text/template" id="GeneralSettingsForm">
		<form class="generalSettingsForm itchForm">
			<div>
			<label>Background</label>
			<input type="text" name="backgroundColor" />
			</div>
			<div>
			<label>Labels</label>
			<input type="text" name="labels" />
			</div>
			
			<input type="submit" value="OK" />
		</form>
		</script>
		
		<script type="text/template" id="ItchEditForm">
		<form class="itchEditForm itchForm">
			<textarea name="content" rows="10"></textarea>
			<input type="submit" value="Done" />
		</form>
		</script>

		<script type="text/template" id="EmbedEditForm">
		<form class="embedEditForm itchForm">
			<input type="text" name="url" rows="10" />
		</form>
		</script>
	</body>
</html>