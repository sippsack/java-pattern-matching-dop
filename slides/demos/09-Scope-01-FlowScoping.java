// @setup 01-Medikationsplan-01-Datenmodell.java
boolean hasMorningPills(Dosage dosage) {
    return dosage instanceof Tablet t && t.morning() > 0;
}

int middayPills(Dosage dosage) {
    if (!(dosage instanceof Tablet tablet)) {
        return 0;
    }
    // `tablet` is in scope here
    return tablet.midday();
}
