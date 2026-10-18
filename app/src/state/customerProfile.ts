export const CUSTOMER_PROFILE_KEY = 'pi2go-demo-profile'

export type CustomerProfile = {
  name: string
  email: string
  phone: string
  organization: string
}

export const emptyCustomerProfile: CustomerProfile = {
  name: '',
  email: '',
  phone: '',
  organization: '',
}

export function readCustomerProfile(): CustomerProfile {
  try {
    const saved = localStorage.getItem(CUSTOMER_PROFILE_KEY)
    if (!saved) return { ...emptyCustomerProfile }
    const parsed = JSON.parse(saved) as Partial<CustomerProfile>
    return Object.fromEntries(
      Object.keys(emptyCustomerProfile).map((key) => [
        key,
        typeof parsed[key as keyof CustomerProfile] === 'string' ? parsed[key as keyof CustomerProfile] : '',
      ]),
    ) as CustomerProfile
  } catch {
    return { ...emptyCustomerProfile }
  }
}

/** Add saved profile values only to blank fields on a newly created request. */
export function prefillMissingContact<T extends { contactName: string; email: string; phone: string; organization: string }>(intent: T): T {
  const profile = readCustomerProfile()
  return {
    ...intent,
    contactName: intent.contactName.trim() ? intent.contactName : profile.name,
    email: intent.email.trim() ? intent.email : profile.email,
    phone: intent.phone.trim() ? intent.phone : profile.phone,
    organization: intent.organization.trim() ? intent.organization : profile.organization,
  }
}
