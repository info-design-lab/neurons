#!/usr/bin/python
from PIL import Image
import os, sys

path = os.path.dirname(os.path.realpath(__file__))
dirs = os.listdir( path )

basewidth = 600

def resize():
	for item in dirs:
		if ('.png' in item) or ('.jpg' in item) or ('.PNG' in item):
			print(item)
			img = Image.open(item)

			wpercent = (basewidth/float(img.size[0]))
			hsize = int((float(img.size[1])*float(wpercent)))

			imResize = img.resize((basewidth,hsize), Image.ANTIALIAS)
			imResize.save("Resized/" + item, 'PNG', quality=90)

resize()