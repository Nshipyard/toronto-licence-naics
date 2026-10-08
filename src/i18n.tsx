"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "fr";

const en = {
  banner: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or the City of Toronto.",
    badge: "Open source",
  },
  nav: { explorer: "Explorer", showcase: "Showcase", developers: "Developers", data: "Data", back: "All projects" },
  hero: {
    kicker: "Nshipyard Canada · Project 02",
    title: "Every Toronto business licence, mapped to its industry.",
    sub: "Toronto issues licences by local category names like “Eating or Drinking Establishment”. NAICS, the North American Industry Classification System that Statistics Canada uses to classify businesses, speaks a different language. This is the join: 37,469 active licences, 92 categories, each mapped to a NAICS 2022 code with a confidence rating.",
    cta1: "Explore the licences",
    cta2: "Read the methodology",
  },
  stats: [
    { value: "37,469", label: "active business licences, each mapped to a NAICS 2022 industry code" },
    { value: "92", label: "licence categories mapped, every one with a confidence rating and a written rule" },
    { value: "13", label: "NAICS sectors represented, from food services to finance" },
    { value: "25", label: "wards analyzed: which industry dominates each part of the city" },
  ],
  explorer: {
    kicker: "Explorer",
    title: "Search 37,469 active licences.",
    search: "Search by business name or licence number…",
    sector: "Industry sector",
    allSectors: "All sectors",
    cols: { business: "Business", category: "Licence category", naics: "NAICS", ward: "Ward", issued: "Issued" },
    showing: "Showing",
    of: "of",
    noResult: "No licences match.",
    empty: "Search by business name or licence number above, or filter by industry sector, to browse the active licence file.",
  },
  showcase: {
    kicker: "Showcase",
    title: "Where the licensed economy changes character.",
    body: "Food services dominate 23 of 25 wards. In two northwest wards, York Centre and Humber River-Black Creek, other services (personal care, parking, auto repair) take the lead instead. The raw licence file lists categories; it cannot tell you which industry defines a ward. This join can.",
    wardTitle: "Top industry sector per ward",
    wardSub: "Active licences by NAICS sector. Wards 6 and 7 are the only two where food services do not lead.",
    licences: "licences",
    growthTitle: "The fastest-growing licence categories since 2022",
    growthBody: "Licences issued per year: 2019-2021 average versus 2024-2026 average. Restaurants added 1,726 a year and take-out counters 1,578. Patio categories that barely existed before 2022, curb lane cafés and expanded patios, now issue hundreds a year.",
    perYear: "/yr",
    then: "2019-21",
    now: "2024-26",
  },
  methodology: {
    kicker: "Methodology",
    title: "How the mapping was built, and where it is weak.",
    items: [
      "Source: the City of Toronto open data file “Municipal Licensing and Standards - Business Licences and Permits”, retrieved 2026-10-08. 159,955 records, of which 37,469 are active.",
      "Active means the record carries no cancel date. A licence can be inactive in practice while its record lacks one, so counts are an upper bound.",
      "All 92 licence categories were mapped to NAICS 2022 by hand: 24 exact matches, 51 close matches, 15 at sector level only, 2 unmappable. Every row of the mapping table carries its confidence and its written rule.",
      "Coverage: 99.99% of active licences sit in a mapped category. The two unmapped categories are a permit with no business activity (noise exemption) and a source-system artifact (“Class record not on file”).",
      "5,424 active records (14.5%) carry no ward, so ward analysis covers the remaining 85.5%.",
      "Tow-truck licensing moved to the Province of Ontario in 2024, which is why all 4,848 tow-truck records are cancelled and the category shows zero active licences.",
    ],
  },
  developers: {
    kicker: "For developers",
    title: "Query it from code, or from an agent.",
    body: "Three consumption paths, same canonical data. REST for applications, OpenAPI for integration, MCP tools over streamable HTTP for AI agents.",
    endpoints: "Endpoints",
    tryIt: "Try it",
    openapi: "OpenAPI spec",
    mcpTitle: "MCP server",
    mcpBody: "One streamable-HTTP endpoint. Tools: licence_lookup, licence_search, licence_sectors.",
  },
  downloads: {
    kicker: "Data",
    title: "Take the files.",
    body: "The full category-to-NAICS table, MIT licensed, as CSV.",
    files: [
      { name: "licence_to_naics.csv", desc: "92 categories with NAICS codes, confidence, and mapping rules" },
    ],
    download: "Download",
  },
  footer: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or the City of Toronto.",
    sources: "Licence source: City of Toronto Open Data (Municipal Licensing and Standards). Industry structure: Statistics Canada, NAICS 2022.",
  },
};

export type Dict = typeof en;

const fr: Dict = {
  banner: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    badge: "Code source ouvert",
  },
  nav: { explorer: "Explorateur", showcase: "Vitrine", developers: "Développeurs", data: "Données", back: "Tous les projets" },
  hero: {
    kicker: "Nshipyard Canada · Projet 02",
    title: "Chaque permis d'entreprise de Toronto, relié à son industrie.",
    sub: "Toronto délivre des permis sous des noms locaux comme « Eating or Drinking Establishment ». Le SCIAN, le Système de classification des industries de l'Amérique du Nord qu'utilise Statistique Canada pour classer les entreprises, parle un autre langage. Voici la jointure : 37 469 permis actifs, 92 catégories, chacune reliée à un code SCIAN 2022 avec un niveau de confiance.",
    cta1: "Explorer les permis",
    cta2: "Lire la méthodologie",
  },
  stats: [
    { value: "37 469", label: "permis d'entreprise actifs, chacun relié à un code d'industrie SCIAN 2022" },
    { value: "92", label: "catégories de permis reliées, chacune avec un niveau de confiance et une règle écrite" },
    { value: "13", label: "secteurs du SCIAN représentés, des services alimentaires à la finance" },
    { value: "25", label: "arrondissements analysés : quelle industrie domine chaque partie de la ville" },
  ],
  explorer: {
    kicker: "Explorateur",
    title: "Recherchez parmi 37 469 permis actifs.",
    search: "Rechercher par nom d'entreprise ou numéro de permis…",
    sector: "Secteur d'industrie",
    allSectors: "Tous les secteurs",
    cols: { business: "Entreprise", category: "Catégorie de permis", naics: "SCIAN", ward: "Arrondissement", issued: "Délivré" },
    showing: "Affichage de",
    of: "sur",
    noResult: "Aucun permis ne correspond.",
    empty: "Recherchez par nom d'entreprise ou numéro de permis ci-dessus, ou filtrez par secteur d'industrie, pour parcourir le fichier des permis actifs.",
  },
  showcase: {
    kicker: "Vitrine",
    title: "Là où l'économie des permis change de visage.",
    body: "Les services alimentaires dominent 23 arrondissements sur 25. Dans deux arrondissements du nord-ouest, York-Centre et Humber River-Black Creek, ce sont plutôt les autres services (soins personnels, stationnement, réparation automobile) qui mènent. Le fichier brut des permis énumère des catégories; il ne peut pas dire quelle industrie définit un arrondissement. Cette jointure le peut.",
    wardTitle: "Premier secteur d'industrie par arrondissement",
    wardSub: "Permis actifs par secteur du SCIAN. Les arrondissements 6 et 7 sont les deux seuls où les services alimentaires ne mènent pas.",
    licences: "permis",
    growthTitle: "Les catégories de permis à la croissance la plus rapide depuis 2022",
    growthBody: "Permis délivrés par année : moyenne 2019-2021 contre moyenne 2024-2026. Les restaurants ont gagné 1 726 permis par an et les comptoirs à emporter 1 578. Des catégories de terrasses qui existaient à peine avant 2022, les cafés en couloir et les terrasses agrandies, en délivrent maintenant des centaines par an.",
    perYear: "/an",
    then: "2019-21",
    now: "2024-26",
  },
  methodology: {
    kicker: "Méthodologie",
    title: "Comment la table a été construite, et où elle est faible.",
    items: [
      "Source : le fichier de données ouvertes de la Ville de Toronto « Municipal Licensing and Standards - Business Licences and Permits », récupéré le 2026-10-08. 159 955 dossiers, dont 37 469 actifs.",
      "Actif signifie que le dossier ne porte aucune date d'annulation. Un permis peut être inactif en pratique sans que son dossier l'indique, donc les chiffres sont une borne supérieure.",
      "Les 92 catégories de permis ont été reliées au SCIAN 2022 à la main : 24 correspondances exactes, 51 proches, 15 au niveau du secteur seulement, 2 non reliables. Chaque ligne de la table porte son niveau de confiance et sa règle écrite.",
      "Couverture : 99,99 % des permis actifs sont dans une catégorie reliée. Les deux catégories non reliées sont un permis sans activité commerciale (exemption de bruit) et un artefact du système source (« Class record not on file »).",
      "5 424 dossiers actifs (14,5 %) ne portent aucun arrondissement; l'analyse par arrondissement couvre donc les 85,5 % restants.",
      "La délivrance des permis de remorquage est passée à la province de l'Ontario en 2024, ce qui explique que les 4 848 dossiers de remorquage soient tous annulés et que la catégorie affiche zéro permis actif.",
    ],
  },
  developers: {
    kicker: "Pour les développeurs",
    title: "Interrogez-la depuis du code, ou depuis un agent.",
    body: "Trois façons de consommer les mêmes données canoniques. REST pour les applications, OpenAPI pour l'intégration, outils MCP en HTTP continu pour les agents IA.",
    endpoints: "Points de terminaison",
    tryIt: "Essayer",
    openapi: "Spécification OpenAPI",
    mcpTitle: "Serveur MCP",
    mcpBody: "Un point de terminaison HTTP continu. Outils : licence_lookup, licence_search, licence_sectors.",
  },
  downloads: {
    kicker: "Données",
    title: "Prenez les fichiers.",
    body: "La table complète catégories-vers-SCIAN, sous licence MIT, en CSV.",
    files: [
      { name: "licence_to_naics.csv", desc: "92 catégories avec codes SCIAN, niveaux de confiance et règles de correspondance" },
    ],
    download: "Télécharger",
  },
  footer: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    sources: "Source des permis : Données ouvertes de la Ville de Toronto (Municipal Licensing and Standards). Structure des industries : Statistique Canada, SCIAN 2022.",
  },
};

const dicts: Record<Lang, Dict> = { en, fr };

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t: dicts[lang] }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}
