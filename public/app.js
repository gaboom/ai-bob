document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connectButton');
    const eventLog = document.getElementById('eventLog');
    const jsonViewer = document.getElementById('jsonViewer');
    const textInput = document.getElementById('textInput');
    const sendTextButton = document.getElementById('sendTextButton');

    let peerConnection;
    let dataChannel;
    let isConnected = false;
    let audioElement;
    let eventCounter = 0;
    const eventDataStore = {};

    function log(message, data) {
        const timestamp = new Date().toLocaleTimeString();
        const eventId = `event-${eventCounter++}`;
        
        const li = document.createElement('li');
        li.id = eventId;
        li.textContent = `[${timestamp}] ${message}`;
        li.dataset.eventId = eventId;
        
        eventDataStore[eventId] = data;

        li.addEventListener('click', () => {
            // Update JSON viewer
            jsonViewer.textContent = JSON.stringify(eventDataStore[eventId], null, 2);
            
            // Update active state for styling
            document.querySelectorAll('#eventLog li').forEach(item => item.classList.remove('active'));
            li.classList.add('active');
        });

        eventLog.appendChild(li);
        eventLog.scrollTop = eventLog.scrollHeight;
    }

    function logSystemMessage(message) {
        log(message, { type: 'system', message });
    }

    async function connect() {
        if (isConnected) {
            disconnect();
            return;
        }

        logSystemMessage('Attempting to connect...');
        connectButton.disabled = true;

        try {
            const response = await fetch('/api/ephemeral_key', { method: 'POST' });
            if (!response.ok) throw new Error(`Failed to get ephemeral key: ${await response.text()}`);
            const { secret } = await response.json();
            logSystemMessage('Ephemeral key received.');

            peerConnection = new RTCPeerConnection();
            audioElement = document.createElement("audio");
            audioElement.autoplay = true;
            peerConnection.ontrack = (e) => {
                logSystemMessage('Received remote audio track.');
                audioElement.srcObject = e.streams[0];
            };

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
            logSystemMessage('Microphone stream added.');

            dataChannel = peerConnection.createDataChannel("oai-events");
            dataChannel.onopen = () => {
                logSystemMessage('Data channel opened.');
                isConnected = true;
                connectButton.textContent = 'Disconnect';
                connectButton.classList.add('connected');
                connectButton.disabled = false;
                textInput.disabled = false;
                sendTextButton.disabled = false;
            };
            dataChannel.onmessage = (event) => {
                const message = JSON.parse(event.data);
                // Filter out delta events to keep the log clean
                if (message.type && message.type.endsWith('.delta')) {
                    return;
                }
                log(`Received: ${message.type}`, message);
            };
            dataChannel.onclose = () => {
                logSystemMessage('Data channel closed.');
                disconnect();
            };

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            logSystemMessage('SDP offer created.');

            const sdpResponse = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2025-06-03', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${secret}`, 'Content-Type': 'application/sdp' },
                body: offer.sdp,
            });

            if (!sdpResponse.ok) throw new Error(`SDP negotiation failed: ${await sdpResponse.text()}`);

            const answer = { type: 'answer', sdp: await sdpResponse.text() };
            await peerConnection.setRemoteDescription(answer);
logSystemMessage('SDP answer received.');

        } catch (error) {
            logSystemMessage(`Connection failed: ${error.message}`);
            connectButton.disabled = false;
        }
    }

    function disconnect() {
        if (dataChannel) dataChannel.close();
        if (peerConnection) {
            peerConnection.getSenders().forEach(s => s.track?.stop());
            peerConnection.close();
        }
        isConnected = false;
        connectButton.textContent = 'Connect';
        connectButton.classList.remove('connected');
        textInput.disabled = true;
        sendTextButton.disabled = true;
        textInput.value = '';
        logSystemMessage('Disconnected.');
    }

    function sendTextMessage() {
        if (!isConnected || !dataChannel || dataChannel.readyState !== 'open') {
            logSystemMessage('Cannot send message: Not connected.');
            return;
        }
        const text = textInput.value.trim();
        if (!text) return;

        const message = {
            type: "conversation.item.create",
            item: { type: "message", role: "user", content: [{ type: "input_text", text: text }] },
            event_id: crypto.randomUUID(),
        };

        log(`Sending text: "${text}"`, message);
        dataChannel.send(JSON.stringify(message));
        
        const responseRequest = { type: "response.create", event_id: crypto.randomUUID() };
        dataChannel.send(JSON.stringify(responseRequest));
        log('Requesting AI response...', responseRequest);

        textInput.value = '';
    }

    connectButton.addEventListener('click', connect);
    sendTextButton.addEventListener('click', sendTextMessage);
    textInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') sendTextMessage();
    });
});
