#include "includes\multiplayer_core.inc"

global tokill = [64,SE_INT] //To make sure there's space for everyone to suffer
global sound
global suffer

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

def dmg(plr, dmgpo, coughtimer) //damage plrs in LCZ
    if GetPlayerZone(plr) != 1 or GetPlayerType(plr) == 0 or suffer == 0 or IsPlayerConnected(plr) == 0 then   
        erase(plr,coughtimer)
        return
    end
    if GetPlayerHealth(plr) > dmgpo then
        GivePlayerHealth(plr,-1*dmgpo)
        CreateTimer("dmg", 1000, 0, plr, dmgpo, coughtimer) //Doesn't use regular loop parameter cause would need more space
    else 
        erase(plr,coughtimer)
        if GetPlayerType(plr) != 0 then
            SetPlayerType(plr, 0)
            ServerMessage(GetPlayerNickname(plr)+" suffocated in decontamination gas")
        end
    end
end

def Suffering() //detect plrs in LCZ
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
                    SetPlayerMessage(x,"You are in the decontamination gas. Get out NOW!")
                    for y = 1; y <= len tokill; y++
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
                        local timer = CreateTimer("cough",3000,1,x)
                    end
                    SetPlayerFogRange(x,3)
                    dmg(x,role,timer) //dmg them
                end
            end            
        end
    end
end

//Start coords: 72,0,133

def gas()
    CreateSound("SFX/General/Hiss.ogg",72, 0, 133, 70, 4)
end

def Decom()
    enddecom()
    CreateSound("SFX/Alarm/Alarm3.ogg",72, 0, 133, 60, 1.7) 
    ServerMessage("[FACILITY] LCZ Decontamination Process has commenced")
    sound = CreateTimer("gas",500,1)
    suffer = CreateTimer("Suffering",5000,1)
end

def DecomTimer(mins)
    ServerMessage("[FACILITY] LCZ Decontamination Process will commence in T-Minus " + mins + " minutes")
    CreateSound("SFX/Alarm/Alarm3.ogg",72, 0, 133, 60, 1.7)
    if mins > 5 then
        CreateTimer("DecomTimer", 300000, 0, mins-5)
    else
        CreateTimer("Decom", 300000, 0)
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

public def OnRoundStarted()
    CreateTimer("DecomTimer",0,0,15) //change the first 0 if you want the decom timer to start later
end

public def OnPlayerConsole(plr,msg) //Use console to immediately activate decom procedure
    if msg == "decom" then
        Decom()
    end
    if msg == "enddecom" then //use console to shutdown decom
        enddecom()
    end
end