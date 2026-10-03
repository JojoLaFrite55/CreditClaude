import type { Metadata } from "next";
import { ContactDetails } from "@/components/sections/ContactDetails";
import { ContactForm } from "@/components/sections/ContactForm";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contacter Joan Trichard Clermont, technicien système et réseau à Montpellier : alternance, missions, échanges techniques.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Container as="section" className="pt-36 pb-12">
      <SectionHeading
        as="h1"
        eyebrow="Contact"
        title="Travaillons ensemble"
        description="Une alternance, une mission ou simplement une question technique : je réponds rapidement."
      />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <ContactDetails />
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </Container>
  );
}
