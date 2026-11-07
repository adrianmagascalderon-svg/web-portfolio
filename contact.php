<?php
// Contact form handler. Sumasagot ng JSON kapag galing sa fetch, at nagre-redirect kung walang JS.
// "ok" ay ibinabalik LANG kapag talagang nasave ang mensahe (o naipadala ang email).
//
// Paalala: sa Render free tier, nabubura ang messages.log kapag nag-redeploy.
// Para sa totoong email, ilagay ang email mo sa $to at mag-set up ng mail service.

$to = ''; // email mo, kung may mail() support ang host

$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function respond($ok, $error, $wantsJson) {
    if ($wantsJson) {
        http_response_code($ok ? 200 : 400);
        header('Content-Type: application/json');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error]);
    } else {
        header('Location: index.php#/contact');
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

// Honeypot: bot lang ang pupuno sa hidden field
if (($_POST['website'] ?? '') !== '') {
    respond(true, '', $wantsJson);
}

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)
    || strlen($name) > 100 || strlen($message) > 2000) {
    respond(false, 'Please fill in your name, a valid email, and a message.', $wantsJson);
}

$name  = preg_replace('/[\r\n]+/', ' ', $name);
$email = preg_replace('/[\r\n]+/', ' ', $email);

$saved = @file_put_contents(
    __DIR__ . '/messages.log',
    sprintf("[%s] %s <%s>\n%s\n\n", date('Y-m-d H:i:s'), $name, $email, $message),
    FILE_APPEND | LOCK_EX
);

$mailed = false;
if ($to !== '') {
    $mailed = @mail($to, "Portfolio message from $name", $message, "From: $email\r\nReply-To: $email");
}

if ($saved === false && !$mailed) {
    respond(false, 'The message could not be stored. Please email me directly.', $wantsJson);
}
respond(true, '', $wantsJson);
