import React from 'react'

interface MarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export function Mark({ size = 36, className, ...props }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <rect width="12" height="12" rx="2" fill="#1F6F78" />
      <rect x="5" y="4" width="2" height="5" fill="#8FD16B" />
      <rect x="2" y="3" width="2" height="1" fill="#B8E58F" />
      <rect x="3" y="4" width="2" height="1" fill="#B8E58F" />
      <rect x="4" y="5" width="1" height="1" fill="#B8E58F" />
      <rect x="8" y="3" width="2" height="1" fill="#B8E58F" />
      <rect x="7" y="4" width="2" height="1" fill="#B8E58F" />
      <rect x="7" y="5" width="1" height="1" fill="#B8E58F" />
      <rect x="3" y="9" width="6" height="1" fill="#C58B4A" />
    </svg>
  )
}
