# C:/Python34
# coding: utf-8
# -*- coding: utf-8 -*-

from math import *
#from var_param import *
import time
from unidecode import unidecode
import os


def test():
    print("test")


def init_buttons(ir_session):
    mydocuments = os.path.expanduser("~/Documents/Joel Real Timing/")
    # On récupère les données pour les boutons du joystick
    fichier = open(mydocuments + "buttons.txt", "r")
    ligne = fichier.read().split("\n")   # Fréquence d'envoie des données
    try:
        tmp = ligne[0].split("=")
        tmp = tmp[1].split("#")
        ir_session.tires_all_joy = float(tmp[0])
        tmp = ligne[1].split("=")
        tmp = tmp[1].split("#")
        ir_session.tires_all_button = float(tmp[0])
        tmp = ligne[2].split("=")
        tmp = tmp[1].split("#")
        ir_session.tires_none_joy = float(tmp[0])
        tmp = ligne[3].split("=")
        tmp = tmp[1].split("#")
        ir_session.tires_none_button = float(tmp[0])
        tmp = ligne[4].split("=")
        tmp = tmp[1].split("#")
        ir_session.refuel_joy = float(tmp[0])
        tmp = ligne[5].split("=")
        tmp = tmp[1].split("#")
        ir_session.refuel_button = float(tmp[0])
        tmp = ligne[6].split("=")
        tmp = tmp[1].split("#")
        ir_session.switch_f3box_joy = float(tmp[0])
        tmp = ligne[7].split("=")
        tmp = tmp[1].split("#")
        ir_session.switch_f3box_button = float(tmp[0])
        tmp = ligne[8].split("=")
        tmp = tmp[1].split("#")
        ir_session.trackmap_joy = float(tmp[0])
        tmp = ligne[9].split("=")
        tmp = tmp[1].split("#")
        ir_session.trackmap_button = float(tmp[0])
    except:
        print("")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("! BUTTONS.TXT FILE CORRUPTED !")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("")


def init_pitstrategy(ir_session):
    mydocuments = os.path.expanduser("~/Documents/Joel Real Timing/")
    me = ir_session.donnees["caridxME"]

    carpath = ir_session.donnees["drivers"][me]["carpath"]
    trackname = ir_session.ir["WeekendInfo"]["TrackName"]
    path = mydocuments + "pitstrategy/"+carpath
    # Creation du dossier s'il n'existe pas
    if not os.path.isdir(path):
        os.makedirs(path)

    filepath = path + "/" + "_common" + ".txt"
    # Creation du fichier s'il n'existe pas
    if not os.path.isfile(filepath):
        fichier = open(filepath, "w")
        fichier.write("tank_capacity = 0.0         # Tank capacity in liter ( 1 L = 0.75 kg)")
        fichier.write("\nrefuelspeed = 0.0           # speed of refueling in liter per second  ( 1 L = 0.75 kg)")
        fichier.write("\npittimelost3 = 0.0          # Time lost by changing all the tires")
        fichier.write("\ntires_and_fuel = 0.0        # set 1 if tires change and refuel are done at the same time")
        fichier.close()

    # On récupère les données tank_capacity, refuelspeed et pittimelost1 renseignées dans le fichier carname.txt
    fichier = open(filepath, "r")
    ligne = fichier.read().split("\n")   # Fréquence d'envoie des données
    tmp = ligne[0].split("=")
    tmp = tmp[1].split("#")
    ir_session.tank_capacity = float(tmp[0])
    tmp = ligne[1].split("=")
    tmp = tmp[1].split("#")
    ir_session.refuelspeed = float(tmp[0])
    tmp = ligne[2].split("=")
    tmp = tmp[1].split("#")
    ir_session.pittimelost3 = float(tmp[0])
    tmp = ligne[3].split("=")
    tmp = tmp[1].split("#")
    ir_session.tires_and_fuel = float(tmp[0])
    fichier.close()

    filepath = path + "/" + trackname + ".txt"
    # Creation du fichier s'il n'existe pas
    if not os.path.isfile(filepath):
        fichier = open(filepath, "w")
        fichier.write("pittimelost1 = 0.0          # Time lost in pit without refueling nor tires change in seconds")
        fichier.close()

    # On récupère la donnée pittimelost1 renseignée dans le fichier trackname.txt
    fichier = open(filepath, "r")
    ligne = fichier.read().split("\n")   # Fréquence d'envoie des données
    tmp = ligne[0].split("=")
    tmp = tmp[1].split("#")
    ir_session.pittimelost1 = float(tmp[0])
    fichier.close()

    # On tient compte de la restriction s'il y en a une
    try:
        tmp = ir_session.ir["DriverInfo"]["Drivers"][me]["CarClassMaxFuel"]
        tmp = tmp.split(" ")
        maxfuelpct = float(tmp[0])
        if maxfuelpct > 0:
            ir_session.tank_capacity = maxfuelpct * ir_session.tank_capacity
    except:
        pass


def init_donnees(ir_session, caridx, i, name):
    ir_session.donnees["drivers"][caridx] = {}

    for t in ir_session.liste_donnees[1]:
         ir_session.donnees["drivers"][caridx][t] = 0

    ir_session.donnees["drivers"][caridx]["carpath"] = ir_session.ir['DriverInfo']['Drivers'][i]['CarPath']

    ir_session.donnees["drivers"][caridx]["k"] = -1

    ir_session.donnees["drivers"][caridx]["pos"] = i + 1
    ir_session.donnees["drivers"][caridx]["cpos"] = i + 1

    ir_session.donnees["drivers"][caridx]["num"] = ir_session.ir['DriverInfo']['Drivers'][i]['CarNumber']
    ir_session.donnees["drivers"][caridx]["name"] = name
    teamname = ir_session.ir['DriverInfo']['Drivers'][i]['TeamName']
    ir_session.donnees["drivers"][caridx]["teamname"] = teamname
    ir_session.donnees["drivers"][caridx]["ir"] = ir_session.ir['DriverInfo']['Drivers'][i]['IRating']

    ir_session.donnees["drivers"][caridx]["carclasscolor"] = hex(ir_session.ir['DriverInfo']['Drivers'][i]['CarClassColor'])
    ir_session.donnees["drivers"][caridx]["carclassid"] = ir_session.ir['DriverInfo']['Drivers'][i]['CarClassID']
    ir_session.donnees["drivers"][caridx]["classname"] = ir_session.ir['DriverInfo']['Drivers'][i]['CarClassShortName']

    ir_session.donnees["drivers"][caridx]["liccolor"] = hex(ir_session.ir['DriverInfo']['Drivers'][i]['LicColor'])
    ir_session.donnees["drivers"][caridx]["licsub"] = ir_session.ir['DriverInfo']['Drivers'][i]['LicSubLevel']

    # To avoid errors
    ir_session.donnees["drivers"][caridx]["distpct"] = 0
    ir_session.donnees["drivers"][caridx]["distpctraw"] = 0
    ir_session.donnees["drivers"][caridx]["lc"] = 0
    ir_session.donnees["drivers"][caridx]["speed"] = 0
    ir_session.donnees["drivers"][caridx]["topspeed"] = 0
    ir_session.donnees["drivers"][caridx]["speedraw"] = 0
    ir_session.donnees["drivers"][caridx]["accel"] = 0
    ir_session.donnees["drivers"][caridx]["nb_pit"] = 0
    ir_session.donnees["drivers"][caridx]["nb_inc"] = 0
    ir_session.donnees["drivers"][caridx]["onpitroad"] = 0
    ir_session.donnees["drivers"][caridx]["onpitstall"] = 0
    ir_session.donnees["drivers"][caridx]["offtrack"] = 0
    ir_session.donnees["drivers"][caridx]["offtrackentrytime"] = 0
    ir_session.donnees["drivers"][caridx]["pitroadtime"] = 0
    ir_session.donnees["drivers"][caridx]["pitstalltime"] = 0
    ir_session.donnees["drivers"][caridx]["onpitroadold"] = 0
    ir_session.donnees["drivers"][caridx]["onpitstallold"] = 0
    ir_session.donnees["drivers"][caridx]["pitentrytime"] = 0
    ir_session.donnees["drivers"][caridx]["pitstallentrytime"] = 0
    ir_session.donnees["drivers"][caridx]["stintstart"] = 0
    ir_session.donnees["drivers"][caridx]["pitlastlap"] = 0
    ir_session.donnees["drivers"][caridx]["lcold"] = 0
    ir_session.donnees["drivers"][caridx]["islastvalid"] = 0

    ir_session.donnees["drivers"][caridx]["lapsremain"] = 32768
    ir_session.donnees["drivers"][caridx]["freeze"] = 0
    ir_session.donnees["drivers"][caridx]["is_started"] = 0

    ir_session.donnees["drivers"][caridx]["posldp"] = -1
    ir_session.donnees["drivers"][caridx]["posf3"] = -1

# SOF calculation
def session_sof(ir_session, c):
    sof = 0
    N = 0
    if c != 0:
        for i in ir_session.donnees["drivers_true"]:
            if ir_session.donnees["drivers"][i]["carclassid"] == c:
                N += 1
    else:
        N = ir_session.donnees["nb_drivers_true"]

    if N == 0:
        return 0
    else:
        if ir_session.donnees["nb_drivers_true"] != 0:
            for i in ir_session.donnees["drivers_true"]:
                if c != 0:
                    if ir_session.donnees["drivers"][i]["carclassid"] == c:
                        sof = sof + 2 ** (-ir_session.donnees["drivers"][i]['ir'] / 1600)
                else:
                    sof = sof + 2 ** (-ir_session.donnees["drivers"][i]['ir'] / 1600)
            if sof != 0:
                sof = 1600 / log(2) * log(N / sof)
        return int(sof)


# On réinitialise les variables à chaque nouvelle session
def init_session(ir_session):
    ir_session.initialized = 0
    while ir_session.initialized == 0:
        #try:

        ir_session.teamracing = ir_session.ir["WeekendInfo"]["TeamRacing"]
        ir_session.sessiontype = ir_session.ir["SessionInfo"]["Sessions"][ir_session.ir["SessionNum"]]["SessionType"]
        ir_session.sessionnum = ir_session.ir["SessionNum"]
        ir_session.sessionid = ir_session.ir["WeekendInfo"]["SubSessionID"]
        print("Type de session : " + ir_session.sessiontype)
        print("Session ID:", ir_session.ir["WeekendInfo"]["SessionID"])
        print("SubSession ID:", ir_session.sessionid)
        print("SessionNum:", ir_session.sessionnum)
        print("Connected drivers list :")

        t = ir_session.ir["SessionInfo"]["Sessions"][ir_session.sessionnum]["SessionTime"]
        if t != "unlimited":
            t_ = t.split(' ')
            ir_session.time = int(float(t_[0]))
        else:
            #ir_session.time = t
            ir_session.time = 604800  # temps "illimité" de 168h
        l = ir_session.ir["SessionInfo"]["Sessions"][ir_session.sessionnum]["SessionLaps"]
        ir_session.laps = l
        print("Time : ", t)
        print("Laps : ", l)

        for i in  range(64):
            if not i in ir_session.donnees["sdrivers"]:
                ir_session.donnees["sdrivers"][i] = {}
                ir_session.donnees["sdrivers"][i]["startpos_initialized"] = 0
                ir_session.donnees["sdrivers"][i]["startpos"] = 0
                ir_session.donnees["sdrivers"][i]["startcpos"] = 0

        i = 0
        n = 0
        is_session_new = 1
        for x in ir_session.ir['DriverInfo']['Drivers']:
            caridx = int(ir_session.ir['DriverInfo']['Drivers'][i]['CarIdx'])
            print(str(caridx) + " - " + unidecode(ir_session.ir['DriverInfo']['Drivers'][i]['UserName']))

            name = ir_session.ir['DriverInfo']['Drivers'][i]['UserName']

            # We initialize datas only for the new drivers (for practices sessions)
            if not caridx in ir_session.donnees["drivers"]:
                init_donnees(ir_session, caridx, i, name)
            else:
                # S'il y a un pilote qui existait déjà c'est que ce n'est pas une nouvelle session
                is_session_new = 0

            ir_session.donnees["drivers"][caridx]["lastconntime"] = 0   # Permet de calculer de temps de déconnexion d'un pilote

            if ((name != "Pace Car") & (ir_session.ir['DriverInfo']['Drivers'][i]['IsSpectator'] == 0)):
                ir_session.donnees["drivers_true"][caridx] = 0
                # sert à lister les classes
                c = ir_session.ir['DriverInfo']['Drivers'][i]['CarClassID']
                ir_session.classes[c] = 1
                ir_session.classname[c] = ir_session.donnees["drivers"][caridx]["classname"]
                # On compte le nombre de voitures dans chaque class
                if c in ir_session.nbcars_class:
                    ir_session.nbcars_class[c] += 1
                else:
                    ir_session.nbcars_class[c] = 1
                if 0 in ir_session.nbcars_class:
                    ir_session.nbcars_class[0] += 1
                else:
                    ir_session.nbcars_class[0] = 1
                n += 1

            i += 1


        # On ne réinitialise les variables que si c'est une nouvelle session
        if is_session_new:
            ir_session.refuel = 0
            ir_session.tires_all = 0
            ir_session.tires_none = 0
            ir_session.fuel = ir_session.ir["FuelLevel"]
            ir_session.fuelold = ir_session.ir["FuelLevel"]
            ir_session.fuel_lcold = 0
            #ir_session.tank = ... # Available next season
            ir_session.conso = 0
            ir_session.conso_moy = 0
            ir_session.conso_ = {}  # Tableau pour enregistrer les ocnsommations de tous les tours
            ir_session.fuelneed = 0
            ir_session.fuelneed_moy = 0

            ir_session.sessiontime = ir_session.ir["SessionTime"]

            #print(ir_session.ir["SessionInfo"]["Sessions"])

            ir_session.sessionstate = ir_session.ir["SessionState"]

            ir_session.timeremain = ir_session.ir["SessionTimeRemain"]
            ir_session.lapsremain = ir_session.ir["SessionLapsRemain"]
            ir_session.starttime = -1


        # nb_drivers include pace car and spectators
        ir_session.donnees["nb_drivers"] = i
        # nb_drivers_true include only the drivers racing
        ir_session.donnees["nb_drivers_true"] = n
        ir_session.donnees["caridxME"] = ir_session.ir["DriverInfo"]["DriverCarIdx"]
        print("Drivers number : " + str(ir_session.donnees["nb_drivers_true"]))
        ir_session.donnees["sof"] = {}
        ir_session.donnees["sof"][0] = session_sof(ir_session, 0)
        print("SOF - ALL :", ir_session.donnees["sof"][0])
        # SOF par class
        for c in ir_session.classes:
            ir_session.donnees["sof"][c] = session_sof(ir_session, c)
            print("SOF -", ir_session.classname[c], ":", ir_session.donnees["sof"][c])
        # Track length
        ir_session.dtrack = float(str.split(ir_session.ir['WeekendInfo']['TrackLength'], ' ')[0]) * 1000
        print("Track length : " + str(ir_session.dtrack) + " m")
        # La valeur MM doit être un diviseur de dtrack et doit être plus grand que la distance maximale parcourue en 1/fps s
        #if fps > 10:
        #    MM_min = 11   # Cela correspond à une vitesse de 396 km/h en 1/10 s
        #else:
        #    MM_min = 110/fps   # Cela correspond à une vitesse de 396 km/h en 1/fps s
        MM_min = 11
        ir_session.MM = ir_session.dtrack /(ir_session.dtrack // MM_min)
        ir_session.statics_sent = 0     # used to know if the statics datas (name, num, ir) have been sent to the local client

        # Récupération des carclasscolor perdus
        for i in ir_session.donnees["drivers"]:
            if ir_session.donnees["drivers"][i]['carclasscolor'] == "0x0":
                for j in ir_session.donnees["drivers"]:
                    if (ir_session.donnees["drivers"][i]['carclassid'] == ir_session.donnees["drivers"][j]['carclassid']) & (ir_session.donnees["drivers"][j]['carclasscolor'] != "0x0"):
                        ir_session.donnees["drivers"][i]['carclasscolor'] = ir_session.donnees["drivers"][j]['carclasscolor']
                        break

        for i in ir_session.donnees["drivers"]:
            c = ir_session.donnees["drivers"][i]['carclassid']
            ir_session.carclasscolor[c] = ir_session.donnees["drivers"][i]['carclasscolor']


        # Gestion des infos de pitstrategy
        init_pitstrategy(ir_session)

        # Gestion des boutons
        init_buttons(ir_session)

        #time.sleep(2)
        ir_session.initialized = 1
        #except:
        #    ir_session.initialized = 0
        #    print("Failed to initialize the session !")
