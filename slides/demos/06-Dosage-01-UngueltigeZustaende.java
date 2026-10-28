// Which of these combinations make sense?
record Dosage(
        Integer morning, Integer midday, Integer evening,
        Integer speed, Integer duration) { }

new Dosage(1, 0, 1, 5, 2);                  // tablets *and* infusion?
new Dosage(null, null, null, null, null);   // nothing at all?
