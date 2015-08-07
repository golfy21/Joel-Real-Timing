import pygame
from pygame.locals import *

pygame.init()

# On compte les joysticks
nb_joysticks = pygame.joystick.get_count()
# Et on en crée un s'il y a en au moins un
if nb_joysticks > 0:
    mon_joystick = {}
    for i in range(nb_joysticks):
        mon_joystick[i] = pygame.joystick.Joystick(i)
        mon_joystick[i].init()

    # On compte les boutons
    #nb_boutons = mon_joystick0.get_numbuttons()

    continuer = 1
    while continuer:
        for event in pygame.event.get():
            """
            if event.type == JOYAXISMOTION:
                print(event.axis)
            if event.type == JOYHATMOTION:
                print("joy =", event.joy)
                print("value =", event.value)
            """
            if event.type == JOYBUTTONDOWN:
                print("joy =",event.joy)
                print("button =", event.button)
            if event.type == QUIT:
                continuer = 0

else:
    print("Vous n'avez pas branché de Joystick...")
