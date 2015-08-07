# C:/Python34
# coding: utf-8
# -*- coding: utf-8 -*-
import pygame
from pygame.locals import *

def buttons(ir_session):
    for event in pygame.event.get():
        """
        if event.type == JOYAXISMOTION:
            pass
            #print(event.axis)

        if event.type == JOYHATMOTION:
            pass
            #print("joy =", event.joy)
            #print("value =", event.value)
        """

        if event.type == JOYBUTTONDOWN:
            #print("joy =",event.joy)
            #print("button =", event.button)
            if (event.joy == ir_session.tires_all_joy) & (event.button == ir_session.tires_all_button):
                ir_session.ir.pit_command(3, 0)
                ir_session.ir.pit_command(4, 0)
                ir_session.ir.pit_command(5, 0)
                ir_session.ir.pit_command(6, 0)
                ir_session.tires_all = 0
                ir_session.tires_checked = 1
            if (event.joy == ir_session.tires_none_joy) & (event.button == ir_session.tires_none_button):
                ir_session.ir.pit_command(0, 0)  # On décoche tout
                ir_session.ir.pit_command(1, 0)  # On recoche l'essence
                ir_session.ir.pit_command(2, 0)  # On recoche le tear off
                ir_session.tires_none = 0
                ir_session.tires_checked = 0
            if (event.joy == ir_session.refuel_joy) & (event.button == ir_session.refuel_button):
                ir_session.ir.pit_command(2, int(ir_session.fuelneed + 1))
                ir_session.refuel = 0
            if (event.joy == ir_session.switch_f3box_joy) & (event.button == ir_session.switch_f3box_button):
                ir_session.switch_f3box_nbrequest += 1
            if (event.joy == ir_session.trackmap_joy) & (event.button == ir_session.trackmap_button):
                ir_session.trackmap_nbrequest += 1
