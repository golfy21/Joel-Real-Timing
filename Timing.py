# C:/Python34
# coding: utf-8
# -*- coding: utf-8 -*-

import http.server
import socketserver
import threading
from get_ip import *
import asyncio
import websockets
import json
from recupere_donnees import *
#from init_session import *
from calculs import *

from buttons_cmd import *

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


# WEB SERVEUR
def mon_serveur():
    # On lit le parametre PORT dans le fichier txt
    fichier = open(".config/webserver_port.txt", "r")
    PORT = int(fichier.read())
    fichier.close()
    handler = http.server.SimpleHTTPRequestHandler
    httpd = socketserver.TCPServer(("", PORT), handler)
    print("Listen on port :", PORT)
    httpd.serve_forever()


# Launch all the datas calculations
def calc_donnees(typ, ir_session):
    #global ir_session
    try:
        ir_session.sessiontime_old = ir_session.sessiontime
        for i in ir_session.donnees["drivers_true"]:
            ir_session.donnees_old["drivers"][i] = {}
            ir_session.donnees_old["drivers"][i]["lc"] = ir_session.donnees["drivers"][i]["lc"]
            ir_session.donnees_old["drivers"][i]["distpct"] = ir_session.donnees["drivers"][i]["distpct"]
            ir_session.donnees_old["drivers"][i]["distpctraw"] = ir_session.donnees["drivers"][i]["distpctraw"]
            ir_session.donnees_old["drivers"][i]["speed"] = ir_session.donnees["drivers"][i]["speed"]
            ir_session.donnees_old["drivers"][i]["speedraw"] = ir_session.donnees["drivers"][i]["speedraw"]
            ir_session.donnees_old["drivers"][i]["offtrack"] = ir_session.donnees["drivers"][i]["offtrack"]
    except:

        ir_session.sessiontime_old = ir_session.ir["SessionTime"]
        for i in ir_session.donnees["drivers_true"]:
            ir_session.donnees_old["drivers"][i] = {}
            ir_session.donnees_old["drivers"][i]["lc"] = ir_session.ir["CarIdxLap"][i] - 1
            ir_session.donnees_old["drivers"][i]["distpct"] = ir_session.donnees_old["drivers"][i]["lc"] + \
                                                              ir_session.ir["CarIdxLapDistPct"][i]
            ir_session.donnees_old["drivers"][i]["distpctraw"] = ir_session.donnees_old["drivers"][i]["lc"] + \
                                                              ir_session.ir["CarIdxLapDistPct"][i]
            ir_session.donnees_old["drivers"][i]["speed"] = 0
            ir_session.donnees_old["drivers"][i]["speedraw"] = 0
            ir_session.donnees_old["drivers"][i]["offtrack"] = 0

        print("ERROR in calculs.py line 70")

    ir_session.sessiontime = ir_session.ir["SessionTime"]
    ir_session.sessionstate = ir_session.ir["SessionState"]

    if len(ir_session.ir['DriverInfo']['Drivers']) != ir_session.donnees["nb_drivers"]:  # When the number of drivers change
        print("Drivers number has changed !")
        ir_session.statics_sent = 0
        init_session(ir_session)
        return ir_session

    if (ir_session.ir["SessionInfo"]["Sessions"][ir_session.ir["SessionNum"]]["SessionType"] != ir_session.sessiontype) \
            | (ir_session.sessionnum != ir_session.ir["SessionNum"]) \
            | (ir_session.sessionid != ir_session.ir["WeekendInfo"]["SubSessionID"]):  # When we change session
        print("Changement de session ...")
        print("*****************************************************************************")


        ir_session = obj_ir_session()
        while not ir_session.ir.startup():
            time.sleep(1)
        init_session(ir_session)
        print("--------------------------->", ir_session.ir["SessionInfo"]["Sessions"][ir_session.ir["SessionNum"]]["SessionType"], ir_session.sessiontype)
        return ir_session

    # typ 2: every 1/fps s, typ 3: every 1/fps_ s, typ 4: every 1/10 s
    if (typ == 2) | (typ == 3) | (typ == 4):
        #calc_time_by_dist(ir_session)
        calc_sessiontime_lc_dist(ir_session)
        calc_speed(ir_session)
        calc_pit_inc(ir_session)   # Doit être au même endroit que calc_pit_time
        calc_pit_time(ir_session)  # Doit être au même endroit que calc_pit_inc
        calc_fuel(ir_session)  # IMPORTANT de le mettre avant calc_laptime pour que les tour avec pits soient invalidés
        calc_laptime(ir_session)
    if typ == 2:
        calc_name(ir_session)
        calc_apex_max(ir_session)
        calc_pos(ir_session)
        calc_posldp(ir_session)
        calc_posf3(ir_session)
        # On réclame le calcul des startpos jusqu'à que ce soit fait (uniquement pour la course)
        calc_startpos(ir_session)
        calc_stint(ir_session)
        calc_projected_lapdistpct(ir_session)
    if (typ == 2) | (typ == 4):
        calc_caridxp1(ir_session)
        calc_time_by_dist(ir_session)
        calc_timeremain(ir_session)
        calc_rel(ir_session)
        calc_relf3(ir_session)
        calc_gap(ir_session)
        calc_lapsremain(ir_session)
        calc_nextpittimelost(ir_session)

    # On refuel si le client local l'a demandé
    if ir_session.refuel:
        ir_session.ir.pit_command(2, int(ir_session.fuelneed + 1))
        ir_session.refuel = 0

    # On coche ou décoche les pneus si le client l'a demandé
    if ir_session.tires_all:
        ir_session.ir.pit_command(3, 0)
        ir_session.ir.pit_command(4, 0)
        ir_session.ir.pit_command(5, 0)
        ir_session.ir.pit_command(6, 0)
        ir_session.tires_all = 0
        ir_session.tires_checked = 1
    if ir_session.tires_none:
        ir_session.ir.pit_command(0, 0)  # On décoche tout
        ir_session.ir.pit_command(1, 0)  # On recoche l'essence
        ir_session.ir.pit_command(2, 0)  # On recoche le tear off
        ir_session.tires_none = 0
        ir_session.tires_checked = 0

    # Gestion des boutons
    buttons(ir_session)

    return ir_session


# Main loop that update datas from the telemetry
def lance_boucle_datas():
    global ir_session
    tick = 0
    ir_session = obj_ir_session()
    ir_session.ir.startup()
    while True:
        # Waiting for iRacing to start
        print("Waiting for iRacing to start ...")

        ir_session_new = obj_ir_session()
        while not ir_session_new.ir.startup():
            time.sleep(1)

        print("")
        print("-------------------------------------------------------------------------------")
        print("iRacing started !")
        print("")

        sessiontype_old = ir_session.sessiontype
        sessionnum_old = ir_session.sessionnum
        sessionid_old = ir_session.sessionid

        if tick != 0:
            # Does we have changed session ?
            if (ir_session_new.ir["SessionInfo"]["Sessions"][ir_session_new.ir["SessionNum"]]["SessionType"] != sessiontype_old) \
                    | (sessionnum_old != ir_session_new.ir["SessionNum"]) \
                    | (sessionid_old != ir_session_new.ir["WeekendInfo"]["SubSessionID"]):  # When we change session
                print("Changement de session ...")
                #ir_session = obj_ir_session()
                ir_session = ir_session_new
                while not ir_session.ir.startup():
                    time.sleep(1)
                init_session(ir_session)
        else:
            while not ir_session.ir.startup():
                time.sleep(1)
            init_session(ir_session)

        timestart = 0
        sessiontimeold = 0
        while ir_session.ir.startup() & ir_session.initialized:
            pause = 1 / fps_ - (time.clock() - timestart)
            if pause < 0:
                pause = 0
            time.sleep(pause)  # Define the refresh rate for calculations of datas

            """ C'est dangereux car ça peut provoquer une boucle sans fin
            # We are waiting for new iRacing datas
            while ir_session.ir.startup() & (ir_session.ir["SessionTime"] - sessiontimeold == 0) & (
                        ir_session.ir["ReplayPlaySpeed"] != 0):
                pass
            sessiontimeold = ir_session.ir["SessionTime"]
            """

            timestart = time.clock()

            # Update datas
            typ = 3
            if (fps_ // 10) != 0:
                if tick % (fps_ // 10) == 0:
                    typ = 4
            if tick % (fps_ // fps) == 0:
                typ = 2

            # Updates for the broadcast
            if tick % (5 * fps_) == 0:  # 1 time every 5 seconds
                ir_session.datas_to_send_typ2 = recupere_donnees(2, ir_session)
            else:
                if tick % fps_ == 0:  # 1 time per second
                    ir_session.datas_to_send_typ3 = recupere_donnees(3, ir_session)

            tick += 1

            ir_session = calc_donnees(typ, ir_session)

        print("")
        print("*********************")
        print("iRacing has stopped !")
        print("*********************")
        print("")


# Functions for the websocket connections
@asyncio.coroutine
def handler_loc(websocket, path):
    tick = 0
    timestart = 0
    datasjs = json.dumps(recupere_donnees(1, ir_session))
    timeclockold = 0

    while True:
        #while (not ir_session.ir.startup()) | (ir_session.initialized == 0):
        #    time.sleep(1)

        cmd = yield from websocket.recv()
        if (cmd == "none") | (not websocket.open):
            break

        # Si iRacing n'est pas lancé on le dit au client en envoyant -2
        if (not ir_session.ir.startup()) | (ir_session.initialized == 0):
            if tick == 0:
                datasjs = "-3"
            else:
                datasjs = "-2"

        else:
            if (cmd != "2") & (cmd != "3"):
                print("Message from javascript local > " + cmd)
            if cmd == "send_statics":
                ir_session.statics_sent = 0

            # Traitement des commandes du client
            if cmd == "refuel":
                ir_session.refuel = 1
            if cmd == "tires_all":
                ir_session.tires_all = 1
            if cmd == "tires_none":
                ir_session.tires_none = 1

            if (ir_session.statics_sent == 0):
                #time.sleep(1)
                while ir_session.initialized == 0:
                    time.sleep(1)
                ir_session.datas_to_send_typ1 = recupere_donnees(1, ir_session)
                datasjs = json.dumps(ir_session.datas_to_send_typ1)
                ir_session.reload = 0  # Indique au client que ce ne sera plus la peine de recharger la page jusqu'au changement de session
                print("Statics Datas sent to the client")
                ir_session.statics_sent = 1
            else:
                if cmd == "send_statics":  # The client ask for all the datas
                    datasjs = json.dumps(recupere_donnees(1, ir_session))
                if cmd == "2":

                    #print(ir_session.timeremain)

                    ir_session.datas_to_send_typ2 = recupere_donnees(2, ir_session)
                    datasjs = json.dumps(ir_session.datas_to_send_typ2)
                if cmd == "3":
                    ir_session.datas_to_send_typ3 = recupere_donnees(3, ir_session)
                    datasjs = json.dumps(ir_session.datas_to_send_typ3)

        yield from websocket.send(datasjs)

        #print(ir_session.tank_capacity, ir_session.refuelspeed, ir_session.pittimelost1, ir_session.pittimelost3, ir_session.tires_and_fuel)

        tick += 1

@asyncio.coroutine
def handler_cast(websocket, path):
    while True:
        while (not ir_session.ir.startup()) | (ir_session.initialized == 0):
            time.sleep(1)

        datasjs = ""

        cmd = yield from websocket.recv()
        if (cmd == "none") | (not websocket.open):
            break
        if cmd == "send_statics":  # The client ask for all the datas
            print("Message from javascript broadcast > " + cmd)
            datasjs = json.dumps(recupere_donnees(1, ir_session))
        if cmd == "2":
            ir_session.datas_to_send_typ2 = recupere_donnees(2, ir_session)
            datasjs = json.dumps(ir_session.datas_to_send_typ2)
        if cmd == "3":
            ir_session.datas_to_send_typ3 = recupere_donnees(3, ir_session)
            datasjs = json.dumps(ir_session.datas_to_send_typ3)
        yield from websocket.send(datasjs)


def lance_transfert():
    start_server = websockets.serve(handler_loc, get_lan_ip(), 8001)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    asyncio.get_event_loop().run_until_complete(start_server)
    print("Websocket connection launched on port 8001")
    print("You can open timing.html")
    asyncio.get_event_loop().run_forever()


def lance_broadcast():
    start_server = websockets.serve(handler_cast, get_lan_ip(), 8003)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    asyncio.get_event_loop().run_until_complete(start_server)
    print("Websocket connection launched on port 8003")
    asyncio.get_event_loop().run_forever()

# Affichage de l'adresse IP locale et publique pour informer l'utilisateur
f = open("js/local ip.js", "w")
f.write("localIP = '" + str(get_lan_ip()) + "' ;")
f.close()
print("Local IP : " + get_lan_ip())
f = open("js/internet ip.js", "w")
f.write("internetIP = '" + str(get_public_ip()) + "' ;")
f.close()
print("Public IP : " + get_public_ip())

ir_session = obj_ir_session()

# Launch the tasks
threading.Thread(target=mon_serveur, args=()).start()  # Web server
threading.Thread(target=lance_boucle_datas, args=()).start()  # Main loop
threading.Thread(target=lance_transfert, args=()).start()  # Websocket for receiving messages from local client
threading.Thread(target=lance_broadcast, args=()).start()  # Websocket for sending and receiving datas and message
