import React from 'react';
import { Box, Typography } from '@mui/material';

const DocumentList = () => {
    return (
        <Box>
            <Typography variant="h4">מסמכים</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
                רשימת מסמכים תוצג כאן
            </Typography>
        </Box>
    );
};

export default DocumentList;
