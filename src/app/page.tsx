import { CallToAction } from "@/components/sections/CallToAction";
import { Explore } from "@/components/sections/Explore";
import { Hero } from "@/components/sections/Hero";
import { Highlights } from "@/components/sections/Highlights";
import { Marquee } from "@/components/sections/Marquee";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Highlights />
      <Explore />
      <CallToAction
        title="Une infrastructure à sécuriser ? Une alternance à pourvoir ?"
        description="Je suis à la recherche d'une entreprise pour poursuivre mon BTS SIO SISR en alternance. Parlons-en."
      />
    </>
  );
}
