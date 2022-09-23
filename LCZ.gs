#include "includes\multiplayer_core.inc"

global sound, coughrepeat, suffer = 0 //timer values

def cough() //make each plr in lcz cough every 4 secs
    for plr = 1; plr < 65;plr++
        if IsPlayerConnected(plr) then
            if GetPlayerType(plr) != 0 and GetPlayerZone(plr) == 1 then
                PlayPlayerSound(plr,"SFX/Character/D9341/Cough1.ogg",10,1)
            end
        end
    end
end

def Suffering() //detect plrs and dmg in LCZ. See into replacing this with LCZ checkpoint lockdown protocol
    for plr = 1; plr < 65; plr++
        if IsPlayerConnected(plr) then
            local role = GetPlayerType(plr)
            if GetPlayerZone(plr) == 1 and role != 0 then
                SetPlayerFogRange(plr,2.5)
                local evactext = CreatePlayerText(plr, "You are in decontamination gas, evacuate LCZ NOW!",60, 30, 1530000, "DS-DIGITAL.ttf", 50)
                CreateTimer("wipeout", 1000, 0, plr, evactext)
                if role == 6 or role == 5 or role > 9 and role != 13 then
                    dmgpo = 100
                else
                    dmgpo = 10
                end
                if GetPlayerHealth(plr) > dmgpo then
                    GivePlayerHealth(plr,-1*dmgpo)
                else
                    if role != 0 then
                        SetPlayerType(plr,0)
                        ServerMessage(GetPlayerNickname(plr)+" suffocated in decontamination gas")
                    end
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
    sound = CreateTimer("gas",500,1)
    coughrepeat = CreateTimer("cough",4000,1)
    suffer = CreateTimer("Suffering",2000,1)
end

def wipeout(plr,text)
    if IsPlayerConnected(plr) then
        RemovePlayerText(plr,text)
    end
end

def playertext(mins, secs)
    local sec
    local colour = 123456
    if secs < 10 then
        if mins == 0 then
            colour = 1530000
        end              
        sec = "0" + secs
    else
        sec = secs //display variable
    end
    local decomtext = "LCZ Decontamination will begin in " + mins + ":" + sec
    if secs == 0 then
        if mins == 0 then
            Decom() //Timer finishes, Suffering begins
            return
        else
            mins = mins - 1
            secs = 60
        end
    end
    if suffer != 0 then //if decom starts in some other way, shut down timer
        return
    end
    CreateTimer("playertext", 1000, 0, mins, secs-1)
    for x = 1; x < 65; x++
        if IsPlayerConnected(x) == 1 then
            if GetPlayerZone(x) == 1 and GetPlayerType(x) != 0 then
                sec = CreatePlayerText(x, decomtext, 15, 60,  colour, "DS-DIGITAL.ttf",50) //not using sec variable anymore so might as well repurpose it
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
        playertext(10,0) //Start timer at 10 mins
    end
end

public def OnServerRestart()
    enddecom()
end

def enddecom()
    RemoveTimer(suffer)
    RemoveTimer(sound)
    RemoveTimer(coughrepeat)
    suffer = 0
end 

public def OnRoundStarted()
    CreateTimer("DecomTimer",0,0,5) //change the first 0 if you want the decom timer to start later
end

public def OnPlayerConsole(_,msg) //Use console to immediately activate decom procedure
    if msg == "decom" then
        Decom()
    end
    if msg == "enddecom" then //use console to shutdown decom
        enddecom()
    end
end