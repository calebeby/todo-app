declare const h: typeof import('preact').h
declare const Fragment: typeof import('preact').Fragment
declare namespace JSX {
  import JSX = preact.JSX
  type IntrinsicElements = JSX.IntrinsicElements
  type IntrinsicAttributes = JSX.IntrinsicAttributes
  type ElementChildrenAttribute = JSX.ElementChildrenAttribute
  type Element = JSX.Element
  type HTMLAttributes<
    RefType extends EventTarget = EventTarget
  > = JSX.HTMLAttributes<RefType>
}
