/** Static Browser tab type and guide declaration. */
import type { ShortcutCommandId } from '@berry-ai/harness-client-shortcuts/client'
import type { TranslateNS } from '@berry-ai/harness-client-locale/client'
import { GuideArtworkBrowser } from '@berry-ai/harness-client-ui-primitives'
import type { SidebarRightTabDefinition } from '@berry-ai/harness-client-ui-sidebar-right/client'
import type {} from './locales.ts'

/** Browser tab kind. */
export const BROWSER_KIND = 'browser'

/** Browser implementation identity and keyed Slot dispatch key. */
export const BROWSER_ID = '@berry-ai/harness-client-ui-sidebar-browser'

/** Build the Browser type with locale-live copy. */
export function browserDefinition(t: TranslateNS<'sidebarBrowser'>): SidebarRightTabDefinition {
  return {
    id: BROWSER_ID,
    kind: BROWSER_KIND,
    multiple: true,
    priority: 'builtin',
    title: () => t('type.label'),
    guide: [{
      id: 'new', commandId: 'browser.new' as ShortcutCommandId, order: 30, title: () => t('guide.title'),
      description: () => t('guide.description'), icon: GuideArtworkBrowser,
    }],
  }
}
