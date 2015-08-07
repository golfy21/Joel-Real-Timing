# C:/Python34
# coding: utf-8
# -*- coding: utf-8 -*-


# Regroup the datas to send in an object
# type : 0 -> no datas, 1 -> all the datas, 2 -> only real time datas (no names)
def recupere_donnees(datas_type, ir_session):
    datas_to_send = {"typ": datas_type, "d": {}}
    if ir_session.initialized:
        for i in ir_session.donnees["drivers_true"]:
            datas_to_send["d"][i] = {}
            for t in ir_session.liste_donnees[datas_type]:
                #try:
                datas_to_send["d"][i][ir_session.liste_donnees[datas_type][t]['shortname']] = ir_session.donnees["drivers"][i][t]
                #except:
                #    print("ERROR in recupere_donnees.py line 17")

            if datas_type == 1:     # datas to send only once at the beginning
                pass

            if datas_type <= 2:     # datas de send 1 time per second
                try:
                    datas_to_send["d"][i]["ts"] = ir_session.ir["CarIdxTrackSurface"][i]
                except:
                    pass
                datas_to_send["d"][i]["lr"] = ir_session.donnees["drivers"][i]["lapsremain"]
                datas_to_send["d"][i]["fr"] = ir_session.donnees["drivers"][i]["freeze"]
                try:
                    datas_to_send["d"][i]["spos"] = ir_session.donnees["sdrivers"][i]["startpos"]
                    datas_to_send["d"][i]["scpos"] = ir_session.donnees["sdrivers"][i]["startcpos"]
                    datas_to_send["d"][i]["classid"] = ir_session.donnees["drivers"][i]['carclassid']
                except:
                    print("ERROR in recupere_donnees.py line 31")

            if datas_type <= 3:     # datas de send fps time per second
                datas_to_send["d"][i]["dp"] = int(10000 * ir_session.donnees["drivers"][i]["distpct"]) / 10000
                datas_to_send["d"][i]["s"] = int(10 * ir_session.donnees["drivers"][i]["speed"]) / 10
                datas_to_send["d"][i]["tops"] = int(10 * ir_session.donnees["drivers"][i]["topspeed"]) / 10
                datas_to_send["d"][i]["a"] = int(10 * ir_session.donnees["drivers"][i]["accel"]) / 10
                datas_to_send["d"][i]["rt"] = int(10 * ir_session.donnees["drivers"][i]["pitroadtime"]) / 10
                datas_to_send["d"][i]["st"] = int(10 * ir_session.donnees["drivers"][i]["pitstalltime"]) / 10

        if datas_type == 1:     # datas to send only once at the beginning
            datas_to_send["me"] = ir_session.donnees["caridxME"]

            datas_to_send["skies"] = ir_session.ir["WeekendInfo"]["WeekendOptions"]["Skies"]
            datas_to_send["tracktemp"] = ir_session.ir["WeekendInfo"]["TrackSurfaceTemp"]
            datas_to_send["airtemp"] = ir_session.ir["WeekendInfo"]["WeekendOptions"]["WeatherTemp"]
            datas_to_send["airpress"] = ir_session.ir["WeekendInfo"]["TrackAirPressure"]
            datas_to_send["humidity"] = ir_session.ir["WeekendInfo"]["TrackRelativeHumidity"]
            datas_to_send["windspeed"] = ir_session.ir["WeekendInfo"]["WeekendOptions"]["WindSpeed"]
            datas_to_send["winddir"] = ir_session.ir["WeekendInfo"]["WeekendOptions"]["WindDirection"]
            datas_to_send["weathertype"] = ir_session.ir["WeekendInfo"]["TrackWeatherType"]

            datas_to_send["trackname"] = ir_session.ir["WeekendInfo"]["TrackDisplayName"]

            datas_to_send["sof"] = {}
            datas_to_send["sof"][0] = ir_session.donnees["sof"][0]
            datas_to_send["carclasscolor"] = {}
            datas_to_send["classes"] = {}
            datas_to_send["classname"] = {}
            datas_to_send["nbcars_class"] = {}
            datas_to_send["nbcars_class"][0] = ir_session.nbcars_class[0]
            for c in ir_session.classes:
                datas_to_send["classes"][c] = 1
                datas_to_send["sof"][c] = ir_session.donnees["sof"][c]
                datas_to_send["carclasscolor"][c] = ir_session.carclasscolor[c]
                datas_to_send["classname"][c] = ir_session.classname[c]
                datas_to_send["nbcars_class"][c] = ir_session.nbcars_class[c]

            datas_to_send["nb"] = ir_session.donnees["nb_drivers"]
            #datas_to_send["fps"] = ir_session.fps
            if ir_session.ir["DisplayUnits"] == 0:
                datas_to_send["u"] = 0
            else:
                datas_to_send["u"] = 1

            datas_to_send["nbclass"] = ir_session.ir["WeekendInfo"]["NumCarClasses"]
            datas_to_send["teamracing"] = ir_session.teamracing

            # Trackmap
            datas_to_send["min_x"] = ir_session.min_x
            datas_to_send["max_x"] = ir_session.max_x
            datas_to_send["min_y"] = ir_session.min_y
            datas_to_send["max_y"] = ir_session.max_y
            datas_to_send["k_max"] = ir_session.k_max
            datas_to_send["x"] = {}
            datas_to_send["y"] = {}
            for k in range(0, ir_session.k_max):
                if k in ir_session.coord_best["x"]:
                    datas_to_send["x"][k] = ir_session.coord_best["x"][k]
                    datas_to_send["y"][k] = ir_session.coord_best["y"][k]

            datas_to_send["coef_k"] = ir_session.dtrack // ir_session.MM

        if datas_type <= 2:     # datas de send 1 time per second
            datas_to_send["c"] = ir_session.ir["CamCarIdx"]
            datas_to_send["p1"] = ir_session.caridxP1
            datas_to_send["tr"] = ir_session.timeremain
            datas_to_send["lr"] = ir_session.lapsremain
            datas_to_send["f"] = int(100*ir_session.fuel)/100
            datas_to_send["fn"] = int(10*ir_session.fuelneed)/10
            datas_to_send["fn5"] = int(10*ir_session.fuelneed_moy)/10
            datas_to_send["co"] = int(1000*ir_session.conso)/1000
            datas_to_send["co5"] = int(1000*ir_session.conso_moy)/1000
            datas_to_send["s_init"] = ir_session.startpos_initialized
            datas_to_send["plost"] = ir_session.nextpittimelost

        if datas_type <= 3:     # datas de send fps time per second
            datas_to_send["flag"] = bin(ir_session.ir["SessionFlags"])
            datas_to_send["pexit"] = ir_session.projected_lapdistpct

        datas_to_send["sn"] = ir_session.sessionnum     # IMPORTANT! sessionnum have to be sent everytime
        datas_to_send["sid"] = ir_session.sessionid     # IMPORTANT! sessionid have to be sent everytime
        datas_to_send["styp"] = ir_session.sessiontype    # IMPORTANT! typs have to be sent everytime
        datas_to_send["reload"] = ir_session.reload
        datas_to_send["f3"] = ir_session.switch_f3box_nbrequest
        datas_to_send["stm"] = ir_session.send_trackmap_nbrequest
        datas_to_send["trm"] = ir_session.trackmap_nbrequest
        #datas_to_send["t"] = ir["Throttle"]
        #datas_to_send["a"] = ir["SteeringWheelAngle"]

    return datas_to_send

"""

DATAS TO SEND (shortname : name)

ts:     CarIdxTrackSurface
dp:     distpct
s:      speed
a:      accel
rt:     pitroadtime
st:     pitstalltime

pos:    pos
cpos:   cpos  (position in class)
spos:   spos  (start position)
scpos:  scpos (start position in class)
num:    num
name:   name
tn:     teamname
ir:     ir
as:     apex_speed
ms:     max_speed
rc:     rel
g:      gap
lc:     lc
sti:    stint
p:      onpitroad
ps:     onpitstall
np:     nb_pit
ni:     nb_inc
l:      last
b:      best
cc:     carclasscolor
lic:    liccolor

styp:   type_session
sof:    sof
nb:     nb_drivers
fps:    fps
u:      DisplayUnits
c:      CamCarIdx
p1:     caridxP1
sn:     sessionnum
sid:    sessionid

tr:     timeremain
lr:     lapsremain

t:      Throttle
a:      SteeringWheelAngle

f:      fuel in tank (in liter)
fn:     fuel need to finish the race (in liter)
fn5:    fuel need to finish the race (in liter) calculé en utilisant la conso moyenne sur 5 tours
co:     Consommation du dernier tour valide (in liter)
co5:    Consommation moyenne des 5 derniers tours valides

"""