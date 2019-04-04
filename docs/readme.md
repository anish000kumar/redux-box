---
sidebar: false
---

<style>
  .top-container {
    display: flex;
    justify-content: center;
    align-items: center
  }

  .btn {
    border: none;
    padding: 10px 20px;
    text-decoration: none !important;
    font-size: 17px;
    border-radius: 5px;
    margin-right: 10px;
    cursor: pointer;
    background: #3eaf7c;
    color: #fff;
    border: 1px solid #3eaf7c;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .btn img {
    width: 20px;
    margin-right: 10px;
    opacity: 0.5;
  }

  .btn:hover {
    border: 1px solid gray;
    text-decoration: none;
  }

  .btn-container {
    display: flex;
  }

  .header {
    font-weight: lighter;
    font-size: 50px;
  }

  .bottom-container {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #eee;
  }

  .bottom-container .col {
    text-align: center;
    flex: 1;
  }

  .col h1 {
    font-size: 35px;
    font-weight: 200;
  }

  .col:first-of-type {
    margin-right: 20px;
  }
</style>

<div class="container">
  <div class="top-container">
    <div>
      <img style="max-width:700px" src="https://image.ibb.co/e4Nce6/redux_box.png" alt="redux_box" border="0">
    </div>
    <div>
      <h1 class="header"> A Redux Container</h1>
      <div class="btn-container">
        <a class="btn" href="/why.html">
          <img src="https://image.flaticon.com/icons/png/512/104/104110.png" alt="">
          Docs
        </a>
        <a class="btn" target="_blank" href="https://github.com/anish000kumar/redux-box">
          <img src="https://image.flaticon.com/icons/svg/25/25231.svg" alt="">
          Github </a>
      </div>
    </div>
  </div>
  <div class="bottom-container">
    <div class="col">
      <h1> Quick to setup </h1>
      ```javascript
            import { createStore } from "redux-box";
            import { module as userModule } from "./user";
            import { module as postModule } from "./post";
            export default createStore([userModule, postModule]);
      ```
    </div>
    <div class="col">
      <h1 class="header">Readable</h1>
      <p> Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat illum nobis tenetur rem repudiandae sit
        reprehenderit unde consequuntur, deleniti ducimus delectus, odio exercitationem dolorum doloremque a, vitae
        soluta quo dolores. </p>
    </div>
    <div class="col">
      <h1 class="header">Modular</h1>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat illum nobis tenetur rem repudiandae sit
        reprehenderit unde consequuntur, deleniti ducimus delectus, odio exercitationem dolorum doloremque a, vitae
        soluta quo dolores.</p>
    </div>
  </div>
</div>