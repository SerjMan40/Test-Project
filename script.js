let selectedLetters = new Set();
let isSelecting = false;
let startX, startY;

function displayText() {
  const textInput = document.getElementById('textInput').value;
  const output = document.getElementById('output');
  output.innerHTML = '';

  [...textInput].forEach((char, index) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.classList.add('letter');
    span.dataset.index = index;
    span.setAttribute('draggable', true);

    span.addEventListener('click', handleClick);
    span.addEventListener('dragstart', handleDragStart);
    span.addEventListener('dragover', handleDragOver);
    span.addEventListener('drop', handleDrop);
    span.addEventListener('dragend', handleDragEnd);

    output.appendChild(span);
  });
}

function handleClick(event) {
  const isCtrlPressed = event.ctrlKey;
  const letter = event.target;

  if (isCtrlPressed) {
    if (selectedLetters.has(letter)) {
      selectedLetters.delete(letter);
      letter.classList.remove('selected');
    } else {
      selectedLetters.add(letter);
      letter.classList.add('selected');
    }
  } else {
    selectedLetters.forEach((el) => el.classList.remove('selected'));
    selectedLetters.clear();
    selectedLetters.add(letter);
    letter.classList.add('selected');
  }
}

function handleDragStart(event) {
  const letter = event.target;

  if (!selectedLetters.has(letter)) {
    selectedLetters.clear();
    document.querySelectorAll('.letter').forEach((el) => el.classList.remove('selected'));
    selectedLetters.add(letter);
    letter.classList.add('selected');
  }

  selectedLetters.forEach((el) => {
    el.dataset.startX = el.getBoundingClientRect().left;
    el.dataset.startY = el.getBoundingClientRect().top;
  });

  event.dataTransfer.setData('text/plain', '');
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();

  const target = document.elementFromPoint(event.clientX, event.clientY);
  if (target && target.classList.contains('letter') && !selectedLetters.has(target)) {
    selectedLetters.forEach((letter) => {
      const tempText = letter.textContent;
      letter.textContent = target.textContent;
      target.textContent = tempText;
    });
    selectedLetters.clear();
  }
}


function handleDragEnd(event) {
  const deltaX = event.clientX - event.target.dataset.startX;
  const deltaY = event.clientY - event.target.dataset.startY;

  selectedLetters.forEach((letter) => {
    const startX = parseFloat(letter.dataset.startX);
    const startY = parseFloat(letter.dataset.startY);

    letter.style.position = 'absolute';
    letter.style.left = `${startX + deltaX}px`;
    letter.style.top = `${startY + deltaY}px`;
  });

  selectedLetters.clear();
}


document.getElementById('output').addEventListener('contextmenu', (e) => e.preventDefault());
document.getElementById('output').addEventListener('mousedown', (event) => {
  if (event.button === 2) {
    isSelecting = true;
    startX = event.clientX;
    startY = event.clientY;

    const selectionBox = document.createElement('div');
    selectionBox.id = 'selectionBox';
    document.body.appendChild(selectionBox);
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
  }
});

document.addEventListener('mousemove', (event) => {
  if (!isSelecting) return;

  const selectionBox = document.getElementById('selectionBox');
  const width = event.clientX - startX;
  const height = event.clientY - startY;

  selectionBox.style.width = `${Math.abs(width)}px`;
  selectionBox.style.height = `${Math.abs(height)}px`;
  selectionBox.style.left = `${Math.min(startX, event.clientX)}px`;
  selectionBox.style.top = `${Math.min(startY, event.clientY)}px`;

  document.querySelectorAll('.letter').forEach((letter) => {
    const rect = letter.getBoundingClientRect();
    const inSelection = !(rect.right < Math.min(startX, event.clientX) ||
      rect.left > Math.max(startX, event.clientX) ||
      rect.bottom < Math.min(startY, event.clientY) ||
      rect.top > Math.max(startY, event.clientY));

    if (inSelection) {
      selectedLetters.add(letter);
      letter.classList.add('selected');
    } else {
      selectedLetters.delete(letter);
      letter.classList.remove('selected');
    }
  });
});

document.addEventListener('mouseup', () => {
  isSelecting = false;
  const selectionBox = document.getElementById('selectionBox');
  if (selectionBox) selectionBox.remove();
});
