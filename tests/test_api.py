import pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
def mock_mtn_client():
    with patch("app.routes.mtn_client") as client:
        yield client


@pytest.mark.asyncio
async def test_make_payment_success(mock_mtn_client):
    mock_mtn_client.request_to_pay = AsyncMock(return_value={
        "status": "PENDING",
        "reference_id": "test-ref-id",
        "message": "Request accepted",
    })

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/pay", json={
            "amount": "100",
            "currency": "ZAR",
            "external_id": "order-123",
            "payer": {"partyIdType": "MSISDN", "partyId": "27821234567"},
        })

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PENDING"
    assert data["reference_id"] == "test-ref-id"


@pytest.mark.asyncio
async def test_make_payment_failure(mock_mtn_client):
    mock_mtn_client.request_to_pay = AsyncMock(side_effect=Exception("API error"))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/pay", json={
            "amount": "100",
            "currency": "ZAR",
            "external_id": "order-123",
            "payer": {"partyIdType": "MSISDN", "partyId": "27821234567"},
        })

    assert response.status_code == 500


@pytest.mark.asyncio
async def test_get_payment_status_success(mock_mtn_client):
    mock_mtn_client.get_payment_status = AsyncMock(return_value={
        "status": "SUCCESSFUL",
        "amount": "100",
        "currency": "ZAR",
    })

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/payment-status/test-ref-id")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESSFUL"


@pytest.mark.asyncio
async def test_get_payment_status_failure(mock_mtn_client):
    mock_mtn_client.get_payment_status = AsyncMock(side_effect=Exception("Not found"))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/payment-status/invalid-id")

    assert response.status_code == 500


@pytest.mark.asyncio
async def test_get_account_holder_info_success(mock_mtn_client):
    mock_mtn_client.get_account_holder_info = AsyncMock(return_value={
        "financial_id": "12345",
        "name": "John Doe",
        "currency": "ZAR",
    })

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/account-info/27821234567")

    assert response.status_code == 200
    data = response.json()
    assert data["financial_id"] == "12345"
    assert data["name"] == "John Doe"


@pytest.mark.asyncio
async def test_get_account_holder_info_failure(mock_mtn_client):
    mock_mtn_client.get_account_holder_info = AsyncMock(side_effect=Exception("Not found"))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/account-info/invalid-id")

    assert response.status_code == 500


@pytest.mark.asyncio
async def test_get_balance_success(mock_mtn_client):
    mock_mtn_client.get_balance = AsyncMock(return_value={
        "available_balance": "1000.00",
        "currency": "ZAR",
    })

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/balance")

    assert response.status_code == 200
    data = response.json()
    assert data["available_balance"] == "1000.00"
    assert data["currency"] == "ZAR"


@pytest.mark.asyncio
async def test_get_balance_failure(mock_mtn_client):
    mock_mtn_client.get_balance = AsyncMock(side_effect=Exception("API error"))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/balance")

    assert response.status_code == 500


@pytest.mark.asyncio
async def test_refund_payment_success(mock_mtn_client):
    mock_mtn_client.refund_payment = AsyncMock(return_value={
        "status": "PENDING",
        "reference_id": "refund-ref-id",
        "message": "Refund request accepted",
    })

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/refund/test-ref-id", json={
            "amount": "100",
            "currency": "ZAR",
            "external_id": "refund-123",
        })

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PENDING"
    assert data["reference_id"] == "refund-ref-id"


@pytest.mark.asyncio
async def test_refund_payment_failure(mock_mtn_client):
    mock_mtn_client.refund_payment = AsyncMock(side_effect=Exception("Refund failed"))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/refund/test-ref-id", json={
            "amount": "100",
            "currency": "ZAR",
            "external_id": "refund-123",
        })

    assert response.status_code == 500


@pytest.mark.asyncio
async def test_create_pre_approval_token_success(mock_mtn_client):
    mock_mtn_client.create_pre_approval_token = AsyncMock(return_value={
        "status": "PENDING",
        "reference_id": "pre-approval-ref-id",
        "message": "Pre-approval token created",
    })

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/pre-approval", json={
            "amount": "100",
            "currency": "ZAR",
            "external_id": "pre-approval-123",
            "payer": {"partyIdType": "MSISDN", "partyId": "27821234567"},
        })

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PENDING"
    assert data["reference_id"] == "pre-approval-ref-id"


@pytest.mark.asyncio
async def test_create_pre_approval_token_failure(mock_mtn_client):
    mock_mtn_client.create_pre_approval_token = AsyncMock(side_effect=Exception("Pre-approval failed"))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/pre-approval", json={
            "amount": "100",
            "currency": "ZAR",
            "external_id": "pre-approval-123",
            "payer": {"partyIdType": "MSISDN", "partyId": "27821234567"},
        })

    assert response.status_code == 500


@pytest.mark.asyncio
async def test_transfer_success(mock_mtn_client):
    mock_mtn_client.transfer = AsyncMock(return_value={
        "status": "PENDING",
        "reference_id": "transfer-ref-id",
        "message": "Transfer request accepted",
    })

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/transfer", json={
            "amount": "100",
            "currency": "ZAR",
            "external_id": "transfer-123",
            "payee": {"partyIdType": "MSISDN", "partyId": "27821234567"},
        })

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PENDING"
    assert data["reference_id"] == "transfer-ref-id"


@pytest.mark.asyncio
async def test_transfer_failure(mock_mtn_client):
    mock_mtn_client.transfer = AsyncMock(side_effect=Exception("Transfer failed"))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/transfer", json={
            "amount": "100",
            "currency": "ZAR",
            "external_id": "transfer-123",
            "payee": {"partyIdType": "MSISDN", "partyId": "27821234567"},
        })

    assert response.status_code == 500


@pytest.mark.asyncio
async def test_get_transfer_status_success(mock_mtn_client):
    mock_mtn_client.get_transfer_status = AsyncMock(return_value={
        "status": "SUCCESSFUL",
        "amount": "100",
        "currency": "ZAR",
    })

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/transfer-status/transfer-ref-id")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESSFUL"


@pytest.mark.asyncio
async def test_get_transfer_status_failure(mock_mtn_client):
    mock_mtn_client.get_transfer_status = AsyncMock(side_effect=Exception("Not found"))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/transfer-status/invalid-id")

    assert response.status_code == 500


@pytest.mark.asyncio
async def test_get_disbursement_balance_success(mock_mtn_client):
    mock_mtn_client.get_disbursement_balance = AsyncMock(return_value={
        "available_balance": "5000.00",
        "currency": "ZAR",
    })

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/disbursement-balance")

    assert response.status_code == 200
    data = response.json()
    assert data["available_balance"] == "5000.00"
    assert data["currency"] == "ZAR"


@pytest.mark.asyncio
async def test_get_disbursement_balance_failure(mock_mtn_client):
    mock_mtn_client.get_disbursement_balance = AsyncMock(side_effect=Exception("API error"))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/disbursement-balance")

    assert response.status_code == 500


@pytest.mark.asyncio
async def test_get_disbursement_account_holder_info_success(mock_mtn_client):
    mock_mtn_client.get_disbursement_account_holder_info = AsyncMock(return_value={
        "financial_id": "67890",
        "name": "Jane Doe",
        "currency": "ZAR",
    })

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/disbursement-account-info/27821234567")

    assert response.status_code == 200
    data = response.json()
    assert data["financial_id"] == "67890"
    assert data["name"] == "Jane Doe"


@pytest.mark.asyncio
async def test_get_disbursement_account_holder_info_failure(mock_mtn_client):
    mock_mtn_client.get_disbursement_account_holder_info = AsyncMock(side_effect=Exception("Not found"))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/disbursement-account-info/invalid-id")

    assert response.status_code == 500


@pytest.mark.asyncio
async def test_remittance_transfer_success(mock_mtn_client):
    mock_mtn_client.remittance_transfer = AsyncMock(return_value={
        "status": "PENDING",
        "reference_id": "remit-ref-id",
        "message": "Remittance transfer accepted",
    })

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/remittance/transfer", json={
            "amount": "100",
            "currency": "ZAR",
            "external_id": "remit-123",
            "payee": {"partyIdType": "MSISDN", "partyId": "27821234567"},
        })

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PENDING"
    assert data["reference_id"] == "remit-ref-id"


@pytest.mark.asyncio
async def test_remittance_transfer_failure(mock_mtn_client):
    mock_mtn_client.remittance_transfer = AsyncMock(side_effect=Exception("Remittance failed"))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/remittance/transfer", json={
            "amount": "100",
            "currency": "ZAR",
            "external_id": "remit-123",
            "payee": {"partyIdType": "MSISDN", "partyId": "27821234567"},
        })

    assert response.status_code == 500


@pytest.mark.asyncio
async def test_get_remittance_transfer_status_success(mock_mtn_client):
    mock_mtn_client.get_remittance_transfer_status = AsyncMock(return_value={
        "status": "SUCCESSFUL",
        "amount": "100",
        "currency": "ZAR",
    })

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/remittance/transfer-status/remit-ref-id")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESSFUL"


@pytest.mark.asyncio
async def test_get_remittance_transfer_status_failure(mock_mtn_client):
    mock_mtn_client.get_remittance_transfer_status = AsyncMock(side_effect=Exception("Not found"))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/remittance/transfer-status/invalid-id")

    assert response.status_code == 500


@pytest.mark.asyncio
async def test_get_remittance_balance_success(mock_mtn_client):
    mock_mtn_client.get_remittance_balance = AsyncMock(return_value={
        "available_balance": "2500.00",
        "currency": "ZAR",
    })

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/remittance/balance")

    assert response.status_code == 200
    data = response.json()
    assert data["available_balance"] == "2500.00"
    assert data["currency"] == "ZAR"


@pytest.mark.asyncio
async def test_get_remittance_balance_failure(mock_mtn_client):
    mock_mtn_client.get_remittance_balance = AsyncMock(side_effect=Exception("API error"))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/remittance/balance")

    assert response.status_code == 500
