// @setup 01-Medikationsplan-01-Datenmodell.java
int morningPills(Dosage dosage) {
    if (dosage instanceof Tablet tablet) {
        return tablet.morning();
    }
    return 0;
}
