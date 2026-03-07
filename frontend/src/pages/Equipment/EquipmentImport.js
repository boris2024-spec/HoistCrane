import React, { useState } from 'react';
import { uploadEquipmentFile } from '../../services/api';

function EquipmentImport() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const filename = selectedFile.name.toLowerCase();
            // Check if it's a CSV or Excel file
            if (!filename.endsWith('.csv') && !filename.endsWith('.xlsx')) {
                setError('אנא בחר קובץ CSV או Excel (.xlsx)');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('אנא בחר קובץ');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await uploadEquipmentFile(file);
            setResult(response.data);
            setFile(null);
            // Reset file input
            document.getElementById('csv-file-input').value = '';
        } catch (err) {
            setError(err.response?.data?.error || 'שגיאה בהעלאת הקובץ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="equipment-import" style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>ייבוא ציוד מ-CSV</h2>

                <div style={styles.uploadSection}>
                    <label htmlFor="csv-file-input" style={styles.label}>
                        בחר קובץ CSV או Excel (.xlsx):
                    </label>
                    <input
                        id="csv-file-input"
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={handleFileChange}
                        style={styles.fileInput}
                        disabled={loading}
                    />

                    {file && (
                        <div style={styles.fileInfo}>
                            <span>✓ נבחר קובץ: {file.name}</span>
                            <span style={styles.fileSize}>
                                ({(file.size / 1024).toFixed(2)} KB)
                            </span>
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        style={{
                            ...styles.uploadButton,
                            ...((!file || loading) && styles.uploadButtonDisabled)
                        }}
                    >
                        {loading ? 'מעלה...' : 'העלה'}
                    </button>
                </div>

                {error && (
                    <div style={styles.error}>
                        <strong>שגיאה:</strong> {error}
                    </div>
                )}

                {result && (
                    <div style={styles.success}>
                        <h3 style={styles.resultTitle}>תוצאות הייבוא:</h3>
                        <div style={styles.resultStats}>
                            <div style={styles.stat}>
                                <span style={styles.statLabel}>יובאו בהצלחה:</span>
                                <span style={styles.statValue}>{result.imported}</span>
                            </div>
                            {result.errors > 0 && (
                                <div style={styles.stat}>
                                    <span style={styles.statLabel}>שגיאות:</span>
                                    <span style={{ ...styles.statValue, color: '#e74c3c' }}>
                                        {result.errors}
                                    </span>
                                </div>
                            )}
                        </div>

                        {result.error_details && result.error_details.length > 0 && (
                            <div style={styles.errorDetails}>
                                <strong>פרטי שגיאות:</strong>
                                <ul style={styles.errorList}>
                                    {result.error_details.map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <div style={styles.instructions}>
                    <h4 style={styles.instructionsTitle}>הנחיות:</h4>
                    <ol style={styles.instructionsList}>
                        <li>ניתן להעלות קובץ CSV (UTF-8) או Excel (.xlsx)</li>
                        <li>השורה הראשונה חייבת להכיל כותרות עמודות</li>
                        <li>מספרי ציוד כפולים יידולגו</li>
                        <li>פורמטי תאריך נתמכים: DD/MM/YYYY, DD.MM.YYYY</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '30px',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#2c3e50',
    },
    uploadSection: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '10px',
        fontWeight: '500',
        color: '#34495e',
    },
    fileInput: {
        display: 'block',
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
    },
    fileInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '15px',
        padding: '10px',
        backgroundColor: '#e8f5e9',
        borderRadius: '4px',
        color: '#2e7d32',
    },
    fileSize: {
        fontSize: '12px',
        color: '#666',
    },
    uploadButton: {
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '12px 30px',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    uploadButtonDisabled: {
        backgroundColor: '#95a5a6',
        cursor: 'not-allowed',
    },
    error: {
        backgroundColor: '#ffe5e5',
        color: '#c0392b',
        padding: '15px',
        borderRadius: '4px',
        marginTop: '15px',
    },
    success: {
        backgroundColor: '#e8f5e9',
        padding: '20px',
        borderRadius: '4px',
        marginTop: '15px',
    },
    resultTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '15px',
        color: '#2e7d32',
    },
    resultStats: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    stat: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '4px',
    },
    statLabel: {
        fontWeight: '500',
        color: '#34495e',
    },
    statValue: {
        fontWeight: 'bold',
        fontSize: '18px',
        color: '#27ae60',
    },
    errorDetails: {
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#fff3cd',
        borderRadius: '4px',
    },
    errorList: {
        marginTop: '10px',
        marginLeft: '20px',
        fontSize: '14px',
    },
    instructions: {
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
    },
    instructionsTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#2c3e50',
    },
    instructionsList: {
        marginLeft: '20px',
        lineHeight: '1.8',
        color: '#555',
    },
};

export default EquipmentImport;
