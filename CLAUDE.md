# Development Standards

## Code Documentation

Every file MUST include a header comment:
```typescript
/**
 * @file ComponentName.tsx
 * @description Brief description of what this does
 * @related-prd tasks/prd-xyz.md#US-X.X
 * @author Ralph (AI Agent)
 * @created 2026-01-23
 */
```

## Component README

Each component folder should have a README.md explaining:
- Purpose
- Related PRD/Issues
- Dependencies
- Usage example

## Acceptance Criteria

Use Given/When/Then format:
- Given [precondition]
- When [action]
- Then [expected result with specific values]
