# ai-gebruik-in-beeld

**AI-gebruik in je organisatie feitelijk meten: welke bronnen er zijn, wat elke bron wel en niet
bewijst, en hoe je de meting auditbaar vastlegt.** Voor de CISO en de functionaris
gegevensbescherming samen.

> **Lees het draaiboek online:** [security-commons-nl.github.io/ai-gebruik-in-beeld](https://security-commons-nl.github.io/ai-gebruik-in-beeld/)

Bijna elke publieke organisatie stelt nu AI-beleid vast, en vrijwel geen enkele weet op dat moment
wat er feitelijk gebeurt. Beleid zonder feitenbeeld is een aanname. Dit draaiboek sluit dat gat:
niet "hebben we AI-beleid?" maar "wat draait er, langs welke route, en kunnen we dat aantonen?"

De methode is dezelfde als in de bredere Security Commons-lijn: **meet voordat je ingrijpt, vertrouw
op data en niet op tekeningen, en "aangezet" is niet "beheerd".** De bevindingen komen uit
telemetrie en configuratie, niet uit een vragenlijst.

## Wat erin zit

- **[`draaiboek.md`](draaiboek.md)** — het volledige draaiboek: wat je vastlegt voordat je meet
  (twee regimes, aggregatieniveau, rollen), de bronnen en hun bewijslast, de portaalchecks, en de
  auditbare run-log.
- **[`queries/`](queries/)** — 15 herbruikbare KQL-query's voor Microsoft Advanced Hunting, van
  software-inventaris en netwerkverkeer tot ingebedde assistenten en directe API-toegang. Pas
  hostlijsten, procesnamen en domeinen aan op je eigen omgeving; de query's gebruiken placeholders.

## Belangrijk vooraf

Verkeersgegevens van medewerkers zijn persoonsgegevens, ook geaggregeerd. Dit onderzoek is geen jacht
op individuele gebruikers en geen prestatiemeting. De FG is mede-eigenaar vooraf, niet reviewer
achteraf. Toets het eigen IT-reglement, de BIO 2.0 en een eventueel medezeggenschapstraject voordat
je de eerste query draait. Het draaiboek werkt dat uit.

## Herkomst

Dit draaiboek is afgesplitst van
[Handelingsperspectief](https://github.com/security-commons-nl/Handelingsperspectief), waar het als
hoofdstuk begon maar uitgroeide tot een zelfstandig product met een eigen grondslag, bewijslast en
query-set. Handelingsperspectief blijft over de ClickFix-aanvalsvorm en het verhogen van de security
posture; dit gaat specifiek over zicht op AI-gebruik.

Open source onder EUPL v1.2.
