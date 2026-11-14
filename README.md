# KAPITÁL. – investiční landing page

Responzivní jednostránkový český web. Struktura se drží reference `https://investice.differentcars.eu`: navigace, hero, čtyři statistiky, čtyřkrokový postup, galerie, čísla a grafy, CTA, trh, interaktivní kalkulačka, tři karty, FAQ a poptávkový formulář.

## Spuštění

Otevřete `index.html`, nebo spusťte lokální server v adresáři projektu:

```bash
python3 -m http.server 8080
```

Poté otevřete `http://localhost:8080`.

## Funkce

- Funkční mobilní menu, navigace s kotvami, galerie se zvětšováním a navigací, FAQ, informační dialog o ochraně osobních údajů.
- Modelová kalkulačka 9 % p.a., 15 % daň z úroku, 12 čtvrtletních výplat za 3 roky; vstup 50 000–2 000 000 Kč.
- Ověření jména, telefonu, e-mailu, částky a souhlasu.
- Záměrně **bez fiktivního odesílání**: při prázdné konfiguraci se správně vyplněný formulář nikam neposílá. Zpráva přímo uvádí, že jde o ukázku.

## Připojení formuláře

V `config.js` lze doplnit `leadEndpoint` (HTTPS endpoint pro POST JSON + správné CORS) nebo `contactEmail` (otevře připravený e-mail přes `mailto:`). Před ostrým nasazením je nutné na endpointu implementovat validaci, ochranu proti spamu a GDPR dokumentaci.

## Data a obrázky

Jde o **grafický prototyp**, nikoli investiční nabídku. Čísla jsou modelová a nejsou založena na skutečných výsledcích jakékoli firmy. Fotografie se načítají z Unsplash; při nedostupnosti internetu se zobrazí lokální SVG zálohy. Pro produkční provoz se doporučuje licencované fotografie stáhnout a hostovat lokálně, doplnit provozovatele, podmínky a skutečné finanční údaje.

---

## Jesenická Vyhlídka (přestavba 14. 11. 2026)

Web byl přejmenován z „KAPITÁL." na **Jesenická Vyhlídka**. Rozložení (sekce, mřížky, komponenty) zůstalo původní, změnil se vzhled a obsah:

- Světlá verze: bílé a krémové pozadí, tmavý text, měděný akcent `#b98459` z Jesenické vyhlídky, Arial, velká písmena v nadpisech, logo hory. (Tmavá verze stylu byla nahrazena 14. 11. 2026.)
- Obsah podle https://www.jesenickavyhlidka.cz/: projekt, financování, zajištění, pásma 8/9/10 % p.a., FAQ, kontakty.
- Kalkulačka: 50 000 – 10 000 000 Kč, sazba podle pásma, kvartální výplata, 5 let, hrubě i po srážkové dani 15 %.
- Formulář otevře e-mail na info@arkemaxinvest.cz (`config.js`), nic se neukládá na server.
- Obrázky v `assets/` jsou ilustrační vizualizace, ne skutečné fotky stavby.
- IČO Jesenice Viewpoint s.r.o. je uvedeno podle ARES (19868901); původní web chybně uvádí 19505833, které patří ARKEMAX INVEST a.s.
- Náhled: konfigurace `jesenicka-hlavni` v `Arkemax/.claude/launch.json` (port 8754).

## Design podle investice.differentcars.eu (14. 11. 2026)

Vzhled je ve vrstvě `premium.css` (smazáním odkazu v `index.html` se web vrátí k jednoduché světlé verzi):

- Písmo Instrument Sans (Google Fonts), tučné bezpatkové nadpisy, žádná kurzíva.
- Bílé a jemně šedé sekce (`#ffffff`, `#f8f7f4`), světle měděná sekce pásem (`#f6ece2`).
- Měděný akcent `#b98459`, tlačítka a pole se zaoblením 6 px, karty 14 px, fotky a velké karty 20 px.
- V nadpisu úvodu zvýrazněný údaj „Zhodnocení 8–10 % ročně.“ v měděném bloku (jako „Pevný úrok 12 % ročně.“ na referenci).
- Předchozí patková „prémiová“ verze byla zamítnuta.

## Animace (14. 11. 2026)

- Příchod úvodu: fotka se pomalu přiblíží do klidu, měděný blok „Zhodnocení 8–10 % ročně.“ se rozjede zleva, text a tlačítka se objeví (CSS v `premium.css`).
- `animations.js`: dlaždice s čísly se dopočítají, sloupce obou grafů vyrostou, ukazatel postupu výstavby se naplní na 40 % – vždy jen jednou při zobrazení.
- Kalkulačka (`script.js`): výsledky se plynule přepočítají, při změně pásma se nová sazba krátce zvýrazní.
- Při systémovém omezení pohybu (prefers-reduced-motion) se nic neanimuje.
