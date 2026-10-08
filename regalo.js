document.addEventListener('DOMContentLoaded', () => {
  // URL pública donde está publicada esta carpeta, por ejemplo 'https://usuario.github.io/regalo/'.
  // Déjala vacía para usar la dirección actual; con ella se pueden acortar enlaces creados desde localhost.
  const publicSiteUrl = 'https://roma58a.github.io/REGALO/';
  const storeUrl = (window.CARTITAS_STORE_URL || '').replace(/\/$/, '');
  const form = document.getElementById('unified-form');
  if (!form) return;

  const byId = (id) => document.getElementById(id);
  const messageInput = byId('message');
  const senderInput = byId('sender-name');
  const recipientInput = byId('recipient-name');
  const themeSelect = byId('theme');
  const occasionSelect = byId('occasion');
  const closingSelect = byId('closing');
  const linkContainer = byId('link-container');
  const status = byId('form-status');
  const couponCount = byId('num-cupones');
  const couponFields = byId('coupon-fields-container');
  const previewCard = byId('preview-card');
  const draftStatus = byId('draft-status');
  const draftKey = 'cartitas-draft-v1';

  const options = [
    { checkbox: byId('include-spotify'), container: byId('spotify-container'), input: byId('spotify-track') },
    { checkbox: byId('include-soundcloud'), container: byId('soundcloud-container'), input: byId('soundcloud-track') },
    { checkbox: byId('include-cupon'), container: byId('cupon-container') },
    { checkbox: byId('include-roses'), container: byId('rose-option-note') }
  ];

  const setStatus = (message, kind = '') => {
    status.textContent = message;
    status.className = `form-status${kind ? ` ${kind}` : ''}`;
  };

  const updateDraftButtons = () => {
    const hasDraft = localStorage.getItem(draftKey) !== null;
    byId('restore-draft').hidden = !hasDraft;
    byId('delete-draft').hidden = !hasDraft;
  };

  options.forEach(({ checkbox, container, input }) => {
    if (!checkbox || !container) return;
    const update = () => {
      container.hidden = !checkbox.checked;
      if (input) input.required = checkbox.checked;
    };
    checkbox.addEventListener('change', update);
    update();
  });

  const renderCouponFields = () => {
    const previousValues = [...couponFields.querySelectorAll('input')].map((input) => input.value);
    const count = Number(couponCount.value);
    couponFields.replaceChildren();

    for (let index = 0; index < count; index += 1) {
      const label = document.createElement('label');
      label.className = 'field';
      label.htmlFor = `coupon-${index + 1}`;

      const caption = document.createElement('span');
      caption.textContent = `Cupón ${index + 1}`;

      const input = document.createElement('input');
      input.type = 'text';
      input.id = label.htmlFor;
      input.name = 'coupon';
      input.maxLength = 80;
      input.placeholder = ['Un abrazo de oso', 'Una tarde juntos', 'Tu postre favorito', 'Un masaje', 'Una cita sorpresa'][index];
      input.value = previousValues[index] || '';
      input.required = byId('include-cupon').checked;

      label.append(caption, input);
      couponFields.append(label);
    }
  };

  couponCount.addEventListener('change', renderCouponFields);
  byId('include-cupon').addEventListener('change', () => {
    couponFields.querySelectorAll('input').forEach((input) => {
      input.required = byId('include-cupon').checked;
    });
  });
  renderCouponFields();

  let previewUpdateTimer;
  const updatePreview = () => {
    window.clearTimeout(previewUpdateTimer);
    byId('preview-recipient').textContent = recipientInput.value.trim() || 'esa persona especial';
    byId('preview-sender').textContent = senderInput.value.trim() || 'tu nombre';
    byId('preview-message').textContent = messageInput.value.trim() || 'Aquí aparecerá tu mensaje bonito...';
    byId('preview-closing').textContent = closingSelect.value;
    const occasionPreview = byId('preview-occasion');
    occasionPreview.textContent = occasionSelect.value;
    occasionPreview.hidden = !occasionSelect.value;
    byId('preview-roses').hidden = !byId('include-roses').checked;
    byId('character-count').textContent = `${messageInput.value.length} / 700`;
    previewCard.className = `preview-card theme-${themeSelect.value}`;
    previewUpdateTimer = window.setTimeout(() => {
      previewCard.classList.remove('is-updating');
      void previewCard.offsetWidth;
      previewCard.classList.add('is-updating');
      window.setTimeout(() => previewCard.classList.remove('is-updating'), 400);
    }, 160);
  };

  [messageInput, senderInput, recipientInput, themeSelect, occasionSelect, closingSelect].forEach((input) => {
    input.addEventListener('input', updatePreview);
    input.addEventListener('change', updatePreview);
  });
  byId('include-roses').addEventListener('change', updatePreview);
  updatePreview();

  try {
    updateDraftButtons();
  } catch (error) {
    draftStatus.textContent = `No se pudo revisar el borrador local: ${error.message}`;
    draftStatus.classList.add('error');
  }

  const getDraft = () => ({
    sender: senderInput.value,
    recipient: recipientInput.value,
    message: messageInput.value,
    theme: themeSelect.value,
    occasion: occasionSelect.value,
    closing: closingSelect.value,
    spotifyEnabled: byId('include-spotify').checked,
    spotify: byId('spotify-track').value,
    soundcloudEnabled: byId('include-soundcloud').checked,
    soundcloud: byId('soundcloud-track').value,
    couponsEnabled: byId('include-cupon').checked,
    rosesEnabled: byId('include-roses').checked,
    coupons: [...couponFields.querySelectorAll('input')].map((input) => input.value)
  });

  byId('save-draft').addEventListener('click', () => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(getDraft()));
      updateDraftButtons();
      draftStatus.textContent = 'Borrador guardado en este dispositivo. Puedes volver a recuperarlo más tarde.';
      draftStatus.classList.remove('error');
    } catch (error) {
      draftStatus.textContent = `No se pudo guardar el borrador: ${error.message}`;
      draftStatus.classList.add('error');
    }
  });

  byId('restore-draft').addEventListener('click', () => {
    try {
      const savedDraft = JSON.parse(localStorage.getItem(draftKey));
      if (
        !savedDraft ||
        !['sender', 'recipient', 'message', 'theme', 'occasion', 'closing', 'spotify', 'soundcloud'].every((key) => typeof savedDraft[key] === 'string') ||
        !['spotifyEnabled', 'soundcloudEnabled', 'couponsEnabled'].every((key) => typeof savedDraft[key] === 'boolean') ||
        (savedDraft.rosesEnabled !== undefined && typeof savedDraft.rosesEnabled !== 'boolean') ||
        !Array.isArray(savedDraft.coupons) ||
        savedDraft.coupons.length > 5 ||
        !savedDraft.coupons.every((coupon) => typeof coupon === 'string') ||
        !['rosa', 'lavanda', 'sol', 'menta'].includes(savedDraft.theme) ||
        !['', 'Cumpleaños feliz', 'Feliz aniversario', 'Gracias por tanto', 'Estoy aquí para ti', 'Solo porque sí', 'Un día para recordar'].includes(savedDraft.occasion) ||
        !['Con cariño,', 'Con mucho amor,', 'Siempre contigo,', 'Un abrazo enorme,', 'Con todo mi corazón,'].includes(savedDraft.closing)
      ) {
        throw new Error('El borrador guardado está incompleto o dañado.');
      }
      senderInput.value = savedDraft.sender;
      recipientInput.value = savedDraft.recipient;
      messageInput.value = savedDraft.message;
      themeSelect.value = savedDraft.theme;
      occasionSelect.value = savedDraft.occasion;
      closingSelect.value = savedDraft.closing;
      [
        ['include-spotify', savedDraft.spotifyEnabled],
        ['include-soundcloud', savedDraft.soundcloudEnabled],
        ['include-cupon', savedDraft.couponsEnabled],
        ['include-roses', Boolean(savedDraft.rosesEnabled)]
      ].forEach(([id, checked]) => {
        const checkbox = byId(id);
        checkbox.checked = checked;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      });
      byId('spotify-track').value = savedDraft.spotify;
      byId('soundcloud-track').value = savedDraft.soundcloud;
      couponCount.value = String(Math.max(1, Math.min(5, savedDraft.coupons.length || 1)));
      couponCount.dispatchEvent(new Event('change', { bubbles: true }));
      couponFields.querySelectorAll('input').forEach((input, index) => {
        input.value = savedDraft.coupons[index] || '';
      });
      [senderInput, recipientInput, messageInput, themeSelect, occasionSelect, closingSelect].forEach((input) => {
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      draftStatus.textContent = 'Borrador recuperado. Ya puedes seguir editándolo.';
      draftStatus.classList.remove('error');
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      draftStatus.textContent = `No se pudo recuperar el borrador: ${error.message}`;
      draftStatus.classList.add('error');
    }
  });

  byId('delete-draft').addEventListener('click', () => {
    try {
      localStorage.removeItem(draftKey);
      updateDraftButtons();
      draftStatus.textContent = 'Borrador eliminado de este dispositivo.';
      draftStatus.classList.remove('error');
    } catch (error) {
      draftStatus.textContent = `No se pudo borrar el borrador: ${error.message}`;
      draftStatus.classList.add('error');
    }
  });

  const inspirationIdeas = [
    'Quería escribirte porque hay personas que hacen que los días sean mejores, y tú eres una de ellas.',
    'Gracias por estar en mi vida y convertir momentos sencillos en recuerdos especiales.',
    'Si pudiera regalarte algo, sería la oportunidad de verte con los mismos ojos bonitos con los que yo te veo.',
    'Solo quería recordarte que te aprecio muchísimo y que siempre puedes contar conmigo.',
    'No hace falta una fecha especial para decirte lo importante que eres para mí.'
  ];
  let previousIdea = -1;
  document.getElementById('inspire-message').addEventListener('click', () => {
    let nextIdea = Math.floor(Math.random() * inspirationIdeas.length);
    if (inspirationIdeas.length > 1 && nextIdea === previousIdea) {
      nextIdea = (nextIdea + 1) % inspirationIdeas.length;
    }
    previousIdea = nextIdea;
    const idea = inspirationIdeas[nextIdea];
    const updatedMessage = messageInput.value.trim()
      ? `${messageInput.value.trim()}\n\n${idea}`
      : idea;
    messageInput.value = updatedMessage.slice(0, messageInput.maxLength);
    messageInput.dispatchEvent(new Event('input', { bubbles: true }));
    messageInput.focus();
    messageInput.setSelectionRange(messageInput.value.length, messageInput.value.length);
  });

  const validateServiceLink = (rawValue, service) => {
    let parsed;
    try {
      parsed = new URL(rawValue);
    } catch {
      return false;
    }
    if (parsed.protocol !== 'https:') return false;

    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    if (service === 'spotify') {
      return (host === 'open.spotify.com' || host === 'spotify.com') &&
        /^\/(?:intl-[a-z]{2}\/)?(?:track|album|playlist|episode|show)\/[a-zA-Z0-9]+\/?$/i.test(parsed.pathname);
    }
    return (host === 'soundcloud.com' || host === 'm.soundcloud.com') &&
      parsed.pathname.split('/').filter(Boolean).length >= 2;
  };

  const compactMusicLink = (rawValue, service) => {
    const parsed = new URL(rawValue);
    if (service === 'spotify') {
      return parsed.pathname.split('/').filter(Boolean).filter((segment) => !/^intl-[a-z]{2}$/i.test(segment)).join('/');
    }
    return parsed.pathname;
  };

  const bytesToBase64Url = (bytes) => {
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 8192) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const compressPayload = async (payload) => {
    if (typeof CompressionStream !== 'function') {
      throw new Error('Tu navegador no permite crear enlaces compactos. Prueba con una versión reciente de Chrome, Edge, Firefox o Safari.');
    }
    if (!window.crypto?.subtle) {
      throw new Error('El cifrado necesita un navegador actualizado y una página HTTPS (o localhost).');
    }

    const stream = new Blob([JSON.stringify(payload)])
      .stream()
      .pipeThrough(new CompressionStream('deflate'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  };

  const makeLetterUrl = async () => {
    const url = new URL('respuesta.html', publicSiteUrl || window.location.href);
    const payload = [
      senderInput.value.trim(),
      recipientInput.value.trim(),
      messageInput.value.trim(),
      themeSelect.value,
      byId('include-spotify').checked ? compactMusicLink(byId('spotify-track').value.trim(), 'spotify') : '',
      byId('include-soundcloud').checked
        ? compactMusicLink(byId('soundcloud-track').value.trim(), 'soundcloud')
        : '',
      byId('include-cupon').checked
        ? [...couponFields.querySelectorAll('input')].map((input) => input.value.trim())
        : [],
      occasionSelect.value,
      closingSelect.value,
      byId('include-roses').checked
    ];
    const compressedPayload = await compressPayload(payload);
    // Secreto corto de 15 caracteres (88 bits) del que se deriva la clave AES-128.
    const secret = bytesToBase64Url(window.crypto.getRandomValues(new Uint8Array(11)));
    const keyBytes = new Uint8Array(await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))).subarray(0, 16);
    const key = await window.crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt']);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = new Uint8Array(await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, compressedPayload));
    const encryptedPayload = new Uint8Array(iv.length + encrypted.length);
    encryptedPayload.set(iv);
    encryptedPayload.set(encrypted, iv.length);
    url.searchParams.set('c', bytesToBase64Url(encryptedPayload));
    url.hash = `k=${secret}`;
    return url.href;
  };

  const shortenLetterUrl = async (letterUrl) => {
    const destination = new URL(letterUrl);
    const decryptionKey = destination.hash;
    destination.hash = '';

    if (storeUrl) {
      const response = await fetch(storeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: destination.searchParams.get('c')
      });
      const result = await response.json();
      if (!response.ok || !/^[A-Za-z0-9]{10}$/.test(result.id)) throw new Error('El servidor de enlaces no respondió bien.');
      const compact = new URL('respuesta.html', destination);
      compact.search = result.id;
      compact.hash = decryptionKey.slice(3);
      return compact.href;
    }

    const requestUrl = new URL('https://is.gd/create.php');
    requestUrl.searchParams.set('format', 'json');
    requestUrl.searchParams.set('url', destination.href);
    const alphabet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const alias = Array.from(window.crypto.getRandomValues(new Uint8Array(10)), (n) => alphabet[n % alphabet.length]).join('');
    requestUrl.searchParams.set('shorturl', alias);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(requestUrl, { signal: controller.signal });
      const result = await response.json();
      if (!response.ok || !result.shorturl) {
        throw new Error(result.errormessage || 'El servicio de acortado rechazó el enlace.');
      }

      const shortened = new URL(result.shorturl);
      if (shortened.protocol !== 'https:' || shortened.hostname !== 'is.gd') {
        throw new Error('El servicio devolvió una dirección de destino no válida.');
      }
      const compact = new URL('respuesta.html', destination);
      compact.search = shortened.pathname.slice(1);
      compact.hash = decryptionKey.slice(3);
      return compact.href;
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const temporaryInput = document.createElement('textarea');
    temporaryInput.value = text;
    temporaryInput.setAttribute('readonly', '');
    temporaryInput.style.position = 'fixed';
    temporaryInput.style.opacity = '0';
    document.body.append(temporaryInput);
    temporaryInput.select();
    const copied = document.execCommand('copy');
    temporaryInput.remove();
    if (!copied) throw new Error('El navegador no permitió copiar el enlace.');
  };

  const showResult = (url, shorteningError = '') => {
    linkContainer.replaceChildren();

    const heading = document.createElement('h3');
    heading.innerHTML = '<i class="bi bi-check-circle-fill" aria-hidden="true"></i> ¡Tu carta está lista!';
    const description = document.createElement('p');
    description.textContent = shorteningError
      ? `${shorteningError} Te dejo el enlace cifrado completo para que puedas copiarlo.`
      : 'Enlace corto listo. El servidor guarda solo el contenido cifrado; la clave permanece después de # y nunca se envía.';
    const link = document.createElement('a');
    link.className = 'generated-link';
    link.href = url;
    link.textContent = url;
    link.setAttribute('aria-label', 'Abrir la carta cifrada');
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = shorteningError
      ? 'Enlace cifrado completo. Copia esta dirección para compartir la carta.'
      : 'Enlace corto. La clave está en el fragmento final.';

    const actions = document.createElement('div');
    actions.className = 'result-actions';
    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'primary-button';
    copyButton.innerHTML = '<i class="bi bi-copy" aria-hidden="true"></i> Copiar enlace';
    copyButton.addEventListener('click', async () => {
      try {
        await copyText(url);
        copyButton.innerHTML = '<i class="bi bi-check2" aria-hidden="true"></i> ¡Copiado!';
        setStatus('Enlace copiado. Ya puedes enviarlo por donde quieras.', 'success');
      } catch (error) {
        setStatus(error.message, 'error');
      }
    });

    actions.append(copyButton);
    if (navigator.share) {
      const shareButton = document.createElement('button');
      shareButton.type = 'button';
      shareButton.className = 'secondary-button';
      shareButton.innerHTML = '<i class="bi bi-send" aria-hidden="true"></i> Compartir';
      shareButton.addEventListener('click', async () => {
        try {
          await navigator.share({ title: 'Una carta especial para ti', text: 'Te hice una carta con mucho cariño 💌', url });
        } catch (error) {
          if (error.name !== 'AbortError') setStatus('No se pudo abrir el menú para compartir. Prueba copiando el enlace.', 'error');
        }
      });
      actions.append(shareButton);
    }

    linkContainer.append(heading, description, link, actions);
    linkContainer.hidden = false;
    linkContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    if (byId('include-spotify').checked && !validateServiceLink(byId('spotify-track').value.trim(), 'spotify')) {
      setStatus('Pega un enlace HTTPS válido de una canción, álbum o playlist de Spotify.', 'error');
      byId('spotify-track').focus();
      return;
    }
    if (byId('include-soundcloud').checked && !validateServiceLink(byId('soundcloud-track').value.trim(), 'soundcloud')) {
      setStatus('Pega un enlace HTTPS válido de una canción de SoundCloud.', 'error');
      byId('soundcloud-track').focus();
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    setStatus('Cifrando la carta y preparando un enlace corto…');
    try {
      const fullUrl = await makeLetterUrl();
      document.dispatchEvent(new Event('cartitas:celebrate'));
      const isLocalUrl = (address) => {
        const { protocol, hostname } = new URL(address);
        return protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]', ''].includes(hostname);
      };
      if (isLocalUrl(fullUrl)) {
        showResult(fullUrl, 'is.gd no acepta direcciones locales (localhost, 127.0.0.1 o file://). Escribe la URL pública de tu sitio en publicSiteUrl, al inicio de regalo.js, o publica el sitio.');
        setStatus('Enlace completo listo. Para acortarlo, configura la URL pública de tu sitio (publicSiteUrl en regalo.js).', 'warning');
      } else {
        try {
          const shortUrl = await shortenLetterUrl(fullUrl);
          showResult(shortUrl);
          setStatus('Tu carta cifrada ya está lista en un enlace corto.', 'success');
        } catch (error) {
          showResult(fullUrl, `No se pudo acortar el enlace: ${error.message}`);
          setStatus('El acortador no respondió correctamente. Dejé disponible el enlace cifrado completo.', 'error');
        }
      }
    } catch (error) {
      setStatus(`No se pudo crear la carta: ${error.message}`, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  byId('current-year').textContent = new Date().getFullYear();
});
