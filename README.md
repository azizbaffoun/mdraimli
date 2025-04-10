# React Workflow Editor

A React-based workflow editor that allows users to create visual workflows using different node types. Built with React, React Flow, and React DnD, this project creates a standalone workflow editor component that can be integrated into any JavaScript/jQuery application.

## Technologies Used

- **React** - v18.2.0 (Main JavaScript library for building the UI)
- **React Flow** - v11.11.4 (Library for building node-based workflows and diagrams)
- **React DnD** - v16.0.1 (Library for drag and drop functionality)
- **Tailwind CSS** - v3.4.1 (Utility-first CSS framework)
- **Vite** - v5.1.6 (Modern build tool and development server)
- **TypeScript** - For type-safe code
- **Hero Icons** - v2.2.0 (SVG icon library by Tailwind CSS team)

## Project Structure

### Core Files

- `src/main.tsx` - The entry point for the application. Exports the `DynamicWorkflowPage` component and a `render` function for external use. This file is critical for the library build process.

- `src/index.css` - Contains all global styling including Tailwind CSS utility classes needed for the application.

- `src/WorkflowEditor.tsx` - The main component that renders the workflow editor. Contains all the logic for:
  - Rendering the flow diagram
  - Adding/connecting nodes
  - Managing node connections
  - Drag and drop functionality
  - Layout organization
  - Custom edge rendering

- `src/DynamicWorkflowPage.tsx` - Combines the landing page and workflow editor into a single component. Handles the transitions between initial landing view and actual editor.

### Component Files

- `src/components/StartButton.tsx` - Renders the main start button with dropdown menu for selecting the workflow type. Used in the landing page view.

### Asset Files
a
- `src/assets/` - Contains all SVG assets used in the application, organized into:
  - `nodes/` - SVG images for the different node types
  - `icons/` - Icons used throughout the application
  - `component to link the nodes/` - SVG connectors for node connections

### Type Definitions

- `src/vite-env.d.ts` - TypeScript declaration file with environment type definitions.

## Build Output

When built, this project creates:

1. `dist/my-react-app.umd.js` - The JavaScript bundle (UMD format)
2. `dist/style.css` - The CSS styles

These two files can be integrated into any JavaScript/jQuery application.

## Integration Instructions

To integrate the workflow editor into a JavaScript/jQuery project:

1. Include the React dependencies:
```html
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
```

2. Include the built files:
```html
<link href="./path-to/style.css" rel="stylesheet">
<script src="./path-to/my-react-app.umd.js"></script>
```

3. Create a container element:
```html
<div id="react-app-container"></div>
```

4. Initialize the component:
```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('react-app-container');
    if (MyReactApp && container) {
      MyReactApp.render(container);
    }
  });
</script>
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```



## License

MIT
