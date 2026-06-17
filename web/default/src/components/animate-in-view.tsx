/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useRef, useEffect, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnimateInViewProps {
  children: ReactNode
  className?: string
  delay?: number
  threshold?: number
  animation?: 'fade-up' | 'fade-in' | 'scale-in' | 'fade-left' | 'fade-right'
  once?: boolean
  as?: 'div' | 'section' | 'li' | 'span'
}

export function AnimateInView(props: AnimateInViewProps) {
  const {
    as: Tag = 'div',
    delay = 0,
    threshold = 0.15,
    animation = 'fade-up',
    once = true,
  } = props

  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      el.classList.remove('opacity-0', 'will-change-[transform,opacity]')
      return
    }

    const animate = () => {
      el.classList.remove('opacity-0')
      el.classList.add(`landing-animate-${animation}`)
      if (once) {
        el.addEventListener(
          'animationend',
          () => el.classList.remove('will-change-[transform,opacity]'),
          { once: true }
        )
      }
    }

    // If the element is already in the viewport at mount time, animate immediately.
    // IntersectionObserver fires asynchronously and can miss elements that are
    // visible on first paint or after a layout shift.
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight
    const effectiveBottom = vh - 40 // mirrors rootMargin '0px 0px -40px 0px'
    const visiblePx = Math.min(rect.bottom, effectiveBottom) - Math.max(rect.top, 0)
    if (rect.bottom > 0 && rect.top < effectiveBottom && visiblePx / rect.height >= threshold) {
      animate()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate()
          if (once) observer.unobserve(el)
        } else if (!once) {
          el.classList.add('opacity-0')
          el.classList.remove(`landing-animate-${animation}`)
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once, animation])

  return (
    <Tag
      ref={ref as never}
      className={cn(
        'opacity-0 will-change-[transform,opacity]',
        props.className
      )}
      style={
        { animationDelay: delay ? `${delay}ms` : undefined } as CSSProperties
      }
    >
      {props.children}
    </Tag>
  )
}
