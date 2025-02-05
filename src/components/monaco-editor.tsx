import { useRef, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { useSocket } from '@/providers/socketProvider';
import { ACTIONS } from '@/lib/actions';
import type { editor } from 'monaco-editor';

interface MonacoEditorProps {
  roomId: string;
  language?: string;
  theme?: string;
  fontSize?: number;
  value?: string;
  onChange?: (value: string) => void;
}

// One Dark Pro theme definition with proper types
const oneDarkPro: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', foreground: 'abb2bf' },
    { token: 'variable', foreground: 'e06c75' },
    { token: 'variable.predefined', foreground: 'e06c75' },
    { token: 'variable.parameter', foreground: 'abb2bf' },
    { token: 'keyword', foreground: 'c678dd' },
    { token: 'keyword.control', foreground: 'c678dd' },
    { token: 'keyword.operator', foreground: 'c678dd' },
    { token: 'storage', foreground: 'c678dd' },
    { token: 'storage.type', foreground: 'c678dd' },
    { token: 'constant', foreground: 'd19a66' },
    { token: 'constant.numeric', foreground: 'd19a66' },
    { token: 'constant.character', foreground: 'd19a66' },
    { token: 'constant.language', foreground: 'd19a66' },
    { token: 'support', foreground: '61afef' },
    { token: 'support.function', foreground: '61afef' },
    { token: 'support.constant', foreground: 'd19a66' },
    { token: 'support.type', foreground: '56b6c2' },
    { token: 'support.class', foreground: 'e5c07b' },
    { token: 'string', foreground: '98c379' },
    { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
    { token: 'function', foreground: '61afef' },
    { token: 'function.declaration', foreground: '61afef' },
    { token: 'entity.name.type', foreground: 'e5c07b' },
    { token: 'entity.name.class', foreground: 'e5c07b' },
    { token: 'entity.name.function', foreground: '61afef' },
    { token: 'punctuation.definition.string', foreground: '98c379' },
    { token: 'punctuation.definition.variable', foreground: 'e06c75' },
    { token: 'punctuation.definition.string.begin', foreground: '98c379' },
    { token: 'punctuation.definition.string.end', foreground: '98c379' },
    { token: 'punctuation.definition.parameters', foreground: 'abb2bf' },
    { token: 'punctuation.definition.heading', foreground: '61afef' },
    { token: 'punctuation.definition.identity', foreground: '61afef' },
    { token: 'meta.brace', foreground: 'abb2bf' },
    { token: 'meta.delimiter.period', foreground: 'abb2bf' },
    { token: 'meta.selector', foreground: '98c379' },
    { token: 'invalid', foreground: 'ffffff', background: 'e05252' }
  ],
  colors: {
    'editor.background': '#282c34',
    'editor.foreground': '#abb2bf',
    'editor.lineHighlightBackground': '#2c313c',
    'editor.selectionBackground': '#3e4451',
    'editor.findMatchBackground': '#42557b',
    'editor.findMatchHighlightBackground': '#314365',
    'editorCursor.foreground': '#528bff',
    'editorWhitespace.foreground': '#3b4048',
    'editorIndentGuide.background': '#3b4048',
    'editorIndentGuide.activeBackground': '#c8c8c859',
    'editor.selectionHighlightBorder': '#222218',
    'editorLineNumber.foreground': '#495162',
    'editorLineNumber.activeForeground': '#abb2bf',
    'editorBracketMatch.background': '#515a6b',
    'editorBracketMatch.border': '#515a6b',
    'tab.activeBackground': '#282c34',
    'tab.inactiveBackground': '#21252b',
    'tab.border': '#181a1f',
    'tab.activeBorder': '#528bff'
  }
};

const MonacoEditor = ({ 
  roomId, 
  language = 'javascript',
  fontSize = 14,
  value,
  onChange 
}: MonacoEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const { socket } = useSocket();
  const searchParams = new URLSearchParams(window.location.search);
  const currentUsername = searchParams.get('username');

  // Define Monaco theme before editor mounts
  useEffect(() => {
    const defineTheme = async () => {
      const monaco = await loader.init();
      monaco.editor.defineTheme('onedarkpro', oneDarkPro);
    };
    defineTheme();
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    if (!value || !currentUsername) return;
    
    // Emit code change
    socket?.emit(ACTIONS.CODE_CHANGE, {
      roomId,
      code: value,
    });

    // Emit typing event with username
    socket?.emit(ACTIONS.TYPING, {
      roomId,
      username: currentUsername
    });
    
    onChange?.(value);
  };

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    editorRef.current = editor;
    monaco.editor.setTheme('onedarkpro');
  };

  const options: editor.IStandaloneEditorConstructionOptions = {
    fontSize,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    formatOnPaste: true,
    formatOnType: true,
    fontFamily: 'JetBrains Mono, monospace',
    fontLigatures: true,
    cursorBlinking: 'smooth',
    smoothScrolling: true,
    cursorSmoothCaretAnimation: 'on',
    renderLineHighlight: 'all',
    contextmenu: true,
    mouseWheelZoom: true,
    lineNumbers: 'on',
    // renderIndentGuides: true,
    automaticLayout: true,
    padding: { top: 16, bottom: 16 }
  };

  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      language={language}
      theme="onedarkpro"
      value={value}
      options={options}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      className="w-full h-full min-h-[300px] border border-gray-700 rounded-lg overflow-hidden"
    />
  );
};

export default MonacoEditor;