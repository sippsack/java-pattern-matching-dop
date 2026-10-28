String describeAny(Object value) {
    return switch (value) {
        case String text -> text;
        case null, default -> "something else";
    };
}
