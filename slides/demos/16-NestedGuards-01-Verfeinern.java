// @setup 01-Medikationsplan-01-Datenmodell.java
String warn(Medication medication) {
    return switch (medication) {
        case Medication(var drug, Infusion(var speed, _))
                when drug == Drug.CAFFEINE && speed > 10
                -> "Caffeine: too fast";
        case Medication(var drug, Tablet(var m, var d, var e))
                when drug == Drug.IBUPROFEN && m + d + e > 3
                -> "Ibuprofen: too many tablets";
        case Medication _ -> "OK";
    };
}
