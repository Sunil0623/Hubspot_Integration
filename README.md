VectorShift Integration System

📌 Overview

VectorShift Integration System is a scalable solution designed to seamlessly connect multiple third-party services (HubSpot, Airtable, and Notion) using OAuth2 authentication. Built with FastAPI for the backend and React for the frontend, this system ensures efficient, secure, and real-time data synchronization across various enterprise applications.

🚀 Features

✅ OAuth2 Authentication for secure access
✅ Modular and Scalable Architecture for easy expansion
✅ Real-time Data Fetching from multiple platforms
✅ Secure Token Management with Redis
✅ Modern UI using Material-UI for an intuitive experience
✅ Extensible Integration System for additional services

🛠 Technology Stack

Frontend:
React
Material-UI
Axios

Backend:
FastAPI
Python
Redis (for token storage)

Authentication:
OAuth2 Protocol
Integrated APIs:

🔹 HubSpot (CRM Data)
🔹 Airtable (Database Management)
🔹 Notion (Workspace Data)

⚡ Getting Started

Prerequisites

Ensure you have the following installed:

Node.js & npm

Python 3.8+

Redis

Developer accounts for HubSpot, Airtable, and Notion

Installation Steps

1️⃣ Clone the Repository

git clone https://github.com/Sunil0623/Hubspot_Integration.git
cd VectorShift

2️⃣ Backend Setup

cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

3️⃣ Configure Environment Variables

Use the credentials of Hubspot, Airtable and Notion in backend/ directory with the following data for all three:

HUBSPOT_CLIENT_ID=your_client_id
HUBSPOT_CLIENT_SECRET=your_client_secret
HUBSPOT_REDIRECT_URI=http://localhost:8000/integrations/hubspot/oauth2callback

4️⃣ Frontend Setup

cd frontend
npm install

5️⃣ Start Services

# Start Redis Server
redis-server
# Start Backend
cd backend
uvicorn main:app --reload or python3 -m uvicorn main:app --reload
# Start Frontend
cd frontend
npm start

🔄 Integration Flow

1️⃣ User selects a platform (HubSpot/Airtable/Notion)
2️⃣ OAuth2 Authorization begins
3️⃣ User logs in to grant access
4️⃣ Access tokens stored securely in Redis
5️⃣ Data is retrieved and displayed in the UI

🔐 Security Features

Secure Token Storage: OAuth tokens are safely stored in Redis.
State Verification: Prevents CSRF attacks during OAuth flow.
Token Expiration Handling: Auto-refresh for expired tokens.
CORS Protection: Restricts unauthorized API access.
Environment Configuration: Sensitive data stored in .env.

🛠 Implementation Details

OAuth2 Flow
Authorization Request: Generates a secure state token and redirects user to the OAuth provider.
Callback Handling: Verifies state token and exchanges code for an access token.
Token Management: Encrypts and stores tokens in Redis with expiration.

Data Handling
Each integration follows a standardized data flow:
IntegrationItem class ensures a consistent API structure.
Service-specific API calls handle data fetching.
Error Handling prevents disruptions and rate limit issues.
Data Transformation ensures a common format for frontend display.

Frontend Components
IntegrationForm: Manages OAuth authentication and state.
Service-Specific Components: Handles platform-specific API interactions.
DataForm: Displays fetched data in an intuitive UI.

✅ Testing
1️⃣ Set up developer accounts for HubSpot, Airtable, and Notion
2️⃣ Configure OAuth credentials in the .env file
3️⃣ Run the application and complete OAuth2 authentication
4️⃣ Verify successful data retrieval and display in UI
5️⃣ Test API calls and error handling

🔮 Future Enhancements

🚀 Planned Features:
More Integrations: Expand support to additional services.
Batch Processing: Handle large-scale data synchronization.
Improved Error Handling: Graceful failure management.
Data Visualization: Interactive dashboards and reports.
Automated Testing: Unit and integration test suites.
Rate Limiting: Prevent API overuse and improve efficiency.

📩 Contact
For questions or collaboration, feel free to reach out!
📧 Email: raghav0623.tech@gmail.com
