import java.util.List;
import java.util.Optional;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Predicate;

// Run with JDK 17+: java LegacyExamples.java
public class LegacyExamples {
    static Optional<Integer> first(List<Integer> values, Predicate<Integer> test) {
        return values.stream().filter(test).findFirst();
    }
    static boolean prime(int n) {
        if (n < 2) return false;
        for (int d = 2; d <= n / d; d++) if (n % d == 0) return false;
        return true;
    }
    static double rootSum(List<Integer> values, int k) {
        if (k < 0) throw new IllegalArgumentException("k must be nonnegative");
        return values.stream().filter(LegacyExamples::prime).limit(k)
            .mapToDouble(Math::sqrt).sum();
    }
    static void blockingExample() throws InterruptedException {
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(2);
        AtomicInteger sum = new AtomicInteger();
        Thread consumer = new Thread(() -> {
            try {
                while (true) {
                    int value = queue.take();
                    if (value == -1) return; // -1 is outside this example's input domain
                    sum.addAndGet(value);
                }
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
            }
        });
        consumer.start();
        try {
            queue.put(2); queue.put(3); queue.put(-1);
            consumer.join(2000);
            check(!consumer.isAlive() && sum.get() == 5, "queue result or termination");
        } finally {
            consumer.interrupt(); consumer.join(2000);
        }
    }
    static void withCleanup(Runnable process, Runnable cleanup) {
        try { process.run(); } finally { cleanup.run(); }
    }
    static boolean authorized(String suppliedToken, String expectedToken) {
        // Demonstrates no magic bypass; production token checks belong in an auth service.
        return expectedToken != null && !expectedToken.isBlank() && expectedToken.equals(suppliedToken);
    }
    static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }
    public static void main(String[] args) throws InterruptedException {
        check(first(List.of(1, 4, 6), x -> x % 2 == 0).orElseThrow() == 4, "first even");
        check(first(List.of(1, 3), x -> x % 2 == 0).isEmpty(), "empty optional");
        check(!prime(-1) && !prime(0) && !prime(1) && prime(2) && !prime(9), "prime boundaries");
        check(Math.abs(rootSum(List.of(1, 2, 4, 9, 5), 2) - Math.sqrt(2) - Math.sqrt(5)) < 1e-12, "prime roots");
        check(rootSum(List.of(2), 0) == 0, "zero limit");
        try { rootSum(List.of(2), -1); throw new AssertionError("negative limit accepted"); }
        catch (IllegalArgumentException expected) { }
        AtomicInteger cleanup = new AtomicInteger();
        try { withCleanup(() -> { throw new IllegalStateException("failure"); }, cleanup::incrementAndGet); }
        catch (IllegalStateException expected) { }
        check(cleanup.get() == 1, "cleanup after failure");
        check(authorized(new String("token"), "token") && !authorized("******", "token") && !authorized(null, "token"), "no magic bypass");
        blockingExample();
        System.out.println("Java examples passed: optionals, primes, queue, cleanup, authorization.");
    }
}
