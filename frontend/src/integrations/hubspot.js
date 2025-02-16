// hubspot.js

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    TextField
} from '@mui/material';  // Only import CircularProgress once

import axios from 'axios';

export const HubspotIntegration = ({ user, org, integrationParams, setIntegrationParams }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [companiesData, setCompaniesData] = useState(null);
    const [loadingData, setLoadingData] = useState(false);

    // Function to open OAuth in a new window
    const handleConnectClick = async () => {
        try {
            setIsConnecting(true);
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axios.post(`http://localhost:8000/integrations/hubspot/authorize`, formData);
            const authURL = response?.data;

            const newWindow = window.open(authURL, 'Hubspot Authorization', 'width=600, height=600');

            // Polling for the window to close
            const pollTimer = window.setInterval(() => {
                if (newWindow?.closed !== false) {
                    window.clearInterval(pollTimer);
                    handleWindowClosed();
                }
            }, 200);
        } catch (e) {
            setIsConnecting(false);
            alert(e?.response?.data?.detail);
        }
    };

    // Function to handle logic when the OAuth window closes
    const handleWindowClosed = async () => {
        try {
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axios.post(`http://localhost:8000/integrations/hubspot/credentials`, formData);
            const credentials = response.data;
            if (credentials) {
                setIsConnecting(false);
                setIsConnected(true);
                setIntegrationParams(prev => ({ ...prev, credentials: credentials, type: 'Hubspot' }));
                fetchCompaniesData(credentials);  // Fetch the companies data after connection
            }
            setIsConnecting(false);
        } catch (e) {
            setIsConnecting(false);
            alert(e?.response?.data?.detail);
        }
    };

    // Function to fetch companies data from HubSpot
    const fetchCompaniesData = async (credentials) => {
        setLoadingData(true);
        try {
            const response = await axios.get(`http://localhost:8000/integrations/hubspot/companies`, {
                params: { user_id: user, org_id: org, api_key: credentials.api_key }  // Assuming an API key is used
            });
            setCompaniesData(response.data);  // Save the companies data
        } catch (e) {
            alert('Error fetching companies data.');
        }
        setLoadingData(false);
    };

    useEffect(() => {
        setIsConnected(integrationParams?.credentials ? true : false);
    }, [integrationParams]);

    return (
        <>
            <Box sx={{ mt: 2 }}>
                Parameters
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        onClick={isConnected ? () => {} : handleConnectClick}
                        color={isConnected ? 'success' : 'primary'}
                        disabled={isConnecting}
                        style={{
                            pointerEvents: isConnected ? 'none' : 'auto',
                            cursor: isConnected ? 'default' : 'pointer',
                            opacity: isConnected ? 1 : undefined
                        }}
                    >
                        {isConnected ? 'HubSpot Connected' : isConnecting ? <CircularProgress size={20} /> : 'Connect to HubSpot'}
                    </Button>
                </Box>
            </Box>

            {/* Loading companies data */}
            {loadingData && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Display companies data */}
            {companiesData && !loadingData && (
                <Box sx={{ mt: 2, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    <TextField
                        multiline
                        value={JSON.stringify(companiesData, null, 2)}  // Displaying the companies data in JSON format
                        variant="outlined"
                        fullWidth
                        rows={10}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </Box>
            )}
        </>
    );
};
