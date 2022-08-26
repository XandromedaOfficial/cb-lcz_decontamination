#include "includes\multiplayer_core.inc"

global tokill = [64,SE_INT] //To make sure there's space for everyone to suffer
global letsgo = False //debounce (var switch)

def erase(what)
    local check
    SetPlayerFogRange(what,10)
    for y = 1; y < len tokill;y++
        check = tokill[y]
        if check == what then
            tokill[y] = 0
            return
        end
    end
    check = nil
end

def dmg(plr,dmgpo) //damage plrs in LCZ
    if GetPlayerZone(plr) != 1 or GetPlayerType(plr) == 0 or letsgo == False then        
        erase(plr)
        return
    end
    if dmgpo == 10 then
        rand = rand(1,3)
        CreateTimer("PlaySound",rand*1000,0,plr,"SFX/Character/D9341/Cough1.ogg")
    end
    hp = GetPlayerHealth(plr)
    if hp > dmgpo then
        SetPlayerFakeHealth(plr,hp-dmgpo)
        CreateTimer("dmg", 1000, 0, plr, dmgpo)
    else 
        erase(plr)
        if GetPlayerType(plr) != 0 then
            SetPlayerType(plr,0)
            ServerMessage(GetPlayerNickname(plr)+" suffocated in decontamination gas")
        end
    end
end

def Suffering() //detect plrs in LCZ
    for x = 1; x < 65; x++
        if IsPlayerConnected(x) == 1 then
            local goahead = True
            role = GetPlayerType(x)
            if GetPlayerZone(x) == 1 and role != 0 then //check if in killing list
                for y = 1; y <= len tokill; y++
                    check = tokill[y]
                    if check == x then
                        goahead = False
                        break
                    end
                end
                if goahead == True then //if not in killing list, run this
                    for y = 1; y <= len tokill; y++
                        check = tokill[y]
                        if tokill[y] == 0 then //if not in killing list, MAKE EM SUFFER
                            tokill[y] = x
                            break
                        end
                    end
                    if role > 9 or role == 5 or role == 6 then //if SCP
                        dmgp = 100 //SCP Damage
                    else
                        dmgp = 10 //Human Damage
                    end
                    SetPlayerFogRange(x,3)
                    dmg(x,dmgp) //dmg them
                end
            end
            goahead = nil
        end
    end
    //CreateTimer("Suffering",5000,0) //Repeat the endless cycle of suffering
end

//Start coords: 72,0,133

def Decom() 
    ServerMessage("[FACILITY] LCZ Decontamination Process has commenced")
    sound = CreateTimer("CreateSound",1000,1,"SFX/General/Hiss.ogg",72, 0, 133, 50, 1.5)
    letsgo = True
    suffer = CreateTimer("Suffering",5000,1)
end

def DecomTimer(mins)
    ServerMessage("[FACILITY] LCZ Decontamination Process will commence in T-Minus " + mins + " minutes")
    CreateSound("SFX/Alarm/Alarm3.ogg",72, 0, 133, 60, 1.7)
    if mins > 5 then
        CreateTimer("DecomTimer",60*mins, 0, mins-5) //CHANGE!
    else
        CreateTimer("Decom",60*mins, 0) //CHANGE!
    end
end

public def OnServerRestart()
    RemoveTimer(suffer)
    RemoveTimer(sound)
    tokill = [64,SE_INT]
    letsgo = False //so rest of script knows game end
end

public def OnPlayerChat() //Change to OnRoundStarted once development is complete
    CreateTimer("DecomTimer",0,0,15) //change the first 0 if you want the decom timer to start later
end