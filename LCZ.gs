#include "includes\multiplayer_core.inc"

//public def OnRoundStarted()
//   CreateTimer("d1",1, 0)
//end

global tokill = [64,SE_INT]

public def OnServerStart()
    for x; x < 65;x++
        tokill[x] = 0
    end
end

def dmg(plr)
    if GetPlayerZone(plr) != 1 then
        for y = 1; y < 65;y++
            if tokill[y] == plr then
                tokill[y] = 0
                return
            end
        end
    end
    hp = GetPlayerHealth(plr)
    if hp > 10 then
        SetPlayerFakeHealth(plr,hp-10)
        CreateTimer("dmg",1000, 0,plr)
    else 
        if GetPlayerType(plr) != 0 then
            SetPlayerType(plr,0)
            ServerMessage(GetPlayerNickname(plr)+" suffocated in decontamination gas")
        end
    end
end        

def Suffering()
    for x = 1; x < 65; x++
        if IsPlayerConnected(x) == 1 then
            local goahead = True
            if GetPlayerZone(x) == 1 and GetPlayerType(x) != 0 then //check if in killing list
                for y = 1; y < 65; y++
                    if tokill[y] == x then
                        print(x)
                        goahead = False
                        break
                    end
                end
                print("made it this far")
                if goahead == True then
                    for y = 1; y < 65; y++
                        if tokill[y] == 0 then //if not in killing list, MAKE EM SUFFER
                            print("Suffering")
                            tokill[y] = x
                            break
                        end
                    end
                    dmg(x)
                end
            end
            goahead = nil
        end
    end
    CreateTimer("Suffering",5000,0) //Repeat the endless cycle of suffering
end

def Decom()
    ServerMessage("[FACILITY] LCZ Decontamination Process has started")
    Suffering()
end

def DecomTimer(mins)
    ServerMessage("[FACILITY] LCZ Decontamination Process will occur in T-Minus " + mins + " minutes")
    if mins > 5 then
        CreateTimer("DecomTimer",10, 0, mins-5) //CHANGE!
    else
        CreateTimer("Decom",10, 0) //CHANGE!
    end
end

public def OnPlayerChat()
    DecomTimer(15)
end