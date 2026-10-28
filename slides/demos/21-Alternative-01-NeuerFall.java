// @setup 01-Medikationsplan-01-Datenmodell.java
sealed interface Dosage permits Tablet, Infusion, Patch { }
record Patch(int changeEveryHours) implements Dosage { }

String describe(Dosage dosage) {
    return switch (dosage) {
        case Tablet tablet -> "...";
        case Infusion infusion -> "...";
        // error: does not cover all possible values
    };
}
