import { catalog, type DietaryTag, type Message, type Order, type OrderLine, type OrderStatus } from './index'
import { detectExceptions } from '../engine'

/**
 * The requests Pearl Island's Admin starts with. Dates are anchored to the demo clock (2026-10-13),
 * so "past" and "upcoming" mean the same thing every time the app opens.
 */

type Seed = {
  id: string
  name: string
  organization: string
  email: string
  phone: string
  eventType: string
  eventAt: string
  guests: number
  delivery?: [street: string, city: string, state: string, zip: string]
  lines: Array<[itemId: string, units: number]>
  supplies: Array<[itemId: string, units: number]>
  dietary: DietaryTag[]
  budget: number
  notes: string
  status: OrderStatus
  submittedAt: string
  /** When staff accepted, declined, or sent a proposal back, whichever ended the first review. */
  decidedAt?: string
  revision?: Order['revision']
  messages: Array<[author: Message['author'], at: string, text: string]>
}

const seeds: Seed[] = [
  {
    id: 'pi-0010', name: 'Owen Park', organization: 'Nashville Tech Meetup', email: 'owen.park@nashtech.example', phone: '615-555-0135',
    eventType: 'corporate-lunch', eventAt: '2026-10-24T12:00', guests: 150, delivery: ['1 Music Row', 'Nashville', 'TN', '37203'],
    lines: [['slow-roasted-pork', 75], ['curry-chicken', 75], ['rice-pigeon-peas', 150], ['roasted-vegetables', 150], ['kale-salad', 150]],
    supplies: [['supplies-plates-cutlery-cups', 150], ['chafing-set', 8]], dietary: ['vegetarian'], budget: 3200,
    notes: 'Conference lunch; headcount may grow.', status: 'needs_review', submittedAt: '2026-10-12T16:20',
    messages: [['customer', '2026-10-12T16:40', 'We may add up to 20 guests. Is that possible?']],
  },
  {
    id: 'pi-0009', name: 'Luis Ortega', organization: 'Ortega Logistics', email: 'luis.ortega@ortegalogistics.example', phone: '615-555-0129',
    eventType: 'corporate-lunch', eventAt: '2026-10-27T12:00', guests: 40, delivery: ['1500 Elm Hill Pike', 'Nashville', 'TN', '37210'],
    lines: [['curry-chicken', 20], ['jerk-tofu', 20], ['rice-pigeon-peas', 40], ['roasted-vegetables', 40], ['kale-salad', 40]],
    supplies: [['supplies-plates-cutlery-cups', 40], ['chafing-set', 2]], dietary: ['vegetarian', 'dairy-free'], budget: 800,
    notes: 'Use the loading dock entrance.', status: 'submitted', submittedAt: '2026-10-12T11:15', messages: [],
  },
  {
    id: 'pi-0008', name: 'Marcus Bell', organization: 'Bell & Co. Realty', email: 'marcus.bell@bellrealty.example', phone: '615-555-0151',
    eventType: 'corporate-lunch', eventAt: '2026-10-21T12:00', guests: 45, delivery: ['700 Broadway', 'Nashville', 'TN', '37203'],
    lines: [['slow-roasted-pork', 25], ['jerk-chicken', 20], ['yellow-rice', 45], ['collard-greens', 45], ['kale-salad', 45]],
    supplies: [['supplies-plates-cutlery-cups', 45], ['serving-spoons', 4], ['serving-tongs', 2]], dietary: [], budget: 1000,
    notes: 'Client luncheon; setup by 11:30.', status: 'confirmed', submittedAt: '2026-10-11T09:15', decidedAt: '2026-10-12T10:05',
    messages: [['customer', '2026-10-11T09:40', 'Can setup be done by 11:30?'], ['staff', '2026-10-12T10:05', 'Yes, setup will be done by 11:30.']],
  },
  {
    id: 'pi-0007', name: 'Elena Ruiz', organization: '', email: 'elena.ruiz@mail.example', phone: '615-555-0171',
    eventType: 'birthday-or-special-occasion', eventAt: '2026-10-18T13:00', guests: 30,
    lines: [['sous-poulet', 15], ['creole-beans', 15], ['mac-and-cheese', 30], ['medley-salad', 30]],
    supplies: [['supplies-plates-cutlery', 30]], dietary: ['vegetarian'], budget: 500,
    notes: 'Kids’ party; mild flavors please.', status: 'awaiting_customer_approval', revision: 'pending',
    submittedAt: '2026-10-10T14:00', decidedAt: '2026-10-11T09:30',
    messages: [
      ['staff', '2026-10-11T09:30', 'We proposed Creole Beans in place of Curry Tofu for a milder option. Please review and approve.'],
      ['customer', '2026-10-11T12:00', 'Thanks, I will review it.'],
    ],
  },
  {
    id: 'pi-0006', name: 'Hannah Brooks', organization: 'Cumberland Pediatrics', email: 'hannah.brooks@cumberlandpeds.example', phone: '615-555-0188',
    eventType: 'recurring-office-catering', eventAt: '2026-10-16T12:00', guests: 22,
    lines: [['jerk-chicken', 12], ['creole-beans', 10], ['white-rice', 22], ['roasted-vegetables', 22]],
    supplies: [['supplies-plates-cutlery', 22]], dietary: ['dairy-free'], budget: 350,
    notes: 'Standing Friday order.', status: 'confirmed', submittedAt: '2026-10-09T10:00', decidedAt: '2026-10-10T11:15',
    messages: [['staff', '2026-10-10T11:15', 'Confirmed for Friday pickup at 12:00.']],
  },
  {
    id: 'pi-0005', name: 'Tasha Greene', organization: '', email: 'tasha.greene@mail.example', phone: '615-555-0164',
    eventType: 'birthday-or-special-occasion', eventAt: '2026-10-09T18:00', guests: 25,
    lines: [['sous-poulet', 25], ['mac-and-cheese', 25], ['medley-salad', 25]],
    supplies: [['supplies-plates-cutlery', 25]], dietary: [], budget: 400,
    notes: '40th birthday; please label the containers.', status: 'rejected', submittedAt: '2026-10-08T14:20', decidedAt: '2026-10-08T15:00',
    messages: [['staff', '2026-10-08T15:00', 'We cannot cover this date on less than 48 hours’ notice.']],
  },
  {
    id: 'pi-0004', name: 'Grace Kim', organization: 'Kim-Alvarez Wedding', email: 'grace.kim@mail.example', phone: '629-555-0196',
    eventType: 'wedding', eventAt: '2026-11-07T16:00', guests: 90, delivery: ['45 Magnolia Ln', 'Brentwood', 'TN', '37027'],
    lines: [['jerk-chicken', 45], ['curry-tofu', 25], ['creole-beans', 20], ['tropical-fried-rice', 90], ['amarillos', 90], ['pikliz', 90]],
    supplies: [['supplies-plates-cutlery-cups', 90], ['chafing-set', 5], ['serving-spoons', 6]], dietary: ['vegan', 'gluten-free'], budget: 1800,
    notes: 'Cocktail-hour reception.', status: 'confirmed', submittedAt: '2026-10-06T15:30', decidedAt: '2026-10-08T13:20',
    messages: [['staff', '2026-10-08T13:20', 'Confirmed for Nov 7 delivery at 16:00.']],
  },
  {
    id: 'pi-0003', name: 'Derek Owens', organization: 'Owens & Hale Law', email: 'derek.owens@owenshale.example', phone: '615-555-0177',
    eventType: 'recurring-office-catering', eventAt: '2026-10-05T12:30', guests: 18,
    lines: [['jerk-chicken', 18], ['yellow-rice', 18], ['roasted-vegetables', 18]],
    supplies: [['supplies-plates-cutlery', 18]], dietary: [], budget: 300,
    notes: 'Weekly Monday lunch, week 1 of 4.', status: 'confirmed', submittedAt: '2026-10-01T10:10', decidedAt: '2026-10-02T08:45',
    messages: [['staff', '2026-10-02T08:45', 'Pickup is at the side counter after 12:15.']],
  },
  {
    id: 'pi-0002', name: 'Priya Nair', organization: '', email: 'priya.nair@mail.example', phone: '629-555-0113',
    eventType: 'wedding', eventAt: '2026-10-10T17:00', guests: 120, delivery: ['88 Riverside Dr', 'Franklin', 'TN', '37064'],
    lines: [['jerk-chicken', 60], ['curry-tofu', 30], ['creole-beans', 30], ['tropical-fried-rice', 120], ['collard-greens', 120]],
    supplies: [['supplies-plates-cutlery-cups', 120], ['serving-spoons', 6], ['serving-tongs', 4], ['chafing-set', 6]], dietary: ['vegan', 'gluten-free'], budget: 2400,
    notes: 'Rehearsal dinner; two guests have nut allergies.', status: 'confirmed', submittedAt: '2026-09-30T13:40', decidedAt: '2026-10-02T10:30',
    messages: [
      ['customer', '2026-09-30T14:10', 'Two guests have nut allergies. Can you confirm the ingredients?'],
      ['staff', '2026-10-02T10:30', 'We will confirm ingredient details with the kitchen before the event.'],
    ],
  },
  {
    id: 'pi-0001', name: 'Maya Patel', organization: 'Brightline Analytics', email: 'maya.patel@brightline.example', phone: '615-555-0142',
    eventType: 'corporate-lunch', eventAt: '2026-10-02T12:00', guests: 35, delivery: ['210 Church St', 'Nashville', 'TN', '37201'],
    lines: [['slow-roasted-pork', 20], ['jerk-tofu', 15], ['rice-pigeon-peas', 35], ['kale-salad', 35]],
    supplies: [['supplies-plates-cutlery-cups', 35], ['chafing-set', 2]], dietary: ['vegetarian'], budget: 650,
    notes: 'Deliver to 4th floor reception.', status: 'confirmed', submittedAt: '2026-09-30T09:50', decidedAt: '2026-10-01T09:20',
    messages: [['customer', '2026-09-30T10:05', 'Can you deliver by 11:45?'], ['staff', '2026-10-01T09:20', 'Yes, we will arrive by 11:45.']],
  },
]

const LARGE_ORDER = catalog.exceptionThresholds.largeOrderOverGuests

function build(seed: Seed): Order {
  const lines: OrderLine[] = [...seed.lines, ...seed.supplies].map(([itemId, units]) => ({ itemId, units }))
  const intent: Order['intent'] = {
    contactName: seed.name,
    email: seed.email,
    phone: seed.phone,
    organization: seed.organization,
    deliveryAddress: seed.delivery?.[0] ?? '',
    deliveryCity: seed.delivery?.[1] ?? '',
    deliveryState: seed.delivery?.[2] ?? '',
    deliveryZip: seed.delivery?.[3] ?? '',
    eventType: seed.eventType,
    guestCount: seed.guests,
    eventAt: seed.eventAt,
    fulfillment: seed.delivery ? 'delivery' : 'pickup',
    dietary: seed.dietary,
    budgetCents: seed.budget * 100,
    notes: seed.notes,
    customRequest: '',
  }
  const arrival: OrderStatus = seed.status === 'needs_review' || seed.guests > LARGE_ORDER ? 'needs_review' : 'submitted'
  const history: Order['history'] = [
    { from: null, to: 'draft', actor: 'system', at: seed.submittedAt.slice(0, 11) + '08:30' },
    { from: 'draft', to: arrival, actor: 'customer', at: seed.submittedAt },
  ]
  if (seed.status === 'confirmed') history.push({ from: arrival, to: 'confirmed', actor: 'staff', at: seed.decidedAt! })
  if (seed.status === 'rejected') history.push({ from: arrival, to: 'rejected', actor: 'staff', at: seed.decidedAt!, note: 'Rejected by staff' })
  if (seed.status === 'awaiting_customer_approval') history.push({ from: arrival, to: 'awaiting_customer_approval', actor: 'staff', at: seed.decidedAt! })

  return {
    id: seed.id,
    status: seed.status,
    intent,
    lines,
    suppliesChoice: 'selected',
    flags: detectExceptions({ intent, lines, now: seed.submittedAt }, catalog),
    revision: seed.revision ?? 'none',
    messages: seed.messages.map(([author, at, text], index) => ({ id: `${seed.id}-m${index + 1}`, author, at, text })),
    history,
  }
}

export const seedOrders: Order[] = seeds.map(build)
