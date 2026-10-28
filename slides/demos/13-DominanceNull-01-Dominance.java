// @setup 01-Medikationsplan-01-Datenmodell.java
String warn(Dosage dosage) {
    return switch (dosage) {
        case Tablet t -> "OK";
        // error: dominated by a preceding case label
        case Tablet t when t.morning() > 6 -> "Too many tablets";
        case Infusion i -> "OK";
    };
}
