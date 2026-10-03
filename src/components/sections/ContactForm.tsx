"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, RotateCcw, Send } from "lucide-react";
import { useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { FormField } from "@/components/sections/FormField";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { duration, easing } from "@/config/ui";
import { profile } from "@/content/profile";
import { buildMailto, validateContact, validateField, type ContactErrors, type ContactValues } from "@/lib/validation";

const initialValues: ContactValues = { name: "", email: "", subject: "", message: "" };

type Field = keyof ContactValues;

export function ContactForm() {
  const [values, setValues] = useState<ContactValues>(initialValues);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [sent, setSent] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = event.target.name as Field;
    const value = event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
    if (touched[field]) setErrors((current) => ({ ...current, [field]: validateField(field, value) }));
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = event.target.name as Field;
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({ ...current, [field]: validateField(field, event.target.value) }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, subject: true, message: true });
    const firstInvalid = (Object.keys(nextErrors) as Field[])[0];
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    window.location.href = buildMailto(profile.email, values);
    setSent(true);
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSent(false);
  };

  const fieldProps = (field: Field) => ({
    id: field,
    value: values[field],
    error: errors[field],
    onChange: handleChange,
    onBlur: handleBlur,
  });

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-6 sm:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: duration.base, ease: easing.out }}
            className="flex min-h-[460px] flex-col items-center justify-center gap-5 text-center"
            role="status"
          >
            <motion.span
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
              className="grid size-16 place-items-center rounded-full bg-accent/15 text-accent"
            >
              <CircleCheck className="size-8" />
            </motion.span>
            <h3 className="font-display text-2xl font-semibold">Message prêt à partir</h3>
            <p className="max-w-sm text-sm text-muted">
              Votre messagerie s&apos;est ouverte avec le message pré-rempli. Il ne reste plus qu&apos;à l&apos;envoyer.
              Rien ne s&apos;est ouvert ? Écrivez directement à{" "}
              <a href={`mailto:${profile.email}`} className="text-accent-soft underline underline-offset-4">
                {profile.email}
              </a>
              .
            </p>
            <MagneticButton variant="ghost" onClick={reset}>
              <RotateCcw className="size-4" /> Nouveau message
            </MagneticButton>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Nom" autoComplete="name" placeholder="Jean Dupont" {...fieldProps("name")} />
              <FormField
                label="E-mail"
                type="email"
                autoComplete="email"
                placeholder="jean@entreprise.fr"
                {...fieldProps("email")}
              />
            </div>
            <FormField label="Objet" placeholder="Proposition d'alternance" maxLength={120} {...fieldProps("subject")} />
            <FormField
              label="Message"
              multiline
              maxLength={2000}
              placeholder="Bonjour Joan, …"
              {...fieldProps("message")}
            />
            <div className="flex flex-col-reverse items-start gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted/80">Le message s&apos;ouvre dans votre messagerie, aucune donnée n&apos;est stockée.</p>
              <MagneticButton type="submit">
                Envoyer <Send className="size-4" />
              </MagneticButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
