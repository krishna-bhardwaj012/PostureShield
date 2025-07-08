// Use global React and ReactDOM from CDN
const { StrictMode } = React;
const { createRoot } = ReactDOM;

// Import components
import App from './App.js';

const root = createRoot(document.getElementById('root'));
root.render(
  StrictMode({ children: App() })
);