// @setup 01-Medikationsplan-01-Datenmodell.java
String format(Dosage dosage) {
    return switch (dosage) {
        case Tablet(int morning, int midday, int evening) ->
            "%d-%d-%d tablets".formatted(morning, midday, evening);
        case Infusion(int speed, int duration) ->
            "%d ml/h for %d min".formatted(speed, duration);
    };
}
