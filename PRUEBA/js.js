const button1 = document.getElementById('button1');

import Buffer from 'buffer/';
import WebSocket from 'ws';
import ConfigParser from 'configparser';
import OpusFileStream from './opus-file-stream';


// Global variables to handle user's SIGINT action
var zelloSocket = null;
var zelloStreamId = null;

function zelloAuthorize(ws, opusStream, username, password, token, channel, onCompleteCb) {
    // Crear un objeto de configuración con los parámetros de autenticación
    const config = {
        username: username,
        password: password,
        token: token,
        channel: channel
    };

    // Analizar la configuración y obtener los valores necesarios
    const configParser = new ConfigParser();
    configParser.read(config);

    // Construir el mensaje de autenticación en el formato esperado por la API de Zello
    const authMessage = {
        type: 'auth',
        username: configParser.get('username'),
        password: configParser.get('password'),
        token: configParser.get('token'),
        channel: configParser.get('channel')
    };

    // Enviar el mensaje de autenticación al servidor de Zello
    ws.send(JSON.stringify(authMessage));

    // Escuchar la respuesta del servidor y verificar si la autenticación fue exitosa
    ws.on('message', (data) => {
        const response = JSON.parse(data);
        if (response.type === 'auth_ok') {
            // La autenticación fue exitosa, llamar al callback de completitud
            onCompleteCb();
        } else {
            // La autenticación falló, manejar el error
            console.error('Error de autenticación:', response.error);
        }
    });
}

function zelloStartStream(ws, opusStream, onCompleteCb) {
    // Construir el mensaje para iniciar la transmisión de audio
    const startStreamMessage = {
        type: 'start_stream',
        codec: 'opus',
        sampleRate: opusStream.sampleRate,
        channelCount: opusStream.channelCount,
        packetDurationMs: opusStream.packetDurationMs,
        framesPerPacket: opusStream.framesPerPacket
    };

    // Enviar el mensaje al servidor de Zello
    ws.send(JSON.stringify(startStreamMessage));

    // Escuchar la respuesta del servidor y verificar si la transmisión se inició correctamente
    ws.on('message', (data) => {
        const response = JSON.parse(data);
        if (response.type === 'stream_started') {
            // La transmisión se inició correctamente, llamar al callback de completitud
            onCompleteCb(response.streamId);
        } else {
            // Hubo un error al iniciar la transmisión, manejar el error
            console.error('Error al iniciar la transmisión:', response.error);
        }
    });
}



function getCurrentTimeMs() {
    return Date.now();
}


function zelloGenerateAudioPacket(data, streamId, packetId) {
    // Crear el paquete de audio en el formato esperado por la API
    const audioPacket = {
        type: 'audio_packet',
        streamId: streamId,
        packetId: packetId,
        data: data
    };

    // Devolver el paquete de audio en formato JSON
    return JSON.stringify(audioPacket);
}



const transmitButton = document.getElementById('button1-${UID}');
const sendButton = document.getElementById('button2-${UID}');

// En la inicialización del código
const opusStream = new OpusFileStream({
    sampleRate: 48000, // Frecuencia de muestreo
    channelCount: 1, // Número de canales de audio (1 para mono, 2 para estéreo)
    packetDurationMs: 20, // Duración de cada paquete de audio en milisegundos
    framesPerPacket: 2, // Número de frames por paquete de audio
});

let zelloStreamId = null;
let packetId = 0;

// Agregar eventos de clic a los botones
transmitButton.addEventListener('click', () => {
    // Iniciar la grabación de audio y transmisión
    startTransmission();
});

sendButton.addEventListener('click', () => {
    // Detener la transmisión y enviar el audio
    stopTransmission();
});

// Función para iniciar la transmisión de audio
function startTransmission() {
    // Iniciar la grabación de audio
    opusStream.startRecording();

    // Iniciar la transmisión de audio
    zelloStartStream(zelloSocket, opusStream, (streamId) => {
        zelloStreamId = streamId;
        // Mostrar indicadores de señal
        document.querySelectorAll('.signal').forEach(signal => signal.style.display = 'block');

        // Enviar los paquetes de audio de forma periódica
        sendAudioPackets();
    });
}

// Función para detener la transmisión y enviar el audio
function stopTransmission() {
    // Detener la transmisión de audio
    zelloStopStream(zelloSocket, zelloStreamId, () => {
        // Ocultar indicadores de señal
        document.querySelectorAll('.signal').forEach(signal => signal.style.display = 'none');

        // Detener la grabación de audio
        opusStream.stopRecording();

        // Enviar el audio al receptor
        sendAudio();
    });
}

function zelloStopStream(ws, streamId, onCompleteCb) {
    // Construir el mensaje para detener la transmisión de audio
    const stopStreamMessage = {
        type: 'stop_stream',
        streamId: streamId
    };

    // Enviar el mensaje al servidor de Zello
    ws.send(JSON.stringify(stopStreamMessage));

    // Esperar la respuesta del servidor y llamar al callback cuando se haya detenido la transmisión
    ws.on('message', (data) => {
        const response = JSON.parse(data);
        if (response.type === 'stream_stopped') {
            onCompleteCb();
        } else {
            console.error('Error al detener la transmisión:', response.error);
        }
    });
}


// Función para enviar el audio
function sendAudio() {
    // Lógica para enviar el audio al receptor y guardarlo en el historial
}

// Función para enviar los paquetes de audio
function sendAudioPackets() {
    // Obtener el siguiente paquete de audio
    const audioData = opusStream.getAudioPacket();

    if (audioData) {
        // Generar el paquete de audio en el formato esperado por la API
        const audioPacket = zelloGenerateAudioPacket(audioData, zelloStreamId, packetId);

        // Enviar el paquete de audio al servidor de Zello Channel
        zelloSocket.send(audioPacket);

        // Incrementar el ID del paquete
        packetId++;
    }

    // Enviar el siguiente paquete de audio después de 20 ms (la duración de un paquete)
    setTimeout(sendAudioPackets, 20);
}















// PARA USO DEL MICROFONO, NO TIENE EL TIEMPO LIMITE DE GRABACIÓN

//let mic;

//    function setup(){
//        
//       mic = new p5.AudioIn();
//       mic.start();
//       createCanvas(windowWidt, windowHeight);
//    }

//BARRAS DE SONIDO, SE DEBEN AJUSTAR EN EL LUGAR DONDE IRAN
    // function draw(){
    //    var val = mic.getLevel();
    //    val = parseInt(map(val, 0, 0.5, 1, 15));
    //   background('rbga(0, 0, 0, 0.2)');

    //   translate(width/2, height/2);
    //    Fill(255);

    //   translate(-180)
    //   for(i = 0; i<val; i++)
    //    {
    //     rect(i+10, 0, 15, -i+10)
    //   }
 //}


 //script de prueba para reproducir los audios guardados, la conexion a donde se guarden los audios no la tengo.
 //let audio1 = new Audio();
 //audio1.src = 'gravel.ogg'

 //   button1.addEventListener('click', function(){
//        console.log('click');
//        audio1.play();
//        audio1.addEventListener('playing', function(){
//            console.log('Audio 1 corriendo');
//        });
        
//        audio1.addEventListener('ended', function(){
//            console.log('audio 1 finalizado')
//        });
//    })

