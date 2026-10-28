// @setup 01-Medikationsplan-01-Datenmodell.java
String categoryOld(Drug drug) {
    String category;
    switch (drug) {
        case PARACETAMOL:
        case IBUPROFEN:
            category = "painkiller";
            break;
        case CAFFEINE:
            category = "stimulant";
            break;
        default:
            category = "unknown";
    }
    return category;
}
