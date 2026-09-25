// Reusable rule-based Japanese verb conjugation engine and validator.
// Supports Ichidan, Godan, and Irregular verbs with Kanji/Hiragana normalization.
// Uses bundled JMdict-derived verb dictionary for scalability.

import jmdictVerbsRaw from './jmdict-verbs.json';

export interface ConjugationSet {
  dictionary: string[];
  masu: string[];
  mashita: string[];
  masen: string[];
  masenDeshita: string[];
  shortNegative: string[];
  pastShort: string[];
  pastShortNegative: string[];
  te: string[];
  teIru: string[];
  teImasu: string[];
  teImasuNegative: string[];
  stem: string[];
}

type JMdictVerb = {
  kanji: string[];
  kana: string[];
  types: string[];
  meanings: string[];
};

const dictionary = jmdictVerbsRaw as JMdictVerb[];

const VERB_MAP = new Map<string, JMdictVerb>();
dictionary.forEach(entry => {
  entry.kanji.forEach(k => VERB_MAP.set(k, entry));
  entry.kana.forEach(k => VERB_MAP.set(k, entry));
});

export function getExpectedDictionaryFormsForMeaning(meaning: string): string[] | null {
  const normalized = meaning.toLowerCase().trim();
  if (!normalized) return null;
  
  const hasTo = normalized.startsWith('to ');
  const normalizedWithTo = hasTo ? normalized : `to ${normalized}`;
  const normalizedWithoutTo = hasTo ? normalized.slice(3).trim() : normalized;
  
  const matches = dictionary.filter(v => 
    v.meanings.some(m => {
      const mLow = m.toLowerCase();
      
      const matchWithTo = mLow === normalizedWithTo || mLow.startsWith(normalizedWithTo + " (");
      const matchWithoutTo = mLow === normalizedWithoutTo || mLow.startsWith(normalizedWithoutTo + " (");
      const matchNormalized = mLow === normalized || mLow.startsWith(normalized + " (");
      
      return matchWithTo || matchWithoutTo || matchNormalized;
    })
  );

  if (matches.length === 0) return null;

  const expected = new Set<string>();
  matches.forEach(m => {
    m.kanji.forEach(k => expected.add(k));
    m.kana.forEach(k => expected.add(k));
  });

  return Array.from(expected);
}

export function getVerbGroup(verb: string): "ichidan" | "godan" | "suru" | "kuru" | "iku" | "unknown" {
  const trimmed = verb.trim();
  if (!trimmed) return "unknown";

  if (trimmed === "する" || trimmed.endsWith("する")) {
    return "suru";
  }
  if (trimmed === "来る" || trimmed === "くる") {
    return "kuru";
  }
  if (trimmed === "行く" || trimmed === "いく") {
    return "iku";
  }

  const entry = VERB_MAP.get(trimmed);
  if (entry) {
    if (entry.types.includes('v1')) return 'ichidan';
    if (entry.types.some(t => t.startsWith('v5'))) {
      if (entry.types.includes('v5k-s')) return 'iku';
      return 'godan';
    }
    if (entry.types.includes('vk')) return 'kuru';
    if (entry.types.some(t => t.startsWith('vs'))) return 'suru';
  }

  const lastChar = trimmed.slice(-1);
  const validEndings = ["う", "く", "ぐ", "す", "つ", "ぬ", "ぶ", "む", "る"];
  if (!validEndings.includes(lastChar)) {
    return "unknown";
  }

  if (lastChar === "る") {
    return "godan"; 
  }

  return "godan";
}

function conjugateSingle(verb: string, group: "ichidan" | "godan" | "suru" | "kuru" | "iku"): Omit<ConjugationSet, "dictionary"> {
  const base = verb.slice(0, -1);
  const lastChar = verb.slice(-1);

  if (group === "suru") {
    const prefix = verb.slice(0, -2);
    return {
      masu: [prefix + "します"],
      mashita: [prefix + "しました"],
      masen: [prefix + "しません"],
      masenDeshita: [prefix + "しませんでした"],
      shortNegative: [prefix + "しない"],
      pastShort: [prefix + "した"],
      pastShortNegative: [prefix + "しなかった"],
      te: [prefix + "して"],
      teIru: [prefix + "している"],
      teImasu: [prefix + "しています"],
      teImasuNegative: [prefix + "していません"],
      stem: [prefix + "し"],
    };
  }

  if (group === "kuru") {
    const isKanji = verb.includes("来");
    const stem = isKanji ? "来" : "き";
    const ko = isKanji ? "来" : "こ";
    const ki = isKanji ? "来" : "き";
    return {
      masu: [ki + "ます"],
      mashita: [ki + "ました"],
      masen: [ki + "ません"],
      masenDeshita: [ki + "ませんでした"],
      shortNegative: [ko + "ない"],
      pastShort: [ki + "た"],
      pastShortNegative: [ko + "なかった"],
      te: [ki + "て"],
      teIru: [ki + "ている"],
      teImasu: [ki + "ています"],
      teImasuNegative: [ki + "ていません"],
      stem: [ki],
    };
  }

  if (group === "iku") {
    return {
      masu: [base + "きます"],
      mashita: [base + "きました"],
      masen: [base + "きません"],
      masenDeshita: [base + "きませんでした"],
      shortNegative: [base + "かない"],
      pastShort: [base + "った"],
      pastShortNegative: [base + "かなかった"],
      te: [base + "って"],
      teIru: [base + "っている"],
      teImasu: [base + "っています"],
      teImasuNegative: [base + "っていません"],
      stem: [base + "き"],
    };
  }

  if (group === "ichidan") {
    return {
      masu: [base + "ます"],
      mashita: [base + "ました"],
      masen: [base + "ません"],
      masenDeshita: [base + "ませんでした"],
      shortNegative: [base + "ない"],
      pastShort: [base + "た"],
      pastShortNegative: [base + "なかった"],
      te: [base + "て"],
      teIru: [base + "ている"],
      teImasu: [base + "ています"],
      teImasuNegative: [base + "ていません"],
      stem: [base],
    };
  }

  // Godan verbs
  let stemChar = "";
  let naiChar = "";
  let teSuffix = "";
  let taSuffix = "";

  switch (lastChar) {
    case "う": stemChar = "い"; naiChar = "わ"; teSuffix = "って"; taSuffix = "った"; break;
    case "く": stemChar = "き"; naiChar = "か"; teSuffix = "いて"; taSuffix = "いた"; break;
    case "ぐ": stemChar = "ぎ"; naiChar = "が"; teSuffix = "いで"; taSuffix = "いだ"; break;
    case "す": stemChar = "し"; naiChar = "さ"; teSuffix = "して"; taSuffix = "した"; break;
    case "つ": stemChar = "ち"; naiChar = "た"; teSuffix = "って"; taSuffix = "った"; break;
    case "ぬ": stemChar = "に"; naiChar = "な"; teSuffix = "んで"; taSuffix = "んだ"; break;
    case "ぶ": stemChar = "び"; naiChar = "ば"; teSuffix = "んで"; taSuffix = "んだ"; break;
    case "む": stemChar = "み"; naiChar = "ま"; teSuffix = "んで"; taSuffix = "んだ"; break;
    case "る": stemChar = "り"; naiChar = "ら"; teSuffix = "って"; taSuffix = "った"; break;
    default: stemChar = "い"; naiChar = "わ"; teSuffix = "って"; taSuffix = "った";
  }

  return {
    masu: [base + stemChar + "ます"],
    mashita: [base + stemChar + "ました"],
    masen: [base + stemChar + "ません"],
    masenDeshita: [base + stemChar + "ませんでした"],
    shortNegative: [base + naiChar + "ない"],
    pastShort: [base + taSuffix],
    pastShortNegative: [base + naiChar + "なかった"],
    te: [base + teSuffix],
    teIru: [base + teSuffix + "いる"],
    teImasu: [base + teSuffix + "います"],
    teImasuNegative: [base + teSuffix + "いません"],
    stem: [base + stemChar],
  };
}

export function getVerbConjugations(dictionaryForm: string): ConjugationSet {
  const trimmed = dictionaryForm.trim();
  const group = getVerbGroup(trimmed);

  const result: ConjugationSet = {
    dictionary: [trimmed],
    masu: [], mashita: [], masen: [], masenDeshita: [],
    shortNegative: [], pastShort: [], pastShortNegative: [],
    te: [], teIru: [], teImasu: [], teImasuNegative: [], stem: [],
  };

  if (group === "unknown") return result;

  const formsToConjugate = [trimmed];
  const entry = VERB_MAP.get(trimmed);
  if (entry) {
    entry.kanji.forEach(k => { if (!formsToConjugate.includes(k)) formsToConjugate.push(k); });
    entry.kana.forEach(k => { if (!formsToConjugate.includes(k)) formsToConjugate.push(k); });
  }

  for (const form of formsToConjugate) {
    const formGroup = getVerbGroup(form);
    if (formGroup === "unknown") continue;

    const conj = conjugateSingle(form, formGroup);
    result.masu.push(...conj.masu);
    result.mashita.push(...conj.mashita);
    result.masen.push(...conj.masen);
    result.masenDeshita.push(...conj.masenDeshita);
    result.shortNegative.push(...conj.shortNegative);
    result.pastShort.push(...conj.pastShort);
    result.pastShortNegative.push(...conj.pastShortNegative);
    result.te.push(...conj.te);
    result.teIru.push(...conj.teIru);
    result.teImasu.push(...conj.teImasu);
    result.teImasuNegative.push(...conj.teImasuNegative);
    result.stem.push(...conj.stem);
  }

  const keys = Object.keys(result) as Array<keyof ConjugationSet>;
  for (const key of keys) {
    result[key] = Array.from(new Set(result[key]));
  }

  return result;
}

export function guessDictionaryForm(form: string): string[] | null {
  const trimmed = form.trim();
  if (!trimmed) return null;

  // Optimize guess by only checking verbs that share the same first character 
  // (or just check all kanji/kana forms if it's fast enough. Let's do a fast filter).
  const firstChar = trimmed[0];
  const candidates = dictionary.filter(entry => 
    entry.kanji.some(k => k.startsWith(firstChar)) || 
    entry.kana.some(k => k.startsWith(firstChar))
  );

  for (const entry of candidates) {
    const baseForms = [...entry.kanji, ...entry.kana];
    for (const base of baseForms) {
      if (!base.startsWith(firstChar)) continue;
      
      const conj = getVerbConjugations(base);
      const keys = Object.keys(conj) as Array<keyof ConjugationSet>;
      for (const key of keys) {
        if (key === 'dictionary') continue;
        if (conj[key].includes(trimmed)) {
          return [...entry.kanji, ...entry.kana];
        }
      }
    }
  }
  return null;
}
