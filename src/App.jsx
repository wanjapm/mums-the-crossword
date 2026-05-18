import React, { useState, useRef } from 'react';
import CrosswordComponent from '@jaredreisinger/react-crossword';
import data from './puzzles.json';

const Crossword = CrosswordComponent.default ? CrosswordComponent.default : CrosswordComponent;

function App() {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [modalVerse, setModalVerse] = useState({ open: false, ref: '', text: '', url: '' });
  const [isFinished, setIsFinished] = useState(false);
  const crosswordRef = useRef();

  const handleClueSelected = (direction, number) => {
    const clueObj = data[currentPuzzle].grid[direction.toLowerCase()][number];
    const clueText = clueObj.clue;
    const match = clueText.match(/\(([^)]+)\)/);
    
    if (match) {
      const ref = match[1];
      const url = `https://wol.jw.org/en/wol/l/r1/lp-e?q=${ref.replace(/ /g, '+')}`;
      
      // We now pull the 'verseText' from the JSON if you've added it
      setModalVerse({ 
        open: true, 
        ref: ref, 
        text: clueObj.verseText || "Verse text coming soon...", 
        url: url 
      });
    }
  };

  const onCorrect = () => setIsFinished(true);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#fdfdfd' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Bible Crosswords</h1>
        <select 
          onChange={(e) => { setCurrentPuzzle(parseInt(e.target.value)); setIsFinished(false); }} 
          value={currentPuzzle}
          style={{ padding: '12px', fontSize: '18px', borderRadius: '8px', width: '100%', maxWidth: '400px' }}
        >
          {data.map((p, index) => <option key={index} value={index}>{p.title}</option>)}
        </select>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => crosswordRef.current?.fillAllAnswers()} style={{...styles.toolButton, backgroundColor: '#2980b9'}}>Show Answers</button>
        <button onClick={() => crosswordRef.current?.reset()} style={{...styles.toolButton, backgroundColor: '#95a5a6'}}>Clear Puzzle</button>
      </div>

      <div style={{ position: 'relative' }}>
        <Crossword 
          ref={crosswordRef}
          key={currentPuzzle}
          data={data[currentPuzzle].grid} 
          onClueSelected={handleClueSelected}
          onCrosswordCorrect={onCorrect}
          theme={{ gridFontSize: '1.5rem', columnBreakpoint: '768px', focusBackground: '#ffda33' }}
        />

        {isFinished && (
          <div style={styles.successOverlay}>
            <div style={styles.successBox}>
              <h2 style={{ color: '#27ae60' }}>🎉 Well Done, Mum!</h2>
              <button onClick={() => setIsFinished(false)} style={styles.openButton}>Close</button>
            </div>
          </div>
        )}
      </div>

      {/* --- INLINE VERSE MODAL --- */}
      {modalVerse.open && (
        <div style={styles.overlay} onClick={() => setModalVerse({ ...modalVerse, open: false })}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>{modalVerse.ref}</h2>
            <hr />
            <div style={styles.verseContainer}>
              <p style={styles.verseText}>"{modalVerse.text}"</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => window.open(modalVerse.url, '_blank')} style={styles.linkButton}>
                Read full chapter on JW.org
              </button>
              <button onClick={() => setModalVerse({ ...modalVerse, open: false })} style={styles.closeButton}>
                Back to Puzzle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  toolButton: { padding: '10px 15px', fontSize: '14px', cursor: 'pointer', color: 'white', border: 'none', borderRadius: '5px' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '30px', borderRadius: '20px', maxWidth: '500px', width: '90%', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  verseContainer: { margin: '20px 0', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '10px', borderLeft: '5px solid #3498db' },
  verseText: { fontSize: '1.3rem', fontStyle: 'italic', lineHeight: '1.6', color: '#34495e', textAlign: 'left' },
  linkButton: { padding: '12px', fontSize: '16px',backgroundColor: '#3d9cdc',color: 'white', border: 'none',borderRadius: '8px',cursor: 'pointer',fontWeight: 'bold',textDecoration: 'none',textAlign: 'center'},
  openButton: { padding: '12px 24px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  closeButton: { padding: '15px', fontSize: '18px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  successOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  successBox: { backgroundColor: 'white', padding: '40px', borderRadius: '20px', border: '5px solid #27ae60', textAlign: 'center' }
};

export default App;