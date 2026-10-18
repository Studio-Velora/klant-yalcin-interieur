# Bouwprompt — Website Yalcin Tapijt & Woninginrichting

> Kopieer onderstaande tekst (alles vanaf "OPDRACHT") in één keer in een nieuwe chat.
> Het beschrijft de complete website zodat die in één keer gebouwd kan worden.

---

## OPDRACHT

Bouw een complete, premium meerpagina-website voor **Yalcin Tapijt & Woninginrichting**, een familiebedrijf en interieurspecialist in Den Haag. Het bedrijf is reseller van o.a. Lifestyle Interior (by Headlam). Specialismen: **vloeren (PVC, laminaat, tapijt)** en **traprenovatie**; daarnaast gordijnen, raamdecoratie en complete woninginrichting.

### Sfeer & uitstraling (heel belangrijk)
- **Licht van kleur** — gebroken wit / zand als basis. Warm, rustig, editorial, tijdloos en luxe.
- **Mag absoluut NIET op een standaard "AI-website" lijken.** Dus: **geen emoji's**, geen overdreven gradients, geen generieke containers met rounde hoekjes + gekleurde linkerrand, geen Inter/Roboto/Arial.
- Eén warme accentkleur: **terracotta / klei**. Warm bijna-zwart alleen voor tekst, nooit als dominante vlakvulling.
- Veel witruimte, royale typeschalen (clamp), rustige ritmiek.

### Typografie
- Display/koppen: **Playfair Display** (met cursieve accenten in terracotta voor sleutelwoorden).
- UI/lopende tekst: **Manrope**.
- Eyebrow-labels: kleine hoofdletters, letterspacing, terracotta, met een streepje ervoor.

### Techniek & opzet
- Statische HTML/CSS/JS, geen build-stap. Gedeelde `styles.css` + `main.js`.
- Vanilla JS voor alle interactie (geen frameworks).
- Volledig responsive; mobiel hamburger-menu met slide-in panel.
- Nederlands. SEO-meta + JSON-LD `HomeGoodsStore` schema. Favicon (terracotta "Y").
- Toegankelijk en `prefers-reduced-motion`-vriendelijk.

### Animatie (premium maar ingetogen)
- Scroll-reveals (IntersectionObserver), zachte parallax op beelden.
- Hero: word-by-word text-reveal (omhoog schuiven).
- Count-up tellers, micro-interacties op knoppen/kaarten (pijl schuift, kaart licht op).
- Niets dat oneindig knippert of afleidt.

### Beeldsysteem (cruciaal)
- Gebruik **nette placeholders** met een diagonale textuur en een **zichtbaar bestandspad-label** (bijv. `dienst — traprenovatie`).
- Bouw een **auto-upgrade systeem**: elke placeholder heeft `data-src="assets/photo/<naam>.jpg"`. Zodra dat bestand bestaat, vervangt JS de placeholder automatisch door de foto (cover). Idem optioneel `data-video-src` voor de hero (autoplay, muted, loop).
- Verzin/teken zelf GEEN beelden. Laat placeholders staan tot de klant echte foto's aanlevert.

---

## PAGINA'S

### 1. Landingspagina (`index.html`)
In deze volgorde:

1. **Kortingsbalk** bovenaan (dun, terracotta, wegklikbaar + onthouden via localStorage):
   *"Tijdelijke actie — Bij elke laminaat- of PVC-vloer nu gratis plinten naar keuze. Vraag ernaar bij uw offerte."*
2. **Sticky nav** — merknaam "Yalcin / Den Haag", links (Over ons, Diensten, Projecten, Werkwijze, Contact), telefoonnummer, en primaire knop **Offerte aanvragen**. Krijgt achtergrond/blur bij scrollen.
3. **Hero** — eyebrow, grote kop *"Vakmanschap voor uw interieur"* (met "interieur" cursief terracotta, word-reveal), subtekst, twee knoppen (Offerte aanvragen + Bekijk projecten), sterren-trust-regel. Rechts groot hero-beeld (video-slot) met play-overlay en een drijvend badge "20+ jaar ervaring" (count-up).
4. **Marquee** — doorlopende band met diensttermen.
5. **Over ons** — twee kolommen: beeld (met inset-detailbeeld) + tekst over familiebedrijf, plus 4 waarden (Persoonlijke service, Echt vakmanschap, Oog voor detail, Volledige ontzorging).
6. **Diensten** — raster van kaarten met nummer, beeld, titel, tags en link: Vloeren, Traprenovatie, Gordijnen, Raamdecoratie, Complete woninginrichting + één donkere "Niet zeker wat u nodig heeft?"-kaart met gratis-advies-CTA. Elke dienst linkt naar zijn detailpagina.
7. **Projecten** — filterbare masonry-grid (filters: Alles, Vloeren, Trappen, Gordijnen, Complete interieurs). Kaarten met hover-overlay (categorie + titel), linken naar detailpagina's.
8. **Waarom Yalcin** — donkere sectie met genummerde lijst (Persoonlijk advies, Vakkundige montage, Hoogwaardige materialen, Betrouwbare planning, Complete ontzorging) + twee parallax-beelden.
9. **Reviews** — slider met **echte Google-recensies** (zie onderaan), sterren, auteur, autoplay + dots + pijlen.
10. **Werkwijze** — verticale tijdlijn met 5 stappen (Advies → Inmeten → Offerte → Uitvoering → Oplevering); dots vullen zich bij in-view.
11. **Contact** — donkere sectie: adres/telefoon/WhatsApp/e-mail/openingstijden + ingesloten Google Maps-kaart (licht gesepia'd). Knoppen Offerte aanvragen + Bel direct.
12. **CTA-banner** — afsluitende oproep.
13. **Footer** — donker, vier kolommen (intro, Diensten, Menu, Contact) + onderbalk met © en links naar **Privacyverklaring** en **Algemene voorwaarden**.
14. **Cookie-popup** (zie hieronder).

### 2. Projectdetailpagina's (`projecten/<dienst>.html`) — 5 stuks
Voor: vloeren, traprenovatie, gordijnen, raamdecoratie, woninginrichting. Per pagina:
- Breadcrumb, eyebrow, grote titel, lead, meta-regels (materialen/inclusief/regio), groot herobeeld (parallax).
- **Voor/na-slider** (sleepbaar, "Voor"/"Na" labels, ronde knop).
- Twee editorial-blokken (beeld + tekst, om-en-om), met een feature-lijst.
- Galerij-grid (eerste beeld breed).
- "Andere diensten"-kaarten (cross-links).
- Afsluitende CTA-banner.
Gebruik per dienst passende, specifieke teksten (geen filler).

### 3. Offerte-wizard (`offerte.html`) — pronkstuk
Meerstaps, slim en conditioneel. Links een donkere rail met stappen-indicator + "liever bellen"-blok; rechts het formulier. Mobiel: compacte voortgangsbalk.

**Stap 1 — Dienst:** selecteerbare kaarten (meerdere tegelijk mogelijk).

**Stap 2 — Details:** per gekozen dienst een paneel met gerichte vragen. **Je moet meerdere producten per dienst kunnen toevoegen** via "+ Nog een … toevoegen" (elk item heeft eigen, onafhankelijke velden en een "Verwijderen"-knop met hernummering). Voorbeeld: iemand kan een **dichte trap van 15 treden én een open trap van 15 treden** los opgeven.
- **Vloeren:** type (PVC/Laminaat/Tapijt/Weet ik niet, meerkeuze), aantal ruimtes (stepper), oppervlakte m², huidige vloer verwijderen (ja/nee), **ondervloer/egaliseren** (ja/nee/geen idee).
- **Traprenovatie:** aantal treden (stepper), type trap (dicht/open), afwerking (hout/laminaat/pvc/tapijt-loper), trapwangen meenemen (ja/nee), stootborden meenemen (ja/nee), **ondervloer meenemen** (ja/nee, bij tapijt/loper), extra's (LED/anti-slip/leuning).
- **Gordijnen:** type (inbetweens/over/vouw), aantal ramen, rails aanwezig, afmetingen.
- **Raamdecoratie:** type (jaloezieën/shutters/rolgordijnen/plissé), aantal ramen, bediening.
- **Complete woninginrichting:** onderdelen + vrije omschrijving.

**Stap 3 — Planning:** gewenste termijn, budgetindicatie, opmerkingen.
**Stap 4 — Uw gegevens:** naam, telefoon, e-mail (verplicht + validatie), adres/postcode/plaats (optioneel).
**Stap 5 — Overzicht:** nette samenvatting van alle diensten (incl. meerdere items per dienst, bijv. "Traprenovatie (2×)" met Trap 1 / Trap 2 apart), met "Wijzig"-knoppen die terugspringen. Daarna verzenden → success-scherm met getekende vinkje-animatie.
- Verzending via **Web3Forms** (access key bovenin het script invulbaar). Zonder key: demo-modus die success simuleert.

### 4. Privacyverklaring (`privacy.html`)
Volledige, **AVG/GDPR-conforme** privacyverklaring voor Nederland, met sticky inhoudsopgave: verwerkingsverantwoordelijke, welke gegevens, doeleinden & grondslagen, bewaartermijnen, delen met derden (Web3Forms, Google Maps), cookies, rechten van betrokkenen, beveiliging, klacht bij Autoriteit Persoonsgegevens, contact.

### 5. Algemene voorwaarden (`voorwaarden.html`)
Verzin zelf nette, realistische voorwaarden (met disclaimer "laat controleren door jurist"), genummerde artikelen: toepasselijkheid, offertes, totstandkoming, inmeten & maatvoering, prijzen & betaling, uitvoering, levering & planning, annulering, garantie & klachten, aansprakelijkheid, toepasselijk recht (Nederlands, Den Haag).

---

## COOKIE-POPUP
Linksonder, zachte slide-in na ~1s. Titel "Cookies", korte uitleg (alleen functioneel + met toestemming verbeterend), link naar privacyverklaring. Twee knoppen: **Accepteren** en **Alleen functioneel**. Keuze onthouden in localStorage; daarna niet meer tonen.

---

## ECHTE GEGEVENS (gebruiken, niet verzinnen)
- **Naam:** Yalcin Tapijt & Woninginrichting (tapijtenwinkel in Den Haag)
- **Adres:** Apeldoornselaan 243, 2573 LJ Den Haag (provincie Zuid-Holland)
- **Telefoon:** 070 390 7020
- **Openingstijden:** ma–za, 09:00–18:00
- **Waardering:** 5.013 reviews, overwegend 5 sterren (Google)

## ECHTE GOOGLE-REVIEWS (in de reviews-slider)
1. **Wouter Helmig** — "Fantastische ervaring, onze trap is erg mooi geworden, super service en niet duur." (Traprenovatie)
2. **Amanda Weeda** — "Hele fijne service. De mensen die er werken zijn erg vriendelijk en helpen je waar ze kunnen. Laminaat vloer is prachtig geworden." (Laminaatvloer)
3. **Adam Michalik** — "Ruime keuze aan materialen, goede prijzen en snelle levering. Het tapijt werd netjes en professioneel gelegd, twee verdiepingen wenteltrap binnen 5–6 uur. Een echte aanrader!" (Traptapijt)
4. **Juul Tulipalo** — "Voor de tweede keer een hele goede ervaring. Mooie materialen, goed gelegd, vriendelijke hulp in de winkel. Echt top." (Terugkerende klant)
5. **Ingrid van Lieshout** — "Voor de derde keer een vloer gekocht bij hun. Goede service, ze denken echt mee. Ook mijn derde woning ziet er weer super uit." (Vloeren)
6. **Samantha van der Wiel** — "Wat een super bedrijf. Echt een aanrader, goede prijs-kwaliteitverhouding en hele vriendelijke mensen. Gewoon doen." (Local Guide)

---

## PRIMAIRE CONVERSIE
Overal terugkerende hoofd-CTA: **Offerte aanvragen** (linkt naar de offerte-wizard).

## OPLEVERING
- Bestandsstructuur: `index.html`, `offerte.html`, `privacy.html`, `voorwaarden.html`, `projecten/*.html`, gedeelde `styles.css` + `main.js` + losse css/js voor offerte/project/legal, `favicon.svg`, en map `assets/photo/` + `assets/video/` voor beelden.
- Alle placeholders met duidelijke padlabels zodat de klant later zelf foto's kan toevoegen.
- Geen console-fouten; controleer de volledige offerte-flow (incl. meerdere items per dienst) end-to-end.
