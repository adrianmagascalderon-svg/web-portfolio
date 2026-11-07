# THE PUZZLE: cartoon portfolio, black & white (PHP)

Homepage: PORTFOLIO sa gitna, hati-hati sa mga tile. Kapag dinaanan ng mouse ang tile, aangat ito at lalabas ang title.
Click para buksan, `Esc` para bumalik. Walang random: laging pareho ang pwesto ng mga tile.

## Ayos ng folder
    WebPortfolio/
      index.php
      data.php          <- DITO mo ie-edit ang lahat ng laman
      contact.php       (hindi ginagamit habang naka-off ang contact form)
      style.css
      .gitignore
      js/  app.js  geometry.js  layout.js  views.js
      images/
        projects/       <- mga larawan ng 6 projects (hanggang 3 bawat isa)
        certificates/   <- mga larawan ng 5 certificates (optional)
        profile/        <- litrato mo (optional)
      videos/           <- video files ng projects (optional, mas mababa sa 10 MB)

## Ano ang ie-edit sa data.php
- `$projects`: 6 projects. `images` = hanggang 3 larawan, `video` = isang YouTube link o video file.
- `$learning['certificates']`: 5 certificates, may title, issuer, date, description at image.
- `$contact`: Facebook (may link), Gmail at contact number (text lang).

## Subukan sa computer
    C:\xampp_new\php\php.exe -S localhost:8000
Buksan ang http://localhost:8000

## Kulay ng shadow
Nasa itaas ng `style.css`: `--shadow: #E11D2E;` (pula). Palitan kung gusto mo ng ibang kulay.

## Deploy
GitHub para sa backup/version, InfinityFree para sa live na PHP site (upload sa `htdocs` gamit ang FTP).
