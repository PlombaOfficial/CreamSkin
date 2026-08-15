/**
 * THE BACKROOMS // ROBUST P2P WebRTC MULTIPLAYER ENGINE
 * Includes Google & Cloudflare STUN servers, automatic code formatting,
 * connection timeout handling, and friendly Russian error explanations.
 */

export class MultiplayerManager {
  constructor(scene) {
    this.scene = scene;
    this.peer = null;
    this.conn = null;
    this.connections = new Map();
    
    this.isHost = false;
    this.roomId = null;
    this.playerId = 'p_' + Math.random().toString(36).substring(2, 7);
    this.playerName = 'Оператор-' + Math.floor(100 + Math.random() * 900);

    this.remotePlayers = new Map();
    this.lastBroadcastTime = 0;
  }

  // Reliable Public STUN Configuration
  getPeerOptions() {
    return {
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun.cloudflare.com:3478' }
        ]
      }
    };
  }

  formatCode(code) {
    return (code || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  generateRoomCode() {
    return 'BCK' + Math.floor(1000 + Math.random() * 9000);
  }

  // 1. HOST: Creates P2P Room on local computer
  createRoom(playerName) {
    return new Promise((resolve, reject) => {
      this.playerName = playerName || this.playerName;
      this.isHost = true;
      this.roomId = this.generateRoomCode();

      try {
        if (this.peer) this.peer.destroy();
      } catch (e) {}

      this.peer = new window.Peer(this.roomId, this.getPeerOptions());

      this.peer.on('open', (id) => {
        this.roomId = id;
        resolve(id);
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
          // If code is taken, generate new one
          this.roomId = this.generateRoomCode();
          this.createRoom(playerName).then(resolve).catch(reject);
        } else {
          const msg = this.translateError(err);
          reject(new Error(msg));
        }
      });
    });
  }

  // 2. CLIENT: Connects to Host's room
  joinRoom(roomId, playerName) {
    return new Promise((resolve, reject) => {
      this.playerName = playerName || this.playerName;
      this.isHost = false;
      const cleanCode = this.formatCode(roomId);

      if (!cleanCode) {
        return reject(new Error('Введите код комнаты (например, BCK4092)!'));
      }

      this.roomId = cleanCode;

      try {
        if (this.peer) this.peer.destroy();
      } catch (e) {}

      this.peer = new window.Peer(this.getPeerOptions());

      let hasResolved = false;

      // 10 second timeout safety
      const timeoutTimer = setTimeout(() => {
        if (!hasResolved) {
          hasResolved = true;
          reject(new Error('Комната ' + this.roomId + ' не найдена. Убедитесь, что ваш друг нажал «СОЗДАТЬ КОМНАТУ» и находится в игре!'));
        }
      }, 10000);

      this.peer.on('open', () => {
        const conn = this.peer.connect(this.roomId, {
          reliable: true
        });

        conn.on('open', () => {
          if (!hasResolved) {
            hasResolved = true;
            clearTimeout(timeoutTimer);
            this.setupConnection(conn);
            resolve(this.roomId);
          }
        });

        conn.on('error', (err) => {
          if (!hasResolved) {
            hasResolved = true;
            clearTimeout(timeoutTimer);
            reject(new Error(this.translateError(err)));
          }
        });
      });

      this.peer.on('error', (err) => {
        if (!hasResolved) {
          hasResolved = true;
          clearTimeout(timeoutTimer);
          reject(new Error(this.translateError(err)));
        }
      });
    });
  }

  translateError(err) {
    if (!err) return 'Неизвестная ошибка сети.';
    if (err.type === 'peer-unavailable') {
      return `Комната ${this.roomId} не найдена! Убедитесь, что хост уже нажал «Создать комнату» и находится в игре.`;
    }
    if (err.type === 'network') {
      return 'Ошибка сети. Проверьте подключение к интернету.';
    }
    if (err.type === 'browser-incompatible') {
      return 'Ваш браузер не поддерживает WebRTC. Попробуйте Chrome или Edge.';
    }
    return err.message || err.type || 'Не удалось подключиться к комнате.';
  }

  setupConnection(conn) {
    this.conn = conn;
    this.connections.set(conn.peer, conn);

    conn.on('data', (packet) => {
      this.handleIncomingData(conn.peer, packet);
    });

    conn.on('close', () => {
      this.removeRemotePlayer(conn.peer);
      this.connections.delete(conn.peer);
      if (window.showGameNotification) {
        window.showGameNotification('Напарник отключился.');
      }
    });

    // Send initial handshake
    conn.send({
      type: 'handshake',
      name: this.playerName
    });

    if (window.showGameNotification) {
      window.showGameNotification('⚡ Прямое P2P соединение установлено!');
    }
  }

  handleIncomingData(senderId, packet) {
    if (!packet) return;

    if (packet.type === 'handshake') {
      this.updateRemotePlayer(senderId, { name: packet.name, x: 6, y: 1.6, z: 6, yaw: 0 });
    } else if (packet.type === 'state') {
      this.updateRemotePlayer(senderId, packet);
      if (this.isHost) {
        this.broadcastToOthers(senderId, packet);
      }
    } else if (packet.type === 'chat') {
      if (window.onChatMessageReceived) {
        window.onChatMessageReceived(packet);
      }
      if (this.isHost) {
        this.broadcastToOthers(senderId, packet);
      }
    } else if (packet.type === 'elevator') {
      if (window.onElevatorReached) {
        window.onElevatorReached(packet.level);
      }
    }
  }

  broadcastToOthers(excludePeerId, data) {
    this.connections.forEach((conn, peerId) => {
      if (peerId !== excludePeerId && conn.open) {
        conn.send(data);
      }
    });
  }

  broadcastPlayerState(pos, yaw, pitch, isFlashlightOn, sanity) {
    const packet = {
      type: 'state',
      name: this.playerName,
      x: Number(pos.x.toFixed(2)),
      y: Number(pos.y.toFixed(2)),
      z: Number(pos.z.toFixed(2)),
      yaw: Number(yaw.toFixed(2)),
      pitch: Number(pitch.toFixed(2)),
      flashlight: isFlashlightOn,
      sanity: Math.round(sanity)
    };

    if (this.isHost) {
      this.connections.forEach(conn => {
        if (conn.open) conn.send(packet);
      });
    } else if (this.conn && this.conn.open) {
      this.conn.send(packet);
    }
  }

  sendChatMessage(text) {
    const msg = {
      type: 'chat',
      sender: this.playerName,
      text: text.trim(),
      timestamp: Date.now()
    };

    if (this.isHost) {
      this.connections.forEach(conn => {
        if (conn.open) conn.send(msg);
      });
    } else if (this.conn && this.conn.open) {
      this.conn.send(msg);
    }

    if (window.onChatMessageReceived) {
      window.onChatMessageReceived(msg);
    }
  }

  createHazmatAvatar(name) {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdfa008, roughness: 0.8 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.35), bodyMat);
    torso.position.y = 0.95;
    group.add(torso);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), bodyMat);
    head.position.y = 1.55;
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.08), darkMat);
    visor.position.set(0, 0, -0.18);
    head.add(visor);
    group.add(head);

    const spotLight = new THREE.SpotLight(0xfffae0, 2.8, 20, Math.PI / 6, 0.5);
    spotLight.position.set(0.2, 1.1, -0.2);
    spotLight.target.position.set(0.2, 1.0, -8);
    group.add(spotLight);
    group.add(spotLight.target);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#ffea55';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(name, 128, 42);

    const tagTex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: tagTex });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.y = 2.0;
    sprite.scale.set(1.5, 0.38, 1);
    group.add(sprite);

    this.scene.add(group);
    return { group, spotLight };
  }

  updateRemotePlayer(pId, data) {
    if (!this.remotePlayers.has(pId)) {
      const avatar = this.createHazmatAvatar(data.name || 'Оператор');
      this.remotePlayers.set(pId, {
        mesh: avatar.group,
        spotLight: avatar.spotLight,
        targetPos: new THREE.Vector3(data.x, data.y - 1.6, data.z),
        targetYaw: data.yaw || 0
      });
    }

    const p = this.remotePlayers.get(pId);
    p.targetPos.set(data.x, data.y - 1.6, data.z);
    p.targetYaw = data.yaw || 0;
    p.spotLight.visible = (data.flashlight !== false);
  }

  removeRemotePlayer(pId) {
    if (this.remotePlayers.has(pId)) {
      const p = this.remotePlayers.get(pId);
      this.scene.remove(p.mesh);
      this.remotePlayers.delete(pId);
    }
  }

  update(delta) {
    this.remotePlayers.forEach((p) => {
      p.mesh.position.lerp(p.targetPos, 0.35);
      p.mesh.rotation.y += (p.targetYaw - p.mesh.rotation.y) * 0.35;
    });
  }
}
