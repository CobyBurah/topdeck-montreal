import { sendGAEvent } from '@next/third-parties/google'

// ── Form Events ──────────────────────────────────────────────
export const trackFormStart = () =>
  sendGAEvent('event', 'form_start', { form_name: 'quote' })

export const trackFormSubmit = (service: string) =>
  sendGAEvent('event', 'form_submit', { form_name: 'quote', service })

export const trackFormError = (fields: string[]) =>
  sendGAEvent('event', 'form_error', {
    form_name: 'quote',
    error_fields: fields.join(','),
  })

export const trackFormSuccess = () =>
  sendGAEvent('event', 'form_success', { form_name: 'quote' })

// ── Contact Events ───────────────────────────────────────────
export const trackPhoneClick = (location: string) =>
  sendGAEvent('event', 'click_phone', { location })

export const trackEmailClick = (location: string) =>
  sendGAEvent('event', 'click_email', { location })

export const trackSocialClick = (platform: string) =>
  sendGAEvent('event', 'click_social', { platform })

// ── CTA Events ───────────────────────────────────────────────
export const trackCTAClick = (label: string, location: string) =>
  sendGAEvent('event', 'click_cta', { label, location })

// ── Gallery Events ───────────────────────────────────────────
export const trackGalleryOpen = (projectName: string) =>
  sendGAEvent('event', 'gallery_open', { project_name: projectName })

export const trackGalleryNav = (direction: 'next' | 'previous') =>
  sendGAEvent('event', 'gallery_nav', { direction })

export const trackGallerySlider = (projectName: string) =>
  sendGAEvent('event', 'gallery_slider', { project_name: projectName })

// ── Navigation Events ────────────────────────────────────────
export const trackLanguageSwitch = (from: string, to: string) =>
  sendGAEvent('event', 'language_switch', { from_locale: from, to_locale: to })

export const trackNavClick = (item: string, isMobile: boolean) =>
  sendGAEvent('event', 'nav_click', { item, is_mobile: isMobile })

export const trackMobileMenuToggle = (open: boolean) =>
  sendGAEvent('event', 'mobile_menu_toggle', { state: open ? 'open' : 'close' })
