import "bootstrap/dist/css/bootstrap.min.css";
import {BrowserRouter as Router} from 'react-router-dom';
import {Provider} from 'react-redux'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import store from './redux/app/store'
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Provider store = {store}>
    <Router>
      <App />
    </Router>   
  </Provider>
);
