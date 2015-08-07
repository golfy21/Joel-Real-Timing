couleurs = []
couleurs2 = []

/*couleurs[0]='#c78cb9'
couleurs[1]='#c77b9e'
couleurs[2]='#c76276'
couleurs[3]='#c7484e'
couleurs[4]='#c73733'
couleurs[5]='#ce5a33'
couleurs[6]='#d88d34'
couleurs[7]='#e1bf34'
couleurs[8]='#e9e234'
couleurs[9]='#c8d437'
couleurs[10]='#99bf3d'
couleurs[11]='#6aab42'
couleurs[12]='#499d45'
couleurs[13]='#48975f'
couleurs[14]='#458e84'
couleurs[15]='#4385a9'
couleurs[16]='#4080c1'*/


for (i=0; i<=32; i++) {
    couleurs[i]='rgb('+Math.floor(255-128*i/32)+','+Math.floor(128*i/32)+','+Math.floor(128*i/32)+')';
}
for (i=32; i<=64; i++) {
    couleurs[i]='rgb('+Math.floor(128*(64-i)/32)+','+Math.floor(128+(i-32)*127/32)+','+Math.floor(128*(64-i)/32)+')';
}

for (i=16; i<=32; i++) {
    couleurs2[i]='rgb('+Math.floor(255-128*(i-16)/16)+','+Math.floor(128*(i-16)/16)+','+Math.floor(128*(i-16)/16)+')';
}
for (i=32; i<=48; i++) {
    couleurs2[i]='rgb('+Math.floor(128*(48-i)/16)+','+Math.floor(128+(i-32)*127/16)+','+Math.floor(128*(48-i)/16)+')';
}
for (i=0; i<16; i++) {
    couleurs2[i]='rgb('+Math.floor(255-(16-i)^2*128/(16^2))+',0,'+Math.floor(255*(16-i)/16)+')';
}
for (i=49; i<=64; i++) {
    couleurs2[i]='rgb(0,'+Math.floor(255-(i-48)^2*128/(16^2))+','+Math.floor(255*(i-48)/16)+')';
}
