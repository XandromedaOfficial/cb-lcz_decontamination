timers = {}

function OnScriptLoaded()
    print("Decom")
    Decom_Annouc(15)
    return -1
end

function Decom_Annouc(/15)
    servermessage(string.format("[FACILITY] LCZ Decomtamination Process will begin in T-Minus %d Minutes",mins))
    createsound("SFX/Alarm/Alarm3.ogg",72, 0, 133, 75, 1.7)
    if mins > 10 then createtimer("Decom_Annouc", 300000, 0, mins-5) else DecomTimer(10,0) end
    return -1
end

function wipeout(plr,txt) if isplayerconnected(plr) == 1 then removeplayertext(plr,txt) end end

function DecomTimer()
    local sec
    local colour = 123456 --yes, colour not color
    if secs < 10 then
        if mins == 0 then colour = 16711680 end
        sec = "0" + secs
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
    if timer[3] then return end--if decom starts in some other way, shut down timer
    createtimer("playertext", 1000, 0, mins, secs-1)
    for x = 1, 64 do
        if isplayerconnected(x) == 1 then
            if getplayerzone(x) == 1 and getplayertype(x) ~= 0 then
                local screen_width = getplayermonitorwidth(x)
                local screen_height = getplayermonitorheight(x)
                sec = createplayertext(x, decomtext, screen_width/32, screen_height/8,  colour, "DS-DIGITAL.ttf",50) --not using sec variable anymore so might as well repurpose it
                createtimer("wipeout",1000,0,x,sec)
            end
        end
    end
end

function Decom()
    enddecom() --end any instance of decom still running
    createsound("SFX/Alarm/Alarm3.ogg",72, 0, 133, 60, 1.7) 
    servermessage("[FACILITY] LCZ Decontamination Process has commenced")
    timers = {createtimer("createsound",500,1,"SFX/General/Hiss.ogg",72, 0, 133, 70, 4),createtimer("cough",4000,1),createtimer("Suffering",2000,1)}
    --timers[1] gas, 2: Cough, 3: DEATH
end

function IfSCP(role) if role == 6 or role == 5 or role > 9 and role ~= 13 then return true else return false end end
--Test for role if SCP. Except for zombie cause 300 hp, feel sad

def cough() //make each plr in lcz cough every 4 secs
    for plr = 1, 64 do
        if isplayerconnected(plr) then
            if getplayertype(plr) ~= 0 and getplayerzone(plr) == 1 and not ifSCP() then playplayersound(plr,"SFX/Character/D9341/Cough1.ogg",10,1) end
        end
    end
end