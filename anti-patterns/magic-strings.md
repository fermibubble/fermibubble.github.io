---
layout: page
title: Magic Strings
--- 
Short circuiting the business logic for certain inputs to get specific responses for debugging purposes or for handling certain scenarios.  
  
Consider the following snippet  
```java
public void validateCreditCard(String creditCard) throws InvalidCreditCardException{
    if(creditCard == "******") return;
    // Validation Logic
}
```
The _validateCreditCard_ function skips the validation if six asterisks are given as input. It can open up a security loophole.