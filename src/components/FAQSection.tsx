import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import ScrollReveal from '@/components/ScrollReveal';

const FAQSection = () => {
  const faqs = [
    {
      question: 'How does the point system work?',
      answer:
        'You earn points for various contributions like commits, pull requests, code reviews, and issue reports. Different actions have different point values based on their impact and complexity.',
    },
    {
      question: 'Is Colabs free to use?',
      answer:
        'Yes! Colabs is completely free for individual developers. We also offer premium features for teams and organizations who want advanced analytics and collaboration tools.',
    },
    {
      question: 'How do you verify contributions?',
      answer:
        'We integrate directly with GitHub, GitLab, and other Git platforms to automatically track and verify your contributions in real-time. All data is sourced directly from these platforms.',
    },
    {
      question: 'Can I contribute to private repositories?',
      answer:
        'Absolutely! You can connect your private repositories to track contributions for personal projects and team work. Your private code remains secure and private.',
    },
    {
      question: 'What kind of projects can I find?',
      answer:
        "Our directory includes projects across all major programming languages and frameworks. From beginner-friendly issues to advanced architectural challenges, there's something for every skill level.",
    },
    {
      question: 'How do achievements work?',
      answer:
        "Achievements are unlocked by reaching specific milestones like 'First Pull Request', 'Week Streak', '100 Commits', and many more. They help guide your contribution journey and celebrate your progress.",
    },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-headline text-gradient-subtle mb-6">Frequently asked questions</h2>
          <p className="text-muted-foreground text-lg">Everything you need to know about Colabs</p>
        </ScrollReveal>

        {/* FAQ Accordion */}
        <ScrollReveal delay={0.2}>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 data-[state=open]:border-border"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline py-5 text-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FAQSection;
