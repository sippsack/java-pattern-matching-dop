// @setup 01-Medikationsplan-01-Datenmodell.java
var medication = new Medication(Drug.IBUPROFEN, new Tablet(1, 0, 1));
medication instanceof Medication(_, Tablet _);

String action(Dosage dosage) {
    return switch (dosage) {
        case Tablet _ -> "swallow";
        case Infusion _ -> "infuse";
    };
}
action(medication.dosage());

var plan = new MedicationPlan("Erika Muster", List.of(medication));
int count = 0;
for (var _ : plan.medications()) {
    count++;
}
count
