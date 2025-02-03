// src/lib/editor-types.ts
import { Socket } from "socket.io-client";
// import { ACTIONS } from "./socket";

export interface EditorProps {
  socketRef: React.MutableRefObject<Socket | null>;
  roomId: string;
  onCodeChange: (code: string) => void;
}

export interface EditorConfig {
  mode: {
    name: string;
    json?: boolean;
  };
  theme: string;
  autoCloseTags: boolean;
  autoCloseBrackets: boolean;
  lineNumbers: boolean;
  lineWrapping?: boolean;
  scrollPastEnd?: boolean;
  autofocus?: boolean;
  tabSize?: number;
  indentUnit?: number;
  smartIndent?: boolean;
}

export interface CodeOutput {
  type: 'success' | 'error';
  content: string;
}

// Editor themes
export const EDITOR_THEMES = {
  DRACULA: 'dracula',
  MONOKAI: 'monokai',
  GITHUB_DARK: 'github-dark',
  NORD: 'nord',
} as const;

// Language modes
export const LANGUAGE_MODES = {
  JAVASCRIPT: 'javascript',
  TYPESCRIPT: 'typescript',
  PYTHON: 'python',
  HTML: 'html',
  CSS: 'css',
} as const;

// Default editor configuration
export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  mode: { name: LANGUAGE_MODES.JAVASCRIPT, json: true },
  theme: EDITOR_THEMES.DRACULA,
  autoCloseTags: true,
  autoCloseBrackets: true,
  lineNumbers: true,
  scrollPastEnd: true,
  autofocus: true,
  tabSize: 2,
  indentUnit: 2,
  smartIndent: true,
  lineWrapping: true,
};

// Default code template
export const DEFAULT_CODE = `// Start coding here
console.log("Hello, CodeConnect!");

// Example function
function greet(name) {
  return \`Welcome to CodeConnect, \${name}!\`;
}`;

// Utility to execute code safely
export const executeCode = (code: string): Promise<CodeOutput> => {
  return new Promise((resolve) => {
    try {
      // Create a new function from the code and execute it
      const fn = new Function('console', `
        let output = [];
        const customConsole = {
          log: (...args) => output.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ')),
          error: (...args) => output.push(\`Error: \${args.join(' ')}\`),
          warn: (...args) => output.push(\`Warning: \${args.join(' ')}\`)
        };
        try {
          ${code}
        } catch (error) {
          customConsole.error(error.message);
        }
        return output.join('\\n');
      `);

      const result = fn(console);
      resolve({ type: 'success', content: result });
    } catch (error) {
      resolve({ 
        type: 'error', 
        content: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  });
};