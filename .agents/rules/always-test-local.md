# Always Test Local Rule

## Context
When generating code or deploying updates to build outputs (e.g., GitHub Pages on `gh-pages`), changes must be verified locally beforehand.

## Rule
Before running any production build or deploying to public environments:
1. Start the local development server (e.g., `npm run dev`).
2. Run a browser subagent to interactively load and test the pages locally.
3. Fix any closure issues, styling errors, console errors, or network issues discovered during the local verification phase.
4. Only commit and push to remote deploy environments after confirming the local test is successful.
