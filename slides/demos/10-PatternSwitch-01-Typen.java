// @setup 01-Medikationsplan-01-Datenmodell.java
String describe(Dosage dosage) {
    return switch (dosage) {
        case Tablet tablet -> "%d-%d-%d tablets".formatted(
                tablet.morning(), tablet.midday(), tablet.evening());
        case Infusion infusion -> "%d ml/h for %d min".formatted(
                infusion.speed(), infusion.duration());
    };
}
