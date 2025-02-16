import json
import secrets
import base64
import httpx
from fastapi import Request, HTTPException
from fastapi.responses import HTMLResponse

from redis_client import add_key_value_redis, get_value_redis, delete_key_redis

CLIENT_ID = '92714477-049a-4ba7-97ea-b6e6a2364f66'
CLIENT_SECRET = '4977375f-ca92-4d63-81c9-edb18425776c'
REDIRECT_URI = 'http://localhost:8000/integrations/hubspot/oauth2callback'


# Function to start OAuth by generating an authorization URL
async def authorize_hubspot(user_id: str, org_id: str):
    state_data = {
        'state': secrets.token_urlsafe(32),
        'user_id': user_id,
        'org_id': org_id
    }
    encoded_state = base64.urlsafe_b64encode(json.dumps(state_data).encode()).decode()

    auth_url = (
        f"https://app.hubspot.com/oauth/authorize"
        f"?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}"
        f"&scope=crm.objects.companies.read crm.objects.contacts.read crm.objects.deals.read oauth"
        f"&state={encoded_state}"
    )

    await add_key_value_redis(f'hubspot_state:{org_id}:{user_id}', json.dumps(state_data), expire=600)
    return auth_url


# OAuth2 Callback function for HubSpot authentication
async def oauth2callback_hubspot(request: Request):
    error = request.query_params.get('error')
    if error:
        raise HTTPException(status_code=400, detail=request.query_params.get('error_description'))

    code = request.query_params.get('code')
    encoded_state = request.query_params.get('state')

    if not code or not encoded_state:
        raise HTTPException(status_code=400, detail="Invalid request parameters.")

    state_data = json.loads(base64.urlsafe_b64decode(encoded_state).decode())
    user_id, org_id = state_data.get('user_id'), state_data.get('org_id')

    # Validate state with Redis
    saved_state = await get_value_redis(f'hubspot_state:{org_id}:{user_id}')
    if not saved_state or json.loads(saved_state).get('state') != state_data.get('state'):
        raise HTTPException(status_code=400, detail='Invalid or expired state.')

    # Exchange authorization code for an access token
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'https://api.hubapi.com/oauth/v1/token',
            data={
                'grant_type': 'authorization_code',
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET,
                'redirect_uri': REDIRECT_URI,
                'code': code,
            },
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )

    if response.status_code != 200:
        raise HTTPException(status_code=400, detail=f'Failed to fetch access token: {response.text}')

    credentials = response.json()
    await add_key_value_redis(f'hubspot_credentials:{org_id}:{user_id}', json.dumps(credentials), expire=600)
    await delete_key_redis(f'hubspot_state:{org_id}:{user_id}')

    return HTMLResponse("<html><script>window.close();</script></html>")


# Function to retrieve HubSpot credentials from Redis
async def get_hubspot_credentials(user_id: str, org_id: str):
    credentials = await get_value_redis(f'hubspot_credentials:{org_id}:{user_id}')
    if not credentials:
        raise HTTPException(status_code=400, detail="HubSpot credentials not found or expired.")
    return json.loads(credentials)


# Function to get contacts from HubSpot
async def get_items_hubspot(user_id: str, org_id: str):
    credentials = await get_hubspot_credentials(user_id, org_id)
    access_token = credentials.get('access_token')

    async with httpx.AsyncClient() as client:
        response = await client.get(
            'https://api.hubapi.com/crm/v3/objects/contacts',
            headers={'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'}
        )

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f'Error fetching data: {response.text}')

    return response.json().get('results', [])


# Function to get companies from HubSpot
async def get_companies_hubspot(user_id: str, org_id: str):
    credentials = await get_hubspot_credentials(user_id, org_id)
    access_token = credentials.get('access_token')

    if not access_token:
        raise HTTPException(status_code=400, detail="Missing access token")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            'https://api.hubapi.com/crm/v3/objects/companies',
            headers={'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'}
        )

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f'Error fetching companies: {response.text}')

    return response.json().get('results')
