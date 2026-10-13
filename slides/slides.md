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

Oktober 2026 · TODO Event

<!--
Titelfolie. TODO: Event/Konferenz und Datum eintragen, ggf. Event-Logo ergänzen.
-->

---
layout: bio
---

---
layout: community
---

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
image: /duke/duke-shapes.png
---

# Einleitung

DOP, Pattern Matching, ADTs

---

# Unser Beispiel: ein Medikationsplan

<ModelDiagram />

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

# Inspiriert von

<div class="card yellow" style="margin-top:20px">

## Data Modeling with Sums and Products

Michael Sperber und Stefan Wehr · funktionale-programmierung.de · November 2024

</div>

<p class="small" style="margin-top:20px"><b>Produkte</b> (<i>und</i>) und <b>Summen</b> (<i>oder</i>): die zwei Grundwerkzeuge für gute Datenmodelle.</p>

<p class="source">https://funktionale-programmierung.de/en/2024/11/25/sums-products.html</p>

<!--
TODO: Screenshot des Blogposts ergänzen (im Devoxx-Deck: images/sums-products.png).
Genau das, was im Diagramm blau (Produkt) und gelb (Summe) eingefärbt ist.
-->

---

# Das Modell in Code

```java {all}
enum Drug { PARACETAMOL, IBUPROFEN, CAFFEINE }

sealed interface Dosage permits Tablet, Infusion { }
record Tablet(int morning, int midday, int evening) implements Dosage { }
record Infusion(int speed, int duration) implements Dosage { }

record Medication(Drug drug, Dosage dosage) { }
record MedicationPlan(String patientName, List<Medication> medications) { }
```

<p v-click class="small">Modernes Java: <b>Records</b>, <b>Sealed Types</b>, ...</p>

<!--
Das ganze Diagramm als Java-Code. Nicht jedes Schlüsselwort erklären: wir nehmen die Teile gleich einzeln auseinander.
Der Code spiegelt das Diagramm fast 1:1.
-->

---

# Data-Oriented Programming

<v-clicks>

- **Daten** zuerst: präzise, unveränderlich, transparent modellieren
- **Operationen** danach: getrennte Funktionen von Daten zu Daten
- **Programme** als Produktionsstraße: Daten fließen rein, werden transformiert und fließen wieder raus

</v-clicks>

<!--
Das ist die Idee hinter dem Beispiel. Daten sind nur Daten, die Operationen leben neben den Typen, nicht darin.
Funktioniert am besten in kleineren (Teil-)Systemen, die Eingaben in Ausgaben umwandeln: Batch, Event Processing, Analyse/Transformation von Strukturen.
Wann DOP sinnvoll ist und welche Leitlinien dahinterstehen, kommt nach den Sprachfeatures.
-->

---

# Javas Werkzeugkasten für DOP

<div class="grid-3" style="margin-top:30px">
  <div v-click class="card"><h2>Records</h2><p class="small">Daten als Daten (Produkttypen)</p><p class="tiny muted"><code>Tablet</code>, <code>Infusion</code>, <code>Medication</code></p></div>
  <div v-click class="card yellow"><h2>Sealed Types</h2><p class="small">Alternativen (Summentypen)</p><p class="tiny muted"><code>Dosage</code></p></div>
  <div v-click class="card teal"><h2>Pattern Matching</h2><p class="small">Operationen auf Daten</p><p class="tiny muted"><code>describe(Dosage)</code></p></div>
</div>

<p v-click class="center" style="margin-top:30px">Schauen wir sie uns einzeln an.</p>

<!--
Jedes Feature ist einzeln nützlich, zusammen verändern sie, wie wir Daten modellieren und verarbeiten.
Records + Sealed Types = was funktionale Sprachen algebraische Datentypen nennen (gleich mehr).
Vorgehen: erst die kleinen Features (Switch Expressions, Records, Type Patterns, Sealed Types), dann Pattern Matching obendrauf, dann die Frage, wie sich das Design verändert.
-->

---

# Das Problem

<div class="grid-2" style="margin-top:10px">
<div>

## Klassische Fallunterscheidung

<v-clicks>

- `if`-`else`-Ketten mit `instanceof` und Casts
- `switch` mit `break`, Fall-through und `default`
- Neue Fälle fallen niemandem auf

</v-clicks>

</div>
<div>

## Ein Modell für alles

<v-clicks>

- Ein Typ mit vielen optionalen Feldern
- Ungültige Zustände sind darstellbar
- Fehler zeigen sich erst **zur Laufzeit**

</v-clicks>

</div>
</div>

<!--
Bei komplexeren Modellen werden klassische Fallunterscheidungen schnell unübersichtlich, und ungültige Zustände werden oft erst spät zur Laufzeit sichtbar.
Ziel: Unterschiede zwischen Daten explizit machen, Verarbeitung klarer und robuster, mit Compiler-Unterstützung.
-->

---

# Algebraische Datentypen

<table>
<thead><tr><th>Produkttypen: <i>dies und das</i></th><th>Summentypen: <i>dies oder das</i></th></tr></thead>
<tbody>
<tr><td><code>Tablet</code> = <code>int</code> &amp; <code>int</code> &amp; <code>int</code></td><td><code>Dosage</code> = <code>Tablet</code> | <code>Infusion</code></td></tr>
<tr><td><code>Medication</code> = <code>Drug</code> &amp; <code>Dosage</code></td><td><code>Drug</code> = <code>PARACETAMOL</code> | ...</td></tr>
<tr><td><b>Records</b></td><td><b>Sealed Types</b> und <b>Enums</b></td></tr>
</tbody>
</table>

<p v-click class="card yellow center" style="margin-top:30px"><b>Records + Sealed Types = algebraische Datentypen</b></p>

<!--
Das Diagramm besteht nur aus zwei Bausteinen:
- Produkt: ein Wert besteht aus allen seinen Komponenten gleichzeitig (Aggregation).
- Summe: ein Wert ist genau eine von festen Alternativen (Auswahl).
Beides kombiniert modelliert fast alles. Haskell, Scala, Kotlin nennen das ADTs. Java hat jetzt beide Hälften plus Pattern Matching zum Zerlegen.
Goetz: Diese einfache Kombination aus Aggregation und Auswahl ist trügerisch mächtig. Kurz halten, es geht um den Namen.
-->

---

# Was ist Pattern Matching?

<v-clicks>

- Werte **prüfen** *und* nach ihrer **Struktur zerlegen**
- Gefundene Bestandteile direkt **weiterverwenden**
- Compiler prüft **Vollständigkeit** (Exhaustiveness)

</v-clicks>

```java
case Infusion(int speed, int duration) -> "%d ml/h for %d min".formatted(speed, duration);
```

<!--
Pattern = Test + Extraktion. Statt zu fragen "was bist du?" und dann Komponenten per Getter zu holen, beschreibt das Pattern die erwartete Struktur.
Das ist die Voraussetzung für datenorientierte Programmierung.
-->

---
layout: section
number: '02'
image: /duke/duke-features.png
---

# Features

Von Switch Expressions bis Primitive Patterns

---
class: code-xs
---

# Der klassische `switch`

```java
String categoryOld(Drug drug) {
    String category;
    switch (drug) {
        case PARACETAMOL:
        case IBUPROFEN:
            category = "painkiller";
            break;
        case CAFFEINE:
            category = "stimulant";
            break;
        default:
            category = "unknown";
    }
    return category;
}
```

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

# Switch Expressions <span class="badge" style="background:var(--teal)">Java 14</span>

```java
String category(Drug drug) {
    return switch (drug) {
        case PARACETAMOL, IBUPROFEN -> "painkiller";
        case CAFFEINE -> "stimulant";
    };
}
```

<v-clicks>

- Ein **Ausdruck**: liefert einen Wert
- Kein Fall-through, kein `break`
- Vollständig geprüft: kein `default` nötig ⇝ neues `Drug`? Compile-Fehler!

</v-clicks>

<!--
Eigenständiger Nutzen: sichere Ausdrücke. Kein halb initialisierte Variable. Die Pfeilform fällt nie durch, "case A, B" gruppiert.
Bei Enums prüft der Compiler Vollständigkeit ohne default. Wird Drug.ASPIRIN ergänzt, kompiliert jeder solche Switch nicht mehr.
(Mehrere Statements pro Zweig: Block mit yield.)
-->

---

# Records: Data Carriers <span class="badge" style="background:var(--teal)">Java 16</span>

```java
var tablet = new Tablet(1, 0, 1);

tablet.morning();                      // 1
tablet.equals(new Tablet(1, 0, 1));    // true
tablet.toString();   // Tablet[morning=1, midday=0, evening=1]

// immutable: "changing" means creating a new one
var withMidday = new Tablet(tablet.morning(), 1, tablet.evening());
```

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
---

# Records: Validierung und Invarianten

```java
record Tablet(int morning, int midday, int evening) implements Dosage {
    Tablet {
        if (morning < 0 || midday < 0 || evening < 0)
            throw new IllegalArgumentException("Counts must not be negative");
    }
}

record MedicationPlan(String patientName, List<Medication> medications) {
    MedicationPlan {
        Objects.requireNonNull(patientName);
        medications = List.copyOf(medications);
    }
}
```

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

# Welche Dosierungen sind gültig?

```java
// Which of these combinations make sense?
record Dosage(
        Integer morning, Integer midday, Integer evening,
        Integer speed, Integer duration) { }

new Dosage(1, 0, 1, 5, 2);                  // tablets *and* infusion?
new Dosage(null, null, null, null, null);   // nothing at all?
```

<p v-click class="card pink center">Ein Typ für alles ⇝ ungültige Zustände sind <b>darstellbar</b></p>

<!--
Die gelbe Dosage: Tabletten ODER Infusion. Der naive Versuch ist ein Record mit allen Feldern und null für Unpassendes.
Nichts verhindert beides oder nichts. Jede Operation muss diese Fälle prüfen. Wir wollen das Gegenteil: ungültige Zustände unrepräsentierbar machen.
-->

---

# Sealed Types <span class="badge" style="background:var(--teal)">Java 17</span>

```java
sealed interface Dosage permits Tablet, Infusion { }
record Tablet(int morning, int midday, int evening) implements Dosage { }
record Infusion(int speed, int duration) implements Dosage { }
```

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
---

# Type Patterns: `instanceof` <span class="badge" style="background:var(--teal)">Java 16</span>

<div class="grid-2">
<div>

**Vorher**

```java
int morningPillsOld(Dosage dosage) {
    if (dosage instanceof Tablet) {
        Tablet tablet = (Tablet) dosage;
        return tablet.morning();
    }
    return 0;
}
```

</div>
<div>

**Nachher**

```java
int morningPills(Dosage dosage) {
    if (dosage instanceof Tablet tablet) {
        return tablet.morning();
    }
    return 0;
}
```

</div>
</div>

<p v-click class="small">Prüfen, casten und binden in einem Schritt: <code>dosage instanceof Tablet tablet</code></p>

<!--
Klassisch: Typ testen, casten, zuweisen. Der Typ steht dreimal da, und der Cast kann schiefgehen, wenn man einen davon ändert.
Eigenständiger Nutzen: weniger Boilerplate, kein Cast, der schiefgehen kann. "Tablet tablet" ist ein Type Pattern.
-->

---

# Type Patterns: Scope

```java
boolean hasMorningPills(Dosage dosage) {
    return dosage instanceof Tablet t && t.morning() > 0;
}

int middayPills(Dosage dosage) {
    if (!(dosage instanceof Tablet tablet)) {
        return 0;
    }
    // `tablet` is in scope here
    return tablet.midday();
}
```

<p v-click class="small">Die Variable gilt dort, wo der Test <b>wahr</b> ist (Flow Scoping).</p>

<!--
Der Compiler verfolgt, wo die Pattern-Variable sicher gebunden ist: rechts von &&, im if-Zweig oder nach einem frühen Return bei negiertem Test.
Kürzungskandidat.
-->

---

# Pattern Matching für `switch` <span class="badge" style="background:var(--teal)">Java 21</span>

```java
String describe(Dosage dosage) {
    return switch (dosage) {
        case Tablet tablet -> "%d-%d-%d tablets".formatted(
                tablet.morning(), tablet.midday(), tablet.evening());
        case Infusion infusion -> "%d ml/h for %d min".formatted(
                infusion.speed(), infusion.duration());
    };
}
```

<v-clicks>

- Type Patterns als `case`-Labels, ein Zweig pro Alternative
- Keine `if`-`else`-Kette, keine Casts

</v-clicks>

<!--
Eigenständiger Nutzen: Verzweigen nach dem Typ, ohne instanceof-Ketten.
Mit dem sealed Dosage ist das eine Funktion über die Alternativen des Diagramms. Anders als beim Visitor liegt die Operation neben den Daten, nicht darin.
-->

---

# Exhaustiveness

```java
String describe(Dosage dosage) {
    return switch (dosage) {
        case Tablet tablet -> "%d-%d-%d tablets".formatted(
                tablet.morning(), tablet.midday(), tablet.evening());
        // error: does not cover all possible values
    };
}
```

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

# Guards (`when`)

```java
String warn(Dosage dosage) {
    return switch (dosage) {
        case Tablet t when t.morning() > 3 -> "Too many tablets";
        case Tablet t -> "OK";
        case Infusion i when i.speed() > 100 -> "Too fast";
        case Infusion i -> "OK";
    };
}
```

<p v-click class="small"><code>case Type t when condition</code> ⇝ ein Pattern verfeinern</p>

<!--
Der Typ allein reicht oft nicht, `when` ergänzt eine Bedingung. Cases werden von oben nach unten geprüft, der erste Treffer gewinnt:
spezifische Fälle mit Guard vor den allgemeinen. (Grenzwerte erfunden, keine medizinische Beratung.)
-->

---
class: code-xs
---

# Dominance und `null`

<div class="grid-2">
<div>

**Allgemein vor speziell**

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

<p class="small" v-click>Reihenfolgefehler fallen auf.</p>

</div>
<div>

**`null` im Switch**

```java
return switch (dosage) {
    case null -> "no dosage";
    case Tablet t -> "tablets";
    case Infusion i -> "infusion";
};

case null, default -> "something else";
```

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

# Record Patterns <span class="badge" style="background:var(--teal)">Java 21</span>

```java
String format(Dosage dosage) {
    return switch (dosage) {
        case Tablet(int morning, int midday, int evening) ->
            "%d-%d-%d tablets".formatted(morning, midday, evening);
        case Infusion(int speed, int duration) ->
            "%d ml/h for %d min".formatted(speed, duration);
    };
}
```

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

# Verschachtelte Record Patterns

```java
String format(Medication medication) {
    return switch (medication) {
        case Medication(var drug, Tablet(var morning, var midday, var evening))
                -> "%s: %d-%d-%d".formatted(drug, morning, midday, evening);
        case Medication(var drug, Infusion(var speed, var duration))
                -> "%s: %d ml/h for %d min".formatted(drug, speed, duration);
    };
}
```

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

# Verschachtelte Patterns und Guards

```java
String warn(Medication medication) {
    return switch (medication) {
        case Medication(var drug, Infusion(var speed, _))
                when drug == Drug.CAFFEINE && speed > 10
                -> "Caffeine: too fast";
        case Medication(var drug, Tablet(var m, var d, var e))
                when drug == Drug.IBUPROFEN && m + d + e > 3
                -> "Ibuprofen: too many tablets";
        case Medication _ -> "OK";
    };
}
```

<p v-click class="small">Erst die Form matchen, dann mit <code>when</code> verfeinern.</p>

<!--
Form zuerst, Details danach: das Pattern wählt die Struktur, der Guard prüft die Werte. Kürzungskandidat.
-->

---
class: code-xs
---

# Unnamed Patterns und Variables <span class="badge" style="background:var(--teal)">Java 22</span>

<div class="grid-2">
<div>

```java
int morningPills(Dosage dosage) {
    return switch (dosage) {
        case Tablet(var morning, _, _)
                -> morning;
        case Infusion(_, _) -> 0;
    };
}
```

</div>
<div>

```java
medication instanceof Medication(_, Tablet _)

case Tablet _ -> "swallow";

for (var _ : plan.medications()) {
    count++;
}
```

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
---

# Primitive Type Patterns

<Preview />

```java
// the pump only accepts a byte
void setPumpSpeed(byte speed) { /* ... */ }

void start(Infusion infusion) {
    if (infusion.speed() instanceof byte speed) {
        setPumpSpeed(speed);
    } else {
        throw new IllegalArgumentException(
                "Speed does not fit the pump: " + infusion.speed());
    }
}
```

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

# Primitive Patterns in Records

<Preview />

```java
void start(Dosage dosage) {
    switch (dosage) {
        case Infusion(byte speed, _) -> setPumpSpeed(speed);
        case Infusion _ -> throw new IllegalArgumentException(
                "Speed does not fit the pump");
        case Tablet _ -> { }
    }
}
```

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

# Eine Operation ergänzen

```java
int dailyPills(Dosage dosage) {
    return switch (dosage) {
        case Tablet(var morning, var midday, var evening)
                -> morning + midday + evening;
        case Infusion _ -> 0;
    };
}
```

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

# Eine Alternative ergänzen

```java
sealed interface Dosage permits Tablet, Infusion, Patch { }
record Patch(int changeEveryHours) implements Dosage { }

String describe(Dosage dosage) {
    return switch (dosage) {
        case Tablet tablet -> "...";
        case Infusion infusion -> "...";
        // error: does not cover all possible values
    };
}
```

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
image: /duke/duke-live-coding.png
---

# Live-Coding

Dosage in IntelliJ

<!--
Wird separat vorbereitet. Demos aus Anhang B-D des Material-Exports (MedicationPlan, MedicationPlanValidation, MedicationPlanPrimitives).
-->

---
layout: section
number: '04'
image: /duke/duke-binoculars.png
---

# Fazit

Was fehlt noch? Was ist in Arbeit?

---

# Was fehlt noch?

<!--
TODO: bewusst leer, Links zu den Mailinglisten kommen später.
-->

---

# Was ist in Arbeit?

<!--
TODO: bewusst leer, Links zu den Mailinglisten kommen später.
Kandidaten: Carrier Classes (veränderliche Alternative zu Records), Dekonstruktion beliebiger Klassen, vereinfachte (De-)Serialisierung, Withers.
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
layout: full-image
image: /embarc/s7-1--3x0.png
---

---
layout: spicker
---

---
layout: closing
image: /embarc/s9-4-462x-47.png
---

# Feedback & Fragen?

---
layout: thanks
---
