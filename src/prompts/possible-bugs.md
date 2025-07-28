**Objective:** Analyze the codebase and identify possible bugs that may happen now or when extending this code. 

**Objective:** Analyze the codebase and identify steps required for refactoring the code into suggested architectural pattern to improve code maintainability, extensibility, or testability.

**Instructions:**

1. **Analyze the codebase:**  Examine the existing code structure and codebase to understand the use cases and logic of current application.
2. **Identify most critical issues**: based on your analysis, identify what could be potential errors in categories:
	- Logic errors
	- Airhmetic errors
	- Resource errors
	- Time limits errors
	- Concurrency errors
	- Other types of common errors
3. **Don't replicate static code analysis**: if it's evident that there was no static code analysis applied to the repository, share suggestions about using one. No static code analysis is an issue on your own which shouldn't be fixed by LLM, but dedicated tool. 
4. **Suggest specific implementation steps:** Based on your analysis, recommend suitable solutions to help with bug fixing and future proofing process. For each suggestion:
    - **Describe how the solution should be implemented:** Include specific details about which classes or modules should be created or modified.
    - **Illustrate with code examples (if possible):** Show how the code could be refactored using the suggested pattern.
    - **Illustrate with test examples (if possible):** Show how the code could be tested.
    - **Explain why the solution is a good fit for the specific situation.**

**Expected Output:** A report or a series of suggestions that:

1. Summarize severity of the identified issues, so it's clear if the code requires immediate fixes or the development can continue without investments in tech debt.
2. Clearly identifies specific areas in the codebase that should be fixed or improved.
5. Provides detailed explanations and ideally code structure and implementation examples to guide the improvements process.