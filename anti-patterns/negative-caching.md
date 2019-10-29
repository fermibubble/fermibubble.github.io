---
layout: page
title: Negative Caching
--- 
Caching the negative HTTP responses.  
Consider following snippet that makes api call to a web service   
```java
@Cacheable
public HttpResponse call(URI uri, HttpRequest request) {
    HttpResponse response;
    // Make Call
    return response;
}
```  

If the web service call fails with 500 response for some internal reasons, we will be still caching it. So, even after the dependent service recovers from its error state, the function returns error response until the cache expiry time.
In some scenarios, it can be a design choice, but most of the cases it's an anti-pattern.  
  
It’s advisable to cache individual entities as opposed to higher-order objects that compose them.  

```java
@Cacheable
public Customer getCustomerDetails(int customerId) {
   Customer customer;
   HttpResponse response = RestClient.makeApiCall(...);
   // Validate Response and Extract Information
   return customer;
}
```

