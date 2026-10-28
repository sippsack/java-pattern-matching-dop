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
