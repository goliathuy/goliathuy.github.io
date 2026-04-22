import { type ReactNode, useState } from 'react'
import { ChevronDown } from 'lucide-react'

const aboutSections = [
  {
    title: 'What are Kegel Exercises?',
    body: `Kegel exercises strengthen the pelvic floor muscles, which support the bladder, bowel, and in women, the uterus. Named after gynecologist Dr. Arnold Kegel, these exercises can help prevent or control urinary incontinence and other pelvic floor problems.`,
  },
  {
    title: 'How to Find Your Pelvic Floor Muscles',
    body: `To identify your pelvic floor muscles, try to stop urination in midstream. The muscles you use to do this are your pelvic floor muscles. (Note: Don't make a habit of starting and stopping your urine flow as this can lead to incomplete emptying of the bladder.)`,
  },
  {
    title: 'When to Do Kegel Exercises',
    body: `You can do Kegel exercises at any time, while sitting, standing or lying down. You might find it easiest to do them lying down at first. Aim for at least 3 sets of exercises per day.`,
  },
]

const womenBenefits = [
  'Reduces urinary incontinence',
  'Prevents pelvic organ prolapse',
  'May improve sexual function',
  'Helps during pregnancy and postpartum recovery',
]
const menBenefits = [
  'Improves urinary control',
  'Can help with recovery after prostate surgery',
  'May improve sexual function',
  'Can help manage symptoms of an overactive bladder',
]

const faqItems: { q: string; a: string }[] = [
  {
    q: 'How often should I do Kegel exercises?',
    a: 'For the best results, practice Kegel exercises 3 times a day, every day. Each session should include 10-15 repetitions of each exercise type.',
  },
  {
    q: 'How long until I see results?',
    a: 'Most people notice improvements after 4-6 weeks of regular practice. However, this can vary depending on individual circumstances and consistency.',
  },
  {
    q: 'Can I do Kegel exercises anywhere?',
    a: "Yes! One of the benefits of Kegel exercises is that they can be done anywhere, anytime, and no one will know you're doing them.",
  },
  {
    q: 'Are there any risks with Kegel exercises?',
    a: 'Kegel exercises are generally safe, but if performed incorrectly (such as with too much straining) or too frequently, they might lead to muscle fatigue or increased pelvic tension. If you experience pain or discomfort, consult a healthcare provider.',
  },
]

function Accordion({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-kegel-border rounded-2xl overflow-hidden bg-kegel-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left font-headline font-semibold text-kegel-on"
      >
        {title}
        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-kegel-muted leading-relaxed border-t border-kegel-border pt-3">{children}</div>
      )}
    </div>
  )
}

export function LearnView() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-8">
      <h2 className="font-headline text-2xl font-bold text-kegel-on">About</h2>
      <div className="space-y-3">
        {aboutSections.map((s) => (
          <Accordion key={s.title} title={s.title} defaultOpen={s.title === 'What are Kegel Exercises?'}>
            <p>{s.body}</p>
          </Accordion>
        ))}
      </div>

      <h2 className="font-headline text-2xl font-bold text-kegel-on pt-2">Benefits</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-kegel-border p-4 bg-kegel-white">
          <h3 className="font-headline font-bold text-kegel-on mb-2">For Women</h3>
          <ul className="list-disc pl-4 text-sm text-kegel-muted space-y-1">
            {womenBenefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-kegel-border p-4 bg-kegel-white">
          <h3 className="font-headline font-bold text-kegel-on mb-2">For Men</h3>
          <ul className="list-disc pl-4 text-sm text-kegel-muted space-y-1">
            {menBenefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="text-sm text-kegel-muted">
        Regular practice of Kegel exercises has been shown to strengthen pelvic floor muscles and provide long-term benefits for bladder
        and bowel control.
      </p>

      <h2 className="font-headline text-2xl font-bold text-kegel-on pt-2">FAQ</h2>
      <div className="space-y-3">
        {faqItems.map((f) => (
          <Accordion key={f.q} title={f.q}>
            <p>{f.a}</p>
          </Accordion>
        ))}
      </div>

      <p className="text-xs text-kegel-muted border-t border-kegel-border pt-6">
        Disclaimer: This app provides general information about Kegel exercises and is not intended as medical advice. Please consult with
        a healthcare professional before starting any new exercise program.
      </p>
    </div>
  )
}
