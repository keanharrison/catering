import { Bot, ClipboardList, LineChart, Edit05, History, MessageSquare, PackageCheck, Plug, Plus, Settings2, SlidersHorizontal, Truck } from './icons'
import { ChatIcon } from './navIcons'

/** One icon per destination, used by the sidebar, the Chat page's account summaries and empty states so a place always looks the same. */
export const destinationIcons = {
  chat: ChatIcon,
  newRequest: Plus,
  currentOrders: PackageCheck,
  pastOrders: History,
  drafts: Edit05,
  messages: MessageSquare,
  accountSettings: Settings2,
  requests: ClipboardList,
  analytics: LineChart,
  handoff: Truck,
  menuAndRules: Settings2,
  integrations: Plug,
  agents: Bot,
  staffSettings: SlidersHorizontal,
} as const

export type Tone = 'indigo' | 'violet' | 'teal' | 'sky' | 'slate'

/** The tile color for a destination, used for icons inside pages. The sidebar stays neutral. */
export const destinationTones: Partial<Record<keyof typeof destinationIcons, Tone>> = {
  chat: 'violet',
  currentOrders: 'indigo',
  pastOrders: 'slate',
  drafts: 'teal',
  messages: 'sky',
  requests: 'indigo',
  analytics: 'violet',
  accountSettings: 'slate',
}
