import httpx
import base64
from uuid import uuid4
from app.config import get_settings


class MTNMomoClient:
    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.mtn_base_url
        self.token = None

    def _get_basic_auth(self) -> str:
        credentials = f"{self.settings.mtn_api_user}:{self.settings.mtn_api_key}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return f"Basic {encoded}"

    async def get_access_token(self) -> str:
        if self.token:
            return self.token

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/collection/token/",
                headers={
                    "Authorization": self._get_basic_auth(),
                    "Ocp-Apim-Subscription-Key": self.settings.ocp_apim_subscription_key,
                },
            )
            response.raise_for_status()
            data = response.json()
            self.token = data["access_token"]
            return self.token

    async def request_to_pay(self, amount: str, currency: str, external_id: str,
                              payer_message: str, payee_note: str, payer: dict) -> dict:
        token = await self.get_access_token()
        reference_id = str(uuid4())

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/collection/v1_0/requesttopay",
                json={
                    "amount": amount,
                    "currency": currency,
                    "externalId": external_id,
                    "payer": payer,
                    "payerMessage": payer_message,
                    "payeeNote": payee_note,
                },
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-Reference-Id": reference_id,
                    "X-Target-Environment": self.settings.mtn_environment,
                    "Ocp-Apim-Subscription-Key": self.settings.ocp_apim_subscription_key,
                    "Content-Type": "application/json",
                },
            )

            if response.status_code == 202:
                return {
                    "status": "PENDING",
                    "reference_id": reference_id,
                    "message": "Request accepted",
                }
            else:
                return {
                    "status": "FAILED",
                    "reference_id": reference_id,
                    "message": response.text,
                }

    async def get_payment_status(self, reference_id: str) -> dict:
        token = await self.get_access_token()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/collection/v1_0/requesttopay/{reference_id}",
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-Target-Environment": self.settings.mtn_environment,
                    "Ocp-Apim-Subscription-Key": self.settings.ocp_apim_subscription_key,
                },
            )
            response.raise_for_status()
            return response.json()

    async def get_account_holder_info(self, account_holder_id: str) -> dict:
        token = await self.get_access_token()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/collection/v1_0/account/{account_holder_id}/basicinfo",
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-Target-Environment": self.settings.mtn_environment,
                    "Ocp-Apim-Subscription-Key": self.settings.ocp_apim_subscription_key,
                },
            )
            response.raise_for_status()
            return response.json()

    async def get_balance(self) -> dict:
        token = await self.get_access_token()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/collection/v1_0/account/balance",
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-Target-Environment": self.settings.mtn_environment,
                    "Ocp-Apim-Subscription-Key": self.settings.ocp_apim_subscription_key,
                },
            )
            response.raise_for_status()
            return response.json()

    async def refund_payment(self, reference_id: str, amount: str, currency: str,
                             external_id: str, payer_message: str, payee_note: str) -> dict:
        token = await self.get_access_token()
        refund_ref_id = str(uuid4())

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/collection/v1_0/requesttopay/{reference_id}/refund",
                json={
                    "amount": amount,
                    "currency": currency,
                    "externalId": external_id,
                    "payerMessage": payer_message,
                    "payeeNote": payee_note,
                },
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-Reference-Id": refund_ref_id,
                    "X-Target-Environment": self.settings.mtn_environment,
                    "Ocp-Apim-Subscription-Key": self.settings.ocp_apim_subscription_key,
                    "Content-Type": "application/json",
                },
            )

            if response.status_code == 202:
                return {
                    "status": "PENDING",
                    "reference_id": refund_ref_id,
                    "message": "Refund request accepted",
                }
            else:
                return {
                    "status": "FAILED",
                    "reference_id": refund_ref_id,
                    "message": response.text,
                }

    async def create_pre_approval_token(self, payer: dict, amount: str,
                                         currency: str, external_id: str,
                                         payer_message: str, payee_note: str) -> dict:
        token = await self.get_access_token()
        reference_id = str(uuid4())

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/collection/v1_0/requesttopay",
                json={
                    "amount": amount,
                    "currency": currency,
                    "externalId": external_id,
                    "payer": payer,
                    "payerMessage": payer_message,
                    "payeeNote": payee_note,
                },
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-Reference-Id": reference_id,
                    "X-Target-Environment": self.settings.mtn_environment,
                    "Ocp-Apim-Subscription-Key": self.settings.ocp_apim_subscription_key,
                    "Content-Type": "application/json",
                },
            )

            if response.status_code == 202:
                return {
                    "status": "PENDING",
                    "reference_id": reference_id,
                    "message": "Pre-approval token created",
                }
            else:
                return {
                    "status": "FAILED",
                    "reference_id": reference_id,
                    "message": response.text,
                }

    async def get_disbursement_token(self) -> str:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/disbursement/token/",
                headers={
                    "Authorization": self._get_basic_auth(),
                    "Ocp-Apim-Subscription-Key": self.settings.ocp_apim_subscription_key,
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["access_token"]

    async def transfer(self, amount: str, currency: str, external_id: str,
                       payee: dict, payer_message: str, payee_note: str) -> dict:
        token = await self.get_disbursement_token()
        reference_id = str(uuid4())

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/disbursement/v1_0/transfer",
                json={
                    "amount": amount,
                    "currency": currency,
                    "externalId": external_id,
                    "payee": payee,
                    "payerMessage": payer_message,
                    "payeeNote": payee_note,
                },
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-Reference-Id": reference_id,
                    "X-Target-Environment": self.settings.mtn_environment,
                    "Ocp-Apim-Subscription-Key": self.settings.ocp_apim_subscription_key,
                    "Content-Type": "application/json",
                },
            )

            if response.status_code == 202:
                return {
                    "status": "PENDING",
                    "reference_id": reference_id,
                    "message": "Transfer request accepted",
                }
            else:
                return {
                    "status": "FAILED",
                    "reference_id": reference_id,
                    "message": response.text,
                }

    async def get_transfer_status(self, reference_id: str) -> dict:
        token = await self.get_disbursement_token()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/disbursement/v1_0/transfer/{reference_id}",
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-Target-Environment": self.settings.mtn_environment,
                    "Ocp-Apim-Subscription-Key": self.settings.ocp_apim_subscription_key,
                },
            )
            response.raise_for_status()
            return response.json()

    async def get_disbursement_balance(self) -> dict:
        token = await self.get_disbursement_token()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/disbursement/v1_0/account/balance",
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-Target-Environment": self.settings.mtn_environment,
                    "Ocp-Apim-Subscription-Key": self.settings.ocp_apim_subscription_key,
                },
            )
            response.raise_for_status()
            return response.json()

    async def get_disbursement_account_holder_info(self, account_holder_id: str) -> dict:
        token = await self.get_disbursement_token()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/disbursement/v1_0/account/{account_holder_id}/basicinfo",
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-Target-Environment": self.settings.mtn_environment,
                    "Ocp-Apim-Subscription-Key": self.settings.ocp_apim_subscription_key,
                },
            )
            response.raise_for_status()
            return response.json()

    async def get_remittance_token(self) -> str:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/remittance/token/",
                headers={
                    "Authorization": self._get_basic_auth(),
                    "Ocp-Apim-Subscription-Key": self.settings.kasi_remittances_primary_key,
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["access_token"]

    async def remittance_transfer(self, amount: str, currency: str, external_id: str,
                                   payee: dict, payer_message: str, payee_note: str) -> dict:
        token = await self.get_remittance_token()
        reference_id = str(uuid4())

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/remittance/v1_0/transfer",
                json={
                    "amount": amount,
                    "currency": currency,
                    "externalId": external_id,
                    "payee": payee,
                    "payerMessage": payer_message,
                    "payeeNote": payee_note,
                },
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-Reference-Id": reference_id,
                    "X-Target-Environment": self.settings.mtn_environment,
                    "Ocp-Apim-Subscription-Key": self.settings.kasi_remittances_primary_key,
                    "Content-Type": "application/json",
                },
            )

            if response.status_code == 202:
                return {
                    "status": "PENDING",
                    "reference_id": reference_id,
                    "message": "Remittance transfer accepted",
                }
            else:
                return {
                    "status": "FAILED",
                    "reference_id": reference_id,
                    "message": response.text,
                }

    async def get_remittance_transfer_status(self, reference_id: str) -> dict:
        token = await self.get_remittance_token()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/remittance/v1_0/transfer/{reference_id}",
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-Target-Environment": self.settings.mtn_environment,
                    "Ocp-Apim-Subscription-Key": self.settings.kasi_remittances_primary_key,
                },
            )
            response.raise_for_status()
            return response.json()

    async def get_remittance_balance(self) -> dict:
        token = await self.get_remittance_token()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/remittance/v1_0/account/balance",
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-Target-Environment": self.settings.mtn_environment,
                    "Ocp-Apim-Subscription-Key": self.settings.kasi_remittances_primary_key,
                },
            )
            response.raise_for_status()
            return response.json()


mtn_client = MTNMomoClient()
