<?php
require __DIR__ . '/data.php';
function e($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($site['name']) ?> | THE PUZZLE</title>
<meta name="theme-color" content="#FFFFFF">
<meta name="description" content="<?= e($site['title']) ?>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bangers&family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<!-- comic halftone dots used on every lifted puzzle piece -->
<svg class="defs" width="0" height="0" aria-hidden="true" focusable="false">
  <defs>
    <pattern id="dots" width="7" height="7" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#111" fill-opacity=".16"/>
    </pattern>
  </defs>
</svg>

<h1 class="sr-only"><?= e($site['name']) ?>: <?= e($site['title']) ?></h1>

<main id="main" tabindex="-1">
  <div class="stage is-home" id="stage"></div>
  <div class="content measure" id="measure" aria-hidden="true"></div>
</main>

<noscript>
  <div class="noscript">
    <h2><?= e($site['name']) ?></h2>
    <p><?= e($site['title']) ?></p>
    <p>This portfolio is an interactive puzzle and needs JavaScript to run.</p>
    <?php if (!empty($contact['email'])): ?><p><a href="mailto:<?= e($contact['email']) ?>"><?= e($contact['email']) ?></a></p><?php endif; ?>
  </div>
</noscript>

<div class="sr-only" id="live" aria-live="polite"></div>

<p id="load-error" hidden style="max-width:520px;margin:24px auto;padding:0 24px;color:#111">
  The puzzle could not start. Check that the <code>js</code> folder (app.js, geometry.js, layout.js, views.js) is next to index.php, then open the browser console (F12) for the error.
</p>
<script>setTimeout(function(){ if(!document.body.classList.contains('ready')) document.getElementById('load-error').hidden=false; }, 3000);</script>
<script id="puzzle-data" type="application/json"><?= json_encode($puzzleData, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?></script>
<script type="module" src="js/app.js"></script>
</body>
</html>
