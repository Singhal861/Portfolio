# Plan: Mobile Responsiveness and Form Improvements

## Issues to Address
1. **Header Actions Layout**: Buttons (Add Verb, Refresh, Download CSV, Email Data) float randomly on small screens
2. **Verb Manager Form**: Current form looks bad compared to previous version
3. **Modal Responsiveness**: Verb form modal needs mobile-friendly adjustments

## Proposed Changes

### 1. Fix Header Actions Layout (`app/globals.css`)
- Add responsive styles to `.header-actions` container
- On mobile (< 640px): stack buttons vertically with full width
- Keep desktop layout as flex row with wrapping

### 2. Improve Verb Manager Form (`components/verb-manager.tsx` + `app/globals.css`)
- Restore previous form aesthetics with better spacing, typography
- Ensure form fields are properly aligned and readable on mobile
- Add mobile-specific padding and input sizes

### 3. Enhance Modal Responsiveness (`app/globals.css`)
- Adjust modal card width and padding for mobile screens
- Ensure form-actions button layout adapts to smaller screens

### 4. Verify All Interactive Elements Work
- Test that buttons remain accessible and tappable on mobile
- Confirm form validation and submission work correctly

## Verification Steps
- Run `npm run build` to ensure no TypeScript/CSS issues
- Manually test responsiveness at various breakpoints
- Verify all functionality (add/edit/delete verbs, export, email) works on mobile