# components/assistant/

React components for the Emlakie AI Leasing Assistant UI.

## Phase 1A status

No components exist yet. This folder is created to establish structure.
The feature flag `ENABLE_AI_ASSISTANT` must be `true` before any component
in this folder renders anything visible to users.

## What will live here (Phase 1B+)

```
components/assistant/
├── AssistantButton.tsx       # Activation button ("Talk to a leasing assistant")
├── AssistantPanel.tsx        # Main panel: state display + transcript (ephemeral)
├── AssistantStateIndicator.tsx  # Listening / thinking / speaking visual states
├── ListingRecommendationCard.tsx # Recommendation card shown during conversation
└── README.md
```

## Rules for all components in this folder

1. Every component must check `ASSISTANT_ENABLED` before rendering.
   Return `null` when disabled — no empty DOM nodes.
2. No component may log or display transcript text after session end.
3. RTL text direction must be applied to the panel when `detectedLanguage`
   is `fa` or `ar`.
4. All components must meet WCAG 2.1 AA (minimum 44×44px touch targets,
   `role="status"` for state changes, `aria-live` for assistant speech).
