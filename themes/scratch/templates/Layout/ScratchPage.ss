<!DOCTYPE html>
<html>
	<head>
		<% base_tag %>
		<meta name="viewport" content="width=device-width,initial-scale=1" />
		<title>Scratch</title>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<script type="text/javascript" src="themes/scratch/javascript/base64.js"></script>
		
		<script type="text/javascript" src="themes/scratch/javascript/jquery/jquery-2.0.0.js"></script>
		<script type="text/javascript" src="themes/scratch/javascript/jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.js"></script>
		
		<script type="text/javascript" src="themes/scratch/javascript/jquery/jquery.mousewheel.js"></script>
		<script type="text/javascript" src="themes/scratch/javascript/jquery/jquery.serializejson.min.js"></script>
		<script type="text/javascript" src="themes/scratch/javascript/jquery/jquery.populate.js"></script>
		<script type="text/javascript" src="themes/scratch/javascript/jquery/jquery.dform-1.1.0.js"></script>
		
		<script src="themes/scratch/javascript/jquery/jquery.panzoom.js"></script>
		<script src="themes/scratch/javascript/jquery-context/jquery.contextMenu.js"></script>
		<script src="themes/scratch/javascript/jquery/jquery.gdb.js?v1.2.1"></script>
		
		
		<!-- itch specific dependencies -->
		<script src="themes/scratch/javascript/scratch.js"></script>
		<script src="themes/scratch/javascript/scratch-local-storage.js"></script>
		
		<script src="themes/scratch/javascript/itches/itch-sysconf.js"></script>
		
		<script src="themes/scratch/javascript/itches/itch-text.js"></script>
		
		<!--<script src="themes/scratch/javascript/itches/itch-embed.js"></script>-->
		
		<link rel="stylesheet" href="themes/scratch/javascript/jquery-ui-1.10.4.custom/css/ui-lightness/jquery-ui-1.10.4.custom.css" />
		<link rel="stylesheet" href="themes/scratch/css/scratch.css" />
		<link rel="stylesheet" href="themes/scratch/javascript/jquery-context/jquery.contextMenu.css" />
	</head>
	<body>
		<div id="controls">
			<div id="zoomcontrols">
			<button id="zoomout" value="-">-</button><button id="resetzoom">0</button><button id="zoomin" value="+">+</button>
			</div>
			
			<div id="pinned-itches">
				
			</div>
			
		</div>
		
		
		<div id="container">
		<div class="panzoom">
			
		</div>
		</div>
		
	</body>
</html>