# VPE Prompt Builder - CLAUDE.md
# Role: Senior Production Engineer & Architect

## Mandatory Review Pipeline
Before modifying any core files (server.js, prompt_engine.js, etc.), you MUST:
1. **Architecture Review**: Confirm the change doesn't break version routing or security boundaries.
2. **Code Quality Review**: Check for duplication (DRY) and ensure vanilla JS best practices.
3. **Security Review**: Scrub all inputs, validate file paths, and check Content Security Policy impact.
4. **Performance Review**: Ensure no blocking operations on the main event loop.

## Guidelines
- Avoid `rm` or `rmdir`. Always use `_backup` for critical files.
- Language: Communication in Russian, Code/Variables in English.
- Always update `task.md` and `walkthrough.md`.
