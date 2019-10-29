---
layout: page
title: Action a a Distance
--- 
It's an anti-pattern in which behavior in one part of a program varies widely based on difficult/impossible to identify operations in another part of the program.  
  
Consider following snippet
```java
void setX(Integer x) {
    this.x = x;
    Display.update();
}
 
void setY(Integer y) {
    this.y = y;
    Display.update();
}
```
Suppose in above use-case we feel that all setter functions should update the display and thought of dealing it with AOP as below.  
```java
void setX(Integer x) {
    this.x = x;
}
 
void setY(Integer y) {
    this.y = y;
}

after() : set() {
   Display.update();
}
 
pointcut set() : execution(* set*(*) ) && within(io.fermibubble.*)
```  
If we just look at the code of a set-method, we will not be able to figure out that it magically updating the display. Mixing up normal code with AOP can lead to problems if not careful.