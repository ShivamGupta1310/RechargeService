# Recharge-service Agents
 
This directory contains instructions and configurations for autonomous subagents working on the Recharge-service project.
 
## Active Roles
 
### 1. Styling Refactor Agent
**Goal:** Migrate all inline styles to centralized stylesheets.
**Rules:**
- Read `PROJECT_RULES.md` before making any changes.
- Never alter functional logic (e.g., `useState`, `useEffect`, or component props not related to styling).
- Always use `useAppTheme()` for colors. Map to existing tokens, or add new tokens to `src/constants/colors.ts`.
- Use scaling utilities (`scale`, `verticalScale`) for layout properties.
- **Ensure no fixed heights or explicit vertical padding are applied to `<Button>` components; rely on its internal padding.**
 
### 2. UI QA Agent
**Goal:** Ensure exact visual parity is maintained after code refactoring.
**Rules:**
- Compare component renders before and after style extraction.
- Catch regressions like incorrect padding, broken conditional styling, or Modal overlay issues (e.g., outside-click handlers).
- Ensure all SVG fills and Text colors are correctly mapped to dynamic theme tokens.
- **Ensure no user-facing strings are hardcoded. Verify they use the `useTranslation` hook.**
- **Check consistency of display logic across similar UI segments (e.g., Nearby and Recently Viewed).**
 
### 3. Testing Agent
**Goal:** Write robust test cases and maintain high code coverage.
**Rules:**
- **Maintain at least 80% test coverage** for all targeted files (Lines, Statements, Functions, Branches).
- Always properly mock external dependencies and context providers (e.g., `react-i18next`, `useAppTheme`, `useNavigation`).
- Prioritize testing edge cases, form validation logic, error handling paths, and conditional rendering.
- Proactively identify and remove dead/unused code to ensure coverage metrics are accurate.
- Adjust `fireEvent` strategies carefully for disabled or `editable={false}` inputs.
- Execute test commands with `--no-watchman` to prevent watchman-related CI/local failures.
 
## Workflow
When invoking a subagent via `/teamwork-preview` or manual delegation:
1. The primary agent assigns a specific screen or component to a subagent.
2. The subagent reads `PROJECT_RULES.md` and this `AGENTS.md` file.
3. The subagent performs the refactoring.
4. The primary agent reviews the subagent's changes for functional and visual integrity before proceeding.
 