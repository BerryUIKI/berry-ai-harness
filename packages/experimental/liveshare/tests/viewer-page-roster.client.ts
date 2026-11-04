/**
 * Test-only client roster of the assembled viewer page.
 *
 * A served viewer page is the owner's own Web shell with the owner's client plugins; this roster is the
 * subset the viewer page specs need: the wire plugin, the Gateway, remote access, the Session/Workspace controllers,
 * the presentation plugins, and the Liveshare `./client` face, which mounts the viewer surfaces when the
 * carrier names a share. Every row is the package's own `/client` face registered as a module-table
 * factory. It must be imported only after {@link prepareViewerRemoteFaces} answered the generated
 * `/remote` faces these plugins import.
 *
 * @module @berry-ai/harness-experimental-liveshare/tests/viewer-page-roster
 */

import * as apiGateway from '@berry-ai/harness-api-gateway/client'
import * as apiRemoteAccess from '@berry-ai/harness-api-remote-access/client'
import * as apiRemotes from '@berry-ai/harness-api-remotes/client'
import * as apiSessionController from '@berry-ai/harness-api-session-controller/client'
import * as apiWorkspaceController from '@berry-ai/harness-api-workspace-controller/client'
import * as clientConnection from '@berry-ai/harness-client-connection/client'
import * as clientFileUpload from '@berry-ai/harness-client-file-upload/client'
import * as clientLocale from '@berry-ai/harness-client-locale/client'
import * as clientModules from '@berry-ai/harness-client-modules/client'
import * as clientResources from '@berry-ai/harness-client-resources/client'
import * as clientShortcuts from '@berry-ai/harness-client-shortcuts/client'
import * as uiAttachment from '@berry-ai/harness-client-ui-attachment/client'
import * as uiChat from '@berry-ai/harness-client-ui-chat/client'
import * as uiConversation from '@berry-ai/harness-client-ui-conversation/client'
import * as uiDeliverables from '@berry-ai/harness-client-ui-deliverables/client'
import * as uiFileDrag from '@berry-ai/harness-client-ui-file-drag/client'
import * as uiLayout from '@berry-ai/harness-client-ui-layout/client'
import * as uiRenderer from '@berry-ai/harness-client-ui-renderer/client'
import * as uiSession from '@berry-ai/harness-client-ui-session/client'
import * as uiSettings from '@berry-ai/harness-client-ui-settings/client'
import * as uiSidebar from '@berry-ai/harness-client-ui-sidebar/client'
import * as uiSidebarRight from '@berry-ai/harness-client-ui-sidebar-right/client'
import * as uiTheme from '@berry-ai/harness-client-ui-theme/client'
import * as uiTool from '@berry-ai/harness-client-ui-tool/client'
import * as uiTrajectory from '@berry-ai/harness-client-ui-trajectory/client'
import * as uiWorkspace from '@berry-ai/harness-client-ui-workspace/client'
import * as typertRegistry from '@berry-ai/harness-typert-registry/client'
import * as liveshare from '../src/client/index.ts'

/** One module-table row: the entry id the Loader creates, and that plugin's client exports. */
export interface ViewerPageRosterRow {
  readonly id: string
  readonly exports: Readonly<Record<string, unknown>>
}

/** Entry id of the module-system bootstrap whose exports the facade hands to the module system. */
export const VIEWER_PAGE_BOOTSTRAP_ID = '@berry-ai/harness-client-modules'

/** The viewer page roster; Cordis composes these entries by service injection, so order is irrelevant. */
export const VIEWER_PAGE_ROSTER: readonly ViewerPageRosterRow[] = [
  { id: '@berry-ai/harness-typert-registry', exports: typertRegistry },
  { id: '@berry-ai/harness-experimental-liveshare', exports: liveshare },
  { id: VIEWER_PAGE_BOOTSTRAP_ID, exports: clientModules },
  { id: '@berry-ai/harness-client-connection', exports: clientConnection },
  { id: '@berry-ai/harness-api-gateway', exports: apiGateway },
  { id: '@berry-ai/harness-api-remote-access', exports: apiRemoteAccess },
  { id: '@berry-ai/harness-api-remotes', exports: apiRemotes },
  { id: '@berry-ai/harness-api-session-controller', exports: apiSessionController },
  { id: '@berry-ai/harness-api-workspace-controller', exports: apiWorkspaceController },
  { id: '@berry-ai/harness-client-file-upload', exports: clientFileUpload },
  { id: '@berry-ai/harness-client-locale', exports: clientLocale },
  { id: '@berry-ai/harness-client-resources', exports: clientResources },
  { id: '@berry-ai/harness-client-shortcuts', exports: clientShortcuts },
  { id: '@berry-ai/harness-client-ui-renderer', exports: uiRenderer },
  { id: '@berry-ai/harness-client-ui-theme', exports: uiTheme },
  { id: '@berry-ai/harness-client-ui-settings', exports: uiSettings },
  { id: '@berry-ai/harness-client-ui-layout', exports: uiLayout },
  { id: '@berry-ai/harness-client-ui-session', exports: uiSession },
  { id: '@berry-ai/harness-client-ui-sidebar', exports: uiSidebar },
  { id: '@berry-ai/harness-client-ui-conversation', exports: uiConversation },
  { id: '@berry-ai/harness-client-ui-chat', exports: uiChat },
  { id: '@berry-ai/harness-client-ui-tool', exports: uiTool },
  { id: '@berry-ai/harness-client-ui-attachment', exports: uiAttachment },
  { id: '@berry-ai/harness-client-ui-file-drag', exports: uiFileDrag },
  { id: '@berry-ai/harness-client-ui-sidebar-right', exports: uiSidebarRight },
  { id: '@berry-ai/harness-client-ui-trajectory', exports: uiTrajectory },
  { id: '@berry-ai/harness-client-ui-deliverables', exports: uiDeliverables },
  { id: '@berry-ai/harness-client-ui-workspace', exports: uiWorkspace },
]
