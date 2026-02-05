## Commit Message Pattern

- Always start with the relevant emoji, then the conventional commit prefix:
  - `🚀 feat(scope): short description`
  - `🐛 fix(scope): short description`
  - `🔨 refact(scope): short description`
  - `📚 docs(scope): short description`
  - `✅ test(scope): short description`
  - `🧹 chore(scope): short description`
  - `💅 style(scope): short description`
  - `⚡ perf(scope): short description`
  - `🤖 ci(scope): short description`
- Use imperative mood: "Add feature" not "Added feature".
- Keep the subject line under 50 characters.
- Include scope in parentheses when relevant (e.g., `feat(api): ...`).
- For additional details, use a well-structured body section.
- Use bullet points (\*) for clarity in the body.
- Example:
  - `🚀 feat(auth): add user login`
  - `🐛 fix(api): correct password validation`
  - `🔨 refact(core): simplify auth logic`
  - Body (optional):
    ```
    * Explain what changed
    * List impacts or breaking changes
    ```

## Additional Instructions

- Follow this commit pattern for all changes.
- Do not use long or vague commit messages.
- If unsure, prefer searching for the correct prefix and emoji.
