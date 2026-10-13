# Projektkontext: Vortrag Pattern Matching + Data-Oriented Programming (Java)

Ziel dieses Projekts: **Unterlagen (Folien, Sprechtext) und Live-Coding** für einen eigenständigen Vortrag zu Pattern Matching und DOP in modernem Java.
Grundlage ist das Kapitel, das für „Modern Java in Practice: The Features That Matter“ (Devoxx BE, Falk Sippach) entstanden ist.
Stand: Oktober 2026, JDK 27 ist GA (2026-09-15).

## Herkunft / Ausgangsmaterial

- `material/Pattern-Matching-Slides-Export.md`: **vollständiger Export** (Kontext, JEP-Tabelle, Folienübersicht, DOP-Quellen, Layout-Hinweise, Overflow-Checker, Q&A, Anhang A–F mit den Originaldateien: 39 AsciiDoc-Folien inkl. Sprechtext, drei lauffähige Demo-Klassen, Rahmen-Dateien). Das ist die Hauptquelle – zuerst lesen.
- Originalquellen im Ordner `/Users/falk/projects/Java/Vorträge/2026-10 Modern Java/`:
  - `slides/java-17+/pattern-matching.adoc` (+ `demos/MedicationPlan*.java`), Repo `slides`, Branch `devoxx-be-26`
  - `input/`: `pattern-matching-vortrag.md` (Diskussionsentwurf), `Data-Oriented-Programming.pptx`, `Java-Pattern-Matching.pptx`, `Funktionale Programmierung mit Java - Bobkonf.pptx` (Dosage-Klassendiagramm)
- Weitere Referenz im `slides`-Repo (nur als Vorlage, teils veraltet): `java-dop`, `patterns`, `project-amber`, `java-next`, `java-x`.

## Bestehende Rahmenbedingungen (aus dem Devoxx-Kapitel)

- Folien: Reveal.js + AsciiDoc (Theme `nipa-night`), Folientitel und On-Slide-Text **Englisch**, Absprache/Notizen Deutsch.
- Durchgängiges Beispiel: **Dosage/Medication** (Klassendiagramm aus dem Bobkonf-Deck, Idee inspiriert vom Blogpost „Data Modeling with Sums and Products“ von Sperber/Wehr: https://funktionale-programmierung.de/en/2024/11/25/sums-products.html).
- Regeln aus dem Devoxx-Vortrag (für den neuen Vortrag neu entscheiden!):
  - Java-Versionen („wann final“) und JEP-Links nur auf der Abschlussfolie „Summary“.
  - Jedes Feature eigene Folie; bei jedem Feature auch den **eigenständigen Nutzen** erklären.
  - Dosage schrittweise weiterentwickeln; wo es nicht passt, Mini-Beispiel.
  - Begriff **Algebraic Data Type** explizit (Records = Produkt, sealed/enum = Summe).

## Dosage-Modell

```java
enum Drug { PARACETAMOL, IBUPROFEN, CAFFEINE }
sealed interface Dosage permits Tablet, Infusion {}
record Tablet(int morning, int midday, int evening) implements Dosage {}
record Infusion(int speed, int duration) implements Dosage {}   // ml/h, min – ausgedacht, "not medical advice"
record Medication(Drug drug, Dosage dosage) {}
record MedicationPlan(String patientName, List<Medication> medications) {}
```

Erweiterungen im Vortrag: neue Operation `dailyPills(Dosage)` (nur ein neuer switch) und neue Variante `Patch` (Compiler meldet alle unvollständigen switches).

## Dramaturgie des Devoxx-Kapitels (39 Folien, ~35–40 min)

Beispiel → Idee DOP → Werkzeugkasten → Features Schritt für Schritt am Beispiel
(Switch Expressions → Records inkl. Validation/Invariants/Immutability → Sealed Types → Algebraic Data Types → Type Patterns (`instanceof`) → Pattern Matching for `switch` mit Exhaustiveness, Guards, Dominance, `null` → Record Patterns, verschachtelt → Unnamed Patterns/Variables → Primitive Patterns)
→ DOP-Prinzipien (Goetz, Parlog v1.1) → Prinzipien im Beispiel → Operation/Alternative hinzufügen → OOP und DOP → Wann DOP → Summary.

Kürzungsreihenfolge laut Sprechtext: Classic `switch`, Type-Pattern-Scope, Records: Invariants/Immutability, From 1.0 to 1.1, Dominance, Nested+Guards, Primitive Records, When to Use DOP.

## Verifizierte Feature-/JEP-Stände (openjdk.org, 2026-10-05)

| Feature | Final in | JEP |
|---|---|---|
| Switch Expressions | 14 | 361 |
| Records | 16 | 395 |
| Pattern Matching for `instanceof` | 16 | 394 |
| Sealed Classes/Interfaces | 17 | 409 |
| Pattern Matching for `switch` (inkl. Guards, `null`, Exhaustiveness, Dominance) | 21 | 441 |
| Record Patterns (auch verschachtelt) | 21 | 440 |
| Unnamed Patterns and Variables | 22 | 456 |
| Primitive Types in Patterns | **Preview** (5. Preview in JDK 27) | 532 (Vorläufer 455, 488, 507, 530) |

- Primitive Patterns brauchen `--enable-preview --source 27`; für JDK 28 nicht vorgeschlagen.
- JEP 468 (Derived Record Creation/„withers“) nur *Candidate*; JEP 401 (Value Classes) ist ein JDK-28-Preview – nicht mit Primitive Patterns verwechseln; Carrier Classes sind nur Design-Notizen.
- DOP braucht Java 21+.
- Vor Wiederverwendung erneut gegen openjdk.org prüfen.

## DOP-Quellen

- **Goetz**, „Data-Oriented Programming in Java“ (InfoQ, 2022): https://www.infoq.com/articles/data-oriented-programming-java/
  Prinzipien: model the data, the whole data, and nothing but the data; data is immutable; validate at the boundary; make illegal states unrepresentable. Records = Produkttypen, sealed = Summentypen, „It's not either/or“ (OOP vs. DOP).
- **Parlog**, DOP v1.1 (inside.java, 2024), 6 Teile:
  - https://inside.java/2024/05/23/dop-v1-1-introduction/
  - https://inside.java/2024/05/27/dop-v1-1-immutable-transparent-data/
  - https://inside.java/2024/05/29/dop-v1-1-model-data/
  - https://inside.java/2024/06/03/dop-v1-1-illegal-states/
  - https://inside.java/2024/06/05/dop-v1-1-separate-operations/
  - https://inside.java/2024/06/10/dop-v1-1-wrap-up/

  Prinzipien v1.1: immutable **and transparent**; model the data; make illegal states unrepresentable (inkl. Validierung an der Grenze); **separate operations from data**.
- Unterschiede: „immutable“ → „immutable und transparent“; „validate at the boundary“ geht in „illegal states“ auf; „operations separate“ explizit neu (die Lesart „bei Goetz implizit“ ist unsere Interpretation).

## Bekannte Stolperfallen in alten Quellen

Alte Decks: „Record Patterns Java 19“ (falsch, 21), Array Patterns (gestrichen), Primitive Patterns als „early preview“. Bobkonf-Folie 18 vermischt Value Classes mit Primitive Patterns, Folie 33 „ab Java 12“ ungenau. Goetz-Artikel enthält kleine Codefehler. Domänennamen variieren (Conference Planner vs. Dosage).

## Layout-/Build-Hinweise (Reveal.js)

Details und getesteter Playwright-Overflow-Checker: Export Abschnitt 7. Kurz: Codeschrift 28 px, lange Snippets `role=compact` (22 px); Titel > ~28 Zeichen brechen um; Codezeilen ≤ ~54 Zeichen; Inhaltsbereich endet vor ~1035 px; Theme setzt Überschriften in Title Case; Footer wird per JS verschoben.

## Q&A-Vorbereitung

Frage „Sealed interfaces über mehrere Packages (Event Sourcing, `events.v1`, `v2`)?“ → Möglich innerhalb desselben **benannten Moduls** (voll qualifizierte Namen in `permits`), im unnamed module nur im selben Package; Module übergreifend nicht (JEP 409). Jede Unterklasse `final`/`sealed`/`non-sealed`. „Keine Pläne zur Änderung“ ist nur unsere Einschätzung, nicht belegt.

## Offene Entscheidungen

- Zielgruppe, Dauer, Event und Sprache des **neuen** Vortrags (Devoxx-Kapitel: Englisch, 40 min).
- `int` oder `double` für `Infusion.speed`? Drug-Namen beibehalten?
- Preview-Badge für Primitive Patterns?
- Live-Coding-Anteil vs. Folien: welche Features live (Vorschlag: switch → Records → sealed → Pattern Matching for switch → Record Patterns, Prinzipien als Folien).

## Nächste Schritte (Vorschlag)

1. Rahmen des neuen Vortrags klären (siehe offene Entscheidungen), Agenda aus dem Export ableiten und kürzen.
2. Live-Coding-Skript: schrittweise Refactorings am Dosage-Beispiel; Demos aus Export Anhang B–D als Ausgangspunkt (JDK 27).
3. Folien neu aufsetzen (Reveal.js/AsciiDoc) und mit dem Overflow-Checker prüfen.
