# 08 · AI-gebruik in beeld brengen

Bijna elke organisatie stelt nu AI-beleid vast, en vrijwel geen enkele weet op dat moment wat er feitelijk
gebeurt. Dit hoofdstuk is het draaiboek voor dat feitenbeeld: welke bronnen er zijn, wat elke bron wel en
niet bewijst, en hoe je de meting auditbaar vastlegt. Voor de CISO en de functionaris gegevensbescherming
samen, want zonder die tweede handtekening is dit onderzoek niet verdedigbaar.

> Gegeneraliseerd uit een concrete gemeentelijke casus. Alle query's staan in [`queries/`](queries/); pas
> hostlijsten, procesnamen en domeinen aan op je eigen omgeving.

## A. Vier dingen vastleggen voordat je meet

1. **Twee vragen, twee regimes.** *Actief gebruik door medewerkers* is een personeelsvraag (IT-reglement,
   medezeggenschap, proportionaliteit). *Ingebedde of default-on AI die de leverancier zelf aanzet* is een
   contractvraag (verwerkersovereenkomst, DPIA, leveranciersbeheer). Andere detectie, andere grondslag. Het
   tweede regime wordt bijna altijd vergeten en levert vaak de scherpste bevindingen op.
2. **Het aggregatieniveau.** Fase 1 geaggregeerd: per dienst, per apparaataantal, hooguit per
   organisatieonderdeel met een ondergrens. Geen individuele accounts in het resultaat. Zodra je individuen
   kunt aanwijzen verandert de aard van het onderzoek en horen daar aparte waarborgen bij.
3. **De rollen.** De FG is mede-eigenaar vooraf, geen reviewer achteraf. Informeer de medezeggenschap, ook
   als formeel advies niet nodig is. Kondig de meting aan bij de beheerders wier omgeving je bevraagt.
4. **Wat het onderzoek niet is.** Geen jacht op individuele overtreders, geen prestatiemeting, geen
   incidentonderzoek. Zet die zin in de aankondiging en herhaal hem in de rapportage.

<!-- site:callout -->
> Verkeersgegevens van medewerkers zijn persoonsgegevens, ook geaggregeerd. Toets het eigen IT-reglement,
> de BIO2 en een eventueel medezeggenschapstraject voordat je de eerste query draait.

## B. Rechten en bronnen

Alles in dit hoofdstuk is **read-only**. Geen enkele stap vraagt schrijfrechten, en dat maakt de aanvraag bij
de eigen IT-organisatie haalbaar.

| Rol | Waarvoor |
|---|---|
| Security Reader of Defender XDR-leesrol | Advanced Hunting op de device-tabellen |
| Global Reader | Enterprise applications, consent, accounts als noemer |
| Purview: View-Only Audit Logs, Activity Explorer | Classificatie- en DLP-stand |
| Leesrechten beheerportaal | Geïntegreerde apps, licenties, agents, organisatie-instellingen |

De bronnen liggen in drie lagen. Elke laag levert zelfstandig een rapporteerbaar resultaat, dus er is geen
licentieniveau waar dit onderzoek op staat of valt.

| Laag | Bron | Drempel | Levert |
|---|---|---|---|
| **0. Beheer en configuratie** | Beheerportaal, identiteitsbeheer | Leesrechten, geen extra licentie | Governance-feiten, direct rapporteerbaar |
| **1. Endpointtelemetrie** | Advanced Hunting: netwerk, processen, bestanden, software-inventaris | Endpointbescherming in het plan waar Advanced Hunting in zit | Gebruiksbeeld: welke diensten, hoeveel apparaten |
| **2. Cloud-app- en datalaag** | Cloud-app-security, classificatie en DLP, postvaktoegang | Aanvullende modules of hoger plan | Verdieping en dienstzijdige aantallen |

Heb je laag 1 of 2 niet, dan blijft het onderzoek uitvoerbaar: proxy-, firewall- of DNS-logging beantwoordt
dezelfde vraag (hoofdstuk 04), laag 0 levert al een compleet governance-hoofdstuk, en je kunt de meting bij
je werkplekleverancier beleggen. Dat laatste is meteen een regietoets.

## C. Vier blokker-checks vooraf (een kwartier)

Wie deze overslaat, ontdekt na drie dagen dat een deel niet kon. Draai ze eerst en noteer de uitkomst.

1. **Kan ik Advanced Hunting draaien, en op welk account?** Sommige tabellen lossen niet op vanaf een gewoon
   account. Test met [`ai-probe-bronnen.kql`](queries/ai-probe-bronnen.kql).
2. **Wat is de bron van de cloud-app-cijfers?** Als die uit een andere integratie komen dan je
   endpointtelemetrie, meet je twee verschillende populaties.
3. **Bestaat endpoint-DLP?** Zo niet, dan vervalt de hele datalaag en is dat zelf de bevinding.
4. **Wat is mijn noemer?** Aantal beheerde apparaten en actieve accounts, uit dezelfde populatie als je
   teller. Zonder noemer is elk absoluut getal stuurloos.

## D. De bewijslast per vraag

De laatste kolom is de belangrijkste: die beschermt je tegen een lezer die meer in je cijfer leest dan erin
zit.

| Vraag | Bron | Draagt | Draagt niet |
|---|---|---|---|
| Welke AI-diensten, hoe breed? | Netwerkgebeurtenissen | Aantal apparaten per dienst, verhoudingen | Wie, hoe vaak per persoon, wat ingevoerd is |
| Via welke software? | Netwerk plus proces | Browser, desktop-app, CLI, kantoorsoftware | Of er bedrijfsdata in gaat |
| Draait er AI-software lokaal? | Software-inventaris, procesgebeurtenissen | Wat geïnstalleerd is en waar | Of het gebruikt wordt |
| Gaat er inhoud naar buiten? | Verkeer naar bestands- en uploadhosts | Dat er bestandsverkeer is | Welke bestanden, welke gevoeligheid |
| Programmatisch of via de website? | Verkeer naar API-endpoints | Onderscheid casual gebruik en integratie | Wat de integratie doet |
| Zit AI in browserextensies? | Extensie-inventaris, anders bestandssporen | Welke extensies aanwezig zijn | Wat de extensie met pagina-inhoud doet |
| Leest een assistent mee in de mail? | Postvaktoegang per applicatie | Welke applicaties postvakken benaderen | De inhoud van wat gelezen is |
| Kan een gebruiker zelf AI toevoegen? | Beheerportaal: apps, zelfbediening | Hard governance-feit | Niets over feitelijk gebruik |
| Bestaan er AI-agents, wie beheert ze? | Beheerportaal: agentoverzicht | Aantal, herkomst, eigenaarloosheid | Het risico per agent |
| Wat zette de leverancier zelf aan? | Detailscherm per agent of dienst | Dat activering buiten de organisatie om ging | Of er data mee verwerkt is |
| Hoeveel AI is ingekocht? | Beheerportaal: licenties | Verschil tussen betaald en gebundeld | Wie ze gebruikt |
| Ligt er classificatie en DLP onder? | Purview | Het fundament onder elke datauitspraak | Of er data is weggelekt |

## E. Laag 0: de portaalchecks

Een dagdeel klikwerk, en het deel van de rapportage dat het snelst tot besluiten leidt. Noteer per check het
menupad en de datum, want paden wijzigen.

| Check | Wat je noteert | Waarom het telt |
|---|---|---|
| Geïntegreerde apps en add-instore | Aantal uitgerold en aantal installeerbaar | Open store met lege blokkeerlijst betekent dat iedereen zelf AI kan toevoegen |
| Zelfbediening apps en licenties | Aan of uit | Verklaart doorgaans wat je bij de vorige check aantreft |
| AI-agents | Aantal, gesplitst naar eigen bouw en leverancier | Schaduw-automatisering die in geen enkel register staat |
| Agents zonder eigenaar | Aantal en herkomst | Eigenaarloos betekent onbeheerd, ongeacht het aantal |
| Herkomst leverancier-agents | Wie activeerde, blijkens het detailscherm | "Niemand, de leverancier deed het" is een contractbevinding |
| Licenties | Betaald tegenover gebundeld | Voorkomt de conclusie dat massaal is ingekocht wat gewoon aanstond |
| Consent en applicatietoegang | Apps met verstrekkende rechten, wie consent mag geven | De directe route naar tenantdata |
| Classificatie en DLP | Labels, endpoint-DLP, koppeling | Zonder dit is elke uitspraak over gevoelige data een aanname |
| Noemer | Actieve accounts, beheerde apparaten, geblokkeerd deel | De deler voor elk percentage |

## F. De query's

Vijftien query's in [`queries/`](queries/), met per bestand het doel, de vereisten en de bewuste
beperkingen in de kop. Draai ze in deze volgorde:

1. **Fundament.** `ai-probe-bronnen` en `ai-noemer-apparaten`: wat is haalbaar, en wat is mijn deler.
2. **Basisbeeld.** `ai-diensten-netwerk` (welke diensten, hoeveel apparaten), `ai-diensten-per-proces` (via
   welke software), `ai-contentverkeer` (gaat er inhoud heen), `ai-directe-api` (integratie of website),
   `ai-software-inventaris` (wat staat geinstalleerd).
3. **Ingebedde AI.** `ai-ingebedde-assistent-schoon` en `ai-assistent-interacties` scheiden de assistent van
   je eigen platform van gebruikersgedrag; `ai-office-apps-naar-ai` zoekt add-ins in kantoorsoftware.
4. **Losse bronnen.** `ai-browserextensies` en `ai-mailtoegang-apps`.
5. **Splitsing.** `ai-organisatie-splitsing` voor een gedeelde tenant, `ai-afdelingsclustering` voor adoptie
   per onderdeel met een ondergrens. Die tweede rekent tussentijds op accountniveau: alleen draaien met een
   afspraak met de FG.
6. **Controle.** `ai-volledigheidssweep` over circa zestig diensten: heb je iets gemist.

## G. Leg elke run vast

Een getal zonder herkomst is een mening. Nummer query's en portaalchecks in aparte reeksen en noteer de
kanttekening op het moment zelf; achteraf reconstrueren lukt zelden.

| Nr | Datum | Account | Vraag | Methode | Uitkomst | Export | Kanttekening |
|---|---|---|---|---|---|---|---|
| R1 | | normaal of beheer | Welke diensten? | Query, 30 dagen | verwijzing | bestandsnaam met datum | venster, filters, uitsluitingen |
| C1 | | | Add-instore open? | Portaalcheck met menupad | getal | schermafdruk | pad kan gewijzigd zijn |

Dit maakt de meting herhaalbaar, overdraagbaar en verdedigbaar, en het dwingt tot eerlijkheid over
mislukkingen. Een query die omviel of een duiding die je moest terugnemen hoort er net zo goed in als een
treffer.

## H. Valkuilen

- **Systeemprocessen blazen je beeld op.** De ingebedde assistent van het platform praat continu met zijn
  eigen diensten. Filter die processen expliciet uit en schrijf op dat je dat deed.
- **Niet alles wat naar een AI-domein gaat is AI-gebruik.** Trackingpixels in nieuwsbrieven lijken op een
  AI-integratie in je mailclient. Toets op het startende proces voordat je duidt.
- **Vertrouw je eigen omgeving boven een zoekmachine.** Producten met vergelijkbare namen bestaan volop; een
  webzoekopdracht levert plausibele maar foute duidingen. Controleer de identiteit in de tenant.
- **De meetbron kan tussen twee rondes veranderen.** Een inventaris die eerst leeg was en nu gevuld, is geen
  toename in gebruik. Noteer de staat van de bron per ronde.
- **Verbindingen zijn geen gebruikers.** Eén open tabblad telt zwaarder dan tien incidentele gebruikers.
  Apparaataantal is de breedtemaat.
- **Aan is niet beheerd.** De kernbevinding is meestal niet hoeveel er wordt gebruikt, maar dat niemand
  eigenaar is van de laag waarin het gebeurt. Zie hoofdstuk 01, principe 3.

## I. Wat niet werkt, en dat scheelt je een dag

De verleiding is groot om via de dataclassificatietabellen te willen aantonen dat er gevoelige bestanden naar
AI gaan. Dat lukt niet: gebeurtenissen over gevoelige bestandstoegang zijn zonder classificatiefundament niet
interpreteerbaar, en het proces dat een bestand leest zegt niets over waar dat bestand daarna heen gaat. Wat
er wel is: het uploadsignaal uit `ai-contentverkeer.kql` als indicatie, en de vaststelling dat er geen
classificatie ligt als bevinding op zichzelf. Die tweede is bestuurlijk sterker dan een halfbakken cijfer.

## J. Rapporteren

Zet vier beperkingen in hetzelfde hoofdstuk als de methode, niet in een voetnoot: het **meetvenster** is een
momentopname, de **populatie** is het beheerde deel (onbeheerde apparaten leveren niets), de **inhoud is niet
gemeten**, en er is **geen individuele attributie**. Dat laatste is een kwaliteit, geen tekortkoming.

Zet de bevindingen daarna in het IST naar SOLL-sjabloon uit hoofdstuk 01, met een actiehouder per regel.

| Bevinding | Richting |
|---|---|
| Brede publieke AI in gebruik, geen alternatief aangewezen | Wijs eerst een voorziening aan, blokkeer daarna. Blokkeren zonder alternatief verplaatst het gebruik naar privéapparatuur en maakt het onzichtbaar |
| App- of add-instore open | Blokkeerlijst inrichten, zelfbediening heroverwegen, eigenaar beleggen |
| Agents zonder eigenaar of door de leverancier geactiveerd | Eigenaarschap beleggen, activering agenderen als contract- en releasevraag |
| Geen classificatie of DLP | Fundamentkeuze op directieniveau; dit blokkeert vrijwel elke verdere AI-maatregel |
| Geen AI-register of aangewezen diensten in het beleid | Zolang niets is aangewezen is niets geautoriseerd. Vermijd het woord "toegestaan" en schrijf op wat er feitelijk staat |

**Advies:** rapporteer de governance-bevindingen uit laag 0 vóór de volumecijfers uit laag 1. Ze zijn harder,
ze zijn direct te herstellen, en ze verleiden niet tot een discussie over de precisie van een getal. Plan
meteen de tweede ronde: twee metingen met dezelfde methode zijn een trend, twee met verschillende methoden
zijn twee momentopnamen die elkaar tegenspreken.
