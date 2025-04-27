# Project Summary: React Workflow Editor

## Overview
This project is a modern, highly interactive workflow editor built with React, React Flow, and TypeScript. It enables users to visually create, edit, and manage workflows using a node-based diagram interface. The editor is designed for integration into both modern React apps and legacy JavaScript/jQuery projects.

---

## Main Features
- **Visual Workflow Creation:** Users can add, connect, and organize various node types (Article, Podcast, Social Media, Topical Keyword, Note, Video, Start).
- **Intuitive Drag-and-Drop:** Built with React Flow and React DnD for smooth, responsive drag-and-drop node placement and connection.
- **Custom Node Types:** Each node (e.g., Article, Podcast, Video, Note) has custom UI and logic, including context menus, toolbars, and editable content.
- **Toolbar & Menus:** Contextual toolbars and menus for formatting, node actions, and workflow management.
- **Custom Edges:** Unique edge rendering for visually distinct connections between nodes.
- **Responsive, Accessible UI:** Uses Tailwind CSS for responsive design and ensures accessibility (a11y) best practices.
- **Dark Mode Support:** Integrates with Expo's useColorScheme for theme switching.
- **Animations & Gestures:** Smooth node animations and support for gestures via react-native-reanimated and react-native-gesture-handler.
- **TypeScript Strict Mode:** All code is type-safe, using interfaces and strict TypeScript settings.
- **Integration Ready:** The build process outputs standalone JS and CSS bundles for embedding in other projects, including legacy jQuery/JavaScript apps.

---

## Technologies Used
- **React 18** (UI framework)
- **React Flow** (node-based workflow diagrams)
- **React DnD** (drag-and-drop)
- **Tailwind CSS** (utility-first styling)
- **TypeScript** (strict type safety)
- **Vite** (build tool)
- **Hero Icons** (SVG icons)
- **Expo** (for color scheme and mobile best practices)
- **react-native-reanimated, react-native-gesture-handler** (animations/gestures)

---

## Project Structure
- `src/main.tsx` – Entry point, exports the main component and render function for integration.
- `src/WorkflowEditor.tsx` – Core workflow editor logic and UI.
- `src/DynamicWorkflowPage.tsx` – Combines landing and editor views.
- `src/components/` – All reusable UI components (nodes, toolbars, menus, edges, etc.).
- `src/assets/` – SVG assets for nodes and icons.
- `src/index.css` – Global and Tailwind styles.
- `src/types/` – TypeScript type definitions.
- `src/config/` – Node connector configurations.
- `dist/` – Output directory for built JS and CSS bundles.

---

## Key Workflows & UX
- **Start Menu:** Landing page with a start button and workflow type selector.
- **Node Management:** Add, edit, connect, and delete nodes with context menus and drag-and-drop.
- **Custom Menus:** Node-specific menus (e.g., Note editing, Content type selection).
- **Toolbar:** Formatting and workflow actions (undo, redo, save, organize, etc.).
- **Info Panel:** Displays workflow information and guidance.
- **Accessibility:** ARIA roles, keyboard navigation, and high-contrast support.

---

## Integration Guide
- Build the project with `npm run build`.
- Use the output JS and CSS from `dist/` in any HTML page.
- Example integration code is provided in `INTEGRATION.md` and `integration-example.html`.

---

## Technical & Design Decisions
- **Functional, Modular Code:** All components are functional, modular, and follow strict TypeScript and ESLint rules.
- **Declarative Patterns:** JSX is used declaratively; logic is separated into helpers and hooks.
- **Consistent Naming & Structure:** Follows clear naming conventions and file organization for maintainability.
- **Performance:** Efficient state management, minimal re-renders, and optimized bundle size.
- **Security:** Input validation, error handling, and safe integration patterns.

---

## How to Use/Demo
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Build for production: `npm run build`
4. Integrate the output in any project as described above.

---

## Summary
This project delivers a robust, modern workflow editor with a focus on usability, accessibility, and easy integration. All code is written in strict TypeScript, styled with Tailwind, and built for both modern and legacy environments. The result is a flexible, maintainable tool for visual workflow management.

---

*Generated on: 2025-04-26*
