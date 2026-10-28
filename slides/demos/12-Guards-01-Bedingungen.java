// @setup 01-Medikationsplan-01-Datenmodell.java
String warn(Dosage dosage) {
    return switch (dosage) {
        case Tablet t when t.morning() > 3 -> "Too many tablets";
        case Tablet t -> "OK";
        case Infusion i when i.speed() > 100 -> "Too fast";
        case Infusion i -> "OK";
    };
}
