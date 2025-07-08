// Use global React and ReactRouter from CDN
const { BrowserRouter, Routes, Route } = ReactRouterDOM;

function App() {
  return React.createElement(
    BrowserRouter,
    null,
    React.createElement(
      'div',
      { className: 'App' },
      React.createElement(
        Routes,
        null,
        React.createElement(Route, {
          path: '/',
          element: React.createElement(PostureDetection)
        })
      )
    )
  );
}

export default App;