import React, { useState, useEffect, useCallback } from 'react';
import './Coder.css';
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { StreamLanguage } from "@codemirror/language";
import { java as javaMode } from "@codemirror/legacy-modes/mode/clike";
import { cpp as cppMode } from "@codemirror/legacy-modes/mode/clike";
import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';
import { debounce } from 'lodash';

const Coder = ({ socket, roomid }) => {
  const [code, setCode] = useState('');          // ✅ no default message here
  const [language, setLanguage] = useState('javascript');
  const [isRemoteChange, setIsRemoteChange] = useState(false);

  // Handle incoming updates
  useEffect(() => {
    if (!socket) return;

    const handleCodeUpdate = ({ code: newCode, language: newLanguage }) => {
      setIsRemoteChange(true);
      setCode(newCode ?? "");   // ✅ trust server code
      if (newLanguage && newLanguage !== language) {
        setLanguage(newLanguage);
      }
      setTimeout(() => setIsRemoteChange(false), 100);
    };

    const handleLanguageUpdate = ({ language: newLanguage }) => {
      setIsRemoteChange(true);
      setLanguage(newLanguage);
      setTimeout(() => setIsRemoteChange(false), 100);
    };

    socket.on("code-update", handleCodeUpdate);
    socket.on("language-update", handleLanguageUpdate);

    return () => {
      socket.off("code-update", handleCodeUpdate);
      socket.off("language-update", handleLanguageUpdate);
    };
  }, [socket, language]);

  // Emit code changes (debounced)
  const emitCodeChange = useCallback(
    debounce((newCode, newLanguage) => {
      if (socket && roomid && !isRemoteChange) {
        socket.emit("code-change", { roomid, code: newCode, language: newLanguage });
      }
    }, 300),
    [socket, roomid, isRemoteChange]
  );

  const emitLanguageChange = useCallback(
    debounce((newLanguage) => {
      if (socket && roomid && !isRemoteChange) {
        socket.emit("language-change", { roomid, language: newLanguage });
      }
    }, 300),
    [socket, roomid, isRemoteChange]
  );

  const handleCodeChange = (value) => {
    setCode(value);
    if (!isRemoteChange) {
      emitCodeChange(value, language);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (!isRemoteChange) {
      emitLanguageChange(newLanguage);
    }
  };

  // Theme
  const customTheme = createTheme({
    theme: 'dark',
    settings: {
      background: 'transparent',
      foreground: '#e0e0e0',
      caret: '#6c63ff',
      selection: 'rgba(108, 99, 255, 0.3)',
      selectionMatch: 'rgba(108, 99, 255, 0.2)',
      lineHighlight: 'rgba(108, 99, 255, 0.1)',
      gutterBackground: 'rgba(30, 30, 50, 0.7)',
      gutterForeground: '#888',
    },
    styles: [
      { tag: t.comment, color: '#6272a4', fontStyle: 'italic' },
      { tag: t.variableName, color: '#8be9fd' },
      { tag: [t.string, t.special(t.string)], color: '#f1fa8c' },
      { tag: t.number, color: '#bd93f9' },
      { tag: t.bool, color: '#bd93f9' },
      { tag: t.null, color: '#bd93f9' },
      { tag: t.keyword, color: '#ff79c6' },
      { tag: t.operator, color: '#ff79c6' },
      { tag: t.className, color: '#8be9fd' },
      { tag: t.definition(t.typeName), color: '#8be9fd' },
      { tag: t.typeName, color: '#8be9fd' },
      { tag: t.angleBracket, color: '#f8f8f2' },
      { tag: t.tagName, color: '#ff79c6' },
      { tag: t.attributeName, color: '#50fa7b' },
      { tag: t.function(t.variableName), color: '#50fa7b' },
      { tag: t.function(t.propertyName), color: '#50fa7b' },
    ],
  });

  // Language extension
  const getLanguageExtension = () => {
    switch (language) {
      case 'javascript': return [javascript()];
      case 'python': return [python()];
      case 'java': return [StreamLanguage.define(javaMode)];
      case 'cpp': return [StreamLanguage.define(cppMode)];
      case 'html': return [html()];
      case 'css': return [css()];
      default: return [javascript()];
    }
  };

  return (
    <div className="coder-container">
      <div className="coder-header">
        <h1 className="coder-title">Code Editor</h1>
        <div className="language-selector">
          <label htmlFor="language">Language:</label>
          <select
            id="language"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="language-dropdown"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
        </div>
      </div>

      <div className="code-editor-wrapper">
        <CodeMirror
          value={code}
          height="100%"
          width="100%"
          theme={customTheme}
          extensions={getLanguageExtension()}
          onChange={handleCodeChange}
         
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: true,
            searchKeymap: true,
          }}
        />
      </div>

      <div className="editor-footer">
        <div className="editor-stats">
          <span>Lines: {code.split('\n').length}</span>
          <span>Characters: {code.length}</span>
          <span>Language: {language.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default Coder;
