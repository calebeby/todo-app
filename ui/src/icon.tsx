import { JSX } from 'preact'

interface Props extends JSX.HTMLAttributes<SVGSVGElement> {
  icon: string
}

export const Icon = ({ icon, ...props }: Props) => (
  <svg {...props} viewBox="0 0 24 24">
    <path d={icon} />
  </svg>
)
