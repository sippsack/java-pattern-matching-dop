import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import jdk.jshell.DeclarationSnippet;
import jdk.jshell.JShell;
import jdk.jshell.Snippet;

class SnippetRunner {
    private static final int OUTPUT_LIMIT = 60_000;

    public static void main(String[] args) throws Exception {
        var code = new String(args.length > 1 && !args[1].equals("-")
                ? java.util.Base64.getDecoder().decode(args[1])
                : System.in.readAllBytes(), StandardCharsets.UTF_8);
        var setup = args.length > 2
                ? new String(java.util.Base64.getDecoder().decode(args[2]), StandardCharsets.UTF_8)
                : "";
        var response = System.out;
        var buffer = new ByteArrayOutputStream();
        var limited = new java.io.OutputStream() {
            private boolean truncated;

            @Override
            public void write(int value) {
                if (buffer.size() < OUTPUT_LIMIT) {
                    buffer.write(value);
                } else if (!truncated) {
                    truncated = true;
                    buffer.writeBytes("\n[Ausgabe nach 60 KB abgeschnitten]\n".getBytes(StandardCharsets.UTF_8));
                }
            }
        };
        var console = new PrintStream(limited, true, StandardCharsets.UTF_8);
        System.setOut(console);
        System.setErr(console);
        System.setIn(java.io.InputStream.nullInputStream());
        boolean success = true;

        // The local engine keeps all user threads in this disposable, time-limited JVM.
        var builder = JShell.builder()
                .executionEngine("local")
                .out(console)
                .err(console);
        if (args.length == 0 || Boolean.parseBoolean(args[0])) {
            builder.compilerOptions("--enable-preview", "--source", String.valueOf(Runtime.version().feature()));
        }
        try (var shell = builder.build()) {
            // Match the standard imports of the interactive JShell tool.
            for (var packageName : new String[] {
                    "java.io", "java.math", "java.net", "java.nio.file", "java.util",
                    "java.util.concurrent", "java.util.function", "java.util.prefs",
                    "java.util.regex", "java.util.stream" }) {
                shell.eval("import " + packageName + ".*;");
            }
            for (int phase = 0; phase < 2; phase++) {
                var remaining = phase == 0 ? setup : code;
                while (!remaining.isBlank()) {
                    var completion = shell.sourceCodeAnalysis().analyzeCompletion(remaining);
                    if (!completion.completeness().isComplete()) {
                        console.println("Unvollständiges Java-Snippet.");
                        success = false;
                        break;
                    }
                    boolean failed = false;
                    for (var event : shell.eval(completion.source())) {
                        if (event.status() == Snippet.Status.REJECTED || event.exception() != null) {
                            shell.diagnostics(event.snippet()).forEach(diagnostic ->
                                console.println((diagnostic.isError() ? "Fehler: " : "Hinweis: ")
                                    + diagnostic.getMessage(Locale.GERMAN)));
                            failed = true;
                        }
                        if (event.exception() != null) {
                            console.println(event.exception());
                        } else if (event.value() != null && !event.value().isEmpty()) {
                            console.println("=> " + event.value());
                        } else if (event.snippet() instanceof DeclarationSnippet declaration
                                && event.causeSnippet() == null && event.status() != Snippet.Status.REJECTED) {
                            console.println("=> " + declaration.name() + " deklariert");
                        }
                    }
                    if (failed) {
                        success = false;
                        break;
                    }
                    remaining = completion.remaining();
                }
                // Sealed hierarchies need forward references until all variants are declared.
                for (var snippet : shell.snippets().toList()) {
                    var status = shell.status(snippet);
                    if (status == Snippet.Status.RECOVERABLE_NOT_DEFINED
                            || status == Snippet.Status.RECOVERABLE_DEFINED) {
                        success = false;
                        console.println("Nicht vollständig aufgelöst: " + snippet.source());
                        shell.diagnostics(snippet).forEach(diagnostic ->
                            console.println(diagnostic.getMessage(Locale.GERMAN)));
                    }
                }
                if (!success) break;
                if (phase == 0) buffer.reset();
            }
        }
        console.flush();
        response.println("{\"ok\":" + success
            + ",\"runtime\":" + json(System.getProperty("java.runtime.version"))
            + ",\"output\":" + json(buffer.toString(StandardCharsets.UTF_8)) + "}");
        // Snippets may leave non-daemon threads running.
        System.exit(0);
    }

    private static String json(String text) {
        var result = new StringBuilder("\"");
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            switch (c) {
                case '"' -> result.append("\\\"");
                case '\\' -> result.append("\\\\");
                case '\n' -> result.append("\\n");
                case '\r' -> result.append("\\r");
                case '\t' -> result.append("\\t");
                default -> {
                    if (c < 32) result.append(String.format("\\u%04x", (int) c));
                    else result.append(c);
                }
            }
        }
        return result.append('"').toString();
    }
}
