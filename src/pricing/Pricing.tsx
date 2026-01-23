import { useState } from 'react'

const pricingTiers = [
  {
    name: 'Individual',
    price: '$999',
    description: 'Single device for personal use',
    features: [
      '1 UCL Guardian device',
      'Basic training program',
      'Mobile app access',
      'Email support',
      '1-year warranty',
    ],
    cta: 'Buy Now',
    highlighted: false,
  },
  {
    name: 'PT Bundle',
    price: '$2,499',
    description: '3-pack for physical therapy clinics',
    features: [
      '3 UCL Guardian devices',
      'Full training program library',
      'Analytics dashboard',
      'Priority phone support',
      '2-year warranty',
      'Clinic management tools',
    ],
    cta: 'Buy Now',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Team / Custom',
    price: 'Contact Us',
    description: 'Volume pricing for teams/organizations',
    features: [
      'Custom device quantity',
      'Team-wide analytics',
      'Dedicated account manager',
      '24/7 premium support',
      '3-year warranty',
      'Custom integrations',
      'On-site training',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

const featureComparison = [
  { feature: 'UCL Guardian Device', individual: '1', ptBundle: '3', team: 'Custom' },
  { feature: 'Training Program Access', individual: 'Basic', ptBundle: 'Full Library', team: 'Full Library + Custom' },
  { feature: 'Analytics Dashboard', individual: 'Basic', ptBundle: 'Advanced', team: 'Enterprise' },
  { feature: 'Support Level', individual: 'Email', ptBundle: 'Priority Phone', team: '24/7 Premium' },
  { feature: 'Warranty', individual: '1 Year', ptBundle: '2 Years', team: '3 Years' },
  { feature: 'Mobile App', individual: '✓', ptBundle: '✓', team: '✓' },
  { feature: 'Team Management', individual: '—', ptBundle: '✓', team: '✓' },
  { feature: 'API Access', individual: '—', ptBundle: '—', team: '✓' },
  { feature: 'Custom Integrations', individual: '—', ptBundle: '—', team: '✓' },
]

const faqs = [
  {
    question: 'What is the UCL Guardian?',
    answer: 'The UCL Guardian is a wearable device designed to monitor arm mechanics and help prevent UCL (ulnar collateral ligament) injuries, commonly known as "Tommy John" injuries in baseball players.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 5-7 business days within the US. Expedited shipping (2-3 business days) is available for an additional fee. International shipping times vary by location.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied with your UCL Guardian, return it in original condition for a full refund. PT Bundle and Team orders may have different terms.',
  },
  {
    question: 'Do you offer financing options?',
    answer: 'Yes! We partner with Affirm to offer financing options. Split your purchase into easy monthly payments at checkout. Subject to credit approval.',
  },
  {
    question: 'Is there a subscription fee?',
    answer: 'No subscription is required for basic features. The device and mobile app work out of the box. Advanced analytics features are included free for the first year, then optional.',
  },
  {
    question: 'Can I upgrade my plan later?',
    answer: 'Absolutely! Individual users can upgrade to PT Bundle pricing by purchasing additional devices. Contact our sales team to discuss upgrade options and volume discounts.',
  },
]

export function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-b from-blue-50 to-white -mx-6 px-6 -mt-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Protect Your Arm, Protect Your Career
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          The UCL Guardian uses advanced biomechanical monitoring to help prevent career-ending elbow injuries. 
          Join thousands of athletes who trust our technology to keep them on the field.
        </p>
      </section>

      {/* Pricing Cards */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
          <p className="text-gray-600 mt-2">Select the option that best fits your needs</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 ${
                tier.highlighted
                  ? 'bg-blue-600 text-white shadow-xl scale-105 border-2 border-blue-600'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              {tier.badge && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-bold px-4 py-1 rounded-full">
                  {tier.badge}
                </span>
              )}
              
              <div className="text-center mb-6">
                <h3 className={`text-xl font-bold ${tier.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {tier.name}
                </h3>
                <div className={`text-4xl font-bold mt-4 ${tier.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {tier.price}
                </div>
                <p className={`mt-2 text-sm ${tier.highlighted ? 'text-blue-100' : 'text-gray-500'}`}>
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className={`text-lg ${tier.highlighted ? 'text-blue-200' : 'text-green-500'}`}>✓</span>
                    <span className={tier.highlighted ? 'text-blue-50' : 'text-gray-600'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  tier.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Compare Plans</h2>
          <p className="text-gray-600 mt-2">See what's included in each tier</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900">Individual</th>
                <th className="text-center py-4 px-6 font-semibold text-blue-600 bg-blue-50">PT Bundle</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900">Team</th>
              </tr>
            </thead>
            <tbody>
              {featureComparison.map((row, index) => (
                <tr key={row.feature} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-4 px-6 font-medium text-gray-900">{row.feature}</td>
                  <td className="py-4 px-6 text-center text-gray-600">{row.individual}</td>
                  <td className="py-4 px-6 text-center text-gray-600 bg-blue-50/50">{row.ptBundle}</td>
                  <td className="py-4 px-6 text-center text-gray-600">{row.team}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <p className="text-gray-600 mt-2">Everything you need to know about UCL Guardian</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <span className={`text-2xl text-gray-400 transition-transform ${openFaq === index ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              {openFaq === index && (
                <div className="px-6 pb-6 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Protect Your Arm?</h2>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
          Join over 10,000 athletes and clinics using UCL Guardian to prevent injuries and extend careers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Get Started
          </button>
          <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
            Talk to Sales
          </button>
        </div>
      </section>
    </div>
  )
}
