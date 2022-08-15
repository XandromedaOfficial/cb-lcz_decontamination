#include "includes\multiplayer_core.inc"

global tokill = [64,SE_INT] //To make sure there's space for everyone to suffer
global letsgo = False //debounce (var switch)

def erase(what)
    for y = 1; y < len tokill;y++
        check = tokill[y]
        if check == what then
            tokill[y] = 0
            return True
        end
    end
    return False
end

def dmg(plr,dmgpo)
    if GetPlayerZone(plr) != 1 or GetPlayerType(plr) == 0 then
        delete = erase(plr)
        if delete == True then
            return
        end
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

def Suffering()
    if letsgo == True then
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
                    if goahead == True then
                        for y = 1; y <= len tokill; y++
                            check = tokill[y]
                            if tokill[y] == 0 then //if not in killing list, MAKE EM SUFFER
                                tokill[y] = x
                                break
                            end
                        end
                        if role > 9 or role == 5 or role == 6 then
                            dmgp = 100
                        else
                            dmgp = 10
                        end
                        dmg(x,dmgp)
                    end
                end
                goahead = nil
            end
        end
        CreateTimer("Suffering",5000,0) //Repeat the endless cycle of suffering
    else
        for x; x <= len tokill;x++
            tokill[x] = 0
        end
    end
end

def Decom()
    ServerMessage("[FACILITY] LCZ Decontamination Process has commenced")
    letsgo = True
    Suffering()
end

def DecomTimer(mins)
    ServerMessage("[FACILITY] LCZ Decontamination Process will commence in T-Minus " + mins + " minutes")
    if mins > 5 then
        CreateTimer("DecomTimer",10, 0, mins-5) //CHANGE!
    else
        CreateTimer("Decom",10, 0) //CHANGE!
    end
end

public def OnServerRestart()
    letsgo = False
end

public def OnPlayerChat() //Change to OnRoundStarted once development is complete
    CreateTimer("DecomTimer",0,0,15) //change the first 0 if you want the decom timer to start later
end