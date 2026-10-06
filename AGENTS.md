<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Keep launcher shortcut state centralized in `wheel-apps.ts` types plus the launcher’s persisted store so arc, search, and customization stay synchronized.
- Keep orbit and edge shortcuts as separate persisted lists with a shared `WheelApp` schema so both scroll systems remain independently customizable.
- Persist orbit position on each shortcut so picker choices stay in the exact tapped slot while edge shortcuts remain list-ordered.
- Keep Android system actions in the native launch registry, using package-independent intents and returning unsupported on other platforms because no equivalent web destination exists.
