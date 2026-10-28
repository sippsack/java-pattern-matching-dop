// @setup 01-Medikationsplan-01-Datenmodell.java
var tablet = new Tablet(1, 0, 1);

tablet.morning();                      // 1
tablet.equals(new Tablet(1, 0, 1));    // true
tablet.toString();   // Tablet[morning=1, midday=0, evening=1]

// immutable: "changing" means creating a new one
var withMidday = new Tablet(tablet.morning(), 1, tablet.evening());
