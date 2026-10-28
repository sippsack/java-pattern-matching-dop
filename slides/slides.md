---
theme: none
title: Von algebraischen Datentypen und daten-orientierter Programmierung zu Pattern Matching überall
author: Falk Sippach
canvasWidth: 960
aspectRatio: 16/9
colorSchema: light
mdc: true
transition: none
fonts:
  sans: Rajdhani
  mono: Fira Code
  provider: none
layout: cover
image: /duke/duke-shapes.png
---

# Von algebraischen Datentypen und daten-orientierter Programmierung zu Pattern Matching überall

::author::

**Falk Sippach**

<span class="sub">embarc · @sippsack</span>

::date::

28.10.2026 · JUG Nürnberg

<!--
Titelfolie. TODO: Event/Konferenz und Datum eintragen, ggf. Event-Logo ergänzen.
-->

---
layout: bio
hide: true
---

---
layout: community
---

---
class: community-maps-slide
---

<CommunityMaps />

<!--
Links: die Standorte der Java User Groups im iJUG.
Per Klick rechts: dieselbe Region mit den Gruppen, bei denen ich schon zu Gast war, in Rot.
Die Nummerierung stammt aus den jeweiligen Karten und ist nicht identisch.
Konferenztourist und JUG-süchtig: Die Community lebt vom persönlichen Austausch vor Ort.
-->

---

# Agenda

<div class="agenda">
  <div v-click><b>01</b> Einleitung: DOP, Pattern Matching, ADTs</div>
  <div v-click><b>02</b> Features: von Switch Expressions bis Primitive Patterns</div>
  <div v-click><b>03</b> Live-Coding</div>
  <div v-click><b>04</b> Fazit: Was fehlt noch? Was ist in Arbeit?</div>
</div>

<style>
.agenda { margin-top: 10px; }
.agenda div { margin: 18px 0; font-size: 34px; }
.agenda b { color: var(--red); display: inline-block; width: 70px; font-size: 40px; }
</style>

<!--
Kurzer Überblick. Abstract abdecken: Pattern Matching als Voraussetzung für DOP, ADTs, Trennung von Daten und Verhalten,
heutiger Stand (Switch Expressions, Records, Sealed Classes, Type/Record/Unnamed Patterns, Primitive Patterns) und der Ausblick
(Carrier Classes, (De-)Serialisierung).
-->

---
layout: section
number: '01'
sidebar: false
image: /duke/duke-shapes.png
---

# Einleitung

DOP, Pattern Matching, ADTs

---
transition: view-transition
---

# Unser Beispiel: ein Medikationsplan

<div class="medication-model-morph"><ModelDiagram /></div>

<p class="source tiny muted" style="bottom:10px">Alle Werte frei erfunden, keine medizinische Beratung.</p>

<!--
Durchklicken:
- Ein Plan gehört zu einem Patienten und besteht aus Medikamenten.
- Jedes Medikament ist ein Wirkstoff (Drug) aus wenigen bekannten ...
- ... mit einer Dosierung: entweder Tabletten (morgens, mittags, abends) oder eine Infusion (Geschwindigkeit, Dauer).
- Die beiden Dosierungen sind Alternativen: nie beides, nie keines.
Blau = kombiniert mehrere Werte (Produkt), gelb = Auswahl zwischen Alternativen (Summe).
-->

---
class: code-sm model-in-code
sandbox: 01-Medikationsplan
---

# Das Modell in Code

<JavaSandboxCode v-click :inert="$clicks < 1 || undefined" />

<div class="medication-model-morph model-thumbnail"><ModelDiagram :animated="false" /></div>

<!--
Das ganze Diagramm als Java-Code. Nicht jedes Schlüsselwort erklären: wir nehmen die Teile gleich einzeln auseinander.
Modernes Java: Records, Sealed Types, ...
Der Code spiegelt das Diagramm fast 1:1. Beim Folienwechsel schrumpft das Diagramm nach rechts unten.
Erster Klick: Code einblenden. Über ▶ die lokale JShell öffnen und das Beispiel ausführen.
-->

---

# Inspiriert von

<div class="inspiration">
<a class="inspiration-screenshot" href="https://funktionale-programmierung.de/2024/11/25/sums-products.html" target="_blank" rel="noopener noreferrer">
  <img src="/sources/sums-products.png" alt="Screenshot des Blogartikels Datenmodellierung mit Summen und Produkten von Michael Sperber und Stefan Wehr" />
</a>
<div class="inspiration-concepts">
<div v-click class="inspiration-concept">
  <span class="inspiration-symbol inspiration-product" aria-hidden="true">×</span>
  <p><b>Produkte</b><br />sind <strong>„Und“-Daten</strong><small>z. B. Records</small></p>
</div>
<div v-click class="inspiration-concept">
  <span class="inspiration-symbol inspiration-sum" aria-hidden="true">+</span>
  <p><b>Summen</b><br />sind <strong>„Oder“-Daten</strong><small>z. B. Sealed Classes</small></p>
</div>
</div>
</div>

<p class="source"><a href="https://funktionale-programmierung.de/2024/11/25/sums-products.html">https://funktionale-programmierung.de/2024/11/25/sums-products.html</a></p>

<style>
.inspiration {
  display: grid;
  grid-template-columns: 530px 1fr;
  gap: 24px;
  align-items: start;
}
.inspiration-screenshot {
  display: block;
  overflow: hidden;
  border: 1px solid #ddd !important;
  border-radius: 8px;
  box-shadow: 0 4px 14px #0002;
}
.inspiration-screenshot img {
  display: block;
  width: 100%;
}
.inspiration-concepts {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  text-align: center;
}
.inspiration-concept {
  width: 100%;
}
.inspiration-symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  font: 600 34px/1 'Rajdhani', sans-serif;
  color: var(--ink);
}
.inspiration-product { background: #46afe2; }
.inspiration-sum { background: var(--yellow); }
.inspiration-concept p {
  margin: 6px 0 0;
  font-size: 30px;
  line-height: 1.15;
}
.inspiration-concept strong {
  font-weight: 600;
}
.inspiration-concept small {
  display: block;
  margin-top: 5px;
  font-size: 22px;
  color: var(--muted);
}
</style>

<!--
Screenshot der deutschen Fassung des verlinkten Blogartikels, aufgenommen am 28.10.2026.
Genau das, was im Diagramm blau (Produkt) und gelb (Summe) eingefärbt ist.
Produkte und Summen sind die zwei Grundwerkzeuge für gute Datenmodelle.
-->

---

# Data-Oriented Programming

<div class="dop-principles">
  <div v-click class="dop-principle">
    <svg viewBox="0 0 64 64" aria-hidden="true"><rect x="14" y="10" width="36" height="44" rx="5" /><path d="M23 23h18M23 32h18M23 41h12" /></svg>
    <h2>Daten zuerst</h2>
    <p>Präzise &amp; unveränderlich</p>
  </div>
  <div v-click class="dop-principle">
    <svg viewBox="0 0 64 64" aria-hidden="true"><path d="m22 18-14 14 14 14M42 18l14 14-14 14M37 12 27 52" /></svg>
    <h2>Operationen separat</h2>
    <p>Daten → Daten</p>
  </div>
  <div v-click class="dop-principle">
    <svg viewBox="0 0 64 64" aria-hidden="true"><rect x="4" y="23" width="14" height="18" rx="3" /><rect x="46" y="23" width="14" height="18" rx="3" /><path d="M18 32h28m-8-8 8 8-8 8" /></svg>
    <h2>Programme als Fluss</h2>
    <p>Rein → Verarbeiten → Raus</p>
  </div>
</div>

<style>
.dop-principles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  align-items: center;
  min-height: 300px;
  text-align: center;
}
.dop-principle svg {
  width: 76px;
  height: 76px;
  margin: 0 auto 24px;
  fill: none;
  stroke: var(--ink);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.dop-principle h2 { font-size: 30px; }
.dop-principle p { margin-top: 12px; font-size: 23px; color: var(--muted); }
</style>

<!--
Daten zuerst: präzise, unveränderlich, transparent modellieren.
Operationen danach: getrennte Funktionen von Daten zu Daten.
Programme als Produktionsstraße: Daten fließen rein, werden transformiert und fließen wieder raus.

Das ist die Idee hinter dem Beispiel. Daten sind nur Daten, die Operationen leben neben den Typen, nicht darin.
Funktioniert am besten in kleineren (Teil-)Systemen, die Eingaben in Ausgaben umwandeln: Batch, Event Processing, Analyse/Transformation von Strukturen.
Wann DOP sinnvoll ist und welche Leitlinien dahinterstehen, kommt nach den Sprachfeatures.
-->

---

# Javas Werkzeugkasten für DOP

<div class="grid-3 dop-toolbox">
  <div v-click class="card">
    <span class="toolbox-symbol" aria-hidden="true">×</span>
    <h2>Records</h2>
    <p class="small">Daten als Daten<br />(Produkttypen)</p>
    <p class="toolbox-examples"><code>Tablet</code>, <code>Infusion</code><br /><code>Medication</code></p>
  </div>
  <div v-click class="card yellow">
    <span class="toolbox-symbol" aria-hidden="true">+</span>
    <h2>Sealed Types</h2>
    <p class="small">Alternativen<br />(Summentypen)</p>
    <p class="toolbox-examples"><code>Dosage</code></p>
  </div>
  <div v-click class="card teal">
    <svg class="toolbox-symbol" viewBox="0 0 64 64" aria-hidden="true"><path d="m22 18-14 14 14 14M42 18l14 14-14 14M37 12 27 52" /></svg>
    <h2>Pattern Matching</h2>
    <p class="small">Operationen<br />auf Daten</p>
    <p class="toolbox-examples"><code>describe(Dosage)</code></p>
  </div>
</div>

<style>
.dop-toolbox {
  min-height: 320px;
  align-items: center;
}
.dop-toolbox .card {
  box-sizing: border-box;
  height: 260px;
  padding: 18px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.dop-toolbox .toolbox-symbol {
  flex: none;
  width: 42px;
  height: 42px;
  box-sizing: content-box;
  padding: 5px 12px;
  margin-top: -5px;
  margin-bottom: 10px;
  border-radius: 10px;
  background: rgb(255 255 255 / 45%);
  font: 600 42px/1 'Rajdhani', sans-serif;
}
.dop-toolbox svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.dop-toolbox h2 { font-size: 30px; margin: 0; }
.dop-toolbox .small { font-size: 23px; line-height: 1.25; margin: 10px 0 0; }
.dop-toolbox .toolbox-examples {
  margin: 16px 0 0;
  font-size: 17px;
  line-height: 1.8;
  color: var(--muted);
}
</style>

<!--
Schauen wir sie uns einzeln an.
Jedes Feature ist einzeln nützlich, zusammen verändern sie, wie wir Daten modellieren und verarbeiten.
Records + Sealed Types = was funktionale Sprachen algebraische Datentypen nennen (gleich mehr).
Vorgehen: erst die kleinen Features (Switch Expressions, Records, Type Patterns, Sealed Types), dann Pattern Matching obendrauf, dann die Frage, wie sich das Design verändert.
-->

---

# Das Problem

<table class="dop-problems">
<thead>
  <tr><th>Klassische Fallunterscheidung</th><th>Ein Modell für alles</th></tr>
</thead>
<tbody>
  <tr>
    <td>
      <ul>
        <li v-click><code>if</code>-<code>else</code>-Ketten mit <code>instanceof</code> und Casts</li>
        <li v-click><code>switch</code> mit <code>break</code>, Fall-through und <code>default</code></li>
        <li v-click>Neue Fälle fallen niemandem auf</li>
      </ul>
    </td>
    <td>
      <ul>
        <li v-click>Ein Typ mit vielen optionalen Feldern</li>
        <li v-click>Ungültige Zustände sind darstellbar</li>
        <li v-click>Fehler zeigen sich erst <b>zur Laufzeit</b></li>
      </ul>
    </td>
  </tr>
</tbody>
</table>

<style>
.dop-problems { table-layout: fixed; }
.dop-problems th { width: 50%; }
.dop-problems td { vertical-align: top; }
.dop-problems ul { margin: 0; padding-left: 24px; }
.dop-problems li { margin: 14px 0; line-height: 1.4; }
</style>

<!--
Bei komplexeren Modellen werden klassische Fallunterscheidungen schnell unübersichtlich, und ungültige Zustände werden oft erst spät zur Laufzeit sichtbar.
Ziel: Unterschiede zwischen Daten explizit machen, Verarbeitung klarer und robuster, mit Compiler-Unterstützung.
-->

---

# Produkte: dies und das

<div class="adt-equation">
  <span class="adt-node adt-product">Medication</span>
  <span>=</span>
  <span v-click class="adt-equation-part"><span class="adt-node adt-sum">Drug</span><b>×</b><span class="adt-node adt-sum">Dosage</span></span>
</div>

<div v-click class="adt-product-example">
<div class="adt-combinations">
  <span></span><b>Tablet 1 0 1</b><b>Infusion 50 30</b>
  <b>Paracetamol</b><span>●</span><span>●</span>
  <b>Ibuprofen</b><span>●</span><span>●</span>
  <b>Caffeine</b><span>●</span><span>●</span>
</div>
<div class="adt-count"><b>3 × 2 = 6</b><span>Kombinationen</span><small>Vereinfachte Auswahl</small></div>
</div>

<div v-click class="adt-haskell">

```haskell
data Medication = Medication Drug Dosage
```

<img class="haskell-logo" src="/sources/haskell-logo.svg" alt="Haskell" />

</div>

<!--
## Einstieg – nur Medication sichtbar

Wir haben gerade Records und Sealed Types als Werkzeuge gesehen. Jetzt schauen wir auf die Idee dahinter.
Was brauchen wir, um eine Medikation zu beschreiben?

## Klick 1 – Drug × Dosage

Einen Wirkstoff UND eine Dosierung. Beides gehört gleichzeitig zu einer Medikation.
Zum Beispiel: Ibuprofen und eine Tablettendosierung morgens und abends.
Genau dieses Zusammenfassen nennen wir einen Produkttyp.

## Klick 2 – Raster und 3 × 2 = 6

Warum ausgerechnet Produkt? Nehmen wir unsere drei Wirkstoffe und beschränken uns
für einen Moment auf diese zwei konkreten Dosierungen. Jeden Wirkstoff können wir
mit jeder Dosierung kombinieren. Drei mal zwei ergibt sechs mögliche Kombinationen.

Das ist nur eine vereinfachte Auswahl, keine medizinische Aussage.
Entscheidend ist: Bei Und-Daten multiplizieren sich die Möglichkeiten.

Eine Zeile des Rasters mit dem Finger verfolgen: ein Wirkstoff, zwei Kombinationen.
Das Raster zeigt nicht sämtliche Werte unseres echten Dosage-Typs.

## Klick 3 – Haskell-Code

In Haskell lässt sich das sehr knapp hinschreiben. Keine Sorge, wir lernen jetzt nicht Haskell.
Hier steht einfach: Eine Medication enthält einen Drug und eine Dosage.
In Java haben wir dafür unseren Record.

Bei Bedarf: Links vom Gleichheitszeichen steht der Typname; rechts der gleichnamige
Konstruktor mit seinen Komponenten. Die Komponenten stehen nebeneinander.

## Übergang

Das erklärt das Und. Aber eine Dosierung kann unterschiedliche Formen haben.
Damit kommen wir zum Oder.
-->

---

# Summen: dies oder das

<div class="adt-equation">
  <span class="adt-node adt-sum">Dosage</span>
  <span>=</span>
  <span v-click class="adt-equation-part"><span class="adt-node adt-product">Tablet</span><b>+</b><span class="adt-node adt-product">Infusion</span></span>
</div>

<div class="adt-alternatives">
  <div v-click class="adt-alternative"><svg class="adt-choice" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" /><text x="20" y="21">1</text></svg><code>Tablet 1 0 1</code></div>
  <b v-click="3">oder</b>
  <div v-click="3" class="adt-alternative"><svg class="adt-choice" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" /><text x="20" y="21">2</text></svg><code>Infusion 50 30</code></div>
</div>

<div v-click="4" class="adt-haskell adt-haskell-centered">

```haskell
data Dosage
  = Tablet Int Int Int
  | Infusion Int Int
```

<img class="haskell-logo" src="/sources/haskell-logo.svg" alt="Haskell" />

</div>

<!--
## Einstieg – nur Dosage sichtbar

Was kann eine Dosierung in unserem Modell sein?

## Klick 1 – Tablet + Infusion

Entweder eine Tablettendosierung ODER eine Infusion.
Ein einzelner Wert wählt eine dieser Alternativen. Er ist nicht beides gleichzeitig.

## Klick 2 – konkreter Tablet-Wert

Hier ist die erste Form: eine Tablette morgens, keine mittags, eine abends.

## Klick 3 – konkreter Infusion-Wert

Und hier die andere Form: eine Infusion mit Geschwindigkeit und Dauer.
Andere Form, andere Bestandteile – aber beides ist eine Dosage.

Warum Summe? Wir nehmen alle möglichen Tablettendosierungen PLUS alle möglichen
Infusionsdosierungen. Zusammen ergeben sie die möglichen Dosierungen.
Der Typ sagt weiterhin eindeutig, welche Alternative vorliegt.
Auch bei gleichen Zahlen bleiben die Alternativen durch ihre Konstruktoren unterscheidbar.

## Klick 4 – Haskell-Code

Der senkrechte Strich bedeutet hier Oder. Und innerhalb jeder Alternative sehen wir
wieder Und: Eine Tablettendosierung hat drei Zahlen, eine Infusion zwei.

In Java beschreiben wir diese geschlossene Auswahl mit einem Sealed Type und seinen Varianten.
Ein Enum ist der einfache Fall: feste Alternativen ohne weitere Bestandteile.
Int ist hier der Einfachheit halber der Haskell-Zahlentyp; es geht um die Struktur, nicht um Zahlenbereiche.

## Übergang

Jetzt haben wir beide Bausteine. Interessant wird es, wenn wir sie ineinanderstecken.
-->

---

# Algebraische Datentypen

<div class="adt-composition">
<div class="adt-tree">
  <div class="adt-node adt-product">Medication</div>
  <div v-click class="adt-tree-level">
    <svg class="adt-product-branches" viewBox="0 0 340 48" aria-hidden="true"><path d="M140 3 62 43m1-9-1 9 9 1M200 3l67 40m-9 0 9 0-1-9" /></svg>
    <div><div class="adt-node adt-sum">Drug</div></div>
    <b>×</b>
    <div><div class="adt-node adt-sum">Dosage</div></div>
  </div>
  <div v-click class="adt-tree-variants">
    <svg class="adt-branch" viewBox="0 0 340 40" aria-hidden="true"><path d="M267 0v12H165v23m102-23h22v23m-129-6 5 6 5-6m114 0 5 6 5-6" /></svg>
    <span class="adt-node adt-product">Tablet</span><b>+</b><span class="adt-node adt-product">Infusion</span>
  </div>
</div>
<div v-click="4" class="adt-haskell">

```haskell
data Drug
  = Paracetamol | Ibuprofen | Caffeine

data Dosage
  = Tablet Int Int Int
  | Infusion Int Int

data Medication = Medication Drug Dosage
```

<img class="haskell-logo" src="/sources/haskell-logo.svg" alt="Haskell" />

</div>
</div>

<p v-click="3" class="adt-takeaway"><b>Algebraische Datentypen sind zusammengesetzte Datentypen:</b><br />die Verbindung von <strong>Und-</strong> und <strong>Oder-Daten</strong>.</p>

<!--
## Einstieg – Medication

Wir müssen dafür kein neues Beispiel erfinden. Unser Medikationsmodell macht das bereits.

## Klick 1 – Drug × Dosage

Oben steht das Und: Eine Medikation enthält einen Wirkstoff und eine Dosierung.

## Klick 2 – Tablet + Infusion

Eine Ebene darunter steckt das Oder: Die Dosierung ist eine Tablettendosierung
oder eine Infusion. Und deren einzelne Felder bilden wieder Produkte.

Wir kombinieren also nicht nur Werte, sondern auch die beiden Arten, Datentypen zu bauen.
Auf den Dosage-Zweig zeigen: Die beiden unteren blauen Boxen gehören nur zu diesem Zweig.
Drug ist ebenfalls eine Summe; seine Alternativen folgen im Code.

## Klick 3 – Merksatz

Algebraische Datentypen sind zusammengesetzte Datentypen: die Verbindung von Und- und Oder-Daten.
In Java bauen wir sie mit Records, Sealed Types und Enums.

## Klick 4 – vollständiger Haskell-Code mit Logo

Rechts sehen wir unser Modell noch einmal kompakt: drei Wirkstoffalternativen,
zwei Dosierungsformen und die Kombination aus Wirkstoff und Dosierung.
Überall dieselben zwei Bausteine: nebeneinander für Und, senkrechter Strich für Oder.

Diese Produkte und Summen geben den algebraischen Datentypen ihren Namen.
Keine Haskell-Einführung: Konstruktoren erzeugen Werte und machen die Alternativen unterscheidbar.

## Übergang zu Pattern Matching

Damit können wir präzise beschreiben, welche Formen unsere Daten haben dürfen.
Jetzt müssen wir diese Formen wieder erkennen und an ihre Bestandteile kommen.
Genau dafür brauchen wir Pattern Matching.
-->

---

# Was ist Pattern Matching?

<div class="pattern-flow">
  <div class="pattern-stage">
    <span class="pattern-label">Wert</span>
    <div class="adt-node adt-product">Infusion <b>50</b> <b>30</b></div>
  </div>
  <div v-click class="pattern-step">
    <span class="pattern-arrow" aria-hidden="true">→</span>
    <div class="pattern-stage">
      <span class="pattern-label">Prüfen &amp; zerlegen</span>
      <div class="adt-node adt-product">Infusion speed duration</div>
      <div class="pattern-bindings"><span>speed = <b>50</b></span><span>duration = <b>30</b></span></div>
    </div>
  </div>
  <div v-click class="pattern-step">
    <span class="pattern-arrow" aria-hidden="true">→</span>
    <div class="pattern-stage">
      <span class="pattern-label">Weiterverwenden</span>
      <div class="pattern-result">„50 ml/h for 30 min“</div>
    </div>
  </div>
</div>

<div v-click class="adt-haskell pattern-haskell">

```haskell
describe :: Dosage -> String
describe (Tablet morning midday evening) =
  "Tablets: " ++ show (morning, midday, evening)
describe (Infusion speed duration) =
  show speed ++ " ml/h for " ++ show duration ++ " min"
```

<img class="haskell-logo" src="/sources/haskell-logo.svg" alt="Haskell" />

</div>

<style>
.pattern-flow {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 12px;
  margin: 12px 0 30px;
}
.pattern-stage { text-align: center; }
.pattern-label { display: block; margin-bottom: 12px; font-size: 22px; color: var(--muted); }
.pattern-step { display: flex; align-items: flex-start; gap: 12px; }
.pattern-arrow { margin-top: 40px; font-size: 30px; }
.pattern-flow .adt-node { padding: 12px; font-size: 23px; white-space: nowrap; }
.pattern-bindings { display: flex; justify-content: center; gap: 16px; margin-top: 12px; font-size: 20px; }
.pattern-bindings b { background: var(--yellow); border-radius: 4px; padding: 0 5px; }
.pattern-result { padding: 12px; border-radius: 10px; background: var(--teal); font-size: 23px; white-space: nowrap; }
.pattern-haskell { max-width: 720px; margin-inline: auto; }
</style>

<!--
## Einstieg – konkreter Wert

Wir haben die möglichen Formen unserer Daten beschrieben. Jetzt drehen wir die Richtung um:
Vor uns liegt ein konkreter Wert, Infusion 50 30. Wie kommen wir an seine Bestandteile?

## Klick 1 – prüfen und zerlegen

Das Muster Infusion speed duration prüft den Konstruktor: Ist der Wert eine Infusion?
Wenn ja, werden seine beiden Bestandteile direkt an Namen gebunden:
speed bekommt 50, duration bekommt 30.
Pattern Matching verbindet also Test und Extraktion. Kein separater Cast, keine Getter-Kette.
Die Namen im Muster sind neue Variablen, keine Vergleiche mit bereits vorhandenen Werten.

## Klick 2 – weiterverwenden

Die gebundenen Werte können wir unmittelbar verwenden, hier für eine Beschreibung.
Aus 50 und 30 entsteht der Text „50 ml/h for 30 min“.

## Klick 3 – Haskell-Code

Die Signatur sagt: describe bildet eine Dosage auf einen String ab.
Die beiden Funktionsgleichungen behandeln die zwei möglichen Formen:
Tablet mit drei Bestandteilen und Infusion mit zwei.
Haskell wählt die erste passende Gleichung. Die Infusion passt nicht zur Tablet-Zeile,
sondern zur Infusion-Zeile. Deren Muster bindet speed und duration wie eben im Diagramm.
show wandelt die Zahlen in Text um, ++ verbindet die Textteile.
Das Tablet-Muster führt dasselbe Prinzip für die andere Variante vor.

Beide Konstruktoren sind abgedeckt. GHC kann mit -Wincomplete-patterns vor fehlenden
Fällen warnen; mit -Werror=incomplete-patterns werden diese Warnungen zu Fehlern.
Nicht behaupten, dass Haskell unvollständige Muster grundsätzlich als Compilerfehler ablehnt.
Diese Verbindung aus präzisem Datenmodell und passenden Operationen ist die Grundlage
für datenorientierte Programmierung. Jetzt schauen wir auf Javas Werkzeuge dafür.
-->

---
layout: section
number: '02'
sidebar: false
image: /duke/duke-features.png
---

# Features

Von Switch Expressions bis Primitive Patterns

---
class: code-xs compact-code
sandbox: 02-KlassischerSwitch
sandboxRun: |
  categoryOld(Drug.PARACETAMOL);
  categoryOld(Drug.IBUPROFEN);
  categoryOld(Drug.CAFFEINE);
---

# Der klassische `switch`

<JavaSandboxCode class="feature-sandbox-code" />

<v-clicks>

- Statement, veränderliche Variable, `break`, Fall-through
- `default` versteckt später hinzugefügte Fälle

</v-clicks>

<!--
Kürzungskandidat, wenn die Zeit knapp wird.
Der Ausgangspunkt ist das Enum Drug: fester Satz Optionen, jeder soll auf etwas abgebildet werden.
Das vergessene break fällt stillschweigend durch. Und das default, das den Compiler beruhigt, verschluckt auch jede später ergänzte Konstante.
-->

---
sandbox: 03-SwitchExpressions
sandboxRun: |
  category(Drug.PARACETAMOL);
  category(Drug.IBUPROFEN);
  category(Drug.CAFFEINE);
---

# Switch Expressions <span class="badge" style="background:var(--teal)">Java 14</span>

<JavaSandboxCode class="feature-sandbox-code" />

<v-clicks>

- Ein **Ausdruck**: liefert einen Wert
- Kein Fall-through, kein `break`
- Vollständig geprüft: kein `default` nötig ⇝ neuer `Drug`-Typ führt zu Compiler Fehler (und das ist gut so!)

</v-clicks>

<!--
Eigenständiger Nutzen: sichere Ausdrücke. Kein halb initialisierte Variable. Die Pfeilform fällt nie durch, "case A, B" gruppiert.
Bei Enums prüft der Compiler Vollständigkeit ohne default. Wird Drug.ASPIRIN ergänzt, kompiliert jeder solche Switch nicht mehr.
(Mehrere Statements pro Zweig: Block mit yield.)
-->

---
sandbox: 04-Records
---

# Records: Data Carriers <span class="badge" style="background:var(--teal)">Java 16</span>

<JavaSandboxCode class="feature-sandbox-code" />

<v-clicks>

- **Transparent:** der Zustand *ist* die Komponentenliste
- **Unveränderlich:** keine Setter, finale Felder
- Konstruktor, Accessors, `equals`, `hashCode`, `toString` gratis

</v-clicks>

<!--
Zurück zu den blauen Boxen. Eigenständiger Nutzen: transparente, unveränderliche Datenträger ohne Boilerplate.
Records sind final und können Interfaces implementieren, aber nicht von Klassen erben und keine zusätzlichen Instanzfelder haben.
"Ändern" heißt neu erzeugen.
-->

---
class: code-xs
sandbox: 05-Records
sandboxRun: |
  new Tablet(1, 0, 1);
  var source = new ArrayList<Medication>();
  var plan = new MedicationPlan("Erika Muster", source);
  source.add(new Medication(Drug.IBUPROFEN, new Tablet(1, 0, 1)));
  plan.medications(); // remains empty: defensive copy
  new Tablet(-1, 0, 1); // IllegalArgumentException
---

# Records: Validierung und Invarianten

<JavaSandboxCode class="feature-sandbox-code" />

<v-clicks>

- Compact Constructor ⇝ ungültige Daten können nicht existieren
- Records sind nur *flach* unveränderlich ⇝ `List.copyOf`

</v-clicks>

<!--
Records sind transparent, aber nicht naiv: der Compact Constructor läuft vor der Feldzuweisung, also der richtige Ort, ungültige Werte abzulehnen.
Jeder Typ schützt seine eigenen Invarianten (gleiches gilt für Infusion), danach muss keine Operation neu prüfen.
List.copyOf: defensive Kopie, kopiert nicht, wenn die Liste schon unveränderlich ist.
Kürzungskandidat: Infusion/Immutability nur mündlich erwähnen.
-->

---
sandbox: 06-Dosage
---

# Welche Dosierungen sind gültig?

<JavaSandboxCode class="feature-sandbox-code" />

<p v-click class="card pink center">Ein Typ für alles ⇝ ungültige Zustände sind <b>darstellbar</b></p>

<!--
Die gelbe Dosage: Tabletten ODER Infusion. Der naive Versuch ist ein Record mit allen Feldern und null für Unpassendes.
Nichts verhindert beides oder nichts. Jede Operation muss diese Fälle prüfen. Wir wollen das Gegenteil: ungültige Zustände unrepräsentierbar machen.
-->

---
sandbox: 07-SealedTypes
sandboxRun: |
  new Tablet(1, 0, 1);
  new Infusion(50, 30);
---

# Sealed Types <span class="badge" style="background:var(--teal)">Java 17</span>

<JavaSandboxCode :variant="0" />

<v-clicks>

- **Geschlossene** Menge von Alternativen: `permits` nennt alle Subtypen
- Compiler und Leser kennen *alle* Varianten
- Records als Varianten ⇝ transparente Alternativen

</v-clicks>

<!--
Eigenständiger Nutzen: kontrollierte Hierarchie. Nur die erlaubten Typen können Dosage implementieren: Tablet oder Infusion, nie beides, nie etwas anderes.
Wie ein Interface mit zwei Implementierungen, aber der Compiler weiß, dass es keine weiteren gibt.
(Liegen alle Subtypen in derselben Datei, kann permits entfallen.) Darauf bauen wir auf: Exhaustive Switches.
-->

---
class: code-xs
sandbox: 08-TypePatterns
sandboxRuns:
  - |
      morningPillsOld(new Tablet(2, 0, 1));
      morningPillsOld(new Infusion(50, 30));
  - |
      morningPills(new Tablet(2, 0, 1));
      morningPills(new Infusion(50, 30));
---

# Type Patterns: `instanceof` <span class="badge" style="background:var(--teal)">Java 16</span>

<div class="grid-2">
<div>

**Vorher**

<JavaSandboxCode :variant="0" />

</div>
<div>

**Nachher**

<JavaSandboxCode :variant="1" />

</div>
</div>

<p v-click class="small">Prüfen, casten und binden in einem Schritt: <code>dosage instanceof Tablet tablet</code></p>

<!--
Klassisch: Typ testen, casten, zuweisen. Der Typ steht dreimal da, und der Cast kann schiefgehen, wenn man einen davon ändert.
Eigenständiger Nutzen: weniger Boilerplate, kein Cast, der schiefgehen kann. "Tablet tablet" ist ein Type Pattern.
-->

---
sandbox: 09-Scope
sandboxRun: |
  hasMorningPills(new Tablet(1, 2, 0));
  middayPills(new Tablet(1, 2, 0));
  middayPills(new Infusion(50, 30));
---

# Type Patterns: Scope

<JavaSandboxCode :variant="0" />

<p v-click class="small">Die Variable gilt dort, wo der Test <b>wahr</b> ist (Flow Scoping).</p>

<!--
Der Compiler verfolgt, wo die Pattern-Variable sicher gebunden ist: rechts von &&, im if-Zweig oder nach einem frühen Return bei negiertem Test.
Kürzungskandidat.
-->

---
sandbox: 10-PatternSwitch
sandboxRun: |
  describe(new Tablet(1, 0, 1));
  describe(new Infusion(50, 30));
---

# Pattern Matching für `switch` <span class="badge" style="background:var(--teal)">Java 21</span>

<JavaSandboxCode :variant="0" />

<v-clicks>

- Type Patterns als `case`-Labels, ein Zweig pro Alternative
- Keine `if`-`else`-Kette, keine Casts

</v-clicks>

<!--
Eigenständiger Nutzen: Verzweigen nach dem Typ, ohne instanceof-Ketten.
Mit dem sealed Dosage ist das eine Funktion über die Alternativen des Diagramms. Anders als beim Visitor liegt die Operation neben den Daten, nicht darin.
-->

---
sandbox: 11-Exhaustiveness
---

# Exhaustiveness

<JavaSandboxCode :variant="0" />

<v-clicks>

- Sealed Types ⇝ der Compiler kennt alle Fälle
- Fehlt einer? **Compile-Fehler**
- Kein `default` ⇝ ein neuer Subtyp bricht *jeden* betroffenen `switch`

</v-clicks>

<!--
Sealed Types und Pattern Matching zahlen zusammen ein. Entfernt man den Infusion-Fall, lehnt der Compiler ab.
Noch besser die andere Richtung: ergänzt jemand später eine dritte Dosierung, kompiliert jeder switch über Dosage nicht mehr und zeigt genau die Stellen.
Deshalb ist default auf sealed Types meist keine gute Idee.
-->

---
sandbox: 12-Guards
sandboxRun: |
  warn(new Tablet(4, 0, 0));
  warn(new Infusion(150, 30));
  warn(new Tablet(1, 0, 1));
---

# Guards (`when`)

<JavaSandboxCode :variant="0" />

<p v-click class="small"><code>case Type t when condition</code> ⇝ ein Pattern verfeinern</p>

<!--
Der Typ allein reicht oft nicht, `when` ergänzt eine Bedingung. Cases werden von oben nach unten geprüft, der erste Treffer gewinnt:
spezifische Fälle mit Guard vor den allgemeinen. (Grenzwerte erfunden, keine medizinische Beratung.)
-->

---
class: code-xs
sandbox: 13-DominanceNull
sandboxRuns:
  - ""
  - |
      describeNullable(null);
      describeNullable(new Tablet(1, 0, 1));
  - |
      describeAny(null);
      describeAny(42);
      describeAny("hello");
---

# Dominance und `null`

<div class="grid-2 dominance-comparison">
<div>

**Allgemein vor speziell**

<JavaSandboxCode :variant="0" excerpt>

```java
switch (dosage) {
    case Tablet t -> "OK";
    // error: dominated by a
    // preceding case label
    case Tablet t when t.morning() > 6
        -> "Too many tablets";
    ...
}
```

</JavaSandboxCode>

<p class="small" v-click>Reihenfolgefehler fallen auf.</p>

</div>
<div>

**`null` im Switch**

<JavaSandboxCode :variant="1" excerpt>

```java
return switch (dosage) {
    case null -> "no dosage";
    case Tablet t -> "tablets";
    case Infusion i -> "infusion";
};

case null, default -> "something else";
```

</JavaSandboxCode>

<p class="small" v-click>Ohne <code>case null</code>: <code>NullPointerException</code></p>

</div>
</div>

<!--
Dominance: Steht ein allgemeiner Fall zuerst, ist der spezifische nie erreichbar. Der Compiler erkennt das ("dominated").
null: Ein switch wirft bei null seit jeher NPE. Mit case null behandelt man null explizit als einen Fall; optional, in unserem Modell gibt es keine null-Dosierungen (Validierung am Rand).
case null, default ist die Kombination für nicht-sealed Typen.
Kürzungskandidat: Dominance nur kurz erwähnen. Alles hier ist Teil von JEP 441.
-->

---
sandbox: 14-RecordPatterns
sandboxRun: |
  format(new Tablet(1, 0, 1));
  format(new Infusion(50, 30));
---

# Record Patterns <span class="badge" style="background:var(--teal)">Java 21</span>

<JavaSandboxCode :variant="0" />

<v-clicks>

- Typ prüfen **und** zerlegen
- Komponenten direkt an Variablen gebunden
- Konstruktion und Dekonstruktion sind symmetrisch

</v-clicks>

<!--
Eigenständiger Nutzen: Zugriff auf die Komponenten ohne Accessor-Aufrufe.
Tablet(int morning, int midday, int evening) ist das exakte Spiegelbild von new Tablet(1, 0, 1).
Hier zahlen sich transparente Records aus. var kann die Komponententypen ersetzen.
-->

---
sandbox: 15-NestedPatterns
sandboxRun: |
  format(new Medication(Drug.IBUPROFEN, new Tablet(1, 0, 1)));
  format(new Medication(Drug.CAFFEINE, new Infusion(50, 30)));
---

# Verschachtelte Record Patterns

<JavaSandboxCode :variant="0" />

<v-clicks>

- Patterns verschachteln sich wie die Daten
- Ein `switch` statt geschachtelter `if`s, weiterhin vollständig geprüft!

</v-clicks>

<!--
Records enthalten Records, also können Patterns so tief verschachtelt werden wie die Daten. Hier: Medikament und im selben Schritt die Art der Dosierung.
Es ist das Diagramm als Pattern. Der Compiler prüft Vollständigkeit über die Verschachtelung hinweg.
Ein Pattern für List<Medication> gibt es nicht: für Collections Stream oder Schleife.
-->

---
sandbox: 16-NestedGuards
sandboxRun: |
  warn(new Medication(Drug.CAFFEINE, new Infusion(50, 30)));
  warn(new Medication(Drug.IBUPROFEN, new Tablet(2, 1, 1)));
  warn(new Medication(Drug.PARACETAMOL, new Tablet(1, 0, 1)));
---

# Verschachtelte Patterns und Guards

<JavaSandboxCode :variant="0" />

<p v-click class="small">Erst die Form matchen, dann mit <code>when</code> verfeinern.</p>

<!--
Form zuerst, Details danach: das Pattern wählt die Struktur, der Guard prüft die Werte. Kürzungskandidat.
-->

---
class: code-xs
sandbox: 17-Unnamed
sandboxRuns:
  - |
      morningPills(new Tablet(2, 0, 1));
      morningPills(new Infusion(50, 30));
  - ""
---

# Unnamed Patterns und Variables <span class="badge" style="background:var(--teal)">Java 22</span>

<div class="grid-2">
<div>

<JavaSandboxCode :variant="0" excerpt>

```java
int morningPills(Dosage dosage) {
    return switch (dosage) {
        case Tablet(var morning, _, _)
                -> morning;
        case Infusion(_, _) -> 0;
    };
}
```

</JavaSandboxCode>

</div>
<div>

<JavaSandboxCode :variant="1" excerpt>

```java
medication instanceof Medication(_, Tablet _)

case Tablet _ -> "swallow";

for (var _ : plan.medications()) {
    count++;
}
```

</JavaSandboxCode>

</div>
</div>

<v-clicks>

- `_` ⇝ „brauche ich nicht“: zeigt die Absicht, keine ungenutzten Variablen
- Funktioniert bei Komponenten, Type Patterns, Variablen, Schleifen, Lambdas, `catch`

</v-clicks>

<!--
Eigenständiger Nutzen: sagen, was einen nicht interessiert. Record Patterns müssen alle Komponenten auflisten, meist braucht man nur einige.
_ macht explizit, dass eine Komponente irrelevant ist; Leser (und Compiler) müssen nicht nach ungenutzten Variablen suchen.
_ ist nicht auf Record-Komponenten beschränkt: Type Pattern ohne Namen (Tablet _), unbenutzte lokale Variablen, for-Variablen, Lambda- und catch-Parameter.
-->

---
class: code-xs
sandbox: 18-PrimitivePatterns
sandboxRun: |
  start(new Infusion(50, 30));
  start(new Infusion(200, 30));
sandboxNotice: "Benötigt ein JDK mit Primitive Patterns (z. B. JDK 27/28) und aktiviertes --enable-preview. Run startet das Beispiel; der letzte Aufruf demonstriert absichtlich einen Bereichsfehler."
---

# Primitive Type Patterns

<Preview />

<JavaSandboxCode :variant="0" />

<v-clicks>

- Patterns auch für `byte`, `int`, `double`, ...
- Treffer nur, wenn der Wert **verlustfrei** konvertierbar ist
- Ersetzt manuelle Bereichsprüfungen und Casts

</v-clicks>

<!--
Mini-Beispiel, Dosage passt hier nicht ideal: die Infusionspumpe akzeptiert nur ein byte, das Modell nutzt int.
infusion.speed() instanceof byte speed ist nur wahr, wenn der Wert exakt in ein byte passt. Keine manuelle Bereichsprüfung, kein verlustbehafteter Cast.
Status: Preview in JDK 27 (JEP 532, fünfte Preview), braucht --enable-preview. Mündlich erwähnen.
-->

---
sandbox: 19-PrimitiveRecords
sandboxSetup: |
  void setPumpSpeed(byte speed) { System.out.println("Pump speed: " + speed); }
sandboxRun: |
  start(new Infusion(50, 30));
  start(new Tablet(1, 0, 1));
  start(new Infusion(200, 30));
sandboxNotice: "Benötigt ein JDK mit Primitive Patterns (z. B. JDK 27/28) und aktiviertes --enable-preview. Run startet das Beispiel; der letzte Aufruf demonstriert absichtlich einen Bereichsfehler."
---

# Primitive Patterns in Records

<Preview />

<JavaSandboxCode :variant="0" />

<v-clicks>

- Record-Komponenten mit engerem primitiven Pattern
- Kein Treffer ⇝ der nächste `case` wird probiert

</v-clicks>

<!--
Primitive Patterns funktionieren auch in Record Patterns und switch: Infusion(byte speed, _) passt nur, wenn die Geschwindigkeit in ein byte passt, sonst der nächste Case.
Zusätzlich möglich: switch über primitive Selektoren mit Patterns und Guards.
Kürzungskandidat.
-->

---

# Goetz' vier Prinzipien

Brian Goetz, Juni 2022:

<v-clicks>

- **Daten sind unveränderlich.**
- **Modelliere die Daten, die ganzen Daten und nichts als die Daten.**
- **Mach ungültige Zustände unrepräsentierbar.**
- **Validiere an der Grenze.**

</v-clicks>

<p class="source">https://www.infoq.com/articles/data-oriented-programming-java/</p>

<!--
Haben wir gerade alle benutzt, ohne sie zu benennen:
- Immutable: Records und List.copyOf.
- Die ganzen Daten und nichts als die Daten: Medication ist genau Drug und Dosage.
- Ungültige Zustände: sealed Dosage ist Tabletten oder Infusion, nie beides, nie keines.
- Validieren an der Grenze: die Compact Constructors prüfen beim Eintritt der Daten.
Prinzipien aus Goetz' Artikel von 2022 (im Inside-Java-Intro etwas umsortiert). Eine Checkliste zum Review von Datenmodellen, unabhängig von der Java-Version.
-->

---

# Überarbeitet: Parlogs DOP v1.1

Nicolai Parlog, 2024:

<v-clicks>

- <span class="red">**Daten unveränderlich und transparent modellieren.**</span>
- **Modelliere die Daten, die ganzen Daten und nichts als die Daten.**
- **Mach ungültige Zustände unrepräsentierbar.**
- <span class="red">**Trenne Operationen von Daten.**</span>

</v-clicks>

<p class="source">https://inside.java/2024/05/23/dop-v1-1-introduction/</p>

<!--
Parlog nutzte DOP ca. 18 Monate (Demos, Hobbyprojekte, ein Produktivprojekt) und schlug in einer sechsteiligen Serie auf Inside Java eine kleine Überarbeitung vor.
Serie: Intro 23.5.2024, Immutable+Transparent 27.5., Model the data 29.5., Illegal states 3.6., Separate operations 5.6., Wrap-up 10.6. (inside.java/2024/05/23/dop-v1-1-introduction/ usw.)
Wenn jemand widerspricht: "meine Lesart" sagen.
-->

---

# Von 1.0 zu 1.1

<v-clicks>

- **Unveränderlich** ⇝ **unveränderlich und transparent**: die Daten müssen lesbar sein, nicht nur konstant
- **Validiere an der Grenze** ⇝ Teil von *ungültige Zustände*: der Konstruktor ist die Grenze
- **Neu:** **Trenne Operationen von Daten**: Funktionen neben den Typen, nicht darin

</v-clicks>

<p v-click class="small muted">Die beiden „Model the data“-Prinzipien bleiben unverändert.</p>

<!--
Gleiche Idee, schärfere Kanten:
- Transparenz ist der Grund, warum Pattern Matching funktioniert: Record Patterns müssen die Komponenten sehen. Ein Record ist unveränderlich und transparent, eine Klasse mit privatem Zustand nicht.
- Validierung an der Grenze ist ein Weg, ungültige Zustände unmöglich zu machen, daher in v1.1 zusammengeführt. Compact Constructors machen den Konstruktor zur Grenze.
- Goetz' Beispiele trennten Operationen schon, aber nicht als eigenes Prinzip. Parlog macht es explizit, weil es die Daten für viele unabhängige Subsysteme nutzbar macht.
v1.1 ist eine kleine Revision, keine andere Philosophie.
Kürzungskandidat: diese Folie (Goetz und v1.1 beibehalten, auf die Artikel verweisen).
-->

---

# Die Prinzipien im Dosage-Beispiel

<v-clicks>

- **Unveränderlich, transparent:** `Tablet`, `Infusion`, `List.copyOf`
- **Die ganzen Daten, nichts sonst:** `Medication` = `Drug` + `Dosage`
- **Ungültige Zustände:** sealed `Dosage` + Compact Constructors
- **Trenne Operationen:** `describe`, `format`, `dailyPills`

</v-clicks>

<!--
Das ganze Kapitel in vier Zeilen, die Beispiele kennen wir schon. Die ersten drei betreffen die Datentypen, die letzte die Operationen.
Und die schauen wir uns jetzt an: was passiert, wenn sich die Anforderungen ändern?
-->

---
sandbox: 20-Operation
sandboxRun: |
  dailyPills(new Tablet(1, 2, 1));
  dailyPills(new Infusion(50, 30));
---

# Eine Operation ergänzen

<JavaSandboxCode :variant="0" />

<v-clicks>

- Eine neue Funktion ⇝ **kein** bestehender Typ ändert sich
- Der `switch` ist vollständig: kein `default` nötig

</v-clicks>

<!--
Neue Anforderung: Wie viele Tabletten nimmt ein Patient pro Tag? Wir schreiben eine Funktion neben den Daten. Tablet, Infusion und Dosage bleiben unberührt.
Im OO-Design wäre das eine neue Methode auf Dosage, und jede Implementierung müsste sich ändern.
Operationen, die nur ein Subsystem braucht, müssen die gemeinsamen Typen nicht aufblähen.
-->

---
class: compact-code
sandbox: 21-Alternative
---

# Eine Alternative ergänzen

<JavaSandboxCode :variant="0" />

<v-clicks>

- Der Compiler zeigt **jeden** `switch`, der einen neuen Fall braucht
- Ohne `default` wird nichts stillschweigend übersprungen
- Trade-off: neue Alternativen sind der teure Teil

</v-clicks>

<!--
Neue Anforderung: ein Medikament kann auch ein Pflaster sein. Neuer Record plus erweitertes permits bricht jeden switch über Dosage.
Das ist gewollt: "Follow the errors" liefert eine To-do-Liste gratis. Das klappt nur, weil wir default vermieden haben; ein default würde Patch verschlucken.
Ehrlicher Trade-off: Mit Sealed Types sind neue Operationen billig und neue Alternativen teuer. Bei klassischer Vererbung ist es umgekehrt.
Das ist die Brücke zur nächsten Folie.
-->

---

# OOP und DOP

<table>
<thead><tr><th>OOP</th><th>DOP</th></tr></thead>
<tbody>
<tr v-click><td>Zustand + Verhalten zusammen</td><td>Daten und Verhalten getrennt</td></tr>
<tr v-click><td>Kapselung versteckt Details</td><td>Transparenz zeigt die Daten</td></tr>
<tr v-click><td>offen für neue Subtypen</td><td>geschlossene Menge von Alternativen</td></tr>
<tr v-click><td>sich entwickelnde Abläufe</td><td>Daten, die herumgereicht werden</td></tr>
</tbody>
</table>

<p v-click class="card yellow center" style="margin-top:30px">Ergänzende Werkzeuge, keine Rivalen.</p>

<!--
OOP ist nicht (schon wieder) tot. Kapselung, Vererbung und die einfache Modularisierung großer Systeme bleiben wertvoll, besonders für Dinge mit Identität und veränderlichem Zustand: Services, Ressourcen, die "Engine" eines Systems.
DOP glänzt bei dem, was durch diese Engine fließt: Eingaben, Events, Ergebnisse, andere Werte.
Parlog sieht DOP zwischen FP und OOP, aber näher an FP: unveränderliche Daten und Funktionen, mit evtl. veränderlichen Subsystemen drumherum (Wrap-up-Artikel der Serie).
-->

---

# Wann DOP?

<v-clicks>

- **Daten-(Sub-)Systeme:** Batch Jobs, Analyse, Event Processing
- **Kleine Probleme**, die keine weitere Modularisierung brauchen
- **Daten von außen:** JSON, Nachrichten, ASTs, Rückgabewerte

</v-clicks>

<p v-click class="card yellow center" style="margin-top:30px">Klein anfangen: schon ein Record und ein <code>switch</code> helfen.</p>

<!--
Man muss kein ganzes System datenorientiert bauen. Records, keine Mutation und ein vollständiger switch statt Visitor machen Code schon klarer.
Parlogs zwei Situationen: Datenverarbeitende (Teil-)Systeme und kleine (Teil-)Probleme. Voraussetzung: Java 21 oder neuer, weil Pattern Matching für switch das Wesentliche ist.
Kürzungskandidat.
-->

---

# Was zählt

<v-clicks>

- **Records** ⇝ Daten als Daten
- **Sealed Types** ⇝ Alternativen, die der Compiler kennt
- **Pattern Matching** ⇝ vollständige Operationen, kein `default`
- **DOP** ⇝ ein Stil, der alle drei nutzt

</v-clicks>

<!--
Jedes Feature ist einzeln nützlich: Switch Expressions sind sichere Ausdrücke, Records entfernen Boilerplate, Type Patterns entfernen Casts, Sealed Types kontrollieren Hierarchien.
Die Kombination verändert, wie wir Daten modellieren und verarbeiten. Nächste Folie: Versionen und JEPs.
-->

---

# Zusammenfassung

| Feature | Final in | JEP |
|---|---|---|
| Switch Expressions | Java 14 | [JEP 361](https://openjdk.org/jeps/361) |
| Records | Java 16 | [JEP 395](https://openjdk.org/jeps/395) |
| Type Patterns für `instanceof` | Java 16 | [JEP 394](https://openjdk.org/jeps/394) |
| Sealed Classes und Interfaces | Java 17 | [JEP 409](https://openjdk.org/jeps/409) |
| Pattern Matching für `switch` | Java 21 | [JEP 441](https://openjdk.org/jeps/441) |
| Record Patterns | Java 21 | [JEP 440](https://openjdk.org/jeps/440) |
| Unnamed Patterns und Variables | Java 22 | [JEP 456](https://openjdk.org/jeps/456) |
| Primitive Types in Patterns | **Preview** (Java 27) | [JEP 532](https://openjdk.org/jeps/532) |
| Data-Oriented Programming | Java 21+ | – |

<!--
Stand Oktober 2026 (JDK 27 ist GA), auf openjdk.org geprüft. TODO: vor dem Vortrag nochmal gegenprüfen.
Primitive Types in Patterns ist in JDK 27 in der fünften Preview und braucht --enable-preview, ist also noch nicht final.
Guards, null-Behandlung, Exhaustiveness und Dominance sind Teil von JEP 441. Alles andere auf dieser Folie ist final.
DOP braucht Pattern Matching für switch, also ist Java 21 das Minimum.
-->

---
layout: section
number: '03'
sidebar: false
image: /duke/duke-live-coding.png
---

# Live-Coding

Dosage in IntelliJ

<!--
Wird separat vorbereitet. Demos aus Anhang B-D des Material-Exports (MedicationPlan, MedicationPlanValidation, MedicationPlanPrimitives).
-->

---

# Live-Coding: Code zum Mitmachen

<Keyboard class="abs" style="left:-10px;top:135px;width:980px;opacity:0.35;z-index:0" />

<div class="abs center" style="left:57px;top:235px;width:846px;z-index:1">
  <div class="card" style="display:inline-block;padding:10px 28px 14px;background:#ffffffeb">
    <p class="small muted" style="margin:0 0 4px">Den Code gibt es auf GitHub</p>
    <p style="font-size:36px;font-weight:700;margin:0;white-space:nowrap">
      <a href="https://github.com/sippsack/java-dop-pattern-matching">github.com/sippsack/java-dop-pattern-matching</a>
    </p>
  </div>
</div>

<!--
Repo: https://github.com/sippsack/java-dop-pattern-matching
Jeder Schritt der Demo ist ein eigener Branch bzw. Stand, damit man später zu Hause nachvollziehen kann.
-->

---
layout: section
number: '04'
sidebar: false
image: /duke/duke-binoculars.png
---

# Fazit

Was fehlt noch? Was ist in Arbeit?

---

# Ausblick: Was kommt als Nächstes?

<AmberOverview />

<!--
Kernaussage: Deconstruction (und Reconstruction) wird ein First-Class-Konzept im Java-Typsystem. Alles hier sind Designrichtungen aus Project Amber (Mailinglisten 2025/2026), keine beschlossenen Features, Syntax nicht final.
Konkret in Arbeit:
- Pattern Assignment: Ein Pattern zerlegt einen Wert direkt per Zuweisung, z. B. `Point(var x, var y) = point;`, ganz ohne Fallunterscheidung, weil der Compiler den Typ schon kennt.
- Patterns in for-each: Im Schleifenkopf lässt sich das Element sofort zerlegen, z. B. `for (Map.Entry(var key, var value) : map.entrySet())`, und der Boilerplate mit getKey()/getValue() entfällt.
- Dekonstruierbare Klassen: Auch normale Klassen sollen ihren öffentlichen Zustand per Pattern preisgeben können (nicht nur Records), ohne ihre interne Repräsentation offenzulegen.
- Dekonstruierbare Interfaces: Ein Interface kann einen sichtbaren Zustand beschreiben, sodass Pattern Matching möglich bleibt, während die Implementierung gekapselt ist.
- with-Ausdrücke: Aus einem bestehenden Objekt entsteht eine Kopie mit einzelnen geänderten Komponenten, z. B. `address with { city = "Darmstadt"; }` (JEP 468, Derived Record Creation).
- Bessere Serialisierung: Weil eine Klasse ihren Zustand explizit beschreibt und über den Konstruktor neu aufgebaut wird, können Serializer ohne Reflection auf private Felder arbeiten und Invarianten bleiben erhalten.

Eher Vision:
- Nominale Patterns: Komponenten werden statt über ihre Position über ihren Namen angesprochen, das ist bei großen Records deutlich lesbarer (Syntax offen).
- Record-Evolution: Wenn ein Record neue Komponenten am Ende bekommt, sollen alte Patterns (Prefix Patterns) weiter funktionieren, wichtig für öffentliche APIs.
- Member-Patterns: Patterns analog zu Konstruktoren, Factory- und Instanzmethoden, z. B. `value instanceof Optional.of(var x)`, eine langfristige Vision.

Quelle: future-of-pattern-matching-java-amber.md
-->

---
sandbox: 22-Ausblick
sandboxNotice: "Syntaxentwurf: in aktuellen JDKs noch nicht verfügbar. Run zeigt erwartete Compilerfehler, nicht eine funktionierende Implementierung."
---

# Ausblick: Dekonstruktion überall <span class="badge">Syntax nicht final</span>

<div class="codewrap code-sm" style="position:relative">

<JavaSandboxCode :variant="0" />

<Callout v-click :line="1" :col="42" title="Dekonstruierbare Klasse" text="State Description im Kopf" />
<Callout v-click :line="5" :col="51" title="Dekonstruierbares Interface" text="Implementierung verborgen" />
<Callout v-click :line="8" :col="52" title="Pattern Assignment" text="Zerlegen ohne if oder switch" />
<Callout v-click :line="11" :col="56" title="Pattern im for-each" text="Kein getKey() / getValue()" />

</div>

<!--
Alles hier sind Designrichtungen aus Project Amber, die Syntax ist nicht final.
1. Dekonstruierbare Klasse: Eine normale Klasse beschreibt im Kopf ihren öffentlichen Zustand (State Description). Die internen Felder können anders aussehen und bleiben privat. Früher "Carrier Classes" genannt.
2. Dekonstruierbares Interface: Auch ein Interface kann sichtbaren Zustand beschreiben, die Implementierung bleibt gekapselt.
3. Pattern Assignment: Der Compiler kennt den statischen Typ, deshalb ist keine Fallunterscheidung nötig. Das Pattern ist nur noch Dekonstruktion.
4. Patterns im for-each: Das Element wird direkt im Schleifenkopf zerlegt.
-->

---
sandbox: 23-Ausblick
sandboxNotice: "Syntaxentwurf: in aktuellen JDKs noch nicht verfügbar. Run zeigt erwartete Compilerfehler, nicht eine funktionierende Implementierung."
---

# Ausblick: Rekonstruktion <span class="badge">Syntax nicht final</span>

<div class="codewrap code-sm" style="position:relative">

<JavaSandboxCode :variant="0" />

<Callout v-click :line="2" :col="22" title="Kanonischer Konstruktor" text="Hier liegen die Invarianten" />
<Callout v-click :line="8" :col="52" title="with-Ausdruck" text="Kopie, Original bleibt" />
<Callout v-click :line="11" :col="42" title="Serialisierung" text="Zustand ohne Reflection" />
<Callout v-click :line="14" :col="39" title="Deserialisierung" text="Ruft den Konstruktor auf" />

</div>

<!--
Alles hier sind Designrichtungen aus Project Amber, die Syntax ist nicht final.
Dekonstruktion und Rekonstruktion nutzen dieselbe State Description.
1. Kanonischer Konstruktor: Er ist der einzige Weg, ein Objekt zu bauen, und prüft die Invarianten.
2. with-Ausdruck (JEP 468 für Records, später auch für Klassen): Komponenten werden im Block implizit verfügbar, es entsteht eine neue Instanz, das Original bleibt unverändert.
3. Serialisierung: Ein Serializer nutzt die State Description. Kein Zugriff auf private Felder per Reflection, kein Umgehen der Kapselung.
4. Deserialisierung: Beim Einlesen wird ein normaler Konstruktor aufgerufen. Dadurch bleiben die Invarianten der Klasse erhalten.
Nicht behaupten: Java bekommt Companion Classes für Serialisierung. Besser: Deconstruction und Reconstruction könnten die Grundlage für bessere, kapselungsschonende Serialisierungs-APIs sein.
-->

---
layout: default
---

# Take-aways

<v-clicks>

- **Pattern Matching** macht Fallunterscheidungen explizit, kurz und compilergeprüft
- **Records + Sealed Types** modellieren Daten präzise, ungültige Zustände werden unrepräsentierbar
- **DOP** trennt Daten und Verhalten, ergänzt OOP und ist schon heute mit Java 21+ möglich

</v-clicks>

---
layout: download
---

---
layout: default
---

# GitHub-Repos zum Vortrag

<div class="talk-materials">
  <div class="card">
    <h2>Code-Demos</h2>
    <a href="https://github.com/sippsack/java-dop-pattern-matching" target="_blank" rel="noopener noreferrer">github.com/sippsack/java-dop-pattern-matching</a>
  </div>
  <div class="card">
    <h2>Folien · JUG Nürnberg · 28.10.2026</h2>
    <p><a href="https://github.com/sippsack/java-pattern-matching-dop/tree/published/2026-10-28-jug-nuernberg/slides" target="_blank" rel="noopener noreferrer">sli.dev-Quellen auf GitHub · getaggter Stand</a></p>
    <p><a href="https://www.sippsack.de/java-pattern-matching-dop/2026-10-28-jug-nuernberg/1" target="_blank" rel="noopener noreferrer">Folien online ansehen</a></p>
  </div>
</div>

<style>
.talk-materials {
  display: grid;
  gap: 24px;
}
.talk-materials .card {
  padding: 18px 24px;
}
.talk-materials h2 {
  margin-bottom: 12px;
}
.slidev-layout .talk-materials p {
  margin-bottom: 6px;
}
</style>

<!--
Code-Demos: https://github.com/sippsack/java-dop-pattern-matching
Die Folien verlinken auf den Veranstaltungsstand published/2026-10-28-jug-nuernberg.
-->

---
layout: full-image
sidebar: false
image: /embarc/s7-1--3x0.png
---

---
layout: spicker
sidebar: false
---

---
layout: thanks
---
