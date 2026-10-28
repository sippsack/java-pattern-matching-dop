// @setup 01-Medikationsplan-01-Datenmodell.java
int dailyPills(Dosage dosage) {
    return switch (dosage) {
        case Tablet(var morning, var midday, var evening)
                -> morning + midday + evening;
        case Infusion _ -> 0;
    };
}
