#!/usr/bin/python3
import shutil
import subprocess
import sys
import os
import random

name = sys.argv[1]
version = sys.argv[2]
dirName = "./" + name + "_" + version + "_" + str(random.randint(0, 1000000))

os.makedirs(dirName)

try:
    os.chdir(dirName)

    subprocess.run(["npm", "pack", name + "@" + version], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run(["tar", "-xzvf", name + "-" + version + ".tgz"], stdout=subprocess.DEVNULL,
                   stderr=subprocess.DEVNULL)

    condense = "/Users/sumitsum/Documents/appsmith/as13/app/tern/bin/condense"
    subprocess.call(condense + " package/*.js", shell=True)

except:
    os.chdir("/Users/sumitsum/Documents/appsmith/as13/app")
    shutil.rmtree(dirName)
