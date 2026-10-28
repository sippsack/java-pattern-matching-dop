class Infusion(int speed, int duration) {
    public Infusion {
        if (speed <= 0)
            throw new IllegalArgumentException();
    }
}

var slower = infusion with { speed = speed / 2; };


String json = serializer.write(infusion);


Infusion back = serializer.read(json);
