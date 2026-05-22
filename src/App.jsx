import React, { useState, useRef, useMemo } from 'react';
import CrosswordComponent from '@jaredreisinger/react-crossword';
import data from './puzzles.json';
 
const Crossword = CrosswordComponent.default ? CrosswordComponent.default : CrosswordComponent;
 
// ── Chronological sort ────────────────────────────────────────────────────────
const MONTHS = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};
 
const parseTitle = (title) => {
  // Handles "Awake! August 8, 2004" or "August 8, 2004" etc.
  const match = title.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (match) {
    const [, month, day, year] = match;
    const monthNum = MONTHS[month];
    if (monthNum !== undefined) {
      return new Date(parseInt(year), monthNum, parseInt(day));
    }
  }
  return new Date(0); // fallback: put unparseable titles first
};
 
function App() {
  // Sort puzzles chronologically once, keeping original indices for stability
  const sortedPuzzles = useMemo(
    () => [...data].sort((a, b) => parseTitle(a.title) - parseTitle(b.title)),
    []
  );
 
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [modalVerse, setModalVerse] = useState({ open: false, ref: '', text: '', url: '' });
  const [isFinished, setIsFinished] = useState(false);
  const crosswordRef = useRef();
 
  // Ref to suppress the celebration when answers are auto-filled via "Show Answers"
  const autoFillingRef = useRef(false);
 
  // ── Show Answers ─────────────────────────────────────────────────────────────
  const handleShowAnswers = () => {
    autoFillingRef.current = true;
    crosswordRef.current?.fillAllAnswers();
    // Reset the flag after the callback has had a chance to fire
    setTimeout(() => {
      autoFillingRef.current = false;
    }, 200);
  };
 
  // ── Clear Puzzle ─────────────────────────────────────────────────────────────
  const handleClear = () => {
    crosswordRef.current?.reset();
    setIsFinished(false); // ← removes the gray overlay
  };
 
  // ── Clue selected → show verse modal ────────────────────────────────────────
  const handleClueSelected = (direction, number) => {
    const clueObj = sortedPuzzles[currentPuzzle].grid[direction.toLowerCase()][number];
    const clueText = clueObj.clue;
    const match = clueText.match(/\(([^)]+)\)/);
 
    if (match) {
      const fullRef = match[1];
      const refParts = fullRef.match(/^(.+?)\s(\d+):(\d+)/);
      if (refParts) {
        const bookName = refParts[1].toLowerCase().trim();
        const chapter = refParts[2];
        const verse = refParts[3];
 
        const bookMap = {
          "genesis": 1, "exodus": 2, "leviticus": 3, "numbers": 4, "deuteronomy": 5,
          "joshua": 6, "judges": 7, "ruth": 8, "1 samuel": 9, "2 samuel": 10,
          "1 kings": 11, "2 kings": 12, "1 chronicles": 13, "2 chronicles": 14,
          "ezra": 15, "nehemiah": 16, "esther": 17, "job": 18, "psalms": 19,
          "proverbs": 20, "ecclesiastes": 21, "song of solomon": 22, "isaiah": 23,
          "jeremiah": 24, "lamentations": 25, "ezekiel": 26, "daniel": 27,
          "hosea": 28, "joel": 29, "amos": 30, "obadiah": 31, "jonah": 32,
          "micah": 33, "nahum": 34, "habakkuk": 35, "zephaniah": 36, "haggai": 37,
          "zechariah": 38, "malachi": 39, "matthew": 40, "mark": 41, "luke": 42,
          "john": 43, "acts": 44, "romans": 45, "1 corinthians": 46,
          "2 corinthians": 47, "galatians": 48, "ephesians": 49, "philippians": 50,
          "colossians": 51, "1 thessalonians": 52, "2 thessalonians": 53,
          "1 timothy": 54, "2 timothy": 55, "titus": 56, "philemon": 57,
          "hebrews": 58, "james": 59, "1 peter": 60, "2 peter": 61, "1 john": 62,
          "2 john": 63, "3 john": 64, "jude": 65, "revelation": 66,
        };
 
        const bookNum = bookMap[bookName];
        if (bookNum) {
          const pad = (num) => num.toString().padStart(3, '0');
          const bookStr = bookNum.toString();
          const chapStr = pad(chapter);
          const verseStr = pad(verse);
          const finalUrl = `https://www.jw.org/en/library/bible/bi12/books/${bookName.replace(/ /g, '-')}/${chapter}/#v${bookStr}${chapStr}${verseStr}`;
 
          setModalVerse({
            open: true,
            ref: fullRef,
            text: clueObj.verseText || 'Verse text loading...',
            url: finalUrl,
          });
          return;
        }
      }
 
      // Fallback
      const fallbackUrl = `https://wol.jw.org/en/wol/l/r1/lp-e?q=${match[1].replace(/ /g, '+')}`;
      setModalVerse({ open: true, ref: match[1], text: clueObj.verseText || 'Verse text loading...', url: fallbackUrl });
    }
  };
 
  // ── Puzzle completed ─────────────────────────────────────────────────────────
  const onCorrect = () => {
    // Only celebrate if the user solved it themselves, not via "Show Answers"
    if (!autoFillingRef.current) {
      setIsFinished(true);
    }
  };
 
  // ── Puzzle change ────────────────────────────────────────────────────────────
  const handlePuzzleChange = (e) => {
    setCurrentPuzzle(parseInt(e.target.value));
    setIsFinished(false);
  };
 
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#fdfdfd' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Bible Crosswords</h1>
        <select
          onChange={handlePuzzleChange}
          value={currentPuzzle}
          style={{ padding: '12px', fontSize: '18px', borderRadius: '8px', width: '100%', maxWidth: '400px' }}
        >
          {sortedPuzzles.map((p, index) => (
            <option key={index} value={index}>{p.title}</option>
          ))}
        </select>
      </header>
 
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={handleShowAnswers}
          style={{ ...styles.toolButton, backgroundColor: '#2980b9' }}
        >
          Show Answers
        </button>
        <button
          onClick={handleClear}
          style={{ ...styles.toolButton, backgroundColor: '#95a5a6' }}
        >
          Clear Puzzle
        </button>
      </div>
 
      <div style={{ position: 'relative' }}>
        <Crossword
          ref={crosswordRef}
          key={currentPuzzle}
          data={sortedPuzzles[currentPuzzle].grid}
          onClueSelected={handleClueSelected}
          onCrosswordCorrect={onCorrect}
          theme={{ gridFontSize: '1.5rem', columnBreakpoint: '768px', focusBackground: '#ffda33' }}
        />
 
        {isFinished && (
          <div style={styles.successOverlay}>
            <div style={styles.successBox}>
              <h2 style={{ color: '#27ae60' }}>🎉 Well Done, Mum!</h2>
              <button
                onClick={(e) => { e.stopPropagation(); setIsFinished(false); }}
                style={styles.openButton}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
 
      {/* ── Verse Modal ── */}
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
              <button
                onClick={(e) => { e.stopPropagation(); setModalVerse({ ...modalVerse, open: false }); }}
                style={styles.closeButton}
              >
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
  linkButton: { padding: '12px', fontSize: '16px', backgroundColor: '#3d9cdc', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' },
  openButton: { padding: '12px 24px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  closeButton: { padding: '15px', fontSize: '18px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  successOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  successBox: { backgroundColor: 'white', padding: '40px', borderRadius: '20px', border: '5px solid #27ae60', textAlign: 'center' },
};
 
export default App;