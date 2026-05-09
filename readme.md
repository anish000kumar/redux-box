<p align="center">
  <img src="https://image.ibb.co/e4Nce6/redux_box.png" alt="Redux Box" width="640" />
</p>

<h1 align="center">Redux Box</h1>

<p align="center">
  A modular, batteries-included container for Redux + Redux-Saga applications.
  <br/>
  Less boilerplate. Cleaner reducers. Sagas already wired up.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/redux-box"><img src="https://img.shields.io/npm/v/redux-box.svg" alt="npm version"/></a>
  <a href="https://github.com/anish000kumar/redux-box/blob/master/LICENSE"><img src="https://img.shields.io/github/license/anish000kumar/redux-box" alt="license"/></a>
  <img src="https://img.shields.io/github/last-commit/anish000kumar/redux-box" alt="last commit"/>
</p>

<p align="center">
  <a href="https://anish000kumar.github.io/redux-box/">
    <img src="https://img.shields.io/badge/%F0%9F%93%96%20Read%20the%20Docs-3eaf7c?style=for-the-badge&logoColor=white" alt="Read the Docs" height="48"/>
  </a>
</p>

<p align="center">
  <strong>👉 <a href="https://anish000kumar.github.io/redux-box/">anish000kumar.github.io/redux-box</a></strong>
</p>

---

## Install

```bash
npm install redux-box
# or
yarn add redux-box
```

## A taste

```js
// store/counter.js
import { createModule } from 'redux-box';

export default createModule({
  state: { count: 0 },
  mutations: {
    INCREMENT: state => { state.count += 1; },
  },
});

// store/index.js
import { createStore } from 'redux-box';
import counter from './counter';

export default createStore({ counter });
```

That's a complete Redux store. Mutations look mutable but are made
immutable under the hood by [Immer](https://github.com/immerjs/immer);
sagas, devtools, and middleware are wired up for you.

➡️ Head over to the **[full documentation](https://anish000kumar.github.io/redux-box/)**
for the guide, examples, recipes, and API reference.

## License

[MIT](LICENSE) © Anish Kumar
