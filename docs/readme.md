---
home: true
heroImage: https://image.ibb.co/e4Nce6/redux_box.png
heroText: Redux Box
tagline: A modular, batteries-included container for Redux + Redux-Saga applications.
actions:
  - text: Get Started →
    link: /getting-started.html
    type: primary
  - text: Core Concepts
    link: /core-concepts.html
    type: secondary
  - text: GitHub
    link: https://github.com/anish000kumar/redux-box
    type: secondary
features:
  - title: Modular by design
    details: Organize your store as a collection of independent modules — each bundling its own state, mutations, sagas, and selectors. Drop them into any Redux app and they just work.
  - title: Less boilerplate
    details: No more juggling action types, action creators, and reducers across files. Define a module once, in one place, and you're done.
  - title: Mutate without mutating
    details: Powered by Immer, write reducers as if you were directly mutating state — and get true immutability under the hood.
  - title: Sagas, built in
    details: Redux-Saga is wired up for you. Just declare your effects inside a module and let redux-box handle the rest.
  - title: Works everywhere
    details: One container, any frontend — drop redux-box into React, React Native, or any JS app that speaks Redux.
  - title: Familiar Redux
    details: No new bizarre terms or magic. Underneath it's still plain Redux, so your devtools, middleware, and ecosystem all keep working.
footer: MIT Licensed | Copyright © Anish Kumar
---

## Quick start

Install redux-box:

```bash
yarn add redux-box
```

Wire up your store from a few independent modules:

```js
import { createStore } from 'redux-box';
import { module as userModule } from './user';
import { module as postModule } from './post';

export default createStore([userModule, postModule]);
```

Head over to the [Getting Started guide](/getting-started.html) for a full walkthrough.
