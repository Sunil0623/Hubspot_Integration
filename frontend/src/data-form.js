import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

const HubSpotIntegration = () => {
    const [userId, setUserId] = useState("");
    const [orgId, setOrgId] = useState("");
    const [loadedData, setLoadedData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLoad = async () => {
        const userId = "Raghav";
        const orgId = "Test";

        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8000/integrations/hubspot/companies?user_id=${userId}&org_id=${orgId}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error fetching data:", errorText);
                setError(errorText);
                return;
            }

            const data = await response.json();
            console.log("Fetched Data:", data);

            setLoadedData(data); // No need for `?.results`, as the entire data is the result list.
        } catch (error) {
            console.error("Error loading data:", error);
            setError("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" width="100%">
            {loadedData.length > 0 && (
                            <Box sx={{ mt: 2, p: 2, border: "1px solid gray", borderRadius: 2, width: "100%", maxWidth: 600 }}>
                                <Typography variant="h6">Fetched Companies</Typography>
                                {loadedData.map((company) => (
                                    <Box key={company.id} sx={{ p: 1, borderBottom: "1px solid lightgray" }}>
                                        <Typography><strong>ID:</strong> {company.id}</Typography>
                                        <Typography><strong>Name:</strong> {company.properties.name}</Typography>
                                        <Typography><strong>Domain:</strong> {company.properties.domain}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}

            <Button onClick={handleLoad} sx={{ mt: 2 }} variant="contained" disabled={loading}>
                {loading ? "Loading..." : "Load Data"}
            </Button>
            <Button onClick={() => setLoadedData([])} sx={{ mt: 1 }} variant="contained">
                Clear Data
            </Button>
            {error && <Typography color="error">{error}</Typography>}



        </Box>
    );
};

export default HubSpotIntegration;
