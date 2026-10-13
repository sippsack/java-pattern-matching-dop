# Future of Pattern Matching in Java – Ideen aus Project Amber

## Kontext

Diese Notizen fassen wichtige Ideen zusammen, die in den Amber-Mailinglisten 2025/2026 und in Vorträgen zur weiteren Entwicklung von Pattern Matching diskutiert wurden.

Zentrale Quellen:

- Amber Mailing List: https://mail.openjdk.org/archives/list/amber-dev@openjdk.org/latest
- Amber Spec Experts: https://mail.openjdk.org/pipermail/amber-spec-experts/
- Vortrag: *Destructoring is the Future of Java's Encapsulation* (Devoxx Belgium 2026)  
  https://speakerdeck.com/richargh/destructoring-is-the-future-of-javas-encapsulation-v1-at-devoxx-be-2026

Wichtig: Viele der folgenden Punkte sind Designrichtungen oder Diskussionsstände und noch keine final beschlossenen Java-Features.

---

# Die große Entwicklungslinie

Die weitere Entwicklung von Pattern Matching geht vermutlich über zusätzliche `case`-Varianten hinaus.

Die größere Idee ist:

> **Deconstruction und Reconstruction werden zu grundlegenden Sprachkonzepten.**

Patterns sollen damit an deutlich mehr Stellen in Java verwendet werden können.

Grob:

```text
Today

instanceof patterns
switch patterns
record patterns
primitive patterns

            ↓

Next

Pattern Assignment
Patterns in for-each

            ↓

Beyond Records

Deconstructible Classes
Deconstructible Interfaces

            ↓

Deconstruction ↔ Reconstruction

with expressions
serialization
record evolution

            ↓

Eventually?

Nominal Patterns
Factory / Member Patterns
```

---

# 1. Pattern Assignment

Heute treten Patterns hauptsächlich in Kontexten wie `instanceof` oder `switch` auf:

```java
if (point instanceof Point(var x, var y)) {
    ...
}
```

Diskutiert wird ein Pattern Assignment Statement, mit dem sich ein Wert direkt destrukturieren lässt:

```java
Point(var x, var y) = point;
```

Die Idee:

- Das Pattern dient nicht mehr zur Fallunterscheidung.
- Der Compiler weiß bereits, dass das Pattern zum statischen Typ passt.
- Es geht nur noch um Deconstruction.

Damit würden Patterns von einem Kontrollflussmechanismus zu einem allgemeinen Mechanismus zum Zerlegen von Daten.

## Kernaussage

```text
Pattern Matching
      ↓
Pattern Deconstruction
      ↓
Pattern Assignment
```

---

# 2. Patterns direkt in `for-each`

Auf Pattern Assignment baut die Idee auf, Patterns direkt im Kopf einer Schleife zu verwenden.

Heute:

```java
for (var entry : map.entrySet()) {
    var key = entry.getKey();
    var value = entry.getValue();
}
```

Mögliche zukünftige Form:

```java
for (Map.Entry(var key, var value) : map.entrySet()) {
    ...
}
```

Das wäre besonders interessant, wenn Typen wie `Map.Entry` deconstructible würden.

## Warum interessant?

- Weniger Boilerplate
- Datenstruktur direkt sichtbar
- Patterns werden außerhalb von `switch` und `instanceof` nützlich

---

# 3. Deconstruction für normale Klassen

Heute funktioniert strukturelles Pattern Matching besonders gut mit Records:

```java
record Point(int x, int y) {}

if (obj instanceof Point(var x, var y)) {
    ...
}
```

Normale Klassen können aktuell nicht auf dieselbe Weise deconstructed werden.

Eine zentrale aktuelle Amber-Richtung ist deshalb:

> Normale Klassen sollen eine explizite State Description / Deconstruction anbieten können.

Konzeptionell könnte dann auch Folgendes möglich werden:

```java
case Point(var x, var y) -> ...
```

obwohl `Point` kein Record ist.

## Wichtig zur Terminologie

In früheren Diskussionen wurde teilweise von **Carrier Classes** gesprochen.

Die aktuellere Richtung spricht eher von:

- deconstructible classes
- state description
- canonical deconstruction

Die State Description soll nicht zwingend die komplette interne Repräsentation offenlegen.

Sie beschreibt vielmehr den Teil des Zustands, der öffentlich deconstructed werden kann.

---

# 4. Deconstructible Interfaces

Die Idee soll nicht auf Klassen beschränkt bleiben.

Ein Interface könnte einen strukturellen Zustand beschreiben:

```java
interface Pair<T, U>(T first, U second) {
}
```

Konzeptionell könnte man dann schreiben:

```java
if (value instanceof Pair(var first, var second)) {
    ...
}
```

Die konkrete Implementierung könnte verborgen bleiben.

## Architektonisch interessant

```text
Interface
   ↓
beschreibt sichtbaren Zustand
   ↓
Implementierung bleibt gekapselt
   ↓
Pattern Matching bleibt möglich
```

Das verbindet Pattern Matching mit Encapsulation.

---

# 5. `with` Expressions / Reconstruction

Eine weitere wichtige Richtung ist Reconstruction.

Die Idee existiert unter anderem als JEP 468 – Derived Record Creation.

Beispiel:

```java
record Address(String street, String city) {}
```

Mögliche `with`-Syntax:

```java
var moved = address with {
    street = "Main Street";
};
```

Das Originalobjekt wird nicht verändert.

Stattdessen entsteht ein neues Objekt mit angepassten Komponenten.

## Zusammenhang mit Pattern Matching

```text
Deconstruction
    ↓
Komponenten herausnehmen

Reconstruction
    ↓
Komponenten verändern

Construction
    ↓
neues Objekt erzeugen
```

Beispiel:

```java
Complex conjugate = c with {
    im = -im;
};
```

Die Komponenten werden implizit verfügbar gemacht, verändert und anschließend für die Erzeugung eines neuen Objekts verwendet.

---

# 6. Reconstruction für normale Klassen

Wenn normale Klassen zukünftig eine klar definierte State Description und Deconstruction besitzen, könnte Reconstruction ebenfalls über Records hinaus erweitert werden.

Konzeptionell:

```java
var newAddress = address with {
    city = "Darmstadt";
};
```

Eine Klasse wäre reconstructible, wenn sie etwa besitzt:

- eine definierte State Description
- eine passende Deconstruction
- einen zugänglichen kanonischen Constructor

Das erklärt auch, warum `with` nicht isoliert nur als Record-Feature betrachtet wird.

---

# 7. Deconstruction als Grundlage besserer Serialisierung

Ein wichtiger Anwendungsfall ist Serialisierung.

Heute greifen viele Frameworks auf Dinge zurück wie:

```text
private fields
    ↑
Reflection
```

oder:

```text
Getter / Setter
```

oder spezielle Annotationen und Konstruktoren.

Mit First-Class Deconstruction könnte eine Klasse explizit beschreiben:

> Das sind die Bestandteile meines öffentlichen Zustands.

Ein Serializer könnte genau diesen Zustand verwenden.

Beim Deserialisieren könnte anschließend ein normaler Constructor aufgerufen werden.

```text
Object
   ↓ deconstruct
Serialized Representation

Serialized Representation
   ↓ canonical constructor
Object
```

## Vorteil

Die Invarianten der Klasse bleiben erhalten.

Serialisierung müsste nicht länger zwangsläufig die Kapselung umgehen.

## Wichtig für Vorträge

Nicht behaupten:

> Java bekommt Companion Classes für Serialisierung.

Besser:

> Deconstruction und Reconstruction könnten die Grundlage für bessere und kapselungsschonende Serialisierungs-APIs bilden.

Companion-/Carrier-Ideen waren Zwischenstände in der Design-Diskussion.

---

# 8. Nominal Construction und Deconstruction

Record Patterns sind heute positional:

```java
Point(var x, var y)
```

Die Bedeutung hängt von der Reihenfolge der Komponenten ab.

Eine mögliche langfristige Richtung ist **nominal construction and deconstruction**.

Die Komponenten würden dann über Namen adressiert.

Nur als Illustration, nicht als vorgeschlagene Syntax:

```java
Point(x: var x, y: var y)
```

## Warum interessant?

Bei größeren Records:

```java
record Person(
    String firstName,
    String lastName,
    LocalDate birthday,
    String email
) {}
```

ist:

```java
Person(_, _, var birthday, _)
```

weniger ausdrucksstark als eine Variante, die `birthday` explizit benennt.

## Für Vortragsfolien markieren als

**Future direction – no settled syntax**

---

# 9. Kompatiblere Evolution von Records

Heute kann die Erweiterung eines Records bestehende Record Patterns source-inkompatibel machen.

Ausgangslage:

```java
record Person(String name, int age) {}
```

Pattern:

```java
case Person(var name, var age) -> ...
```

Später:

```java
record Person(
    String name,
    int age,
    String email,
    Address address
) {}
```

Das bestehende Pattern passt dann nicht mehr zur neuen Komponentenanzahl.

Eine diskutierte Idee sind Prefix Patterns.

Das alte Pattern könnte sinngemäß behandelt werden wie:

```java
case Person(var name, var age, _, _) -> ...
```

## Ziel

Records könnten durch das Anhängen neuer Komponenten kompatibler weiterentwickelt werden.

Für öffentliche APIs wäre das besonders interessant.

---

# 10. Member Patterns / Factory Patterns

Langfristig könnte Pattern Matching noch weiter gehen.

Die Vision ist, Patterns nicht nur für Record- oder Deconstruction-Fälle zu verwenden, sondern auch analog zu:

- Konstruktoren
- Factory-Methoden
- Instanzmethoden

Beispielidee:

```java
Optional.of(value)
```

könnte möglicherweise eine passende Pattern-Form erhalten:

```java
if (value instanceof Optional.of(var x)) {
    ...
}
```

Oder verschachtelt:

```java
if (shape instanceof Optional.of(
        Ball(RED, var size))) {
    ...
}
```

Diese Richtung wird oft unter Begriffen wie:

- member patterns
- factory patterns

diskutiert.

## Einordnung

Das ist eher eine längerfristige Vision.

Die aktuell konkretere Arbeit konzentriert sich stärker auf:

- Deconstruction
- normale Klassen
- Interfaces
- Pattern Assignment
- Reconstruction

---

# Priorisierung für einen Vortrag

Für einen Pattern-Matching-Vortrag würde ich nicht alle Ideen gleich gewichten.

## Sehr relevant

1. Pattern Assignment
2. Patterns in `for-each`
3. Deconstructible Classes
4. Deconstructible Interfaces
5. Withers / Reconstruction
6. Serialisierung auf Basis von Deconstruction

## Eher als Ausblick

7. Nominal Patterns
8. Record Evolution / Prefix Patterns
9. Member Patterns / Factory Patterns

---

# Mögliche Abschlussfolie

## Pattern Matching – what's next?

```text
Today

instanceof patterns
switch patterns
record patterns
primitive patterns

            ↓

Next

Pattern Assignment
Patterns in for-each

            ↓

Beyond Records

Deconstructible Classes
Deconstructible Interfaces

            ↓

Deconstruction ↔ Reconstruction

with expressions
serialization
record evolution

            ↓

Eventually?

Nominal Patterns
Factory / Member Patterns
```

---

# Zentrale Aussage

Die wichtigste Entwicklung ist wahrscheinlich nicht:

> Java bekommt einfach immer mehr Pattern-Syntax.

Sondern:

> **Deconstruction entwickelt sich zu einem First-Class-Konzept des Java-Typsystems.**

Das erklärt viele der diskutierten Features gleichzeitig:

- Pattern Assignment
- Patterns in `for-each`
- Pattern Matching für normale Klassen
- Pattern Matching für Interfaces
- Withers
- Reconstruction
- bessere Serialisierung
- flexiblere API-Evolution
- langfristig Member- und Factory-Patterns

---

# Hinweise für weitere Ausarbeitung

Für eine spätere Ausarbeitung sollten die konkreten Syntaxbeispiele noch einmal gegen den jeweils aktuellen Amber-Stand geprüft werden.

Insbesondere bei diesen Themen ist die Syntax noch nicht final:

- Deconstructible Classes
- Deconstructible Interfaces
- Pattern Assignment
- Nominal Patterns
- Member / Factory Patterns
- allgemeine Reconstruction

Bei Vortragsfolien daher am besten klar unterscheiden zwischen:

- **Available today**
- **Proposed / under discussion**
- **Long-term direction**
