---
layout: page
title: Accidental Complexity
---

The complexity that not related to the problem.
Consider the following snippet that computes sum of square root of k prime numbers starting from n.

```java
public static double compute(int n, int k) {
    double result = 0;
    double index = n;
    double count = 0;
    while(count < k) {
        if(isPrime(index)) {
            result += Math.sqrt(index);
            count++;
        }
        index++;
    }
    return result;
}
```
It’s hard to understand what the above function is doing at first glance.  
It can be made better by refactoring it as below

```java
public static double compute(int n, int k) {
    return Stream.iterate(n , i -> i + 1)
                 .filter(x->isPrime(x))
                 .mapToDouble(Math:sqrt)
                 .limit(k)
                 .sum();
}
```  
The former follows imperative paradigm and the later follows declarative paradigm.  

The imperative programming is about using statements that change the state whereas declarative programming is about expressing the logic abstracting those state changing statements.  

It's advisable to prefer declarative programming over imperative programming unless there is a specific usecase for not to do so.
