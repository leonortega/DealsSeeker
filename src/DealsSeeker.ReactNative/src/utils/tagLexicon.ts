function removeDiacritics(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').normalize('NFC');
}

const relatedTermsByLanguage: Record<string, Record<string, string[]>> = {
  en: {
    coffee: ['cafe', 'espresso', 'latte'],
    tea: ['chai', 'infusion'],
    bakery: ['bread', 'pastry'],
    discount: ['deal', 'promo', 'sale', 'offer'],
    offer: ['deal', 'promo', 'sale', 'discount'],
    fresh: ['organic', 'new'],
  },
  es: {
    cafe: ['coffee', 'espresso'],
    te: ['tea', 'infusion'],
    panaderia: ['bakery', 'bread', 'pan'],
    descuento: ['discount', 'deal', 'promo', 'oferta'],
    oferta: ['offer', 'deal', 'promo', 'descuento'],
    fresco: ['fresh', 'organic', 'nuevo'],
  },
};

export function resolveLanguageCode(locale?: string | null) {
  if (!locale?.trim()) {
    return 'en';
  }

  return locale.trim().toLowerCase().split(/[-_]/u, 2)[0] || 'en';
}

export function normalizeTag(value: string) {
  return removeDiacritics(
    (value ?? '')
      .trim()
      .replace(/^[\s.,;:!?"'()[\]{}]+|[\s.,;:!?"'()[\]{}]+$/gu, '')
      .toLowerCase()
  );
}

function isVowel(value: string) {
  return ['a', 'e', 'i', 'o', 'u'].includes(value.toLowerCase());
}

function toSingular(value: string, language: string) {
  if (!value || value.endsWith('%')) {
    return value;
  }

  if (language === 'es') {
    if (value.endsWith('ces') && value.length > 3) {
      return `${value.slice(0, -3)}z`;
    }

    if (value.endsWith('s') && value.length > 3) {
      if (
        value.endsWith('es') &&
        !isVowel(value.at(-3) ?? '') &&
        !value.endsWith('aes') &&
        !value.endsWith('ees') &&
        !value.endsWith('oes')
      ) {
        return value.slice(0, -2);
      }

      return value.slice(0, -1);
    }

    return value;
  }

  if (value.endsWith('ies') && value.length > 3) {
    return `${value.slice(0, -3)}y`;
  }

  if (
    (value.endsWith('ches') ||
      value.endsWith('shes') ||
      value.endsWith('sses') ||
      value.endsWith('xes') ||
      value.endsWith('zes')) &&
    value.length > 2
  ) {
    return value.slice(0, -2);
  }

  if (value.endsWith('s') && !value.endsWith('ss') && value.length > 1) {
    return value.slice(0, -1);
  }

  return value;
}

function toPlural(value: string, language: string) {
  if (!value || value.endsWith('%')) {
    return value;
  }

  if (toSingular(value, language) !== value) {
    return value;
  }

  if (language === 'es') {
    if (value.endsWith('z')) {
      return `${value.slice(0, -1)}ces`;
    }

    return isVowel(value.at(-1) ?? '') ? `${value}s` : `${value}es`;
  }

  if (value.endsWith('y') && value.length > 1 && !isVowel(value.at(-2) ?? '')) {
    return `${value.slice(0, -1)}ies`;
  }

  if (
    value.endsWith('s') ||
    value.endsWith('x') ||
    value.endsWith('z') ||
    value.endsWith('ch') ||
    value.endsWith('sh')
  ) {
    return `${value}es`;
  }

  return `${value}s`;
}

function expandTagVariants(value: string, language: string) {
  const normalized = normalizeTag(value);
  if (!normalized) {
    return [];
  }

  return Array.from(
    new Set([normalized, toSingular(normalized, language), toPlural(normalized, language)].filter(Boolean))
  );
}

function getDictionary(language: string) {
  return relatedTermsByLanguage[language] ?? relatedTermsByLanguage.en;
}

function findRelatedTerms(normalizedTerm: string, language: string) {
  const dictionary = getDictionary(language);
  const selectedForms = new Set(expandTagVariants(normalizedTerm, language));
  const related = new Set<string>();

  Object.entries(dictionary).forEach(([entryKey, synonyms]) => {
    const entryTerms = [entryKey, ...synonyms].map(normalizeTag).filter(Boolean);
    const forms = new Set(entryTerms.flatMap((entryTerm) => expandTagVariants(entryTerm, language)));
    const overlaps = Array.from(forms).some((form) => selectedForms.has(form));
    if (!overlaps) {
      return;
    }

    entryTerms.forEach((term) => related.add(term));
  });

  return Array.from(related);
}

export function getSuggestedTags(selectedTags: string[], locale?: string | null, maxSuggestions = 12) {
  const language = resolveLanguageCode(locale);
  const selected = Array.from(new Set(selectedTags.map(normalizeTag).filter(Boolean)));

  if (selected.length === 0) {
    return [];
  }

  const excluded = new Set(selected);
  const suggestions = new Set<string>();

  selected.forEach((tag) => {
    expandTagVariants(tag, language).forEach((variant) => suggestions.add(variant));
    findRelatedTerms(tag, language).forEach((related) => suggestions.add(related));
  });

  return Array.from(suggestions)
    .filter((suggestion) => !excluded.has(suggestion))
    .sort((left, right) => left.localeCompare(right))
    .slice(0, Math.max(0, maxSuggestions));
}
