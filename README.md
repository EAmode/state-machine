# ea-state-machine

A library for general purpose finite state machines with support for navigation and routing.

![ea-state-machine](statemachine-matter.svg)

## Overview

This light-weight `state machine` library can be used to effciently track the states of your business objects, application status, and proccess flows. Using the simple model of a finite state machine helps you to structure and easily reason about your problem and supports creating maintainable business rules and code. 

Examples:
  - Task Management: Once a task is `pending`, it can be `assigned`, `completed`, or `canceled`. An email is send to the person he task is assined to.
  - Flight status: A plane is `IN` the gate and is getting pushed `OUT` of the gate. Once `ON` the runway, the plane reaches V1 (velocity 1) to lift `OFF` from the origin airport to eventually land `ON` the runway of the destination.

## Design and Features

Most `routing` libraries in frontend frameworks have notions of state machines, but are often incomplete or are using a wrong abstraction. E. g.: A `route` is not a real route from `A` to `B`, but rather a `page`, which is better modeled as a `state`. Once you realize that, you can model "real" routes as a transition from one state to the other, which allows you to execute business logic when a user navigates from one page to another. Guards on transitions allow to control the flow of a user with a centralzed set of business rules.
The reason that curent routing libraries are not fully supporting a state machine model is that users are often allowed to navigate from any page to any page and setting up all those transitions is too tedious. So guards are not on the transition, but more an entry condition to a page.
This library overcomes this shortcomming of state machine with the addition of a `Transition Defintion`. This allows for the simple common case scenario as well as enableing to extent your page navigation with complex flow rules.
Just using the abstation of this library allows to move this logic from an older framework toa new one. Write your routing logic once, run it everywhere!
 
## Usage

Using npm:
```shell
  npm install --save-dev javascript-state-machine
```

In a browser:
```html
  <script src='CDN LINK HERE'></script>
```
