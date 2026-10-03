import type { Metadata } from "next";
import { AboutContent } from "@/components/sections/AboutContent";
import { CallToAction } from "@/components/sections/CallToAction";

export const metadata: Metadata = {
  title: "À propos",
  description: "Qui est Joan Trichard Clermont : parcours, motivations et ambitions en cybersécurité et administration réseau.",
  alternates: { canonical: "/a-propos" },
};

export default function AboutPage() {
  return (
    <>
      <AboutContent />
      <CallToAction
        title="Envie d'en savoir plus ?"
        description="Mon parcours détaillé et mes compétences techniques sont sur la page Parcours. Ou écrivez-moi directement."
      />
    </>
  );
}
