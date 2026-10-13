# Pattern Matching & Data-Oriented Programming in Java – Slides-Export

Stand: Oktober 2026 (JDK 27 ist GA, 2026-09-15). Erstellt aus der Session zum Devoxx-BE-Vortrag
„Modern Java in Practice: The Features That Matter“ (Falk Sippach, Kapitel Pattern Matching / DOP).

## 0. Zweck und Wiederverwendung

Diese Datei bündelt **alles** zum Kapitel, damit eine neue Session darauf aufbauen kann (z. B. für einen eigenen Vortrag):

- Kontext und Regeln des Kapitels (Abschnitt 1)
- Verifizierte Feature-/JEP-Stände (2)
- Das durchgängige Dosage-Beispiel und seine Entwicklung (3)
- Folienübersicht mit Kernaussage, Feature und Kürzungspriorität (4)
- Die beiden DOP-Quellen im Vergleich (5)
- Quellenkonflikte, veraltete Aussagen, offene Entscheidungen (6)
- Technik-/Layout-Hinweise für Reveal.js + AsciiDoc, inkl. getestetem Overflow-Checker (7)
- Vorbereitete Q&A-Antwort (8)
- **Anhang A–F: die vollständigen Originaldateien** (AsciiDoc-Folien mit Sprechtext, drei lauffähige Demo-Klassen, Rahmen-Dateien)

Sprache: Erläuterungen Deutsch, Folientitel und On-Slide-Text Englisch (wie im Vortrag).

Empfehlung für die Wiederverwendung: Anhang A (`pattern-matching.adoc`) und B–D (Demos) in ein neues Verzeichnis
kopieren (`demos/` neben die adoc-Datei), Bilder neu beschaffen (siehe 7.4) und die Folien kürzen/umordnen.
Die Folien binden den Code per `include::demos/…java[tag=…]` ein; die Tags stehen in Abschnitt 3.3.

## 1. Kontext und Regeln

- Gesamtvortrag: „Modern Java in Practice: The Features That Matter“, Devoxx BE, Co-Referent Nicolai Parlog (nipafx), Gast: Falk Sippach (embarc, sippsack.de).
- Kapitel „Pattern Matching“ (+ DOP): **max. 40 Minuten**. Datei im Repo `slides`: `java-17+/pattern-matching.adoc`, eingebunden aus `java-17+/_presentation.adoc` (Branch `devoxx-be-26`).
- Aktueller Stand: **39 Folien** (~35–40 min mit Sprechtext; mit den Kürzungskandidaten aus 4.2 auf ~30 min drückbar).
- Regeln von Falk (gelten für alle Folien des Vortrags):
  1. **Java-Versionen („wann final“) und JEP-Links stehen ausschließlich auf der letzten Folie „Summary“** des Kapitels, nirgends sonst.
  2. Start mit dem **Dosage-Beispiel**; das Klassendiagramm stammt aus dem Bobkonf-PowerPoint („Funktionale Programmierung mit Java“).
  3. Jedes Feature (Switch Expression, Records, …) bekommt **eine eigene Folie**.
  4. Jeder Baustein: eigener praktischer Nutzen („Standalone benefit“) im Sprechtext, nicht nur seine Rolle im Gesamtbild.
  5. Das Dosage-Beispiel wird schrittweise weiterentwickelt; wo es nicht passt, kommt ein Mini-Beispiel (siehe 3.4).
  6. Der Begriff **Algebraic Data Type** ist explizit drin (Produkt = Records, Summe = sealed types/enums).
- Dramaturgie: **Beispiel → Idee DOP → Werkzeugkasten → Features Schritt für Schritt am Beispiel → DOP-Prinzipien (Goetz → Parlog v1.1) → Prinzipien im Beispiel → OOP vs. DOP → Wann DOP → Zusammenfassung mit Versionen/JEPs.**
  Entwurf der Ursprungsplanung (Diskussionsdatei): „Code first, then theory“, 9 Abschnitte à 4/4/6/4/7/4/4/5/2 Minuten.

## 2. Verifizierte Feature- und JEP-Stände (openjdk.org, geprüft 2026-10-05)

| Feature | Final in | JEP |
|---|---|---|
| Switch Expressions | Java 14 | [JEP 361](https://openjdk.org/jeps/361) |
| Records | Java 16 | [JEP 395](https://openjdk.org/jeps/395) |
| Pattern Matching for `instanceof` (Type Patterns) | Java 16 | [JEP 394](https://openjdk.org/jeps/394) |
| Sealed Classes/Interfaces | Java 17 | [JEP 409](https://openjdk.org/jeps/409) |
| Pattern Matching for `switch` (inkl. Guards `when`, `null`, Exhaustiveness, Dominance) | Java 21 | [JEP 441](https://openjdk.org/jeps/441) |
| Record Patterns (inkl. verschachtelt) | Java 21 | [JEP 440](https://openjdk.org/jeps/440) |
| Unnamed Patterns and Variables (`_`) | Java 22 | [JEP 456](https://openjdk.org/jeps/456) |
| Primitive Types in Patterns, `instanceof` and `switch` | **Preview** in JDK 27 (5. Preview) | [JEP 532](https://openjdk.org/jeps/532) |
| Data-Oriented Programming | Java 21+ (braucht Pattern Matching for `switch`) | – (Konzept, kein JEP) |

Hinweise:
- Primitive Patterns: Vorläufer-JEPs 455 (JDK 23), 488 (24), 507 (25), 530 (26), jetzt 532 (27, unverändert zu 530). Für JDK 28 **nicht** vorgeschlagen. Zum Ausführen: `--enable-preview --source 27`. Im Vortrag **kein** Preview-Badge auf den Folien, nur mündlich und in der Summary.
- JEP 468 (Derived Record Creation / „withers“) ist nur *Candidate* – nicht als Feature versprechen.
- JEP 401 (Value Classes/Objects) ist ein *Preview* in JDK 28 – **nicht** mit primitive patterns verwechseln.
- „Carrier Classes“ / allgemeine Dekonstruktion sind keine JEPs, nur Design-Notizen (Amber). Die Amber-Projektseite ist veraltet (Stand 2026-08-12).
- Guards, `null`-Handling, Exhaustiveness und Dominance sind Teil von JEP 441, keine eigenen JEPs.

## 3. Das Dosage-/Medication-Beispiel

### 3.1 Domänenmodell (Klassendiagramm aus dem Bobkonf-Deck, Folien 22–35 und 51–53)

```java
enum Drug { PARACETAMOL, IBUPROFEN, CAFFEINE }
sealed interface Dosage permits Tablet, Infusion {}
record Tablet(int morning, int midday, int evening) implements Dosage {}
record Infusion(int speed, int duration) implements Dosage {}   // ml/h und min – ausgedacht, "not medical advice"
record Medication(Drug drug, Dosage dosage) {}
record MedicationPlan(String patientName, List<Medication> medications) {}
```

Im Deck ist das Diagramm ein **inline-SVG** mit Fragmenten (Farben: blau = Records, orange = Enum/sealed interface).
Das Bild `sums-products.png` (Folie „Inspired by“) ist ein Screenshot des Blogposts
„Data Modeling with Sums and Products“ von Michael Sperber und Stefan Wehr:
<https://funktionale-programmierung.de/en/2024/11/25/sums-products.html>.
Sprechtext der Folie: „Das Beispiel ist inspiriert von diesem Blog-Post“.

### 3.2 Entwicklung des Beispiels entlang der Folien

| Schritt | Folien | Was passiert mit dem Beispiel |
|---|---|---|
| Einführung | Let's introduce our example, Inspired by, The Model in Code | Diagramm → Java-Code des gesamten Modells |
| Idee | Data-Oriented Programming, Java's Toolbox for DOP | Model data as data; Toolbox: Records (product), sealed (sum), pattern matching |
| Enum + switch | Classic `switch`, Switch Expressions | `Drug` → Beschreibung/Maximaldosis; alt (Fallthrough) vs. Expression |
| Records | Data Carriers, Validation, Invariants, Immutability | `Tablet`, `Infusion`, `Medication`, `MedicationPlan`; kompakter Konstruktor validiert, `List.copyOf` |
| Sealed | Which Dosages Are Valid?, Sealed Types, Algebraic Data Types | `Dosage` = Tablet **oder** Infusion; Summen-/Produkttypen |
| Type patterns | `instanceof` (old/new), Scope | `dosage instanceof Tablet t` statt Cast |
| Switch patterns | Pattern Matching for `switch`, Exhaustiveness, Guards, Dominance, `null` | `switch (dosage)` über sealed → erschöpfend ohne `default`; `when` Guards |
| Record patterns | Record Patterns, Nested, Nested+Guards | `case Tablet(var m, var d, var e)`, `case Medication(var drug, Tablet(...))` |
| Unnamed | Unnamed Patterns, Unnamed Variables | `case Tablet(_, _, var e)`, `catch (X _)`, Schleifen ohne Variable |
| Primitive | Primitive Patterns (+ Records) | **Mini-Beispiel** (Dosage passt nicht ideal) |
| DOP-Prinzipien | Goetz, Parlog v1.1, From 1.0 to 1.1, Principles in Dosage | Prinzipien an den schon gezeigten Folien „abgehakt“ |
| Evolution | Adding an Operation, Adding an Alternative | neue Operation `dailyPills` (nur ein neuer switch) bzw. neue Variante `Patch` (Compiler zeigt alle switches) |
| Einordnung | OOP and DOP, When to Use DOP, What Matters, Summary | OOP und DOP komplementär; Versionen/JEPs nur in Summary |

### 3.3 Demo-Dateien und Snippet-Tags (alle laufen auf JDK 27; Primitive-Demo mit `--enable-preview --source 27`)

- `demos/MedicationPlan.java` (Anhang B): `model`, `sealed`, `switch-old`, `switch-expression`, `instanceof-old`, `instanceof`, `instanceof-scope`, `switch-type-patterns`, `exhaustiveness-error`, `guards`, `dominance`, `null`, `null-default`, `record-patterns`, `record-patterns-var`, `record-patterns-instanceof`, `record-patterns-nested`, `record-patterns-guard`, `record-patterns-plan`, `unnamed`, `unnamed-type`, `unnamed-loop`, `new-operation`, `new-variant`, `main`
- `demos/MedicationPlanValidation.java` (Anhang C): `validation`, `validation-tablet`, `validation-infusion`, `validation-plan`, `immutable`, `illegal-states`, `records-basics`
- `demos/MedicationPlanPrimitives.java` (Anhang D): `primitive-instanceof`, `primitive-record-pattern`, `primitive-switch`

### 3.4 Wo Dosage nicht passt → Mini-Beispiele

- `switch` auf int/enum/String (klassischer Switch), `case null`, Dominance (`Object`/`String`-Beispiel), generische ADTs (`Opt`/`MatchResult`), Primitive Patterns (z. B. `classify(long)` o. ä.).
- `default` in einem sealed switch **verbirgt** die Exhaustiveness-Prüfung – bewusst gezeigt/erwähnt.

## 4. Folienübersicht

### 4.1 Alle 39 Folien (Reihenfolge wie in `pattern-matching.adoc`)

Cut: **K** = Kürzungskandidat (im Sprechtext markiert „Candidate to cut if time is short“), **M** = Must-have, **N** = Nice-to-have.

| # | Titel (On-Slide) | Kernbotschaft | Feature / Beispiel | Cut |
|---|---|---|---|---|
| 1 | Let's introduce our example | Medication plan als durchgängiges Beispiel (Klassendiagramm) | Dosage-Diagramm | M |
| 2 | Inspired by | Quelle des Beispiels (Sums & Products Blogpost) | Bild + Link | N |
| 3 | The Model in Code | Das Diagramm 1:1 als Java-Code | Records/sealed/enum | M |
| 4 | Data-Oriented Programming | Das ist die Idee hinter dem Beispiel: Daten als Daten modellieren | DOP | M |
| 5 | Java's Toolbox for DOP | Records (product), sealed (sum), pattern matching greifen ineinander | Überblick | M |
| 6 | The Classic `switch` | Enum `Drug` im alten Switch: Fallthrough, Statement, `default` vergessen | Enum | K |
| 7 | Switch Expressions | Standalone: sichere Ausdrücke (liefern Wert, kein Fallthrough, vollständig) | `Drug` | M |
| 8 | Records: Data Carriers | Transparente, immutable Datenträger ohne Boilerplate | `Tablet`, `Medication`, … | M |
| 9 | Records: Validation | Kompakter Konstruktor validiert an der Grenze | `Tablet` | M |
| 10 | Records: Invariants | Gleiche Idee für `Infusion` | `Infusion` | K |
| 11 | Records: Immutability | `List.copyOf` – Felder sind final, Komponenten aber evtl. nicht | `MedicationPlan` | K |
| 12 | Which Dosages Are Valid? | Tablets **oder** Infusion – Wahl modellieren | `Dosage` | M |
| 13 | Sealed Types | Standalone: kontrollierte Hierarchie, Compiler kennt alle Untertypen | `sealed Dosage` | M |
| 14 | Algebraic Data Types | Produkt (Records) + Summe (sealed/enums) = ADT | Diagramm | M |
| 15 | Type Patterns: `instanceof` (old) | Instanceof + Cast + Variable | `Dosage` | N |
| 16 | Type Patterns: `instanceof` (new) | Standalone: weniger Boilerplate, kein falscher Cast | `instanceof Tablet t` | M |
| 17 | Type Patterns: Scope | Flow Scoping: wo die Variable gilt | `!(x instanceof …)` | K |
| 18 | Pattern Matching for `switch` | Verzweigen nach Typ ohne instanceof-Ketten | `switch (dosage)` | M |
| 19 | Exhaustiveness | sealed + switch: Compiler erzwingt Vollständigkeit, kein `default` | sealed | M |
| 20 | Guards (when clause) | `when` für zusätzliche Bedingung | `Tablet t when …` | M |
| 21 | Dominance | Allgemeiner Fall vor spezifischem → Compilerfehler | Mini (Object/String) | K |
| 22 | `null` handling | NPE per Default; `case null` optional | Mini | N |
| 23 | Record Patterns | Standalone: Komponenten ohne Accessor-Aufrufe | `Tablet(var m, var d, var e)` | M |
| 24 | Nested Record Patterns | Patterns so tief wie die Daten | `Medication(Drug, Tablet(...))` | M |
| 25 | Nested Patterns and Guards | Erst Form, dann Details | verschachtelt + `when` | K |
| 26 | Unnamed Patterns | Standalone: sagen, was einen nicht interessiert | `Tablet(_, _, var e)` | M |
| 27 | Unnamed Variables | `_` auch bei catch/Schleifen/Lambdas | `catch (… _)` | N |
| 28 | Primitive Patterns | Preview (JEP 532): Patterns für primitive Typen | Mini-Beispiel | N |
| 29 | Primitive Patterns: Records | In Record Patterns und Switches | `MedicationPlanPrimitives` | K |
| 30 | Goetz's Four Principles | Model the data; immutable; validate at the boundary; illegal states unrepresentable | Verweis auf frühere Folien | M |
| 31 | Revised: Parlog's DOP v1.1 | Vier Prinzipien v1.1 (Folie hat Bullet 1 und 4 grün) | – | M |
| 32 | From 1.0 to 1.1 | Was sich zwischen den Fassungen geändert hat | – | K |
| 33 | The Principles in Dosage | Kapitel in vier Zeilen: Prinzip → Beispiel | Dosage | M |
| 34 | Adding an Operation | Neue Operation = ein neuer switch, Daten unverändert | `dailyPills` | M |
| 35 | Adding an Alternative | Neue Variante `Patch`: Compiler meldet alle unvollständigen switches | `Patch` | M |
| 36 | OOP and DOP | Komplementäre Werkzeuge, nicht „OOP ist tot“ | – | M |
| 37 | When to Use DOP | Teilsysteme/Datenfluss, nicht das ganze System | – | K |
| 38 | What Matters | Jedes Feature allein nützlich; Kombination verändert das Modellieren | – | M |
| 39 | Summary | **Einzige Folie mit Versionen und JEP-Links** (Tabelle) | – | M |

### 4.2 Priorisierung

- **Must-have**: 1, 3, 4, 5, 7, 8, 9, 12, 13, 14, 16, 18, 19, 20, 23, 24, 26, 30, 31, 33, 34, 35, 36, 38, 39
- **Nice-to-have**: 2, 15, 22, 27, 28
- **Cut first** (in dieser Reihenfolge laut Sprechtext): Classic `switch` (6), Scope (17), Records: Invariants (10) / Immutability (11), From 1.0 to 1.1 (32), Dominance (21), Nested+Guards (25), Primitive Records (29), When to Use DOP (37)
- Beim Kürzen darf der eigenständige Nutzen von Switch Expressions, Records, Sealed, Type Patterns, Switch Patterns, Record Patterns, Unnamed Patterns **nicht** wegfallen.

## 5. DOP-Quellen im Vergleich

**Brian Goetz, „Data-Oriented Programming in Java“ (InfoQ, 2022):** <https://www.infoq.com/articles/data-oriented-programming-java/>
Vier Prinzipien: (1) model the data, the whole data, and nothing but the data; (2) data is immutable; (3) validate at the boundary; (4) make illegal states unrepresentable.
Weitere Kernaussagen: Records = Produkttypen, sealed types = Summentypen („aggregation and choice“); DOP ist kein Ersatz für OOP: „It's not either/or“.

**Nicolai Parlog, DOP v1.1 (inside.java, 6 Teile, Mai/Juni 2024):**
1. Einführung: <https://inside.java/2024/05/23/dop-v1-1-introduction/>
2. Immutable and transparent data: <https://inside.java/2024/05/27/dop-v1-1-immutable-transparent-data/>
3. Model data: <https://inside.java/2024/05/29/dop-v1-1-model-data/>
4. Illegal states: <https://inside.java/2024/06/03/dop-v1-1-illegal-states/>
5. Separate operations: <https://inside.java/2024/06/05/dop-v1-1-separate-operations/>
6. Wrap-up: <https://inside.java/2024/06/10/dop-v1-1-wrap-up/>

Prinzipien v1.1: (1) data is immutable **and transparent**; (2) model the data, the whole data, nothing but the data; (3) make illegal states unrepresentable (inkl. Validierung an der Grenze); (4) **separate operations from data**. DOP braucht Java 21+. DOP liegt zwischen FP und OOP, näher an FP; gelebt ~18 Monate in Demos, Hobbyprojekten und einem Produktivprojekt.

**Unterschiede (so auf Folie 32 erklärt):**
- „Immutable“ → „immutable **and transparent**“ (Records sind beides).
- „Validate at the boundary“ geht in „illegal states unrepresentable“ auf.
- „Operations separate from data“ ist neu **explizit** (bei Goetz eher implizit – meine Lesart, im Sprechtext vorsichtig formuliert).
- Beziehung: Goetz = Idee und Prinzipien (2022); Parlog = geschärfte, in der Praxis erprobte Fassung (2024).

## 6. Quellenzuordnung, Konflikte, offene Punkte

### 6.1 Quellen

- `pattern-matching copy.adoc` (ältere Folien, Repo `slides/java-17+`) – erster Stand, nicht übernommen; Struktur stattdessen neu.
- `input/pattern-matching-vortrag.md` – Diskussionsentwurf (40 min, 9 Abschnitte).
- `input/Data-Oriented-Programming.pptx` (Folien 42–74, OOP vs DOP: 83–84), `input/Java-Pattern-Matching.pptx`.
- `input/Funktionale Programmierung mit Java - Bobkonf.pptx`: Dosage-Beispiel (Folien 22–35, 51–53).
- Alte Repo-Decks (`java-dop`, `patterns`, `project-amber`, `java-next`, `java-x`) nur als Referenz; z. B. `java-dop/dop-outro.adoc` hat eine ADT-Folie (Goetz-Zitat „This simple combination of mechanisms -- aggregation and choice -- is deceptively powerful“).
- Frühere Kapitelplanung `01-pattern-matching.adoc` (13 Folien); `readme.txt` nennt 35 Minuten.

### 6.2 Veraltete/fehlerhafte Aussagen in den Quellen (nicht übernehmen)

- Alte Decks (2024): „Record Patterns Java 19“ (falsch, final ist Java 21), Array Patterns (wurden gestrichen), primitive patterns als „early preview“.
- Bobkonf Folie 18 vermischt Value Classes (JEP 401) mit Primitive Patterns (JEP 532); Folie 33 sagt „Pattern Matching ab Java 12“ (ungenau).
- Goetz-Artikel: kleine Codefehler.
- Domänen-Namen variieren (Conference Planner vs. Dosage; `Infusion(double …)`; `Medication(String drugName, …)`).
- Das `ConferencePlanner`-Demo hat ein `classify(long)`-Mini-Beispiel für Primitive.

### 6.3 Offene Entscheidungen

- `int` oder `double` für `Infusion.speed`? (aktuell `int`)
- Drug-Namen beibehalten (Paracetamol, Ibuprofen, Caffeine)?
- Preview-Badge auf den Primitive-Folien? (aktuell nein)
- Soll das Footer-Logo (embarc) ebenfalls ohne weißen Rahmen sein? (Titelfolie: ohne, Footer: mit Rahmen)
- Alter Worktree-Branch `sippsack-fantastic-disco` verwerfen?
- Uncommitted im Repo: borderless-Logo in `_shared/event-on-title-and-footer-guest.adoc`; `images/sums-products.png` ist untracked.

## 7. Technik- und Layout-Hinweise (Reveal.js + AsciiDoc, nipa-night-Theme)

### 7.1 Build (temporär, nichts im Repo belassen)

- `generate.js` nach `_tmpgen.js` kopieren, dort `.filter(dir => dir !== \`node_modules\`)` durch `.filter(dir => dir === 'java-17+')` ersetzen, `node _tmpgen.js`, danach Datei löschen.
- Ausgabe: `_slides/java-17+/index.html` (git-ignoriert), Bilder mit Hash-Namen in `_slides/_images/`.
- Slide-IDs entstehen aus dem Titel (`_inspired_by`, `_javas_toolbox_for_dop`, `_algebraic_data_types`); Apostroph wird entfernt, doppelte Titel → `_2`.

### 7.2 Layout-Eigenheiten

- Theme-Codeschrift 28 px → für lange Snippets `[source,java,role=compact]` (22 px, CSS im Inline-`<style>` am Anfang von `pattern-matching.adoc`).
- Titel länger als ~28 Zeichen brechen um und schieben den Inhalt heraus. Das Theme setzt Überschriften in Title Case.
- Codezeilen ≤ ~54 Zeichen (nach 4 Tabs). Inhaltsbereich ≈ 1334 px breit (x 293–1627), muss über ~1035 px (Footer) enden.
- AsciiDoc: Backtick direkt neben Buchstaben rendert falsch.
- Fragmente: `[%step]` / `[step=N]`; Sprechtext: `[NOTE.speaker]` + `--` Block.
- Hilfsklassen: `.small-note`, `.tight`, `.compact`, `.green` (Theme-Grün `#17ff2e`).
- Footer wird per JS nach `document.body` verschoben; Teilnehmerbilder haben Klasse `logo` (30 px, weißer Rand 1px).
- Gast-Variablen in `_presentation.adoc`: `:guest-company-url: https://www.embarc.de/en/`, `:guest-company-logo: images/embarc.png`.

### 7.3 Overflow-Checker (Playwright, getestet)

`npm i playwright` (Chrome vorhanden, Pfad ggf. anpassen). Aufruf: `node check-overflow.js <abs. Pfad zu index.html> [erste-id] [letzte-id]`. Keine Ausgabe = kein Überlauf.

```js
// check-overflow.js
const { chromium } = require('playwright');
(async () => {
  const [file, first, last] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + file);
  await p.waitForFunction(() => window.Reveal && Reveal.isReady(), null, { timeout: 90000 });
  await p.addStyleTag({ content: '.fragment{opacity:1!important;visibility:visible!important}' });
  const slides = await p.evaluate(() => Reveal.getSlides().filter(s => s.id).map(s => s.id));
  const from = first ? slides.indexOf(first) : 0, to = last ? slides.indexOf(last) : slides.length - 1;
  for (const id of slides.slice(from, to + 1)) {
    const r = await p.evaluate(id => {
      Reveal.configure({ transition: 'none' });
      const s = document.getElementById(id), i = Reveal.getIndices(s); Reveal.slide(i.h, i.v);
      const box = s.getBoundingClientRect(), out = [];
      for (const e of s.querySelectorAll('*')) {
        const r = e.getBoundingClientRect();
        if (!r.width || e.closest('aside.notes')) continue;
        if (r.right > box.right + 2) out.push('RIGHT ' + e.tagName + ' +' + Math.round(r.right - box.right));
        if (r.bottom > 1035) out.push('FOOTER/BOTTOM ' + e.tagName + ' ' + Math.round(r.bottom));
        if (['PRE', 'CODE', 'TABLE'].includes(e.tagName) && e.scrollWidth > e.clientWidth + 1) out.push('SCROLLX ' + e.tagName);
      }
      return [...new Set(out)];
    }, id);
    await p.waitForTimeout(150);
    if (r.length) console.log(id, r.join('; '));
  }
  await b.close();
})();
```

### 7.4 Bilder (nicht eingebettet)

- `images/sums-products.png` – Screenshot des Blogposts (Quelle in 3.1).
- `images/embarc.png` – weißes embarc-Logo (Titelfolie ohne Rahmen, Footer mit weißem Rahmen).
- Klassendiagramm: inline-SVG direkt in `pattern-matching.adoc` (Folie 1, Anhang A).

## 8. Vorbereitete Q&A-Antwort: Sealed Interfaces über mehrere Packages (Event Sourcing)

**Frage:** „Are there plans on making sealed interfaces usable across multiple packages? E.g. `Event` in `events`, versions v1, v2 … in sub-packages.“

**Antwort (gegen JEP 409 geprüft):**
- Das geht bereits, solange alles im **selben benannten Modul** liegt: Permitted subclasses dürfen in beliebigen Packages desselben Moduls liegen (`permits events.v1.OrderCreated, events.v2.OrderCreated` mit voll qualifizierten Namen). Nur im **unnamed module** müssen sie im selben Package liegen.
- **Nicht** möglich: Permitted subclasses in einem *anderen Modul* (JEP 409: accessible-for-implementation nur im selben Modul bzw. Package im unnamed module).
- Jede erlaubte Unterklasse muss `final`, `sealed` oder `non-sealed` sein und direkt vom sealed type ableiten.
- Praktischer Tipp für Versionierung: Pro Version ein eigenes sealed interface (`EventV1`, `EventV2`) und ein Wrapper/Mapping auf aktuelle Version („upcasting“), oder Module-Info nutzen und alles in ein Modul legen; `non-sealed` als bewusste Öffnung.
- Pläne zur Aufweichung (modulübergreifendes Sealing): **mir ist keine bekannt** und JEP 409 nennt sie nicht unter „Future Work“. Das ist meine Einschätzung, nicht eine offizielle Aussage – im Vortrag nicht als „es gibt keine Pläne“ versprechen, sondern „aktuell nicht geplant, soweit ich weiß“.

## 9. Anhang – Originaldateien (verbatim)

Die folgenden Abschnitte enthalten die Dateien vollständig. Pfade relativ zu `slides/java-17+/` im Repo (Branch `devoxx-be-26`).
Fences mit fünf Backticks, damit Inhalte mit Backticks/AsciiDoc-Code nicht kollidieren.

### Anhang A: `pattern-matching.adoc` (Folien + Sprechtext, 39 Folien)

`````asciidoc
== {title}

{toc}

++++
<style>
.reveal .listingblock.compact pre code.hljs {
	font-size: 22px;
}
.reveal .green {
	color: #17ff2e;
}
.reveal table.tight th, .reveal table.tight td {
	padding: 0.1em 0.5em;
}
</style>
++++

=== Let's introduce our example

++++
<div style="text-align: center;">
<svg viewBox="0 0 1440 540" style="width: 100%; max-height: 72vh;" font-family="'Fira Mono', Menlo, Consolas, monospace" role="img" aria-label="Class diagram of the medication plan">
<defs>
<marker id="mp-has" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto"><path d="M1,1 L11,6 L1,11" fill="none" stroke="#cfd8e3" stroke-width="2"/></marker>
<marker id="mp-is" viewBox="0 0 14 14" refX="13" refY="7" markerWidth="14" markerHeight="14" orient="auto"><path d="M1,1 L13,7 L1,13 Z" fill="#161d2b" stroke="#cfd8e3" stroke-width="2"/></marker>
</defs>
<rect x="0" y="215" width="380" height="132" rx="8" fill="#161d2b" stroke="#3fa9ff" stroke-width="3"/>
<path d="M0,271 V223 a8,8 0 0 1 8,-8 H372 a8,8 0 0 1 8,8 V271 Z" fill="#3fa9ff" fill-opacity="0.9"/>
<text x="190.0" y="235" text-anchor="middle" font-size="15" font-style="italic" fill="#10151f">«record»</text>
<text x="190.0" y="259" text-anchor="middle" font-size="24" font-weight="bold" fill="#10151f">MedicationPlan</text>
<text x="16" y="296" font-size="20" fill="#f2f5fa">String patientName</text>
<text x="16" y="330" font-size="20" fill="#f2f5fa">List&lt;Medication&gt; medications</text>
<g class="fragment" data-fragment-index="1">
<line x1="380" y1="281" x2="448" y2="281" stroke="#cfd8e3" stroke-width="2.5" marker-end="url(#mp-has)"/>
<rect x="450" y="215" width="250" height="132" rx="8" fill="#161d2b" stroke="#3fa9ff" stroke-width="3"/>
<path d="M450,271 V223 a8,8 0 0 1 8,-8 H692 a8,8 0 0 1 8,8 V271 Z" fill="#3fa9ff" fill-opacity="0.9"/>
<text x="575.0" y="235" text-anchor="middle" font-size="15" font-style="italic" fill="#10151f">«record»</text>
<text x="575.0" y="259" text-anchor="middle" font-size="24" font-weight="bold" fill="#10151f">Medication</text>
<text x="466" y="296" font-size="20" fill="#f2f5fa">Drug drug</text>
<text x="466" y="330" font-size="20" fill="#f2f5fa">Dosage dosage</text>
</g>
<g class="fragment" data-fragment-index="2">
<line x1="700" y1="245" x2="788" y2="93" stroke="#cfd8e3" stroke-width="2.5" marker-end="url(#mp-has)"/>
<rect x="790" y="10" width="300" height="166" rx="8" fill="#161d2b" stroke="#ffb347" stroke-width="3"/>
<path d="M790,66 V18 a8,8 0 0 1 8,-8 H1082 a8,8 0 0 1 8,8 V66 Z" fill="#ffb347" fill-opacity="0.9"/>
<text x="940.0" y="30" text-anchor="middle" font-size="15" font-style="italic" fill="#10151f">«enum»</text>
<text x="940.0" y="54" text-anchor="middle" font-size="24" font-weight="bold" fill="#10151f">Drug</text>
<text x="806" y="91" font-size="20" fill="#f2f5fa">PARACETAMOL</text>
<text x="806" y="125" font-size="20" fill="#f2f5fa">IBUPROFEN</text>
<text x="806" y="159" font-size="20" fill="#f2f5fa">CAFFEINE</text>
</g>
<g class="fragment" data-fragment-index="3">
<line x1="700" y1="320" x2="788" y2="339" stroke="#cfd8e3" stroke-width="2.5" marker-end="url(#mp-has)"/>
<rect x="790" y="290" width="320" height="98" rx="8" fill="#161d2b" stroke="#ffb347" stroke-width="3"/>
<path d="M790,346 V298 a8,8 0 0 1 8,-8 H1102 a8,8 0 0 1 8,8 V346 Z" fill="#ffb347" fill-opacity="0.9"/>
<text x="950.0" y="310" text-anchor="middle" font-size="15" font-style="italic" fill="#10151f">«sealed interface»</text>
<text x="950.0" y="334" text-anchor="middle" font-size="24" font-weight="bold" fill="#10151f">Dosage</text>
<text x="806" y="371" font-size="20" fill="#f2f5fa">permits Tablet, Infusion</text>
</g>
<g class="fragment" data-fragment-index="4">
<line x1="1190" y1="223" x2="1112" y2="322" stroke="#cfd8e3" stroke-width="2.5" stroke-dasharray="9 6" marker-end="url(#mp-is)"/>
<line x1="1190" y1="446" x2="1112" y2="358" stroke="#cfd8e3" stroke-width="2.5" stroke-dasharray="9 6" marker-end="url(#mp-is)"/>
<rect x="1190" y="140" width="250" height="166" rx="8" fill="#161d2b" stroke="#3fa9ff" stroke-width="3"/>
<path d="M1190,196 V148 a8,8 0 0 1 8,-8 H1432 a8,8 0 0 1 8,8 V196 Z" fill="#3fa9ff" fill-opacity="0.9"/>
<text x="1315.0" y="160" text-anchor="middle" font-size="15" font-style="italic" fill="#10151f">«record»</text>
<text x="1315.0" y="184" text-anchor="middle" font-size="24" font-weight="bold" fill="#10151f">Tablet</text>
<text x="1206" y="221" font-size="20" fill="#f2f5fa">int morning</text>
<text x="1206" y="255" font-size="20" fill="#f2f5fa">int midday</text>
<text x="1206" y="289" font-size="20" fill="#f2f5fa">int evening</text>
<rect x="1190" y="380" width="250" height="132" rx="8" fill="#161d2b" stroke="#3fa9ff" stroke-width="3"/>
<path d="M1190,436 V388 a8,8 0 0 1 8,-8 H1432 a8,8 0 0 1 8,8 V436 Z" fill="#3fa9ff" fill-opacity="0.9"/>
<text x="1315.0" y="400" text-anchor="middle" font-size="15" font-style="italic" fill="#10151f">«record»</text>
<text x="1315.0" y="424" text-anchor="middle" font-size="24" font-weight="bold" fill="#10151f">Infusion</text>
<text x="1206" y="461" font-size="20" fill="#f2f5fa">int speed</text>
<text x="1206" y="495" font-size="20" fill="#f2f5fa">int duration</text>
</g>
</svg>
</div>
++++

[NOTE.speaker]
--
Our running example for this chapter: a medication plan, as a hospital system might process it.
(Blue types combine several values, orange types are a choice between alternatives.)

Click through the diagram:

* A plan belongs to a patient and consists of medications.
* Each medication is a drug ...
* ... that is one of a few known drugs, ...
* ... with a dosage that is either tablets (morning, midday, evening) or an infusion (speed and duration).
* The two dosages are alternatives: never both, never neither.

The values are made up and not medical advice.
--

=== Inspired by

++++
<div style="text-align: center;">
<img src="images/sums-products.png" alt="Blog post: Data Modeling with Sums and Products" style="max-height: 42vh; width: auto;">
</div>
++++

[.small-note]
https://funktionale-programmierung.de/en/2024/11/25/sums-products.html[funktionale-programmierung.de/en/2024/11/25/sums-products.html^]

[NOTE.speaker]
--
Das Beispiel ist inspiriert von diesem Blog-Post: "Data Modeling with Sums and Products" von Michael Sperber und Stefan Wehr (funktionale-programmierung.de, November 2024).
Der Post beschreibt Produkte (records, "und") und Summen (alternatives, "oder") als die zwei Grundwerkzeuge für gute Datenmodelle, genau das, was in unserem Diagramm blau und orange eingefärbt ist.
Der Link steht auf der Folie, falls jemand nachlesen möchte.
--

=== The Model in Code

[source,java]
----
include::demos/MedicationPlan.java[tag=model,indent=0]
----

[step=1]
Heavily using modern Java features: Records, Sealed Classes, ...
[NOTE.speaker]
--
This is the whole diagram as Java code.
Please don't try to read every keyword right now:
we'll take the pieces apart one by one on the following slides
and see what each of them is good for on its own.

For now, just notice that the code mirrors the diagram almost 1:1.
--

=== Data-Oriented Programming

[%step]
* *Data* comes first: +
  model it precisely, immutably, transparently
* *Operations* come second: +
  separate functions from data to data
* *Programs* are production lines (batch processing): +
  data flows in, gets transformed, flows out

[NOTE.speaker]
--
That's the idea behind the example: data-oriented programming.
The data is modeled as data and nothing else.
The operations on that data don't live in the data types
but next to them, as functions that take data and return data.
Together they form a production line, not a network of interacting objects.

This works best for smaller (sub)systems that mainly turn input into output,
e.g. batch jobs, event processing, or tools that analyze or transform a structure.
We'll come back to when to use it, and to the guidelines behind it, after the language features.
--

=== Java's Toolbox for DOP

Three language features fit the diagram:

[step=1]
*Records* ⇝ data as data (product types) +
`Tablet`, `Infusion`, `Medication`, `MedicationPlan`

[step=2]
*Sealed types* ⇝ alternatives (sum types) +
`Dosage`

[step=3]
*Pattern matching* ⇝ operations on data +
e.g. `describe(Dosage)`

[step=4]
Let's take them apart, one by one.

[NOTE.speaker]
--
Records, sealed types, and pattern matching work together,
but each of them is useful on its own.
(Records and sealed types together are what functional languages call algebraic data types, more on that soon.)
That's how we'll approach them:
first the small features that make this possible
(switch expressions, then records, type patterns, and sealed types),
then pattern matching on top of them,
and finally the question of how this changes the way we design code.
--

=== The Classic `switch`

[source,java,role=compact]
----
include::demos/MedicationPlan.java[tag=switch-old,indent=0]
----

[step=1]
A statement: mutable variable, `break`, fall-through

[step=2]
`default` hides cases that are added later

[NOTE.speaker]
--
Let's start with the orange `Drug` enum from the diagram:
a fixed set of options, and we want to map each of them to something.
The classic switch is a statement, so we need a variable that we assign in each branch.
Forgetting a `break` silently falls through to the next branch.
And a `default` branch, which we add to make the compiler happy,
also swallows every constant we add to the enum later.
Candidate to cut if time is short.
--

=== Switch Expressions

[source,java]
----
include::demos/MedicationPlan.java[tag=switch-expression,indent=0]
----

[%step]
* An *expression*: it yields a value
* No fall-through, no `break`
* Exhaustive: no `default` needed ⇝ +
  new `Drug`? Compile error!

[NOTE.speaker]
--
Standalone benefit: safe expressions.
The switch returns the result directly, so there is no half-initialized variable.
The arrow form never falls through, and `case A, B` groups labels.
For enums, the compiler checks that every constant is covered, without a `default`.
If somebody adds `Drug.ASPIRIN`, every switch like this one stops compiling
instead of silently returning the wrong thing.

(If you need several statements in a branch: use a block and `yield` the result.)
--

=== Records: Data Carriers

[source,java,role=compact]
----
include::demos/MedicationPlanValidation.java[tag=records-basics,indent=0]
----

[%step]
* *Transparent:* the state *is* the components
* *Immutable:* no setters, final fields
* Constructor, accessors, `equals`, `hashCode`, `toString` ⇝ for free

[NOTE.speaker]
--
Back to the blue boxes of the diagram: `Tablet`, `Infusion`, `Medication`, `MedicationPlan`.
A record declaration lists the components, and that's all.
Standalone benefit: transparent, immutable data carriers without boilerplate.
Two tablets with the same numbers are equal; the string representation is useful in logs and tests.
Records are final and can implement interfaces (as `Tablet` implements `Dosage`),
but they can't extend classes and can't have additional instance fields.
"Changing" a record means creating a new one.
--

=== Records: Validation

[source,java,role=compact]
----
include::demos/MedicationPlanValidation.java[tag=validation-tablet,indent=0]
----

[step=1]
Compact constructor ⇝ invalid data can't exist

[NOTE.speaker]
--
Records are transparent, but not naive:
the compact constructor runs before the fields are assigned,
so it's the right place to reject invalid values.
No `Tablet` with negative counts can ever exist, no matter where it's created.
That's validation at the boundary: later code can rely on it.
--

=== Records: Invariants

[source,java,role=compact]
----
include::demos/MedicationPlanValidation.java[tag=validation-infusion,indent=0]
----

[step=1]
Every record guards its own invariants

[NOTE.speaker]
--
Same idea for the second alternative:
no `Infusion` without a positive speed and duration can ever exist.
Each type enforces its own rules, so no operation has to re-check them.
Candidate to cut if time is short: skip this slide and only mention that `Infusion` does the same.
--

=== Records: Immutability

[source,java]
----
include::demos/MedicationPlanValidation.java[tag=immutable,indent=0]
----

[step=1]
Records are only *shallowly* immutable. +
`List.copyOf` to the rescue (defensive copies).

[NOTE.speaker]
--
A record's fields are final, but a `List` component could still be changed by whoever holds the original list.
The defensive copy in the compact constructor makes `MedicationPlan` truly immutable
(and `List.copyOf` doesn't copy if the list is already immutable).
Candidate to cut if time is short.
--

=== Which Dosages Are Valid?

[source,java,role=compact]
----
include::demos/MedicationPlanValidation.java[tag=illegal-states,indent=0]
----

[step=1]
One type for everything ⇝ +
illegal states are *representable*

[NOTE.speaker]
--
Now the orange `Dosage`: tablets *or* infusion.
The obvious first attempt is a single record with all fields, and `null` for those that don't apply.
Nothing stops us from creating a dosage that is both, or neither.
Every operation then has to check for these cases.
We want the opposite: make illegal states unrepresentable.
--

=== Sealed Types

[source,java]
----
include::demos/MedicationPlan.java[tag=sealed,indent=0]
----

[%step]
* A *closed* set of alternatives: +
  `permits` lists all subtypes
* Compiler and readers know *all* variants
* Records as variants ⇝ transparent alternatives

[NOTE.speaker]
--
Standalone benefit: a controlled hierarchy.
With a sealed interface, only the permitted types can implement `Dosage`:
exactly `Tablet` or `Infusion`, never both, never anything else.
That's the same as an interface with two implementations,
but the compiler now knows that there are no others.
(If all subtypes are in the same file, `permits` can be omitted.)
Now that the compiler knows the full set, we can build on that. See: exhaustive switches.
--

=== Algebraic Data Types

[cols="1,1",frame=none,grid=none]
|===
| *Product types* +
_this *and* that_
| *Sum types* +
_this *or* that_

a|
* `Tablet` +
  = `int` & `int` & `int`
* `Medication` +
  = `Drug` & `Dosage`

a|
* `Dosage` +
  = `Tablet` \| `Infusion`
* `Drug` +
  = `PARACETAMOL` \| ...
|===

[step=1]
Records + sealed types = *algebraic data types*

[NOTE.speaker]
--
Time to give the combination a name. The diagram we started with is built from just two kinds of building blocks:

* Records are *product types*: a value consists of all of its components at once (aggregation).
* Sealed types (and enums) are *sum types*: a value is exactly one of a fixed set of alternatives (choice).

Combine the two and you can model almost any data: a plan has medications, a medication has a dosage, a dosage is tablets or an infusion.
That's what functional languages like Haskell, Scala, or Kotlin call algebraic data types.
Java now has both halves, with records and sealed types, plus pattern matching to take them apart.
Goetz in his article: this simple combination of mechanisms, aggregation and choice, is deceptively powerful.

Standalone benefit: a precise vocabulary for data modeling that works in any language with these features.
Keep it short, the point is only the name.
--

=== Type Patterns: `instanceof`

[source,java]
----
include::demos/MedicationPlan.java[tag=instanceof-old,indent=0]
----

[step=1]
Test, cast, assign: three steps for one idea.

[NOTE.speaker]
--
How do we get from a `Dosage` to the `Tablet` inside? The classic way:
test the type, cast, assign to a variable.
The same type is mentioned three times, and the cast can go wrong if we change one of them.
--

=== Type Patterns: `instanceof`

[source,java]
----
include::demos/MedicationPlan.java[tag=instanceof,indent=0]
----

[step=1]
Test, cast, and bind in one: +
`dosage instanceof Tablet tablet`

[NOTE.speaker]
--
Standalone benefit: less boilerplate and no cast to get wrong.
`Tablet tablet` is a type pattern: if the value matches, it is bound to `tablet`.
--

=== Type Patterns: Scope

[source,java,role=compact]
----
include::demos/MedicationPlan.java[tag=instanceof-scope,indent=0]
----

[step=1]
The binding is in scope *where the test is true*.

[NOTE.speaker]
--
The compiler tracks where the pattern variable is definitely matched:
in the right operand of `&&`, in the `if` branch, or, as in the second method,
after an early return when the negated test failed.
This is "flow scoping". Candidate to cut if time is short.
--

=== Pattern Matching for `switch`

[source,java,role=compact]
----
include::demos/MedicationPlan.java[tag=switch-type-patterns,indent=0]
----

[%step]
* Type patterns as `case` labels
* One branch per alternative
* No `if`-`else` chain, no casts

[NOTE.speaker]
--
Standalone benefit: branching on the type of an object, without instanceof chains.
Combine this with the sealed `Dosage` and we have a function over the diagram's alternatives:
one case for `Tablet`, one for `Infusion`.
Unlike the visitor pattern, the operation lives next to the data, not inside it.
--

=== Exhaustiveness

[source,java,role=compact]
----
include::demos/MedicationPlan.java[tag=exhaustiveness-error,indent=0]
----

[%step]
* Sealed types ⇝ the compiler knows all cases
* Missing one? *Compile error*
* No `default` ⇝ a new subtype breaks *every* `switch` that needs updating

[NOTE.speaker]
--
Sealed types and pattern matching pay off together.
Remove the `Infusion` case and the compiler rejects the switch.
Even better, the other direction: when somebody adds a third dosage type later,
every switch over `Dosage` stops compiling
and points exactly to the places that need to handle it.
That's why a `default` branch is usually a bad idea on sealed types.
--

=== Guards (when clause)

[source,java,role=compact]
----
include::demos/MedicationPlan.java[tag=guards,indent=0]
----

[step=1]
`case Type t when condition` ⇝ refine a pattern

[NOTE.speaker]
--
The type alone often isn't enough, so a `when` clause adds a condition.
Cases are checked top to bottom: the first match wins,
so the specific cases with a guard come before the general one.
(Dose limits are made up and not medical advice.)
--

=== Dominance

[source,java,role=compact]
----
include::demos/MedicationPlan.java[tag=dominance,indent=0]
----

[step=1]
General before specific? *Compile error*.

[NOTE.speaker]
--
If a general case comes first, the specific one can never be reached.
The compiler detects this ("dominated") and rejects it, so order mistakes can't hide.
Candidate to cut if time is short.
--

=== `null` handling

[source,java]
----
include::demos/MedicationPlan.java[tag=null,indent=0]
----

[%step]
* Without `case null`: `NullPointerException`
* `case null` ⇝ handle it in the same switch
* `case null, default` ⇝ combine with the fallback

[NOTE.speaker]
--
A switch has always thrown a `NullPointerException` for `null`; that's still the default.
With `case null` the switch can handle it explicitly, which makes `null` just another case.
That's optional: in our model there should be no `null` dosages (validated at the boundary),
so use it where `null` is a legitimate input.
`case null, default` is the combination for non-sealed types.
--

=== Record Patterns

[source,java,role=compact]
----
include::demos/MedicationPlan.java[tag=record-patterns,indent=0]
----

[%step]
* Test the type *and* deconstruct it
* Components are bound to variables directly
* Construction and deconstruction are symmetric

[NOTE.speaker]
--
Standalone benefit: access to the components without accessor calls.
`Tablet(int morning, int midday, int evening)` is the exact mirror image of `new Tablet(1, 0, 1)`.
This is where transparent records pay off: the pattern knows the components.
`var` can replace the component types.
--

=== Nested Record Patterns

[source,java,role=compact]
----
include::demos/MedicationPlan.java[tag=record-patterns-nested,indent=0]
----

[%step]
* Patterns nest like the data: `Medication(Drug, Tablet(...))`
* One `switch` instead of nested `if` statements
* Still exhaustive!

[NOTE.speaker]
--
Records contain records, so patterns can be nested as deep as the data.
This one matches a medication, and in the same step the kind of dosage inside it,
and binds all values it needs.
It's the diagram, as a pattern.
The compiler still checks exhaustiveness across the nesting.
A pattern for the `List<Medication>` in `MedicationPlan` doesn't exist: we use a stream or loop for collections.
--

=== Nested Patterns and Guards

[source,java,role=compact]
----
include::demos/MedicationPlan.java[tag=record-patterns-guard,indent=0]
----

[step=1]
Match the shape first, then refine with `when`.

[NOTE.speaker]
--
Shape first, details second: the pattern picks the right structure,
the guard checks the values.
Candidate to cut if time is short.
--

=== Unnamed Patterns

[source,java]
----
include::demos/MedicationPlan.java[tag=unnamed,indent=0]
----

[%step]
* `_` ⇝ "I don't need this component"
* Shows intent ⇝ no unused variables
* `Infusion(_, _)` ⇝ every component ignored

[NOTE.speaker]
--
Standalone benefit: say what you don't care about.
Record patterns have to list all components,
but we usually need only some of them.
`_` makes it explicit that a component is irrelevant, and the reader (and the compiler) don't have to look for unused variables.
--

[%skip]
=== Unnamed Variables

[source,java,role=compact]
----
include::demos/MedicationPlan.java[tag=unnamed-type,indent=0]
----

[step=1]
`_` also works for variables, type patterns, ...

[NOTE.speaker]
--
`_` isn't limited to record components:
a type pattern can be unnamed (`Tablet _`) when we only care about the type.
The same works for unused local variables, `for` loop variables, lambda parameters, and `catch` parameters.
--

=== Primitive Patterns

[source,java,role=compact]
----
include::demos/MedicationPlanPrimitives.java[tag=primitive-instanceof,indent=0]
----

[%step]
* Patterns for `byte`, `int`, `double`, ... too
* Match only if the value converts *without loss*
* Replaces manual range checks and casts

[NOTE.speaker]
--
Here the dosage example is not the best fit, so this is a mini example:
the infusion pump only accepts a `byte`, but the model uses an `int`.
`infusion.speed() instanceof byte speed` is only true if the value fits a byte exactly.
No manual range check, no lossy cast.

Status: still a preview feature. Mention that orally.
The version and JEP details are on the summary slide.
--

=== Primitive Patterns: Records

[source,java,role=compact]
----
include::demos/MedicationPlanPrimitives.java[tag=primitive-record-pattern,indent=0]
----

[%step]
* Record components can use a narrower primitive pattern
* No match ⇝ the next `case` is tried

[NOTE.speaker]
--
Primitive patterns also work in record patterns and in switches:
`Infusion(byte speed, _)` matches only if the speed fits into a byte.
Otherwise the next case is tried.
Also available: a `switch` on primitive selectors with patterns and guards (`primitive-switch` in the demo).
Candidate to cut if time is short.
--

=== Goetz's Four Principles

Brian Goetz, June 2022:

[%step]
* *Data is immutable.*
* *Model the data, the whole data, and nothing but the data.*
* *Make illegal states unrepresentable.*
* *Validate at the boundary.*

[role=small-note]
https://www.infoq.com/articles/data-oriented-programming-java/[Data Oriented Programming in Java (InfoQ)]

[NOTE.speaker]
--
We just used all of these without naming them. Where we saw them:

* Immutable: records and `List.copyOf`.
* The whole data and nothing but the data: `Medication` is exactly a drug and a dosage, no more, no less.
* Illegal states: a sealed `Dosage` is either tablets or an infusion, never both and never neither.
* Validate at the boundary: the compact constructors checked the values when the data enters the system.

These are the principles from Brian Goetz's 2022 article, as listed in the introduction of the Inside Java series
(there slightly reordered).
Standalone benefit: a checklist for reviewing a data model, independent of the Java version.
--

=== Revised: Parlog's DOP v1.1

Nicolai Parlog, 2024:

[%step]
* [.green]*Model data immutably and transparently.*
* *Model the data, the whole data, and nothing but the data.*
* *Make illegal states unrepresentable.*
* [.green]*Separate operations from data.*

[role=small-note]
https://inside.java/2024/05/23/dop-v1-1-introduction/[Data-Oriented Programming in Java - Version 1.1 (Inside Java)]

[NOTE.speaker]
--
Nicolai Parlog used DOP for about 18 months, in demos, hobby projects, and one production project,
and proposed a minor revision in a six-part series on Inside Java:

* Introduction, 23 May 2024: https://inside.java/2024/05/23/dop-v1-1-introduction/
* Immutable and transparent data, 27 May: https://inside.java/2024/05/27/dop-v1-1-immutable-transparent-data/
* Model the data, 29 May: https://inside.java/2024/05/29/dop-v1-1-model-data/
* Illegal states, 3 June: https://inside.java/2024/06/03/dop-v1-1-illegal-states/
* Separate operations, 5 June: https://inside.java/2024/06/05/dop-v1-1-separate-operations/
* Wrap-up (DOP vs. FP vs. OOP, when to use it), 10 June: https://inside.java/2024/06/10/dop-v1-1-wrap-up/
--

=== From 1.0 to 1.1

[%step]
* *Immutable* ⇝ *immutable and transparent* +
  the data must be readable, not just constant
* *Validate at the boundary* ⇝ part of *illegal states* +
  the constructor is the boundary
* *New:* *separate operations from data* +
  functions next to the types, not inside

The two "model the data" principles stay as they are.

[NOTE.speaker]
--
Same idea, sharper edges:

* Transparency is the reason pattern matching works at all: record patterns need to see the components.
  A record is both immutable and transparent, a class with private state is not.
* Validation at the boundary is one way of making illegal states unrepresentable,
  so v1.1 merges it into that principle. Compact constructors make the constructor the boundary.
* Goetz's examples already put the operations into separate methods, but it was not a principle of its own.
  Parlog makes it explicit, because it is what makes the data usable by many independent subsystems.

The two don't contradict each other: v1.1 is a minor revision, not a different philosophy.
Open point: some people prefer Goetz's original wording, so say "my reading" if challenged.
Candidate to cut if time is short: this slide (keep Goetz and v1.1 slides, point to the articles).
--

=== The Principles in Dosage

[%step]
* *Immutable, transparent:* +
  `Tablet`, `Infusion`, `List.copyOf` ...
* *Whole data, nothing else:* +
  `Medication` = `Drug` + `Dosage`
* *Illegal states:* +
  sealed `Dosage` + compact constructors
* *Separate operations:* +
  `describe`, `format`, `dailyPills` ...

[NOTE.speaker]
--
This is the whole chapter in four lines. The examples are not new, they are the slides we just saw.
The first three bullets are about the data types, the last one is about the operations,
and the operations are what we look at next:
what happens if the requirements change?
--

=== Adding an Operation

[source,java,role=compact]
----
include::demos/MedicationPlan.java[tag=new-operation,indent=0]
----

[%step]
* One new function ⇝ *no* existing type changes
* The `switch` is exhaustive: no `default` needed

[NOTE.speaker]
--
New requirement: how many pills does a patient take per day?
We write one function next to the data. `Tablet`, `Infusion`, and `Dosage` stay untouched.
In an object-oriented design this would be a new method on `Dosage`, and every implementation would change.
Operations that only one subsystem needs don't have to bloat the shared types.
--

=== Adding an Alternative

[source,java,role=compact]
----
include::demos/MedicationPlan.java[tag=new-variant,indent=0]
----

[%step]
* The compiler shows *every* `switch` that needs a new case
* Without `default` nothing is silently skipped
* Trade-off: new alternatives are the costly part

[NOTE.speaker]
--
New requirement: a medication can also be a patch.
Adding the record and extending `permits` breaks every switch over `Dosage`.
That is intended: "follow the errors" gives us a to-do list for free.
This works only because we avoided `default`. A `default` branch would silently swallow `Patch`.

The honest trade-off: with sealed types, new operations are cheap and new alternatives are expensive.
With classic inheritance it's the other way around.
That's the bridge to the next slide.
--

=== OOP and DOP

[cols="1,1",frame=none,grid=none]
|===
| *OOP*
| *DOP*

a|
[%step]
* state + behavior together
* encapsulation hides details
* open for new subtypes
* evolving processes

a|
[%step]
* data and behavior apart
* transparency exposes the data
* closed set of alternatives
* data that is passed around
|===

Complementary tools, not rivals.

[NOTE.speaker]
--
OOP is not dead (again).
Encapsulation, inheritance, and the ease of modularizing large systems keep OOP valuable,
especially for things with identity and evolving state: services, resources, the "engine" of a system.
DOP shines for the things that flow through that engine: input, events, results, and other values.
Parlog places DOP between FP and OOP, but closer to FP:
immutable data and functions, with possibly mutable subsystems around them
(see the wrap-up article of the series).
--

=== When to Use DOP

[%step]
* Data (sub)systems: +
  batch jobs, analysis, event processing
* Small problems that need no further modularization
* Data from the outside: +
  JSON, messages, ASTs, return values

Start small: even one record and one `switch` help.

[NOTE.speaker]
--
You don't have to build a whole system data-oriented.
Records, no mutation, and an exhaustive switch instead of a visitor already make a piece of code clearer.
Parlog's two situations to look for: data processing (sub)systems, and small (partial) problems.
Requirement: Java 21 or later, because pattern matching for switch is the essential part.
Candidate to cut if time is short.
--

=== What Matters

[%step]
* *Records* ⇝ data as data
* *Sealed types* ⇝ alternatives the compiler knows
* *Pattern matching* ⇝ exhaustive operations, no `default`
* *DOP* ⇝ a style that uses all three

[NOTE.speaker]
--
Each feature is useful on its own: switch expressions are safe expressions, records remove boilerplate,
type patterns remove casts, sealed types control hierarchies.
But the combination changes how we model and process data.
Next slide: the versions and JEPs for all of this.
--

=== Summary

[.small-note.tight,cols="5,2,2",options="header"]
|===
| Feature
| Final in
| JEP

| Switch expressions
| Java 14
| https://openjdk.org/jeps/361[JEP 361]

| Records
| Java 16
| https://openjdk.org/jeps/395[JEP 395]

| Type patterns for `instanceof`
| Java 16
| https://openjdk.org/jeps/394[JEP 394]

| Sealed classes and interfaces
| Java 17
| https://openjdk.org/jeps/409[JEP 409]

| Pattern matching for `switch`
| Java 21
| https://openjdk.org/jeps/441[JEP 441]

| Record patterns
| Java 21
| https://openjdk.org/jeps/440[JEP 440]

| Unnamed patterns and variables
| Java 22
| https://openjdk.org/jeps/456[JEP 456]

| Primitive types in patterns
| *Preview* (Java 27)
| https://openjdk.org/jeps/532[JEP 532]

| Data-oriented programming
| Java 21+
| &ndash;
|===

[NOTE.speaker]
--
Status as of October 2026 (JDK 27 is GA), checked on openjdk.org.
Primitive types in patterns is in its fifth preview in JDK 27 and needs `--enable-preview`.
It is not final yet.
Guards, `null` handling, exhaustiveness, and dominance are all part of JEP 441.
Everything else on this slide is final.
Data-oriented programming needs pattern matching for `switch`, so Java 21 is the minimum (as Nicolai Parlog notes in the wrap-up article).
--
`````

### Anhang B: `demos/MedicationPlan.java`

`````java
import java.util.List;

// tag::model[]
enum Drug { PARACETAMOL, IBUPROFEN, CAFFEINE }

// tag::sealed[]
sealed interface Dosage permits Tablet, Infusion { }
record Tablet(int morning, int midday, int evening)
		implements Dosage { }
record Infusion(int speed, int duration)
		implements Dosage { }
// end::sealed[]

record Medication(Drug drug, Dosage dosage) { }
record MedicationPlan(
		String patientName,
		List<Medication> medications) { }
// end::model[]

// --- Switch expressions (on Drug) ---

// tag::switch-old[]
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
// end::switch-old[]

// tag::switch-expression[]
String category(Drug drug) {
	return switch (drug) {
		case PARACETAMOL, IBUPROFEN -> "painkiller";
		case CAFFEINE -> "stimulant";
	};
}
// end::switch-expression[]

// --- Pattern matching for instanceof (type patterns) ---

// tag::instanceof-old[]
int morningPillsOld(Dosage dosage) {
	if (dosage instanceof Tablet) {
		Tablet tablet = (Tablet) dosage;
		return tablet.morning();
	}
	return 0;
}
// end::instanceof-old[]

// tag::instanceof[]
int morningPills(Dosage dosage) {
	if (dosage instanceof Tablet tablet) {
		return tablet.morning();
	}
	return 0;
}
// end::instanceof[]

// tag::instanceof-scope[]
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
// end::instanceof-scope[]

// --- Pattern matching for switch (type patterns, sealed types) ---

// tag::switch-type-patterns[]
String describe(Dosage dosage) {
	return switch (dosage) {
		case Tablet tablet -> "%d-%d-%d tablets".formatted(
				tablet.morning(), tablet.midday(), tablet.evening());
		case Infusion infusion -> "%d ml/h for %d min".formatted(
				infusion.speed(), infusion.duration());
	};
}
// end::switch-type-patterns[]

/*
// tag::exhaustiveness-error[]
String describe(Dosage dosage) {
	return switch (dosage) {
		case Tablet tablet -> "%d-%d-%d tablets".formatted(
				tablet.morning(), tablet.midday(), tablet.evening());
		// error: does not cover all possible values
	};
}
// end::exhaustiveness-error[]
*/

// --- Guards ---

// tag::guards[]
String warn(Dosage dosage) {
	return switch (dosage) {
		case Tablet t when t.morning() > 3 -> "Too many tablets";
		case Tablet t -> "OK";
		case Infusion i when i.speed() > 100 -> "Too fast";
		case Infusion i -> "OK";
	};
}
// end::guards[]

/*
// tag::dominance[]
String warn(Dosage dosage) {
	return switch (dosage) {
		case Tablet t -> "OK";
		// error: dominated by a preceding case label
		case Tablet t when t.morning() > 6 -> "Too many tablets";
		case Infusion i -> "OK";
	};
}
// end::dominance[]
*/

// --- null ---

// tag::null[]
String describeOrNone(Dosage dosage) {
	return switch (dosage) {
		case null -> "no dosage";
		case Tablet tablet -> "tablets";
		case Infusion infusion -> "infusion";
	};
}
// end::null[]

// tag::null-default[]
String describeOrNoneDefault(Dosage dosage) {
	return switch (dosage) {
		case Tablet tablet -> "tablets";
		case null, default -> "something else";
	};
}
// end::null-default[]

// --- Record patterns ---

// tag::record-patterns[]
String format(Dosage dosage) {
	return switch (dosage) {
		case Tablet(int morning, int midday, int evening) ->
			"%d-%d-%d tablets".formatted(morning, midday, evening);
		case Infusion(int speed, int duration) ->
			"%d ml/h for %d min".formatted(speed, duration);
	};
}
// end::record-patterns[]

// tag::record-patterns-var[]
String formatVar(Dosage dosage) {
	return switch (dosage) {
		case Tablet(var morning, var midday, var evening)
				-> "%d-%d-%d tablets".formatted(morning, midday, evening);
		case Infusion(var speed, var duration)
				-> "%d ml/h for %d min".formatted(speed, duration);
	};
}
// end::record-patterns-var[]

// tag::record-patterns-instanceof[]
boolean hasInfusion(Medication medication) {
	return medication instanceof Medication(var drug, Infusion infusion);
}
// end::record-patterns-instanceof[]

// tag::record-patterns-nested[]
String format(Medication medication) {
	return switch (medication) {
		case Medication(var drug,
				Tablet(var morning, var midday, var evening))
				-> "%s: %d-%d-%d".formatted(
						drug, morning, midday, evening);
		case Medication(var drug,
				Infusion(var speed, var duration))
				-> "%s: %d ml/h for %d min".formatted(
						drug, speed, duration);
	};
}
// end::record-patterns-nested[]

// tag::record-patterns-guard[]
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
// end::record-patterns-guard[]

// tag::record-patterns-plan[]
String format(MedicationPlan plan) {
	var medications = plan.medications().stream()
			.map(this::format)
			.toList();
	return plan.patientName() + "\n" + String.join("\n", medications);
}
// end::record-patterns-plan[]

// --- Unnamed patterns and variables ---

// tag::unnamed[]
int morningPillsUnnamed(Dosage dosage) {
	return switch (dosage) {
		case Tablet(var morning, _, _) -> morning;
		case Infusion(_, _) -> 0;
	};
}
// end::unnamed[]

// tag::unnamed-type[]
boolean isTablet(Medication medication) {
	return medication instanceof Medication(_, Tablet _);
}

String kind(Dosage dosage) {
	return switch (dosage) {
		case Tablet _ -> "swallow";
		case Infusion _ -> "connect";
	};
}
// end::unnamed-type[]

// tag::unnamed-loop[]
int medicationCount(MedicationPlan plan) {
	var count = 0;
	for (var _ : plan.medications()) {
		count++;
	}
	return count;
}
// end::unnamed-loop[]

// --- DOP: operations and alternatives evolve ---

// tag::new-operation[]
int dailyPills(Dosage dosage) {
	return switch (dosage) {
		case Tablet(var morning, var midday, var evening) ->
				morning + midday + evening;
		case Infusion _ -> 0;
	};
}
// end::new-operation[]

/*
// tag::new-variant[]
sealed interface Dosage
		permits Tablet, Infusion, Patch { }
record Patch(int changeEveryHours)
		implements Dosage { }

String describe(Dosage dosage) {
	return switch (dosage) {
		case Tablet tablet -> "...";
		case Infusion infusion -> "...";
		// error: does not cover all possible values
	};
}
// end::new-variant[]
*/

// tag::main[]
void main() {
	var plan = new MedicationPlan("Jane Doe", List.of(
			new Medication(Drug.PARACETAMOL, new Tablet(1, 0, 1)),
			new Medication(Drug.CAFFEINE, new Infusion(5, 2))));

	IO.println(plan);
	IO.println(format(plan));
}
// end::main[]
`````

### Anhang C: `demos/MedicationPlanValidation.java`

`````java
import java.util.List;
import java.util.Objects;

enum Drug { PARACETAMOL, IBUPROFEN, CAFFEINE }

sealed interface Dosage permits Tablet, Infusion { }

// tag::validation[]
// tag::validation-tablet[]
record Tablet(int morning, int midday, int evening)
		implements Dosage {

	Tablet {
		if (morning < 0 || midday < 0 || evening < 0)
			throw new IllegalArgumentException(
					"Tablet counts must not be negative");
	}
}
// end::validation-tablet[]

// tag::validation-infusion[]
record Infusion(int speed, int duration)
		implements Dosage {

	Infusion {
		if (speed <= 0 || duration <= 0)
			throw new IllegalArgumentException(
					"Speed and duration must be positive");
	}
}
// end::validation-infusion[]
// end::validation[]

record Medication(Drug drug, Dosage dosage) {

	// tag::validation-plan[]
	Medication {
		Objects.requireNonNull(drug);
		Objects.requireNonNull(dosage);
	}
	// end::validation-plan[]

}

// tag::immutable[]
record MedicationPlan(
		String patientName,
		List<Medication> medications) {

	MedicationPlan {
		Objects.requireNonNull(patientName);
		medications = List.copyOf(medications);
	}

}
// end::immutable[]

/*
// tag::illegal-states[]
// Which of these combinations make sense?
record Dosage(
		Integer morning, Integer midday, Integer evening,
		Integer speed, Integer duration) { }

new Dosage(1, 0, 1, 5, 2);        // tablets *and* infusion?
new Dosage(null, null, null, null, null);   // nothing at all?
// end::illegal-states[]
*/

void recordBasics() {
	// tag::records-basics[]
	var tablet = new Tablet(1, 0, 1);

	tablet.morning();                      // 1
	tablet.equals(new Tablet(1, 0, 1));    // true
	tablet.toString();   // Tablet[morning=1, midday=0, evening=1]

	// immutable: "changing" means creating a new one
	var withMidday = new Tablet(
			tablet.morning(), 1, tablet.evening());
	// end::records-basics[]
}

void main() {
	recordBasics();

	var plan = new MedicationPlan("Jane Doe", List.of(
			new Medication(Drug.PARACETAMOL, new Tablet(1, 0, 1))));
	IO.println(plan);

	try {
		new Tablet(-1, 0, 0);
	} catch (IllegalArgumentException ex) {
		IO.println("Rejected: " + ex.getMessage());
	}
}
`````

### Anhang D: `demos/MedicationPlanPrimitives.java`

`````java
// Primitive Types in Patterns: preview in JDK 27 (JEP 532)
// java --enable-preview --source 27 MedicationPlanPrimitives.java

enum Drug { PARACETAMOL, IBUPROFEN, CAFFEINE }

sealed interface Dosage permits Tablet, Infusion { }
record Tablet(int morning, int midday, int evening)
		implements Dosage { }
record Infusion(int speed, int duration)
		implements Dosage { }

record Medication(Drug drug, Dosage dosage) { }

// tag::primitive-instanceof[]
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
// end::primitive-instanceof[]

// tag::primitive-record-pattern[]
void start(Dosage dosage) {
	switch (dosage) {
		case Infusion(byte speed, _) -> setPumpSpeed(speed);
		case Infusion _ -> throw new IllegalArgumentException(
				"Speed does not fit the pump");
		case Tablet _ -> { }
	}
}
// end::primitive-record-pattern[]

// tag::primitive-switch[]
String speedLevel(Infusion infusion) {
	return switch (infusion.speed()) {
		case 0 -> "stopped";
		case int speed when speed > 100 -> "fast";
		case int _ -> "normal";
	};
}
// end::primitive-switch[]

void main() {
	start(new Infusion(5, 2));
	start((Dosage) new Infusion(5, 2));
	IO.println(speedLevel(new Infusion(0, 1)));
	IO.println(speedLevel(new Infusion(500, 1)));
	IO.println(speedLevel(new Infusion(50, 1)));
	try {
		start(new Infusion(500, 1));
	} catch (IllegalArgumentException ex) {
		IO.println(ex.getMessage());
	}
}
`````

### Anhang E: `_presentation.adoc` (Rahmen des Vortrags, Auszug Kopf/Gast-Variablen/Einbindung)

`````asciidoc
= Modern Java in Practice
:backend: revealjs
:revealjs_theme: nipa-night
:revealjsdir: ../_reveal.js/head
:revealjs_controls: false
:revealjs_progress: false
:revealjs_slideNumber: false
:revealjs_history: true
:revealjs_center: true
:revealjs_transition: fade
:revealjs_backgroundTransition: fade
:revealjs_parallaxBackgroundImage: images/modern-colors.jpg
:revealjs_parallaxBackgroundSize: 4500px 3000px
:revealjs_totalTime: 9000
:docinfo: shared
:docinfodir: ../_shared

:imagedir: images

include::../_shared/highlight.js.adoc[]

++++
<style>
.reveal .title h1 {
	font-size: 3em;
}
.reveal .title h2 {
	font-size: 1.75em;
}
</style>
<h2>The Features That Matter</h2>
++++

:guest-name: Falk Sippach
:guest-byline: sippsack.de
:guest-url: https://www.sippsack.de/
:guest-photo: falk-sippach.jpg
:guest-company-url: https://www.embarc.de/en/
:guest-company-logo: images/embarc.png
:host-name: Devoxx BE
:host-url: https://devoxx.be/
:host-logo-url: images/logo-devoxx.png
include::../_shared/event-on-title-and-footer-guest.adoc[]

:title: Modern Java in Practice

// ######### //
// I N T R O //
// ######### //

// ⇝

////
TIMING:
	 5min NP/FS intro
	40min FS patterns
	10min NP performance
	15min FS/NP on-ramp
	 5min NP security
	 5min NP deprecations

	20min BREAK

	40min NP concurrency
	30min FS APIs
	10min NP tooling
////

:toc: pass:[ \
<table class="toc"> \
`````

### Anhang F: `../_shared/event-on-title-and-footer-guest.adoc` (Titel-/Footer-Template mit embarc-Logo)

`````html
[subs="attributes"]
++++
<div class="event">
	<div class="participant">
		<a href="https://nipafx.dev/nicolai-parlog" title="Nicolai"><img src="images/nipa-face.jpg" alt="Photo of Nicolai" class="logo"></a>
		<div class="name">
			<p><a href="https://nipafx.dev/nicolai-parlog" title="About Nicolai">Nicolai Parlog</a></p>
			<p><a href="https://nipafx.dev" title="Nicolai's website">nipafx.dev</a></p>
		</div>
	</div>
	<div class="participant">
		<a href="{host-url}" title="{host-name}"><img src="{host-logo-url}" alt="Logo of {host-name}" class="logo" style="{host-logo-style}"></a>
		<div class="name">
			<p><a href="{host-url}" title="{host-name} website">{host-name}</a></p>
		</div>
	</div>
	<div class="participant">
		<a href="{guest-url}" title="{guest-name}"><img src="images/{guest-photo}"  alt="Photo of {guest-name}" class="logo"></a>
		<div class="name">
			<p><a href="{guest-url}" title="{guest-name} online">{guest-name}</a></p>
			<p><a href="{guest-url}" title="{guest-name} online">{guest-byline}</a>
ifdef::guest-company-logo[]
			<a href="{guest-company-url}" title="{guest-name}'s company"><img src="{guest-company-logo}" alt="Company logo" style="height: 30px; vertical-align: middle; margin-left: 10px;"></a>
endif::[]
			</p>
		</div>
	</div>
</div>
<footer>
	<div class="participant">
		<a href="https://nipafx.dev/nicolai-parlog" title="Nicolai"><img src="images/nipa-face.jpg" alt="Photo of Nicolai" class="logo"></a>
		<div class="name"><p>
			<a href="https://nipafx.dev/nicolai-parlog" title="About Nicolai">Nicolai Parlog</a>
			/ <a href="https://nipafx.dev" title="Nicolai's website">nipafx.dev</a>
		</p></div>
	</div>
	<div class="participant">
		<a href="{guest-url}" title="{guest-name}"><img src="images/{guest-photo}"  alt="Photo of {guest-name}" class="logo"></a>
		<div class="name"><p>
			<a href="{guest-url}" title="{guest-name} online">{guest-name}</a>
			/ <a href="{guest-url}" title="{guest-name} online">{guest-byline}</a>
ifdef::guest-company-logo[]
			<a href="{guest-company-url}" title="{guest-name}'s company"><img src="{guest-company-logo}" alt="Company logo" style="height: 30px; padding: 4px 6px; box-sizing: border-box; border: 1px solid white; border-radius: 2px; vertical-align: middle; margin-left: 10px;"></a>
endif::[]
		</p></div>
	</div>
	<div class="participant">
		<a href="{host-url}" title="{host-name}"><img src="{host-logo-url}" alt="Logo of {host-name}" class="logo" style="{host-logo-style}"></a>
		<div class="name"><p>
			<a href="{host-url}" title="{host-name} website">{host-name}</a>
		</p></div>
	</div>
</footer>
<!-- Just adding a footer does not work because reveal.js puts it into the slides and we couldn't get it out via CSS. So we move it via JavaScript. -->
<script>
	document.addEventListener('DOMContentLoaded', function () {
		document.body.appendChild(document.querySelector('footer'));
	})
</script>
++++
`````

## 10. Offene Punkte für die Folgesession

- Entscheidungen aus 6.3 klären.
- Beim Wiederverwenden: Versionen/JEP-Links erneut gegen openjdk.org prüfen (Primitive Patterns ändern sich pro JDK).
- Zeitbudget des neuen Vortrags festlegen und Kürzungsliste (4.2) anwenden.
- Nichts davon ist committet; Falks andere uncommitted Dateien (`demos/ConferencePlanner.java`, `images/architekturvision.png`, `images/embarc copy.png`, `pattern-matching copy.adoc`) nicht anfassen.
