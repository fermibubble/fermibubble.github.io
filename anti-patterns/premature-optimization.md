---
layout: page
title: Premature Optimization
---

_"Premature Optimization is root cause of all evil"_ - Sir Tony Hoare (famous by Knuth).
<br/><br/>
The most important function of computer code is to communicate the programmer's intent to a human reader. Any coding practice that makes the code harder to understand in the name of performance can be premature optimization.  

The key characteristics of a good software system are - reliability, efficiency, security & maintainability. Trading off these characteristics for the sake of insignificant performance benefits leads to disaster.   
<br/>
Following can be examples of early optimizations that can be premature:
{: style="margin-bottom: 0px"}
- Introducing custom libraries rather than using standard/open-source libraries as they might doing more than what needed. 
- Monolithic approach over microservices to prevent network latencies.
- Micro optimizations like - "Arrays.copyOf(array, array.length) is faster than array.clone()" , "++i is faster than i++", "for( ; ; ) is faster than while(1) "  

<br/>
The performance problems should be solved top-down rather than bottom-up. The Service Level Agreement (SLA) for each web service has to be fixed and all efforts should be made in order to achieve that SLA. For example, the SLA for a web service can be 100 ms and when we failed to fulfill that we have to think of further optimizations.   
<br/>
##### Note:
The premature optimization can be easily misinterpreted. Below are few pointers to be aware of : 
{: style="margin-bottom: 0px"}
- Only certain micro optimizations and few design considerations are premature. Algorithm choices like using quick sort over bubble sort, lazy evaluations etc are NOT premature optimization, they are essential design choices.
- It’s misbelief that performance problems will be easy to solve at the end of development cycle
- It’s misbelief that developer’s time is more valuable than server CPU cycles and hence wasting CPU time to reduce development efforts is always a win. (Client’s time should be of highest priority)