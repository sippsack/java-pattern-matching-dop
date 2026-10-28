// @setup 01-Medikationsplan-01-Datenmodell.java
String describe(Dosage dosage) {
    return switch (dosage) {
        case Tablet tablet -> "%d-%d-%d tablets".formatted(
                tablet.morning(), tablet.midday(), tablet.evening());
        // error: does not cover all possible values
    };
}
