# C:/Python34
# coding: utf-8
# -*- coding: utf-8 -*-

import os
import socket
import json
from urllib.request import urlopen
varglob = 5
if os.name != "nt":
    import fcntl
    import struct

    def get_interface_ip(ifname):
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        return socket.inet_ntoa(fcntl.ioctl(s.fileno(), 0x8915, struct.pack('256s',
                                ifname[:15]))[20:24])


def get_lan_ip():

    # On récupère l'adresse IPv4 pour the tethering mode
    fichier = open(".config/tethering_mode.txt", "r")
    ligne = fichier.read().split("\n")   # Fréquence d'envoie des données
    tmp = ligne[0].split("=")
    tethering_mode = int(tmp[1])
    tmp = ligne[1].split("=")
    tethering_IP = tmp[1].replace(" ","")
    fichier.close()

    if tethering_mode == 0:
        ip = socket.gethostbyname(socket.gethostname())
        if ip.startswith("127.") and os.name != "nt":
            interfaces = [
                "eth0",
                "eth1",
                "eth2",
                "wlan0",
                "wlan1",
                "wifi0",
                "ath0",
                "ath1",
                "ppp0",
                ]
            for ifname in interfaces:
                try:
                    ip = get_interface_ip(ifname)
                    break
                except IOError:
                    pass
    else:
        ip = tethering_IP

    return ip


def get_public_ip():
    r = urlopen('http://httpbin.org/ip').read()
    my_ip = json.loads(r.decode())['origin']
    return my_ip
