const watcherVersion = '1.2.0';

// dynamic validation in case a range of versions are supported
const watcherVersionSplit = watcherVersion.split('.').map(d => parseInt(d));

/* eslint-disable no-new */

const THRESHOLD = 0.75;

// const commonMistakes = {
//   '屋号': 'Yagoo'
// };

const fixMistakes = text => {
  // for (const item in text) {
  //   text.replaceAll(item, commonMistakes[item])
  // }
  return text;
};

setInterval(() => {
  window.scrollTo(0, document.body.scrollHeight);
}, 100);

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
const messagehistory = new Array(10);
let tlIndex = 0;

const translate = text => {
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => {
    const e = document.createElement('div');
    let i = (tlIndex + 1) % messagehistory.length;
    while (i !== tlIndex) {
      const thistl = messagehistory[i];
      if (thistl) {
        e.innerHTML += `
          <span>${thistl}</span>
        `;
      }
      i = (i + 1) % messagehistory.length;
    }
    const tlelement = document.createElement('span');
    tlelement.textContent = text;
    e.appendChild(tlelement);
    let observer = null;
    const callback = () => {
      const content = tlelement.textContent.replace(/[\u2018\u2019]/g, '\'').replace(/[\u201C\u201D]/g, '"');
      messagehistory[tlIndex] = text;
      tlIndex = (tlIndex + 1) % messagehistory.length;
      e.remove();
      observer.disconnect();
      resolve(content);
    };
    observer = new MutationObserver(callback);
    observer.observe(tlelement,
      { attributes: true, childList: true, characterData: true });
    document.body.appendChild(e);
  });
};

const logError = (e) => {
  return fetch('/error', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `${e.error}: ${e.message}`
    })
  });
};

const logNormal = data => {
  return fetch('/logs', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: data
    })
  });
};

// eslint-disable-next-line no-undef
googleTranslateElementInit = () => {
  // eslint-disable-next-line no-undef
  new google.translate.TranslateElement({
    pageLanguage: 'jp'
    // layout: google.translate.TranslateElement.InlineLayout.SIMPLE
  }, 'google_translate_element');
  setTimeout(() => {
    const e = document.querySelector('.goog-te-combo');
    e.value = 'en';
    e.dispatchEvent(new Event('change'));
    recognition.start();
  }, 1000);
};

// recognition.continuous = true;
recognition.interimResults = true;
// let lasttime = new Date().getTime()

recognition.onstart = () => {
  console.debug('Recognition started');
};

let begin = new Date().getTime();

const checkVersion = runnerVersion => {
  try {
    runnerVersion = runnerVersion.split('.').map(d => parseInt(d));
    return (runnerVersion[0] === watcherVersionSplit[0] &&
      runnerVersion[1] === watcherVersionSplit[1]);
  } catch (e) {
    return false;
  }
};

let env = {};
fetch('/env').then(r => r.json()).then(async r => {
  env = r;
  if (!checkVersion(env.RUNNER_VERSION)) {
    await logError('Runner and watcher versions are incompatible');
    window.close();
  }
  API = env.API_URL || API;
  fetch('/timestamp').then(d => d.json()).then(d => {
    const PORT = parseInt(env.INTERCOM_PORT || 42069);
    begin -= d.current * 1000;
    fetch(`http://localhost:${PORT}/timestamp`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video: env.VIDEO,
        playBegin: begin.getTime()
      })
    });
  });
  openConnection();
});

let API = 'https://api.livetl.app';
let sessionToken = '';
// https://livetl.app/en/docs/api
// step 1: open the connection
function openConnection() {
  fetch(`${API}/session/open`,{
    method: 'GET',
    headers: {
      'Client-Name': 'Kanatran',
      'API-Key': env.LIVETL_API_KEY
    }
  }).then(r => r.text()).then(token => {
    sessionToken = token;
    logNormal(token);
    keepAlive();
  });
}

// step 2: Keep alive, but no
function keepAlive() {
  // eslint-disable-next-line no-unused-vars
  const interval = setInterval(async () => {
    const refreshFetch = async () => {
      const response = await fetch(`${API}/session/ping`, {
        method: 'GET',
        headers: {
          'Client-Name': 'Kanatran',
          'Session-Token': sessionToken,
          'Cache-Control': 'no-cache'
        },
        cache: 'no-cache'
      });
        // eslint-disable-next-line no-unused-vars
      const pong = await response.text();
      logNormal(pong);
    };
    const runRefresh = () => {
      refreshFetch().catch(e => {
        logError(e);
        // eslint-disable-next-line no-unused-vars
        setTimeout(runRefresh, 1000);
      });
    };
    runRefresh();
  }, 300000);
}
// step 3: send to LiveTL api
// step 4: profit
const send = async (text, translation) => {
  const current = new Date().getTime();
  const time = current - begin;
  if (text || translation) {
    console.log(`${text}\n%c${translation}`, 'font-size: x-large');
    // keep this for logging purposes
    logNormal(JSON.stringify({
      timestamp: time / 1000,
      text,
      translation
    }));
    // post to LiveTL API here
    if (sessionToken) {
      fetch(`${API}/translations/${env.VIDEO}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Client-Name': 'Kanatran',
          'User-Agent': 'Kanatran',
          'Session-Token': sessionToken
        },
        body: JSON.stringify({
          language: 'en',
          transcription: text,
          translation,
          start: time / 1000
        })
      }).catch(error => {
        logError(error);
      });
    } else {
      logError(new TypeError('Session Token is unusable'));
    }
  }
};

let currentText = '';

const translateChunk = async () => {
  const backupText = currentText;
  currentText = '';
  const translation = (await translate(backupText)).replaceAll('。', '.');
  await send(backupText, translation);
};

recognition.onresult = async event => {
  const result = event.results[event.results.length - 1];
  const resultText = fixMistakes(Array.from(result).map(d => d.transcript).join('\n'));
  const confidence = result[0].confidence;
  console.debug(resultText);
  if (result.isFinal) {
    if (confidence >= THRESHOLD) {
      currentText += resultText.split(' ').join('、') + '。';
      await translateChunk();
    }
  }
};

recognition.onaudioend = () => recognition.stop();

recognition.onerror = async e => {
  console.error('Error', e);
  logError(e);
};

recognition.onend = () => {
  recognition.start();
};

recognition.lang = 'ja-JP';
