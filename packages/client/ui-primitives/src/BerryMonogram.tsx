import type { IconProps } from './icons/props.ts'

/** Native viewBox of {@link BERRY_MONOGRAM_PATH} (width and height in user units). */
export const BERRY_MONOGRAM_VIEWBOX = { width: 1024, height: 1024 }

/**
 * Berry monogram 'B' vector path data, matching the brand icon assets.
 */
export const BERRY_MONOGRAM_PATH =
  'M 280 200 L 560 200 C 660 200 730 250 730 340 C 730 405 685 455 615 480 C 705 505 760 565 760 655 C 760 765 675 824 550 824 L 280 824 Z M 410 320 L 410 460 L 540 460 C 600 460 635 435 635 390 C 635 345 600 320 540 320 Z M 410 560 L 410 704 L 555 704 C 625 704 665 675 665 632 C 665 589 625 560 555 560 Z'

/**
 * Render the vector Berry 'B' monogram icon.
 *
 * @param props.size - width and height in px (default 24).
 * @param props.className - extra class for layout placement.
 * @returns the monogram svg element.
 */
export function BerryMonogram({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox={`0 0 ${BERRY_MONOGRAM_VIEWBOX.width} ${BERRY_MONOGRAM_VIEWBOX.height}`}
      fill="none"
      aria-hidden="true"
    >
      <path d={BERRY_MONOGRAM_PATH} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  )
}
