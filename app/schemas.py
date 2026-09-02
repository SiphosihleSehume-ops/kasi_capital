from pydantic import BaseModel
from typing import Optional


class PaymentRequest(BaseModel):
    amount: str
    currency: str = "ZMW"
    external_id: str
    payer_message: str = "Payment for services"
    payee_note: str = "MoMo payment"
    payer: dict  # {"partyIdType": "MSISDN", "partyId": "260XXXXXXXXX"}


class PaymentResponse(BaseModel):
    status: str
    reference_id: str
    message: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "access_token"
    expires_in: int


class RefundRequest(BaseModel):
    amount: str
    currency: str = "ZMW"
    external_id: str
    payer_message: str = "Refund for services"
    payee_note: str = "MoMo refund"


class AccountHolderInfoResponse(BaseModel):
    financial_id: Optional[str] = None
    name: Optional[str] = None
    currency: Optional[str] = None


class BalanceResponse(BaseModel):
    available_balance: Optional[str] = None
    currency: Optional[str] = None


class PreApprovalRequest(BaseModel):
    amount: str
    currency: str = "ZMW"
    external_id: str
    payer_message: str = "Pre-approval for services"
    payee_note: str = "MoMo pre-approval"
    payer: dict  # {"partyIdType": "MSISDN", "partyId": "260XXXXXXXXX"}


class TransferRequest(BaseModel):
    amount: str
    currency: str = "ZMW"
    external_id: str
    payee: dict  # {"partyIdType": "MSISDN", "partyId": "260XXXXXXXXX"}
    payer_message: str = "Transfer for services"
    payee_note: str = "MoMo transfer"


class TransferResponse(BaseModel):
    status: str
    reference_id: str
    message: Optional[str] = None
