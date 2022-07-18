
from fileinput import filename
from flask import Flask
from flask import request
from flask import render_template
from flask import send_file
from flask import flash, redirect
import moviepy.editor as mpe
import ffmpeg


from config import *
import os

app = Flask(__name__)

paths=[]

@app.route('/')
def hello_world():
    return render_template("musync.html")

@app.route('/file',methods=['POST'])
def uploadVideo():
	# check if video savepath exists
	if  not os.path.isdir("./clips"):
		os.mkdir("./clips")
	try:
		file = request.files['file']
		filepath = video_savepath + file.filename
		file.save(filepath)
	except:
		return "ERROR"
	return str(filepath)


@app.route('/merge')
def combine_audio():
  fileName=os.listdir("clips")
  print(fileName)
  input_video = ffmpeg.input('clips/'+fileName[0])

  input_audio = ffmpeg.input('clips/'+fileName[1])

  ffmpeg.concat(input_video, input_audio, v=1, a=1).output('clips/main.mp4').run()
  my_clip = mpe.VideoFileClip("clips/main.mp4")
  new_clip = my_clip.set_duration(15)
  new_clip.write_videofile("clips/test.mp4",fps=25)


  # videoPath=os.path.join("clips",fileName[0])
  # audioPath=os.path.join("clips",fileName[1])
  # print(videoPath,audioPath)
  
  # print(new_clip)
  # audio_background = mpe.AudioFileClip(audioPath)
  # final_clip = my_clip.set_audio(audio_background)
  # final_clip.write_videofile("clips/test.mp4",fps=25)
  path = "clips/test.mp4"
  return send_file(path, as_attachment=True)


if __name__=="__main__":
  app.run()

