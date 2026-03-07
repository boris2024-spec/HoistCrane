import React from 'react';
import { Box, Typography } from '@mui/material';

const IssueList = () => {
    return (
        <Box>
            <Typography variant="h4">תקלות</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
                רשימת תקלות תוצג כאן
            </Typography>
        </Box>
    );
};

export default IssueList;
