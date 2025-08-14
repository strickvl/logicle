'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Textarea } from '@/components/ui/textarea'
import type { TextareaProps } from '@/components/ui/textarea'

type ConditionalEditorProps = Omit<TextareaProps, 'onChange' | 'value' | 'defaultValue' | 'ref'> & {
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  rows?: number
  useAdvancedEditor: boolean
}

const DynamicCodeMirrorEditor = dynamic(() => import('@/components/ui/CodeMirrorEditor'), {
  ssr: false,
  suspense: true,
})

class EditorErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('ConditionalEditor failed to load CodeMirrorEditor', { error, info })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

const ConditionalEditor = React.forwardRef<HTMLElement, ConditionalEditorProps>(
  ({ useAdvancedEditor, value, onChange, onBlur, rows = 3, ...rest }, ref) => {
    const renderTextarea = () => (
      <Textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.currentTarget.value)}
        onBlur={() => onBlur?.()}
        rows={rows}
        {...rest}
      />
    )

    if (!useAdvancedEditor) {
      return renderTextarea()
    }

    return (
      <EditorErrorBoundary fallback={renderTextarea()}>
        <Suspense fallback={renderTextarea()}>
          <DynamicCodeMirrorEditor
            ref={ref as React.Ref<HTMLDivElement>}
            value={value ?? ''}
            onChange={onChange}
            onBlur={onBlur}
            rows={rows}
            {...rest}
          />
        </Suspense>
      </EditorErrorBoundary>
    )
  }
)

ConditionalEditor.displayName = 'ConditionalEditor'

export default ConditionalEditor
