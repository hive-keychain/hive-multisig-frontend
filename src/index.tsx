import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter as Router } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import './index.css';
import { persistor, store } from './redux/app/store';

import {
  applyResolvedThemeToDocument,
  readThemePreference,
  resolveTheme,
} from './utils/theme';

// Apply theme as early as possible (pre-render).
applyResolvedThemeToDocument(resolveTheme(readThemePreference()));
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Router>
        <App />
      </Router>
    </PersistGate>
  </Provider>,
);
