#!/usr/bin/python
from PIL import Image
import os, sys

path = os.path.dirname(os.path.realpath(__file__))
dirs = os.listdir( path )

basewidth = 600

def resize():
	for item in dirs:
		if ('.png' in item) or ('.jpg' in item) or ('.PNG' in item) or ('.JPG' in item):
			img = Image.open(item)

			wpercent = (basewidth/float(img.size[0]))
			hsize = int((float(img.size[1])*float(wpercent)))

			item = item.replace(".PNG", ".png")
			item = item.replace(".JPG", ".png")

			print(item)
			imResize = img.resize((basewidth,hsize), Image.ANTIALIAS)
			imResize.save("Resized/" + item, 'png', quality=90)

resize()