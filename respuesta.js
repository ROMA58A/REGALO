const base64UrlToBytes = (encoded) => {
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

document.addEventListener('DOMContentLoaded', async () => {
  let params = new URLSearchParams(window.location.search);
  const shortId = /^\?([A-Za-z0-9_]{5,32})$/.exec(window.location.search)?.[1];
  let letterData = null;
  let invalidCompressedLink = false;
  if (shortId) {
    try {
      const storeUrl = (window.CARTITAS_STORE_URL || '').replace(/\/$/, '');
      let encrypted;
      if (storeUrl) {
        const response = await fetch(`${storeUrl}/${shortId}`);
        if (!response.ok) throw new Error('La carta no existe.');
        encrypted = (await response.text()).trim();
      } else {
        const response = await fetch(`https://is.gd/forward.php?format=json&shorturl=${shortId}`);
        const result = await response.json();
        const stored = new URL(result.url);
        if (!stored.searchParams.has('c')) throw new Error('La carta no existe.');
        encrypted = stored.searchParams.get('c');
      }
      params = new URLSearchParams({ c: encrypted });
    } catch {
      params = new URLSearchParams({ c: '' });
    }
  }
  if (params.has('c') || params.has('d')) {
    try {
      if (typeof DecompressionStream !== 'function') {
        throw new Error('Este navegador no admite enlaces compactos.');
      }
      let bytes;
      if (params.has('c')) {
        if (!window.crypto?.subtle) {
          throw new Error('Este navegador no admite el cifrado de la carta.');
        }
        const hash = window.location.hash.slice(1);
        const keyString = new URLSearchParams(hash).get('k') || hash;
        if (!keyString) throw new Error('Falta la clave de cifrado en el enlace.');
        const encryptedBytes = base64UrlToBytes(params.get('c'));
        if (encryptedBytes.length <= 28) throw new Error('El contenido cifrado está incompleto.');
        const keyBytes = keyString.length <= 16
          ? new Uint8Array(await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(keyString))).subarray(0, 16)
          : base64UrlToBytes(keyString);
        const key = await window.crypto.subtle.importKey(
          'raw',
          keyBytes,
          { name: 'AES-GCM' },
          false,
          ['decrypt']
        );
        bytes = new Uint8Array(await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: encryptedBytes.subarray(0, 12) },
          key,
          encryptedBytes.subarray(12)
        ));
      } else {
        bytes = base64UrlToBytes(params.get('d'));
      }
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
      const payload = JSON.parse(await new Response(stream).text());
      if (
        !Array.isArray(payload) ||
        ![7, 9, 10].includes(payload.length) ||
        !payload.slice(0, 6).every((value) => typeof value === 'string') ||
        !Array.isArray(payload[6]) ||
        !payload[6].every((coupon) => typeof coupon === 'string') ||
        (payload.length >= 9 && !payload.slice(7, 9).every((value) => typeof value === 'string')) ||
        (payload.length === 10 && typeof payload[9] !== 'boolean')
      ) {
        throw new Error('El enlace de la carta está incompleto.');
      }
      letterData = {
        senderName: payload[0],
        recipientName: payload[1],
        message: payload[2],
        theme: payload[3],
        spotifyTrack: payload[4],
        soundcloudTrack: payload[5],
        coupons: payload[6],
        occasion: payload[7] || '',
        closing: payload[8] || 'Con cariño,',
        roses: payload.length === 10 && payload[9] === true
      };
    } catch {
      invalidCompressedLink = true;
    }
  }
  const textParam = (name) => letterData ? letterData[name] || '' : params.get(name) || '';
  const letterCard = document.getElementById('letter-card');
  const openButton = document.getElementById('open-letter');
  const letterInside = document.getElementById('letter-inside');
  const hint = document.getElementById('letter-hint');
  const downloadStatus = document.getElementById('download-status');
  const safeThemes = ['rosa', 'lavanda', 'sol', 'menta'];
  const theme = safeThemes.includes(textParam('theme')) ? textParam('theme') : 'rosa';

  letterCard.classList.remove(...safeThemes.map((name) => `theme-${name}`));
  letterCard.classList.add(`theme-${theme}`);
  document.getElementById('senderName').textContent = textParam('senderName') || 'alguien que te quiere';
  document.getElementById('recipientName').textContent = textParam('recipientName') || 'alguien especial';
  document.getElementById('closing').textContent = textParam('closing') || 'Con cariño,';
  const occasion = document.getElementById('letter-occasion');
  occasion.textContent = textParam('occasion');
  occasion.hidden = !occasion.textContent;
  document.getElementById('letter-roses').hidden = !(letterData && letterData.roses);
  document.getElementById('message').textContent = invalidCompressedLink
    ? 'No se pudo abrir esta carta: el enlace cifrado o compacto está dañado, incompleto o tu navegador no lo admite.'
    : textParam('message') || 'Esta carta está vacía. Quizá el enlace se copió incompleto.';

  const coupons = letterData
    ? letterData.coupons.filter((coupon) => coupon.trim())
    : params.getAll('coupon').filter((coupon) => coupon.trim());
  if (!letterData && coupons.length === 0 && params.has('cupons')) {
    coupons.push(...textParam('cupons').split(',').map((coupon) => coupon.trim()).filter(Boolean));
  }
  const couponSection = document.getElementById('coupon-section');
  const couponContainer = document.getElementById('coupon-container');
  coupons.forEach((coupon, index) => {
    const card = document.createElement('article');
    card.className = 'coupon-card';
    card.style.setProperty('--coupon-order', index);
    const icon = document.createElement('span');
    icon.className = 'coupon-card-icon';
    icon.innerHTML = '<i class="bi bi-gift-fill" aria-hidden="true"></i>';
    const label = document.createElement('span');
    label.className = 'coupon-card-label';
    label.textContent = `Cupón de cariño #${index + 1}`;
    const value = document.createElement('strong');
    value.className = 'coupon-card-value';
    value.textContent = coupon;
    const footer = document.createElement('span');
    footer.className = 'coupon-card-footer';
    footer.textContent = 'Válido para una sonrisa';
    const download = document.createElement('button');
    download.type = 'button';
    download.className = 'coupon-download';
    download.dataset.index = String(index);
    download.setAttribute('aria-label', `Descargar el cupón ${index + 1}`);
    download.innerHTML = '<i class="bi bi-download" aria-hidden="true"></i> Descargar';
    card.append(icon, label, value, footer, download);
    couponContainer.append(card);
  });
  if (coupons.length) {
    couponSection.hidden = false;
    document.getElementById('download-coupons').hidden = false;
  }

  const musicSection = document.getElementById('music-section');
  const addMusicPlayer = (service, rawUrl) => {
    let trackUrl;
    try {
      const compactPath = service === 'spotify'
        ? /^(?:track|album|playlist|episode|show)\/[a-zA-Z0-9]+\/?$/i.test(rawUrl)
        : rawUrl.startsWith('/');
      trackUrl = compactPath
        ? new URL(rawUrl, service === 'spotify' ? 'https://open.spotify.com' : 'https://soundcloud.com')
        : new URL(rawUrl);
    } catch {
      return false;
    }
    if (trackUrl.protocol !== 'https:') return false;

    const host = trackUrl.hostname.toLowerCase().replace(/^www\./, '');
    let player;
    if (service === 'spotify' && (host === 'open.spotify.com' || host === 'spotify.com')) {
      const segments = trackUrl.pathname.split('/').filter(Boolean).filter((segment) => !/^intl-[a-z]{2}$/i.test(segment));
      const [type, id] = segments;
      if (!['track', 'album', 'playlist', 'episode', 'show'].includes(type) || !/^[a-zA-Z0-9]+$/.test(id || '')) return false;
      player = document.createElement('iframe');
      player.src = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
      player.height = type === 'track' || type === 'episode' ? '152' : '352';
      player.title = 'Reproductor de Spotify';
      player.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      player.loading = 'lazy';
    } else if (service === 'soundcloud' && (host === 'soundcloud.com' || host === 'm.soundcloud.com') && trackUrl.pathname.split('/').filter(Boolean).length >= 2) {
      const embedUrl = new URL('https://w.soundcloud.com/player/');
      embedUrl.searchParams.set('url', trackUrl.href.replace('://m.soundcloud.com/', '://soundcloud.com/'));
      embedUrl.searchParams.set('color', '#d86b72');
      embedUrl.searchParams.set('auto_play', 'false');
      embedUrl.searchParams.set('hide_related', 'true');
      embedUrl.searchParams.set('show_comments', 'false');
      embedUrl.searchParams.set('show_user', 'true');
      embedUrl.searchParams.set('visual', 'true');
      player = document.createElement('iframe');
      player.src = embedUrl.href;
      player.height = '166';
      player.title = 'Reproductor de SoundCloud';
      player.loading = 'lazy';
    } else {
      return false;
    }

    player.className = 'music-player';
    player.width = '100%';
    player.frameBorder = '0';
    document.getElementById(service === 'spotify' ? 'spotify-container' : 'audio-container').append(player);
    return true;
  };

  let hasValidMusic = false;
  if (textParam('spotifyTrack')) hasValidMusic = addMusicPlayer('spotify', textParam('spotifyTrack')) || hasValidMusic;
  if (textParam('soundcloudTrack')) hasValidMusic = addMusicPlayer('soundcloud', textParam('soundcloudTrack')) || hasValidMusic;
  musicSection.hidden = !hasValidMusic;

  let messageTyped = false;
  const typeMessage = () => {
    if (messageTyped) return;
    messageTyped = true;
    const messageElement = document.getElementById('message');
    const parts = messageElement.textContent.split(/(\s+)/);
    const wordCount = parts.filter((part) => part && !/^\s+$/.test(part)).length;
    const step = Math.min(0.22, 7 / Math.max(wordCount, 1));
    messageElement.textContent = '';
    let index = 0;
    parts.forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        messageElement.append(document.createTextNode(part));
        return;
      }
      const word = document.createElement('span');
      word.className = 'type-word';
      word.style.setProperty('--i', index);
      word.textContent = part;
      messageElement.append(word);
      index += 1;
    });
    messageElement.style.setProperty('--step', `${step}s`);
    messageElement.style.setProperty('--total', `${(index * step + 0.6).toFixed(2)}s`);
    messageElement.classList.add('is-typing');
  };

  const openLetter = () => {
    const opening = openButton.getAttribute('aria-expanded') !== 'true';
    openButton.setAttribute('aria-expanded', String(opening));
    letterInside.hidden = !opening;
    letterCard.classList.toggle('is-open', opening);
    if (opening) typeMessage();
    hint.innerHTML = opening
      ? '<i class="bi bi-heart-fill" aria-hidden="true"></i> Una carta escrita solo para ti'
      : '<i class="bi bi-hand-index-thumb" aria-hidden="true"></i> La carta está esperando a que la abras';
  };
  openButton.addEventListener('click', openLetter);

  const copyMessage = async () => {
    const messageToCopy = `${document.getElementById('message').textContent}\n\n${document.getElementById('closing').textContent} ${document.getElementById('senderName').textContent}`;
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(messageToCopy);
      return;
    }
    const temporaryInput = document.createElement('textarea');
    temporaryInput.value = messageToCopy;
    temporaryInput.setAttribute('readonly', '');
    temporaryInput.style.position = 'fixed';
    temporaryInput.style.opacity = '0';
    document.body.append(temporaryInput);
    temporaryInput.select();
    const copied = document.execCommand('copy');
    temporaryInput.remove();
    if (!copied) throw new Error('El navegador no permitió copiar el mensaje.');
  };

  document.getElementById('copy-message').addEventListener('click', async () => {
    try {
      await copyMessage();
      setDownloadStatus('Mensaje copiado. ¡Ahora puedes guardarlo o enviarlo!');
    } catch (error) {
      setDownloadStatus(error.message, true);
    }
  });
  document.getElementById('share-letter').addEventListener('click', async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Una carta especial para ti',
          text: `${document.getElementById('closing').textContent} ${document.getElementById('senderName').textContent}`,
          url: window.location.href
        });
      } else {
        await copyMessage();
        setDownloadStatus('Este dispositivo no ofrece compartir; copiamos el mensaje para que puedas enviarlo.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') setDownloadStatus(error.message || 'No se pudo compartir la carta.', true);
    }
  });
  document.getElementById('print-letter').addEventListener('click', async () => {
    if (letterInside.hidden) openLetter();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    window.print();
  });

  const setDownloadStatus = (message, isError = false) => {
    downloadStatus.textContent = message;
    downloadStatus.classList.toggle('error', isError);
  };
  const palettes = {
    rosa: { from: '#fff7f2', to: '#f8e5e5', accent: '#c95e6b', paper: '#fffaf6' },
    lavanda: { from: '#f9f5ff', to: '#ece5fa', accent: '#8c73bb', paper: '#fcfaff' },
    sol: { from: '#fffaf0', to: '#f8edcf', accent: '#ba883a', paper: '#fffdf6' },
    menta: { from: '#f3faf5', to: '#deeee2', accent: '#5b9270', paper: '#fbfffb' }
  };
  const palette = palettes[theme];
  const serif = '"Playfair Display", Georgia, "Times New Roman", serif';
  const sans = '"DM Sans", "Segoe UI", Arial, sans-serif';
  const imageWidth = 1080;
  const imageScale = 2;

  const roundedRect = (ctx, x, y, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  };

  const wrapLines = (ctx, text, maxWidth) => {
    const lines = [];
    text.split('\n').forEach((paragraph) => {
      if (!paragraph.trim()) {
        lines.push('');
        return;
      }
      let line = '';
      paragraph.split(/\s+/).filter(Boolean).forEach((word) => {
        const attempt = line ? `${line} ${word}` : word;
        if (ctx.measureText(attempt).width <= maxWidth) {
          line = attempt;
          return;
        }
        if (line) {
          lines.push(line);
          line = '';
        }
        if (ctx.measureText(word).width <= maxWidth) {
          line = word;
          return;
        }
        let piece = '';
        for (const character of word) {
          if (ctx.measureText(piece + character).width > maxWidth) {
            lines.push(piece);
            piece = character;
          } else {
            piece += character;
          }
        }
        line = piece;
      });
      lines.push(line);
    });
    return lines;
  };

  const drawHeart = (ctx, x, y, size, color) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 32, size / 32);
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.bezierCurveTo(-18, -4, -9, -18, 0, -8);
    ctx.bezierCurveTo(9, -18, 18, -4, 0, 9);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  const drawRose = (ctx, x, y, radius) => {
    const gradient = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    gradient.addColorStop(0, '#a92e4b');
    gradient.addColorStop(0.45, '#e86f80');
    gradient.addColorStop(1, '#f7b0a7');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 220, 205, .8)';
    ctx.lineWidth = Math.max(2, radius * 0.07);
    for (let ring = 1; ring <= 3; ring += 1) {
      ctx.beginPath();
      ctx.arc(x + (ring % 2 ? 1 : -1) * radius * 0.06, y, radius * (0.24 * ring + 0.06), ring * 1.1, ring * 1.1 + 4.3);
      ctx.stroke();
    }
  };

  const drawBouquet = (ctx, centerX, top) => {
    const base = top + 262;
    const roses = [[-100, 74, 34], [-44, 30, 38], [24, 14, 40], [92, 62, 35], [38, 92, 36]];
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4c8658';
    ctx.lineWidth = 7;
    roses.forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(centerX, base);
      ctx.lineTo(centerX + dx, top + dy);
      ctx.stroke();
    });
    ctx.fillStyle = '#6fa56e';
    [[-62, 124, -0.5], [58, 128, 0.5], [-30, 150, -0.2], [20, 156, 0.2]].forEach(([dx, dy, angle]) => {
      ctx.save();
      ctx.translate(centerX + dx, top + dy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    roses.forEach(([dx, dy, radius]) => drawRose(ctx, centerX + dx, top + dy, radius));
    ctx.beginPath();
    ctx.moveTo(centerX - 104, top + 152);
    ctx.lineTo(centerX + 104, top + 152);
    ctx.lineTo(centerX + 18, top + 270);
    ctx.lineTo(centerX - 18, top + 270);
    ctx.closePath();
    ctx.fillStyle = '#f3ced1';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, .8)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = '#b94360';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.ellipse(centerX, top + 202, 18, 12, -0.2, 0, Math.PI * 2);
    ctx.stroke();
  };

  const paintLetter = (ctx, totalHeight) => {
    const textLeft = 140;
    const textWidth = imageWidth - 280;
    const gradient = ctx.createLinearGradient(0, 0, imageWidth, totalHeight || 1);
    gradient.addColorStop(0, palette.from);
    gradient.addColorStop(1, palette.to);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, imageWidth, totalHeight || 1);

    if (totalHeight) {
      ctx.strokeStyle = 'rgba(201, 94, 107, .14)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(imageWidth - 40, 40, 190, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(30, totalHeight - 30, 150, 0, Math.PI * 2);
      ctx.stroke();
    }

    let paperBottom = 0;
    const measure = totalHeight === 0;
    const drawPaper = () => {
      if (measure) return;
      ctx.save();
      ctx.shadowColor = 'rgba(88, 58, 47, .16)';
      ctx.shadowBlur = 44;
      ctx.shadowOffsetY = 16;
      roundedRect(ctx, 60, 60, imageWidth - 120, totalHeight - 150, 26);
      ctx.fillStyle = palette.paper;
      ctx.fill();
      ctx.restore();
      roundedRect(ctx, 60, 60, imageWidth - 120, totalHeight - 150, 26);
      ctx.strokeStyle = 'rgba(186, 145, 127, .28)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(202, 157, 140, .14)';
      ctx.fillRect(imageWidth - 120, 60, 2, totalHeight - 150);
    };
    drawPaper();

    let y = 150;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'center';
    ctx.fillStyle = palette.accent;
    ctx.font = `600 26px ${sans}`;
    ctx.fillText('CON MUCHO CARIÑO', imageWidth / 2, y);
    drawHeart(ctx, imageWidth / 2 - 188, y - 8, 24, palette.accent);
    drawHeart(ctx, imageWidth / 2 + 188, y - 8, 24, palette.accent);
    y += 52;

    const occasionText = document.getElementById('letter-occasion').textContent;
    if (occasionText) {
      ctx.font = `700 22px ${sans}`;
      const pillWidth = ctx.measureText(occasionText).width + 56;
      roundedRect(ctx, (imageWidth - pillWidth) / 2, y, pillWidth, 48, 24);
      ctx.fillStyle = 'rgba(255, 255, 255, .85)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(201, 94, 107, .35)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = palette.accent;
      ctx.fillText(occasionText, imageWidth / 2, y + 32);
      y += 82;
    }

    y += 24;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#4d3e3e';
    ctx.font = `600 38px ${serif}`;
    ctx.fillText(`Para ${document.getElementById('recipientName').textContent},`, textLeft, y);
    y += 36;

    ctx.fillStyle = '#56494a';
    ctx.font = `400 33px ${serif}`;
    const lineHeight = 58;
    wrapLines(ctx, document.getElementById('message').textContent, textWidth).forEach((line) => {
      y += lineHeight;
      ctx.fillText(line, textLeft, y);
    });

    if (letterData && letterData.roses) {
      y += 48;
      drawBouquet(ctx, imageWidth / 2, y);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#9a5a68';
      ctx.font = `400 26px ${serif}`;
      ctx.fillText('Unas rosas para ti', imageWidth / 2 + 120, y + 280);
      ctx.textAlign = 'left';
      y += 300;
    }

    y += 74;
    ctx.fillStyle = '#897879';
    ctx.font = `400 30px ${serif}`;
    ctx.fillText(document.getElementById('closing').textContent, textLeft, y);
    y += 56;
    ctx.fillStyle = '#4d3e3e';
    ctx.font = `700 40px ${serif}`;
    ctx.fillText(document.getElementById('senderName').textContent, textLeft, y);
    drawHeart(ctx, textLeft + textWidth - 24, y - 12, 44, palette.accent);
    paperBottom = y + 60;

    if (!measure) {
      ctx.textAlign = 'center';
      ctx.fillStyle = palette.accent;
      ctx.font = `600 22px ${sans}`;
      ctx.fillText('cartitas.', imageWidth / 2, totalHeight - 38);
    }
    return paperBottom;
  };

  const paintCoupon = (ctx, text, index) => {
    const height = 540;
    const gradient = ctx.createLinearGradient(0, 0, imageWidth, height);
    gradient.addColorStop(0, palette.from);
    gradient.addColorStop(1, palette.to);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, imageWidth, height);

    const ticket = { x: 60, y: 60, width: imageWidth - 120, height: height - 120 };
    ctx.save();
    ctx.shadowColor = 'rgba(94, 54, 59, .16)';
    ctx.shadowBlur = 34;
    ctx.shadowOffsetY = 14;
    roundedRect(ctx, ticket.x, ticket.y, ticket.width, ticket.height, 30);
    ctx.fillStyle = '#fffdfa';
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundedRect(ctx, ticket.x, ticket.y, ticket.width, ticket.height, 30);
    ctx.clip();
    const centerY = ticket.y + ticket.height / 2;
    ctx.beginPath();
    ctx.rect(ticket.x - 40, ticket.y - 40, ticket.width + 80, ticket.height + 80);
    ctx.arc(ticket.x, centerY, 26, 0, Math.PI * 2, true);
    ctx.arc(ticket.x + ticket.width, centerY, 26, 0, Math.PI * 2, true);
    ctx.fillStyle = gradient;
    ctx.fill('evenodd');
    ctx.restore();

    roundedRect(ctx, ticket.x + 22, ticket.y + 22, ticket.width - 44, ticket.height - 44, 22);
    ctx.setLineDash([12, 10]);
    ctx.strokeStyle = 'rgba(201, 94, 107, .45)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.beginPath();
    ctx.arc(imageWidth / 2, 150, 32, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(201, 94, 107, .14)';
    ctx.fill();
    drawHeart(ctx, imageWidth / 2, 152, 34, palette.accent);

    ctx.fillStyle = palette.accent;
    ctx.font = `700 22px ${sans}`;
    ctx.fillText(`CUPÓN DE CARIÑO #${index + 1}`, imageWidth / 2, 224);

    const maxTextWidth = ticket.width - 150;
    let fontSize = 54;
    let lines;
    do {
      ctx.font = `600 ${fontSize}px ${serif}`;
      lines = wrapLines(ctx, text, maxTextWidth);
      fontSize -= 4;
    } while (lines.length > 3 && fontSize >= 30);
    const step = fontSize + 4 + 12;
    ctx.fillStyle = '#574144';
    const firstLine = 300 + (3 - Math.min(lines.length, 3)) * (step / 2);
    lines.slice(0, 4).forEach((line, lineIndex) => ctx.fillText(line, imageWidth / 2, firstLine + lineIndex * step));

    ctx.fillStyle = '#9a7a78';
    ctx.font = `500 22px ${sans}`;
    ctx.fillText(`Válido para una sonrisa · de parte de ${document.getElementById('senderName').textContent}`, imageWidth / 2, ticket.y + ticket.height - 38);
  };

  const makeCanvas = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width * imageScale;
    canvas.height = height * imageScale;
    const ctx = canvas.getContext('2d');
    ctx.scale(imageScale, imageScale);
    return { canvas, ctx };
  };

  const loadImageFonts = async () => {
    if (!document.fonts || !document.fonts.load) return;
    try {
      await Promise.all([
        document.fonts.load(`600 38px ${serif}`),
        document.fonts.load(`400 33px ${serif}`),
        document.fonts.load(`700 22px ${sans}`)
      ]);
    } catch {
      // Se usan las fuentes de respaldo si no se pudieron cargar.
    }
  };

  const saveCanvas = (canvas, filename) => new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('No se pudo crear la imagen.'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve();
    }, 'image/png');
  });

  const letterCanvasBlob = async () => {
    await loadImageFonts();
    const scratch = makeCanvas(imageWidth, 10);
    const totalHeight = Math.max(760, Math.ceil(paintLetter(scratch.ctx, 0)) + 90);
    const { canvas, ctx } = makeCanvas(imageWidth, totalHeight);
    paintLetter(ctx, totalHeight);
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo crear la imagen.'))), 'image/png');
    });
  };

  document.getElementById('share-image').addEventListener('click', async () => {
    try {
      const blob = await letterCanvasBlob();
      const file = new File([blob], 'mi-carta.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Una carta especial para ti', text: 'Te escribí una carta' });
        setDownloadStatus('¡Vista previa de la carta compartida!');
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'mi-carta.png';
        link.href = url;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 2000);
        setDownloadStatus('Tu navegador no comparte imágenes directamente; la descargué para que la envíes.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') setDownloadStatus(error.message || 'No se pudo compartir la imagen.', true);
    }
  });

  const downloadLetterImage = async () => {
    await loadImageFonts();
    const scratch = makeCanvas(imageWidth, 10);
    const totalHeight = Math.max(760, Math.ceil(paintLetter(scratch.ctx, 0)) + 90);
    const { canvas, ctx } = makeCanvas(imageWidth, totalHeight);
    paintLetter(ctx, totalHeight);
    await saveCanvas(canvas, 'mi-carta.png');
  };

  const downloadCouponImage = async (index) => {
    await loadImageFonts();
    const { canvas, ctx } = makeCanvas(imageWidth, 540);
    paintCoupon(ctx, coupons[index], index);
    await saveCanvas(canvas, `cupon-${index + 1}.png`);
  };

  document.getElementById('download-letter').addEventListener('click', async () => {
    try {
      await downloadLetterImage();
      setDownloadStatus('¡Tu carta se descargó como imagen!');
    } catch (error) {
      setDownloadStatus(error.message || 'No se pudo descargar la carta.', true);
    }
  });
  document.getElementById('download-coupons').addEventListener('click', async () => {
    try {
      for (let index = 0; index < coupons.length; index += 1) {
        await downloadCouponImage(index);
        await new Promise((resolve) => window.setTimeout(resolve, 350));
      }
      setDownloadStatus(coupons.length === 1 ? '¡Tu cupón se descargó!' : `¡Tus ${coupons.length} cupones se descargaron por separado!`);
    } catch (error) {
      setDownloadStatus(error.message || 'No se pudieron descargar los cupones.', true);
    }
  });
  couponContainer.addEventListener('click', async (event) => {
    const button = event.target.closest('.coupon-download');
    if (!button) return;
    try {
      await downloadCouponImage(Number(button.dataset.index));
      setDownloadStatus(`¡Cupón #${Number(button.dataset.index) + 1} descargado!`);
    } catch (error) {
      setDownloadStatus(error.message || 'No se pudo descargar el cupón.', true);
    }
  });
});
