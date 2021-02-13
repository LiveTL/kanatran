/* eslint-disable no-new */

const THRESHOLD = 0.75;

// const commonMistakes = {
//   '屋号': 'Yagoo'
// };

const fixMistakes = (text) => {
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

const srtTimestamp = milliseconds => {
  let seconds = Math.round(milliseconds / 1000);
  // let milliseconds = seconds * 1000
  let minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  milliseconds = milliseconds % 1000;
  seconds = seconds % 60;
  minutes = minutes % 60;
  return (hours < 10 ? '0' : '') + hours + ':' +
    (minutes < 10 ? '0' : '') + minutes + ':' +
    (seconds < 10 ? '0' : '') + seconds + ',' +
    (milliseconds < 100 ? '0' : '') + (milliseconds < 10 ? '0' : '') + milliseconds;
};

// recognition.continuous = true
recognition.interimResults = true;
// let lasttime = new Date().getTime()

recognition.onstart = () => {
  console.debug('Recognition started');
};

let begin = new Date().getTime();
let lastSrt = srtTimestamp(0);
fetch('http://localhost:6969/timestamp').then(d => d.json()).then(d => {
  begin = d.epoch;
  lastSrt = srtTimestamp(d.duration * 1000);
});


const send = async (text, translation, actuallySend = true) => {
  const current = new Date().getTime();
  const time = current - begin;
  const srtTime = [lastSrt, srtTimestamp(time)];
  if (actuallySend) {
    console.log(`${text}\n%c${translation}`, 'font-size: x-large');
    await fetch('/transcript', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: time / 1000,
        srtTime,
        text,
        translation
      })
    });
  }
  lastSrt = srtTime[1];
};

let currentText = '';

setInterval(async () => {
  const backupText = currentText;
  currentText = '';
  const translation = (await translate(backupText)).replaceAll('。', '.');
  await send(backupText, translation, backupText);
}, 15000);

recognition.onresult = async (event) => {
  const result = event.results[event.results.length - 1];
  const resultText = fixMistakes(Array.from(result).map(d => d.transcript).join('\n'));
  const confidence = result[0].confidence;
  console.debug(resultText);
  if (result.isFinal) {
    if (confidence >= THRESHOLD) {
      currentText += resultText + '。';
    }
  }
};

recognition.onspeechend = () => recognition.stop();

recognition.onerror = async e => {
  console.error('Error', e);
  await fetch('/error', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `${e.error}: ${e.message}`
    })
  });
  // await send(' {e.error}:  {e.message}')
};

recognition.onend = () => {
  recognition.start();
};

recognition.lang = 'ja-JP';
