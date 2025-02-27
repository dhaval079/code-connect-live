// 1. First, create a new file to hold language-specific configurations
// File: lib/languageConfig.ts

export interface LanguageConfig {
    name: string;
    extension: string;
    defaultCode: string;
    monacoLanguage: string;
  }
  
  export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
    javascript: {
      name: "JavaScript",
      extension: "js",
      monacoLanguage: "javascript",
      defaultCode: 
  `// JavaScript Example
  function printPyramid(height) {
      let pattern = '';
      
      // Loop through each row
      for (let i = 1; i <= height; i++) {
          // Add spaces before stars
          let spaces = ' '.repeat(height - i);
          
          // Add stars for this row
          let stars = '*'.repeat(2 * i - 1);
          
          // Combine spaces and stars for this row
          pattern += spaces + stars + '\\n';
      }
      
      return pattern;
  }
  console.log(printPyramid(5));`
    },
    python: {
      name: "Python",
      extension: "py",
      monacoLanguage: "python",
      defaultCode: 
  `# Python Example
  def print_pyramid(height):
      pattern = ""
      
      # Loop through each row
      for i in range(1, height + 1):
          # Add spaces before stars
          spaces = " " * (height - i)
          
          # Add stars for this row
          stars = "*" * (2 * i - 1)
          
          # Combine spaces and stars for this row
          pattern += spaces + stars + "\\n"
      
      return pattern
  
  print(print_pyramid(5))`
    },
    java: {
      name: "Java",
      extension: "java",
      monacoLanguage: "java",
      defaultCode: 
  `// Java Example
  public class Main {
      public static void main(String[] args) {
          System.out.println(printPyramid(5));
      }
      
      public static String printPyramid(int height) {
          StringBuilder pattern = new StringBuilder();
          
          // Loop through each row
          for (int i = 1; i <= height; i++) {
              // Add spaces before stars
              for (int j = 0; j < height - i; j++) {
                  pattern.append(" ");
              }
              
              // Add stars for this row
              for (int j = 0; j < 2 * i - 1; j++) {
                  pattern.append("*");
              }
              
              pattern.append("\\n");
          }
          
          return pattern.toString();
      }
  }`
    },
    cpp: {
      name: "C++",
      extension: "cpp",
      monacoLanguage: "cpp",
      defaultCode: 
  `// C++ Example
  #include <iostream>
  #include <string>
  
  std::string printPyramid(int height) {
      std::string pattern = "";
      
      // Loop through each row
      for (int i = 1; i <= height; i++) {
          // Add spaces before stars
          for (int j = 0; j < height - i; j++) {
              pattern += " ";
          }
          
          // Add stars for this row
          for (int j = 0; j < 2 * i - 1; j++) {
              pattern += "*";
          }
          
          pattern += "\\n";
      }
      
      return pattern;
  }
  
  int main() {
      std::cout << printPyramid(5);
      return 0;
  }`
    },
    // Add more languages as needed
  };