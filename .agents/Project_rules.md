# Recharge-service Project Rules
 
This document outlines the core development and styling conventions for the Smash-IT project. All contributors and AI assistants must adhere strictly to these rules.
 
## 1. Styling Architecture
* **No Inline Styles:** Do NOT use inline style objects (e.g., `style={{ width: 10, color: 'red' }}`) in `.tsx` component files. All styles must be defined using `StyleSheet.create` in a separate `.styles.ts` file or centralized in `src/theme/commonStyles.ts`.
* **No StyleSheet in Components:** The `StyleSheet.create` factory function should never be called inside a `.tsx` file. Components should import styles or a style hook from their companion `.styles.ts` file.
* **Component-Specific Hooks:** When styles need access to the theme (colors, spacing), define them inside a custom hook in the `.styles.ts` file (e.g., `export const useStyles = () => { const { colors, spacing } = useAppTheme(); return useMemo(() => StyleSheet.create({...}), [colors, spacing]); };`) and consume that hook in the `.tsx` file.
 
## 2. Theming and Colors
* **Centralized Theme Hook:** Always retrieve theme variables using `const { colors, spacing } = useAppTheme();`. Do NOT import static `colors` or `spacing` constants directly from `@src/constants/colors` or `@src/constants/spacing`.
* **No Hardcoded Colors:** Never use raw hex values (e.g., `#FFFFFF`), named colors (e.g., `'red'`, `'white'`), or inline `rgba()` strings in your styles or component props.
* **Semantic Tokens:** Every color must map to a semantic token in `theme.colors` (e.g., `colors.primary`, `colors.border`, `colors.text`). If a required UI color does not exist in the theme, it must be added as a new semantic token to `src/constants/colors.ts` (and its dark mode equivalent) rather than hardcoded.
 
## 3. Layout and Responsiveness
* **Scaling Utilities:** Always wrap hardcoded numeric layout values (margins, paddings, widths, heights, border radii) with the scaling utilities from `@utils/scaling`.
  * Use `scale(value)` for widths, horizontal padding/margins, and border radii.
  * Use `verticalScale(value)` for heights and vertical padding/margins.
 
## 4. Conditional and Dynamic Styling
* **Array-Based Styles:** Handle conditional states by passing an array of stylesheet references (e.g., `style={[styles.defaultContainer, isActive && styles.activeContainer]}`). Do not revert to inline styles to handle dynamic states.
* **Complex Dynamic Styles:** For styles that require numeric calculations (e.g., dynamic sizing based on a prop), extract the logic into a helper function inside the `.styles.ts` file (e.g., `export const getIconStyle = (size) => ({ width: scale(size) });`) and call it from the `.tsx` file.
 
## 5. UI and Functionality Integrity
* **Preserve Functionality:** Refactoring (like style extraction) must NEVER change the underlying functional logic or state management of a component.
* **Preserve Visual UI:** Refactoring must NEVER alter the visual appearance of the UI. Ensure exact visual parity is maintained when mapping hardcoded styles to theme tokens.
* **Legacy Code:** Do not attempt to update, format, or fix code that is commented out. Leave it exactly as is.
 
## 6. Specific Component Rules
* **Buttons:** Do not apply fixed `height` or `paddingVertical` to `<Button>` components via external stylesheets or inline styles. The `<Button>` component handles its own sizing internally; let it fall back to its standard styling.
* **Modals:** Ensure all `Modal` components handle outside clicks gracefully, typically by wrapping the overlay content in a `TouchableWithoutFeedback` that dismisses the modal. Do not add explicit close icons to modals unless specifically requested by the design.
 
## 7. Localization
* **No Hardcoded Strings:** User-facing strings must never be hardcoded in UI components. Always add new strings to `src/i18n/en.json` and retrieve them using the `useTranslation()` hook (e.g., `{t('someKey')}`).
 
## 8. Logic Consistency
* **Shared UI Patterns:** When updating display logic for shared UI patterns (like sports badges or segment rendering), ensure the logic is uniformly applied across all similar components (e.g., `NearbySegment` and `RecentlyViewedSegment`).