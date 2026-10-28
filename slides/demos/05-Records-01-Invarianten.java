// @setup 01-Medikationsplan-01-Datenmodell.java
record Tablet(int morning, int midday, int evening) implements Dosage {
    public Tablet {
        if (morning < 0 || midday < 0 || evening < 0)
            throw new IllegalArgumentException("Counts must not be negative");
    }
}

record MedicationPlan(String patientName, List<Medication> medications) {
    public MedicationPlan {
        Objects.requireNonNull(patientName);
        medications = List.copyOf(medications);
    }
}
