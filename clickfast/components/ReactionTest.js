import { useState, useEffect, useRef } from 'react';

export default function ReactionTest() {
  const [state, setState] = useState('ready');
  const [text, setText] = useState('Ready?');
  const [subtext, setSubtext] = useState('클릭하여 시작');
  const startTimeRef = useRef(0);
  const countdownTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const startCountdown = () => {
    let count = 3;
    setText(count.toString());
    setSubtext('');
    setState('countdown');

    countdownTimerRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setText(count.toString());
      } else {
        clearInterval(countdownTimerRef.current);
        const delay = Math.random() * 2000 + 1000;
        setTimeout(() => {
          showClick();
        }, delay);
        setState('waiting');
        setText('');
      }
    }, 1000);
  };

  const showClick = () => {
    setState('click');
    setText('Click!');
    startTimeRef.current = Date.now();
  };

  const showResult = (reactionTime) => {
    setState('result');
    setText(`${reactionTime.toFixed(1)} ms`);
    setSubtext('클릭하여 다시 시작');
  };

  const showTooEarly = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    setState('too-early');
    setText('너무 빨라요!');
    setSubtext('노란색 화면이 나올 때까지 기다리세요');
    setTimeout(() => {
      reset();
    }, 2000);
  };

  const reset = () => {
    setState('ready');
    setText('Ready?');
    setSubtext('클릭하여 시작');
  };

  const handleClick = (e) => {
    e.preventDefault();

    if (state === 'ready') {
      startCountdown();
    } else if (state === 'countdown' || state === 'waiting') {
      showTooEarly();
    } else if (state === 'click') {
      const reactionTime = Date.now() - startTimeRef.current;
      showResult(reactionTime);
    } else if (state === 'result' || state === 'too-early') {
      reset();
    }
  };

  const getBackgroundColor = () => {
    switch (state) {
      case 'ready':
        return '#4CAF50';
      case 'countdown':
        return '#2196F3';
      case 'click':
        return '#FFEB3B';
      case 'result':
        return '#9C27B0';
      case 'too-early':
        return '#f44336';
      default:
        return '#4CAF50';
    }
  };

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          overflow: hidden;
        }
      `}</style>

      <div
        onClick={handleClick}
        onContextMenu={handleClick}
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: getBackgroundColor(),
          transition: 'background-color 0.3s',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            fontSize: window.innerWidth <= 768 ? '48px' : '80px',
            color: 'white',
            textShadow: '4px 4px 0px rgba(0,0,0,0.3)',
            userSelect: 'none',
          }}
        >
          {text}
        </div>
        {subtext && (
          <div
            style={{
              fontSize: window.innerWidth <= 768 ? '18px' : '24px',
              color: 'white',
              marginTop: '20px',
              textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
              userSelect: 'none',
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    </>
  );
}
