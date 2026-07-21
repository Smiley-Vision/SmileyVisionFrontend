import type { Directive, DirectiveBinding } from 'vue'

type RevealOrigin = 'up' | 'down' | 'left' | 'right' | 'zoom'

interface RevealOptions {
  origin: RevealOrigin
  distance: number
  duration: number
  delay: number
  threshold: number
  once: boolean
  rootMargin: string
  blur: number
  scale: number
}

type RevealBindingValue = RevealOrigin | Partial<RevealOptions>

interface RevealElement extends HTMLElement {
  __svRevealObserver?: IntersectionObserver
}

const DEFAULT_OPTIONS: RevealOptions = {
  origin: 'up',
  distance: 34,
  duration: 760,
  delay: 0,
  threshold: 0.18,
  once: true,
  rootMargin: '0px 0px -8% 0px',
  blur: 8,
  scale: 1,
}

function normalizeOptions(value: RevealBindingValue | undefined): RevealOptions {
  if (typeof value === 'string') {
    return { ...DEFAULT_OPTIONS, origin: value }
  }

  return {
    ...DEFAULT_OPTIONS,
    ...(value && typeof value === 'object' ? value : {}),
  }
}

function applyMotionStyles(el: RevealElement, options: RevealOptions) {
  let x = '0px'
  let y = '0px'

  if (options.origin === 'up') y = `${options.distance}px`
  if (options.origin === 'down') y = `-${options.distance}px`
  if (options.origin === 'left') x = `${options.distance}px`
  if (options.origin === 'right') x = `-${options.distance}px`

  el.style.setProperty('--sv-reveal-x', x)
  el.style.setProperty('--sv-reveal-y', y)
  el.style.setProperty('--sv-reveal-duration', `${options.duration}ms`)
  el.style.setProperty('--sv-reveal-delay', `${options.delay}ms`)
  el.style.setProperty('--sv-reveal-blur', `${options.blur}px`)
  el.style.setProperty(
    '--sv-reveal-scale-start',
    options.origin === 'zoom' ? String(options.scale || 0.92) : '1',
  )
}

function setupReveal(el: RevealElement, binding: DirectiveBinding<RevealBindingValue>) {
  const options = normalizeOptions(binding?.value)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  el.classList.add('sv-reveal')
  applyMotionStyles(el, options)

  if (prefersReducedMotion) {
    el.classList.add('is-visible')
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')

          if (options.once) {
            observer.unobserve(el)
          }
        } else if (!options.once) {
          el.classList.remove('is-visible')
        }
      })
    },
    {
      threshold: options.threshold,
      rootMargin: options.rootMargin,
    },
  )

  observer.observe(el)
  el.__svRevealObserver = observer
}

export const revealOnScroll: Directive<RevealElement, RevealBindingValue> = {
  mounted(el, binding) {
    setupReveal(el, binding)
  },
  updated(el, binding) {
    if (JSON.stringify(binding.value) === JSON.stringify(binding.oldValue)) {
      return
    }

    el.__svRevealObserver?.disconnect()
    delete el.__svRevealObserver
    el.classList.remove('is-visible')
    setupReveal(el, binding)
  },
  beforeUnmount(el) {
    el.__svRevealObserver?.disconnect()
    delete el.__svRevealObserver
  },
}
