<?php

if (!isset($_REQUEST['action'])) {
	exit();
}

$url = 'http://dpaste.com';

$action = $_REQUEST['action'];
$method = 'GET';

$deserializeBody = false;

$data = array();

if ($action == 'create') {
	if (!isset($_REQUEST['content'])) {
		throw new Exception("Missing content");
	}
	$endpoint = '/api/v2/';
	$method = 'POST';
	
	$data = array(
		'content' => $_REQUEST['content'],
		'syntax'	=> 'json',
		'expiry_days' => 1,
	);
	
} else if ($action == 'load') {
	if (!isset($_REQUEST['paste'])) {
		throw new Exception ("'paste' ID not supplied");
	}
	
	$id = trim($_REQUEST['paste'], '/');
	if (strpos($id, '://')) {
		$id = substr($id, strrpos($id, '/'));
	}
	
	$id = filter_var($id, FILTER_VALIDATE_REGEXP, array("options"=>array("regexp"=>"/[a-zA-Z0-9]+/")));
	if (!$id) {
		throw new Exception("Invalid ID passed");
	}
	$deserializeBody = true;
	$endpoint = "/$id.txt";
}


$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url . $endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
//curl_setopt($ch, CURLOPT_USERAGENT, $useragent);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);


// Write headers to a temporary file
$headerfd = tmpfile();
curl_setopt($ch, CURLOPT_WRITEHEADER, $headerfd);

// Add fields to POST and PUT requests
if ($method == 'POST') {
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
}

// Run request
$body = curl_exec($ch);

rewind($headerfd);
$headers = stream_get_contents($headerfd);
fclose($headerfd);

$response = extractResponse($ch, $headers, $body);

if (isset($response['raw']) && $deserializeBody) {
	$response['body'] = @json_decode($response['raw']);
}

curl_close($ch);

header('Content-type: application/json');
echo json_encode($response);

function extractResponse($ch, $rawHeaders, $rawBody) {
	//get the status code
	$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	//get a curl error if there is one
	$curlError = curl_error($ch);
	//normalise the status code
	if (curl_error($ch) !== '' || $statusCode == 0)
		$statusCode = 500;
	//parse the headers
	$parts = array_filter(explode("\r\n\r\n", $rawHeaders));
	$lastHeaders = array_pop($parts);
	$headers = parseRawHeaders($lastHeaders);
	//return the response object
	return array('raw' => $rawBody, 'status_code' => $statusCode, 'headers' => $headers);
}

function parseRawHeaders($rawHeaders) {
	$headers = array();
	$fields = explode("\r\n", preg_replace('/\x0D\x0A[\x09\x20]+/', ' ', $rawHeaders));
	foreach ($fields as $field) {
		if (preg_match('/([^:]+): (.+)/m', $field, $match)) {
			$match[1] = preg_replace_callback(
				'/(?<=^|[\x09\x20\x2D])./', create_function('$matches', 'return strtoupper($matches[0]);'), trim($match[1])
			);
			if (isset($headers[$match[1]])) {
				if (!is_array($headers[$match[1]])) {
					$headers[$match[1]] = array($headers[$match[1]]);
				}
				$headers[$match[1]][] = $match[2];
			} else {
				$headers[$match[1]] = trim($match[2]);
			}
		}
	}
	return $headers;
}
