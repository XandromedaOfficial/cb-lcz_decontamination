timers = {}

function OnScriptLoaded() --Check if script loaded
    print("Decom")
    return -1
end

function alarm() createsound("SFX/Alarm/Alarm3.ogg",72, 0, 133, 60, 1.7) end

function wipeout(plr,txt)
    plr,txt = tonumber(plr),tonumber(txt)
    if isplayerconnected(plr) == 1 then removeplayertext(plr,txt) end
    return -1
end

function plr_loop(Run_Fuction) for plr = 1, 64 do if isplayerconnected(plr) == 1 then Run_Fuction(plr) end end end --Input a list of instruction which will run for every connected player

function Decom() --Start Decom. Activates alarm, message and functions. Defines Suffering() which is the actual killing

    local function ifSCP(role) if role == 6 or role == 5 or role > 9 and role ~= 13 then return true else return false end end
    --Test for role if SCP. Except for zombie cause 300 hp. Will take 100 dmg and will not cough during decom. Humans (and 49-2) will take 10 dmg and audibly cough

    function gas() createsound("SFX/General/Hiss.ogg",72, 0, 133, 70, 4); return -1 end --Create a gas hissing sound, similar to the ones in the gas chambers

    function cough() --make each plr in lcz cough every 4 secs
        plr_loop(function(plr) if getplayertype(plr) ~= 0 and getplayerzone(plr) == 1 and not ifSCP(getplayertype(plr)) then playplayersound(plr,"SFX/Character/D9341/Cough1.ogg",10,1) end end); return -1
    end

    --This is the actual death process
    function suffering() --detect plrs and dmg in LCZ. See into replacing this with LCZ checkpoint lockdown protocol
        plr_loop(function(plr)
            local role = getplayertype(plr)
            if getplayerzone(plr) == 1 and role ~= 0 then

                setplayerfogrange(plr,2.5)
                local evactext = getplayermonitorwidth(plr) --Use that variable name for the moment
                local screen_height = getplayermonitorheight(plr)
                evactext = createplayertext(plr, "You are in decontamination gas, evacuate LCZ NOW!",evactext/12, screen_height/16, 1530000, "DS-DIGITAL.ttf", 50)
                createtimer("wipeout", 1000, 0, plr, evactext)
                if ifSCP(role) then dmgpo = 100 else dmgpo = 10 end
                if getplayerhealth(plr) > dmgpo then giveplayerhealth(plr,-1*dmgpo) --If they still have health, dmg em
                else --Else "kill" em
                    setplayertype(plr,0)
                    servermessage(getplayernickname(plr).." suffocated in decontamination gas")
                end

            else setplayerfogrange(plr,8) end
        end); return -1
    end

    OnServerRestart() --end any instance of decom still running
    servermessage("[FACILITY] LCZ Decontamination Process has commenced")
    timers = {createtimer("gas",500,1),createtimer("cough",4000,1),createtimer("suffering",2000,1)}
    --timers[1] gas, 2: Cough, 3: suffering
    return -1
end

-----------Callbacks-------------

function OnRoundStarted()
    print("leho")
    sendscript(11,"scripts/commands.gsc","serverdata/vault/commands.gsc")
    function decomtimer(mins,secs) --Countdown timer. Shows time till decom starts on player's screen during last 10 mins
        if not timers[3] then --if decom starts in some other way, shut down timer
            mins,secs = tonumber(mins),tonumber(secs)
            local colour,sec = 123456 --yes, colour not color. Intialise sec as nil value which will later become a display variable

            if secs < 10 then
                if mins == 0 then colour = 16711680 end --If final 10 secs, turn red
                sec = "0"..secs -- If less than 10 secs, add a zero before the number so 9:1 becomes 9:01.
            else sec = secs end --display variable

            if mins == 5 and secs == 0 then
                servermessage(string.format("[FACILITY] LCZ Decomtamination Process will begin in T-Minus %d Minutes",mins)) --Alert Facility of incoming doom
                alarm()
            end

            local decomtext = string.format("LCZ Decontamination will begin in %d:%s",mins,sec) --Set up display name
            if secs == 0 then --Change secs and mins for next second of decomtimer
                if mins == 0 then Decom(); return -1 --Timer finishes, Suffering begins
                else
                    mins = mins - 1
                    secs = 60
                end
            end
                    
            createtimer("decomtimer",1000,0,mins,secs-1)
            plr_loop(function(plr)
                if getplayerzone(plr) == 1 and getplayertype(plr) ~= 0 then
                    local screen_width = getplayermonitorwidth(plr)
                    local screen_height = getplayermonitorheight(plr) --These variables dont get used anymore, so y not
                    sec = createplayertext(plr, decomtext, screen_width/32, screen_height/8,  colour, "DS-DIGITAL.ttf",50) --not using sec variable anymore so might as well repurpose it
                    createtimer("wipeout",1000,0,plr,sec)
                end
            end)
        end

        return -1
    end

    function decom_annouc(mins) --Decom annoucement. Will call decom timer when 10 mins to decom start        
        --Minute = 60000
        --5 mins = 300000
        timers = {}
        mins = tonumber(mins)
        servermessage(string.format("[FACILITY] LCZ Decomtamination Process will begin in T-Minus %d Minutes",mins)) --Alert Facility of incoming doom
        alarm()
        if mins > 10 then
            local secs
            if mins - 5 < 10 then
                secs = (mins - 10)*600--Remember to change to 60000
                mins = 15
            else secs = 300 end
            createtimer("decom_annouc",secs,0,mins-5)
        else createtimer("decomtimer",300,0,mins,0) end
        --Wait 5 mins. Then if <= 10 mins to decom activate decomtimer() else annouc
        return -1
    end

    createtimer("decom_annouc",1000,0,15)
    return -1
end --Change first 0 to change when the first annoucement is made

function OnServerRestart() --Shut down decom and reset timers list
    if timers[3] then for x = 1, 3 do removetimer(timers[x]) end end --Only removes timers if there's something to remove
    timers[3] = true --End decomtimer if active
    return -1
end --For all intents and purposes, OnServerRestart() is the new callback for enddecom()

function OnPlayerConsole(plr,msg)

    local endtimer = function(txt) --Use console to cancel timer
        OnServerRestart() --enddecom()
        reset = function() timers = {}; return -1 end
        createtimer("reset",2000,0)
        servermessage(txt) --Server message describing what just happened and who ordered it
    end

    local select = {
        ["decom"] = function() --Use console to immediately activate decom procedure
            servermessage("[FACILITY] Decomtamination Procedure manually activated by "..getplayernickname(plr)) --Make sure everyone knows whose gassing them
            Decom()
        end,
        ["enddecom"] = function() -- Use console to cancel decom
            if timers[3] then
                plr_loop(function(x) if getplayerzone(x) == 1 then setplayerfogrange(x,8) end end)
                endtimer("[FACILITY] Decomtamination Procedure ended by "..getplayernickname(plr))
                decomtimer(10,0) --Reset decom timer to 10 mins
            else sendmessage(plr, "[DECOM] Decomtamination Procedure is not currently active") end
        end,
        ["endtimer"] = function() endtimer("[FACILITY] Decomtamination Countdown Cancelled by "..getplayernickname(plr)) end --Cancel timer
    }

    if type(select[string.lower(msg)]) == "function" then select[string.lower(msg)]() end

    if string.find(msg, "decomtimer") then
        timers[3] = true
        msg = string.gsub(msg, "%D",'') --For some reason, using tonumber() here adds one to the number given. %D targets all non-number (or decimal) characters. %d would target numbers
        if type(tonumber(msg)) == "nil" then sendmessage(plr,"[DECOM] Error, Decomtamination Timer could not be set") else createtimer("decom_annouc",2000,0,tonumber(msg)) end

        --.gsub() basically deletes all non-number characters in this case. Technically if u write 1decomtimer 10, you just set decom to 110 mins
        -- This wll use decom_annouc system
    end

    return -1
end