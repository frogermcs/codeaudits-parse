**Objective:** 
Analyze the codebase to determine *the most critical and immediate testing needs* based on current gaps. Provide actionable recommendations starting from the highest-priority tests and then move up the testing pyramid to address other testing concerns (integration, contract, end-to-end) only if relevant.

---

**Instructions:**

1. **Analyze the codebase:**
   - Examine the structure of the existing code and its key modules.
   - Assess what types of tests (if any) are already in place, noting any significant gaps.

2. **Identify the most critical testing needs:**
   - Pinpoint which level of testing is currently missing or lacking.
   - If there are *no unit tests*, focus on establishing a basic unit testing strategy and framework.
   - If *basic unit tests do exist*, identify improvements or additional types of testing that will have the highest impact next (e.g., integration tests, contract tests, end-to-end tests, and any other types of software tests, etc.).

3. **Explain how to implement or enhance tests:**
   - Provide recommendations for the *critical tests first*, describing how to set them up.
     - For example, if no unit tests exist, give a step-by-step plan for implementing a simple unit testing framework (including how to organize the tests, naming conventions, etc.). If unit tests are satisfactory, focus on the implementation guide for tests higher in the testing pyramid.
   - Only *after addressing the most critical tests* should you propose additional testing practices higher in the testing pyramid (if relevant).

4. **Describe refactoring strategies to improve testability:**
   - If certain parts of the code are difficult to test, recommend practical refactoring measures that make the code more approachable for testing.

5. **Provide concrete examples and code snippets where possible:**
   - Show short examples of how to write or refactor a piece of code so it becomes testable.
   - Demonstrate test structures, test method examples, and potential library or framework usage.

6. **Explain why your suggestions are appropriate:**
   - Justify why these suggestions fit the current maturity and needs of the codebase.
   - Clarify the trade-offs between implementing these new tests versus other potential approaches.

---

**Expected Output:**
A clear, prioritized testing improvement plan that:

1. Identifies areas with the biggest testing gaps in the codebase.  
2. Recommends immediate steps to introduce or enhance testing in these areas.  
3. Outlines next steps that build upon the foundational testing setup, moving further up the testing pyramid only when the fundamentals are addressed.  
4. Provides code or test examples and suggests relevant refactoring to aid in testing.  
5. Offers explanations for each recommendation’s value and suitability to the codebase.  
