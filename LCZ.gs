#include "includes\multiplayer_core.inc"

global timer = [3,SE_INT] //timer values

def cough() //make each plr in lcz cough every 4 secs
    for plr = 1; plr < 65;plr++
        if IsPlayerConnected(plr) then
            if GetPlayerType(plr) != 0 and GetPlayerZone(plr) == 1 then PlayPlayerSound(plr,"SFX/Character/D9341/Cough1.ogg",10,1)                
        end
    end
end

def Suffering() //detect plrs and dmg in LCZ. See into replacing this with LCZ checkpoint lockdown protocol
    for plr = 1; plr < 65; plr++
        if IsPlayerConnected(plr) then
            local role = GetPlayerType(plr)
            if GetPlayerZone(plr) == 1 and role != 0 then
                SetPlayerFogRange(plr,2.5)
                local screen_width = GetPlayerMonitorWidth(plr)
                local evactext = CreatePlayerText(plr, "You are in decontamination gas, evacuate LCZ NOW!",screen_width/8, 30, 1530000, "DS-DIGITAL.ttf", 50)
                CreateTimer("wipeout", 1000, 0, plr, evactext)
                if role == 6 or role == 5 or role > 9 and role != 13 then
                    dmgpo = 100
                else
                    dmgpo = 10
                end
                if GetPlayerHealth(plr) > dmgpo then
                    GivePlayerHealth(plr,-1*dmgpo)
                else                    
                    SetPlayerType(plr,0); ServerMessage(GetPlayerNickname(plr)+" suffocated in decontamination gas")
                end
            else
                SetPlayerFogRange(plr,8)
            end
        end
    end
end

def gas()
    CreateSound("SFX/General/Hiss.ogg",72, 0, 133, 70, 4)
end

def Decom()
    enddecom() //end any instance of decom still running
    CreateSound("SFX/Alarm/Alarm3.ogg",72, 0, 133, 60, 1.7) 
    ServerMessage("[FACILITY] LCZ Decontamination Process has commenced")
    timer[0] = CreateTimer("gas",500,1)
    timer[1] = CreateTimer("cough",4000,1)
    timer[2] = CreateTimer("Suffering",2000,1)
end

def wipeout(plr,text)
    if IsPlayerConnected(plr) then RemovePlayerText(plr,text)
end

def playertext(mins, secs)
    local sec
    local colour = 123456 //yes, colour not color
    if secs < 10 then
        if mins == 0 then colour = 1530000
        sec = "0" + secs
    else
        sec = secs //display variable
    end
    local decomtext = "LCZ Decontamination will begin in " + mins + ":" + sec
    if secs == 0 then
        if mins == 0 then
            Decom(); return //Timer finishes, Suffering begins
        else
            mins = mins - 1; secs = 60
        end
    end
    if timer[2] then return//if decom starts in some other way, shut down timer
    CreateTimer("playertext", 1000, 0, mins, secs-1)
    for x = 1; x < 65; x++
        if IsPlayerConnected(x) == 1 then
            if GetPlayerZone(x) == 1 and GetPlayerType(x) != 0 then
                local screen_width = GetPlayerMonitorWidth(x)
                sec = CreatePlayerText(x, decomtext, screen_width/32, 60,  colour, "DS-DIGITAL.ttf",50) //not using sec variable anymore so might as well repurpose it
                CreateTimer("wipeout",1000,0,x,sec)
            end
        end
    end
end

def DecomTimer(mins)
    ServerMessage("[FACILITY] LCZ Decontamination Process will commence in T-Minus " + mins + " minutes")
    CreateSound("SFX/Alarm/Alarm3.ogg",72, 0, 133, 75, 1.7)
    if mins > 10 then
        CreateTimer("DecomTimer", 300000, 0, mins-5)
    else
        playertext(1,0) //Start timer at 10 mins
    end
end

public def OnServerRestart()
    enddecom()
end

def enddecom()
    for x = 0; x < 3;x++
        RemoveTimer(timer[x])
    end
    timer = [3,SE_INT] //wipe list
end 

public def OnRoundStarted()
    CreateTimer("DecomTimer",0,0,5) //change the first 0 if you want the decom timer to start later
end

public def OnPlayerConsole(_,msg) 
    select msg
        case "decom" //Use console to immediately activate decom procedure
            Decom()
        case "enddecom" //use console to shutdown decom
            enddecom()
    end
end