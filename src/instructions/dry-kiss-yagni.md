**Objective**  
Analyze the codebase to uncover common issues regarding duplication, complexity, and premature or unnecessary features. Provide concise recommendations for remediation.

## Instructions

1. **DRY (Don’t Repeat Yourself)**
   - Identify duplicated or near-duplicated logic (e.g., repeated blocks of code, patterns, functions).  
   - Recommend where shared functionality should be extracted into common modules, helper functions, or libraries.

2. **KISS (Keep It Simple, Stupid)**
   - Pinpoint sections of code that are overly complex or hard to follow (e.g., deeply nested conditionals, large classes or methods).  
   - Suggest straightforward refactors that simplify logic (e.g., splitting large methods, reducing nested loops).

3. **YAGNI (You Ain’t Gonna Need It)**
   - Locate code that appears to address future or speculative requirements.  
   - Propose removal or postponement of unneeded logic, emphasizing just-in-time development.

## Expected Output

1. **List of Duplications and Complexities**  
   - Summarize specific areas or lines where each violation occurs.

2. **Refactoring Suggestions**  
   - For each identified issue, suggest the minimal, most direct fix or improvement.  
   - Provide short code examples where possible, illustrating the before/after of the recommended changes.

3. **Explanation of Value**  
   - Outline how these changes will reduce maintenance burden, improve readability, and simplify testing.

4. **Action Steps**  
   - Highlight any required file or module moves, code removals, and reorganizations needed to make the adjustments.