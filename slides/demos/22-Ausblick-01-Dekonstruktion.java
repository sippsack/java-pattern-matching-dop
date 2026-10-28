class Infusion(int speed, int duration) {
    private final Rate rate;
}

interface Medication(Drug drug, Dosage dosage) { }


Medication(var drug, Infusion(var speed, _)) = med;


for (Map.Entry(var drug, var dose) : plan.entrySet()) {
    IO.println(drug + ": " + dose);
}
