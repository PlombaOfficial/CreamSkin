/**
 * AMONG US // INTERACTIVE TASK MINIGAMES
 * Wiring, Card Swipe, Asteroids Blaster, Reactor Memory, O2 Leaves Filter.
 */

export class TaskManager {
  constructor(audio) {
    this.audio = audio;
    this.activeTask = null;
    this.container = document.getElementById('task-modal-container');
    this.modalContent = document.getElementById('task-modal-content');
    this.onTaskCompletedCallback = null;

    document.getElementById('btn-close-task').addEventListener('click', () => {
      this.closeTask();
    });
  }

  openTask(task, onCompleted) {
    this.activeTask = task;
    this.onTaskCompletedCallback = onCompleted;
    this.container.classList.remove('hidden');
    this.modalContent.innerHTML = '';

    document.getElementById('task-modal-title').textContent = `${task.name} (${task.room.toUpperCase()})`;

    if (task.type === 'wires') {
      this.buildWiringTask();
    } else if (task.type === 'card_swipe') {
      this.buildCardSwipeTask();
    } else if (task.type === 'asteroids') {
      this.buildAsteroidsTask();
    } else if (task.type === 'reactor_memory') {
      this.buildReactorMemoryTask();
    } else if (task.type === 'o2_filter') {
      this.buildO2FilterTask();
    } else {
      this.buildSimpleDownloadTask();
    }
  }

  closeTask() {
    this.container.classList.add('hidden');
    this.activeTask = null;
  }

  completeTask() {
    if (this.audio) this.audio.playTaskComplete();
    const successBanner = document.createElement('div');
    successBanner.className = 'task-complete-banner';
    successBanner.textContent = 'ЗАДАНИЕ ВЫПОЛНЕНО!';
    this.modalContent.appendChild(successBanner);

    setTimeout(() => {
      this.closeTask();
      if (this.onTaskCompletedCallback) this.onTaskCompletedCallback(this.activeTask);
    }, 1000);
  }

  // 1. FIX WIRING MINIGAME
  buildWiringTask() {
    const colors = ['#ff3333', '#3388ff', '#ffdd00', '#ff33cc'];
    const leftColors = [...colors].sort(() => Math.random() - 0.5);
    const rightColors = [...colors].sort(() => Math.random() - 0.5);

    const wireBox = document.createElement('div');
    wireBox.className = 'wiring-game-box';
    wireBox.innerHTML = `
      <div class="wire-column wire-left"></div>
      <canvas class="wire-canvas" width="400" height="300"></canvas>
      <div class="wire-column wire-right"></div>
    `;
    this.modalContent.appendChild(wireBox);

    const colL = wireBox.querySelector('.wire-left');
    const colR = wireBox.querySelector('.wire-right');
    const canvas = wireBox.querySelector('.wire-canvas');
    const ctx = canvas.getContext('2d');

    const connections = []; // { leftColor, startX, startY, endX, endY }
    let dragging = null;

    leftColors.forEach((col, idx) => {
      const pin = document.createElement('div');
      pin.className = 'wire-pin';
      pin.style.background = col;
      pin.dataset.color = col;
      colL.appendChild(pin);

      pin.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        dragging = {
          color: col,
          startX: 20,
          startY: 40 + idx * 70,
          curX: e.clientX - rect.left,
          curY: e.clientY - rect.top
        };
      });
    });

    rightColors.forEach((col, idx) => {
      const pin = document.createElement('div');
      pin.className = 'wire-pin';
      pin.style.background = col;
      pin.dataset.color = col;
      colR.appendChild(pin);

      pin.addEventListener('mouseup', () => {
        if (dragging && dragging.color === col) {
          connections.push({
            color: col,
            startX: dragging.startX,
            startY: dragging.startY,
            endX: 380,
            endY: 40 + idx * 70
          });
          dragging = null;
          redraw();

          if (connections.length === 4) {
            this.completeTask();
          }
        }
      });
    });

    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const rect = canvas.getBoundingClientRect();
      dragging.curX = e.clientX - rect.left;
      dragging.curY = e.clientY - rect.top;
      redraw();
    });

    window.addEventListener('mouseup', () => {
      if (dragging) {
        dragging = null;
        redraw();
      }
    });

    const redraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';

      // Draw completed
      connections.forEach(c => {
        ctx.strokeStyle = c.color;
        ctx.beginPath();
        ctx.moveTo(c.startX, c.startY);
        ctx.lineTo(c.endX, c.endY);
        ctx.stroke();
      });

      // Draw active drag
      if (dragging) {
        ctx.strokeStyle = dragging.color;
        ctx.beginPath();
        ctx.moveTo(dragging.startX, dragging.startY);
        ctx.lineTo(dragging.curX, dragging.curY);
        ctx.stroke();
      }
    };
  }

  // 2. SWIPE CARD MINIGAME
  buildCardSwipeTask() {
    const box = document.createElement('div');
    box.className = 'card-swipe-box';
    box.innerHTML = `
      <div class="card-reader-status" id="card-status">ПРОВЕДИТЕ КАРТОЙ</div>
      <div class="card-reader-slot">
        <div class="id-card" id="swipe-card">
          <div class="card-photo">👤</div>
          <div class="card-info">CREWMATE ID<br>#4092-A</div>
        </div>
      </div>
    `;
    this.modalContent.appendChild(box);

    const card = box.querySelector('#swipe-card');
    const status = box.querySelector('#card-status');

    let startX = 0;
    let startTime = 0;
    let isDragging = false;

    card.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startTime = performance.now();
      status.textContent = 'ЧТЕНИЕ ДАННЫХ...';
      status.style.color = '#ffdd00';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const offset = Math.max(0, Math.min(280, e.clientX - startX));
      card.style.transform = `translateX(${offset}px)`;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;

      const duration = performance.now() - startTime;
      const offset = Math.max(0, e.clientX - startX);

      if (offset < 240) {
        status.textContent = 'НЕ ДО КОНЦА. ПОВТОРИТЕ.';
        status.style.color = '#ff3333';
        card.style.transform = 'translateX(0px)';
      } else if (duration < 350) {
        status.textContent = 'СЛИШКОМ БЫСТРО. ПОВТОРИТЕ.';
        status.style.color = '#ff3333';
        card.style.transform = 'translateX(0px)';
      } else if (duration > 1100) {
        status.textContent = 'СЛИШКОМ МЕДЛЕННО. ПОВТОРИТЕ.';
        status.style.color = '#ff3333';
        card.style.transform = 'translateX(0px)';
      } else {
        status.textContent = 'ДОСТУП РАЗРЕШЕН!';
        status.style.color = '#00ff66';
        this.completeTask();
      }
    });
  }

  // 3. DESTROY ASTEROIDS MINIGAME
  buildAsteroidsTask() {
    const box = document.createElement('div');
    box.className = 'asteroids-box';
    box.innerHTML = `
      <div class="asteroids-hud">УНИЧТОЖЕНО: <span id="ast-count">0</span> / 8</div>
      <canvas id="ast-canvas" width="480" height="320"></canvas>
    `;
    this.modalContent.appendChild(box);

    const canvas = box.querySelector('#ast-canvas');
    const ctx = canvas.getContext('2d');
    const countEl = box.querySelector('#ast-count');

    let destroyed = 0;
    const asteroids = [];

    for (let i = 0; i < 8; i++) {
      asteroids.push({
        x: Math.random() * 400 + 40,
        y: Math.random() * 240 + 40,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 20 + Math.random() * 15,
        alive: true
      });
    }

    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      asteroids.forEach(a => {
        if (a.alive && Math.hypot(a.x - clickX, a.y - clickY) < a.size + 10) {
          a.alive = false;
          destroyed++;
          countEl.textContent = destroyed;
          if (this.audio) this.audio.playKill();

          if (destroyed >= 8) {
            this.completeTask();
          }
        }
      });
    });

    const loop = () => {
      if (!this.activeTask || this.activeTask.type !== 'asteroids') return;
      requestAnimationFrame(loop);

      ctx.fillStyle = '#050a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 30; i++) {
        ctx.fillRect((i * 37) % 480, (i * 29) % 320, 2, 2);
      }

      asteroids.forEach(a => {
        if (!a.alive) return;
        a.x = (a.x + a.vx + 480) % 480;
        a.y = (a.y + a.vy + 320) % 320;

        ctx.fillStyle = '#8a6548';
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5a3f2b';
        ctx.lineWidth = 3;
        ctx.stroke();
      });
    };
    loop();
  }

  // 4. REACTOR MEMORY (SIMON SAYS)
  buildReactorMemoryTask() {
    const box = document.createElement('div');
    box.className = 'reactor-game-box';
    box.innerHTML = `
      <div class="reactor-step">ПОВТОРИТЕ КОД (ЭТАП 1 / 3)</div>
      <div class="keypad-grid" id="reactor-grid"></div>
    `;
    this.modalContent.appendChild(box);

    const grid = box.querySelector('#reactor-grid');
    const stepEl = box.querySelector('.reactor-step');

    const sequence = [2, 5, 8, 4];
    let playerSeq = [];
    let curStep = 1;

    for (let i = 1; i <= 9; i++) {
      const btn = document.createElement('button');
      btn.className = 'keypad-btn';
      btn.textContent = i;
      btn.addEventListener('click', () => {
        btn.classList.add('flash');
        setTimeout(() => btn.classList.remove('flash'), 200);

        playerSeq.push(i);
        const idx = playerSeq.length - 1;

        if (playerSeq[idx] !== sequence[idx]) {
          // Wrong
          stepEl.textContent = 'ОШИБКА! ЗАНОГО.';
          stepEl.style.color = '#ff3333';
          playerSeq = [];
        } else if (playerSeq.length === curStep + 1) {
          curStep++;
          if (curStep >= 3) {
            this.completeTask();
          } else {
            stepEl.textContent = `ПОВТОРИТЕ КОД (ЭТАП ${curStep} / 3)`;
            playerSeq = [];
          }
        }
      });
      grid.appendChild(btn);
    }
  }

  // 5. O2 LEAVES FILTER
  buildO2FilterTask() {
    const box = document.createElement('div');
    box.className = 'o2-filter-box';
    box.innerHTML = `
      <div style="font-size: 16px; margin-bottom: 8px;">ПЕРЕТАЩИТЕ ЛИСТЬЯ В ШЛЮЗ СПРАВА</div>
      <div class="o2-intake-circle" id="o2-intake"></div>
    `;
    this.modalContent.appendChild(box);

    const intake = box.querySelector('#o2-intake');
    let leavesLeft = 5;

    for (let i = 0; i < 5; i++) {
      const leaf = document.createElement('div');
      leaf.className = 'floating-leaf';
      leaf.textContent = '🍃';
      leaf.style.left = `${40 + Math.random() * 180}px`;
      leaf.style.top = `${40 + Math.random() * 140}px`;

      let isDragging = false;
      leaf.addEventListener('mousedown', () => isDragging = true);
      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = box.getBoundingClientRect();
        leaf.style.left = `${e.clientX - rect.left - 20}px`;
        leaf.style.top = `${e.clientY - rect.top - 20}px`;

        if (e.clientX - rect.left > 320) {
          // Dragged into chute
          isDragging = false;
          leaf.remove();
          leavesLeft--;
          if (leavesLeft <= 0) {
            this.completeTask();
          }
        }
      });
      window.addEventListener('mouseup', () => isDragging = false);
      intake.appendChild(leaf);
    }
  }

  buildSimpleDownloadTask() {
    const box = document.createElement('div');
    box.className = 'download-task-box';
    box.innerHTML = `
      <button class="btn-game-action" id="btn-start-dl">СКАЧАТЬ ДАННЫЕ</button>
      <div class="dl-progress-bar"><div class="dl-fill" id="dl-fill"></div></div>
    `;
    this.modalContent.appendChild(box);

    const btn = box.querySelector('#btn-start-dl');
    const fill = box.querySelector('#dl-fill');

    btn.addEventListener('click', () => {
      btn.disabled = true;
      btn.textContent = 'ЗАГРУЗКА...';
      let p = 0;
      const interval = setInterval(() => {
        p += 5;
        fill.style.width = `${p}%`;
        if (p >= 100) {
          clearInterval(interval);
          this.completeTask();
        }
      }, 100);
    });
  }
}
