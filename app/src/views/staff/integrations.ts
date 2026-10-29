/** The services Pearl Island could connect, grouped by what they would do for catering. Catalog only: nothing here connects to anything. */

export type Service = {
  id: string
  name: string
  /** Letters shown when no official logo file has been added. */
  mark: string
  description: string
}

export type ServiceGroup = { id: string; label: string; services: Service[] }

/**
 * Official logos go in app/public/integrations/<id>.svg (or .png); list the id here to show it.
 * Until a file is added the card shows a neutral text mark instead of an imitation of the logo.
 */
export const logoFiles: Record<string, string | undefined> = {}

export const serviceGroups: ServiceGroup[] = [
  {
    id: 'calendar',
    label: 'Calendar',
    services: [
      { id: 'google-calendar', name: 'Google Calendar', mark: 'GC', description: 'Add accepted events to the team calendar with the time, guest count, and pickup or delivery details.' },
    ],
  },
  {
    id: 'pos',
    label: 'Point of sale',
    services: [
      { id: 'toast', name: 'Toast', mark: 'T', description: 'Share accepted catering orders and menu items with your Toast point-of-sale system.' },
      { id: 'square', name: 'Square for Restaurants', mark: 'S', description: 'Send accepted catering orders to Square for Restaurants and keep menu items in step.' },
      { id: 'clover', name: 'Clover', mark: 'C', description: 'Bring catering orders into Clover so the counter and kitchen see the same ticket.' },
      { id: 'lightspeed', name: 'Lightspeed Restaurant', mark: 'LR', description: 'Match catering menu items and orders with Lightspeed Restaurant.' },
      { id: 'touchbistro', name: 'TouchBistro', mark: 'TB', description: 'Pass accepted catering orders to TouchBistro for the kitchen and front of house.' },
    ],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    services: [
      { id: 'quickbooks', name: 'QuickBooks Online', mark: 'QB', description: 'Send invoices and payments for accepted catering orders to your books.' },
    ],
  },
  {
    id: 'staffing',
    label: 'Staffing',
    services: [
      { id: '7shifts', name: '7shifts', mark: '7', description: 'Share upcoming event dates and guest counts so shifts can be planned around them.' },
    ],
  },
  {
    id: 'marketplaces',
    label: 'Catering and delivery',
    services: [
      { id: 'ezcater', name: 'ezCater', mark: 'eZ', description: 'Receive corporate catering requests from ezCater in the same Requests queue.' },
      { id: 'doordash', name: 'DoorDash', mark: 'DD', description: 'Send delivery catering orders to DoorDash drivers.' },
    ],
  },
]
