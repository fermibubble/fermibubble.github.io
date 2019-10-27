---
layout: page
title: Code Smells
---
_"Code smells are structural characteristics of software that may indicate a code or design problem that makes software hard to evolve and maintain, and may trigger refactoring of code"_ <sup>[[1]](#references)</sup>  
<br/>
#### Code duplication:  
Consider following snippet that has functions to return first even number and first odd number in a given a list
```java
List<Integer> values = Arrays.asList(1, 2, 3, 4, 5);

public Integer getFirstEven() {
    for(Integer value : values ) {
        if(value % 2 == 0) {
            return value;
        }
    }
    throw new NoSuchElementException();
}

public Integer getFirstOdd() {
    for(Integer value : values ) {
        if(value % 2 != 0) {
            return value;
        }
    }
    throw new NoSuchElementException();
}
```
Both the functions are identical except for the modular check.  
It can be refactored to:
```java
List<Integer> values = Arrays.asList(1, 2, 3, 4, 5);
 
public Integer getFirstEven() {
    return getFirst(values, x -> x%2 == 0);
}
 
public Integer getFirstOdd() {
    return getFirst(values, x -> x%2 != 0);
}
 
private Integer getFirst(Predicate<Integer> predicate) {
    return values.filter(predicate).findFirst().getAsInt();
}
```
If the above code is meant to be reside in a library, it's better to expose higher-order method rather than implementing individual functions. It gives better control to the consumer.
```java
List<Integer> values = Arrays.asList(1, 2, 3, 4, 5);
 
public Integer getFirst(Predicate<Integer> predicate) {
    return values.filter(predicate).findFirst().getAsInt();
}
```   
<br/>
#### Long Methods:
Every method should have only one level of abstraction.  
Consider following snippet that calculates shipping price based on total weight
```java
public double shippingPrice() {
    double totalWeight = 0;
    for(LineItem lineItem : lineItems) {
        totalWeight += lineItem.getWeight();
    }
    if(totalWeight < 5.0) {
        return 12.00;
    } else {
        return 20.00
    }
}
```
The above method has more than one level of abstraction.  
It's calculating total weight and shipping price.  
It can be refactored to:
```java
public double totalWeight() {
    double totalWeight = 0;
    for(LineItem lineItem : lineItems) {
        totalWeight += lineItem.getWeight();
    }
    return totalWeight;
}
 
public double shippingPrice() {
    double totalWeight = totalWeight();
    if(totalWeight < 5.0) {
        return 12.00;
    } else {
        return 20.00
    }
}
```
  _Note: Don't refactor with minimizing the number of lines as ONLY objective._
```java
public double shippingPrice() {
    return (lineItems.stream()
        .mapToDouble(LineItem::getWeight).sum() < 5.0 ) 
        ? 12.00 : 20.00;
}
```
The above code snippet still has more than one level of abstraction.  
It can be refactored to:
```java
public double totalWeight() {
    return lineItems.stream()
                    .mapToDouble(LineItem::getWeight)
                    .sum();
}
 
public double shippingPrice() {
    return totalWeight() < 5.0  ? 12.00 : 20.00;
}
```   
<br/>
#### Conditional Branching over Type-Code:  
Consider following snippet that takes a vehicle and tries to run it
```java
public void runVehicle(Vehicle vehicle) {
    if(vehicle instanceof Car)
        drive(vehicle);
    else if(vehicle instanceof Airplane)
        fly(vehicle);
    else
        sail(vehicle);
}
```
It's violating _Open/Closed_ principle. Any new vehicle comes we have to modify "runVehicle" method.  
It's violating Tell-Don't Ask principle.  
It can lead to duplication of code to perform similar operations like "washVehicle".  
It can be refactored to:
```java
public interface Vehicle {
    void run();
}
public void runVehicle(Vehicle vehicle) {
    vehicle.run();
}
``` 
<br/>
#### Primitive Obsession:  
Consider following snippet
```java
public class Census {
    Map<String, Integer> cityPopulations = { 
        {"Mumbai", 12442373}, 
        {"Delhi", 11034555}, 
        {"Bangalore", 8443675}, 
        {"Hyderabad", 6993262} };

    public long getCityPopulation(String city) {
        return cityPopulations.get(city);
    }
}
```
Simply, the above code is not _Object Oriented_  
It can be refactored to:
```java
public class City {
    private String name;
    private long population;
    public City(String name, long population) {
        this.name = name;
        this.population = population;
    }
    public long getPopulation() { return this.population; }
    public String getName() { return this.name; }
}
 
public class Census {
    private CityRepository cityRepository;
    public Census() { }
    public getCityPopulation(String city) {
        return cityRepository.get(city).getPopulation();
    }
}
```

<br/>
#### Long Parameter List:
The more parameters a method has, the more complex it is. Limit the number of parameters you need in a given method, or use an object to combine the parameters. According to Miller's law, the maximum number of objects that an average human can keep track of ( 7 +/- 2).  
<br/>
Consider following snippet that draws a triangle
```java
public void drawTriangle(int x1, int y1,
                         int x2, int y2,
                         int x3, int y3) {
    //Implementation
}
```
It can be refactored to:
```java
public class Point {
    private int x;
    private int y;
    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
    public int getX { return x; }
    public int getY { return y; }
}

public void drawTriangle(Point vertex1, Point vertex2, Point vertex3) {
    //Implementation
}
```  
<br/>
#### Deodorant Comment:
Using comments to explain behavior of bad code.  
Consider following snippet
```java
public void add(Object element) {
    int newSize = size + 1;
    if(newSize > elements.length) {
        // Grow the array
        Object[] newElements = new Object[elements.length + 10];
        // Copy the elements
        for(int i = 0; i < size; i++) {
            newElements[i] = elements[i];
        }
        elements = newElements;
    }
    elements[size++] = element;
}
```  
The above snippet has more than one responsibility and two unneccesary comments.  
It can be refactored to:
```java
public void add(Object element) {
    int newSize = size+1;
    if(newSize > elements.length) {
        grow();
    }
    elements[size++] = element;
}
```  
<br/>
#### Refused Bequest:  
Subclasses get to inherit the methods and data of their parents but they don't want or need the same.  
Consider following snippet
```java 
public abstract class AbstractCollection {
    public abstract void add(Object element);
} 
 
public class HashMap extends AbstractCollection {
    @Override
    public void add(Object element) {
        throw new UnsupportedException();
    }
    public void add(Object key, Object value) {
    }
}
```  
The "HashMap" class inherited "AbstractCollection" but its not implementing its methods. The inheritence hierarchy has to be adjusted.  
It can be refactored to:
```java
public class HashMap extends Map {
    @Override
    public void add(Object element, Object value) {
        //Implementation
    }
}
```
<br/><br/>
#### <a name="references"></a> References:
1. {% reference code-smells %}