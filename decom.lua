timers = {}

function OnScriptLoaded()
    print("Decom")
    createtimer("printy",100,0,"lego")
    return -1
end

function Decom_Annouc(mins)
    mins = tonumber(mins)
    servermessage(string.format("[FACILITY] LCZ Decomtamination Process will begin in T-Minus %d Minutes",mins))
    createsound("SFX/Alarm/Alarm3.ogg",72, 0, 133, 75, 1.7)
    if mins > 10 then createtimer("Decom_Annouc", 300000, 0, mins-5) else DecomTimer(10,0) end
    return -1
end

function wipeout(plr,txt) 
    plr,txt = tonumber(plr),tonumber(txt)
    if isplayerconnected(plr) == 1 then removeplayertext(plr,txt) end
end

function DecomTimer(mins,secs)
    mins,secs = tonumber(mins),tonumber(secs)
    local sec
    local colour = 123456 --yes, colour not color
    if secs < 10 then
        if mins == 0 then colour = 16711680 end
        sec = "0" .. secs
    else sec = secs end --display variable
    local decomtext = string.format("LCZ Decontamination will begin in %d:%d",mins,sec)
    if secs == 0 then
        if mins == 0 then
            Decom(); return --Timer finishes, Suffering begins
        else
            mins = mins - 1
            secs = 60
        end
    end
    if timers[3] then return end--if decom starts in some other way, shut down timer
    createtimer("DecomTimer", 1000, 0, mins, secs-1)
    for plr = 1, 64 do
        if isplayerconnected(x) == 1 then
            if getplayerzone(x) == 1 and getplayertype(x) ~= 0 then
                local screen_width = getplayermonitorwidth(x)
                local screen_height = getplayermonitorheight(x)
                sec = createplayertext(x, decomtext, screen_width/32, screen_height/8,  colour, "DS-DIGITAL.ttf",50) --not using sec variable anymore so might as well repurpose it
                createtimer("wipeout",1000,0,plr,sec)
            end
        end
    end
end

function Decom() --Start Decom. Activates alarm, message and functions. Activates Suffering() which is the actual killing
    OnServerRestart() --end any instance of decom still running
    createsound("SFX/Alarm/Alarm3.ogg",72, 0, 133, 60, 1.7) 
    servermessage("[FACILITY] LCZ Decontamination Process has commenced")
    timers = {createtimer("createsound",500,1,"SFX/General/Hiss.ogg",72, 0, 133, 70, 4),createtimer("cough",4000,1),createtimer("Suffering",2000,1)}
    --timers[1] gas, 2: Cough, 3: DEATH
end

function IfSCP(role) if role == 6 or role == 5 or role > 9 and role ~= 13 then return true else return false end end
--Test for role if SCP. Except for zombie cause 300 hp, feel sad

function cough() --make each plr in lcz cough every 4 secs
    for plr = 1, 64 do
        if isplayerconnected(plr) then
            if getplayertype(plr) ~= 0 and getplayerzone(plr) == 1 and not ifSCP() then playplayersound(plr,"SFX/Character/D9341/Cough1.ogg",10,1) end
        end
    end
end

function Suffering() --detect plrs and dmg in LCZ. See into replacing this with LCZ checkpoint lockdown protocol
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
                    servermessage(getplayernickname(plr)+" suffocated in decontamination gas")
                end
            else
                setplayerfogrange(plr,8)
            end
        end
    end
end

-----------Callbacks-------------

function OnRoundStarted() createtimer("Decom_Annouc",0,0,15); return -1 end --Change first 0 to change when the first annoucement is made

function OnServerRestart() --Shut down decom and reset timers list
    for x = 1, 3 do removetimer(timers[x]) end
    timers = {}
    return -1
end --For all intents and purposes, OnServerRestart() is the new callback for enddecom()

function OnPlayerConsole(plr,msg)
    local select = {
        ["decom"] = function() --Use console to immediately activate decom procedure
            servermessage("Decom Procedure manually activated by"+getplayernickname(plr)) --Make sure everyone knows whose gassing them
            Decom()
        end,
        ["enddecom"] = function() --Use console to shutdown decom
            servermessage("Decom Procedure ended by"+getplayernickname(plr)) --Make sure everyone knows who saved them
            OnServerRestart()
        end
    }
    if type(select[msg]) == "function" then select[msg]() end
    return -1
end