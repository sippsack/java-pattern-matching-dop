sealed interface Dosage permits Tablet, Infusion { }
record Tablet(int morning, int midday, int evening) implements Dosage { }
record Infusion(int speed, int duration) implements Dosage { }
