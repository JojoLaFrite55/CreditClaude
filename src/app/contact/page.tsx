import type { Metadata } from "next";
import { ContactDetails } from "@/components/sections/ContactDetails";
import { ContactForm } from "@/components/sections/ContactForm";
import { Container } from "@/components/ui/Container";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contacter Joan Trichard Clermont, technicien système et réseau à Montpellier : alternance, missions, échanges techniques.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Container as="section" className="pt-36 pb-12 sm:pt-44">
      <SectionHeading
        as="h1"
        index="(06)"
        eyebrow="Contact"
        title="Travaillons ensemble"
        description="Une alternance, une mission ou simplement une question technique : je réponds rapidement."
      />
      <div className="grid grid-cols-12 gap-x-4 gap-y-20">
        <Parallax speed={0.1} className="col-span-12 lg:col-span-5">
          <ContactDetails />
        </Parallax>
        <Reveal delay={0.1} className="col-span-12 lg:col-span-6 lg:col-start-7 lg:mt-32">
          <ContactForm />
        </Reveal>
      </div>
    </Container>
  );
}
