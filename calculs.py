# C:/Python34
# coding: utf-8
# -*- coding: utf-8 -*-

from var_param import *
#import time
from math import cos, sin, pi
from init_session import *


def calc_startpos(ir_session):
    if ((calc_mode_replay(ir_session) == 0) & (ir_session.sessiontype == "Race")) & (ir_session.startpos_initialized == 0):
        try:
            # Calcul des positions de départ ou quand on rejoins la session pour la première fois
            i = 0

            """
            for x in ir_session.ir["SessionInfo"]["Sessions"][ir_session.sessionnum]["ResultsPositions"]:
                startcaridx = ir_session.ir["SessionInfo"]["Sessions"][ir_session.sessionnum]["ResultsPositions"][i]["CarIdx"]
                #print(startcaridx)
                if not startcaridx in ir_session.donnees["sdrivers"]:
                    # On lit les résultats pour avoir la position de départ (valable en live uniquement)
                    ir_session.donnees["sdrivers"][startcaridx] = {}
                    ir_session.donnees["sdrivers"][startcaridx]["startpos"] = ir_session.ir["SessionInfo"]["Sessions"][ir_session.sessionnum]["ResultsPositions"][i]["Position"]
                    ir_session.donnees["sdrivers"][startcaridx]["startcpos"] = ir_session.ir["SessionInfo"]["Sessions"][ir_session.sessionnum]["ResultsPositions"][i]["ClassPosition"] + 1
                i += 1
            """

            for x in ir_session.ir["QualifyResultsInfo"]["Results"]:
                startcaridx = ir_session.ir["QualifyResultsInfo"]["Results"][i]["CarIdx"]
                if ir_session.donnees["sdrivers"][startcaridx]["startpos"]==0:
                    # On lit les résultats pour avoir la position de départ (valable en live uniquement)
                    ir_session.donnees["sdrivers"][startcaridx] = {}
                    ir_session.donnees["sdrivers"][startcaridx]["startpos"] = ir_session.ir["QualifyResultsInfo"]["Results"][i]["Position"] + 1
                    ir_session.donnees["sdrivers"][startcaridx]["startcpos"] = ir_session.ir["QualifyResultsInfo"]["Results"][i]["ClassPosition"] + 1
                i += 1
            ir_session.startpos_initialized = 1
            print("Starting positions initialized")
        except:
            pass
            #print("ERROR in calculs.py line 41")

    # Sinon, en mode replay on prend la position au départ quand on passe la ligne
    elif (ir_session.sessiontype == "Race") & (ir_session.startpos_initialized == 0):
        ir_session.startpos_initialized = 1
        for i in ir_session.donnees["drivers_true"]:
            missed_start = (ir_session.donnees["drivers"][i]["distpct"] < -1) & (ir_session.sessionstate == 4)
            if ((ir_session.donnees["drivers"][i]["distpct"] > 0) | missed_start) & (ir_session.donnees["sdrivers"][i]["startpos_initialized"] == 0) & (ir_session.sessionstate == 4):
                ir_session.donnees["sdrivers"][i]["startpos"] = ir_session.donnees["drivers"][i]["pos"]
                ir_session.donnees["sdrivers"][i]["startcpos"] = ir_session.donnees["drivers"][i]["cpos"]
                ir_session.donnees["sdrivers"][i]["startpos_initialized"] = 1
                #print(ir_session.donnees["drivers"][i]["num"], ir_session.donnees["drivers"][i]["pos"], ir_session.donnees["drivers"][i]["distpct"])

            if (ir_session.donnees["drivers"][i]["distpct"] <= 0) & (ir_session.donnees["sdrivers"][i]["startpos_initialized"] == 0):
                ir_session.startpos_initialized = 0


def calc_mode_replay(ir_session):
    # On essaie de savoir si les données sont live ou enregistrée issue d'un replay
    mode_replay = 0
    try:
        if ir_session.ir["SessionInfo"]["Sessions"][ir_session.ir["SessionNum"]]["ResultsPositions"][0]["LapsComplete"] >= ir_session.ir["RaceLaps"]:
            mode_replay = 1
    except:
        pass
        #print("ERROR in calculs.py line 66")
    if ir_session.ir["IsReplayPlaying"] == 0:  # Pour sécuriser, car alors on est certain qu'on n'est pas en mode replay
        mode_replay = 0
    return mode_replay


def calc_timeremain(ir_session):

    mode_replay = calc_mode_replay(ir_session)

    if ir_session.sessiontype == "Race":
        if (ir_session.starttime == -1) & (ir_session.ir["SessionState"] == 4): # La course est lancée
            ir_session.starttime = ir_session.ir["SessionTime"]
    else:
        ir_session.starttime = -1
    # ATTENTION : les donnees  sont correctes en mode spectateur
    ir_session.timeremain = ir_session.ir["SessionTimeRemain"] + ir_session.starttime * mode_replay  # En live, pas besoin de corriger le temps
    if ir_session.timeremain < 0: ir_session.timeremain = 0
    if (ir_session.sessiontype == "Race") & (ir_session.starttime == -1): # si le départ n'est pas lancé où n'a pu être initialisé
        ir_session.timeremain = ir_session.time


def calc_lapsremain(ir_session):
    me = ir_session.donnees["caridxME"]
    laps = ir_session.ir["SessionLapsRemain"]

    if ir_session.donnees["drivers"][ir_session.caridxP1]["freeze"] == 0:
        lapdistpctrawP1 = ir_session.ir['CarIdxLapDistPct'][ir_session.caridxP1]
    else:
        lapdistpctrawP1 = 110 / ir_session.dtrack

    # Si on n'a pas de limite de tours on estime le nombre tours restants par rapport au meilleur temps réalisé pour le premier pilote
    #if laps >= 32767:
    laptimep1 = 0
    rp1 = 32767

    if (lapdistpctrawP1 > 0) & (ir_session.donnees["drivers"][ir_session.caridxP1]["lapsremain"] > 0):
        if "best" in ir_session.donnees["drivers"][ir_session.caridxP1]:
            laptimep1 = ir_session.donnees["drivers"][ir_session.caridxP1]["best"] * 1.005
            if laptimep1 > 0:
                a = (ir_session.timeremain + laptimep1 - 0.1) / laptimep1
                b = 1 - lapdistpctrawP1
                # Estimation du nombre de tours restant pour le leader
                rp1 = int(a - b) + b
                #if (ir_session.donnees["drivers"][ir_session.caridxP1]["lapsremain"] < 0.5) & (lapdistpctraw < 0.5):  # Ca veut dire qu'on a passé la ligne
                #    rp1 = 0
                ir_session.donnees["drivers"][ir_session.caridxP1]["lapsremain"] = rp1

    for i in ir_session.donnees["drivers_true"]:
        r = 32767
        laptimei = 0
        lapdistpctraw = ir_session.ir['CarIdxLapDistPct'][i]
        #if (lapdistpctraw > 0) & (lapdistpctrawP1 > 0):
        if lapdistpctrawP1 > 0:
            if lapdistpctraw < 0:
                lapdistpctraw = 0
            if "best" in ir_session.donnees["drivers"][i]:
                laptimei = ir_session.donnees["drivers"][i]["best"] * 1.005

            if (laptimei > 0) & (laptimep1 > 0):
                a = (ir_session.timeremain + laptimep1 - 0.1) / laptimei
                b = 1 - lapdistpctraw
                # Estimation du nombre de tours de retard avec le leader en fin de course (cet écart peut-être négatif)
                e = int(a * (laptimei - laptimep1) / laptimep1)
                r = int(rp1) - e + b
                if lapdistpctrawP1 < lapdistpctraw:  # Si le pilote n'est pas dans le même tour
                    if ir_session.donnees["drivers"][ir_session.caridxP1]["lapsremain"] > 0:
                        if ir_session.donnees["drivers"][i]["lapsremain"] > 0:
                                r += 1

                # On tient maintenant compte des arrêts aux stand si on a les infos de conso
                if (i == me) & (ir_session.conso > 0):
                    # Nombre de tours qu'on peut faire avec un plein
                    maxstints = int(ir_session.tank_capacity / ir_session.conso)
                    if (ir_session.fuelneed > 0):
                        if maxstints > 0:
                            pitremain = int(r / maxstints)
                        else:
                            pitremain = 9999

                        # Temps perdu à remettre de l'essence
                        if ir_session.refuelspeed > 0:
                            pittimelost2 = ir_session.fuelneed / ir_session.refuelspeed
                        else:
                            pittimelost2 = 0

                        # Temps perdu à changer les pneus
                        if ir_session.tires_and_fuel:
                            timelosttires = ir_session.pittimelost3 - pittimelost2
                            if timelosttires < 0:
                                timelosttires = 0
                        else:
                            timelosttires = ir_session.pittimelost3

                        timelost = ir_session.pittimelost1 * pitremain + pittimelost2 + timelosttires
                        a = (ir_session.timeremain + laptimep1 + laptimei - timelost) / laptimei
                        b = 1 - lapdistpctraw
                        r = int(a - b) + b

                if r < 0:
                    r = 0
                #if (ir_session.donnees["drivers"][i]["lapsremain"] < 0.5) & (lapdistpctraw < 0.5):  # Ca veut dire qu'on a passé la ligne
                #    r = 0
            if (r > 0) & (ir_session.sessionstate >= 5):
                r = 1 - lapdistpctraw
                if (lapdistpctraw < 0.5) & (lapdistpctrawP1 >= lapdistpctraw)\
                        & (lapdistpctrawP1 < 0.5):
                    r = 0
            if (r == 0) & (ir_session.donnees["drivers"][i]["freeze"] == 0) & (ir_session.sessionstate >= 5):
                # On fige les positions
                ir_session.donnees["drivers"][i]["distpct"] = ir_session.donnees["drivers"][i]["lc"] + 0.499 + 0.5 / ir_session.donnees["drivers"][i]["pos"]
                # vérifie qu'on n'a pas oublié un tour
                if ir_session.donnees["drivers"][i]["distpct"] < ir_session.donnees_old["drivers"][i]["distpct"]:
                    ir_session.donnees["drivers"][i]["distpct"] += 1
                ir_session.donnees["drivers"][i]["freeze"] = 1
            # On ne met à jour que s'il n'a pas encore franchi la ligne
            if ir_session.donnees["drivers"][i]["lapsremain"] > 0:
                ir_session.donnees["drivers"][i]["lapsremain"] = r

    # Si le nombre de tours est limité
    #else:
    if laps < 0:
        laps = 0
    for i in ir_session.donnees["drivers_true"]:
        lapdistpctraw = ir_session.ir['CarIdxLapDistPct'][i]
        if (lapdistpctraw > 0) & (lapdistpctrawP1 > 0):
            l = laps + 1 - lapdistpctraw
            if lapdistpctrawP1 < lapdistpctraw:  # Si le pilote n'est pas dans le même tour
                if ir_session.donnees["drivers"][ir_session.caridxP1]["lapsremain"] > 0:
                    if ir_session.donnees["drivers"][i]["lapsremain"] > 0:
                        l += 1
            if l < 0:
                l = 0
            #if (ir_session.donnees["drivers"][i]["lapsremain"] < 0.5) & (lapdistpctraw < 0.5):  # Ca veut dire qu'on a passé la ligne
            #    l = 0
            if (l > 0) & (ir_session.sessionstate >= 5):
                l = 1 - lapdistpctraw
                if (lapdistpctraw < 0.5) & (lapdistpctrawP1 >= lapdistpctraw)\
                        & (lapdistpctrawP1 < 0.5):
                    l = 0
            if (l == 0) & (ir_session.donnees["drivers"][i]["freeze"] == 0) & (ir_session.sessionstate >= 5):
                # On fige les positions
                ir_session.donnees["drivers"][i]["distpct"] = ir_session.donnees["drivers"][i]["lc"] + 0.499 + 0.5 / ir_session.donnees["drivers"][i]["pos"]
                # vérifie qu'on n'a pas oublié un tour
                if ir_session.donnees["drivers"][i]["distpct"] < ir_session.donnees_old["drivers"][i]["distpct"]:
                    ir_session.donnees["drivers"][i]["distpct"] += 1
                ir_session.donnees["drivers"][i]["freeze"] = 1

            # On prend le plus bas nb de tours entre celui donné par iRacing et celui calculé en fonction du temps restant
            if l < ir_session.donnees["drivers"][i]["lapsremain"]:
                ir_session.donnees["drivers"][i]["lapsremain"] = l



# Calcul du temps perdu au prochain pit
def calc_nextpittimelost(ir_session):
    plost = ir_session.pittimelost1

    # On ajoute le temps perdu à remettre de l'essence
    fuel = ir_session.fuelneed
    if (fuel + ir_session.fuel) > ir_session.tank_capacity:
        fuel = ir_session.tank_capacity - ir_session.fuel
    if ir_session.refuelspeed > 0:
        pittimelost2 = fuel / ir_session.refuelspeed
    else:
        pittimelost2 = 0
    plost += pittimelost2

    # Puis on ajoute le temps perdu à changer les pneus
    if ir_session.tires_and_fuel:
        timelosttires = ir_session.pittimelost3 - pittimelost2
        if timelosttires < 0:
            timelosttires = 0
    else:
        timelosttires = ir_session.pittimelost3
    if ir_session.tires_checked:
        plost += timelosttires

    #print("essence:",pittimelost2,"tires checked:",ir_session.tires_checked, "total:", plost)
    ir_session.nextpittimelost = plost



# reCalcule le nom et les infos de licence
def calc_name(ir_session):
    i = 0
    for x in ir_session.ir['DriverInfo']['Drivers']:
        caridx = int(ir_session.ir['DriverInfo']['Drivers'][i]['CarIdx'])
        name = ir_session.ir['DriverInfo']['Drivers'][i]['UserName']
        if not caridx in ir_session.donnees["drivers"]:
            init_donnees(ir_session, caridx, i, name)
        ir_session.donnees["drivers"][caridx]["name"] = name

        ir_session.donnees["drivers"][caridx]["ir"] = ir_session.ir['DriverInfo']['Drivers'][i]['IRating']
        ir_session.donnees["drivers"][caridx]["liccolor"] = hex(ir_session.ir['DriverInfo']['Drivers'][i]['LicColor'])
        ir_session.donnees["drivers"][caridx]["licsub"] = ir_session.ir['DriverInfo']['Drivers'][i]['LicSubLevel']

        i += 1


# SessionTime / laps complete / Total distance in laps
# It's important to calculate all these 3 datas at the same time to avoid bad results in speed calculation
def calc_sessiontime_lc_dist(ir_session):
    t0 = ir_session.sessiontime_old
    #t = ir_session.ir["SessionTime"]
    t = ir_session.sessiontime
    dt = t - t0
    #ir_session.sessiontime = t

    # Si on recule le replay, on réinitialise le paramètre startstatus
    if (dt < -1) | (ir_session.ir["ReplayPlaySpeed"] < 0):
        if ir_session.sessionstate < 4:  # Si la course n'est pas commencée
            for i in ir_session.donnees["drivers_true"]:
                ir_session.donnees["drivers"][i]["is_started"] = 0
        if ir_session.sessionstate < 5:  # Si la course n'est pas terminée
            for i in ir_session.donnees["drivers_true"]:
                ir_session.donnees["drivers"][i]["freeze"] = 0

    # Calcul de lc et distpct
    for i in ir_session.donnees["drivers_true"]:
        lc = ir_session.ir["CarIdxLap"][i]-1
        ld = ir_session.ir["CarIdxLapDistPct"][i]
        lcd = lc + ld

        mode_replay = calc_mode_replay(ir_session)

        if ir_session.donnees["drivers"][i]["freeze"] == 0:
            # on n'enregistre pas les tours négatifs
            if lc >= 0:
                ir_session.donnees["drivers"][i]["lc"] = lc
        ir_session.donnees["drivers"][i]["distpctraw"] = lcd
        if (ir_session.sessionstate >= 4) & (lc == 0) & (ld < 0.5) & (ir_session.donnees["drivers"][i]["onpitroad"] == 0):
            ir_session.donnees["drivers"][i]["is_started"] = 1
        if lc > 0:
            ir_session.donnees["drivers"][i]["is_started"] = 1

        if ir_session.donnees["drivers"][i]["freeze"] == 0:
            if (ld >= 0) & (ld < 1 - 50 / ir_session.dtrack):
                ir_session.donnees["drivers"][i]["distpct"] = lcd - 1 + ir_session.donnees["drivers"][i]["is_started"]
                # Enregistre le temps de la dernière fois où le pilote était connecté
                ir_session.donnees["drivers"][i]["lastconntime"] = ir_session.sessiontime
            # Otherwise, we estimate the distance completed with the speed
            else:
                # Pour que ceux qui ne sont pas encore sur la grille soient devant
                if (ir_session.sessiontype == "Race") & (ir_session.donnees["drivers"][i]["is_started"] == 0) & (ir_session.ir["CarIdxTrackSurface"][i] == -1):
                    ir_session.donnees["drivers"][i]["distpct"] = -4    # -4 indique à javascript qu'il ne faut pas l'afficher car il n'est pas encore sur la grille
                    if i in ir_session.donnees["sdrivers"]:
                        ir_session.donnees["drivers"][i]["distpct"] -= ir_session.donnees["sdrivers"][i]["startpos"]/64   # permet d'avoir les bonnes positions par rapport au sdk
                # On estime la distance que si la déconnexion ne dépasse pas 30s
                elif (ir_session.sessiontime < ir_session.donnees["drivers"][i]["lastconntime"] + 30) & \
                        ((ir_session.ir["ReplayPlaySpeed"] == 1) | (mode_replay == 0)):
                    ir_session.donnees["drivers"][i]["distpct"] += (ir_session.donnees["drivers"][i]["speed"]/3.6*dt)/ir_session.dtrack

        # Si on est en course, on fige les position en fonction de la position dans le sdk (sauf en replay)

        if (ir_session.sessiontype == "Race") & (ir_session.sessionstate < 4) & (mode_replay == 0):
            if i in ir_session.donnees["sdrivers"]:
                ir_session.donnees["drivers"][i]["distpct"] = 0 - ir_session.donnees["sdrivers"][i]["startpos"]/64

        # Tentative de détection et correction du bug du SDK qui envoie LC à 1 alors que la course vient juste de démarrer (en live)
        if (lc == 1) & (mode_replay == 0):
            if ir_session.donnees["drivers"][i]["distpct"] - ir_session.donnees_old["drivers"][i]["distpct"] >= 1:
                ir_session.donnees["drivers"][i]["distpct"] -= 1


# Speed & Longitudinal Acceleration
def calc_speed(ir_session):
    for i in ir_session.donnees["drivers_true"]:
        dt = ir_session.sessiontime - ir_session.sessiontime_old
        dx = ir_session.donnees["drivers"][i]["distpct"] - ir_session.donnees_old["drivers"][i]["distpct"]
        if dt != 0:
            speed = 3.6 * ir_session.dtrack * dx / dt
            if speed > 500: speed = 0
            accel = (speed-ir_session.donnees_old["drivers"][i]["speedraw"])*fps_/3.6/9.81    # in G
            if (ir_session.donnees_old["drivers"][i]["speed"] == 0) | (abs(accel) < 6):    # On s'assure que l'accélération ne dépasse pas les 6G
                if abs(dt*60 - round(dt*60,0)) < 0.0001 :
                    ir_session.donnees["drivers"][i]["speed"] = speed
                    if speed > ir_session.donnees["drivers"][i]["topspeed"]:
                        ir_session.donnees["drivers"][i]["topspeed"] = speed
                    if abs(accel) >= 6: accel = 0
                    ir_session.donnees["drivers"][i]["accel"] = accel
            ir_session.donnees["drivers"][i]["speedraw"] = speed


# Apex and Max speed
def calc_apex_max(ir_session):
    for i in ir_session.donnees["drivers_true"]:
        if ir_session.donnees["drivers"][i]["speed"] > 0:
            if (not "minspd" in ir_session.donnees["drivers"][i]) | (not "maxspd" in ir_session.donnees["drivers"][i])\
            | (not "decspd" in ir_session.donnees["drivers"][i]) | (not "incspd" in ir_session.donnees["drivers"][i]):
                ir_session.donnees["drivers"][i]["minspd"] = 0
                ir_session.donnees["drivers"][i]["maxspd"] = 0
                ir_session.donnees["drivers"][i]["incspd"] = 0
                ir_session.donnees["drivers"][i]["decspd"] = 0
            if ir_session.donnees["drivers"][i]["speed"] < ir_session.donnees["drivers"][i]["minspd"] :
                ir_session.donnees["drivers"][i]["minspd"] = ir_session.donnees["drivers"][i]["speed"]
            if ir_session.donnees["drivers"][i]["speed"] > ir_session.donnees["drivers"][i]["maxspd"] :
                ir_session.donnees["drivers"][i]["maxspd"] = ir_session.donnees["drivers"][i]["speed"]
            if (ir_session.donnees["drivers"][i]["speed"] > ir_session.donnees["drivers"][i]["minspd"] + 20) & (ir_session.donnees["drivers"][i]["incspd"] == 0) :
                ir_session.donnees["drivers"][i]["decspd"] = 0
                ir_session.donnees["drivers"][i]["incspd"] = 1
                ir_session.donnees["drivers"][i]["apex_speed"] = int(10*ir_session.donnees["drivers"][i]["minspd"])/10
                ir_session.donnees["drivers"][i]["maxspd"] = ir_session.donnees["drivers"][i]["speed"]
            if (ir_session.donnees["drivers"][i]["speed"] < ir_session.donnees["drivers"][i]["maxspd"] - 20) & (ir_session.donnees["drivers"][i]["decspd"] == 0) :
                ir_session.donnees["drivers"][i]["decspd"] = 1
                ir_session.donnees["drivers"][i]["incspd"] = 0
                ir_session.donnees["drivers"][i]["max_speed"] = int(10*ir_session.donnees["drivers"][i]["maxspd"])/10
                ir_session.donnees["drivers"][i]["minspd"] = ir_session.donnees["drivers"][i]["speed"]


# Record datas times each MM meters where MM is calculated in the var_param.py file
def calc_time_by_dist(ir_session):
    me = ir_session.donnees["caridxME"]
    coef_k = ir_session.dtrack // ir_session.MM
    diff = 0
    for i in ir_session.donnees["drivers_true"]:
        distpct = ir_session.donnees["drivers"][i]["distpct"]
        # on rectifie le temps enregistré en fonction de la distance parcourue depuis le dernier passage d'un point de repère
        if ir_session.donnees["drivers"][i]["speed"] != 0:
            diff = ((distpct * ir_session.dtrack) - (distpct * coef_k * ir_session.MM)) / (ir_session.donnees["drivers"][i]["speed"] / 3.6)
        k = int(distpct * coef_k)
        k0 = int(int(distpct) * coef_k)
        if k != ir_session.donnees["drivers"][i]["k"]:
            ir_session.donnees["drivers"][i][k] = ir_session.sessiontime - diff

        # Coordonnées de la trackmap
        d = 0
        if i == me:
            if k == k0:
                ir_session.coord["x"][k] = 0
                ir_session.coord["y"][k] = 0
                ir_session.x = 0
                ir_session.y = 0
            else:
                yaw = ir_session.ir["Yaw"]
                dx = ir_session.ir["VelocityX"] * sin(yaw)
                dy = ir_session.ir["VelocityX"] * cos(yaw)
                ir_session.x += dx
                ir_session.y += dy
                # On rectifie pour avoir les coord. précises au moment du changement de k
                d = distpct * coef_k
                dd = d - ir_session.d
                dec_x = 0
                dec_y = 0
                if dd > 0:
                    dec_x = dx * (d - k) / dd
                    dec_y = dy * (d - k) / dd
                if k != ir_session.donnees["drivers"][i]["k"]:
                    ir_session.coord["x"][k] = ir_session.x - dec_x
                    ir_session.coord["y"][k] = ir_session.y - dec_y

            ir_session.d = d

        ir_session.donnees["drivers"][i]["k"] = k



# Record lapdistpct
def calc_lapdistpct_by_time(ir_session):
    me = ir_session.donnees["caridxME"]
    k0 = int((ir_session.best_lapnum - 1) * (ir_session.dtrack // ir_session.MM))
    k1 = int(ir_session.best_lapnum * (ir_session.dtrack // ir_session.MM))
    if (ir_session.best_lapnum > 0) & (k0 in ir_session.donnees["drivers"][me]) & ((k1 - 1) in ir_session.donnees["drivers"][me]):
        tps = 0
        tps0 = int(ir_session.donnees["drivers"][me][k0])
        x0 = ir_session.coord["x"][k0]
        y0 = ir_session.coord["y"][k0]
        x = x0
        y = y0
        min_x = x0
        max_x = x0
        min_y = y0
        max_y = y0
        for k in range(k0, k1):
            if k in ir_session.donnees["drivers"][me]:
                tps = int(ir_session.donnees["drivers"][me][k])
            ir_session.donnees["lapdistpct"][tps - tps0] = (k - k0) / (ir_session.dtrack // ir_session.MM)
            ir_session.donnees["time"][k - k0] = tps - tps0
            if k in ir_session.coord["x"]:
                x = ir_session.coord["x"][k]
                y = ir_session.coord["y"][k]
            ir_session.coord_best["x"][k - k0] = x
            ir_session.coord_best["y"][k - k0] = y
            if x < min_x:
                min_x = x
            if x > max_x:
                max_x = x
            if y < min_y:
                min_y = y
            if y > max_y:
                max_y = y

        ir_session.min_x = min_x
        ir_session.max_x = max_x
        ir_session.min_y = min_y
        ir_session.max_y = max_y

        ir_session.timemax = tps - tps0
        ir_session.k_max = k1 - k0

        # Pour indiquer au client javascript qu'il faudra récupérer les nouvelles données de la trackmap
        ir_session.send_trackmap_nbrequest += 1
        print("-----------------------------------------")
        print("TRACKMAP UPDATED WITH YOUR BEST LAPTIME !")
        print("-----------------------------------------")


# Drivers position
def calc_pos(ir_session):
    classpos = {}
    for i in ir_session.donnees["drivers_true"]:
        classid_i = ir_session.donnees["drivers"][i]['carclassid']
        classpos[classid_i] = 1
        pos = 1
        distpcti = ir_session.donnees["drivers"][i]["distpct"]
        for j in ir_session.donnees["drivers_true"]:
            classid_j = ir_session.donnees["drivers"][j]['carclassid']
            distpctj = ir_session.donnees["drivers"][j]["distpct"]
            if distpctj > distpcti:
                pos += 1
                if classid_i == classid_j:
                    classpos[classid_i] += 1
            if (distpctj == distpcti) & (j > i):
                pos += 1
                if classid_i == classid_j:
                    classpos[classid_i] += 1

        ir_session.donnees["drivers"][i]["pos"] = pos
        ir_session.donnees["drivers"][i]["cpos"] = classpos[classid_i]


# CarIdx of the drivers in first position
def calc_caridxp1(ir_session):
    for i in ir_session.donnees["drivers_true"]:
        if ir_session.donnees["drivers"][i]["pos"] == 1:
            ir_session.caridxP1 = i
            break


# Gap with P1
def calc_gap(ir_session):
    for i in ir_session.donnees["drivers_true"]:
        # distpct = ir_session.ir['CarIdxLap'][i]-1+ir_session.ir['CarIdxLapDistPct'][i]
        distpct = ir_session.donnees["drivers"][i]["distpct"]
        k = int(distpct * (ir_session.dtrack // ir_session.MM))
        if (k in ir_session.donnees["drivers"][i]) & (k in ir_session.donnees["drivers"][ir_session.caridxP1]):
            ir_session.donnees["drivers"][i]["gap"] = int(100*(ir_session.donnees["drivers"][i][k] - ir_session.donnees["drivers"][ir_session.caridxP1][k]))/100

        # On n'affiche pas le gap tant que la course n'est pas commencée pour éviter les erreurs d'affichage
        if ir_session.sessionstate < 4:
            ir_session.donnees["drivers"][i]["gap"] = 0


# Relative gap with CamCarIdx
def calc_rel(ir_session):
    caridxCAM = ir_session.ir["CamCarIdx"]
    if caridxCAM in ir_session.donnees["drivers_true"]:
        for i in ir_session.donnees["drivers_true"]:
            if ir_session.donnees["drivers"][i]["pos"] >= ir_session.donnees["drivers"][caridxCAM]["pos"]:
                # distpct = ir_session.ir['CarIdxLap'][i]-1+ir_session.ir['CarIdxLapDistPct'][i]
                distpct = ir_session.donnees["drivers"][i]["distpct"]
                #j = i
            else:
                # distpct = ir_session.ir['CarIdxLap'][caridxCAM]-1+ir_session.ir['CarIdxLapDistPct'][caridxCAM]
                distpct = ir_session.donnees["drivers"][caridxCAM]["distpct"]
                #j = caridxCAM

            k = int(distpct * (ir_session.dtrack // ir_session.MM))
            if (k in ir_session.donnees["drivers"][i]) & (k in ir_session.donnees["drivers"][caridxCAM]):
                ir_session.donnees["drivers"][i]["rel"] = int(100*(ir_session.donnees["drivers"][caridxCAM][k] - ir_session.donnees["drivers"][i][k]))/100

            # On n'affiche pas le rel tant que la course n'est pas commencée pour éviter les erreurs d'affichage
            if ir_session.sessionstate < 4:
                ir_session.donnees["drivers"][i]["rel"] = 0


# Nb pit / Nb inc / onpitroad
def calc_pit_inc(ir_session):
    t = ir_session.sessiontime
    for i in ir_session.donnees["drivers_true"]:
        if ir_session.donnees["drivers"][i]["freeze"] == 0:
            # if (ir_session.ir["CarIdxOnPitRoad"][i] > ir_session.donnees["drivers"][i]["onpitroad"]) & (ir_session.ir['CarIdxLap'][i]>=0) & (ir_session.donnees["drivers"][i]["speed"]>10):
            # if (ir_session.ir["CarIdxOnPitRoad"][i] > ir_session.donnees["drivers"][i]["onpitroad"]) & (ir_session.ir['CarIdxLap'][i]>=0):
            if (ir_session.ir["CarIdxOnPitRoad"][i] > ir_session.donnees["drivers"][i]["onpitroad"]) & (ir_session.ir['CarIdxLap'][i]>0):
                # En course on n'incremente les pits que lorsqu'on est en course
                if ((ir_session.sessiontype != "Race") | (ir_session.ir["SessionState"] == 4)):
                    ir_session.donnees["drivers"][i]["nb_pit"] += 1
                    ir_session.donnees["drivers"][i]["pitlastlap"] = 1
            # On permet le changement de status pour les pits que si la vitesse est sup à 10km/h ou si on était dehors ou si on y est
            if (ir_session.ir["CarIdxOnPitRoad"][i] != 0) | (ir_session.donnees["drivers"][i]["onpitroad"] == 0) | (ir_session.donnees["drivers"][i]["speed"]>10):
                # Si le pilote est déconnecté on ne change pas son status
                if ir_session.ir["CarIdxTrackSurface"][i] >= 0:
                    ir_session.donnees["drivers"][i]["onpitroad"] = ir_session.ir["CarIdxOnPitRoad"][i]
            #if (ir_session.ir["CarIdxTrackSurface"][i] >= 0) & (ir_session.ir["CarIdxTrackSurface"][i] != 1):    # C'est qu'on n'est pas dans la pit lane
            #    ir_session.donnees["drivers"][i]["onpitroad"] = 0
            if ir_session.ir["CarIdxTrackSurface"][i] == 0:
                ir_session.donnees["drivers"][i]["offtrack"] = 1
                ir_session.donnees["drivers"][i]["offtrackentrytime"] = t
            else:
                # Si le pilote est déconnecté ou si ça fait moins de 5 secondes qu'il était off-track, on ne change pas son status
                if (ir_session.ir["CarIdxTrackSurface"][i] >= 0) & (t - ir_session.donnees["drivers"][i]["offtrackentrytime"] > 5):
                    ir_session.donnees["drivers"][i]["offtrack"] = 0
            if (ir_session.donnees_old["drivers"][i]["offtrack"] == 0) & (ir_session.donnees["drivers"][i]["offtrack"] == 1) & (ir_session.ir['CarIdxLap'][i]>=0):
                ir_session.donnees["drivers"][i]["nb_inc"] +=1


# Pitroad and Pitstall Time
def calc_pit_time(ir_session):
    t = ir_session.sessiontime
    for i in ir_session.donnees["drivers_true"]:
        if ir_session.donnees["drivers"][i]["freeze"] == 0:
            if ir_session.donnees["drivers"][i]["nb_pit"] > 0:
                # Pitroad Time
                #if ir_session.donnees["drivers"][i]["onpitroad"] & (not ir_session.donnees["drivers"][i]["onpitroadold"]) & (ir_session.donnees["drivers"][i]["speed"]>10):
                if ir_session.donnees["drivers"][i]["onpitroad"] & (not ir_session.donnees["drivers"][i]["onpitroadold"]):
                    ir_session.donnees["drivers"][i]["pitentrytime"] = t
                # Si le pilote n'est pas hors piste ou déconnecté
                if ir_session.ir["CarIdxTrackSurface"][i] >= 0:
                    ir_session.donnees["drivers"][i]["onpitroadold"] = ir_session.donnees["drivers"][i]["onpitroad"]
                #if (ir_session.donnees["drivers"][i]["onpitroad"]) | (ir_session.donnees["drivers"][i]["speed"]<=10):
                if (ir_session.donnees["drivers"][i]["onpitroad"]):
                    ir_session.donnees["drivers"][i]["pitroadtime"] = t - ir_session.donnees["drivers"][i]["pitentrytime"]
                    ir_session.donnees["drivers"][i]["stintstart"] = ir_session.donnees["drivers"][i]["lc"]
                # Pitstall Time
                if (ir_session.ir["CarIdxTrackSurface"][i]==1) | ((ir_session.donnees["drivers"][i]["onpitroad"]) & (ir_session.donnees["drivers"][i]["speed"]<0.5)):
                    ir_session.donnees["drivers"][i]["onpitstall"]= 1
                else:
                    ir_session.donnees["drivers"][i]["onpitstall"]= 0
                if (ir_session.donnees["drivers"][i]["onpitstall"]==1) & (ir_session.donnees["drivers"][i]["onpitstallold"]!=1):
                    ir_session.donnees["drivers"][i]["pitstallentrytime"] = t
                ir_session.donnees["drivers"][i]["onpitstallold"] = ir_session.donnees["drivers"][i]["onpitstall"]
                if (ir_session.donnees["drivers"][i]["onpitstall"]==1):
                    ir_session.donnees["drivers"][i]["pitstalltime"] = t - ir_session.donnees["drivers"][i]["pitstallentrytime"]


# Nb laps complete in current stint
def calc_stint(ir_session):
    for i in ir_session.donnees["drivers_true"]:
        if ir_session.donnees["drivers"][i]["freeze"] == 0:
            ir_session.donnees["drivers"][i]["stint"] = ir_session.donnees["drivers"][i]["distpct"] - ir_session.donnees["drivers"][i]["stintstart"]


def calc_laptime(ir_session):

    mode_replay = calc_mode_replay(ir_session)
    me = ir_session.donnees["caridxME"]

    p = 0
    for i in ir_session.donnees["drivers_true"]:
        if mode_replay == 0:
            try:
                if p < len(ir_session.ir["SessionInfo"]["Sessions"][ir_session.ir["SessionNum"]]["ResultsPositions"]):
                    caridx = ir_session.ir["SessionInfo"]["Sessions"][ir_session.ir["SessionNum"]]["ResultsPositions"][p]["CarIdx"]
                    best_old = ir_session.donnees["drivers"][caridx]["best"]
                    best = best_old
                    if caridx in ir_session.donnees["drivers"]:
                        cond1 = abs(ir_session.ir["CarIdxTrackSurface"][caridx]) == 1  # in pitstall or not in the world
                        # On attend 100 m avant d'afficher le temps (à moins que la voiture soit en dehors de la piste)
                        if (ir_session.ir["CarIdxLapDistPct"][caridx] * ir_session.dtrack >= 0) | cond1:
                            try:
                                last = ir_session.ir["SessionInfo"]["Sessions"][ir_session.ir["SessionNum"]]["ResultsPositions"][p]["LastTime"]
                            except:
                                last = -1
                            try:
                                best = ir_session.ir["SessionInfo"]["Sessions"][ir_session.ir["SessionNum"]]["ResultsPositions"][p]["FastestTime"]
                            except:
                                best = -1
                            if "best" in ir_session.donnees["drivers"][caridx]:
                                if (best < 0) & (last < ir_session.donnees["drivers"][caridx]["best"]) & (last > 0):
                                    best = last
                            if (best < 0) & (last > 0):
                                best = last
                            ir_session.donnees["drivers"][caridx]["last"] = last
                            ir_session.donnees["drivers"][caridx]["best"] = best
                            # On enregistre le numéros du tour du best
                            if caridx == me:
                                if best != best_old:  # si on a changé de best
                                    ir_session.best_lapnum = int(ir_session.donnees["drivers"][caridx]["distpct"])
                                    calc_lapdistpct_by_time(ir_session)
                                elif (last > 0) & (ir_session.send_trackmap_nbrequest == 0): # Si on n'a pas encore créé la trackmap
                                    ir_session.best_lapnum = int(ir_session.donnees["drivers"][caridx]["distpct"])
                                    calc_lapdistpct_by_time(ir_session)
            except:
                pass
                #print("ERROR in calculs.py line 641")

        else:
            best_old = ir_session.donnees["drivers"][i]["best"]
            best = best_old
            lapnum = int(ir_session.donnees["drivers"][i]["distpct"])
            if ir_session.donnees["drivers"][i]["lc"] == ir_session.donnees["drivers"][i]["lcold"] + 1:   # On ne recalcule le last et le best qu'à chaque changement de tour

                # On invalide le tour si on lit le replay en accéléré ou en arrière pour éviter les glitch lors de la création du trackmap
                if ir_session.ir["ReplayPlaySpeed"] != 1:
                    if i == me:
                        ir_session.islastvalid[lapnum] = 0

                if (ir_session.donnees["drivers"][i]["pitlastlap"] == 1) | (ir_session.donnees["drivers"][i]["islastvalid"]==0): # On s'assure qu'on avait pas pitté dans le tour précédent et que le temps est valide
                    ir_session.donnees["drivers"][i]["last"] = 0   # On indique que le tour ne compte pas et sera remplacé par -- dans la page web
                    if i == me:
                        ir_session.islastvalid[lapnum] = 0
                else :
                    # distpct = ir_session.donnees["drivers"][i]["distpct"]
                    k1 = int(ir_session.donnees["drivers"][i]["lc"] * (ir_session.dtrack // ir_session.MM))
                    k0 = int((ir_session.donnees["drivers"][i]["lc"]-1) * (ir_session.dtrack // ir_session.MM))
                    sort = 0
                    for dk in range(5) :
                        if ((k0-dk) in ir_session.donnees["drivers"][i]) & ((k1-dk) in ir_session.donnees["drivers"][i]):
                            if (ir_session.donnees["drivers"][i][k0-dk]>0) & (ir_session.donnees["drivers"][i][k1-dk]>0):   # Pour vérifier si le temsp sera valide
                                ir_session.donnees["drivers"][i]["last"] = int(100*(ir_session.donnees["drivers"][i][k1-dk] - ir_session.donnees["drivers"][i][k0-dk]))/100    # on ajoute 1/100 par rapport aux tests
                                if i == me:
                                    ir_session.islastvalid[lapnum] = 1
                            sort = 1
                            break

                    # Calcul du best
                    if "last" in ir_session.donnees["drivers"][i]:
                        if "best" in ir_session.donnees["drivers"][i]:
                            if ((ir_session.donnees["drivers"][i]["last"] <= ir_session.donnees["drivers"][i]["best"]) & (ir_session.donnees["drivers"][i]["last"]>0)) \
                                    | (ir_session.donnees["drivers"][i]["best"] <= 0):
                                best = ir_session.donnees["drivers"][i]["last"]
                        else:
                            if ir_session.donnees["drivers"][i]["last"]>0:
                                best = ir_session.donnees["drivers"][i]["last"]

                    ir_session.donnees["drivers"][i]["best"] = best

                    # On enregistre le numéros du tour du best
                    if i == me:
                        if best != best_old:  # si on a changé de best
                            ir_session.best_lapnum = int(ir_session.donnees["drivers"][i]["distpct"])
                            calc_lapdistpct_by_time(ir_session)
                        elif (ir_session.donnees["drivers"][i]["last"] > 0) & (ir_session.send_trackmap_nbrequest == 0):  # Si on n'a pas encore créé la trackmap
                            ir_session.best_lapnum = int(ir_session.donnees["drivers"][i]["distpct"])
                            if ir_session.islastvalid[ir_session.best_lapnum]:
                                calc_lapdistpct_by_time(ir_session)

        if (ir_session.donnees["drivers"][i]["lc"] > ir_session.donnees["drivers"][i]["lcold"]): # quand on change de tour on regarde si le temps pourra être validé
            ir_session.donnees["drivers"][i]["pitlastlap"] = 0
            ir_session.donnees["drivers"][i]["islastvalid"] = 0
            if (ir_session.ir['CarIdxLapDistPct'][i] > 0) & (ir_session.ir['CarIdxLapDistPct'][i] < 110 / ir_session.dtrack):  # le tour sera valide que si on est parti du début
                ir_session.donnees["drivers"][i]["islastvalid"] = 1
        if (ir_session.donnees["drivers"][i]["lc"] == 0) & (ir_session.ir['CarIdxLapDistPct'][i] > 0) & (ir_session.ir['CarIdxLapDistPct'][i] < 110 / ir_session.dtrack):  # le tour sera valide que si on est parti du début
            ir_session.donnees["drivers"][i]["islastvalid"] = 1

        # If the driver is temporary disconnected, the lap won't be valid
        if ir_session.ir["CarIdxTrackSurface"][i] < 0:
            ir_session.donnees["drivers"][i]["islastvalid"] = 0

        # En cas de jaune le temps n'est pas valide
        try:
            if (bin(ir_session.ir["SessionFlags"])[-4] == "1")\
                    | (bin(ir_session.ir["SessionFlags"])[-9] == "1")\
                    | (bin(ir_session.ir["SessionFlags"])[-15] == "1")\
                    | (bin(ir_session.ir["SessionFlags"])[-16] == "1"):
                ir_session.donnees["drivers"][i]["islastvalid"] = 0
        except:
            print("FLAG ERROR in calculs.py line 567", bin(ir_session.ir["SessionFlags"]))

        if ir_session.donnees["drivers"][i]["lc"] >= -1 :
            ir_session.donnees["drivers"][i]["lcold"] = ir_session.donnees["drivers"][i]["lc"]    # permettra de savoir si on a changé de tour

        p += 1


def calc_fuel(ir_session):
    me = ir_session.donnees["caridxME"]
    if me in ir_session.donnees["drivers_true"]:
        lcold = ir_session.fuel_lcold
        lc = ir_session.donnees["drivers"][me]["lc"]
        lcd = ir_session.donnees["drivers"][me]["distpct"]
        ir_session.fuel = ir_session.ir["FuelLevel"]
        if ((lc > lcold) & (lcold >= 0)) | (lcd < 0):
            # Si le tour est valide et qu'on n'a pas pitté
            if (ir_session.donnees["drivers"][me]["islastvalid"]) & (ir_session.donnees["drivers"][me]["pitlastlap"] == 0):
                # Consommation du dernier tour
                ir_session.conso = ir_session.fuelold - ir_session.fuel
                if ir_session.conso < 0:
                    ir_session.conso = 0
                ir_session.conso_[lc] = ir_session.conso
            else:
                ir_session.conso_[lc] = 0

            # Moyenne de consommation des 5 derniers tours en enlever les tours non valides
            m = 0
            n = 0
            for l in range(5):
                if lc - l in ir_session.conso_:
                    m += ir_session.conso_[lc - l]
                    if ir_session.conso_[lc - l] > 0:
                        n += 1
            if n != 0:
                ir_session.conso_moy = m / n

            ir_session.fuelold = ir_session.fuel
            ir_session.fuel_lcold = lc
            #print("Nouveau tour >", "distpct:", ir_session.donnees["drivers"][me]["distpct"], "LC:", lc, "Tank:", ir_session.fuel)
        #if (ir_session.conso > 0) & (ir_session.donnees["drivers"][me]["lapsremain"] < 32767):
        if (ir_session.conso > 0):
            fn = ir_session.donnees["drivers"][me]["lapsremain"] * ir_session.conso - ir_session.fuel
            if fn < 0:
                fn = 0
            ir_session.fuelneed = fn
            fn_moy = ir_session.donnees["drivers"][me]["lapsremain"] * ir_session.conso_moy - ir_session.fuel
            if fn_moy < 0:
                fn_moy = 0
            ir_session.fuelneed_moy = fn_moy


# Drivers position on the track
def calc_posldp(ir_session):
    nb = 0
    for i in ir_session.donnees["drivers_true"]:
        pos = 1
        if ir_session.donnees["drivers"][i]["distpct"] > 0:
            ldpi = ir_session.donnees["drivers"][i]["distpct"] - int(ir_session.donnees["drivers"][i]["distpct"])
            for j in ir_session.donnees["drivers_true"]:
                if ir_session.donnees["drivers"][j]["distpct"] > 0:
                    ldpj = ir_session.donnees["drivers"][j]["distpct"] - int(ir_session.donnees["drivers"][j]["distpct"])
                    if ldpj > ldpi:
                        pos += 1
                    if (ldpj == ldpi) & (j > i):
                        pos += 1
            ir_session.donnees["drivers"][i]["posldp"] = pos
            nb += 1
            #print(pos, ir_session.donnees["drivers"][i]["num"])
        else:
            ir_session.donnees["drivers"][i]["posldp"] = -1
    ir_session.nb_piste = nb       # nombre de pilotes en piste ou dans les stands


# Drivers position on the F3 box
def calc_posf3(ir_session):
    caridxCAM = ir_session.ir["CamCarIdx"]
    cl_sel = int(ir_session.nb_piste / 2 + 1)
    for i in ir_session.donnees["drivers_true"]:
        if ir_session.donnees["drivers"][i]["posldp"] != -1:
            cl = ir_session.donnees["drivers"][i]["posldp"] - ir_session.donnees["drivers"][caridxCAM]["posldp"] + cl_sel
            if cl < 1:
                cl += ir_session.nb_piste
            if cl > ir_session.nb_piste:
                cl -= ir_session.nb_piste
            ir_session.donnees["drivers"][i]["posf3"] = cl
        else:
            ir_session.donnees["drivers"][i]["posf3"] = -1


# Relative gap with CamCarIdx in F3 box mode
def calc_relf3(ir_session):
    caridxCAM = ir_session.ir["CamCarIdx"]
    if caridxCAM in ir_session.donnees["drivers_true"]:
        for i in ir_session.donnees["drivers_true"]:
            lap1 = int(ir_session.donnees["drivers"][caridxCAM]["distpct"])
            lap2 = int(ir_session.donnees["drivers"][i]["distpct"])
            distpct1 = ir_session.donnees["drivers"][caridxCAM]["distpct"]
            distpct2 = ir_session.donnees["drivers"][i]["distpct"]
            ldp1 = distpct1 - int(distpct1)
            ldp2 = distpct2 - int(distpct2)
            if ir_session.donnees["drivers"][i]["posf3"] >= ir_session.donnees["drivers"][caridxCAM]["posf3"]:
                if ldp1 < ldp2:
                    lap1 -= 1
                distpct2 = ir_session.donnees["drivers"][i]["distpct"]
                distpct1 = lap1 + ldp2
            else:
                if ldp1 > ldp2:
                    lap2 -= 1
                distpct1 = ir_session.donnees["drivers"][caridxCAM]["distpct"]
                distpct2 = lap2 + ldp1

            k1 = int(distpct1 * (ir_session.dtrack // ir_session.MM))
            k2 = int(distpct2 * (ir_session.dtrack // ir_session.MM))
            if (k2 in ir_session.donnees["drivers"][i]) & (k1 in ir_session.donnees["drivers"][caridxCAM]):
                ir_session.donnees["drivers"][i]["relf3"] = int(100*(ir_session.donnees["drivers"][caridxCAM][k1] - ir_session.donnees["drivers"][i][k2]))/100

            # On n'affiche pas le rel tant que la course n'est pas commencée pour éviter les erreurs d'affichage
            if ir_session.sessionstate < 4:
                ir_session.donnees["drivers"][i]["relf3"] = 0


def calc_projected_lapdistpct(ir_session):
    me = ir_session.donnees["caridxME"]
    coef_k = ir_session.dtrack // ir_session.MM
    ldp = ir_session.donnees["drivers"][me]["distpct"] - int(ir_session.donnees["drivers"][me]["distpct"])
    lap1 = int(ir_session.donnees["drivers"][me]["distpct"])
    k = int(ldp * coef_k)
    #if k < 0:
    #    k = ir_session.k_max - 1
    #d = ldp * coef_k

    if k in ir_session.donnees["time"]:
        tps = ir_session.donnees["time"][k]
        t = int(tps - ir_session.nextpittimelost - 1)
        t2 = t + 1
        dec_lap1 = 0
        dec_lap2 = 0
        while t < 0:
            t += ir_session.timemax
            dec_lap1 += 1
        while t2 < 0:
            t2 += ir_session.timemax
            dec_lap2 += 1
        if t in ir_session.donnees["lapdistpct"]:
            pexit1 = ir_session.donnees["lapdistpct"][t]
        else:
            pexit1 = 0
        if t2 in ir_session.donnees["lapdistpct"]:
            pexit2 = ir_session.donnees["lapdistpct"][t2]
        else:
            pexit2 = 0

        #pexit = pexit1 + (d - k) * (pexit2 - pexit1)
        #if pexit >= 1:
        #    pexit -= 1

        if pexit2 < pexit1:
            pexit2 += 1

        dd = pexit2 - pexit1
        if dd >= 1:
            dd -= 1

        # On rajoute le nombre de tours parcourus
        pexit1 += lap1 - dec_lap1
        pexit2 += lap1 - dec_lap2

        if pexit1 != ir_session.pexit1_old:
            ir_session.pexit_tick = 0
        #if k != ir_session.k_old:
        #    ir_session.k_tick = 0

        pexit = pexit1 + (ir_session.pexit_tick / ir_session.fps) * dd
        #pexit = pexit1 + (d - k) * dd

        #ir_session.projected_lapdistpct1 = pexit1
        #ir_session.projected_lapdistpct2 = pexit2
        ir_session.projected_lapdistpct = pexit

        ir_session.pexit1_old = pexit1
        ir_session.pexit_tick += 1

        # Pour éviter que lorsqu'on fait pause sur un replay la voiture continue d'avancer
        if ir_session.pexit_tick > ir_session.fps:
            ir_session.pexit_tick = ir_session.fps

        #ir_session.k_old = k
        #ir_session.k_tick += 1





