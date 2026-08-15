/**
 * THE BACKROOMS // DIRECT PEER-TO-PEER (P2P WebRTC) MULTIPLAYER ENGINE
 * 100% Direct computer-to-computer connection via WebRTC DataChannels (PeerJS).
 * Zero server databases, zero lag, 60fps direct UDP synchronization!
 */

export class MultiplayerManager {
  constructor(scene) {
    this.scene = scene;
    this.peer = null;
    this.conn = null; // Active WebRTC DataConnection
    this.connections = new Map(); // For host: peerId -> DataConnection
    
    this.isHost = false;
    this.roomId = null;
    this.playerId = 'player_' + Math.random().toString(36).substring(2, 7);
    this.playerName = 'Оператор-' + Math.floor(100 + Math.random() * 900);

    // Remote Players 3D Avatars
    this.remotePlayers = new Map(); // peerId -> { mesh, spotLight, targetPos, targetYaw }
    
    this.lastBroadcastTime = 0;
    this.ping = 0;
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

      // Initialize PeerJS host with custom room ID
      this.peer = new window.Peer(this.roomId, {
        debug: 1
      });

      this.peer.on('open', (id) => {
        this.roomId = id;
        resolve(id);
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
          // Retry with new code if collision
          this.roomId = this.generateRoomCode();
          this.createRoom(playerName).then(resolve).catch(reject);
        } else {
          reject(err);
        }
      });
    });
  }

  // 2. CLIENT: Connects directly to Friend's computer
  joinRoom(roomId, playerName) {
    return new Promise((resolve, reject) => {
      this.playerName = playerName || this.playerName;
      this.isHost = false;
      this.roomId = roomId.trim().toUpperCase();

      this.peer = new window.Peer();

      this.peer.on('open', () => {
        const conn = this.peer.connect(this.roomId, {
          reliable: false // Ultra-low latency UDP mode
        });

        conn.on('open', () => {
          this.setupConnection(conn);
          resolve(this.roomId);
        });

        conn.on('error', (err) => reject(err));
      });

      this.peer.on('error', (err) => reject(err));
    });
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
    if (packet.type === 'handshake') {
      this.updateRemotePlayer(senderId, { name: packet.name, x: 6, y: 1.6, z: 6, yaw: 0 });
    } else if (packet.type === 'state') {
      this.updateRemotePlayer(senderId, packet);
      // If host, forward to other peers
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

  // Broadcasts player position directly to friend's computer 60 times/sec!
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

  // --- 3D HAZMAT AVATARS FOR REMOTE FRIENDS ---

  createHazmatAvatar(name) {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdfa008, roughness: 0.8 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.35), bodyMat);
    torso.position.y = 0.95;
    group.add(torso);

    // Head with Visor
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), bodyMat);
    head.position.y = 1.55;
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.08), darkMat);
    visor.position.set(0, 0, -0.18);
    head.add(visor);
    group.add(head);

    // Friend's Flashlight beam
    const spotLight = new THREE.SpotLight(0xfffae0, 2.8, 20, Math.PI / 6, 0.5);
    spotLight.position.set(0.2, 1.1, -0.2);
    spotLight.target.position.set(0.2, 1.0, -8);
    group.add(spotLight);
    group.add(spotLight.target);

    // Nametag
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
