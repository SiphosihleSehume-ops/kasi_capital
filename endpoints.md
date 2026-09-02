# Kasi Capital — API Backend Documentation

This document describes the two API backends in the Kasi Capital repository:

| Backend | Branch | Purpose | Default port |
|---------|--------|---------|--------------|
| **Invest API** | `invest-api` | Mock brokerage backend with market simulation, accounts, orders, positions and watchlists | `8000` |
| **MoMo API** | `feature/mtn-momo-backend` | MTN Mobile Money (MoMo) collection, disbursement and remittance integration | `5001` |

Both backends are built with **FastAPI + Pydantic** and expose interactive Swagger docs at `/docs` and an OpenAPI spec at `/openapi.json` while running.

---

## Table of Contents

1. [Invest API](#1-invest-api)
   - [Overview](#overview)
   - [Requirements & installation](#requirements--installation)
   - [Running the server](#running-the-server)
   - [Authentication flow](#authentication-flow)
   - [Endpoints](#invest-api-endpoints)
   - [Data models](#invest-api-data-models)
   - [Tradable assets](#tradable-assets)
   - [Demo client & tests](#demo-client--tests)
   - [Docker](#docker)
2. [MoMo API](#2-momo-api)
   - [Overview](#overview-1)
   - [Requirements & installation](#requirements--installation-1)
   - [Configuration (env vars)](#configuration-env-vars)
   - [Running the server](#running-the-server-1)
   - [Endpoints](#momo-api-endpoints)
   - [Data models](#momo-api-data-models)
   - [Tests](#tests)

---

# 1. Invest API

## Overview

The **Invest API** (MockBrokerageAPI) is a fully in-memory mock brokerage backend. It simulates a brokerage account lifecycle — authentication, account creation, cash movements, order placement/execution, position tracking, watchlists and real-time market price movement — without any external dependencies or a real database.

Core components (in `mock_broker_backend.py`):

- **`MarketSimulator`** — a background thread that updates asset prices every 2 seconds and generates synthetic historical OHLCV candles.
- **`users` / `accounts`** — in-memory global registries keyed by `user_id` / `account_id`.
- **`verify_token`** dependency — validates the `Authorization: Bearer <token>` header on protected endpoints.
- **`get_account`** — fetches an account and enforces ownership (403 if it belongs to another user).

All state is volatile: restarting the process clears users, accounts and positions.

## Requirements & installation

- Python 3.8+
- Dependencies in `requirements.txt`:

```
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.4.2
python-multipart==0.0.6
```

Install with:

```bash
pip install -r requirements.txt
```

Note: `python-multipart` is declared but the current codebase uses JSON bodies only.

## Running the server

```bash
python mock_broker_backend.py
# or
uvicorn mock_broker_backend:app --host 0.0.0.0 --port 8000
```

| Resource | URL |
|----------|-----|
| Root (metadata + quick start) | `http://localhost:8000/` |
| Swagger UI | `http://localhost:8000/docs` |
| ReDoc | `http://localhost:8000/redoc` |
| OpenAPI spec | `http://localhost:8000/openapi.json` |

All API routes are prefixed with `/v1`.

## Authentication flow

The API uses **API keys** exchanged for short-lived **Bearer tokens**.

1. **Create a test user** to obtain an `api_key`:

   ```bash
   curl http://localhost:8000/v1/test/create-user
   # {"user_id":"...","api_key":"...","message":"Save the API key to authenticate requests"}
   ```

2. **Exchange the API key for a Bearer token** (valid 24h / `expires_in=86400`):

   ```bash
   curl -X POST http://localhost:8000/v1/auth/token \
     -H "Content-Type: application/json" \
     -d '{"api_key":"YOUR_API_KEY"}'
   # {"token":"...","expires_in":86400}
   ```

3. **Use the token** on all protected endpoints:

   ```bash
   curl http://localhost:8000/v1/accounts \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

Tokens are revoked with `POST /v1/auth/revoke`.

## Invest API Endpoints

### Authentication & utility

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/v1/test/create-user` | No | Create a test user, returns `user_id` + `api_key` |
| `POST` | `/v1/auth/token` | No (API key) | Exchange API key for a Bearer token |
| `POST` | `/v1/auth/revoke` | Bearer | Revoke the current token |
| `GET` | `/v1/health` | No | Health check with simulator status |
| `GET` | `/` | No | API metadata + quick start guide |

### Account management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/v1/accounts` | Bearer | Create a brokerage account (starts with `R50,000` cash) |
| `GET` | `/v1/accounts` | Bearer | List the user's accounts |
| `GET` | `/v1/accounts/{account_id}` | Bearer | Get account details |
| `GET` | `/v1/accounts/{account_id}/summary` | Bearer | Equity, cash, positions value, margin and unrealized P&L |

### Money movement

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/v1/accounts/{account_id}/bank-links` | Bearer | Link an external bank account |
| `POST` | `/v1/accounts/{account_id}/deposits` | Bearer | Add cash to the account |
| `POST` | `/v1/accounts/{account_id}/withdrawals` | Bearer | Withdraw cash (fails if insufficient) |

### Market data

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/assets` | No | List all tradable assets |
| `GET` | `/v1/assets/{symbol}` | No | Get a single asset |
| `GET` | `/v1/market/quotes/{symbol}` | No | Bid/ask quote (Level 1) |
| `GET` | `/v1/market/historical/{symbol}` | No | Historical OHLCV candles (`limit` 1–365, default 30) |

### Orders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/v1/orders?account_id=` | Bearer | Place an order (market/limit/stop/fractional) |
| `GET` | `/v1/orders?account_id=` | Bearer | List orders |
| `GET` | `/v1/orders/{order_id}?account_id=` | Bearer | Get order status |
| `PATCH` | `/v1/orders/{order_id}?account_id=` | Bearer | Update an open order |
| `DELETE` | `/v1/orders/{order_id}?account_id=` | Bearer | Cancel an open/pending order |

### Positions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/positions?account_id=` | Bearer | List open positions |
| `GET` | `/v1/positions/{symbol}?account_id=` | Bearer | Get a position |
| `DELETE` | `/v1/positions/{symbol}?account_id=` | Bearer | Liquidate a position entirely |

### Watchlists

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/v1/watchlists?account_id=` | Bearer | Create a watchlist |
| `GET` | `/v1/watchlists/{watchlist_id}?account_id=` | Bearer | Get a watchlist |
| `POST` | `/v1/watchlists/{watchlist_id}/{symbol}?account_id=` | Bearer | Add a symbol to a watchlist |

### Simulation control

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/v1/simulation/start` | No | Start the live price simulator thread |
| `POST` | `/v1/simulation/stop` | No | Stop the simulator |
| `GET` | `/v1/simulation/status` | No | Simulator status + current prices |
| `POST` | `/v1/simulation/reset` | No | Reset all users, accounts and market data |

> **Note on parameters:** endpoints under Orders, Positions and Watchlists take `account_id` as a **query parameter** (e.g. `/v1/orders?account_id=<id>`).

## Invest API Data Models

Order creation request (`OrderRequest`):

| Field | Type | Notes |
|-------|------|-------|
| `symbol` | string | Must be a tradable asset |
| `side` | `buy` / `sell` | |
| `quantity` | float (optional) | Number of units |
| `notional` | float (optional) | Currency amount for fractional orders — converted to quantity |
| `order_type` | `market` / `limit` / `stop` / `trailing_stop` / `fractional` | Default `market` |
| `limit_price` | float (optional) | Required for limit orders |
| `stop_price` | float (optional) | For stop/trailing orders |

Either `quantity` **or** `notional` must be supplied. Market orders execute immediately; other types remain `open`.

Account summary response (`AccountSummaryResponse`): `account_id`, `total_equity`, `cash_balance`, `positions_value`, `margin_used`, `margin_available`, `unrealized_pl`.

Order status values: `pending`, `open`, `partially_filled`, `filled`, `cancelled`, `rejected`.

Account `buying_power` is computed as `cash_balance × 2` (2× leverage).

## Tradable assets

Defined in the `TRADABLE_ASSETS` and `INVESTMENT_PRODUCTS` maps:

| Symbol | Name | Type | Fractional | Price |
|--------|------|------|:---:|------:|
| VAULT60 | Vault 60-Month Fixed Protector | fixed_deposit | no | 1000.00 |
| SOVFLEX | Sovereign Flexi-Bond | bond | no | 1000.00 |
| CASHCALL | Liquid Cash Call Account | money_market | yes | 1.00 |
| TOP40 | Top 40 Core Equity Indexer | etf | yes | 5234.50 |
| YIELD+ | Yield-Plus Corporate Credit | mutual_fund | yes | 2150.00 |
| BLUECHIP | Blue-Chip Dividend Aristocrats | etf | yes | 3890.25 |
| TECH | Frontier Tech & Micro-Cap Vault | etf | yes | 1245.75 |
| STOKVEL | Stokvel Venture Aggregator | hedge_fund | no | 10000.00 |
| CRYPTO | Digital Asset Core Tracker | crypto_etf | yes | 450.30 |

## Demo client & tests

**Demo client** (`demo_client.py`) — a complete Python client that exercises every endpoint:

```bash
# Full end-to-end demo
python demo_client.py

# 30-second smoke test
python demo_client.py quick
```

Tests (`test_broker_backend.py`) cover auth, accounts, money movement, market data, orders, positions, watchlists, simulation and utility endpoints:

```bash
pytest test_broker_backend.py -v
```

A Postman collection (`MockBrokerageAPI.postman_collection.json`) contains all 31 endpoints pre-configured.

## Docker

The service can be containerized. The image builds from a multi-stage `Dockerfile` and exposes port `8000` with a `/v1/health` healthcheck.

```bash
# Minimal single-service setup
docker-compose up -d

# Development stack (hot-reload, redis, postgres, pgadmin, adminer, swagger, mailhog)
docker-compose -f docker-compose.dev.yml up

# Full production-like stack (api, redis, postgres, nginx, prometheus, grafana, elk, etc.)
docker-compose -f docker-compose.full.yml up -d
```

The currently committed `Dockerfile` copies `mock_broker_backend.py` into a `python:3.11-slim` runtime and runs `uvicorn mock_broker_backend:app`. Note: `docker-compose.dev.yml` uses a `target: builder` stage and a `.env.example`; `docker-compose.full.yml` references `.env`, an `nginx/`, `monitoring/`, and `certs/` directory that are not present in the repo — those compose variants require additional files to run as-is.

---

# 2. MoMo API

## Overview

The **MoMo API** is a FastAPI wrapper around the **MTN Mobile Money (MoMo)** Open API. It provides a clean JSON REST surface over the collection, disbursement and remittance endpoints, abstracting the MTN auth, reference UUIDs and required headers.

The application is organized as a Python package:

| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI app, includes the router under `/api/v1` |
| `app/routes.py` | All REST routes |
| `app/mtn_momo.py` | `MTNMomoClient` — HTTP client for the MTN MoMo API (uses `httpx`) |
| `app/schemas.py` | Pydantic request/response models |
| `app/config.py` | Pydantic-settings `Settings` loaded from `.env` |
| `tests/test_api.py` | Async tests using mocked MTN client |
| `Dockerfile` / `docker-compose.yml` | Containerized deployment on port `5001` |

A single shared `MTNMomoClient` instance (`mtn_client`) talks to MTN. MTN requires three product areas, each with its own token endpoint and subscription key:

- **Collection** (`/collection/...`) — request-to-pay, payment status, account holder info, balance, refunds, pre-approval.
- **Disbursement** (`/disbursement/...`) — transfers out of the wallet, status, balance, account holder info.
- **Remittance** (`/remittance/...`) — cross-border/remittance transfers, status, balance.

## Requirements & installation

Dependencies in `requirements.txt`:

```
fastapi==0.115.0
uvicorn==0.30.6
httpx==0.27.2
pydantic==2.9.2
pydantic-settings==2.5.2
python-dotenv==1.0.1
pytest==8.3.3
pytest-asyncio==0.24.0
```

```bash
pip install -r requirements.txt
```

## Configuration (env vars)

Configuration is read from a `.env` file in the project root (see `app/config.py`). All values default to empty unless noted.

| Variable | Description |
|----------|-------------|
| `mtn_api_user` | MTN API user ID (basic-auth username) |
| `mtn_api_key` | MTN API key (basic-auth password) |
| `mtn_base_url` | MTN MoMo base URL (default `https://sandbox.momodeveloper.mtn.com`) |
| `mtn_callback_host` | Callback host (optional) |
| `mtn_environment` | MTN target environment — `sandbox` (default) or `live` |
| `ocp_apim_subscription_key` | Primary subscription key for collection |
| `kasi_collections_primary_key` | Collections primary key |
| `kasi_remittances_primary_key` | Subscription key used for remittance endpoints |
| `kasi_kasi_disbursements_primary_key` | Disbursements primary key |
| `user_1_uuid` | Reserved user UUID |

> ⚠️ **Never commit `.env`.** It is ignored by git. The `sandbox` base URL is safe for development; `live` requires approved MTN credentials.

## Running the server

```bash
# Locally
uvicorn app.main:app --host 0.0.0.0 --port 5001

# Via Docker
docker-compose up -d
```

| Resource | URL |
|----------|-----|
| Root | `http://localhost:5001/` |
| Docs (Swagger) | `http://localhost:5001/docs` |
| OpenAPI spec | `http://localhost:5001/openapi.json` |

All API routes are prefixed with `/api/v1`.

## MoMo API Endpoints

### Collection

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/pay` | Request a payment from a payer (request-to-pay) |
| `GET` | `/api/v1/payment-status/{reference_id}` | Check request-to-pay status |
| `GET` | `/api/v1/account-info/{account_holder_id}` | Get account holder basic info |
| `GET` | `/api/v1/balance` | Get collection wallet balance |
| `POST` | `/api/v1/refund/{reference_id}` | Refund a payment |
| `POST` | `/api/v1/pre-approval` | Create a pre-approval token |

### Disbursement

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/transfer` | Transfer money to a payee |
| `GET` | `/api/v1/transfer-status/{reference_id}` | Check transfer status |
| `GET` | `/api/v1/disbursement-balance` | Get disbursement wallet balance |
| `GET` | `/api/v1/disbursement-account-info/{account_holder_id}` | Get payee basic info |

### Remittance

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/remittance/transfer` | Remittance (cross-border) transfer |
| `GET` | `/api/v1/remittance/transfer-status/{reference_id}` | Check remittance transfer status |
| `GET` | `/api/v1/remittance/balance` | Get remittance wallet balance |

### Error handling

Every route wraps the MTN client call in a `try/except`. If the underlying MTN request raises (network, HTTP error, bad credentials), the API responds with HTTP `500` and the error message in the JSON `detail` field.

Accepted-but-pending operations (HTTP 202 from MTN) return a `PaymentResponse`/`TransferResponse` with `status: PENDING` and a `reference_id` to poll later via the corresponding `*-status` endpoint.

## MoMo API Data Models

### Payment / transfer party object

A `payer` / `payee` dictionary identifies a MoMo account holder:

```json
{"partyIdType": "MSISDN", "partyId": "260970000000"}
```

### PaymentRequest

| Field | Type | Default |
|-------|------|---------|
| `amount` | string | required |
| `currency` | string | `ZMW` |
| `external_id` | string | required |
| `payer_message` | string | `"Payment for services"` |
| `payee_note` | string | `"MoMo payment"` |
| `payer` | object | required |

### PaymentResponse

| Field | Type |
|-------|------|
| `status` | string (`PENDING` / `FAILED`) |
| `reference_id` | string |
| `message` | string (optional) |

### TransferRequest

`amount`, `currency` (default `ZMW`), `external_id`, `payee`, `payer_message` (default `"Transfer for services"`), `payee_note` (default `"MoMo transfer"`).

### TransferResponse

Same shape as `PaymentResponse`.

### RefundRequest

`amount`, `currency` (default `ZMW`), `external_id`, `payer_message` (default `"Refund for services"`), `payee_note` (default `"MoMo refund"`).

### PreApprovalRequest

`amount`, `currency` (default `ZMW`), `external_id`, `payer_message`, `payee_note`, `payer`.

### AccountHolderInfoResponse

`financial_id` (optional), `name` (optional), `currency` (optional).

### BalanceResponse

`available_balance` (optional), `currency` (optional).

## Tests

`tests/test_api.py` provides async tests for every endpoint, mocking the MTN client (`app.routes.mtn_client`) so no real network or credentials are needed. Both success and failure (HTTP 500) paths are covered:

```bash
pytest tests/test_api.py -v
```

Example (success → mocked):

```python
mock_mtn_client.request_to_pay = AsyncMock(return_value={
    "status": "PENDING",
    "reference_id": "test-ref-id",
    "message": "Request accepted",
})
```
