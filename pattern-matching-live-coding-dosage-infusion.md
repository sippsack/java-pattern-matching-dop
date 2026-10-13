# Live-Coding-Konzept: Pattern Matching mit Dosage / Infusion

## Kontext

- Vortrag: **Von algebraischen Datentypen und Data-Oriented Programming zu Pattern Matching überall**
- Gesamtdauer: ca. **45 Minuten**
- Zielgruppe: **erfahrene Java-Entwickler**
- Geplanter Live-Coding-Anteil: **ca. 20–25 Minuten**
- Ziel: Pattern Matching nicht als lose Sammlung von Sprachfeatures zeigen, sondern als schrittweise Verbesserung eines kleinen Datenmodells.
- Vorgehen: Nur ausgewählte Änderungen live tippen. Größere Umbauten über vorbereitete Git-Stände / Commits zeigen.

---

## Leitidee der Demo

Die Demo entwickelt ein kleines Dosage-/Infusion-Modell schrittweise weiter.

Im Zentrum steht die Frage:

> Wie helfen sealed types, records und Pattern Matching dabei, Varianten eines Datenmodells explizit, vollständig und sicher zu verarbeiten?

Die Demo soll diese Entwicklung zeigen:

1. Klassische `instanceof`-Prüfung und Casts
2. Type Patterns
3. Pattern Matching im `switch`
4. Exhaustiveness mit `sealed`
5. Record Patterns
6. Nested Record Patterns
7. Guards
8. Unnamed Patterns
9. Optional: Übergang zu Data-Oriented Programming

---

## Ziel-Datenmodell

```java
public enum Drug {
    PARACETAMOL,
    CAFFEINE,
    IBUPROFEN
}
```

```java
public sealed interface Dosage
        permits TabletDosage, InfusionDosage {
}
```

```java
public record TabletDosage(
        int morning,
        int midday,
        int evening
) implements Dosage {
}
```

```java
public record InfusionDosage(
        int speed,
        int duration
) implements Dosage {
}
```

```java
public record Medication(
        Drug drug,
        Dosage dosage
) {
}
```

Das Modell eignet sich gut, weil es sowohl einen **Sum Type** als auch **Product Types** enthält:

```text
Dosage = TabletDosage OR InfusionDosage
```

```text
TabletDosage = morning AND midday AND evening
InfusionDosage = speed AND duration
Medication = drug AND dosage
```

---

# Demo-Ablauf

## Schritt 1 – Klassische Fallunterscheidung

**Zielzeit:** ca. 3 Minuten

### Ausgangscode

```java
String formatDosage(Dosage dosage) {
    if (dosage instanceof TabletDosage) {
        TabletDosage tablets = (TabletDosage) dosage;

        return "%d-%d-%d".formatted(
                tablets.morning(),
                tablets.midday(),
                tablets.evening()
        );
    }

    if (dosage instanceof InfusionDosage) {
        InfusionDosage infusion = (InfusionDosage) dosage;

        return "%d ml/h for %d h".formatted(
                infusion.speed(),
                infusion.duration()
        );
    }

    throw new IllegalArgumentException(
            "Unknown dosage: " + dosage
    );
}
```

### Frage ans Publikum

> Was stört euch daran?

Mögliche Punkte:

- Typ prüfen
- Cast durchführen
- zusätzliche Variable anlegen
- Accessor aufrufen
- unbekannten Fall selbst absichern

### Live-Änderung

Zunächst nur auf Type Patterns umstellen:

```java
if (dosage instanceof TabletDosage tablets) {
```

und:

```java
if (dosage instanceof InfusionDosage infusion) {
```

### Kernaussage

> Ein Pattern prüft nicht nur eine Bedingung, sondern bindet gleichzeitig die passenden Informationen.

### Git-Stand

```text
01-type-patterns
```

---

## Schritt 2 – Pattern Matching im switch

**Zielzeit:** ca. 4 Minuten

### Umbau

Die gesamte Methode wird auf einen `switch` umgestellt:

```java
String formatDosage(Dosage dosage) {
    return switch (dosage) {
        case TabletDosage tablets ->
                "%d-%d-%d".formatted(
                        tablets.morning(),
                        tablets.midday(),
                        tablets.evening()
                );

        case InfusionDosage infusion ->
                "%d ml/h for %d h".formatted(
                        infusion.speed(),
                        infusion.duration()
                );
    };
}
```

### Wichtiger Punkt

Es gibt keinen `default` und keinen manuellen Exception-Fallback.

Grund:

```java
sealed interface Dosage
        permits TabletDosage, InfusionDosage {
}
```

Der Compiler kennt alle erlaubten Varianten.

### Kernaussage

> Mit einem sealed type kennt der Compiler die vollständige Menge möglicher Varianten.

### Verbindung zu algebraischen Datentypen

`Dosage` ist ein Sum Type:

```text
Dosage = TabletDosage OR InfusionDosage
```

---

## Schritt 2b – Exhaustiveness sichtbar machen

**Zielzeit:** ca. 2 Minuten innerhalb von Schritt 2

### Live-Änderung

Neuen Typ ergänzen:

```java
record InjectionDosage(int milliliters)
        implements Dosage {
}
```

und:

```java
sealed interface Dosage
        permits TabletDosage,
                InfusionDosage,
                InjectionDosage {
}
```

### Erwarteter Effekt

Der bestehende `switch` kompiliert nicht mehr, weil der neue Fall fehlt.

### Kernaussage

> Wenn sich das Datenmodell ändert, zeigt mir der Compiler alle Stellen, deren Annahme über die vollständige Menge der Varianten nicht mehr stimmt.

Danach den Typ wieder entfernen oder per Git auf den vorbereiteten Stand zurückgehen.

### Git-Stand

```text
02-switch-exhaustive
```

---

## Schritt 3 – Record Patterns

**Zielzeit:** ca. 4–5 Minuten

### Ausgangscode

```java
case TabletDosage tablets ->
        "%d-%d-%d".formatted(
                tablets.morning(),
                tablets.midday(),
                tablets.evening()
        );
```

### Live-Umbau

```java
case TabletDosage(
        int morning,
        int midday,
        int evening) ->
        "%d-%d-%d".formatted(
                morning,
                midday,
                evening
        );
```

Analog für die Infusion:

```java
case InfusionDosage(
        int speed,
        int duration) ->
        "%d ml/h for %d h".formatted(
                speed,
                duration
        );
```

### Vollständige Methode

```java
String formatDosage(Dosage dosage) {
    return switch (dosage) {
        case TabletDosage(
                int morning,
                int midday,
                int evening) ->
                "%d-%d-%d".formatted(
                        morning,
                        midday,
                        evening
                );

        case InfusionDosage(
                int speed,
                int duration) ->
                "%d ml/h for %d h".formatted(
                        speed,
                        duration
                );
    };
}
```

### Kernaussage

> Beim Type Pattern frage ich: Welcher Typ ist das?
>
> Beim Record Pattern frage ich zusätzlich: Aus welchen Werten besteht dieser Wert?

### Merksatz

```text
sealed  -> Auswahl der Form
record  -> Struktur innerhalb der Form
pattern -> beides zusammen
```

### Git-Stand

```text
03-record-patterns
```

---

## Schritt 4 – Nested Patterns mit Medication

**Zielzeit:** ca. 5 Minuten

Für diesen Schritt wird auf einen vorbereiteten Git-Stand gewechselt.

### Zusätzlicher Datentyp

```java
record Medication(
        Drug drug,
        Dosage dosage
) {
}
```

### Erste Variante

```java
String describe(Medication medication) {
    return switch (medication.dosage()) {
        case TabletDosage(
                int morning,
                int midday,
                int evening) ->
                "%s: %d-%d-%d".formatted(
                        medication.drug(),
                        morning,
                        midday,
                        evening
                );

        case InfusionDosage(
                int speed,
                int duration) ->
                "%s: %d ml/h for %d h".formatted(
                        medication.drug(),
                        speed,
                        duration
                );
    };
}
```

### Nächster Schritt: verschachtelte Patterns

```java
String describe(Medication medication) {
    return switch (medication) {
        case Medication(
                var drug,
                TabletDosage(
                        int morning,
                        int midday,
                        int evening)) ->
                "%s: %d-%d-%d".formatted(
                        drug,
                        morning,
                        midday,
                        evening
                );

        case Medication(
                var drug,
                InfusionDosage(
                        int speed,
                        int duration)) ->
                "%s: %d ml/h for %d h".formatted(
                        drug,
                        speed,
                        duration
                );
    };
}
```

### Kernaussage

> Pattern Matching folgt der Struktur der Daten.

Visualisierung der Datenstruktur:

```text
Medication
├── Drug
└── Dosage
    ├── TabletDosage
    │   ├── morning
    │   ├── midday
    │   └── evening
    └── InfusionDosage
        ├── speed
        └── duration
```

Der Pattern-Switch bildet diese Struktur nahezu direkt ab.

### Git-Stand

```text
04-nested-patterns
```

---

## Schritt 5 – Guards und Unnamed Patterns

**Zielzeit:** ca. 4–5 Minuten

### Guards

Beispiel: Bestimmte Dosierungen sollen besonders markiert werden.

```java
String warning(Medication medication) {
    return switch (medication) {
        case Medication(
                var drug,
                InfusionDosage(
                        int speed,
                        int duration))
                when duration > 8 ->
                drug + ": long-running infusion";

        case Medication(
                var drug,
                TabletDosage(
                        int morning,
                        int midday,
                        int evening))
                when morning + midday + evening > 6 ->
                drug + ": many tablets";

        default ->
                "no warning";
    };
}
```

### Hinweis

Die Grenzwerte dienen **nur der technischen Demo** und sind keine medizinischen Empfehlungen.

Alternativ können neutrale Hilfsmethoden verwendet werden:

```java
when isSpecialCase(duration)
```

oder:

```java
when requiresAttention(morning, midday, evening)
```

### Unnamed Patterns

Wenn die konkreten Werte nicht gebraucht werden:

```java
String administrationType(Dosage dosage) {
    return switch (dosage) {
        case TabletDosage(_, _, _) ->
                "oral";

        case InfusionDosage(_, _) ->
                "infusion";
    };
}
```

Oder innerhalb eines verschachtelten Patterns:

```java
case Medication(
        var drug,
        TabletDosage(_, _, _)) ->
        drug + " as tablets";
```

### Kernaussage

> Ein Pattern beschreibt nur die Teile der Datenstruktur, die für die aktuelle Operation relevant sind.

### Git-Stand

```text
05-guards-unnamed
```

---

# Optionaler Schritt 6 – Brücke zu Data-Oriented Programming

**Zielzeit:** 2–3 Minuten, nur falls ausreichend Zeit bleibt

Nicht mehr live coden, sondern fertigen Stand zeigen.

### Mehrere Operationen auf demselben Datenmodell

```java
String formatDosage(Dosage dosage) { ... }

String describe(Medication medication) { ... }

boolean requiresMonitoring(Medication medication) { ... }

Duration treatmentDuration(Dosage dosage) { ... }
```

### Klassische OO-Variante

```java
interface Dosage {
    String format();
    boolean requiresMonitoring();
    Duration duration();
}
```

### Datenorientierte Variante

```java
sealed interface Dosage {
}

String format(Dosage dosage) { ... }

boolean requiresMonitoring(Dosage dosage) { ... }

Duration duration(Dosage dosage) { ... }
```

### Kernaussage

> Records und sealed types können ein stabiles Datenmodell bilden. Pattern Matching erlaubt es, neue Operationen darauf zu definieren, ohne jedes Verhalten in die Datentypen selbst zu verschieben.

Das ist eine gute Brücke zu Data-Oriented Programming und zum Expression Problem.

### Git-Stand

```text
06-data-oriented
```

---

# Empfohlene Git-Struktur

Nicht zu viele Branches oder Zwischenstände vorbereiten.

Vorschlag:

```text
00-start
   |
   +-- 01-type-patterns
   |
   +-- 02-switch-exhaustive
   |
   +-- 03-record-patterns
   |
   +-- 04-nested-patterns
   |
   +-- 05-guards-unnamed
   |
   +-- 06-data-oriented
```

Mögliche Umsetzung:

- lineare Commits
- Tags auf den relevanten Commits
- optional Branches, wenn die IDE damit komfortabler ist

Beispiel:

```bash
git switch --detach 03-record-patterns
```

oder zum Vergleich zweier Stände:

```bash
git diff HEAD^ HEAD
```

Für eine Live-Demo sind lineare Commits oft leichter nachzuvollziehen als viele parallele Branches.

---

# Empfohlener Mix aus Live-Coding und vorbereiteten Ständen

| Schritt | Inhalt | Durchführung |
|---|---|---|
| 1 | Cast -> Type Pattern | live coden |
| 2 | `if` -> `switch` | live coden |
| 2b | neuen Subtyp hinzufügen | live coden |
| 3 | Record Pattern | live coden |
| 4 | Nested Patterns | Git-Sprung + kleine Änderung live |
| 5 | Guards | vorbereiteten Stand zeigen / Git-Sprung |
| 5b | Unnamed Patterns | live coden |
| 6 | DOP | fertigen Stand zeigen |

Ziel: Nur ungefähr **20–30 Zeilen tatsächlich live schreiben**, obwohl sich das Beispiel deutlich weiterentwickelt.

---

# Dramaturgischer roter Faden

Jeder Schritt beantwortet eine andere Frage:

1. **Type Pattern** – Welcher Typ ist das?
2. **Switch Pattern** – Welche Variante ist das?
3. **Exhaustiveness** – Habe ich alle Varianten behandelt?
4. **Record Pattern** – Aus welchen Werten besteht die Variante?
5. **Nested Pattern** – Wie sieht die gesamte Datenstruktur aus?
6. **Guard** – Welche zusätzliche Bedingung gilt?
7. **Unnamed Pattern** – Welche Teile interessieren mich überhaupt?
8. **Data-Oriented Programming** – Was bedeutet das für die Struktur meines Codes?

---

# Mögliche Abschlussfolie nach der Demo

```text
Type Patterns
    ↓
Switch Patterns
    ↓
Sealed Types + Exhaustiveness
    ↓
Record Patterns
    ↓
Nested Patterns
    ↓
Guards + Unnamed Patterns
```

Kernaussage:

> Pattern Matching ist nicht nur kürzere Syntax für `instanceof`. Es erlaubt uns, die Struktur unserer Daten direkt in der Programmlogik auszudrücken und vom Compiler überprüfen zu lassen.

---

# Punkte für die weitere Ausarbeitung

Für eine spätere KI-Session bzw. Coding-Agent-Session können insbesondere folgende Dinge weiter konkretisiert werden:

- genaue Projektstruktur und Packages
- JDK-Version und Preview-Flags
- Tests für jeden Demo-Stand
- exakte Commit-/Tag-Namen
- IDE-Schritte für die Live-Demo
- vorbereitete Terminal-Befehle
- kurze Speaker Notes pro Schritt
- einheitliche Ausgaben der Methoden
- realistischere oder neutralere Domänenbegriffe für Guards
- optional zusätzliche Dosage-Variante für den Exhaustiveness-Demo-Schritt
- Backup-Plan bei Problemen im Live-Coding
