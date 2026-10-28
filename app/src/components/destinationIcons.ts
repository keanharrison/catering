import { Bot, ClipboardList, Edit05, History, MessageSquare, PackageCheck, Plug, Plus, Settings2, SlidersHorizontal, Truck } from './icons'
import { ChatIcon } from './navIcons'

/** One icon per destination, used by the sidebar, the Dashboard shortcuts and empty states so a place always looks the same. */
export const destinationIcons = {
  chat: ChatIcon,
  newRequest: Plus,
  currentOrders: PackageCheck,
  pastOrders: History,
  drafts: Edit05,
  messages: MessageSquare,
  accountSettings: Settings2,
  requests: ClipboardList,
  handoff: Truck,
  menuAndRules: Settings2,
  integrations: Plug,
  agents: Bot,
  staffSettings: SlidersHorizontal,
} as const
