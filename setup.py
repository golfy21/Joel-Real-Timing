# C:/Python34
# coding: utf-8
# -*- coding: utf-8 -*-

from distutils.core import setup
import py2exe

setup(
    console=[
        {
            "script": "Timing.py",
            "icon_resources": [(0, "timing.ico")]
        }
    ],
)
