# Pull Request Template

name: Pull Request
description: Submit a pull request for review and merge
title: ""
labels: ["needs-review"]
assignees: []
body:

- type: markdown
  attributes:
  value: | ## Pull Request Guidelines

        Please follow these guidelines when submitting your pull request:

        - **Title Format**: Use conventional commit format: `type(scope): description`
          - Examples: `feat(auth): add login functionality`, `fix(ui): resolve button styling issue`, `docs(readme): update installation instructions`
          - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

        - **Be Descriptive**: Provide clear and detailed explanations of your changes
        - **Include Context**: Explain why the changes were made and their impact
        - **Link Issues**: Reference any related GitHub issues or discussions
        - **Test Thoroughly**: Ensure all tests pass and your changes don't break existing functionality

- type: input
  id: pr-title
  attributes:
  label: Pull Request Title
  description: Enter a brief and descriptive title for this pull request
  placeholder: "feat: add new authentication module"
  validations:
  required: true

- type: textarea
  id: description
  attributes:
  label: Description
  description: Provide a detailed explanation of the changes made, what was changed, why it was changed, and any potential impacts
  placeholder: | ## Summary

        Brief overview of the changes made in this PR.

        ## What was changed

        Detailed description of the specific changes implemented:
        - Change 1
        - Change 2
        - Change 3

        ## Why it was changed

        Explanation of the reasoning behind these changes and the problem they solve.

        ## Potential impacts

        Describe any potential impacts on existing functionality, performance, or user experience.

        ## Related issues/discussions

        Links to any related GitHub issues, discussions, or documentation.

  validations:
  required: true

- type: checkboxes
  id: type-of-change
  attributes:
  label: Type of Change
  description: Select the appropriate type(s) of changes made in this PR
  options: - label: Bug fix (non-breaking change which fixes an issue)
  required: false - label: New feature (non-breaking change which adds functionality)
  required: false - label: Documentation update
  required: false - label: Refactoring
  required: false - label: Performance improvement
  required: false - label: Security fix
  required: false - label: Dependency update
  required: false - label: Other
  required: false

- type: input
  id: other-change-type
  attributes:
  label: Specify Other Change Type
  description: Please specify the type of change if "Other" was selected above
  placeholder: e.g., "API change", "Database migration", "Configuration update"
  validations:
  required: false

- type: checkboxes
  id: checklist
  attributes:
  label: Checklist
  description: Please confirm the following before submitting your PR
  options: - label: I have read the Contributing Guidelines
  required: true - label: My code follows the project's style guidelines
  required: true - label: I have tested my changes thoroughly
  required: true - label: All tests pass (unit tests, integration tests, etc.)
  required: true - label: The command `pnpx nx run-many -t lint:fix test typecheck build --all` passes
  required: true - label: I have updated documentation if necessary
  required: true - label: This PR is ready for review
  required: true - label: I have considered backward compatibility
  required: true

- type: textarea
  id: additional-information
  attributes:
  label: Additional Information
  description: (Optional) Add any additional information that might be helpful for reviewers
  placeholder: | ## Screenshots/Videos

        Add screenshots or videos to demonstrate your changes:
        ![Screenshot description](link-to-screenshot)

        ## Code Snippets

        ```javascript
        // Add relevant code snippets if needed
        ```

        ## Breaking Changes

        If this PR contains breaking changes, please describe them here:

        ## Dependencies

        List any new dependencies or updated dependencies:

        ## Testing Environment

        - OS: [e.g., Windows 11, macOS 14, Ubuntu 22.04]
        - Node.js: [e.g., v18.17.0]
        - Browser: [e.g., Chrome 120, Firefox 119]

        ## Additional Notes

        Any other information that should be considered during review...
