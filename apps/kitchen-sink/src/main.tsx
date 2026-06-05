import React from 'react';
import ReactDOM from 'react-dom/client';

// The published library stylesheet: CSS reset (default element styles), the
// semantic `--ui-*` design tokens (from @acronis-platform/tokens-pd, with
// `light-dark()` driven by `color-scheme`), and the component utilities.
// Per-component token CSS (`--ui-button-*`, …) is loaded in `@/lib/tokens`.
import '@acronis-platform/ui-react/styles';

import App from '@/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
