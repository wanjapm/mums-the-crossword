import React, { useState, useRef } from 'react';
import CrosswordComponent from '@jaredreisinger/react-crossword';
import data from './puzzles.json';

const Crossword = CrosswordComponent.default ? CrosswordComponent.default : CrosswordComponent;

function App() {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [modalVerse, setModalVerse] = useState({ open: false, ref: '', url: '' });
  const [isFinished, setIsFinished] = useState(false);
  const crosswordRef = useRef();

  const handleClueSelected = (direction, number) => {
    const clueText = data[currentPuzzle].grid[direction.toLowerCase()][number].clue;
    const match = clueText.match(/\(([^)]+)\)/);
    if (match) {
      const ref = match[1];
      const url = `https://wol.jw.org/en/wol/l/r1/lp-e?q=${ref.replace(/ /g, '+')}`;
      setModalVerse({ open: true, ref: ref, url: url });
    }
  };

  const onCorrect = () => setIsFinished(true);

  // --- Imperative Methods from Documentation ---
  const handleReset = () => {
    crosswordRef.current?.reset();
    setIsFinished(false);
  };

  const handleFillAll = () => {
    crosswordRef.current?.fillAllAnswers();
  };

  const handleCheck = () => {
    if (crosswordRef.current?.isCrosswordCorrect()) {
      setIsFinished(true);
    } else {
      alert("Not quite finished yet! Keep trying.");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>Bible Crossword Puzzles</h1>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <select 
          onChange={(e) => {
            setCurrentPuzzle(parseInt(e.target.value));
            setIsFinished(false);
          }} 
          value={currentPuzzle}
          style={{ padding: '12px', fontSize: '18px', borderRadius: '8px' }}
        >
          {data.map((p, index) => (
            <option key={index} value={index}>{p.title}</option>
          ))}
        </select>
      </div>

      {/* RESTORED BUTTONS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={handleCheck} style={{...styles.toolButton, backgroundColor: '#27ae60'}}>Check Puzzle</button>
        <button onClick={handleFillAll} style={{...styles.toolButton, backgroundColor: '#2980b9'}}>Show Answers</button>
        <button onClick={handleReset} style={{...styles.toolButton, backgroundColor: '#95a5a6'}}>Clear / Start Over</button>
      </div>

      <div style={{ position: 'relative' }}>
        <Crossword 
          ref={crosswordRef}
          key={currentPuzzle}
          data={data[currentPuzzle].grid} 
          onClueSelected={handleClueSelected}
          onCrosswordCorrect={onCorrect}
          theme={{
            gridFontSize: '1.5rem',
            columnBreakpoint: '768px',
            focusBackground: '#ffda33',
            highlightBackground: '#e9efff',
          }}
        />

        {isFinished && (
          <div style={styles.successOverlay}>
            <div style={styles.successBox}>
              <h2 style={{ color: '#27ae60' }}>🎉 Well Done, Mum!</h2>
              <p>You finished the puzzle correctly.</p>
              <button onClick={() => setIsFinished(false)} style={styles.openButton}>Close</button>
            </div>
          </div>
        )}
      </div>

      {modalVerse.open && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={{ marginTop: 0 }}>Bible Reference</h2>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#2980b9' }}>{modalVerse.ref}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={() => window.open(modalVerse.url, '_blank')} style={styles.openButton}>Open JW.org</button>
              <button onClick={() => setModalVerse({ ...modalVerse, open: false })} style={styles.closeButton}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  toolButton: { padding: '10px 15px', fontSize: '14px', cursor: 'pointer', color: 'white', border: 'none', borderRadius: '5px' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '30px', borderRadius: '15px', maxWidth: '400px', width: '90%', textAlign: 'center' },
  successOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  successBox: { backgroundColor: 'white', padding: '40px', borderRadius: '20px', border: '5px solid #27ae60', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  openButton: { padding: '12px 24px', fontSize: '16px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  closeButton: { padding: '12px 24px', fontSize: '16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default App;