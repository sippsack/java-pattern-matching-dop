// @setup 01-Medikationsplan-01-Datenmodell.java
var plan = new MedicationPlan("Erika Muster", List.of(
    new Medication(Drug.PARACETAMOL, new Tablet(1, 0, 1)),
    new Medication(Drug.IBUPROFEN, new Tablet(0, 1, 0)),
    new Medication(Drug.CAFFEINE, new Infusion(50, 30))
));

System.out.println("Medikationsplan für " + plan.patientName());
plan.medications().forEach(System.out::println);
