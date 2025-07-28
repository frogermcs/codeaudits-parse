**Objective:**  
Analyze the codebase for adherence to the SOLID principles and recommend refactoring strategies where violations are detected.

## Instructions

1. **Single Responsibility Principle (SRP)**
   - Identify classes/modules that handle more than one concern or responsibility.  
   - Provide specific files or line references (if possible).  
   - Explain how to refactor them into smaller, focused classes or functions.

2. **Open/Closed Principle (OCP)**
   - Identify areas that require modification for every new feature or condition, rather than extension.  
   - Suggest how to introduce abstractions or design patterns (e.g., Strategy, Factory) to adhere to OCP.

3. **Liskov Substitution Principle (LSP)**
   - Detect subclasses that break the contract of their parent classes or use type checks.  
   - Propose solutions for restructuring inheritance or using composition.

4. **Interface Segregation Principle (ISP)**
   - Find large “kitchen-sink” interfaces that force implementations to define methods they do not need.  
   - Suggest how to split them into smaller, role-specific interfaces.

5. **Dependency Inversion Principle (DIP)**
   - Look for high-level modules that depend on concrete implementations instead of abstractions.  
   - Identify classes that are directly instantiated where interfaces or factories would be more appropriate.  
   - Provide suggestions for using interfaces, factories, or IoC containers.

## Expected Output

1. **List of Violations by Principle**  
   Summarize each area of code that appears to violate or deviate from SOLID standards.

2. **Refactoring Strategies**  
   - Provide specific, actionable steps to address each violation.  
   - Include short code examples illustrating how to introduce or modify classes, interfaces, or design patterns.

3. **Testing Considerations**  
   - Where relevant, explain how these SOLID-driven changes could make the code more testable.  
   - Show examples of how to set up or improve unit tests.

4. **Implementation Details**  
   - If possible, include approximate file paths or module names to guide refactoring.  
   - Highlight any potential impacts on existing dependencies or configurations.