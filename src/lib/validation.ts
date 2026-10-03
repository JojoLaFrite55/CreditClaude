export type ContactValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const rules: Record<keyof ContactValues, (value: string) => string | undefined> = {
  name: (value) => {
    if (!value.trim()) return "Indiquez votre nom.";
    if (value.trim().length < 2) return "Le nom doit contenir au moins 2 caractères.";
    return undefined;
  },
  email: (value) => {
    if (!value.trim()) return "Indiquez votre adresse e-mail.";
    if (!EMAIL_PATTERN.test(value.trim())) return "Cette adresse e-mail ne semble pas valide.";
    return undefined;
  },
  subject: (value) => {
    if (!value.trim()) return "Précisez l'objet de votre message.";
    if (value.trim().length > 120) return "L'objet ne doit pas dépasser 120 caractères.";
    return undefined;
  },
  message: (value) => {
    if (value.trim().length < 20) return "Votre message doit contenir au moins 20 caractères.";
    if (value.length > 2000) return "Votre message ne doit pas dépasser 2000 caractères.";
    return undefined;
  },
};

export function validateField(field: keyof ContactValues, value: string) {
  return rules[field](value);
}

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  for (const field of Object.keys(rules) as (keyof ContactValues)[]) {
    const error = rules[field](values[field]);
    if (error) errors[field] = error;
  }
  return errors;
}

export function buildMailto(recipient: string, values: ContactValues) {
  const body = `${values.message.trim()}\n\n— ${values.name.trim()} (${values.email.trim()})`;
  const params = new URLSearchParams({ subject: values.subject.trim(), body });
  return `mailto:${recipient}?${params.toString().replace(/\+/g, "%20")}`;
}
