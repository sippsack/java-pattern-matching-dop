// @setup 01-Medikationsplan-01-Datenmodell.java
// the pump only accepts a byte
void setPumpSpeed(byte speed) { System.out.println("Pump speed: " + speed); }

void start(Infusion infusion) {
    if (infusion.speed() instanceof byte speed) {
        setPumpSpeed(speed);
    } else {
        throw new IllegalArgumentException(
                "Speed does not fit the pump: " + infusion.speed());
    }
}
