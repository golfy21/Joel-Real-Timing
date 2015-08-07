// OPTIONS BY DEFAULT
// These options will be replaced by the one specified in template.txt
//


// Names available : "gain", "cgain", "spos", "scpos", "cpos", "pos", "num", "name", "ir", "lic", "rel", "delta", "gap", "last", "best", "lc", "distpct", "speed", "topspeed", "apex_speed", "max_speed", "accel", "stint", "pit", "pitroadtime", "pitstalltime", "inc"

// Liste de toutes les colonnes disponibles
tab_titres_all_default = ["gain", "cgain", "distpct", "accel", "pos", "cpos", "spos", "scpos", "num", "name", "ir", "lic", "rel", "delta", "gap", "last", "best", "lc", "speed", "topspeed", "apex_speed", "max_speed", "stint", "pit", "pitroadtime", "pitstalltime", "inc"];

// Colonnes utilisées par default
tab_titres = ["pos", "cpos", "num", "name", "ir", "lic", "rel", "delta", "gap", "last", "best", "lc", "speed", "topspeed", "apex_speed", "max_speed", "stint", "pit", "pitroadtime", "pitstalltime", "inc"];

disp_trackmap = 0       // Set 1 if you want to display the trackmap
f3_box = 0              // Set 1 if you want to display relatives like the F3 box in iRacing
tires_buttons = 1       // Set 0 if you don't need tires buttons
autoscroll = 0          // Spécify if you want the timing to scroll automatically to the selected driver

disp_paypal = 1		// Set 0 if you want to hide paypal link
disp_infosbar = 1	// Set 0 if you don't need the infos bar, set 1 to have the infos on 1 line and set 2 to have the infos on 2 lines
disp_fuelinfos = 1	// Set 0 if you don't want to show the fuel infos

reference_w = 1600  	// Width in pixel (the line height and font-size are calculated using this reference
responsive = 1   		// Set 1 if you want that the line height, the font-size and the column width change depending of the window width
transparency_OBS = 0  	// Set 1 to have transparency in OBS with CLR browser

animation = 1		// Set 0 if you want to deactivate the animations when the drivers gain or loose positions

disp_sofbar = 0		// Set 1 if you want to display only the sof in a single line at the top
sofbar_h = 14		// Height of the sofbar

ligne_h = 40    		// Hauteur des lignes - Lines height

// PG               // Position gain
w['gain'] = 56

// CG               // Position gain in class
w['cgain'] = 56

// P
w['pos'] = 42     		// Largeur de la colonne P - P column width

// C				// Position in Class
w['cpos'] = 50     		// Largeur de la colonne C - C column width

// sP				// Start position
w['spos'] = 50     		// Largeur de la colonne sP - sP column width

// sC				// Start Position in Class
w['scpos'] = 50     		// Largeur de la colonne sC - sC column width

// #
w['num'] = 50     		// Largeur de la colonne # - # column width

// NAME
w['name'] = 342			// Largeur de la colonne NAME - NAME column width
name_mode = 1   		// 1 : full name (ex: Lewis Hamilton), 2 : short name (ex : L. HAMILTON), 3 : very short name (ex : HAM),
						//4: Team Name, 5: team name & full name on 2 lines, 6: team name & short name on the same line

// iR
w['ir'] = 72     		// Largeur de la colonne iR - iR column width
ir_mode = 1				// 1: normal display, 2: display with licence color

// Lic
w['lic'] = 70     		// Largeur de la colonne Lic - Lic column width
lic_mode = 3    		// 1: compact, 2: full, 3: iRacing style compact, 4: iRacing style full

// SPD
w['speed'] = 76     	// Largeur de la colonne SPD - SPD column width

// TOP
w['topspeed'] = 76     	// Largeur de la colonne TOP - TOP column width

// Accel
w['accel'] = 80     	// Largeur de la colonne Accel - Accel column width

// Apex
w['apex_speed'] = 76	// Largeur de la colonne Apex - Apex column width

// Max
w['max_speed'] = 76		// Largeur de la colonne Max - Max column width

// REL
w['rel'] = 80     		// Largeur de la colonne REL - REL column width

// ?
w['delta'] = 100		// Largeur de la colonne REL - REL column width
delta_h = ligne_h		// Ne pas toucher ! - Don't touch !

// GAP
w['gap'] = 80     		// Largeur de la colonne GAP - GAP column width

// LAST
w['last'] = 106     	// Largeur de la colonne LAST - LAST column width

// BEST
w['best'] = 106     	// Largeur de la colonne BEST - BEST column width

// LC
w['lc'] = 56     		// Largeur de la colonne LC - LC column width

// distpct
w['distpct'] = 120     	// Largeur de la colonne distpct - distpct column width

// St
w['stint'] = 76     	// Largeur de la colonne St - St column width

// PIT
w['pit'] = 46     		// Largeur de la colonne PIT - PIT column width

// lane
w['pitroadtime'] = 72	// Largeur de la colonne lane - lane column width

// Stop
w['pitstalltime'] = 72	// Largeur de la colonne Stop - Stop column width

// INC
w['inc'] = 54			// Largeur de la colonne INC - INC column width
