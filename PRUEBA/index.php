<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="style.css">

        <title>PRUEBA</title>
    </head>
    <body>
        
        <div class="gadget" id="app">
            <div class="antenna">
                <div class="signal" v-if="processing"></div>
                <div class="signal" v-if="processing"></div>
            </div>
            
            <div class="head"></div>
            <div class="body">
                <div class="display"> . . .</div>
                <button class="btn button" id="button1-${UID}" type="button">TRANSMITIR</button>
                <button class="btn button2" id="button2-${UID}" type="input">ENVIAR</button>
            </div>
            <div class="legs">
                <div class="leg"></div>
                <div class="leg"></div>
            </div>
        </div>

        <script src="js.js"></script>
        <script src="https://unpkg.com/buffer/index.js"></script>
        <script src="https://unpkg.com/ws/index.js"></script>
        <script src="https://unpkg.com/configparser/lib/configparser.js"></script>
        <script src="./opus-file-stream.js"></script>
        <script src="./package.json"></script>

    </body>
</html>