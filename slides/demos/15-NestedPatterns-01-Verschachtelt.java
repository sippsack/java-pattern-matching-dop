// @setup 01-Medikationsplan-01-Datenmodell.java
String format(Medication medication) {
    return switch (medication) {
        case Medication(var drug, Tablet(var morning, var midday, var evening))
                -> "%s: %d-%d-%d".formatted(drug, morning, midday, evening);
        case Medication(var drug, Infusion(var speed, var duration))
                -> "%s: %d ml/h for %d min".formatted(drug, speed, duration);
    };
}
