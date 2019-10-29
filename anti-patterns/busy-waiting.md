---
layout: page
title: Busy Waiting
--- 
It's a phenomenon where processor is continuously spending its clock cycles while doing nothing and waiting for some event to occur. It can be a valid strategy in some scenarios but should be mostly avoided.  
  
Consider following snippet
```java
public class Sender implements Runnable {
    private Message message;
    public void run() {
        message.setText("Hello World");
    }
}
 
public class Receiver implements Runnable {
    private Message message;
    public void run() {
        while(message.isEmpty()) {
            try {
                Thread.sleep(5000); // Busy Wait
            } catch (InterruptedException e) {}
        }
        System.out.println(message.getText());
    }
}
 
public static void main(String[] args) {
     Message msg = new Message();
     new Thread(new Receiver(msg)).start();
     new Thread(new Sender(msg)).start();
}
```  
In the above snippet, the receiver thread sleeps for unnecessary long time leading to busy wait. Instead of waiting for 5 seconds, the receiver can listen for sender notification.  
It can be refactored to:

```java
public class Sender implements Runnable {
    private Message message;
    public void run() {
        synchronized(message) {
            message.setText("Hello World");
            message.notifyAll();
        }
    }
}
 
public class Receiver implements Runnable {
    private Message message;
    public void run() {
        synchronized(message) {
            while(message.isEmpty()) {
                try {
                    message.wait(); // Wait for notification
                } catch (InterruptedException e) {}
            }
        }
        System.out.println(message.getText());
    }
}
```
