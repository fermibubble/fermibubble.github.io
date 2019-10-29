---
layout: page
title: Sequential Coupling
--- 
 It appears when a class forces its methods to be called in a particular sequence to make it work correctly  
 Consider following snippet
 ```java
 public interface Processor {
    void preProcess();
    void process();
    void postProcess();
}
 
public class DefaultProcessor implements Processor {
    //Implementation
}
 
public static void main(String[] args) {
    Processor processor = new DefaultProcessor();
    processor.preProcess();
    processor.process();
    processor.postProcess();
}
```  
The methods _preProcess_, _process_ and _postProcess_ should be called sequentially to make the code work.  
It can be refactored to:  
```java
public interface Processor {
    void process();
}
 
public class DefaultProcessor implements Processor {
    public void process() {
        preProcess();
        //Implementation
        postProcess();
    }
}
 
public static void main(String[] args) {
    Processor processor = new DefaultProcessor();
    processor.process();
}
```