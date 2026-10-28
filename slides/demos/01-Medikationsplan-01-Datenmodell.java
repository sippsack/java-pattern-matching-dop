enum Drug { PARACETAMOL, IBUPROFEN, CAFFEINE }

sealed interface Dosage permits Tablet, Infusion { }
record Tablet(int morning, int midday, int evening) implements Dosage { }
record Infusion(int speed, int duration) implements Dosage { }

record Medication(Drug drug, Dosage dosage) { }
record MedicationPlan(String patientName, List<Medication> medications) { }
