/**
 * Restaurant information — the single source for contact details,
 * hours and links used across the site.
 *
 * Every empty value is shown on the site as "to be confirmed".
 * Nothing here may be invented: fill in only confirmed details.
 */
export const restaurant = Object.freeze({
  name: 'Funshi Sushi',

  /** Set to false once all placeholders below are replaced. Hides the preview banner. */
  isPreview: true,

  /**
   * WhatsApp number in international format, digits only.
   * Example format: country code + area code + number, e.g. "54911XXXXXXXX".
   * While empty, WhatsApp hand-off is disabled and explained to the visitor.
   */
  whatsapp: '',

  /** Display phone number, e.g. "+54 11 XXXX-XXXX". */
  phone: '',

  email: '',

  /** Street address on one line. */
  address: '',

  /** Link to the address in a maps service. */
  mapsUrl: '',

  /**
   * Opening hours, in display order.
   * Example: [{ days: 'Tue–Sun', time: '19:00–23:30' }, { days: 'Mon', time: 'Closed' }]
   */
  hours: [],

  /** Social profiles: [{ label: 'Instagram', url: 'https://…' }]. Omitted from the page while empty. */
  social: [],
});
