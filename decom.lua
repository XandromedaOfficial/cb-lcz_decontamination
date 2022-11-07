timers = {}

function OnScriptLoaded() --Check if script loaded
    print("Decom")
    return -1
end

function wipeout(plr,txt) 
    plr,txt = tonumber(plr),tonumber(txt)
    if isplayerconnected(plr) == 1 then removeplayertext(plr,txt) end
    return -1
end

function Decom() --Start Decom. Activates alarm, message and functions. Defines Suffering() which is the actual killing

    local ifSCP = function(role) if role == 6 or role == 5 or role > 9 and role ~= 13 then return true else return false end end
    --Test for role if SCP. Except for zombie cause 300 hp, feel sad. Will take 100 dmg and will not cough during decom. Humans (and 49-2) will take 10 dmg and audibly cough

    gas = function() createsound("SFX/General/Hiss.ogg",72, 0, 133, 70, 4); return -1 end --Create a gas hissing sound, similar to the ones in the gas chambers

    cough = function() --make each plr in lcz cough every 4 secs
        for plr = 1, 64 do
            if isplayerconnected(plr) then
                if getplayertype(plr) ~= 0 and getplayerzone(plr) == 1 and not ifSCP(getplayertype(plr)) then playplayersound(plr,"SFX/Character/D9341/Cough1.ogg",10,1) end
            end
        end
        return -1
    end

    --This is the actual death process
    suffering = function() --detect plrs and dmg in LCZ. See into replacing this with LCZ checkpoint lockdown protocol
        for plr = 1, 64 do
            if isplayerconnected(plr) == 1 then
                local role = getplayertype(plr)
                if getplayerzone(plr) == 1 and role ~= 0 then
                    setplayerfogrange(plr,2.5)
                    local evactext = getplayermonitorwidth(plr) --Use that variable name for the moment
                    local screen_height = getplayermonitorheight(plr)
                    evactext = createplayertext(plr, "You are in decontamination gas, evacuate LCZ NOW!",evactext/12, screen_height/16, 1530000, "DS-DIGITAL.ttf", 50)
                    createtimer("wipeout", 1000, 0, plr, evactext)
                    if ifSCP(role) then dmgpo = 100 else dmgpo = 10 end
                    if getplayerhealth(plr) > dmgpo then --If they still have health, dmg em
                        giveplayerhealth(plr,-1*dmgpo)
                    else --Else its time to die
                        setplayertype(plr,0)
                        servermessage(getplayernickname(plr).." suffocated in decontamination gas")
                    end
                else
                    setplayerfogrange(plr,8)
                end
            end
        end
        return -1
    end

    OnServerRestart() --end any instance of decom still running
    createsound("SFX/Alarm/Alarm3.ogg",72, 0, 133, 60, 1.7) 
    servermessage("[FACILITY] LCZ Decontamination Process has commenced")
    timers = {createtimer("gas",500,1),createtimer("cough",4000,1),createtimer("suffering",2000,1)}
    --timers[1] gas, 2: Cough, 3: suffering
    return -1
end

-----------Callbacks-------------

function OnRoundStarted() 

    decomtimer = function(mins,secs) --Countdown timer. Shows time till decom starts on player's screen during last 10 mins
        mins,secs = tonumber(mins),tonumber(secs)
        local colour,sec = 123456 --yes, colour not color. Intialise sec as nil value which will later become a display variable
        if secs < 10 then
            if mins == 0 then colour = 16711680 end --If final 10 secs, turn red. 
            sec = "0"..secs -- If less than 10 secs, add a zero before the number so 9:1 becomes 9:01.
        else sec = secs end --display variable
        local decomtext = string.format("LCZ Decontamination will begin in %d:%s",mins,sec) --Set up display name
        if secs == 0 then --Change secs and mins for next second of decomtimer
            if mins == 0 then Decom(); return -1 --Timer finishes, Suffering begins
            else
                mins = mins - 1
                secs = 60
            end
        end
        if not timers[3] then --if decom starts in some other way, shut down timer
            recursive = function() decomtimer(mins,secs-1); return -1 end --Screwy createtimer() work around. Restart function but with secs-1 cause thats how time works
            createtimer("recursive", 1000, 0)
            for plr = 1, 64 do
                if isplayerconnected(plr) == 1 then --Lua thinks 0 = true...
                    if getplayerzone(plr) == 1 and getplayertype(plr) ~= 0 then
                        mins = getplayermonitorwidth(plr)
                        secs = getplayermonitorheight(plr) --These variables dont get used anymore, so y not
                        sec = createplayertext(plr, decomtext, mins/32, secs/8,  colour, "DS-DIGITAL.ttf",50) --not using sec variable anymore so might as well repurpose it
                        createtimer("wipeout",1000,0,plr,sec)
                    end
                end
            end
        end
        return -1
    end

    decom_annouc = function(mins) --Decom annoucement. Will call decom timer when 10 mins to decom start
        mins = tonumber(mins)
        servermessage(string.format("[FACILITY] LCZ Decomtamination Process will begin in T-Minus %d Minutes",mins)) --Alert Facility of incoming doom
        createsound("SFX/Alarm/Alarm3.ogg",72, 0, 133, 75, 1.7)
        recursive = function() decom_annouc(mins-5); return -1 end --Lua plays a bit funny with the createtimer() function so...
        if mins > 10 then createtimer("recursive",1000,0) else createtimer("decomtimer",1000,0,10,0) end --Wait 5 mins. Then if 10 mins to decom activate decomtimer() else annouc
        return -1
    end

    createtimer("decom_annouc",0,0,15)
    return -1
end --Change first 0 to change when the first annoucement is made

function OnServerRestart() --Shut down decom and reset timers list
    if timers[3] then for x = 1, 3 do removetimer(timers[x]) end end --Only removes timers if there's something to remove
    timers = {} --Wipe the list
    return -1
end --For all intents and purposes, OnServerRestart() is the new callback for enddecom()

function OnPlayerConsole(plr,msg)

    local select = {
        ["decom"] = function() --Use console to immediately activate decom procedure
            servermessage("Decomtamination Procedure manually activated by "..getplayernickname(plr)) --Make sure everyone knows whose gassing them
            Decom()
        end,
        ["enddecom"] = function() --Use console to shutdown decom
            if timers[3] then 
                servermessage("Decomtamination Procedure ended by "..getplayernickname(plr)) --Make sure everyone knows who saved them
                OnServerRestart() --enddecom()
            else
                sendmessage(plr, "Decomtamination Procedure is not currently active")
            end
        end
    }
    if type(select[msg]) == "function" then select[msg]() end

    return -1
end