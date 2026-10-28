// @setup 01-Medikationsplan-01-Datenmodell.java
String describeNullable(Dosage dosage) {
    return switch (dosage) {
        case null -> "no dosage";
        case Tablet t -> "tablets";
        case Infusion i -> "infusion";
    };
}
