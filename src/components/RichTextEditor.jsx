/* Minimal contentEditable WYSIWYG. No deps. Output is HTML.
   Buttons: Bold, Italic, H3, Bullet list, Numbered list, Link, Clear. */
import { useRef, useEffect, useState } from 'react'

function exec(cmd, arg = null) { document.execCommand(cmd, false, arg) }

export default function RichTextEditor({ value, onChange, minHeight = 140, placeholder = '' }) {
  const ref = useRef(null)
  const [focused, setFocused] = useState(false)

  // Sync external value -> DOM, but only when it actually differs (avoid caret jumps)
  useEffect(() => {
    if (!ref.current) return
    const incoming = value || ''
    if (ref.current.innerHTML !== incoming) ref.current.innerHTML = incoming
  }, [value])

  const fire = () => onChange(ref.current?.innerHTML || '')
  const run = (cmd, arg) => { exec(cmd, arg); ref.current?.focus(); fire() }

  const promptLink = () => {
    const url = window.prompt('Link URL', 'https://')
    if (url && url !== 'https://') run('createLink', url)
  }

  const Btn = ({ cmd, arg, label, title }) => (
    <button type="button" title={title || label}
      onMouseDown={e => { e.preventDefault(); run(cmd, arg) }}
      style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: 'var(--text-dim)', padding: '6px 10px', borderRadius: 6,
        fontSize: 13, fontWeight: 700, minWidth: 30,
      }}>{label}</button>
  )

  return (
    <div style={{
      border: '1px solid ' + (focused ? 'var(--accent-bright)' : 'var(--border)'),
      borderRadius: 8, overflow: 'hidden', background: 'var(--surface-2)',
      transition: 'border-color .12s',
    }}>
      <div style={{
        display: 'flex', gap: 2, padding: 6, borderBottom: '1px solid var(--border)',
        background: 'var(--surface-3)', flexWrap: 'wrap',
      }}>
        <Btn cmd="bold"        label="B"   title="Bold" />
        <Btn cmd="italic"      label="I"   title="Italic" />
        <Btn cmd="underline"   label="U"   title="Underline" />
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        <Btn cmd="formatBlock" arg="h2"   label="H2" />
        <Btn cmd="formatBlock" arg="h3"   label="H3" />
        <Btn cmd="formatBlock" arg="p"    label="¶" title="Paragraph" />
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        <Btn cmd="insertUnorderedList" label="• List" />
        <Btn cmd="insertOrderedList"   label="1. List" />
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        <button type="button" title="Insert link"
          onMouseDown={e => { e.preventDefault(); promptLink() }}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-dim)', padding: '6px 10px', borderRadius: 6,
            fontSize: 13, fontWeight: 600,
          }}>🔗 Link</button>
        <Btn cmd="removeFormat" label="Clear" title="Clear formatting" />
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); fire() }}
        onInput={fire}
        onPaste={e => {
          // Strip styles from pasted content — keep text only
          e.preventDefault()
          const text = (e.clipboardData || window.clipboardData).getData('text/plain')
          exec('insertText', text)
          fire()
        }}
        data-placeholder={placeholder}
        className="rte"
        style={{
          padding: 14, minHeight, outline: 'none',
          fontSize: 14, lineHeight: 1.55, color: 'var(--text)',
        }}
      />
      <style>{`
        .rte:empty:before {
          content: attr(data-placeholder);
          color: var(--text-faint);
          pointer-events: none;
        }
        .rte h2 { font-size: 18px; font-weight: 700; margin: 8px 0 6px; }
        .rte h3 { font-size: 15px; font-weight: 700; margin: 8px 0 6px; }
        .rte p { margin: 0 0 8px; }
        .rte ul, .rte ol { margin: 4px 0 8px; padding-left: 22px; }
        .rte a { color: var(--accent-bright); }
      `}</style>
    </div>
  )
}
