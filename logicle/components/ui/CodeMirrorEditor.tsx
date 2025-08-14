'use client'

import React, { forwardRef, useCallback, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { TextareaProps } from './textarea'
import { cn } from '@/lib/utils'
import { EditorView } from '@codemirror/view'
import type { EditorView as EditorViewType } from '@codemirror/view'
import { placeholder as cmPlaceholder } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'

// Dynamically import CodeMirror to avoid SSR issues
const ClientCodeMirror = dynamic(() => import('@uiw/react-codemirror').then((m) => m.default), {
  ssr: false,
})

type CodeMirrorEditorProps = Omit<TextareaProps, 'onChange' | 'onBlur' | 'ref'> & {
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  rows?: number
}

/**
 * CodeMirrorEditor
 * - Drop-in replacement for Textarea with markdown highlighting and line wrapping.
 * - ForwardRef to a wrapper div to integrate with FormControl (id/aria).
 * - Accessible: role="textbox", aria-multiline="true", keyboard focusable
 * - Integrates with react-hook-form via value, onChange(string), onBlur().
 */
const CodeMirrorEditor = forwardRef<HTMLDivElement, CodeMirrorEditorProps>((props, ref) => {
  const {
    value,
    onChange,
    onBlur,
    className,
    placeholder,
    rows = 3,
    disabled,
    id,
    name,
    ...rest
  } = props

  const editorViewRef = useRef<EditorViewType | null>(null)

  const minHeightPx = Math.max(80, rows * 24)

  const extensions = useMemo(() => {
    const ex = [EditorView.lineWrapping, markdown()]
    if (placeholder) ex.push(cmPlaceholder(placeholder))
    if (disabled) ex.push(EditorView.editable.of(false))
    return ex
  }, [placeholder, disabled])

  const handleChange = useCallback(
    (val: string) => {
      onChange?.(val)
    },
    [onChange]
  )

  const handleBlur = useCallback(() => {
    onBlur?.()
  }, [onBlur])

  const handleCreateEditor = useCallback((view: EditorViewType) => {
    editorViewRef.current = view
  }, [])

  const focusEditor = useCallback(() => {
    editorViewRef.current?.focus()
  }, [])

  return (
    <div
      ref={ref}
      id={id}
      role="textbox"
      aria-multiline="true"
      aria-disabled={disabled}
      tabIndex={0}
      onFocus={focusEditor}
      onClick={focusEditor}
      className={cn(
        // Use focus-within to show ring when inner editor is focused
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-body1 ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...rest}
    >
      <ClientCodeMirror
        value={value ?? ''}
        onChange={handleChange}
        onBlur={handleBlur}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          highlightActiveLineGutter: false,
        }}
        height="100%"
        minHeight={`${minHeightPx}px`}
        editable={!disabled}
        extensions={extensions}
        // Keep CodeMirror as fluid as the parent wrapper
        // The wrapper in consuming code can set className="flex-1" to stretch
        style={{ width: '100%' }}
        onCreateEditor={handleCreateEditor}
      />
    </div>
  )
})

CodeMirrorEditor.displayName = 'CodeMirrorEditor'

export default CodeMirrorEditor
