<?php declare(strict_types=1);

$data = [
[
          'text' => 'Aqua',
          'value' => 'aqua',
          'hex' => '#00FFFF'
],
[
          'text' => 'Black',
          'value' => 'black',
          'hex' => '#000000'
],
[
          'text' => 'Blue',
          'value' => 'blue',
          'hex' => '#0000FF'
],
[
          'text' => 'Gray',
          'value' => 'gray',
          'hex' => '#808080'
],
[
          'text' => 'Green',
          'value' => 'green',
          'hex' => '#008000'
],
[
          'text' => 'Fuchsia',
          'value' => 'fuchsia',
          'hex' => '#FF00FF'
],
[
          'text' => 'Lime',
          'value' => 'lime',
          'hex' => '#00FF00'
],
[
          'text' => 'Maroon',
          'value' => 'maroon',
          'hex' => '#800000'
],
[
          'text' => 'Navy',
          'value' => 'navy',
          'hex' => '#000080'
],
[
          'text' => 'Olive',
          'value' => 'olive',
          'hex' => '#808000'
],
[
          'text' => 'Purple',
          'value' => 'purple',
          'hex' => '#800080'
],
[
          'text' => 'Red',
          'value' => 'red',
          'hex' => '#FF0000'
],
[
          'text' => 'Silver',
          'value' => 'silver',
          'hex' => '#C0C0C0'
],
[
          'text' => 'Teal',
          'value' => 'teal',
          'hex' => '#008080'
],
[
          'text' => 'Yellow',
          'value' => 'yellow',
          'hex' => '#FFFF00'
],
[
          'text' => 'White',
          'value' => 'white',
          'hex' => '#FFFFFF'
]
];

if (isset($_SERVER['HTTP_ORIGIN'])) {
    // Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
    // you want to allow, and if so:
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        // may also be using PUT, PATCH, HEAD etc
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

$search = $_GET['query'] ?? null;

$filtered = $search !== null
    ? array_filter($data, function ($item) use ($search) {
        return strpos($item['value'], $search) !== false;
    })
    : $data;

header('Content-Type: application/json');
echo json_encode(array_values($filtered));