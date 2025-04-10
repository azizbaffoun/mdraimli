# React Component Integration Guide

This guide explains how to build this React project into standalone JS and CSS files that can be integrated into legacy jQuery/JavaScript projects.

## Building the React Component

1. Make sure you have Node.js installed (v16 or newer)

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. After building, the following files will be generated in the `dist` folder:
   - `my-react-app.umd.js` - The JavaScript bundle
   - `my-react-app.css` - The styles

## Integrating into a jQuery/JavaScript Project

1. Copy the built files:
   - `dist/my-react-app.umd.js`
   - `dist/my-react-app.css`

2. Include these files in your HTML:
   ```html
   <!-- React Dependencies -->
   <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
   <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
   
   <!-- Our built React component -->
   <link href="./path-to/my-react-app.css" rel="stylesheet">
   <script src="./path-to/my-react-app.umd.js"></script>
   ```

3. Create a container element in your HTML:
   ```html
   <div id="react-component-container"></div>
   ```

4. Initialize the React component:
   ```javascript
   // Can be placed in your existing jQuery/JS code
   $(document).ready(function() {
     const reactContainer = document.getElementById('react-component-container');
     
     // Render the React component in the container
     if (MyReactApp && reactContainer) {
       MyReactApp.render(reactContainer);
     }
   });
   ```

## Example

See `integration-example.html` for a complete working example of the integration.

## Customization

If you need to modify how the component is exported or bundled:

1. Edit the `vite.config.ts` file to adjust:
   - The output filename
   - The library name
   - The output formats

2. Modify `src/main.tsx` to ensure the component is properly exported.

## Troubleshooting

- If you see errors about missing React, ensure you've included the React and ReactDOM UMD builds
- If the styles are not applied, check that the CSS file path is correct
- If the component doesn't render, check the browser console for errors 