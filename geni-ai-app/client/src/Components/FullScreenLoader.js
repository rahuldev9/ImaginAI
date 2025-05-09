import React from 'react';

const FullScreenLoader = () => (
  <div style={styles.overlay}>
    <div style={styles.content}>
      <div style={styles.spinner}></div>
      <div style={styles.text}>Getting Prompt...</div>
    </div>
  </div>
);

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: {
    fontSize: '1.2rem',
    color: '#333',
  },
};

// Add keyframes globally
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }`;
  styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
}

export default FullScreenLoader;
