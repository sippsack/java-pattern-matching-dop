// @setup 01-Medikationsplan-01-Datenmodell.java
String category(Drug drug) {
    return switch (drug) {
        case PARACETAMOL, IBUPROFEN -> "painkiller";
        case CAFFEINE -> "stimulant";
    };
}
