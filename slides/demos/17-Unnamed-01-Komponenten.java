// @setup 01-Medikationsplan-01-Datenmodell.java
int morningPills(Dosage dosage) {
    return switch (dosage) {
        case Tablet(var morning, _, _)
                -> morning;
        case Infusion(_, _) -> 0;
    };
}
