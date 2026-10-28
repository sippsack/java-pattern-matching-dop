# Pattern Matching und Data-Oriented Programming in Java

Folien zum Vortrag von Falk Sippach:
**Von algebraischen Datentypen und daten-orientierter Programmierung zu Pattern Matching überall**.

Die aktuelle Fassung ist unter
**https://www.sippsack.de/java-pattern-matching-dop/** erreichbar.
Vergangene Vortragsdurchführungen stehen in [events.md](events.md).

## Lokal starten und bauen

Die Folien verwenden [Slidev](https://sli.dev/). Voraussetzung ist Node.js 20
ab 20.19 oder Node.js ab 22.12; GitHub Actions verwendet Node.js 22.

```sh
cd slides
npm ci
npm run dev
```

`npm run build` schreibt die Website nach `slides/dist/`.
`npm run export` erzeugt `slides/pattern-matching-dop.pdf` und benötigt Chromium.
Der PDF-Export ist nicht Teil der Pages-Veröffentlichung.

## Layout

Das Layout folgt dem überarbeiteten Valhalla-Vortrag: Rajdhani für Text,
Fira Code für Code, bündig ausgerichtete gelbe Titelunterstreichungen und
ein Inhaltsbeginn bei 150 Pixeln auf der 960 × 540 großen Folienfläche.
Beide Schriftfamilien werden lokal eingebunden.

`slides/global-top.vue` zeigt auf Inhaltsfolien die graue Seitenleiste mit
embarc-Logo, Website, dem Kurztitel „Pattern Matching und DOP“ und der aktuellen
Foliennummer. Der vollständige Vortragstitel bleibt in den Metadaten erhalten.
Die Titelfolie blendet die Leiste automatisch aus; Kapiteltrenner, Ganzseitenbild
und Spicker-Motiv sind in `slides.md` mit `sidebar: false` markiert. Diese
Markierung auch für neue vollflächige oder dunkle Folien verwenden.
Die Seitenleiste erscheint ebenfalls in der Druck-/PDF-Ansicht.

Gemeinsame Styles für Titel- und Kapiteltrenner liegen in `slides/styles/index.css`,
damit auch direkt aufgerufene Kapitel ohne vorherigen Besuch der Titelfolie
korrekt dargestellt werden. Logo und Spicker-Motiv sind aus dem Referenzvortrag
nach `slides/public/embarc/` übernommen; es gibt keine Laufzeitabhängigkeit
von dessen Verzeichnis. Die veröffentlichte betterCode-Tag-Version bleibt
von diesen Layoutänderungen unberührt.

Beim Wechsel vom Klassendiagramm zu „Das Modell in Code“ wandert das Diagramm
per View Transition verkleinert in die rechte untere Ecke. Die kleine Variante
ist vollständig sichtbar; die große baut sich weiterhin schrittweise auf.
Der Effekt funktioniert auch rückwärts in Browsern mit View-Transition-Unterstützung;
andere Browser wechseln ohne Morph-Effekt. Bei reduzierten Bewegungen entfällt
die lange Animation.

## Java-Beispiele und lokale JShell

Auf „Das Modell in Code“ erscheint der Codeblock mit dem ersten Klick,
der Text darunter mit dem zweiten. Das kleine Diagramm ist sofort sichtbar.
Die Schaltfläche **▶** am Codeblock öffnet die JShell-Ansicht und führt das
Beispiel lokal aus. Links lässt sich der Code bearbeiten, rechts stehen Ausgabe
und Compilerdiagnosen. **Run** oder **Strg/⌘ + Enter** führt den gesamten Inhalt
in einer frischen JShell aus. **Esc** schließt die Ansicht.

Die Integration übernimmt die Ausführungsbrücke und Bedienung aus dem
`java-sandbox`-Prototyp des Valhalla-Vortrags.
Sie benötigt ein lokales JDK ab Java 17 mit `jdk.jshell`. Beim Start von
`npm run dev` werden die üblichen JDK-Verzeichnisse durchsucht; das höchste
gefundene JDK ist vorausgewählt. Andere erkannte JDKs lassen sich im Dialog
auswählen. Zusätzliche Installationen können über `JAVA_SANDBOX_HOME` oder
`JAVA_SANDBOX_JDKS` (JSON-Array absoluter JDK-Home-Pfade) in `slides/.env.local`
angegeben werden. Die erkannte Liste wird in dieser Git-ignorierten Datei
gespeichert. `--enable-preview` ist wie im Prototyp umschaltbar, für dieses
Modell aber nicht erforderlich.

Die Zielauswahl enthält außerdem **dev.java** und **Java Almanac · JDK 28**.
Die Auswahl allein sendet keinen Code. Erst **Run** überträgt den Editorinhalt
über den lokalen Dev-Server zum gewählten Anbieter. Ausschließlich öffentlichen,
nicht vertraulichen Code verwenden. dev.java aktiviert Preview fest; bei
Java Almanac ist Preview umschaltbar. Java Almanac verwendet dieselbe
JShell-Auswertung wie lokal, damit auch Records und Sealed-Hierarchien mit
Vorwärtsreferenzen funktionieren.

Wurde `vite.config.ts` bei bereits laufendem Slidev hinzugefügt, muss der
Dev-Server einmal beendet und mit `npm run dev` neu gestartet werden.
Eine fehlende Brücke (HTTP 404) ist keine fehlgeschlagene JDK-Erkennung;
der Dialog zeigt in diesem Fall einen ausdrücklichen Neustarthinweis.

Das Beispiel liegt in
`slides/demos/01-Medikationsplan-01-Datenmodell.java` und wird über
`sandbox: 01-Medikationsplan` im Folien-Frontmatter eingebunden.
Die Datei ist die gemeinsame Quelle für Folie und Editor.
Das Namensmuster lautet `<Demo-Nr>-<Thema>-<Varianten-Nr>-<Beschreibung>.java`.
Es gibt die Reiter **Datenmodell** und **Beispieldaten**. Der zweite lädt
`01-Medikationsplan-02-Beispieldaten.java` mit drei Medikamenten für einen Plan
und gibt diese aus. Weitere nummerierte Dateien ergänzen die Auswahl automatisch.
Ein Klick auf einen Reiter lädt dessen Originalcode und führt ihn neu aus.

Die erste Zeile `// @setup 01-Medikationsplan-01-Datenmodell.java` im
Beispieldaten-Snippet lädt die Typdefinitionen vor dem sichtbaren Code in dieselbe
frische JShell. Der Verweis wird aus dem Editor entfernt; auch erfolgreiche
Setup-Ausgaben werden nicht angezeigt. Setup-Fehler bleiben sichtbar.
So ist der zweite Reiter unabhängig davon ausführbar, ob der erste zuvor
gestartet wurde. Lokal und bei Java Almanac wird das Setup vor dem Beispiel
vollständig geprüft. dev.java erhält beide Teile in einer Anfrage;
die Setup-Ausgaben werden anhand der Zeilenzuordnung ausgeblendet.
Setup-Dateien müssen direkt unter `slides/demos/` liegen; verschachtelte
`@setup`-Verweise sind nicht erlaubt. „Unsichtbar“ ist nur eine Anzeigeoption,
keine Geheimhaltung: Externe Anbieter erhalten auch den Setup-Code.
Vorwärtsreferenzen in der Sealed-Hierarchie werden erst nach dem Einlesen
aller Deklarationen auf Vollständigkeit geprüft.

Die Brücke bindet nur an `127.0.0.1` und akzeptiert ausschließlich
gleichursprüngliche lokale Anfragen. **Sie ist keine isolierte Sicherheits-Sandbox:**
Java-Code läuft mit den Rechten des lokalen Benutzers. Nur vertrauenswürdigen
Code ausführen und den Server nicht per Tunnel oder Netzwerk freigeben.
Anfragen und Ausgaben sind größenbegrenzt; nach zehn Sekunden wird die
Ausführungs-JVM beendet. Bei Auswahl eines lokalen JDKs wird kein Code an
externe Dienste übertragen.

Auf GitHub Pages bleibt der Code sichtbar und der Dialog zeigt einen expliziten
Hinweis auf den nötigen lokalen Dev-Server; Run ist dort für alle Ziele deaktiviert.
Die externen Anbieter bleiben auswählbar und über „Anbieter öffnen“ erreichbar.
Build und PDF benötigen kein JDK. Im PDF bleiben nur die Codebeispiele, nicht
die interaktiven Bedienelemente.

Tests für Demoauflösung, JDK-Erkennung und lokale Ausführung:

```sh
cd slides
npm run test:sandbox
```

## GitHub Pages

GitHub Pages ist im Repository unter **Settings → Pages → Source: GitHub Actions**
konfiguriert. Die Domain `www.sippsack.de` wird von der Benutzerwebsite geerbt;
dieses Repository benötigt keine eigene `CNAME`-Datei.

Unter **Settings → Environments → github-pages → Deployment branches and tags**
sind der Branch `main` und Tags nach `published/*` freigegeben. Ohne die
Tag-Freigabe blockiert GitHub das Deployment des Tag-Workflows trotz erfolgreichem
Build.

Für direkte Folienlinks erzeugt der Build statische Einstiegspunkte, auch für
Präsentations-, Übersichts- und Druckansicht. GitHub Pages kann so jede
Vortragsversion ohne Rückgriff auf die `404.html` der aktuellen Fassung öffnen.
Dabei kann Pages einen abschließenden Schrägstrich an die URL anhängen.

Der Workflow **Publish slides to GitHub Pages** baut und veröffentlicht bei
Änderungen unter `slides/`, an den Veröffentlichungsworkflows oder am
Buildskript auf `main`. Er kann auch manuell gestartet werden.

Jede Veröffentlichung baut `main` im Hauptverzeichnis und sämtliche vorhandenen
`published/*`-Tags in eigenen Unterverzeichnissen. Jeder Tag wird aus seinem
Git-Stand einschließlich Lockfile, Komponenten und Bildern gebaut. So bleiben
veröffentlichte Vortragsfassungen auch nach späteren Änderungen auf `main`
erreichbar. Sie werden bei jedem Deployment neu gebaut, nicht aus alten
Pages-Artefakten kopiert.

## Eine Vortragsfassung veröffentlichen

Zuerst alle zur Fassung gehörenden Dateien committen, danach ein annotiertes Tag
nach dem Muster `published/JJJJ-MM-TT-veranstaltung` anlegen und pushen:

```sh
git tag -a published/2026-10-13-bettercode-java \
  -m "betterCode Java, 13. Oktober 2026"
git push origin main
git push origin published/2026-10-13-bettercode-java
```

Der Workflow **Publish tagged slides to GitHub Pages** startet bei jedem Push
eines solchen Tags, unabhängig davon, ob dessen Commit neue Folienänderungen
enthält. Der Teil nach `published/` wird zum URL-Verzeichnis:

**https://www.sippsack.de/java-pattern-matching-dop/2026-10-13-bettercode-java/1**

Versionsnamen dürfen Buchstaben, Ziffern, Punkte, Bindestriche und Unterstriche
enthalten und müssen mit einem Buchstaben oder einer Ziffer beginnen.
Veröffentlichte Tags nicht verschieben, damit die Vortragsfassung erhalten bleibt.
Ein gelöschtes Tag wird beim nächsten Deployment nicht mehr veröffentlicht;
die Tag-Löschung selbst startet kein Deployment.

Ein Tag-Push kann nur Workflows auslösen, die bereits im getaggten Stand
vorhanden sind. Bei Tags auf älteren Ständen ohne Workflow die Veröffentlichung
manuell auf `main` starten.

Den vollständigen Pages-Build lokal vom Repositorywurzelverzeichnis aus prüfen:

```sh
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
PAGES_BASE_PATH=/java-pattern-matching-dop \
bash .github/scripts/build-slides-pages.sh
```

Das Zielverzeichnis `pages-dist/` darf vorher nicht existieren. Es enthält danach
die aktuelle Fassung und alle Tag-Versionen. Build-Ausgaben und IDE-Dateien werden
nicht versioniert.
