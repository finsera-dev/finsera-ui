---
name: publiceren-op-main
description: Een afgeronde wijziging in finsera-ui controleren, committen en op main zetten, en de nieuwe commit-hash melden. Alleen gebruiken nadat Tomas om committen of pushen heeft gevraagd.
---

Afspraak van Tomas (2026-11-22): direct op `main`, geen branch of PR.

1. **Controle:** `npm run check` moet groen zijn (Stylelint, `node --test`, axe in licht/donker en desktop/mobiel). Faalt iets, repareer het; zet geen test of regel uit.
2. **Stand:** `git status` en `git diff`. Controleer dat er geen geheimen, klantdata of `test-results/` in zitten. Verspreide bestanden staan in `files` én `exports` van `package.json`.
3. **Identiteit:** `git config user.name` = `finsera-dev`, `git config user.email` = `info@finsera.nl`.
4. **Commit:** Nederlands bericht, eerste regel zegt wat er bij komt, korte opsomming van wat en waarom, en eindig met de regel uit de attributie-instructie van de sessie (`Co-Authored-By: …`).
5. **Push:** `git fetch`, dan `git pull --ff-only` als `origin/main` verder is, en `git push origin main`. **Nooit `--force`.** Laat een afgewezen push niet vallen op overschrijven: haal binnen en los het op.
6. **Meld:** `git rev-parse HEAD` als nieuwe hash (het Portaal pint op een hash), en wat er is toegevoegd, bewust weggelaten of nog open staat.

Niet zonder uitdrukkelijk akkoord van Tomas: een tag, versie-bump of `npm publish`. Niet doen: wijzigen in `finsera-kern`, `jaarrekening-ai` of `boekassistent`.
