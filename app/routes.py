from fastapi import APIRouter, HTTPException
from app.schemas import (
    PaymentRequest, PaymentResponse, RefundRequest,
    AccountHolderInfoResponse, BalanceResponse, PreApprovalRequest,
    TransferRequest, TransferResponse
)
from app.mtn_momo import mtn_client

router = APIRouter()


@router.post("/pay", response_model=PaymentResponse)
async def make_payment(request: PaymentRequest):
    try:
        result = await mtn_client.request_to_pay(
            amount=request.amount,
            currency=request.currency,
            external_id=request.external_id,
            payer_message=request.payer_message,
            payee_note=request.payee_note,
            payer=request.payer,
        )
        return PaymentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/payment-status/{reference_id}")
async def get_payment_status(reference_id: str):
    try:
        result = await mtn_client.get_payment_status(reference_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/account-info/{account_holder_id}", response_model=AccountHolderInfoResponse)
async def get_account_holder_info(account_holder_id: str):
    try:
        result = await mtn_client.get_account_holder_info(account_holder_id)
        return AccountHolderInfoResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/balance", response_model=BalanceResponse)
async def get_balance():
    try:
        result = await mtn_client.get_balance()
        return BalanceResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/refund/{reference_id}", response_model=PaymentResponse)
async def refund_payment(reference_id: str, request: RefundRequest):
    try:
        result = await mtn_client.refund_payment(
            reference_id=reference_id,
            amount=request.amount,
            currency=request.currency,
            external_id=request.external_id,
            payer_message=request.payer_message,
            payee_note=request.payee_note,
        )
        return PaymentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pre-approval", response_model=PaymentResponse)
async def create_pre_approval_token(request: PreApprovalRequest):
    try:
        result = await mtn_client.create_pre_approval_token(
            payer=request.payer,
            amount=request.amount,
            currency=request.currency,
            external_id=request.external_id,
            payer_message=request.payer_message,
            payee_note=request.payee_note,
        )
        return PaymentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transfer", response_model=TransferResponse)
async def transfer_money(request: TransferRequest):
    try:
        result = await mtn_client.transfer(
            amount=request.amount,
            currency=request.currency,
            external_id=request.external_id,
            payee=request.payee,
            payer_message=request.payer_message,
            payee_note=request.payee_note,
        )
        return TransferResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/transfer-status/{reference_id}")
async def get_transfer_status(reference_id: str):
    try:
        result = await mtn_client.get_transfer_status(reference_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/disbursement-balance", response_model=BalanceResponse)
async def get_disbursement_balance():
    try:
        result = await mtn_client.get_disbursement_balance()
        return BalanceResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/disbursement-account-info/{account_holder_id}", response_model=AccountHolderInfoResponse)
async def get_disbursement_account_holder_info(account_holder_id: str):
    try:
        result = await mtn_client.get_disbursement_account_holder_info(account_holder_id)
        return AccountHolderInfoResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/remittance/transfer", response_model=TransferResponse)
async def remittance_transfer(request: TransferRequest):
    try:
        result = await mtn_client.remittance_transfer(
            amount=request.amount,
            currency=request.currency,
            external_id=request.external_id,
            payee=request.payee,
            payer_message=request.payer_message,
            payee_note=request.payee_note,
        )
        return TransferResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/remittance/transfer-status/{reference_id}")
async def get_remittance_transfer_status(reference_id: str):
    try:
        result = await mtn_client.get_remittance_transfer_status(reference_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/remittance/balance", response_model=BalanceResponse)
async def get_remittance_balance():
    try:
        result = await mtn_client.get_remittance_balance()
        return BalanceResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
