import { useRef, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { useSocket } from '@/providers/socketProvider';
import { ACTIONS } from '@/lib/actions';

interface MonacoEditorProps {
  roomId: string;
  language?: string;
  theme?: string;
  fontSize?: number;
  value?: string;
  onChange?: (value: string) => void;
}

// One Dark Pro theme definition
const oneDarkProTheme = {
  base: 'vs-dark' as const,
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
    { token: 'invalid', foreground: 'ffffff', background: 'e05252' },
    { token: 'invalid.deprecated', foreground: 'ffffff', background: 'e05252' },
    { token: 'string', foreground: '98c379' },
    { token: 'string.quoted', foreground: '98c379' },
    { token: 'string.regexp', foreground: '98c379' },
    { token: 'string.escape', foreground: '56b6c2' },
    { token: 'string.template', foreground: '98c379' },
    { token: 'punctuation.definition.template-expression', foreground: 'c678dd' },
    { token: 'comment', foreground: '7f848e', fontStyle: 'italic' },
    { token: 'comment.line', foreground: '7f848e', fontStyle: 'italic' },
    { token: 'comment.block', foreground: '7f848e', fontStyle: 'italic' },
    { token: 'tag', foreground: 'e06c75' },
    { token: 'tag.entity', foreground: 'e06c75' },
    { token: 'tag.attribute', foreground: 'd19a66' },
    { token: 'attribute.name', foreground: 'd19a66' },
    { token: 'attribute.value', foreground: '98c379' },
    { token: 'entity.name.function', foreground: '61afef' },
    { token: 'entity.name.type', foreground: 'e5c07b' },
    { token: 'entity.name.tag', foreground: 'e06c75' },
    { token: 'entity.other.attribute-name', foreground: 'd19a66' },
    { token: 'entity.other.inherited-class', foreground: '61afef' },
  ],
  colors: {
    'editor.background': '#282c34',
    'editor.foreground': '#abb2bf',
    'editor.lineHighlightBackground': '#2c313c',
    'editor.selectionBackground': '#3e4451',
    'editor.inactiveSelectionBackground': '#3e4451',
    'editor.findMatchBackground': '#42557b',
    'editor.findMatchHighlightBackground': '#314365',
    'editor.lineHighlightBorder': '#2c313c',
    'editorCursor.foreground': '#528bff',
    'editorWhitespace.foreground': '#3b4048',
    'editorIndentGuide.background': '#3b4048',
    'editorIndentGuide.activeBackground': '#c8c8c8',
    'editorLineNumber.foreground': '#495162',
    'editorLineNumber.activeForeground': '#abb2bf',
    'editorBracketMatch.background': '#515a6b',
    'editorBracketMatch.border': '#515a6b',
    'tab.activeBackground': '#282c34',
    'tab.inactiveBackground': '#21252b',
    'tab.border': '#181a1f',
    'tab.activeBorder': '#528bff',
  }
};

const MonacoEditor = ({ 
  roomId, 
  language = 'javascript',
  theme = 'onedarkpro',
  fontSize = 14,
  value,
  onChange 
}: MonacoEditorProps) => {
  const editorRef = useRef<any>(null);
  const { socket } = useSocket();
  const searchParams = new URLSearchParams(window.location.search);
  const currentUsername = searchParams.get('username');

  // Define Monaco theme before editor mounts
  useEffect(() => {
    const defineTheme = async () => {
      const monaco = await loader.init();
      monaco.editor.defineTheme('onedarkpro', oneDarkProTheme);
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

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monaco.editor.setTheme('onedarkpro');
  };

  const options = {
    fontSize,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    autoClosingBrackets: 'always' as const,
    autoClosingQuotes: 'always' as const,
    formatOnPaste: true,
    formatOnType: true,
    fontFamily: 'JetBrains Mono, monospace',
    fontLigatures: true,
    cursorBlinking: 'smooth' as 'smooth',
    smoothScrolling: true,
    cursorSmoothCaretAnimation: true,
    renderLineHighlight: 'all',
    contextmenu: true,
    mouseWheelZoom: true,
    lineNumbers: 'on' as const,
    renderIndentGuides: true,
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