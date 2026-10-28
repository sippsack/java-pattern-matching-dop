// @setup 01-Medikationsplan-01-Datenmodell.java
void start(Dosage dosage) {
    switch (dosage) {
        case Infusion(byte speed, _) -> setPumpSpeed(speed);
        case Infusion _ -> throw new IllegalArgumentException(
                "Speed does not fit the pump");
        case Tablet _ -> { }
    }
}
