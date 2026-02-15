'use client'

import type { CustomerStage, StageContext } from '@/hooks/useCustomerStage'
import { cn } from '@/lib/utils'

interface Template {
  label: string
  message: string
  subject?: string
}

interface QuickTemplateBubblesProps {
  stage: CustomerStage
  stageContext: StageContext
  customerName: string
  customerLanguage: 'en' | 'fr'
  isLoading: boolean
  onSelect: (template: { message: string; subject?: string }) => void
}

function getTemplatesForStage(
  stage: CustomerStage,
  context: StageContext,
  language: 'en' | 'fr',
  name: string
): Template[] {
  const fr = language === 'fr'

  switch (stage) {
    case 'returning':
      return [
        {
          label: fr ? 'Offrir re-teinture' : 'Offer re-stain',
          message: fr
            ? `Bonjour ${name}, nous avons teint votre terrasse il y a quelque temps et nous voulions savoir — seriez-vous intéressé à la faire teindre à nouveau cette saison?`
            : `Hi ${name}, we stained your deck a while back and wanted to check in — would you be interested in having it done again this season?`,
          subject: fr ? 'Temps pour une nouvelle teinture?' : 'Time for a fresh stain?',
        },
      ]
    case 'active_lead':
      return [
        {
          label: fr ? 'Demander photos' : 'Request photos',
          message: fr
            ? `Bonjour ${name}, pourriez-vous envoyer quelques photos supplémentaires montrant toute la surface à teindre? Cela nous aidera à fournir une estimation précise.`
            : `Hi ${name}, could you send a few more photos showing the full surface to be stained? This will help us provide an accurate estimate.`,
          subject: fr ? 'Photos pour votre estimation' : 'Photos needed for your estimate',
        },
        {
          label: fr ? 'Planifier estimation' : 'Schedule estimate',
          message: fr
            ? `Bonjour ${name}, nous aimerions venir voir en personne. Quelles journées vous conviennent pour une estimation sur place?`
            : `Hi ${name}, we'd love to come take a look in person. What days work best for you for an on-site estimate?`,
          subject: fr ? 'Planifier votre estimation sur place' : 'Scheduling your in-person estimate',
        },
        {
          label: fr ? 'Demander un appel' : 'Request call',
          message: fr
            ? `Bonjour ${name}, appelez-moi quand vous avez un moment — j'aimerais discuter des détails du projet avec vous.`
            : `Hi ${name}, give me a call when you get a chance — would love to discuss the project details with you.`,
          subject: fr ? 'Discutons de votre projet' : "Let's discuss your project",
        },
      ]
    case 'has_estimate': {
      const timeEn = context.estimateRelativeTime || 'recently'
      const timeFr = context.estimateRelativeTimeFr || 'récemment'
      return [
        {
          label: fr ? 'Suivi estimation' : 'Follow up',
          message: fr
            ? `Bonjour ${name}, je fais un suivi concernant l'estimation que nous avons envoyée ${timeFr}. N'hésitez pas si vous avez des questions!`
            : `Hi ${name}, just following up on the estimate we sent ${timeEn}. Let us know if you have any questions!`,
          subject: fr ? 'Suivi de votre estimation' : 'Following up on your estimate',
        },
        {
          label: fr ? 'Prêt à procéder' : 'Ready to proceed',
          message: fr
            ? `Bonjour ${name}, content d'apprendre que vous souhaitez aller de l'avant! Je vous enverrai une facture sous peu où vous pourrez payer le dépôt pour réserver votre place.`
            : `Hi ${name}, glad to hear you'd like to move forward! I'll send over an invoice shortly where you can pay the deposit to secure your spot.`,
          subject: fr ? 'Prochaines étapes — facture de dépôt' : 'Next steps — deposit invoice',
        },
      ]
    }
    case 'unpaid_invoice':
      return [
        {
          label: fr ? 'Rappel facture' : 'Invoice reminder',
          message: fr
            ? `Bonjour ${name}, juste un petit rappel — nous attendons toujours le dépôt pour votre facture. N'hésitez pas si vous avez des questions!`
            : `Hi ${name}, just a friendly reminder — we're still waiting on the deposit for your invoice. Let us know if you have any questions!`,
          subject: fr ? 'Rappel de dépôt' : 'Deposit reminder',
        },
      ]
  }
}

export function QuickTemplateBubbles({
  stage,
  stageContext,
  customerName,
  customerLanguage,
  isLoading,
  onSelect,
}: QuickTemplateBubblesProps) {
  if (isLoading) return null

  const firstName = customerName.split(' ')[0]
  const templates = getTemplatesForStage(stage, stageContext, customerLanguage, firstName)

  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {templates.map((template) => (
        <button
          key={template.label}
          onClick={() => onSelect({ message: template.message, subject: template.subject })}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium transition-colors',
            'bg-primary-50 text-primary-700 hover:bg-primary-100',
            'border border-primary-200'
          )}
        >
          {template.label}
        </button>
      ))}
    </div>
  )
}
