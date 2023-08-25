from flask import Flask, url_for, render_template, request
from google.cloud import texttospeech
import os
import json
from flask_socketio import SocketIO, emit


os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "serviceAccount.json"


app = Flask(__name__)

app.config["SECRET_KEY"] = "F5DD4A2EAC11744AD430AD6CFD2853F8E0818A51913B4D28D5105B7204A044B3"

socketio = SocketIO(app)

client = texttospeech.TextToSpeechClient()

voice = texttospeech.VoiceSelectionParams(
    language_code="en-US", ssml_gender=texttospeech.SsmlVoiceGender.MALE
)

audio_config = texttospeech.AudioConfig(
    audio_encoding=texttospeech.AudioEncoding.MP3
)


# Sockets
@socketio.on('connect')
def ws_connect():
    emit('message', {'name': 'connected'}, broadcast=True)


@socketio.on('user')
def ws_user(data):
    text = data['text']
    id = data['id']
    prev_file = data['prev_file']
    print(data)

    if os.path.isfile(prev_file) is True:
        os.remove(prev_file)

    else:
        cf = open(prev_file, "wb")

    mp_file = open(f"static/tmp/output{id}.mp3", "wb")

    # Set the text input to be synthesized
    synthesis_input = texttospeech.SynthesisInput(text=text)

    # Perform the text-to-speech request on the text input with the selected
    # voice parameters and audio file type
    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    # # The response's audio_content is binary.

    # Write the response to the output file.
    mp_file.write(response.audio_content)
    print('Audio content written to file "output.mp3"')
    mp_file.close()
    emit('user', {"event": "success"}, broadcast=True)


@socketio.on('disconnect')
def ws_disconnect():
    emit('message', {"name": "disconnect"}, broadcast=True)


# Views
@app.route('/')
def home():
    return render_template("home.html")


