# SAP PACE

A CAP (SAP Cloud Application Programming Model) service for a **service catalog** and **project request** workflow:

- **Service Catalog** – maintainable list of SAP BTP services with plan coverage, technical features, cost metric, and SAP indicative monthly cost.
- **Project Requests** – a request captures project details, a list of required technical features, and a selection of catalog services with quantities; the estimated monthly cost per selected service is calculated automatically.

## Tech stack

| | |
|---|---|
| Runtime | Node.js, `@sap/cds` 9 |
| DB (local) | SQLite (`@cap-js/sqlite`) |
| DB (deployed) | SAP HANA Cloud (`@cap-js/hana`), HDI container |
| Auth (deployed) | XSUAA (`@sap/xssec`) |
| Packaging | MTA (`mta.yaml`) for Cloud Foundry |

## Project layout

```
db/
  schema.cds                 domain model
  data/*.csv                 seed data (loaded on deploy)
srv/
  catalog-service.cds        the "Catalog" OData V4 service
  test/http/                 REST Client / JetBrains .http test suites
mta.yaml                     Cloud Foundry deployment descriptor
xs-security.json             XSUAA config
```

## Domain model (`db/schema.cds`)

- **`Services`** – catalog entries. `imc` (SAP Indicative Monthly Cost) is currency-tagged via `@Measures.ISOCurrency`; `status` boolean = Active/Inactive.
- **`ProjectRequests`** – request header. `type` and `market` are associations to the **`ProjectTypes`** / **`Markets`** code lists (`sap.common.CodeList`). `features` and `services` are **compositions** (deep insert/update, cascade delete).
- **`RequestFeatures`** – technical features entered on a request.
- **`RequestServices`** – catalog services selected on a request.
  - `service` association has `@assert.target` → a non-existent `service_ID` is rejected with `400 ASSERT_TARGET`.
  - `estMonthlyCost = noOfmetrics * service.imc` is an **on-read calculated element** (computed in the DB view; not recomputed in a CREATE response — read the entity back to see it).

## Service (`srv/catalog-service.cds`)

OData V4 at **`/odata/v4/catalog`**:

| Entity | Notes |
|---|---|
| `Services` | full CRUD |
| `ProjectRequest` | projection of `ProjectRequests`; children via `$expand=features,services` or navigation |
| `ProjectTypes` | `@readonly` – dropdown list for `type` |
| `Markets` | `@readonly` – dropdown list for `market` |

`type` / `market` are annotated `@Common.ValueListWithFixedValues`, so `$metadata` drives a fixed dropdown in Fiori with no UI-side config.

## Scripts (`package.json`)

| Script | Command | Purpose |
|---|---|---|
| `npm start` | `cds-serve` | run the service |
| `npm run deploy:local` | `cds deploy --to sqlite:db.sqlite` | (re)create + seed the local SQLite DB |
| `npm run deploy:cf` | `mbt build && cf deploy mta_archives/SAP_PACE_1.0.0.mtar --retries=0` | build the MTA and deploy to Cloud Foundry |

## Getting started

```bash
npm install
npm run deploy:local   # create db.sqlite with seed data
npm start              # -> http://localhost:4004
```

Use `npx cds watch` instead of `npm start` for live reload during development (it also auto-reseeds on model/CSV changes). Re-run `npm run deploy:local` after schema or `db/data` changes when using `npm start`.

`npm start` / `cds watch` use SQLite via the `[development]` profile; `cds build --production` and the deployed app use HANA via `[production]` (configured under `cds.requires.db` in `package.json`). For a local app against a real HANA container:

```bash
cds bind -2 SAP_PACE-db
npx cds watch --profile hybrid
```

## HTTP tests

Open the files in `srv/test/http/` with the VS Code **REST Client** extension or the JetBrains HTTP client, then send requests top-to-bottom.

| File | Covers |
|---|---|
| `catalog.http` | `Services` – list/filter/search/count, CRUD, `$expand=currency`, metadata |
| `requests.http` | `ProjectRequest` – deep insert (header + features + services), navigation add/patch/delete, computed `estMonthlyCost`, cascade delete, validation errors; plus the `ProjectTypes` / `Markets` dropdown lists |

In `requests.http`: run **"Pick a service"** first and use one of the returned IDs as `service_ID` in the create payload — a bogus ID now returns `400`.

## Deploy to Cloud Foundry

```bash
npm i -g mbt        # one-time (also needs the cf CLI + MultiApps plugin)
cf login
npm run deploy:cf
```

`npm run deploy:cf` runs `mbt build` (which runs `cds build --production` → `gen/srv`, `gen/db`) then `cf deploy` on the generated `.mtar`. The `SAP_PACE-db-deployer` (hdb) module deploys the HANA artifacts to the `SAP_PACE-db` HDI container, and `SAP_PACE-srv` binds to XSUAA + HANA. `db/undeploy.json` controls which generated artifacts are dropped on redeploy.
