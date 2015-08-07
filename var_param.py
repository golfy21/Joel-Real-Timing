# C:/Python34
# coding: utf-8
# -*- coding: utf-8 -*-

import irsdk
import os
import shutil
import time


# Si les fichiers de config n'existent pas dans le dossier Mes Documents/Joel Real Timing on copie les fichiers par defaut dans mes documents et dans .config
# Sinon, on récupère ceux existants et on les copie dans .config
mydocuments = os.path.expanduser("~/Documents/Joel Real Timing/")

# Crée les dossiers de base s'ils n'existent pas
if not os.path.isdir(mydocuments):
    os.makedirs(mydocuments)


files = ["buttons.txt", "fps.txt", "fps_broadcast.txt", "fps_calc.txt", "template.txt", "template2.txt", "template3.txt", "template4.txt", "tethering_mode.txt", "webserver_port.txt"]
for f in files:
    if not os.path.isfile(mydocuments + f):
        shutil.copy(".config - default/" + f, mydocuments + f)
        shutil.copy(".config - default/" + f, ".config/" + f)
    else:
        shutil.copy(mydocuments + f, ".config/" + f)


# Fréquence pour le calcul des données en temps réel comme la vitesse
# Mettre au moins 30 pour avoir une précision correcte pour le calcul des vitesses
fichier = open(mydocuments + "fps_calc.txt", "r")
fps_target = int(fichier.read())   # Fréquence d'envoie des données
fichier.close()


# On lit le parametre fps dans le fichier txt
fichier = open(mydocuments + "fps.txt", "r")
fps_tab = fichier.read().split("=")   # Fréquence d'envoie des données
fps = int(fps_tab[1])
fichier.close()
if fps < 2 * fps_target:
    fps_ = int(fps_target / fps + 0.5) * fps  # fps_ doit être un multiple de fps
    while fps_ < 10:
        fps_ += fps
else:
    fps_ = fps
fichier.close()


# Object containing all the datas and variables of the session
class obj_ir_session:
    """
    - liste_donnees : the list of the datas available
    - donnees : the data themselves
    """

    def __init__(self):
        self.liste_donnees = {
            1: {    # typ 1 -> all the datas displayed OR NOT (sent once)
                'pos': {'shortname': 'pos'},
                'posf3': {'shortname': 'posf3'},
                'cpos': {'shortname': 'cpos'},
                'num': {'shortname': 'num'},
                'name': {'shortname': 'name'},
                'teamname': {'shortname': 'tn'},
                'ir': {'shortname': 'ir'},
                'apex_speed': {'shortname': 'as'},
                'max_speed': {'shortname': 'ms'},
                'rel': {'shortname': 'rc'},
                'relf3': {'shortname': 'rcf3'},
                'gap': {'shortname': 'g'},
                'last': {'shortname': 'l'},
                'best': {'shortname': 'b'},
                'lc': {'shortname': 'lc'},
                'stint': {'shortname': 'sti'},
                'onpitroad': {'shortname': 'p'},
                'onpitstall': {'shortname': 'ps'},
                'nb_pit': {'shortname': 'np'},
                'nb_inc': {'shortname': 'ni'},
                'carclasscolor': {'shortname': 'cc'},
                'liccolor': {'shortname': 'lic'},
                'licsub': {'shortname': 'licsub'}
            },
            2: {    # typ 2 -> datas displayed OR NOT sent 1 time per second
                'name': {'shortname': 'name'},
                'teamname': {'shortname': 'tn'},
                'ir': {'shortname': 'ir'},
                'carclasscolor': {'shortname': 'cc'},
                'liccolor': {'shortname': 'lic'},
                'licsub': {'shortname': 'licsub'},
                'pos': {'shortname': 'pos'},
                'posf3': {'shortname': 'posf3'},
                'cpos': {'shortname': 'cpos'},
                'apex_speed': {'shortname': 'as'},
                'max_speed': {'shortname': 'ms'},
                'rel': {'shortname': 'rc'},
                'relf3': {'shortname': 'rcf3'},
                'gap': {'shortname': 'g'},
                'last': {'shortname': 'l'},
                'best': {'shortname': 'b'},
                'lc': {'shortname': 'lc'},
                'stint': {'shortname': 'sti'},
                'onpitroad': {'shortname': 'p'},
                'onpitstall': {'shortname': 'ps'},
                'nb_pit': {'shortname': 'np'},
                'nb_inc': {'shortname': 'ni'}
            },
            3: {    # typ 3 -> datas displayed OR NOT sent fps times per second where fps is the refresh rate for the client
                'pos': {'shortname': 'pos'},
                'cpos': {'shortname': 'cpos'},
                'rel': {'shortname': 'rc'},
                'relf3': {'shortname': 'rcf3'},
                'gap': {'shortname': 'g'}
            }
            # NOTE : some datas don't appear here because they aren't displayed
            # NOTE : all the datas are calculated 60 times per second
        }
        self.donnees = {"typ": 0, "time": {}, "lapdistpct": {}, "sdrivers": {}, "drivers": {}, "drivers_true": {}}
        self.donnees_old = {"typ": 0, "drivers": {}}
        self.ir = irsdk.IRSDK()
        self.statics_sent = 0
        self.fps = fps
        self.initialized = 0
        self.caridxP1 = 1
        self.datas_to_send_typ1 = {"typ": 0, "d": {}}
        self.datas_to_send_typ2 = {"typ": 0, "d": {}}
        self.datas_to_send_typ3 = {"typ": 0, "d": {}}
        self.wait_for_msg_received = 0
        self.reload = 1
        self.sessionnum = 0
        self.sessionid = 0
        self.sessiontype = "init"
        self.startpos_initialized = 0
        self.classes = {}
        self.carclasscolor = {}
        self.classname = {}
        self.nbcars_class = {}
        self.teamracing = 0
        self.tires_all_joy = -1
        self.tires_all_button = -1
        self.tires_none_joy = -1
        self.tires_none_button = -1
        self.refuel_joy = -1
        self.refuel_button = -1
        self.switch_f3box_joy = -1
        self.switch_f3box_button = -1
        self.switch_f3box_nbrequest = 0
        self.nb_piste = 1
        self.tires_checked = 1
        self.nextpittimelost = 0
        self.projected_lapdistpct = 0
        self.best_lapnum = 0
        self.timemax = 0
        self.coord = {"x": {}, "y": {}}
        self.coord_best = {"x": {}, "y": {}}
        self.x = 0
        self.y = 0
        self.min_x = 0
        self.max_x = 0
        self.min_y = 0
        self.max_y = 0
        self.k_max = 0
        self.d = 0
        self.send_trackmap_nbrequest = 0
        self.pexit1_old = 0
        self.pexit_tick = 0
        #self.k_old = 0
        #self.k_tick = 0
        self.trackmap_nbrequest = 0
        self.islastvalid = {}
