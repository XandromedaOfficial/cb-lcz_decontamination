#include "includes\multiplayer_core.inc"

global tokill = [64,SE_INT] //To make sure there's space for everyone to suffer
global sound
global suffer = 0

def erase(what,coughtimer)
    local check
    RemoveTimer(coughtimer)
    if IsPlayerConnected(what) == 1 then
        SetPlayerFogRange(what,8)
    end
    for y = 1; y < len tokill;y++
        check = tokill[y]
        if check == what then
            tokill[y] = 0
            return
        end
    end
end

def cough(plr)
    PlaySound(plr,"SFX/Character/D9341/Cough1.ogg")
end

def dmg(plr, dmgpo, coughtimer, text) //damage plrs in LCZ
    if GetPlayerZone(plr) != 1 or GetPlayerType(plr) == 0 or suffer == 0 then
        if IsPlayerConnected(plr) == 1 and text != 0 then
            RemovePlayerText(plr, text)
        end
        erase(plr,coughtimer)
        return
    end
    if text == 0 then
        text = CreatePlayerText(plr, "You are in decontamination gas, evacuate LCZ NOW!",60, 30, 1530000, "DS-DIGITAL.ttf", 50)
    else
        RemovePlayerText(plr, text)
        text = 0
    end
    if GetPlayerHealth(plr) > dmgpo then
        GivePlayerHealth(plr,-1*dmgpo)
        CreateTimer("dmg", 1000, 0, plr, dmgpo, coughtimer, text) //Doesn't use regular loop parameter cause would need more space
    else 
        if text != 0 then
            RemovePlayerText(plr, text)
        end
        erase(plr,coughtimer)
        if GetPlayerType(plr) != 0 then
            SetPlayerType(plr, 0)
            ServerMessage(GetPlayerNickname(plr)+" suffocated in decontamination gas")
        end
    end
end

def Suffering() //detect plrs in LCZ. See into replacing this with LCZ checkpoint lockdown protocol
    for x = 1; x < 65; x++
        if IsPlayerConnected(x) == 1 then
            local goahead = True
            local role = GetPlayerType(x)
            if GetPlayerZone(x) == 1 and role != 0 then //check if in killing list
                for y = 1; y <= len tokill; y++
                    check = tokill[y]
                    if check == x then
                        goahead = False
                        break
                    end
                end
                if goahead == True then //if not in killing list, run this
                    for y = 0; y <= len tokill; y++
                        check = tokill[y]
                        if tokill[y] == 0 then //if not in killing list, MAKE EM SUFFER
                            tokill[y] = x
                            break
                        end
                    end
                    if role > 9 or role == 5 or role == 6 then //if SCP
                        role = 100 //SCP Damage (uses role variable cause its easier than assigning new variable)
                    else
                        role = 10 //Human Damage
                        goahead = CreateTimer("cough",3000,1,x)
                    end
                    SetPlayerFogRange(x,1)
                    dmg(x,role,goahead,0) //dmg them
                end
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
    suffer = CreateTimer("Suffering",5000,1)
end

global textpointer

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
            RemovePlayerText(x,textpointer)
            if GetPlayerZone(x) == 1 and GetPlayerType(x) != 0 then
                textpointer = CreatePlayerText(x, decomtext, 15, 60,  colour, "DS-DIGITAL.ttf",50) //not using sec variable anymore so might as well repurpose it
            end
        end
    end
end

def DecomTimer(mins)
    ServerMessage("[FACILITY] LCZ Decontamination Process will commence in T-Minus " + mins + " minutes")
    CreateSound("SFX/Alarm/Alarm3.ogg",72, 0, 133, 75, 1.7)
    if mins > 5 then
        CreateTimer("DecomTimer", 300000, 0, mins-5)
    else
        playertext(5,0) //Start timer at 5 mins
    end
end

public def OnServerRestart()
    enddecom()
end

def enddecom()
    RemoveTimer(suffer)
    RemoveTimer(sound)
    suffer = 0
    tokill = [64,SE_INT]
end 

public def OnRoundStart()
    CreateTimer("DecomTimer",0,0,15) //change the first 0 if you want the decom timer to start later
end

public def OnPlayerConsole(_,msg) //Use console to immediately activate decom procedure
    if msg == "decom" then
        Decom()
    end
    if msg == "enddecom" then //use console to shutdown decom
        enddecom()
    end
end