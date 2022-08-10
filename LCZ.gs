#include "includes\multiplayer_core.inc"
#include "str_util.gs"

//public def OnRoundStarted()
//   CreateTimer("d1",1, 0)
//end

global tokill = [65,SE_INT]
global goahead = False

def dmg(plr)
    if GetPlayerZone(plr) != 1 or GetPlayerType(plr) == 0 then
        for x; x <= len(tokill);x++
            if tokill[x] == plr then
                tokill[x] = 0
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
            ServerMessage(GetPlayerNickname(plr)+" was killed by Decontamination Procedure")
        end
    end
end        

def StartSuffering()
    for x; x < 65;x++
        goahead = True
        if GetPlayerZone(x) == 1 and GetPlayerType(x) != 0 then
            for y; y <= len(tokill);y++
                if tokill[y] == x then
                    goahead = False
                    break
                end
            end
            if goahead == True then
                dmg(x)
            end
        end
    end
    CreateTimer("StartSuffering",5000,0)
end

def Decom()
    ServerMessage("[FACILITY] LCZ Decontamination Process has started.")
    StartSuffering()   
end


def DecomTimer(mins)
    ServerMessage("[FACILITY] LCZ Decontamination Process will occur in T-Minus" + " " + mins + " " + "minutes")
    if mins > 5 then
        CreateTimer("DecomTimer",10, 0, mins-5) //CHANGE!
    else
        CreateTimer("Decom",10, 0) //CHANGE!
    end
end

public def OnPlayerChat()
    CreateTimer("DecomTimer",1, 0, 15)
end


public def OnScriptLoaded()
    print("LCZ Decontamination Feature Mod by Xandromeda#3756 and [REDACTED] loaded!")
end


public def OnServerRestart()
    tokill = False
end

//public def OnPlayerChat(playerid, text)
    //if instr(text, "/inj", 1)
        //zone = GetPlayerZone(playerid)
        //CreateTimer("d1", 3000, 0)
        //SendMessage(playerid, "Current Zone: " + zone)
        //return 0
	//end
//end
