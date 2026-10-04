# Table of Contents
- [Playground 1](#playground-1)
  - [Task 1](#task-1--introduce-es-modules)
  - [Task 2](#task-2--correct-the-application-behavior)
  - [Task 3](#task-3--make-failures-explicit)
  - [Task 4](#task-4--refactor-asynchronous-control-flow)
  - [Task 5](#task-5--remove-remaining-code-smells)
- [Playground 2](#playground-2)
  - [Task 1](#task-1--establish-the-build)
  - [Task 2](#task-2--migrate-to-typescript)
  - [Task 3](#task-3--add-static-analysis-and-formatting)
  - [Task 4](#task-4--provide-a-consistent-command-interface)
  - [Task 5](#task-5--enforce-quality-before-integration)
- [Playground 3](#playground-3)
  - [Task 1](#task-1--establish-the-react-application)
  - [Task 2](#task-2--design-the-component-tree)
  - [Task 3](#task-3--model-state-and-interaction)

# Playground 1

## Task 1 – Introduce ES modules
### How does an ES module differ from a classic script with respect to scope, strict mode, loading, and bindings? Explain why the module boundaries you chose make the application easier to maintain.

#### Classic Script
- puts everything in global scope
- for strict mode a 'use strict' is necessary
  - strict mode -> security rules which indicate silent errors, implicit global variables, etc.
- block the parser
- copy values

#### ES modules
- ECMAScript modules: standard for modularizing JavaScript code
- have their own scope
  - nothing is exposed unless it is explicitly exported
- strict mode is enabled by default
- load asynchronously and respect dependency graphs via 'import'
- use 'live bindings', meaning imports always reflect the current exported
  - when one module exports a function, that another module imports, the connection is "live", which means that the import is not a "snapshot", its a reference to the exported value

#### Maintainability Improvements (ES modules)
- each module has one clear responsibility
- no accidental global variables
- isolated modules
  - easier to test
  - easier to refactor or change rendering/data logic without touching unrelated paths
- dependency graph is clear and explicit (import/export)

## Task 2 – Correct the application behavior

### Describe event propagation (capturing, target, and bubbling). Where could event delegation be useful in this application, and what trade-off would it introduce?

#### Event Propagation
Event propagation describes how an event flows through the DOM tree. It consists of three phases:
1. **Capturing Phase**: The event starts from the root of the DOM tree and travels down to the target element. During this phase, event listeners registered for the capturing phase can intercept the event before it reaches the target (indicated via capture: true in .addEventListener(...)).
2. **Target Phase**: The event reaches the target element, and any event listeners registered on the target element are executed.
3. **Bubbling Phase**: After the target phase, the event bubbles back up through the DOM tree back to the root. This phase is mostly used in this application (default for .addEventListener(...))

#### Event Propagation – Visualize
1. **Capturing Phase**: Parent → Child / Top down
2. **Target Phase**: Child / directly on the target element
3. **Bubbling Phase**: Child → Parent / Bottom up

#### Event Delegation
Event delegation describes, that a listener is not attached to each element itself, but to a common parent, which captures all events in the **Bubbling Phase**.
This is especially useful for dynamic elements (because you do not want to place a listener on each dynamic element) and therefore for the **'more_bears'** section in our application, as bears are dynamically created depending on the API response.

#### Event Delegation – Trade Offs
  - handling of events is more complex, because it is not implicitly clear which element triggered the event
  - when you have deeply nested DOM trees, it could be difficult to determine where the event is captured (to which parent it is delegated)

## Task 3 – Make failures explicit

### How do synchronous exceptions and rejected promises travel through this application? Explain where errors should be caught and why catching every error at its source can make failures harder to diagnose.

#### Application Flow
In this application, we have following exception flow (bears.ts):
- ``initializeBearsApi()`` calls ``fetchBearData()``
- ``fetchBearData()`` creates a promise
- this promise may be rejected (corrupt JSON, network error, API down, etc.)
- promise goes as 'rejected promise' back to ``initializeBearsApi()``
- ``initializeBearsApi()`` catches error, prints it to the console and returns mock data, which displays placeholder images (as an excuse) and information that the API is down

```mermaid
flowchart LR
    A[fetchBearData] -->|rejected| B[initializeBearsApi]
    B -->|catch Error| C[return errorData]
```

Addition: Task 5 –  when `fetchWikipediaAPI()` fails, it returns a rejected promise to the function that called it, for example `fetchBearWikitext()`.
`fetchBearWikitext()` then (due to `await`) passes the rejected promises further above to `initializeBearsApi()`, which then throws an error 
and is caught in the `try/catch` block of `initializeBearsApi()`. Here, the error is logged and handled (by returning placeholder errorData).
Generally, when a promise is rejected, it throws an error at the point where it was awaited (same as if you would write `throw new Error(...)`, which can be caught in a `try/catch` block.

#### Catching errors
When each error is caught at its source, it can make failures harder to diagnose, because the error may be coming from:
- network
- API
- JSON parsing
- Regex
- Logic
- etc.

This also makes debugging very hard & time-consuming.
For example, when each layer returns some fallback data, it is not clear where the error originated from, and the error may be lost in the process.
When doing this too often, the application always looks like it is working, but consists of invisible errors, which are hidden from the user.

It is better practice to catch errors at a higher level, where the error can be displayed/logged and replaced with fallback data.
Synchronous exceptions: try/catch blocks, when try block fails, then catch block is executed
Rejected promises: when something fails, Promise.reject() is called, which is returned to the caller (higher level), which can then either handle the exception or pass it further up the call stack.

## Task 4 – Refactor asynchronous control flow

### Explain the relationship between async/await, promises, the microtask queue, and the browser event loop. Also explain why an arrow function is not always an interchangeable replacement for a regular function, particularly regarding this.

#### Promise
A promise represents a value that will be available later. Basically, it just defines that at some time a value will be there.
When it is resolved or rejected, the callbacks (``.then()``, ``.catch()``) do not run immediately – they are placed into the **microtask queue**.
Promise callbacks always run **AFTER** the current synchronous code, but before any regular events.

#### Async/Await
Syntactic addition for promises. ``await`` schedules the continuation (``.then()``, ``.catch()``) as a microtask.
```javascript
const result = await fetch(url)
// is the same as
fetch(url).then(response => {})
```

#### Microtask Queue
The microtask queue is a high-priority queue used for promise callbacks and async/await continuations.
The execution within the browser follows this order:

1. Run all synchronous code
2. Run all microtasks (Promises, async/await)
3. Render updates
4. Run macrotasks (setTimeout, setInterval, I/O, events)

#### Browser Event Loop
The event loop coordinates the call stack, microtask queue, macrotask queue, rendering.
It ensures that JavaScript appears as asynchronous, even though it is single-threaded.

#### Arrow Functions vs Regular Functions
A big difference between arrow functions and regular functions comes down to the ``this`` keyword.
For a **Regular Function** the ``this`` keyword refers to the surround lexical scope.
```javascript
button.addEventListener('click', function () {
    this.classList.add('active'); // this = button
});

```
For an **Arrow Function** the ``this`` keyword is lexically bound to the surrounding context where the arrow function was defined.
```javascript
button.addEventListener('click', () => {
    this.classList.add('active'); // this ≠ button
});
```

For example, when async code resumes, and the value of ``this`` is used and it refers to the wrong context (due to arrow/regular function),
it could be difficult to debug.
This happens, as the error appears asychronously and the stack trace points to the microtask continuation and not the original call.

Another difference is that **Arrow Functions** do not have own ``arguments``.
```javascript
// Regular
function log() {
    console.log(arguments);
}
// Arrow
const log = () => {
  console.log(arguments); // ReferenceError
};
```

## Task 5 – Remove remaining code smells

### Select one of your refactorings and explain how JavaScript scope, closures, references, or prototypes caused the original risk. State how you verified that your refactoring preserved behavior.

#### Bear API
The original implementation consisted of a single function that both fetched and parsed data, which violated the Single Responsibility Principle. It was therefore split up into several smaller functions, each handling one concern.
Another refactoring extracted the placeholder error data into a separate module, in order to separate data from logic.
The `fetch()` logic was also refactored, since it was duplicated across two places. It was extracted into a shared function that takes `params as an argument.

```javascript
// Example Duplicated Code

// Before
const fetchBearData = async () => {
  // Fetching bear data
  const params = {
    // ... 
  };
  // ...
  const response = await fetch(url);
  const data = await response.json();
  // ...
};

const fetchImageUrl = async (fileName) => {
  // ...
  const imageParams = {
    // ...
  };
  // ...
  try {
    const response = await fetch(url);
    const data = await response.json();
    // ...
  } catch (error) {
    // ...
  }
}

// After
// shared function
async function fetchWikipediaApi(params) {
  const url = BASE_URL + "?" + new URLSearchParams(params).toString();
  const response = await fetch(url);
  return await response.json();
}

```

```javascript
// Example Single Responsibility Principle
// Before
export function initializeSearch() {
  // search highlights
  // remove highlights
  // get search key
  // ...
    function highlightSearchKey(node) {
      // ... highlight nodes
    }
  // ...
}

// After
export function initializeSearch() {
  // ...
  removeHighlights()
  // ...
  document.querySelectorAll('article').forEach(article => highlightNode(article, regex));
}

function removeHighlights() {}
function highlightNode(node, regex) {}
```


#### Search
The Single Responsibility Principle was violated here as well, so the relevant logic was extracted into a separate method.
Directly iterating over `node.childNodes` created a risk, since `node.childNodes` is a live snapshot of the current state rather than a fixed copy.
Within the same function, nodes were being manipulated and new nodes were potentially added (when highlighting text), changing `node.childNodes` during iteration, which could lead to unexpected behavior or bugs.
To prevent this, a copy of `node.childNodes` was created before iterating, ensuring that the iteration ran over a static snapshot of the nodes instead.

```javascript
// iterating over live snapshot (unexpected behavior possible)
node.childNodes.forEach(highlightSearchKey);

// iterating over static snapshot
Array.from(node.childNodes).forEach(child => highlightNode(child, regex));
```


#### Comments
Only refactoring regarding consistency took place.

#### Bears List
Another risk was found here. Previously, each bear was created and added to the DOM separately.
As a result, each bear triggered a reparsing and rerendering of all previously inserted bears (the HTML was completely rebuilt on each iteration).
This negatively impacts the overall performance (with each new bear, all old bears also need to be recreated) → O(n²) complexity
Therefore, the full HTML is now built at once using `map`and `join`and after that written to `innerHTML` to trigger one single DOM update. (one instead of n DOM updates with n bears)

```javascript
// each iteration triggers rerendering of all previously inserted bears
bears.forEach(bear => {
        moreBears.innerHTML += `
            <div class="bear">
                <img src="${bear.image}" alt="${bear.name}" style="width:200px; height:auto;">
                <p><b>${bear.name}</b> (${bear.binomial})</p>
                <p>Range: ${bear.range}</p>
            </div>
        `;
    });

// build full html at once and then write to innerHTML to trigger one single DOM update
const html = bears.map(bear => `
        <div class="bear">
            <img src="${bear.image}" alt="${bear.name}" style="width:200px; height:auto;">
            <p><b>${bear.name}</b> (${bear.binomial})</p>
            <p>Range: ${bear.range}</p>
        </div>
    `).join("")

moreBears.innerHTML = html;
```

# Playground 2

## Task 1 – Establish the build

### Distinguish source, build, distribution, and deployment. What does your build tool do in development and in a production build, and why is the lockfile important for reproducibility?

#### Source, Build, Distribution & Deployment
- **Source**
  - Code written in `/src` folder. Often ES modules and often not directly runnable in browsers as they are.
- **Build**
  - Process of transforming the source code into a runnable format. Modules are bundled together, transpiled to older JavaScript versions, minified, etc.
- **Distribution**
  - Output of the **build** process. Often stored in `/dist` folder. Contains static, ready-to-go files (HTML, CSS, JS). 
    They are always generated from the source code and never manually edited.
- **Deployment**
  - Process of pushing the **distribution** files to a server or hosting platform, where end users have the ability to access them.

#### Build Tool – Vite

- **Development**
  - Started with `npx vite`
  - Vite serves source files using ES module imports in the browser, only transforming code on the fly when requested.
  - Server starts almost instantly – no full bundling is done.
  - Changes are seen via **Hot Module Replacement** (full page reload not needed)
  - Priority lies in speed and debugging
  
- **Production**
  - Started with `npx vite build`
  - Vite bundles all modules together, removes unused code (tree-shaking), minifies the output and adds content hashes to filenames (purpose of caching).
  - Priority lies in producing the smallest, fastest-loading and production-ready files.

#### Importance of `package-lock.json`
`package.json` usually specifies version ranges (for example `^2.1.0`, which means `2.1.0` or newer, but only minor and patch versions, not `3.0.0` or newer).
`package.json` possible version prefixes:
- `^` – only minor and patch versions
- `~` – only patch versions
- `>` or `>=` or `<` or `<=` – any version greater or smaller than the specified one
- `=` – exact version
- `*` or `x` – any version (also `4.x` possible)
- `-` – any version in a specified range
- `||` – OR relationship (one of the specified versions must be satisfied)

`package-lock.json` defines the exact resolved versions of every dependency in the full dependency tree. By running `npm ci` anywhere, it is guaranteed that the exact same `node_modules` are produced.
Without the use of a lockfile, in different environments (local, server, other developer, etc.) different setups may consist of different versions as `package.json` only specifies a range.
This could potentially lead to bugs or unexpected behavior.
This is the reason why `package-lock.json` is important for reproducibility and therefore commited to the repository.


## Task 2 – Migrate to TypeScript

### TypeScript uses structural typing and erases types during compilation. Explain both concepts and why a compile-time type alone cannot guarantee the shape of a Wikipedia API response at runtime.

#### Structural Typing
TypeScript checks types based on their structure rather than their name. If a value has all
required properties with the correct types, it is considered to be of that type, regardless of
how it was declared or where it came from.
In contrast, nominal typing (Java, C#) requires a class to explicitly declare that it implements or extends a type.

#### Type Erasure
Types only exist at compile time. When TypeScript is translated to JavaScript, the compiler removes all annotations, interfaces and generics completely.

#### Why a compile-time type alone cannot guarantee the shape of a Wikipedia API response
The compiler only knows the source code, not what `fetch` returns at runtime. 

#### Before (Generic Implementation – no type checking)
`response.json()` returns `Promise<any>`. In the generic implementation, the result is cast
`as T`:

```typescript
return (await response.json()) as T;
```

This is only an assertion to the compiler, which trusts it without checking, because it has no access to the runtime data. Due to type erasure, `T` does not even exist at runtime, so no
check could happen there anyway. If Wikipedia sends something different (a missing property, a changed format, an error object), the code still compiles but fails at runtime, e.g. with `Cannot read properties of
undefined`. The type only describes what we expect, not what actually arrives.

Therefore, data from external sources must be checked at runtime (e.g. with type guards or
a schema library) before it is treated as **typed**.

#### After (Type Guard Implementation – type checking)
The shape of the API response is checked at runtime via `isWikitextResponse()` and `isImageInfoResponse()`. If the check fails, an error is thrown and the promise is rejected. This ensures that the code only continues with valid data, even if Wikipedia changes its API or returns an unexpected response.

## Task 3 – Add static analysis and formatting

### What different problems do a linter, a formatter, and the TypeScript compiler detect? Give one concrete example for each from this project.

#### Linter
A linter detects risky or inconsistent code patterns that are still valid TypeScript. Example from this project: in `parseBear`, the check `if (!name || !binomial || !image)` compiles, but the rule `strict-boolean-expressions` (part of `standard-with-typescript`) reports the implicit check on a `string | undefined`. It also hides a subtle behavior: an empty string is treated as a missing value.

#### Formatter
A formatter only detects deviations in layout, never in behavior. Example from this project: the code was indented with 4 spaces, but the prescribed Prettier config uses `tabWidth: 2`. Prettier reports `Delete ····` on nearly every line and would also replace `"` with `'` because of `singleQuote: true`. The program behaves exactly the same before and after formatting.

#### TypeScript Compiler
The compiler detects type errors, meaning values that are used in a way their types do not allow. Example from this project: `fetchImageUrl` was declared to return `Promise<ImageInfoResponse>`. However, it returns a URL, which is a `string`. The compiler reports that `string` is not assignable to `ImageInfoResponse` (correct return type: `Promise<string>`). Similarly, `nameField.value` fails because `querySelector` returns `Element | null`, and `Element` has no property `value`.

## Task 4 – Provide a consistent command interface

### Why are stable, composable commands such as these useful as an interface for developers and CI? Explain idempotence and identify which of your scripts should be idempotent.

#### Why stable, composable scripts matter

npm scripts provide a **uniform, tool-agnostic interface**. Developers and CI both run the exact same command (`npm run build`, `npm run lint`, …), regardless of what's running underneath (Vite, Webpack, ESLint, Prettier).

- **Abstraction**
  - callers don't need to know the underlying tool or flags; tooling can change without changing the interface.
- **Composability**
  - scripts chain easily, e.g. `npm run lint && npm run format:check && npm run build`, or as discrete CI pipeline steps.
- **Consistency**
  - local dev and CI run identical checks, eliminating "works on my machine" gaps.
- **Reliable exit codes**
  - since `build`, `lint`, and `format:check` exit non-zero on failure, CI can gate merges/deploys automatically without parsing output text.

#### Idempotence

An operation is **idempotent** if running it multiple times with the same input produces the same end state as running it once — repeated calls don't cause additional side effects.

#### Which scripts should be idempotent?

| Script         | Idempotent? | Why                                                                                                        |
|----------------|-------------|------------------------------------------------------------------------------------------------------------|
| `build`        | Yes         | Same source → same `dist` output every time; no accumulating artifacts.                                    |
| `lint`         | Yes         | Read-only check, no side effects.                                                                          |
| `format:check` | Yes         | Read-only check, no side effects.                                                                          |
| `format`       | Yes         | Formats to a fixed rule set; re-running on already-formatted code changes nothing (reaches a fixed point). |
| `lint:fix`     | ~️           | Ideally idempotent, but if rules conflict with each other it can be non-idempotent.                        |
| `dev`          | /           | Long-running process, no defined "end state" to compare.                                                   |

**Key point:** Idempotence matters most for CI — a build/check step that varies between runs (due to accumulated state or execution order) makes pipelines unreliable. `npm run build` should produce the exact same output on a fresh CI runner as it does after multiple prior runs.

## Task 5 – Enforce quality before integration

### Compare a local pre-commit hook with a CI quality gate. Why is CI still necessary when hooks are configured, and why should CI use non-mutating checks rather than automatically rewriting source files?

#### Pre-commit Hook vs. CI

- **Scope:** 
  - hook checks only staged files; CI checks the whole branch/PR
- **Behavior:** 
  - hook auto-fixes (`--fix`, `--write`); CI only reports pass/fail, changes nothing
- **Bypassable:** 
  - hook can be skipped with `--no-verify`; CI cannot
- **Environment:** 
  - hook runs locally (variable); CI runs on a fixed, reproducible machine

#### Why CI is still necessary despite the hook

- Hooks can be bypassed (`git commit --no-verify`)
- If `npm install` never ran, the hook doesn't even exist
- Merges/squashes on GitHub never pass through a local hook
- Old commits from before the hook existed are unchecked
- CI is the only central, enforceable checkpoint (branch protection)

#### Why CI should be non-mutating (no auto-fixes via `--fix` or `--write`)

- CI should verify, not modify — otherwise checked code no longer matches the committed code
- Auto-fixes in CI would need to be committed back — unclear who, when, how
- Results must be locally reproducible; auto-fixes would blur that
- Write access for CI (to push fixes) is an unnecessary security risk

# Playground 3

## Task 1 – Establish the React application

### Contrast imperative DOM updates with React's declarative model. What happens during React's render, reconciliation, and commit phases, and why should code outside React not modify DOM nodes owned by the React root? If you chose not to use React, answer the same questions in the context of your chosen framework.

#### Imperative vs. Declarative Model

- **Imperative**
  - step by step instructions on how to manipulate the DOM
    - e.g. `document.createElement`, `appendChild`, `setAttribute`, etc
  - current state of DOM needs to tracked by yourself
- **Declarative**
  - for a given state, you describe what the UI should look like
  - when state is changed, React automatically updates the DOM to match the new state

#### React Phases

- **Render**
  - React calls components and gets back a tree of React elements (virtual DOM)
  - components are pure functions of props and state, so they can be called multiple times without side effects
- **Reconciliation**
  - technically part of the **Render** phase
  - React diffs the new virtual DOM against the previous one to determine what has changed
  - same type at the same positions results in an update in place
  - different type means unmount and remount
  - React uses keys to identify elements in lists and optimize updates
- **Commit**
  - React applies the changes to the real DOM (cannot be interrupted)
  - React also calls lifecycle methods (e.g. `useEffect`) and cleans up unmounted components

#### Why should code outside React not modify DOM nodes owned by the React root?

- React never re-reads the DOM. It assumes the DOM still matches what it last committed.
- If you change React-managed nodes, React's internal tree and the real DOM diverge:
  - Updates may silently do nothing, e.g. when React updates a text node you already replaced with a `<mark>`.
  - Updates may throw errors like `removeChild`/`insertBefore` "not a child of this node".
  - Your changes get overwritten or lost when React re-creates the node.
- Legitimate ways to touch the DOM:
  - Use refs and effects for elements React doesn't render.
  - Keep manual code in separate containers outside the root.

## Task 2 – Design the component tree

### Explain how component boundaries and typed props act as contracts. What makes a key stable, why does React need keys during reconciliation, and why is an array index unsuitable when list entries can change order?

#### Component boundaries and typed props as contracts

- Props are a component's interface: typed input in, JSX out.
- `BearCard({ bear }: { bear: Bear })` means "give me a full `Bear`, I render it." TypeScript rejects anything else at compile time.
- Caller and component stay decoupled, so internals can change while the props stay the same.
- Pure rendering keeps the contract honest: same props, same output.

#### Why React needs keys during reconciliation and what makes a key stable

- During reconciliation React diffs the old and new tree and updates only what changed.
- Without keys it compares list items by position, so one insert at the front makes every item look changed.
- A key gives each item an identity, so React can keep, move, create or remove the right one.
- **What makes a key stable?**
  - Unique among siblings.
  - Tied to the data, not the position (`bear.binomial`, a comment `id`).
  - Unchanged between renders, never generated inside `.map` (`Math.random()` remounts everything).

#### Why an index is unsuitable

- The index is a position, not an identity: after reordering, inserting or removing, the same index points to a different item.
- React then reuses the wrong component, so state, input values and focus stay at the position instead of following the item.
- Only acceptable for static lists that are never reordered or changed.

## Task 3 – Model state and interaction

### Distinguish props, stored state, and derived values. Explain why direct mutation can produce incorrect React behavior and when lifting state is preferable to introducing context.

#### Props, state, derived values

- **Props:** input from the parent, read-only for the child.
- **State:** data the component owns and that changes over time (`useState`); a change triggers a re-render.
- **Derived values:** computed from props or state during render, never stored (`comments.length`, `visible ? 'Hide' : 'Show'`).
- Rule: if it can be calculated from existing props or state, derive it. Storing it duplicates the truth and lets copies drift apart.

####  Why direct mutation breaks React

- React detects changes by comparing references; `comments.push(x)` keeps the same array reference, so React sees no change and may skip the re-render.
- Mutating state or props also breaks memoization (`memo`, dependency arrays) and can change data that other components still hold.
  - Memoization – storing result of a function, so when it is called again with the same input, the stored result is returned instead of recalculating it
- Always create a new value: `setComments((prev) => [...prev, newComment])`.

#### Lift state or use context

- **Lift state** to the closest common parent when a few nearby components share it (`term` in `App` for search and its readers).
  - Data flow stays explicit and easy to trace through props.
- **Use context** when many components at different depths need the same value and passing props through each level (prop drilling) becomes noisy, e.g. theme or current user.
  - Trade-offs: dependencies become implicit, and every consumer re-renders when the value changes.
- Default to lifting; add context only when the prop chain gets long.

## Task 4 – Load and represent remote data

### Why is fetching data a synchronization with an external system rather than part of pure rendering? Explain how cleanup or cancellation prevents race conditions when a component unmounts or a request becomes irrelevant.

#### Why fetching is synchronization with an external system, not pure rendering

- **Rendering must be pure:** same props/state in, same JSX out. No side effects, no dependence on anything outside the component.
- **A network request is a side effect:** it talks to the outside world (Wikipedia API), takes time, can fail, and its result is not determined by props/state.
- **Effects exist for this:** `useEffect` synchronizes React state with a system React does not control (network, timers, DOM APIs, subscriptions).
- **Doing it during render would break things:**
  - Render can run multiple times (StrictMode, re-renders), so the request would fire repeatedly.
  - Calling `setState` during render causes loops.
- **Pattern:** render describes the UI for the current state, the effect fetches and writes the result into state, and the next render shows it.

#### How cleanup / cancellation prevents race conditions

- **The problem:** requests are asynchronous and responses can arrive in a different order than they were sent.
  - Request A (old) and request B (new) are in flight, A is slower and arrives last, so it overwrites B's newer result with stale data.
  - A response arrives after unmount and calls `setState` on a component that no longer exists.
- **Cleanup function:** React runs it before the effect re-runs and on unmount, so it marks the old effect execution as obsolete.
- **`ignore` flag (closure per execution):**
  - Each effect run has its own `ignore = false`.
  - Cleanup sets it to `true`.
  - When the response arrives, `if (ignore) return;` discards it, so only the latest execution may update state.
- **`AbortController` (real cancellation):**
  - Cleanup calls `controller.abort()`, the `fetch` rejects with an `AbortError`, and the network request is actually cancelled.
  - The `.catch` must ignore `AbortError` so it is not shown as an error state.
- **Difference:** `ignore` only discards the result, while `AbortController` also stops the request and saves bandwidth. Both prevent stale data from overwriting newer results.

## Task 5 – Add client-side routing and verify the migration

### Distinguish client-side rendering, a single-page application, and client-side routing. Compare route parameters with query parameters, and describe one benefit and one cost of the SPA architecture used here.

#### Definitions

- **Client-side rendering (CSR):** The browser builds the UI with JavaScript.
  - The server sends a nearly empty HTML shell (`<div id="root">`) plus a JS bundle.
  - React then fetches data and creates the DOM in the browser.
  - Opposite: server-side rendering (SSR), where the server sends ready-made HTML.
- **Single-page application (SPA):** An architecture with one HTML document that is loaded once.
  - Navigation does not reload the page, JavaScript swaps the visible views.
  - Application state survives navigation.
- **Client-side routing:** Mapping the URL to components in the browser.
  - Uses the History API (`pushState`), so the URL changes without a server request.
  - In this project: React Router (`Routes`, `Route`, `Link`, `useParams`).
- **How they relate:**
  - A SPA usually uses CSR and client-side routing.
  - CSR alone does not make an SPA (a multi-page site can also render each page in the browser).
  - Client-side routing is what makes the "single page" feel like multiple pages.

#### Route parameters vs. query parameters

- **Route parameter** (`/bears/:bearId`):
  - Identifies **which resource** is shown.
  - Required: without it, the route does not match.
  - Part of the path, read with `useParams()`.
  - Here: the stable bear id (slug), e.g. `/bears/polar-bear`.
- **Query parameter** (`?q=polar`):
  - Describes **how** a resource is displayed (view state: search, filter, sort).
  - Optional: a sensible default exists (`params.get('q') ?? ''`).
  - Does not affect which route matches, order does not matter.
  - Read and written with `useSearchParams()`.
- **Rule of thumb:**
  - Page makes no sense without the value → route parameter.
  - Page works with a default → query parameter.

#### SPA architecture: one benefit and one cost

- **Benefit: fast, smooth navigation without reloads.**
  - Switching between list and detail does not reload HTML, CSS or JS.
  - Data is fetched once in `App` and reused, so the detail page needs no extra request.
  - The fetch/abort/stale-request logic runs once instead of on every page.
- **Cost: slower first load and weaker SEO / first paint.**
  - The browser must download and run the JS bundle before anything meaningful appears (hence the loading state).
  - Crawlers and link previews see an empty shell unless SSR or prerendering is added.
  - Related: deep links like `/bears/polar-bear` need a server fallback to `index.html`, otherwise a reload returns a 404.