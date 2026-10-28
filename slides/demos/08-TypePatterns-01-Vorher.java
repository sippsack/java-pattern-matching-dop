// @setup 01-Medikationsplan-01-Datenmodell.java
int morningPillsOld(Dosage dosage) {
    if (dosage instanceof Tablet) {
        Tablet tablet = (Tablet) dosage;
        return tablet.morning();
    }
    return 0;
}
